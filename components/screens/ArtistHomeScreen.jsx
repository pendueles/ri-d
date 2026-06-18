// components/screens/ArtistHomeScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { ARTIST_BLOCKS, SONG_BLOCKS } from "../../data/questions";
import { getArtists, useFirebaseStore } from "../../firebase/store";
import { getPendingTasks } from "../../utils/helpers";

function KpiCard({ label, value, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        background: "#ffffff",
        border: "1px solid #EAEAEA",
        borderRadius: "20px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: hover ? "0 8px 20px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hover ? "translateY(-3px)" : "none",
        transition: "all 0.2s ease",
      }}>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: "13px", fontWeight: "700", color: "#888888", letterSpacing: "0.06em", marginBottom: "8px" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: "34px", fontWeight: "700", color: "#0a0a0a" }}>
        {value !== null ? value : "—"}
      </div>
    </button>
  );
}

export default function ArtistHomeScreen({ artistData, artistAnswers, onBlock, onResult, onBack, profile, onCatalogue, onNewProject, onEdit, onPending, onProfile }) {
  const t = theme(isDark());
  useFirebaseStore(); // re-render on Firebase changes

  const rad = (deg) => deg * Math.PI / 180;

  // Scores
  const artistScore = Object.keys(artistAnswers).length > 0 ? Math.round(calcTotalScore(ARTIST_BLOCKS, artistAnswers) * 10) / 10 : null;
  const liveArtist = getArtists().find(a => a.id === artistData?.id);
  const artistProjects = (liveArtist?.projects || []).filter(p => p.artistId === artistData?.id);
  const projScores = artistProjects.map(p => {
    const ans = p.answers || {}; return Object.keys(ans).length > 0 ? calcTotalScore(SONG_BLOCKS, ans) : null;
  }).filter(s => s !== null);
  const catAvg = projScores.length > 0 ? Math.round(projScores.reduce((a, b) => a + b, 0) / projScores.length * 10) / 10 : null;
  const generalScore = (() => {
    if (catAvg !== null && artistScore !== null) return Math.round((catAvg * 0.7 + artistScore * 0.3) * 10) / 10;
    if (catAvg !== null) return catAvg;
    if (artistScore !== null) return artistScore;
    return null;
  })();

  const artistVerts = [
    { id: 'result', label: 'Resultado', angle: -90 }, { id: 'social', label: 'Social', angle: -30 },
    { id: 'ytvideo', label: 'Video', angle: 30 }, { id: 'rights', label: 'Rights', angle: 90 },
    { id: 'authority', label: 'Authority', angle: 150 }, { id: 'dsps', label: 'DSPs', angle: 210 },
  ];

  const getArtistBlockScore = (id) => {
    if (id === 'result') return artistScore;
    const b = ARTIST_BLOCKS.find(x => x.id === id); if (!b) return null;
    const has = b.subcats.some(s => s.items.some(i => artistAnswers[i.id] !== undefined));
    return has ? Math.round(calcBlockScore(b, artistAnswers) * 10) / 10 : null;
  };
  const getCatBlockScore = (id) => {
    if (id === 'result') return catAvg;
    const b = SONG_BLOCKS.find(x => x.id === id); if (!b) return null;
    const scores = artistProjects.map(p => {
      const ans = p.answers || {}; const has = b.subcats.some(s => s.items.some(i => ans[i.id] !== undefined));
      return has ? calcBlockScore(b, ans) : null;
    }).filter(s => s !== null);
    return scores.length > 0 ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length * 10) / 10 : null;
  };
  const getGeneralBlockScore = (id) => {
    if (id === 'result') return generalScore;
    const a = getArtistBlockScore(id); const c = getCatBlockScore(id);
    if (a !== null && c !== null) return Math.round((c * 0.7 + a * 0.3) * 10) / 10;
    if (c !== null) return c; if (a !== null) return a; return null;
  };

  // Hexagon geometry — kept the same proportions as before, slightly bigger
  const S = Math.min(window.innerWidth * 0.9, 320), cxh = S / 2, cyh = S / 2, R = S * 0.30;
  const hexPts = artistVerts.map(v => ({ x: cxh + R * Math.cos(rad(v.angle)), y: cyh + R * Math.sin(rad(v.angle)) }));
  const dataPoly = (() => {
    const pts = [...artistVerts].sort((a, b) => a.angle - b.angle).map(v => {
      const s = getGeneralBlockScore(v.id); if (s === null) return null;
      const p = Math.max(0.01, s / 100);
      return { x: cxh + R * p * Math.cos(rad(v.angle)), y: cyh + R * p * Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  })();

  // Pending tasks — combine artist questions + all project (song) questions
  const artistTasks = getPendingTasks(ARTIST_BLOCKS, artistAnswers);
  const projectTasks = artistProjects.flatMap(p => getPendingTasks(SONG_BLOCKS, p.answers || {}));
  const priorityRank = { Alta: 0, Media: 1, Baja: 2 };
  const pendingTasks = [...artistTasks, ...projectTasks].sort((a, b) =>
    priorityRank[a.priority] - priorityRank[b.priority] || b.impact - a.impact
  );

  return (
    <div style={{ minHeight: '100dvh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>

      {/* Back button — top left, discreet, same language as the rest of the app */}
      <div style={{ padding: '16px 20px', paddingTop: 'max(16px,env(safe-area-inset-top,16px))' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#aaaaaa', fontFamily: 'Arial,sans-serif', fontSize: '15px', cursor: 'pointer', padding: 0 }}>
          ← Roster
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 20px 32px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>

        {/* Header — name + team only */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <button onClick={onEdit} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '28px', fontWeight: '700', color: '#0a0a0a', letterSpacing: '-0.5px', lineHeight: 1 }}>
              {artistData.name}
            </div>
            {(() => {
              const labels = artistData.labelUsers?.length > 0 ? artistData.labelUsers : [artistData.labelUser].filter(Boolean);
              return labels.length > 0 ? (
                <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '12px', color: '#aaaaaa', marginTop: '4px' }}>{labels.join(' · ')}</div>
              ) : null;
            })()}
          </button>
        </div>

        {/* RI+D hexagon — the focal point of the screen */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px' }}>
          <div style={{ position: 'relative', width: `${S}px`, height: `${S}px` }}>
            <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: 'absolute', inset: 0 }}>
              {[0.33, 0.66, 1].map((sc, ri) => {
                const ps = hexPts.map(p => ({ x: cxh + (p.x - cxh) * sc, y: cyh + (p.y - cyh) * sc }));
                return <path key={ri} d={ps.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'} fill="none" stroke={t.border} strokeWidth="1" />;
              })}
              {hexPts.map((p, i) => <line key={i} x1={cxh} y1={cyh} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1" />)}
              {dataPoly && <path d={dataPoly} fill="rgba(232,21,27,0.12)" stroke="#E8151B" strokeWidth="1.5" strokeLinejoin="round" />}
            </svg>
            {/* Vertex labels */}
            {artistVerts.map(v => {
              const s = getGeneralBlockScore(v.id);
              const px = cxh + R * Math.cos(rad(v.angle));
              const py = cyh + R * Math.sin(rad(v.angle));
              const isRes = v.id === 'result';
              if (isRes) {
                return s !== null ? (
                  <div key={v.id} style={{ position: 'absolute', left: `${px}px`, top: `${py}px`, transform: 'translate(-50%,-50%)',
                    background: t.accent, borderRadius: '20px', padding: '6px 14px',
                    fontFamily: 'Arial,sans-serif', fontSize: '20px', fontWeight: '700', color: '#fff', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                    {s}
                  </div>
                ) : null;
              }
              return (
                <div key={v.id} style={{ position: 'absolute', left: `${px}px`, top: `${py}px`, transform: 'translate(-50%,-50%)',
                  background: s !== null ? t.text : t.bg2,
                  border: `1px solid ${s !== null ? t.text : t.border}`,
                  borderRadius: '14px', padding: '3px 7px',
                  fontFamily: 'Arial,sans-serif', pointerEvents: 'none', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', fontWeight: '700', color: s !== null ? t.bg : t.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{v.label}</div>
                  {s !== null && <div style={{ fontSize: '10px', fontWeight: '700', color: t.bg, lineHeight: 1 }}>{s}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main KPI cards — Perfil, Catálogo, Tareas pendientes — stacked, same size and weight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          <KpiCard label="Perfil" value={artistScore} onClick={onProfile} />
          <KpiCard label="Catálogo" value={artistProjects.length} onClick={onCatalogue} />
          <KpiCard label="Tareas pendientes" value={pendingTasks.length} onClick={onPending} />
        </div>

        {/* Administrative info — lowest visual weight */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
          <button onClick={onEdit} style={{ background: 'transparent', border: 'none', color: '#cccccc', fontFamily: 'Arial,sans-serif', fontSize: '12px', cursor: 'pointer', padding: '6px' }}>
            Editar perfil
          </button>
          <button onClick={onNewProject} style={{ background: 'transparent', border: 'none', color: '#cccccc', fontFamily: 'Arial,sans-serif', fontSize: '12px', cursor: 'pointer', padding: '6px' }}>
            + Nueva canción
          </button>
        </div>

      </div>
    </div>
  );
}
