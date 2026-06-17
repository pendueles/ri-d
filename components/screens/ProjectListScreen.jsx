// components/screens/ProjectListScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { scoreColor } from "../../utils/helpers";
import { calcTotalScore } from "../../utils/scoring";
import { getArtists, useFirebaseStore } from "../../firebase/store";
import { SONG_BLOCKS } from "../../data/questions";

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
  const allProjects = myArtists
    .flatMap(a => (a.projects || []).map(p => ({ ...p, artistName: a.name, artistPhoto: a.photo || null })))
    .filter(p => myArtistIds.has(p.artistId))
    .sort((a, b) => {
      const da = a.date ? new Date(a.date) : a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db2 = b.date ? new Date(b.date) : b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db2 - da;
    });

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>← Atrás</button>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>Catálogo</div>
        {(profile.type === 'label' || profile.type === 'admin') ? (
          <button onClick={onCreate} style={{ background:"transparent", border:"none", color:t.accent, fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer", padding:0 }}>+ Nuevo</button>
        ) : <div style={{width:'50px'}}/>}
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px" }}>
        {allProjects.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            <div style={{ fontSize:"56px", marginBottom:"20px" }}>🎵</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:t.text, marginBottom:"10px" }}>No tienes canciones todavía</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"14px", color:t.text2, marginBottom:"32px", maxWidth:"260px", lineHeight:"1.5" }}>Crea tu primera canción para empezar a evaluar su presencia digital</div>
            {(profile.type === 'label' || profile.type === 'admin') && (
              <button onClick={onCreate} style={{ padding:"16px 32px", background:t.accent, color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
                + Nuevo proyecto
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {allProjects.map((p, i) => (
              <button key={p.id || i} onClick={() => onSelect && onSelect(p)}
                style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px", background:t.card, border:`1px solid ${t.border}`, borderRadius:"16px", boxShadow:`0 2px 8px ${t.shadow}`, cursor:"pointer", textAlign:"left", width:"100%" }}>
                {p.photo ? (
                  <img src={p.photo} alt="" style={{ width:"48px", height:"48px", borderRadius:"10px", objectFit:"cover", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:"48px", height:"48px", borderRadius:"10px", background:t.bg2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"22px" }}>🎵</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:t.text, marginBottom:"2px" }}>{p.title || "Sin título"}</div>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text2 }}>{p.artistName}{p.date ? ` · ${p.date}` : ""}</div>
                </div>
                {(() => {
                  const liveScore = p.score !== undefined ? p.score : (p.answers && Object.keys(p.answers).length > 0 ? Math.round(calcTotalScore(SONG_BLOCKS, p.answers) * 10) / 10 : null);
                  return liveScore !== null ? (
                    <div style={{ fontFamily:"Arial,sans-serif", fontSize:"20px", fontWeight:"700", color:scoreColor(liveScore), flexShrink:0 }}>{liveScore}</div>
                  ) : null;
                })()}
                <div style={{ color:t.text3, fontSize:"18px" }}>›</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NEW ARTIST FORM — 3 steps
// ═══════════════════════════════════════════
