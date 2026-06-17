// firebase/store.js
import { useState, useEffect } from "react";
import { db, doc, setDoc, collection, onSnapshot, writeBatch, deleteDoc } from "./firebase";

// ── Hook: suscribirse a cambios del store y forzar re-render ──
export function useFirebaseStore() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = subscribeStore(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);
}

// ── Session state (local only — UI navigation state) ──
const STORAGE_KEY = "tool_pwa_v1";
export function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e){}
}
export function loadState() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch(e){ return null; }
}
export function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
}

// ── In-memory store — Firebase is single source of truth ──
let _labelUsers = (() => { try { return JSON.parse(localStorage.getItem("tool_label_users_v1") || "{}"); } catch(e) { return {}; } })();
let _artistUsers = (() => { try { return JSON.parse(localStorage.getItem("tool_artist_users_v1") || "{}"); } catch(e) { return {}; } })();
let _mgmtUsers = (() => { try { return JSON.parse(localStorage.getItem("tool_mgmt_users_v1") || "{}"); } catch(e) { return {}; } })();
let _listeners = [];

function notifyListeners() { _listeners.forEach(fn => fn()); }
export function subscribeStore(fn) { _listeners.push(fn); return () => { _listeners = _listeners.filter(f => f !== fn); }; }

// ── In-memory store: artists metadata + projects separate ──
let _artistsMeta = (() => { try { return JSON.parse(localStorage.getItem("artists_meta_cache")||"[]"); } catch(e) { return []; } })();
let _projects    = (() => { try { return JSON.parse(localStorage.getItem("projects_cache")||"[]"); } catch(e) { return []; } })();

// Computed: artists with projects merged in
export function getArtists() {
  return _artistsMeta.map(a => ({ ...a, projects: _projects.filter(p => p.artistId === a.id) }));
}

function _saveCache() {
  try {
    localStorage.setItem("artists_meta_cache", JSON.stringify(_artistsMeta));
    localStorage.setItem("projects_cache", JSON.stringify(_projects));
  } catch(e) {}
}

let _firebaseError = null;
export function getFirebaseError() { return _firebaseError; }
export function clearFirebaseError() { _firebaseError = null; }

// Save artist metadata, including photo — photos are pre-compressed
// client-side (see utils/helpers.js compressImage) so they comfortably
// fit within Firestore's 1MB document limit and sync across devices.
export async function saveOneArtist(artist) {
  if (!artist?.id) { console.error("saveOneArtist: missing id"); return; }
  const { projects, photo, answers, ...coreMeta } = artist;
  const metaClean = { ...coreMeta, photo: photo || null };
  const fullMeta = { ...coreMeta, photo: photo || null, answers: answers || {} };
  const idx = _artistsMeta.findIndex(a => a.id === artist.id);
  if (idx >= 0) _artistsMeta[idx] = fullMeta; else _artistsMeta.push(fullMeta);
  if (projects) {
    projects.forEach(p => {
      const pi = _projects.findIndex(x => x.id === p.id);
      const proj = { ...p, artistId: artist.id };
      if (pi >= 0) _projects[pi] = proj; else _projects.push(proj);
    });
  }
  _saveCache();
  notifyListeners();
  try {
    await setDoc(doc(db, "artists", artist.id), metaClean);
    console.log("✅ artist saved:", artist.name);
  } catch(e) {
    console.error("❌ artist save failed:", e.code, e.message);
    _firebaseError = `${e.code}: ${e.message}`; notifyListeners();
  }
  if (answers && Object.keys(answers).length > 0) {
    const compressed = {};
    Object.entries(answers).forEach(([k,v]) => { if (v === true) compressed[k] = true; });
    setDoc(doc(db, "artistAnswers", artist.id), compressed).catch(() => {});
  }
}

// Save a single project as its own Firestore document.
// Photos are pre-compressed client-side (see compressImage) so the
// resulting base64 string fits comfortably under Firestore's 1MB limit.
export async function saveProject(project, artistId) {
  if (!project?.id || !artistId) { console.error("saveProject: missing id/artistId"); return false; }
  const answers = {};
  Object.entries(project.answers || {}).forEach(([k,v]) => { if (v === true) answers[k] = true; });
  const { linkedArtist, photo, ...rest } = project;
  const p = {
    ...rest,
    artistId,
    answers,
    photo: photo || null,
    linkedArtist: linkedArtist ? { id: linkedArtist.id, name: linkedArtist.name } : null,
  };
  const pi = _projects.findIndex(x => x.id === p.id);
  if (pi >= 0) _projects[pi] = p; else _projects.push(p);
  _saveCache();
  notifyListeners();
  try {
    await setDoc(doc(db, "projects", p.id), p);
    console.log("✅ project saved:", p.title, "answers:", Object.keys(answers).length);
    return true;
  } catch(e) {
    console.error("❌ project save failed:", e.code, e.message);
    _firebaseError = `${e.code}: ${e.message}`; notifyListeners();
    return false;
  }
}

// Save all artists (used by batch operations)
export async function saveArtists(artists) {
  for (const a of artists) await saveOneArtist(a);
}

// Delete artists and their projects
export async function deleteArtists(ids) {
  const projectIds = _projects.filter(p => ids.includes(p.artistId)).map(p => p.id);
  _artistsMeta = _artistsMeta.filter(a => !ids.includes(a.id));
  _projects = _projects.filter(p => !ids.includes(p.artistId));
  _saveCache();
  notifyListeners();
  try {
    const batch = writeBatch(db);
    ids.forEach(id => batch.delete(doc(db, "artists", id)));
    projectIds.forEach(id => batch.delete(doc(db, "projects", id)));
    await batch.commit();
  } catch(e) { console.warn("deleteArtists failed", e); }
}

// Delete a project by id
export async function deleteProjectById(projectId) {
  _projects = _projects.filter(p => p.id !== projectId);
  _saveCache();
  notifyListeners();
  try { await deleteDoc(doc(db, "projects", projectId)); } catch(e) { console.warn("deleteProject failed", e); }
}

// ── Artist users ──
const ARTIST_USERS_KEY = "tool_artist_users_v1";
export function getArtistUsers() { return _artistUsers; }
export async function saveArtistUsers(users) {
  _artistUsers = users;
  try {
    localStorage.setItem(ARTIST_USERS_KEY, JSON.stringify(users));
    await setDoc(doc(db, "config", "artistUsers"), users);
  } catch(e) {}
}
export function registerArtistUser(name) {
  const users = { ..._artistUsers, [name.trim()]: true };
  saveArtistUsers(users);
}

// ── Label users ──
const DEFAULT_LABEL_USERS = { 'Mara': true, 'Fer': true, 'Cueto': true };
const LABEL_USERS_KEY = "tool_label_users_v1";
export function getLabelUsers() { return { ...DEFAULT_LABEL_USERS, ..._labelUsers }; }
export async function saveLabelUsers(users) {
  _labelUsers = { ...DEFAULT_LABEL_USERS, ...users };
  notifyListeners();
  try {
    localStorage.setItem(LABEL_USERS_KEY, JSON.stringify(_labelUsers));
    await setDoc(doc(db, "config", "labelUsers"), _labelUsers);
  } catch(e) {}
}

// ── Mgmt users ──
export function getMgmtUsers() { return _mgmtUsers; }
export async function saveMgmtUsers(users) {
  _mgmtUsers = users;
  try {
    localStorage.setItem("tool_mgmt_users_v1", JSON.stringify(users));
    await setDoc(doc(db, "config", "mgmtUsers"), users);
  } catch(e) {}
}

// ── Real-time listeners — subscribe to all Firestore changes ──
export function startRealtimeSync(onReady) {
  let artistsReady = false, projectsReady = false, configReady = false;
  const checkReady = () => { if (artistsReady && projectsReady && configReady) onReady(); };

  const unsubArtists = onSnapshot(collection(db, "artists"), snap => {
    const localMeta = (() => { try { return JSON.parse(localStorage.getItem("artists_meta_cache")||"[]"); } catch(e) { return []; } })();
    _artistsMeta = snap.docs.map(d => {
      const fb = { id: d.id, ...d.data() };
      const local = localMeta.find(a => a.id === fb.id);
      return { ...fb, photo: fb.photo || local?.photo || null, answers: fb.answers || local?.answers || {} };
    });
    _saveCache();
    notifyListeners();
    if (!artistsReady) { artistsReady = true; checkReady(); }
  }, err => {
    console.warn("Artists snapshot error", err);
    if (!artistsReady) { artistsReady = true; checkReady(); }
  });

  const unsubProjects = onSnapshot(collection(db, "projects"), snap => {
    const localProjs = (() => { try { return JSON.parse(localStorage.getItem("projects_cache")||"[]"); } catch(e) { return []; } })();
    _projects = snap.docs.map(d => {
      const fb = { id: d.id, ...d.data() };
      const local = localProjs.find(p => p.id === fb.id);
      return { ...fb, photo: fb.photo || local?.photo || null };
    });
    _saveCache();
    notifyListeners();
    if (!projectsReady) { projectsReady = true; checkReady(); }
  }, err => {
    console.warn("Projects snapshot error", err);
    if (!projectsReady) { projectsReady = true; checkReady(); }
  });

  const unsubConfig = onSnapshot(doc(db, "config", "labelUsers"), snap => {
    if (snap.exists()) {
      _labelUsers = snap.data();
      try { localStorage.setItem("tool_label_users_v1", JSON.stringify(_labelUsers)); } catch(e) {}
      notifyListeners();
    }
    if (!configReady) { configReady = true; checkReady(); }
  }, err => {
    console.warn("Config snapshot error", err);
    if (!configReady) { configReady = true; checkReady(); }
  });

  onSnapshot(collection(db, "artistAnswers"), snap => {
    snap.docs.forEach(d => {
      const idx = _artistsMeta.findIndex(a => a.id === d.id);
      if (idx >= 0) _artistsMeta[idx] = { ..._artistsMeta[idx], answers: d.data() };
    });
    _saveCache();
    notifyListeners();
  });

  onSnapshot(doc(db, "config", "artistUsers"), snap => {
    if (snap.exists()) { _artistUsers = snap.data(); try { localStorage.setItem("tool_artist_users_v1", JSON.stringify(_artistUsers)); } catch(e) {} }
  });
  onSnapshot(doc(db, "config", "mgmtUsers"), snap => {
    if (snap.exists()) { _mgmtUsers = snap.data(); try { localStorage.setItem("tool_mgmt_users_v1", JSON.stringify(_mgmtUsers)); } catch(e) {} }
  });

  return () => { unsubArtists(); unsubProjects(); unsubConfig(); };
}
