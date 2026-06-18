// components/screens/ProjectListScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { calcTotalScore } from "../../utils/scoring";
import { getArtists, useFirebaseStore } from "../../firebase/store";
import { SONG_BLOCKS } from "../../data/questions";

// Same color scale used by the roster KPI cards: verde >80, azul 60-80, naranja 40-60, rojo <40
function kpiColor(score) {
  if (score === null) return { solid: '#9CA3AF', text: '#374151' };
  if (score > 80) return { solid: '#639922', text: '#173404' };
  if (score >= 60) return { solid: '#378ADD', text: '#042C53' };
  if (score >= 40) return { solid: '#BA7517', text: '#412402' };
  return { solid: '#E24B4A', text: '#501313' };
}

export default function ProjectListScreen({ profile, onBack, onCreate, onSelect }) {
  const t = theme(isDark());
  useFirebaseStore();
  const allArtists = getArtists();
  const myArtists = profile.type === 'admin'
    ? allArtists
    : profile.type === 'label'
    ? allArtists.filter(a => a.labelUser === profile.name || (a.labelUsers && a.labelUsers.includes(profile.name)))
    : profile.type === 'management'
    ? allArtists.filter(a => a.management && a.management.split(';').map(m => m.trim().toLowerCase()).includes(profile.name.toLowerCase()))
    : allArtists.filter(a => a.name?.toLowerCase() === profile.name?.toLowerCase());

  const myArtistIds = new Set(myArtists.map(a => a.id));
  const getProjectScore = (p) => {
    if (p.score !== undefined && p.score !== null) return p.score;
    if (p.answers && Object.keys(p.answers).length > 0) return Math.round(calcTotalScore(SONG_BLOCKS, p.answers) * 10) / 10;
    return null;
  };

  const allProjects = myArtists
    .flatMap(a => (a.projects || []).map(p => ({ ...p, artistName: a.name, artistPhoto: a.photo || null })))
    .filter(p => myArtistIds.has(p.artistId))
    .map(p => ({ ...p, _score: getProjectScore(p) }))
    .sort((a, b) => {
      if (a._score === null && b._score === null) return 0;
      if (a._score === null) return 1;
      if (b._score === null) return -1;
      return b._score - a._score;
    });

  return (
    <div style={{ minHeight:"100dvh", background:"#ffffff", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>← Atrás</button>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>Catálogo</div>
        {(profile.type === 'label' || profile.type === 'admin') ? (
          <button onClick={onCreate} style={{ background:"transparent", border:"none", color:t.accent, fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer", padding:0 }}>+ Nuevo</button>
        ) : <div style={{width:'50px'}}/>}
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px", background:"#ffffff" }}>
        {allProjects.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            <div style={{ fontSize:"56px", marginBottom:"20px" }}>🎵</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:"#0a0a0a", marginBottom:"10px" }}>No tienes canciones todavía</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"14px", color:"#555555", marginBottom:"32px", maxWidth:"260px", lineHeight:"1.5" }}>Crea tu primera canción para empezar a evaluar su presencia digital</div>
            {(profile.type === 'label' || profile.type === 'admin') && (
              <button onClick={onCreate} style={{ padding:"16px 32px", background:t.accent, color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
                + Nuevo proyecto
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"20px" }}>
            {allProjects.map((p, i) => (
              <ProjectKpiCard key={p.id || i} project={p} score={p._score} color={kpiColor(p._score)} onClick={() => onSelect && onSelect(p)}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// KPI card: foto a sangre completa, score como badge,
// degradado inferior con título + barra + artista/fecha
// ─────────────────────────────────────────
function ProjectKpiCard({ project, score, color, onClick }) {
  const [hover, setHover] = useState(false);
  const hasPhoto = !!project.photo;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:"relative",
        aspectRatio:"3/4",
        border:"none",
        borderRadius:"22px",
        overflow:"hidden",
        cursor:"pointer",
        textAlign:"left",
        background: hasPhoto ? "#1a1a1a" : color.solid,
        boxShadow: hover ? "0 14px 30px rgba(0,0,0,0.18)" : "0 2px 10px rgba(0,0,0,0.08)",
        transform: hover ? "translateY(-2px) scale(1.02)" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}>

      {hasPhoto && (
        <img src={project.photo} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
      )}

      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)" }}/>

      {score !== null && (
        <div style={{ position:"absolute", top:"14px", left:"14px", background:"#ffffff", color:color.text, fontFamily:"Arial,sans-serif", fontSize:"18px", fontWeight:"700", padding:"6px 12px", borderRadius:"12px", boxShadow:"0 2px 6px rgba(0,0,0,0.15)" }}>
          {score.toFixed(1)}
        </div>
      )}

      <div style={{ position:"absolute", bottom:"18px", right:"18px", color:"#ffffff", fontSize:"20px" }}>›</div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"18px" }}>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"19px", fontWeight:"700", color:"#ffffff", marginBottom:"8px" }}>
          {project.title || "Sin título"}
        </div>

        {score !== null && (
          <div style={{ width:"100%", height:"6px", borderRadius:"6px", background:"rgba(255,255,255,0.25)", overflow:"hidden", marginBottom:"10px" }}>
            <div style={{ width:`${score}%`, height:"100%", background:"#ffffff", borderRadius:"6px" }}/>
          </div>
        )}

        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.85)" }}>
          {project.artistName}{project.date ? ` · ${project.date}` : ""}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NEW ARTIST FORM — 3 steps
// ═══════════════════════════════════════════
