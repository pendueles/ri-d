import { useState, useEffect } from "react";
import { useDarkMode, theme } from "./theme";
import { calcBlockScore, calcTotalScore, scoreColor, scoreLabel, bgColor } from "./utils";
import { ARTIST_BLOCKS, ARTIST_QUESTIONS, SONG_BLOCKS, SONG_QUESTIONS,
  RIMAS_LOGO, ICON_ARTISTA, ICON_PROYECTO } from "./data";
import { HexRadarTotal, SplashScreen } from "./components/ui";
import { SwipeCard, SubcatSummaryScreen, BlockSummaryScreen, TotalSummaryScreen, PendingTasksScreen } from "./components/quiz";
import { ProfileSelect, BlockHomeScreen, ArtistHomeScreen, ArtistProfileScreen, ProjectHomeScreen,
  ArtistListScreen, ProjectListScreen, ArtistCatalogueScreen, ClientsListScreen, LabelManagersListScreen } from "./components/screens";
import { NewArtistForm, ProjectForm, NewLabelManagerScreen, ArtistEditScreen, ProjectEditScreen } from "./components/forms";
import {
  useFirebaseStore, saveState, loadState, clearState,
  getArtists, getFirebaseError, clearFirebaseError,
  saveOneArtist, saveProject, saveArtists, deleteArtists, deleteProjectById,
  getArtistUsers, saveArtistUsers, registerArtistUser,
  getLabelUsers, saveLabelUsers,
  getMgmtUsers, saveMgmtUsers,
  startRealtimeSync, subscribeStore,
} from "./firebase";

export default function App() {
  const dark = useDarkMode();
  const t = theme(dark);
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState(null); // never persisted — always ask on load
  const saveProfile = (p) => { setProfile(p); };
  const [phase, setPhase] = useState("welcome");
  const [artistData, setArtistData] = useState({});
  const [artistAnswers, setArtistAnswers] = useState({});
  const [artistQIdx, setArtistQIdx] = useState(0);
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [songQIdx, setSongQIdx] = useState(0);
  const [currentSongAnswers, setCurrentSongAnswers] = useState({});

  const [syncing, setSyncing] = useState(true);
  // Force re-render when Firebase data changes
  const [, forceUpdate] = useState(0);
  const [, forceRender] = useState(0);
  useEffect(() => {
    const unsub = subscribeStore(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = startRealtimeSync(() => {
      setSyncing(false);
    });
    return unsub;
  }, []);



  function resetAll() {
    setPhase("welcome"); setArtistData({}); setArtistAnswers({}); setArtistQIdx(0); setCurrentBlockIdx(0); setSongs([]); setCurrentSong(null); setSongQIdx(0);
  }

  useEffect(() => {
    if (phase === "welcome") return;
  }, [phase, artistData, artistAnswers, artistQIdx, currentBlockIdx, songs, currentSong, songQIdx]);

  // ── Block boundary helpers ──
  // Build cumulative question counts per block
  const ARTIST_BLOCK_ENDS = (() => {
    let c = 0; return ARTIST_BLOCKS.map(b => { b.subcats.forEach(s => { c += s.items.length; }); return c - 1; });
  })();
  const SONG_BLOCK_ENDS = (() => {
    let c = 0; return SONG_BLOCKS.map(b => { b.subcats.forEach(s => { c += s.items.length; }); return c - 1; });
  })();

  // ── Subcat boundary helpers ──
  const ARTIST_SUBCAT_ENDS = (() => {
    const ends = [];
    let c = 0;
    ARTIST_BLOCKS.forEach((b, bi) => {
      b.subcats.forEach((s, si) => {
        c += s.items.length;
        ends.push({ endIdx: c - 1, blockId: b.id, blockLabel: b.label, blockWeight: b.blockWeight, subcatId: s.id, subcatLabel: s.label, subcatWeight: s.subcatWeight, blockIdx: bi, subcatIdx: si, block: b, subcat: s });
      });
    });
    return ends;
  })();
  const SONG_SUBCAT_ENDS = (() => {
    const ends = [];
    let c = 0;
    SONG_BLOCKS.forEach((b, bi) => {
      b.subcats.forEach((s, si) => {
        c += s.items.length;
        ends.push({ endIdx: c - 1, blockId: b.id, blockLabel: b.label, blockWeight: b.blockWeight, subcatId: s.id, subcatLabel: s.label, subcatWeight: s.subcatWeight, blockIdx: bi, subcatIdx: si, block: b, subcat: s });
      });
    });
    return ends;
  })();

  const [currentSubcatInfo, setCurrentSubcatInfo] = useState(null);

  const globalProgress = (() => {
    const totalQs = ARTIST_QUESTIONS.length + (songs.length + 1) * SONG_QUESTIONS.length;
    const doneQs = artistQIdx + songs.reduce((a) => a + SONG_QUESTIONS.length, 0) + (currentSong ? songQIdx : 0);
    return Math.min(100, Math.round((doneQs / Math.max(1, totalQs)) * 100));
  })();

  // ── ARTIST QUESTIONS ──
  function handleArtistAnswer(id, val) {
    if (id === "__back__") { if (artistQIdx > 0) setArtistQIdx(i => i-1); return; }
    if (id === "__skip__") {
      const next = artistQIdx + 1;
      if (next >= ARTIST_QUESTIONS.length) { setPhase("artist-result"); return; }
      const blockEnd = ARTIST_BLOCK_ENDS.find(e => e === artistQIdx);
      if (blockEnd !== undefined) { const bi = ARTIST_BLOCK_ENDS.indexOf(blockEnd); setCurrentBlockIdx(bi); setArtistQIdx(next); setPhase("artist-block-summary"); return; }
      setArtistQIdx(next); return;
    }
    const newAnswers = { ...artistAnswers, [id]: val };
    setArtistAnswers(newAnswers);
    // Persist answers to Firebase
    if (artistData?.id) {
      const target = getArtists().find(a => a.id === artistData.id);
      if (target) saveOneArtist({ ...target, answers: newAnswers });
    }
    const next = artistQIdx + 1;
    // Check if this was the last question of a subcat
    const subcatEndInfo = ARTIST_SUBCAT_ENDS.find(e => e.endIdx === artistQIdx);
    const blockEndIdx = ARTIST_BLOCK_ENDS.indexOf(artistQIdx);
    if (subcatEndInfo) {
      setCurrentSubcatInfo({ ...subcatEndInfo, answers: newAnswers, isBlockEnd: blockEndIdx !== -1 });
      setCurrentBlockIdx(subcatEndInfo.blockIdx);
      if (next >= ARTIST_QUESTIONS.length) { setPhase("artist-subcat-summary"); return; }
      setArtistQIdx(next);
      setPhase("artist-subcat-summary");
    } else if (next >= ARTIST_QUESTIONS.length) {
      setPhase("artist-result");
    } else {
      setArtistQIdx(next);
    }
  }

  // ── SONG QUESTIONS ──
  function handleSongAnswer(id, val) {
    if (id === "__back__") { if (songQIdx > 0) setSongQIdx(i => i-1); return; }
    if (id === "__skip__") {
      const next = songQIdx + 1;
      if (next >= SONG_QUESTIONS.length) { finishCurrentSong(); return; }
      const blockEnd = SONG_BLOCK_ENDS.find(e => e === songQIdx);
      if (blockEnd !== undefined) { const bi = SONG_BLOCK_ENDS.indexOf(blockEnd); setCurrentBlockIdx(bi); setSongQIdx(next); setPhase("song-block-summary"); return; }
      setSongQIdx(next); return;
    }
    const newAnswers = { ...(currentSong?.answers || {}), [id]: val };
    setCurrentSong(s => ({ ...s, answers: newAnswers }));
    syncProjectToArtist(currentSong?.data, newAnswers);
    const next = songQIdx + 1;
    // Check if this was the last question of a subcat
    const subcatEndInfo = SONG_SUBCAT_ENDS.find(e => e.endIdx === songQIdx);
    const blockEndIdx = SONG_BLOCK_ENDS.indexOf(songQIdx);
    if (subcatEndInfo) {
      setCurrentSubcatInfo({ ...subcatEndInfo, answers: newAnswers, isBlockEnd: blockEndIdx !== -1 });
      setCurrentBlockIdx(subcatEndInfo.blockIdx);
      if (next >= SONG_QUESTIONS.length) { finishCurrentSong(newAnswers); return; }
      setSongQIdx(next);
      setPhase("song-subcat-summary");
    } else if (next >= SONG_QUESTIONS.length) {
      finishCurrentSong(newAnswers);
    } else {
      setSongQIdx(next);
    }
  }

  // Helper — persist current project answers/score back to artist record
  function syncProjectToArtist(projectData, answers, score) {
    if (!projectData?.id) return;
    const artistId = projectData?.artistId || projectData?.linkedArtist?.id || artistData?.id;
    if (!artistId) { console.warn("syncProjectToArtist: no artistId"); return; }
    const updated = { ...projectData, answers, ...(score !== undefined ? { score } : {}) };
    saveProject(updated, artistId);
  }

  // ── Derive songs from current artist's Firebase data ──
  const firebaseArtist = getArtists().find(a => a.id === artistData?.id);
  const firebaseProjects = firebaseArtist?.projects || [];

  function finishCurrentSong(answers) {
    const finalAnswers = answers || currentSong.answers;
    const score = calcTotalScore(SONG_BLOCKS, finalAnswers);
    setCurrentSong(s => ({ ...s, answers: finalAnswers, score }));
    syncProjectToArtist(currentSong?.data, finalAnswers, score);
    setPhase("song-result");
  }

  // ── FINAL SCORES ──
  const artistScore = calcTotalScore(ARTIST_BLOCKS, artistAnswers);
  const currentSongScore = currentSong ? calcTotalScore(SONG_BLOCKS, currentSong.answers) : 0;
  const allSongs = currentSong && phase === "song-result" ? [...songs, { ...currentSong, score: currentSongScore }] : songs;
  const songAvg = allSongs.length > 0 ? Math.round(allSongs.reduce((a, s) => a + s.score, 0) / allSongs.length * 10) / 10 : 0;
  const finalScore = Math.round((songAvg * 0.70 + artistScore * 0.30) * 10) / 10;

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  // SPLASH
  if (showSplash || syncing) return <SplashScreen onDone={() => setShowSplash(false)}/>;

  // FIREBASE ERROR BANNER
  const fbError = getFirebaseError();
  const errorBanner = fbError ? (
    <div style={{position:'fixed', top:0, left:0, right:0, zIndex:9999, background:'#E8151B', color:'white', padding:'10px 16px', fontFamily:'Arial,sans-serif', fontSize:'12px', textAlign:'center', cursor:'pointer'}}
      onClick={() => { clearFirebaseError(); forceRender(n=>n+1); }}>
      ⚠️ Firebase error: {fbError} — toca para cerrar
    </div>
  ) : null;
  if (!profile) return <ProfileSelect onSelect={(p) => {
    saveProfile(p);
    if (p.type === 'artist') {
      const artists = getArtists();
      const found = artists.find(a => a.name && a.name.toLowerCase() === p.name.toLowerCase());
      if (found) {
        setArtistData(found);
        setArtistAnswers(found.answers || {});
        setArtistQIdx(0);
        setCurrentBlockIdx(0);
        setPhase("artist-home");
        return;
      }
    }
    setPhase("welcome");
  }}/>;

  // HOME function
  const goHome = () => {
    setPhase("welcome");
  };

  // WELCOME
  if (phase === "welcome") {
    return (
      <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
        {errorBanner}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px", paddingTop:"max(32px, env(safe-area-inset-top, 32px))" }}>

          <img src={RIMAS_LOGO} alt="Ri+D" style={{ width:"180px", height:"180px", objectFit:"contain", marginBottom:"40px", filter: dark ? "invert(1)" : "none" }}/>

          <div style={{ width:"100%", maxWidth:"360px", marginBottom:"20px" }}>

            {/* BLOQUE 1 — TRABAJAR */}
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px" }}>Abrir</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"24px" }}>
              {[
                { label:"Roster", icon: ICON_ARTISTA, action: () => setPhase("artist-list") },
                { label:"Catálogo", icon: ICON_PROYECTO, action: () => setPhase("song-list") },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action}
                  style={{ display:"flex", alignItems:"center", justifyContent:"flex-start", gap:"14px", padding:"18px", background:t.card, border:`1px solid ${t.border}`, borderRadius:"14px", cursor:"pointer", textAlign:"left", width:"100%", boxShadow:`0 2px 8px ${t.shadow}` }}>
                  <img src={btn.icon} alt="" style={{ width:"36px", height:"36px", objectFit:"contain", flexShrink:0 }}/>
                  <span style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:t.text }}>{btn.label}</span>
                </button>
              ))}
            </div>

          </div>

          <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text3}}>
            {profile.type === 'admin' ? '⚡ Admin · acceso completo' : `${profile.name} · ${profile.type}`}
          </div>

        </div>
        <div style={{ padding:"16px 24px", paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", display:"flex", flexDirection:"column", gap:"10px" }}>
          {profile.type === 'admin' && (
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setPhase("label-managers-list")} style={{ flex:1, padding:"13px", background:"transparent", color:t.text2, border:`1px solid ${t.border}`, borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer" }}>
                Equipo
              </button>
              <button onClick={() => setPhase("clients-list")} style={{ flex:1, padding:"13px", background:"transparent", color:t.text2, border:`1px solid ${t.border}`, borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer" }}>
                Clientes
              </button>
              <button onClick={() => setPhase("new-label-manager")} style={{ flex:1, padding:"13px", background:"transparent", color:t.text2, border:`1px solid ${t.border}`, borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer" }}>
                + Nuevo
              </button>
            </div>
          )}

          <button onClick={() => saveProfile(null)} style={{ display:"block", width:"100%", padding:"13px", background:"transparent", color:t.text3, border:"none", borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"13px", cursor:"pointer" }}>
            Cambiar perfil
          </button>
        </div>
      </div>
    );
  }

  // NEW LABEL MANAGER
  if (phase === "clients-list") {
    return <ClientsListScreen
      liveArtists={getArtists()}
      onBack={() => setPhase("welcome")}
      onSelectArtist={(artist) => {
        setArtistData(artist);
        setArtistAnswers(artist.answers || {});
        setArtistQIdx(0);
        setCurrentBlockIdx(0);
        setPhase("artist-home");
      }}
    />;
  }

  if (phase === "label-managers-list") {
    return (
      <LabelManagersListScreen
        onBack={() => setPhase("welcome")}
        onNew={() => setPhase("new-label-manager")}
      />
    );
  }

  if (phase === "new-label-manager") {
    return <NewLabelManagerScreen onBack={() => setPhase("welcome")} onDone={() => setPhase("welcome")} />;
  }

  // PROJECT LIST
  if (phase === "song-list") {
    return (
      <ProjectListScreen
        profile={profile}
        onBack={() => setPhase("welcome")}
        onCreate={() => setPhase("song-form")}
        onSelect={(p) => {
          // Find the artist for this project
          const artist = getArtists().find(a => a.id === p.artistId);
          if (artist) {
            setArtistData(artist);
            setArtistAnswers(artist.answers || {});
          }
          setCurrentSong({ data: { ...p, linkedArtist: { id: p.artistId, name: p.artistName } }, answers: p.answers || {} });
          setSongQIdx(0);
          setPhase("song-home");
        }}
      />
    );
  }

  // ARTIST LIST
  if (phase === "artist-list") {
    return (
      <ArtistListScreen
        liveArtists={getArtists()}
        profile={profile}
        onBack={() => setPhase("welcome")}
        onSelect={(artist) => {
          setArtistData(artist);
          setArtistAnswers(artist.answers || {});
          setArtistQIdx(0);
          setCurrentBlockIdx(0);
          setPhase("artist-home");
        }}
        onCreate={() => setPhase("artist-form")}
      />
    );
  }

  // ARTIST FORM
  if (phase === "artist-form") {
    return <NewArtistForm
      profile={profile}
      onBack={() => setPhase("artist-list")}
      onSave={(artistWithMeta) => {
        saveOneArtist(artistWithMeta);
        setArtistData(artistWithMeta);
        setArtistAnswers({});
        setArtistQIdx(0);
        setPhase("artist-list");
      }}
    />;
  }

  // PROJECT EDIT
  if (phase === "project-edit") {
    return (
      <ProjectEditScreen
        songData={currentSong?.data}
        onBack={() => setPhase("song-home")}
        onSave={async (updated) => {
          setCurrentSong(s => ({ ...s, data: updated }));
          const artistId = updated?.linkedArtist?.id || updated?.artistId || artistData?.id;
          if (artistId && updated?.id) {
            await saveProject(updated, artistId);
          } else {
            // fallback: search all artists
            const found = getArtists().find(a => (a.projects||[]).some(p => p.id === updated?.id));
            if (found) await saveProject(updated, found.id);
          }
          setPhase("song-home");
        }}
      />
    );
  }

  // SONG HOME — project hexagon
  if (phase === "song-home") {
    return (
      <>
        {errorBanner}
        <ProjectHomeScreen
          songData={currentSong?.data}
          songAnswers={currentSong?.answers || {}}
          onBack={() => setPhase("welcome")}
          onEdit={() => setPhase("project-edit")}
          onResult={() => setPhase("song-result")}
          onPending={() => setPhase("song-pending")}
          onBlock={(blockId) => {
            const idx = SONG_BLOCKS.findIndex(b => b.id === blockId);
            if (idx === -1) { console.warn("Block not found:", blockId); return; }
            setCurrentBlockIdx(idx);
            setPhase("song-block-home");
          }}
        />
      </>
    );
  }

  // SONG PENDING TASKS
  if (phase === "song-pending") {
    return (
      <PendingTasksScreen
        blocks={SONG_BLOCKS}
        answers={currentSong?.answers || {}}
        title={currentSong?.data?.title || "Proyecto"}
        onBack={() => setPhase("song-home")}
        onGoToQuestion={(qIdx) => {
          setSongQIdx(qIdx);
          let count = 0;
          for (let i = 0; i < SONG_BLOCKS.length; i++) {
            SONG_BLOCKS[i].subcats.forEach(s => { count += s.items.length; });
            if (qIdx < count) { setCurrentBlockIdx(i); break; }
          }
          setPhase("song-questions");
        }}
      />
    );
  }

  // SONG BLOCK HOME — sub-hexagon for song block subcats
  if (phase === "song-block-home") {
    const block = SONG_BLOCKS[currentBlockIdx];
    if (!block) { setPhase("song-home"); return null; }
    return (
      <BlockHomeScreen
        block={block}
        artistAnswers={currentSong?.answers || {}}
        artistName={currentSong?.data?.title || "Proyecto"}
        onBack={() => setPhase("song-home")}
        onGoHome={() => setPhase("song-home")}
        onSubcat={(subcatId) => {
          let startIdx = 0;
          let foundBlock = null;
          for (const b of SONG_BLOCKS) {
            for (const sub of b.subcats) {
              if (b.id === block.id && sub.id === subcatId) {
                const blockIdx = SONG_BLOCKS.findIndex(x => x.id === b.id);
                setCurrentBlockIdx(blockIdx);
                setSongQIdx(startIdx);
                setPhase("song-questions");
                return;
              }
              startIdx += sub.items.length;
            }
          }
          // fallback — start at block beginning
          let blockStart = 0;
          for (const b of SONG_BLOCKS) {
            if (b.id === block.id) break;
            b.subcats.forEach(s => { blockStart += s.items.length; });
          }
          setSongQIdx(blockStart);
          setPhase("song-questions");
        }}
      />
    );
  }

  // BLOCK HOME — sub-hexagon for block subcats
  if (phase === "block-home") {
    const block = ARTIST_BLOCKS[currentBlockIdx];
    if (!block) { setPhase("artist-home"); return null; }
    return (
      <BlockHomeScreen
        block={block}
        artistAnswers={artistAnswers}
        artistName={artistData.name}
        onBack={() => setPhase("artist-home")}
        onGoHome={() => setPhase("artist-home")}
        onSubcat={(subcatId) => {
          let startIdx = 0;
          for (const b of ARTIST_BLOCKS) {
            for (const sub of b.subcats) {
              if (b.id === block.id && sub.id === subcatId) {
                setArtistQIdx(startIdx);
                setPhase("artist-questions");
                return;
              }
              startIdx += sub.items.length;
            }
          }
          // fallback — start at block beginning
          let blockStart = 0;
          for (const b of ARTIST_BLOCKS) {
            if (b.id === block.id) break;
            b.subcats.forEach(s => { blockStart += s.items.length; });
          }
          setArtistQIdx(blockStart);
          setPhase("artist-questions");
        }}
      />
    );
  }

  // ARTIST EDIT
  if (phase === "artist-edit") {
    return (
      <ArtistEditScreen
        artistData={artistData}
        onBack={() => setPhase("artist-home")}
        onSave={(updated) => {
          setArtistData(updated);
          setPhase("artist-home");
        }}
      />
    );
  }

  // ARTIST HOME — hexagon screen
  if (phase === "artist-home") {
    return (
      <ArtistHomeScreen
        artistData={artistData}
        artistAnswers={artistAnswers}
        profile={profile}
        onBack={() => setPhase("artist-list")}
        onResult={() => setPhase("artist-result")}
        onEdit={() => setPhase("artist-edit")}
        onCatalogue={() => setPhase("artist-catalogue")}
        onPending={() => setPhase("artist-pending")}
        onProfile={() => setPhase("artist-profile")}
        onNewProject={() => {
          setCurrentSong({ data: { artistName: artistData.name, linkedArtist: artistData }, answers: {} });
          setSongQIdx(0);
          setPhase("song-form");
        }}
        onBlock={(blockId) => {
          const idx = ARTIST_BLOCKS.findIndex(b => b.id === blockId);
          if (idx === -1) return;
          setCurrentBlockIdx(idx);
          setPhase("block-home");
        }}
      />
    );
  }

  // ARTIST PROFILE — single hexagon with all 6 blocks
  if (phase === "artist-profile") {
    return (
      <ArtistProfileScreen
        artistData={artistData}
        artistAnswers={artistAnswers}
        onBack={() => setPhase("artist-home")}
        onResult={() => setPhase("artist-result")}
        onPending={() => setPhase("artist-pending")}
        onBlock={(blockId) => {
          const idx = ARTIST_BLOCKS.findIndex(b => b.id === blockId);
          if (idx === -1) return;
          setCurrentBlockIdx(idx);
          setPhase("block-home");
        }}
      />
    );
  }

  // ARTIST PENDING TASKS
  if (phase === "artist-pending") {
    return (
      <PendingTasksScreen
        blocks={ARTIST_BLOCKS}
        answers={artistAnswers}
        title={artistData.name}
        onBack={() => setPhase("artist-home")}
        onGoToQuestion={(qIdx) => {
          setArtistQIdx(qIdx);
          // Set current block based on question index
          let count = 0;
          for (let i = 0; i < ARTIST_BLOCKS.length; i++) {
            ARTIST_BLOCKS[i].subcats.forEach(s => { count += s.items.length; });
            if (qIdx < count) { setCurrentBlockIdx(i); break; }
          }
          setPhase("artist-questions");
        }}
      />
    );
  }

  // ARTIST CATALOGUE — songs linked to this artist
  if (phase === "artist-catalogue") {
    return (
      <ArtistCatalogueScreen
        artistData={artistData}
        profile={profile}
        onBack={() => setPhase("artist-home")}
        onNewProject={() => {
          setCurrentSong({ data: { artistName: artistData.name, linkedArtist: { ...artistData } }, answers: {} });
          setSongQIdx(0);
          setPhase("song-form");
        }}
        onOpenProject={(p) => {
          setCurrentSong({
            data: { ...p, artistId: p.artistId || artistData?.id, linkedArtist: p.linkedArtist || { id: artistData?.id, name: artistData?.name } },
            answers: p.answers || {}
          });
          setSongQIdx(0);
          setPhase("song-home");
        }}
      />
    );
  }

  // ARTIST QUESTIONS
  if (phase === "artist-questions") {
    const q = ARTIST_QUESTIONS[artistQIdx];
    if (!q) { setPhase("block-home"); return null; }
    return (
      <SwipeCard
        question={q}
        onAnswer={handleArtistAnswer}
        currentIndex={artistQIdx + 1}
        total={ARTIST_QUESTIONS.length}
        answers={artistAnswers}
        blockLabel={q.blockLabel}
        subcatLabel={q.subcatLabel}
        phase="artist"
        phaseName={artistData.name || "Artista"}
        photo={artistData.photo}
        onHome={() => setPhase("block-home")}
        onGoHome={() => setPhase("artist-home")}
        onGoBlock={() => setPhase("block-home")}
      />
    );
  }

  // ARTIST SUBCAT SUMMARY
  if (phase === "artist-subcat-summary") {
    return (
      <SubcatSummaryScreen
        subcatInfo={currentSubcatInfo}
        photo={artistData.photo}
        phaseName={`Artista · ${artistData.name || ""}`}
        onBack={() => {
          // Go back to last question of this subcat
          const subcatEndIdx = currentSubcatInfo?.endIdx ?? (artistQIdx - 1);
          setArtistQIdx(subcatEndIdx);
          setPhase("artist-questions");
        }}
        onContinue={() => {
          if (currentSubcatInfo?.isBlockEnd) {
            setPhase("artist-block-summary");
          } else {
            setPhase("artist-questions");
          }
        }}
      />
    );
  }

  // ARTIST BLOCK SUMMARY
  if (phase === "artist-block-summary") {
    const block = ARTIST_BLOCKS[currentBlockIdx];
    const isLast = currentBlockIdx === ARTIST_BLOCKS.length - 1;
    return (
      <BlockSummaryScreen
        block={block}
        answers={artistAnswers}
        blockIndex={currentBlockIdx + 1}
        totalBlocks={ARTIST_BLOCKS.length}
        phaseName={`Artista · ${artistData.name || ""}`}
        photo={artistData.photo}
        onBack={() => {
          setArtistQIdx(ARTIST_BLOCK_ENDS[currentBlockIdx]);
          setPhase("artist-questions");
        }}
        onContinue={() => setPhase("artist-home")}
      />
    );
  }

  // ARTIST RESULT — total summary with hex radar
  if (phase === "artist-result") {
    return (
      <TotalSummaryScreen
        blocks={ARTIST_BLOCKS}
        answers={artistAnswers}
        title={artistData.name || "Artista"}
        subtitle="Resultado Artista"
        photo={artistData.photo}
        onContinue={() => setPhase("artist-home")}
        continueLabel="← Volver al artista"
        onSecondary={() => { setCurrentSong({ data: {}, answers: {} }); setSongQIdx(0); setPhase("song-form"); }}
        secondaryLabel="Evaluar canción →"
      />
    );
  }

  // SONG FORM
  if (phase === "song-form") {
    // Always get fresh artist from live store
    const liveArtist = artistData?.id ? (getArtists().find(a => a.id === artistData.id) || artistData) : null;
    return <ProjectForm
      profile={profile}
      songNum={songs.length + 1}
      prefilledArtist={liveArtist}
      onBack={() => setPhase(liveArtist ? "artist-catalogue" : "welcome")}
      onSubmit={async (data) => {
        // Resolve artistId from every possible source
        const artistId = data.linkedArtist?.id || data.artistId || artistData?.id || null;
        console.log("🎵 song-form submit — artistId:", artistId, "linkedArtist:", data.linkedArtist?.name, "artistData:", artistData?.name);
        if (data.linkedArtist) setArtistData(data.linkedArtist);
        const projectId = Date.now().toString();
        const projectEntry = { ...data, id: projectId, artistId, answers: {}, createdAt: new Date().toISOString() };
        if (artistId) {
          await saveProject(projectEntry, artistId);
        } else {
          console.error("❌ No artistId found — project NOT saved to Firebase");
        }
        setCurrentSong({ data: projectEntry, answers: {} });
        setCurrentSongAnswers({});
        setSongQIdx(0);
        setPhase("song-home");
      }}
    />;
  }

  // SONG QUESTIONS
  if (phase === "song-questions") {
    const q = SONG_QUESTIONS[songQIdx];
    if (!q) { setPhase("song-block-home"); return null; }
    return (
      <SwipeCard
        question={q}
        onAnswer={handleSongAnswer}
        currentIndex={songQIdx + 1}
        total={SONG_QUESTIONS.length}
        answers={currentSong?.answers || {}}
        blockLabel={q.blockLabel}
        subcatLabel={q.subcatLabel}
        phase="song"
        phaseName={currentSong?.data?.title || "Canción"}
        photo={currentSong?.data?.photo}
        onHome={() => setPhase("song-block-home")}
        onGoHome={() => setPhase("song-home")}
        onGoBlock={() => setPhase("song-block-home")}
      />
    );
  }

  // SONG SUBCAT SUMMARY
  if (phase === "song-subcat-summary") {
    return (
      <SubcatSummaryScreen
        subcatInfo={currentSubcatInfo}
        photo={currentSong?.data?.photo}
        phaseName={`Catálogo · ${currentSong?.data?.title || ""}`}
        onBack={() => {
          const subcatEndIdx = currentSubcatInfo?.endIdx ?? (songQIdx - 1);
          setSongQIdx(subcatEndIdx);
          setPhase("song-questions");
        }}
        onContinue={() => {
          if (currentSubcatInfo?.isBlockEnd) {
            setPhase("song-block-summary");
          } else {
            setPhase("song-questions");
          }
        }}
      />
    );
  }

  // SONG BLOCK SUMMARY
  if (phase === "song-block-summary") {
    const block = SONG_BLOCKS[currentBlockIdx];
    return (
      <BlockSummaryScreen
        block={block}
        answers={currentSong?.answers || {}}
        blockIndex={currentBlockIdx + 1}
        totalBlocks={SONG_BLOCKS.length}
        phaseName={`Catálogo · ${currentSong?.data?.title || ""}`}
        photo={currentSong?.data?.photo}
        onBack={() => {
          setSongQIdx(SONG_BLOCK_ENDS[currentBlockIdx]);
          setPhase("song-questions");
        }}
        onContinue={() => setPhase("song-home")}
      />
    );
  }

  // SONG RESULT — total summary with hex radar
  if (phase === "song-result") {
    const songScore = calcTotalScore(SONG_BLOCKS, currentSong?.answers || {});
    const allWithCurrent = [...songs, { ...currentSong, score: songScore }];
    const avg = Math.round(allWithCurrent.reduce((a,s) => a + s.score, 0) / allWithCurrent.length * 10) / 10;
    return (
      <TotalSummaryScreen
        blocks={SONG_BLOCKS}
        answers={currentSong?.answers || {}}
        title={currentSong?.data?.title || `Canción ${songs.length + 1}`}
        subtitle={`Canción ${songs.length + 1} · Media actual: ${avg}`}
        photo={currentSong?.data?.photo}
        onContinue={() => {
          setSongs(prev => [...prev, { ...currentSong, score: songScore }]);
          setCurrentSong({ data:{}, answers:{} });
          setSongQIdx(0);
          setPhase("song-form");
        }}
        continueLabel="+ Añadir otra canción"
        onSecondary={() => {
          setSongs(prev => [...prev, { ...currentSong, score: songScore }]);
          setCurrentSong(null);
          setPhase("final");
        }}
        secondaryLabel="Ver resultado final →"
      />
    );
  }

  // FINAL
  if (phase === "final") {
    const avg = songs.length > 0 ? Math.round(songs.reduce((a,s) => a+s.score,0)/songs.length*10)/10 : 0;
    const final = Math.round((avg*0.70 + artistScore*0.30)*10)/10;
    const color = scoreColor(final);
    return (
      <div style={{minHeight:"100dvh", background:bgColor(100), display:"flex", flexDirection:"column"}}>
        <div style={{padding:"16px 20px 0", paddingTop:"max(16px,env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <img src={RIMAS_LOGO} alt="RI+D" style={{height:"28px",width:"28px",objectFit:"contain",borderRadius:"6px"}}/>
          <div style={{fontFamily:"Arial,sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.6)"}}>Resultado Final</div>
        </div>

        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 18px"}}>

          {/* Score total hero */}
          <div style={{background:"rgba(0,0,0,0.35)",borderRadius:"18px",padding:"20px",marginBottom:"14px",textAlign:"center"}}>
            {artistData.photo && <img src={artistData.photo} alt="" style={{width:"60px",height:"60px",borderRadius:"50%",objectFit:"cover",margin:"0 auto 10px",display:"block",border:"2px solid rgba(255,255,255,0.3)"}}/>}
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px"}}>Score Total · {artistData.name||"Artista"}</div>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"72px",fontWeight:"700",color,lineHeight:1,marginBottom:"6px"}}>{final}</div>
            <div style={{display:"inline-block",padding:"4px 16px",borderRadius:"20px",background:color+"22",border:`1px solid ${color}44`,fontFamily:"Arial,sans-serif",fontSize:"13px",fontWeight:"700",color,marginBottom:"10px"}}>{scoreLabel(final)}</div>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>Canciones {avg} ×0.70 + Artista {artistScore} ×0.30</div>
          </div>

          {/* Proyectos evaluadas */}
          <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"8px"}}>Canciones evaluadas</div>
          {songs.map((s,i) => (
            <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:"12px",padding:"12px 14px",marginBottom:"8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                {s.data?.photo && <img src={s.data.photo} alt="" style={{width:"34px",height:"34px",borderRadius:"8px",objectFit:"cover"}}/>}
                <div>
                  <div style={{fontFamily:"Arial,sans-serif",fontSize:"13px",fontWeight:"700",color:"white"}}>{s.data?.title||`Canción ${i+1}`}</div>
                  {s.data?.date && <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",color:"rgba(255,255,255,0.4)"}}>{s.data.date}</div>}
                </div>
              </div>
              <div style={{fontFamily:"Arial,sans-serif",fontSize:"22px",fontWeight:"700",color:scoreColor(s.score)}}>{s.score}</div>
            </div>
          ))}
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:"10px",padding:"10px 14px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"12px",fontWeight:"700",color:"rgba(255,255,255,0.6)"}}>Media canciones</div>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"18px",fontWeight:"700",color:scoreColor(avg)}}>{avg}</div>
          </div>

          {/* Artista hex radar */}
          <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"8px"}}>Radar artista</div>
          <div style={{background:"#1e1e1e",borderRadius:"16px",padding:"12px 8px",marginBottom:"14px",display:"flex",justifyContent:"center"}}>
            <HexRadarTotal blocks={ARTIST_BLOCKS} answers={artistAnswers}/>
          </div>

          {/* Artista block scores */}
          <div style={{background:"rgba(0,0,0,0.25)",borderRadius:"14px",padding:"14px",marginBottom:"12px"}}>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",fontWeight:"700",color:"rgba(255,255,255,0.4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"10px"}}>Desglose artista</div>
            {ARTIST_BLOCKS.map(b => {
              const bs = Math.round(calcBlockScore(b,artistAnswers)*10)/10;
              return (
                <div key={b.id} style={{marginBottom:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                    <div>
                      <span style={{fontFamily:"Arial,sans-serif",fontSize:"13px",color:"white",fontWeight:"700"}}>{b.label}</span>
                      <span style={{fontFamily:"Arial,sans-serif",fontSize:"10px",color:"rgba(255,255,255,0.4)",marginLeft:"6px"}}>×{Math.round(b.blockWeight*100)}%</span>
                    </div>
                    <div style={{fontFamily:"Arial,sans-serif",fontSize:"16px",fontWeight:"700",color:scoreColor(bs)}}>{bs}</div>
                  </div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.1)",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${bs}%`,background:scoreColor(bs),borderRadius:"2px"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{padding:"12px 18px",paddingBottom:"max(12px,env(safe-area-inset-bottom,12px))"}}>
          <button onClick={()=>{saveProfile(null);setPhase("welcome");setArtistData({});setArtistAnswers({});setArtistQIdx(0);setCurrentBlockIdx(0);setSongs([]);setCurrentSong(null);setSongQIdx(0);}}
            style={{display:"block",width:"100%",padding:"17px",background:"white",color:"#E8151B",border:"none",borderRadius:"14px",fontFamily:"Arial,sans-serif",fontSize:"17px",fontWeight:"700",cursor:"pointer"}}>
            Nueva evaluación
          </button>
        </div>
      </div>
    );
  }

  return null;
}
// v1777864922
