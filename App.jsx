import { useState, useEffect, useRef, useCallback } from "react";
import { RIMAS_LOGO, ICON_ARTISTA, ICON_PROYECTO, ICON_NUEVO, LOGO_B64 } from "./data/assets";
import { useDarkMode, isDark, theme } from "./theme/theme";
import { calcBlockScore, calcTotalScore } from "./utils/scoring";
import { flattenQuestions, scoreColor, scoreLabel, bgColor } from "./utils/helpers";
import { QUESTION_HINTS, ARTIST_BLOCKS, ARTIST_QUESTIONS, SONG_BLOCKS, SONG_QUESTIONS } from "./data/questions";
import SwipeCard from "./components/quiz/SwipeCard";
import ResultScreen from "./components/quiz/ResultScreen";
import SubcatSummaryScreen from "./components/quiz/SubcatSummaryScreen";
import BlockSummaryScreen from "./components/quiz/BlockSummaryScreen";
import TotalSummaryScreen from "./components/quiz/TotalSummaryScreen";
import PendingTasksScreen from "./components/quiz/PendingTasksScreen";
import ResetButton from "./components/ui/ResetButton";
import HomeButton from "./components/ui/HomeButton";
import HexRadarTotal from "./components/ui/HexRadarTotal";
import SplashScreen from "./components/ui/SplashScreen";
import { db } from "./firebase/firebase";
import {
  useFirebaseStore, saveState, loadState, clearState,
  getArtists, getFirebaseError, clearFirebaseError,
  saveOneArtist, saveProject, saveArtists, deleteArtists, deleteProjectById,
  getArtistUsers, saveArtistUsers, registerArtistUser,
  getLabelUsers, saveLabelUsers,
  getMgmtUsers, saveMgmtUsers,
  startRealtimeSync,
} from "./firebase/store";





// ═══════════════════════════════════════════
// QUESTION DATA — exact from Excel
// ═══════════════════════════════════════════
  const [vals, setVals] = useState({});
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = () => {
    const required = fields.filter(f => f.required);
    for (const f of required) {
      if (!vals[f.id] || !vals[f.id].trim()) {
        alert(`Por favor rellena: ${f.label}`);
        return;
      }
    }
    onSubmit({ ...vals, photo });
  };

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      {/* Topbar */}
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top, 16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        {onBack
          ? <button onClick={onBack} style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>← Atrás</button>
          : <div style={{ width:"60px" }}/>
        }
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>{title}</div>
        <div style={{ width:"60px" }}/>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"32px 24px" }}>
        {subtitle && (
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:"13px", color:t.text3, marginBottom:"28px" }}>{subtitle}</div>
        )}

        {/* Photo upload */}
        {fields.some(f => f.id === 'photo') || (
          <div style={{ display:"flex", justifyContent:"center", marginBottom:"32px" }}>
            <div onClick={() => fileRef.current.click()}
              style={{ width:"80px", height:"80px", borderRadius:"50%", background: photo ? "transparent" : t.bg2, border:`1.5px dashed ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden" }}>
              {photo
                ? <img src={photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontSize:"24px" }}>📷</span>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
          </div>
        )}

        {fields.map(f => (
          <div key={f.id} style={{ marginBottom:"28px" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>{f.label}{f.required ? " *" : ""}</div>
            <input
              type={f.type || "text"}
              placeholder={f.placeholder || ""}
              value={vals[f.id] || ""}
              onChange={e => setVals(v => ({ ...v, [f.id]: e.target.value }))}
              style={{ display:"block", width:"100%", background:"transparent", border:"none", borderBottom:`1.5px solid ${t.border}`, padding:"10px 0", fontFamily:"Arial,sans-serif", fontSize:"17px", color:t.text, outline:"none", WebkitAppearance:"none" }}
            />
          </div>
        ))}
      </div>

      <div style={{ padding:"16px 24px", paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", borderTop:`1px solid ${t.border}` }}>
        <button onClick={handleSubmit}
          style={{ display:"block", width:"100%", padding:"17px", background:t.text, color:t.bg, border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer" }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

function BlockHomeScreen({ block, artistAnswers, onSubcat, onBack, artistName, onGoHome }) {
  const t = theme(isDark());
  const rad = (deg) => deg * Math.PI / 180;

  // Map subcats to hexagon vertices based on block id
  const getVertices = () => {
    if (block.id === 'dsps') return [
      { id:'result',       label:'Total',               angle: -90  },
      { id:'spotify',      label:'Spotify',             angle: -150 },
      { id:'apple_music',  label:'Apple Music',         angle: -30  },
      { id:'other_dsps',   label:'Other DSPs',          angle:  30  },
      { id:'soundcloud',   label:'SoundCloud & Beatport', angle:  90 },
      { id:'youtube_music',label:'YT Music',            angle:  150 },
    ];
    if (block.id === 'social') return [
      { id:'result',    label:'Puntuación',  angle: -90  },
      { id:'tiktok',    label:'TikTok',      angle: -30  },
      { id:'rrss_alt',  label:'RRSS Alt',    angle:  30  },
      { id:'web',       label:'Web',         angle:  90  },
      { id:'x',         label:'X',           angle:  150 },
      { id:'instagram', label:'Instagram',   angle: -150 },
    ];
    if (block.id === 'authority') return [
      { id:'result',      label:'Puntuación',      angle: -90  },
      { id:'wikipedia',   label:'Wikipedia',       angle: -30  },
      { id:'musicbrainz', label:'MusicBrainz&Co',  angle:  30  },
      { id:'composer',    label:'Composer',        angle:  90  },
      { id:'googlepanel', label:'Google Panel',    angle:  150 },
      { id:'lyrics',      label:'Lyrics',          angle: -150 },
    ];
    if (block.id === 'ytvideo') return [
      { id:'result',        label:'Puntuación',    angle: -90  },
      { id:'configuracion', label:'Configuración', angle: -30  },
      { id:'diseno',        label:'Diseño',        angle:  30  },
      { id:'contenido',     label:'Contenido',     angle:  90  },
      { id:'organizacion',  label:'Organización',  angle:  150 },
      { id:'accesos',       label:'Accesos',       angle: -150 },
    ];
    // Default: use subcats as vertices
    return [
      { id:'result', label:'Total', angle:-90 },
      ...block.subcats.map((s, i) => ({
        id: s.id, label: s.label, angle: -30 + i * 60
      }))
    ];
  };

  const vertices = getVertices();
  const S = 300, cx = S/2, cy = S/2, R = 105;

  const getSubcatScore = (subcatId) => {
    if (subcatId === 'result') {
      return Math.round(calcBlockScore(block, artistAnswers) * 10) / 10;
    }
    // Handle combined soundcloud+beatport
    if (subcatId === 'soundcloud') {
      const scSub = block.subcats.find(s => s.id === 'soundcloud');
      const bpSub = block.subcats.find(s => s.id === 'beatport');
      const subs = [scSub, bpSub].filter(Boolean);
      if (subs.length === 0) return null;
      const hasData = subs.some(s => s.items.some(i => artistAnswers[i.id] !== undefined));
      if (!hasData) return null;
      let total = 0;
      subs.forEach(s => {
        s.items.forEach(item => { if (artistAnswers[item.id] === true) total += item.w; });
      });
      return Math.min(100, Math.round(total * 10) / 10);
    }
    const sub = block.subcats.find(s => s.id === subcatId);
    if (!sub) return null;
    const hasData = sub.items.some(i => artistAnswers[i.id] !== undefined);
    if (!hasData) return null;
    let raw = 0;
    sub.items.forEach(item => { if (artistAnswers[item.id] === true) raw += item.w; });
    return Math.min(100, Math.round(raw * 10) / 10);
  };

  const hexPoints = vertices.map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));

  // Sorted by angle for clean ring paths (no crossing lines)
  const sortedPoints = [...vertices].sort((a,b) => a.angle - b.angle).map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));
  const hasAnyData = vertices.some(v => v.id !== 'result' && getSubcatScore(v.id) !== null);
  const dataPolygon = (() => {
    const pts = vertices.map(v => {
      let score;
      if (v.id === 'result') {
        const allAnswered = block.subcats.some(s => s.items.some(i => artistAnswers[i.id] !== undefined));
        if (!allAnswered) return null;
        score = calcBlockScore(block, artistAnswers);
      } else {
        score = getSubcatScore(v.id);
        if (score === null) return null;
      }
      const pct = Math.max(0.01, score / 100);
      return { x: cx + R * pct * Math.cos(rad(v.angle)), y: cy + R * pct * Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      {/* Breadcrumb header */}
      <div style={{padding:'32px 24px 0', paddingTop:'max(32px,env(safe-area-inset-top,32px))', textAlign:'center'}}>
        <button onClick={onGoHome} style={{background:'transparent', border:'none', cursor: onGoHome ? 'pointer' : 'default', padding:'2px 8px', borderRadius:'8px', fontFamily:'Arial,sans-serif', fontSize:'13px', fontWeight:'600', color: onGoHome ? '#E8151B' : t.text3, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px', display:'block', margin:'0 auto 4px'}}>
          {artistName}
        </button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:t.text}}>{block.label}</div>
      </div>

      {/* Hexagon */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
        <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0, pointerEvents:'none'}}>
            {[0.33, 0.66, 1].map((scale, ri) => {
              const pts = sortedPoints.map(p => ({ x: cx+(p.x-cx)*scale, y: cy+(p.y-cy)*scale }));
              const path = pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
              return <path key={ri} d={path} fill="none" stroke={t.border} strokeWidth="1"/>;
            })}
            {sortedPoints.map((p,i) => (
              <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>
            ))}
            {hasAnyData && dataPolygon && <path d={dataPolygon} fill="rgba(232,21,27,0.15)" stroke="#E8151B" strokeWidth="2" strokeLinejoin="round"/>}
            {vertices.map(v => {
              const score = getSubcatScore(v.id);
              if (!score) return null;
              const pct = score / 100;
              const px = cx + R * pct * Math.cos(rad(v.angle));
              const py = cy + R * pct * Math.sin(rad(v.angle));
              return <circle key={v.id} cx={px.toFixed(1)} cy={py.toFixed(1)} r="4" fill="#E8151B"/>;
            })}
          </svg>

          {vertices.map(v => {
            const px = cx + R * Math.cos(rad(v.angle));
            const py = cy + R * Math.sin(rad(v.angle));
            const score = getSubcatScore(v.id);
            const isTotal = v.id === 'result';
            const hasScore = score !== null;
            return (
              <button key={v.id}
                onClick={() => !isTotal && onSubcat(v.id)}
                style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                  background: isTotal ? t.accent : hasScore ? t.text : t.bg,
                  border:`1.5px solid ${isTotal ? t.accent : hasScore ? t.text : t.border}`,
                  borderRadius:'20px', padding:'5px 10px', cursor: isTotal ? 'default' : 'pointer',
                  minWidth:'58px', maxWidth:'88px',
                  boxShadow: hasScore||isTotal ? `0 2px 10px ${t.shadow}` : 'none', transition:'all 0.2s'}}>
                {!isTotal && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'8px', fontWeight:'700',
                    color: hasScore ? t.bg : t.text2, letterSpacing:'0.05em', textTransform:'uppercase',
                    whiteSpace:'nowrap', textAlign:'center', lineHeight:'1.2'}}>
                    {v.label}
                  </div>
                )}
                {(hasScore || isTotal) && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize: isTotal ? '18px' : '11px',
                    fontWeight:'700', color: isTotal?'#fff':t.bg, lineHeight:1}}>{score}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back button */}
      <div style={{padding:'16px 32px', paddingBottom:'max(24px,env(safe-area-inset-bottom,24px))'}}>
        <button onClick={onBack}
          style={{display:'block', width:'100%', padding:'17px', background:'transparent',
            border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif',
            fontSize:'16px', fontWeight:'600', color:t.text2, cursor:'pointer'}}>
          ← {artistName}
        </button>
      </div>
    </div>
  );
}

function ArtistHomeScreen({ artistData, artistAnswers, onBlock, onResult, onBack, profile, onCatalogue, onNewProject, onEdit, onPending, onProfile }) {
  const t = theme(isDark());

  // Top=Resultado, top-right=DSPs, bot-right=Social,
  // bottom=Video, bot-left=Authority, top-left=Rights
  const vertices = [
    { id:'result',    label:'Resultado', angle: -90 },
    { id:'social',    label:'Social',    angle: -30 },
    { id:'ytvideo',   label:'Video',     angle:  30 },
    { id:'rights',    label:'Rights',    angle:  90 },
    { id:'authority', label:'Authority', angle: 150 },
    { id:'dsps',      label:'DSPs',      angle: 210 },
  ];

  const rad = (deg) => deg * Math.PI / 180;

  const getBlockScore = (id) => {
    if (id === 'result') {
      return Math.round(calcTotalScore(ARTIST_BLOCKS, artistAnswers)*10)/10;
    }
    const block = ARTIST_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const hasAnswers = block.subcats.some(s => s.items.some(item => artistAnswers[item.id] !== undefined));
    return hasAnswers ? Math.round(calcBlockScore(block, artistAnswers)*10)/10 : null;
  };

  const S = 340, cx = S/2, cy = S/2, R = 120;

  // Data polygon — only for blocks with answers
  const dataPolygon = (() => {
    const sorted = [...vertices].sort((a, b) => a.angle - b.angle);
    const pts = sorted.map(v => {
      const score = getBlockScore(v.id);
      if (score === null) return null;
      const pct = Math.max(0.01, score / 100);
      return { x: cx + R * pct * Math.cos(rad(v.angle)), y: cy + R * pct * Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length === 0) return null;
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  })();
  const hexPoints = vertices.map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));


  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>

      {/* Artist name — tappable to edit */}
      <div style={{padding:'32px 24px 0', paddingTop:'max(32px,env(safe-area-inset-top,32px))', textAlign:'center'}}>
        <button onClick={onEdit} style={{background:'transparent', border:'none', cursor:'pointer', padding:'4px 12px', borderRadius:'12px', display:'inline-flex', alignItems:'center', gap:'8px'}}>
          {artistData.photo && (
            <img src={artistData.photo} alt="" style={{width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', flexShrink:0}}/>
          )}
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:t.text, letterSpacing:'-0.5px', lineHeight:1}}>
              {artistData.name}
            </div>
            {(() => {
                const labels = artistData.labelUsers?.length > 0 ? artistData.labelUsers : [artistData.labelUser].filter(Boolean);
                return labels.length > 0 ? (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3, marginTop:'2px'}}>{labels.join(', ')}</div>
                ) : null;
              })()}
          </div>
          <span style={{fontSize:'14px', color:t.text3, marginLeft:'2px'}}>✎</span>
        </button>
      </div>

      {/* Three hexagons — vertical on mobile */}
      {(() => {
        const rad = (deg) => deg * Math.PI / 180;

        // Mini hex renderer
        const MiniHex = ({ title, score, vertices: verts, getScore, onClick, size = 200 }) => {
          const S = size, cxh = S/2, cyh = S/2, R = S * 0.30;
          const hexPts = verts.map(v => ({ x: cxh + R * Math.cos(rad(v.angle)), y: cyh + R * Math.sin(rad(v.angle)) }));
          const dataPoly = (() => {
            const pts = [...verts].sort((a,b)=>a.angle-b.angle).map(v => {
              const s = getScore(v.id); if (s===null) return null;
              const p = Math.max(0.01, s/100);
              return { x: cxh + R*p*Math.cos(rad(v.angle)), y: cyh + R*p*Math.sin(rad(v.angle)) };
            }).filter(Boolean);
            if (pts.length<2) return null;
            return pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
          })();

          const inner = (
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', background:'transparent', padding:'4px 8px', cursor: onClick ? 'pointer' : 'default'}}>
              <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, letterSpacing:'0.12em', textTransform:'uppercase'}}>{title}</div>
              <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
                <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0}}>
                  {[0.33,0.66,1].map((sc,ri) => {
                    const ps = hexPts.map(p => ({x:cxh+(p.x-cxh)*sc, y:cyh+(p.y-cyh)*sc}));
                    return <path key={ri} d={ps.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z'} fill="none" stroke={t.border} strokeWidth="1"/>;
                  })}
                  {hexPts.map((p,i) => <line key={i} x1={cxh} y1={cyh} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>)}
                  {dataPoly && <path d={dataPoly} fill="rgba(232,21,27,0.12)" stroke="#E8151B" strokeWidth="1.5" strokeLinejoin="round"/>}
                </svg>
                {/* Vertex labels */}
                {verts.map(v => {
                  const s = getScore(v.id);
                  const px = cxh + R * Math.cos(rad(v.angle));
                  const py = cyh + R * Math.sin(rad(v.angle));
                  const isRes = v.id === 'result';
                  if (isRes) {
                    return s !== null ? (
                      <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                        background:t.accent, borderRadius:'20px', padding:'5px 12px',
                        fontFamily:'Arial,sans-serif', fontSize: S > 200 ? '18px' : '13px', fontWeight:'700', color:'#fff', pointerEvents:'none', whiteSpace:'nowrap'}}>
                        {s}
                      </div>
                    ) : null;
                  }
                  return (
                    <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                      background: s!==null ? t.text : t.bg2,
                      border:`1px solid ${s!==null ? t.text : t.border}`,
                      borderRadius:'14px', padding:'3px 7px',
                      fontFamily:'Arial,sans-serif', pointerEvents:'none', whiteSpace:'nowrap', textAlign:'center'}}>
                      <div style={{fontSize:'8px', fontWeight:'700', color: s!==null ? t.bg : t.text3, letterSpacing:'0.05em', textTransform:'uppercase'}}>{v.label}</div>
                      {s!==null && <div style={{fontSize:'10px', fontWeight:'700', color:t.bg, lineHeight:1}}>{s}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );

          return onClick
            ? <button onClick={onClick} style={{background:'transparent', border:'none', padding:0}}>{inner}</button>
            : <div>{inner}</div>;
        };

        // Scores
        const artistScore = Object.keys(artistAnswers).length > 0 ? Math.round(calcTotalScore(ARTIST_BLOCKS, artistAnswers)*10)/10 : null;
        const artistProjects = _projects.filter(p => p.artistId === artistData?.id);
        const projScores = artistProjects.map(p => {
          const ans = p.answers||{}; return Object.keys(ans).length>0 ? calcTotalScore(SONG_BLOCKS, ans) : null;
        }).filter(s=>s!==null);
        const catAvg = projScores.length>0 ? Math.round(projScores.reduce((a,b)=>a+b,0)/projScores.length*10)/10 : null;
        const generalScore = (() => {
          if (catAvg!==null && artistScore!==null) return Math.round((catAvg*0.7+artistScore*0.3)*10)/10;
          if (catAvg!==null) return catAvg;
          if (artistScore!==null) return artistScore;
          return null;
        })();

        // Block score getters
        const getArtistBlockScore = (id) => {
          if (id==='result') return artistScore;
          const b = ARTIST_BLOCKS.find(x=>x.id===id); if (!b) return null;
          const has = b.subcats.some(s=>s.items.some(i=>artistAnswers[i.id]!==undefined));
          return has ? Math.round(calcBlockScore(b,artistAnswers)*10)/10 : null;
        };
        const getCatBlockScore = (id) => {
          if (id==='result') return catAvg;
          const b = SONG_BLOCKS.find(x=>x.id===id); if (!b) return null;
          const scores = artistProjects.map(p => {
            const ans=p.answers||{}; const has=b.subcats.some(s=>s.items.some(i=>ans[i.id]!==undefined));
            return has ? calcBlockScore(b,ans) : null;
          }).filter(s=>s!==null);
          return scores.length>0 ? Math.round(scores.reduce((a,c)=>a+c,0)/scores.length*10)/10 : null;
        };
        const getGeneralBlockScore = (id) => {
          if (id==='result') return generalScore;
          const a = getArtistBlockScore(id); const c = getCatBlockScore(id);
          if (a!==null && c!==null) return Math.round((c*0.7+a*0.3)*10)/10;
          if (c!==null) return c; if (a!==null) return a; return null;
        };

        const artistVerts = [
          {id:'result',label:'Resultado',angle:-90},{id:'social',label:'Social',angle:-30},
          {id:'ytvideo',label:'Video',angle:30},{id:'rights',label:'Rights',angle:90},
          {id:'authority',label:'Authority',angle:150},{id:'dsps',label:'DSPs',angle:210},
        ];
        const songVerts = [
          {id:'result',label:'Resultado',angle:-90},{id:'social',label:'Social',angle:-30},
          {id:'ytvideo',label:'Video',angle:30},{id:'rights',label:'Rights',angle:90},
          {id:'authority',label:'Authority',angle:150},{id:'dsps',label:'DSPs',angle:210},
        ];

        return (
          <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'8px 16px', gap:'8px', overflowY:'auto', width:'100%'}}>
            {/* General only */}
            <MiniHex title="General" score={generalScore} vertices={artistVerts} getScore={getGeneralBlockScore} size={Math.min(window.innerWidth * 0.86, 400)}/>
          </div>
        );
      })()}

      {/* Action buttons */}
      <div style={{padding:'12px 24px', paddingBottom:'max(24px,env(safe-area-inset-bottom,24px))', display:'flex', flexDirection:'column', gap:'10px'}}>
        <div style={{display:'flex', gap:'10px'}}>
          <button onClick={onProfile}
            style={{flex:1, padding:'16px', background:t.card, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:`0 2px 8px ${t.shadow}`}}>
            Perfil
          </button>
          <button onClick={onCatalogue}
            style={{flex:1, padding:'16px', background:t.card, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:`0 2px 8px ${t.shadow}`}}>
            Catálogo
          </button>
        </div>
        <button onClick={onBack}
          style={{display:'block', width:'100%', padding:'14px', background:'transparent', border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color:t.text2, cursor:'pointer'}}>
          ← Roster
        </button>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════
// ARTIST PROFILE SCREEN — single hexagon with all 6 blocks
// ═══════════════════════════════════════════
function ArtistProfileScreen({ artistData, artistAnswers, onBack, onBlock, onResult, onPending }) {
  const t = theme(isDark());
  const rad = (deg) => deg * Math.PI / 180;
  const vertices = [
    { id:'result',    label:'Resultado', angle: -90 },
    { id:'social',    label:'Social',    angle: -30 },
    { id:'ytvideo',   label:'Video',     angle:  30 },
    { id:'rights',    label:'Rights',    angle:  90 },
    { id:'authority', label:'Authority', angle: 150 },
    { id:'dsps',      label:'DSPs',      angle: 210 },
  ];
  const getBlockScore = (id) => {
    if (id === 'result') {
      const has = ARTIST_BLOCKS.some(b => b.subcats.some(s => s.items.some(i => artistAnswers[i.id] !== undefined)));
      return has ? Math.round(calcTotalScore(ARTIST_BLOCKS, artistAnswers)*10)/10 : null;
    }
    const block = ARTIST_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const has = block.subcats.some(s => s.items.some(i => artistAnswers[i.id] !== undefined));
    return has ? Math.round(calcBlockScore(block, artistAnswers)*10)/10 : null;
  };
  const S = 340, cx = S/2, cy = S/2, R = 120;
  const hexPoints = vertices.map(v => ({ x: cx + R * Math.cos(rad(v.angle)), y: cy + R * Math.sin(rad(v.angle)) }));
  const dataPolygon = (() => {
    const pts = [...vertices].sort((a,b)=>a.angle-b.angle).map(v => {
      const s = getBlockScore(v.id); if (s===null) return null;
      const p = Math.max(0.01, s/100);
      return { x: cx + R*p*Math.cos(rad(v.angle)), y: cy + R*p*Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length<2) return null;
    return pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Volver</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Perfil · {artistData.name}</div>
        <div style={{width:'60px'}}/>
      </div>
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
        <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0, pointerEvents:'none'}}>
            {[0.33,0.66,1].map((scale,ri) => {
              const pts = hexPoints.map(p => ({x:cx+(p.x-cx)*scale, y:cy+(p.y-cy)*scale}));
              return <path key={ri} d={pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z'} fill="none" stroke={t.border} strokeWidth="1"/>;
            })}
            {hexPoints.map((p,i) => <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>)}
            {dataPolygon && <path d={dataPolygon} fill="rgba(232,21,27,0.15)" stroke="#E8151B" strokeWidth="2" strokeLinejoin="round"/>}
          </svg>
          {vertices.map(v => {
            const px = cx + R * Math.cos(rad(v.angle));
            const py = cy + R * Math.sin(rad(v.angle));
            const score = getBlockScore(v.id);
            const isResult = v.id === 'result';
            const hasScore = score !== null;
            return (
              <button key={v.id} onClick={() => isResult ? onResult() : onBlock(v.id)}
                style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                  background: isResult ? t.accent : hasScore ? t.text : t.bg,
                  border:`1.5px solid ${isResult ? t.accent : hasScore ? t.text : t.border}`,
                  borderRadius:'20px', padding:'6px 12px', cursor:'pointer', minWidth:'62px',
                  boxShadow: hasScore||isResult ? `0 2px 10px ${t.shadow}` : 'none'}}>
                {!isResult && <div style={{fontFamily:'Arial,sans-serif', fontSize:'9px', fontWeight:'700', color: hasScore ? t.bg : t.text2, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap'}}>{v.label}</div>}
                {(hasScore || isResult) && <div style={{fontFamily:'Arial,sans-serif', fontSize: isResult?'20px':'12px', fontWeight:'700', color: isResult?'#fff':t.bg, lineHeight:1}}>{score}</div>}
              </button>
            );
          })}
        </div>
      </div>
      {onPending && (
        <div style={{padding:'12px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))'}}>
          <button onClick={onPending}
            style={{width:'100%', padding:'15px', background:t.bg2, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
            <span style={{fontSize:'16px'}}>📋</span> Tareas pendientes
          </button>
        </div>
      )}
    </div>
  );
}
function ProfileSelect({ onSelect }) {
  const t = theme(isDark());
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('name'); // 'name' | 'password'
  const [error, setError] = useState('');

  const handleEnter = () => {
    const n = name.trim();
    if (!n) { setError('Escribe tu nombre'); return; }

    if (n.toLowerCase() === 'admin') {
      if (step === 'name') {
        setStep('password');
        setError('');
        return;
      }
      // password step
      if (password === 'Fedora') {
        onSelect({ type: 'admin', name: 'Admin' });
      } else {
        setError('Contraseña incorrecta');
      }
      return;
    }

    // All other profiles disabled for now
    setError('Acceso no disponible. Contacta con el administrador.');
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 32px', paddingTop:'max(40px,env(safe-area-inset-top,40px))'}}>

      <img src={RIMAS_LOGO} alt="Ri+D" style={{width:'56px', height:'56px', objectFit:'contain', marginBottom:'56px', filter: isDark() ? 'invert(1)' : 'none'}}/>

      <div style={{width:'100%', maxWidth:'320px'}}>
        {step === 'name' ? (
          <input
            key="name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            placeholder="¿Quién eres?"
            autoFocus
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${error ? '#E8151B' : t.border}`, borderRadius:0, padding:'12px 0', fontFamily:'Arial,sans-serif', fontSize:'24px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', boxSizing:'border-box', textAlign:'center'}}
          />
        ) : (
          <input
            key="password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            placeholder="Contraseña"
            autoFocus
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${error ? '#E8151B' : t.border}`, borderRadius:0, padding:'12px 0', fontFamily:'Arial,sans-serif', fontSize:'24px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', boxSizing:'border-box', textAlign:'center'}}
          />
        )}

        {error && (
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#E8151B', marginTop:'10px', textAlign:'center'}}>{error}</div>
        )}

        <button onClick={handleEnter} style={{display:'block', margin:'40px auto 0', background:'transparent', border:'none', cursor:'pointer', padding:'8px'}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke={t.text3} strokeWidth="1.5"/>
            <path d="M13 16h8M17 12l4 4-4 4" stroke={t.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {step === 'password' && (
          <button onClick={() => { setStep('name'); setPassword(''); setError(''); }}
            style={{display:'block', margin:'16px auto 0', background:'transparent', border:'none', color:t.text3, fontFamily:'Arial,sans-serif', fontSize:'13px', cursor:'pointer'}}>
            ← Volver
          </button>
        )}
      </div>
    </div>
  );
}
// Shows: block score + subcategory breakdown (no hex)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// ARTIST LIST SCREEN
// ═══════════════════════════════════════════
function ArtistListScreen({ profile, onBack, onSelect, onCreate, liveArtists }) {
  const t = theme(isDark());
  useFirebaseStore(); // re-render on Firebase changes
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editingManagement, setEditingManagement] = useState(null);
  const [mgmtInput, setMgmtInput] = useState('');
  const allArtists = liveArtists || getArtists();
  const artists = profile.type === 'admin'
    ? allArtists
    : profile.type === 'label'
    ? allArtists.filter(a => a.labelUser === profile.name || (a.labelUsers && a.labelUsers.includes(profile.name)))
    : profile.type === 'management'
    ? allArtists.filter(a => a.management && a.management.split(';').map(m => m.trim().toLowerCase()).includes(profile.name.toLowerCase()))
    : allArtists.filter(a => a.name?.toLowerCase() === profile.name?.toLowerCase());

  const canEdit = profile.type === 'label' || profile.type === 'admin';

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleDelete = () => {
    deleteArtists(selected);
    setSelected([]);
    setEditMode(false);
  };

  const [selectedLabels, setSelectedLabels] = useState([]);
  useEffect(() => {
    if (editingManagement) {
      setSelectedLabels(editingManagement.labelUsers || [editingManagement.labelUser].filter(Boolean));
    }
  }, [editingManagement?.id]);
  const toggleLabel = (name) => setSelectedLabels(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleSaveManagement = (extraLabelUsers) => {
    const managers = mgmtInput.split(';').map(m => m.trim()).filter(Boolean);
    try {
      const existing = getMgmtUsers();
      managers.forEach(m => { existing[m] = true; });
      saveMgmtUsers(existing);
    } catch(e) {}
    const updated = { ...editingManagement, management: managers.join('; '), labelUsers: extraLabelUsers };
    saveOneArtist(updated);
    setEditingManagement(null);
    setMgmtInput('');
  };

  // Management edit modal
  if (editingManagement) {
    const allLabelUsers = Object.keys(getLabelUsers());

    return (
      <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
        <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
          <button onClick={() => setEditingManagement(null)} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>{editingManagement.name}</div>
          <div style={{width:'60px'}}/>
        </div>

        <div style={{flex:1, overflowY:'auto', padding:'32px 24px'}}>
          {/* Management */}
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Management</div>
            <input value={mgmtInput} onChange={e => setMgmtInput(e.target.value)}
              placeholder="Nombre del manager"
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'18px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}/>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, marginTop:'6px'}}>Separa con ; para añadir más de un manager</div>
          </div>

          {/* Label co-owners */}
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Label Managers con acceso</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {allLabelUsers.map(name => {
                const isSelected = selectedLabels.includes(name);
                return (
                  <button key={name} onClick={() => toggleLabel(name)}
                    style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: isSelected ? t.text : t.bg2, border:`1px solid ${isSelected ? t.text : t.border}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'}}>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color: isSelected ? t.bg : t.text}}>{name}</span>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color: isSelected ? t.bg : t.text3}}>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
          <button onClick={() => handleSaveManagement(selectedLabels)}
            style={{display:'block', width:'100%', padding:'17px', background:t.text, color:t.bg, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
            Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>
          {editMode ? 'Cancelar' : '← Atrás'}
        </button>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>Roster</div>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          {canEdit && !editMode && (
            <button onClick={() => setEditMode(true)}
              style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"14px", cursor:"pointer", padding:0 }}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{ background:"transparent", border:"none", color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"700", cursor: selected.length > 0 ? "pointer" : "default", padding:0 }}>
              Eliminar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            <button onClick={onCreate}
              style={{ background:"transparent", border:"none", color:t.accent, fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer", padding:0 }}>
              + Nuevo
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px" }}>
        {artists.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            <div style={{ fontSize:"56px", marginBottom:"20px" }}>🎤</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:t.text, marginBottom:"10px" }}>No tienes artistas en tu Roster todavía</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"14px", color:t.text2, marginBottom:"32px", maxWidth:"260px", lineHeight:"1.5" }}>Añade tu primer artista al Roster para empezar a evaluar</div>
            <button onClick={onCreate} style={{ padding:"16px 32px", background:t.accent, color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
              + Nuevo artista
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {artists.map((artist, i) => (
              <button key={artist.id || i}
                onClick={() => editMode ? toggleSelect(artist.id) : onSelect(artist)}
                style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px", background:t.card, border:`1px solid ${editMode && selected.includes(artist.id) ? '#E8151B' : t.border}`, borderRadius:"16px", cursor:"pointer", textAlign:"left", width:"100%", boxShadow:`0 2px 8px ${t.shadow}` }}>

                {/* Checkbox in edit mode */}
                {editMode && (
                  <div style={{ width:"22px", height:"22px", borderRadius:"50%", border:`2px solid ${selected.includes(artist.id) ? '#E8151B' : t.border}`, background: selected.includes(artist.id) ? '#E8151B' : 'transparent', display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {selected.includes(artist.id) && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                  </div>
                )}

                {artist.photo ? (
                  <img src={artist.photo} alt="" style={{ width:"48px", height:"48px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:t.bg2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"22px" }}>🎤</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:t.text, marginBottom:"2px" }}>{artist.name}</div>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text2 }}>
                    {(artist.labelUsers?.length > 0 ? artist.labelUsers : [artist.labelUser].filter(Boolean)).join(', ') || "Sin label manager"}
                  </div>
                </div>
                {!editMode && (() => {
                  const ans = artist.answers || {};
                  const answered = Object.keys(ans).length;
                  if (answered === 0) return null;
                  const score = Math.round(calcTotalScore(ARTIST_BLOCKS, ans) * 10) / 10;
                  return <div style={{ fontFamily:"Arial,sans-serif", fontSize:"18px", fontWeight:"700", color:scoreColor(score), flexShrink:0, marginRight:'4px' }}>{score}</div>;
                })()}
                {!editMode && canEdit && (
                  <button onClick={e => { e.stopPropagation(); setEditingManagement(artist); setMgmtInput(artist.management || ''); }}
                    style={{ background:"transparent", border:"none", color:t.text3, fontFamily:"Arial,sans-serif", fontSize:"12px", cursor:"pointer", padding:"4px 8px", flexShrink:0 }}>
                    ✎
                  </button>
                )}
                {!editMode && <div style={{ color:t.text3, fontSize:"18px" }}>›</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT (SONG) LIST SCREEN
// ═══════════════════════════════════════════
function ProjectListScreen({ profile, onBack, onCreate, onSelect }) {
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
  const allProjects = _projects
    .filter(p => myArtistIds.has(p.artistId))
    .map(p => {
      const artist = myArtists.find(a => a.id === p.artistId);
      return { ...p, artistName: artist?.name || p.artistName, artistPhoto: artist?.photo || null };
    })
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
function NewArtistForm({ profile, onBack, onSave }) {
  const t = theme(isDark());
  const [step, setStep] = useState(1); // 1=nombre, 2=management, 3=label managers, 4=foto
  const [artistName, setArtistName] = useState('');
  const [management, setManagement] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([profile.name].filter(Boolean));
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const allLabelUsers = Object.keys(getLabelUsers());

  const toggleLabel = (name) => setSelectedLabels(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    const managers = management.split(';').map(m => m.trim()).filter(Boolean);
    if (managers.length > 0) {
      try {
        const existing = getMgmtUsers();
        managers.forEach(m => { existing[m] = true; });
        saveMgmtUsers(existing);
      } catch(e) {}
    }
    // Auto-register artist as a user profile
    registerArtistUser(artistName.trim());
    onSave({
      name: artistName.trim(),
      management: managers.join('; '),
      photo,
      labelUser: profile.name,
      labelUsers: selectedLabels.filter(n => n === profile.name || allLabelUsers.includes(n)),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
  };

  const steps = ['Nombre', 'Management', 'Label', 'Foto'];
  const canNext = step === 1 ? !!artistName.trim() : true;

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      {/* Topbar */}
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => step > 1 ? setStep(s => s-1) : onBack()}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>{steps[step-1]}</div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text3}}>{step}/4</div>
      </div>

      {/* Progress dots */}
      <div style={{display:'flex', justifyContent:'center', gap:'6px', padding:'16px 0 0'}}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{width: i === step ? '20px' : '6px', height:'6px', borderRadius:'3px', background: i <= step ? t.text : t.border, transition:'all 0.3s ease'}}/>
        ))}
      </div>

      {/* Step content */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 32px'}}>

        {step === 1 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && artistName.trim() && setStep(2)}
              placeholder="Nombre del artista"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={management}
              onChange={e => setManagement(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setStep(3)}
              placeholder="Management"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, textAlign:'center', marginTop:'10px'}}>Separa con ; para añadir más de un manager</div>
          </div>
        )}

        {step === 3 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={selectedLabels.filter(n => n !== profile.name).join('; ')}
              onChange={e => {
                const names = e.target.value.split(';').map(m => m.trim()).filter(Boolean);
                setSelectedLabels([profile.name, ...names]);
              }}
              onKeyDown={e => e.key === 'Enter' && setStep(4)}
              placeholder="Otro label manager"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, textAlign:'center', marginTop:'10px'}}>Separa con ; para añadir más de uno</div>
            {/* Validate — show warning if name doesn't exist */}
            {selectedLabels.filter(n => n !== profile.name).map(name => {
              const exists = allLabelUsers.includes(name);
              return (
                <div key={name} style={{fontFamily:'Arial,sans-serif', fontSize:'12px', marginTop:'8px', textAlign:'center', color: exists ? '#16a34a' : '#E8151B'}}>
                  {name}: {exists ? '✓ encontrado' : '✗ no existe como Label Manager'}
                </div>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'24px'}}>
            <div onClick={() => fileRef.current.click()}
              style={{width:'120px', height:'120px', borderRadius:'50%', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
              {photo
                ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                : <span style={{fontSize:'36px'}}>📷</span>
              }
            </div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text3}}>
              {photo ? 'Toca para cambiar' : 'Toca para añadir foto'}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
          </div>
        )}

      </div>

      {/* Bottom button */}
      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        {step < 4 ? (
          <button onClick={() => canNext && setStep(s => s+1)}
            style={{display:'block', width:'100%', padding:'17px', background: canNext ? t.text : t.bg2, color: canNext ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: canNext ? 'pointer' : 'default', transition:'all 0.2s'}}>
            Siguiente →
          </button>
        ) : (
          <button onClick={handleSave}
            style={{display:'block', width:'100%', padding:'17px', background:t.text, color:t.bg, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
            Crear artista
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT FORM — with artist linkage
// ═══════════════════════════════════════════
function ProjectForm({ profile, songNum, onBack, onSubmit, prefilledArtist }) {
  const t = theme(isDark());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [participants, setParticipants] = useState('');
  const [artistInput, setArtistInput] = useState(prefilledArtist?.name || '');
  const [linkedArtist, setLinkedArtist] = useState(prefilledArtist || null);
  const [artistError, setArtistError] = useState('');

  const allArtists = getArtists();

  const handleArtistChange = (val) => {
    setArtistInput(val);
    setArtistError('');
    const found = allArtists.find(a => a.name && a.name.toLowerCase() === val.toLowerCase());
    setLinkedArtist(found || null);
    if (val.trim() && !found) setArtistError('Artista no encontrado');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, date, participants, artistName: linkedArtist?.name || artistInput, linkedArtist });
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Nuevo proyecto</div>
        <div style={{width:'60px'}}/>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Artista */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Artista</div>
          <input
            value={artistInput}
            onChange={e => handleArtistChange(e.target.value)}
            placeholder="Nombre del artista"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${artistError ? '#E8151B' : linkedArtist ? '#16a34a' : t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
          {linkedArtist && (
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#16a34a', marginTop:'6px', display:'flex', alignItems:'center', gap:'6px'}}>
              {linkedArtist.photo && <img src={linkedArtist.photo} alt="" style={{width:'20px', height:'20px', borderRadius:'50%', objectFit:'cover'}}/>}
              ✓ Vinculado a {linkedArtist.name}
            </div>
          )}
          {artistError && <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#E8151B', marginTop:'6px'}}>{artistError}</div>}
        </div>

        {/* Título */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Título *</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título del proyecto"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Fecha */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Fecha de lanzamiento</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Participantes */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Participantes / Featurings</div>
          <input
            value={participants}
            onChange={e => setParticipants(e.target.value)}
            placeholder="Nombres separados por coma"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSubmit} disabled={!title.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: title.trim() ? t.text : t.bg2, color: title.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT HOME SCREEN — hexagon nav for songs
// ═══════════════════════════════════════════
function ProjectHomeScreen({ songData, songAnswers, onBlock, onResult, onBack, onEdit, onPending }) {
  const t = theme(isDark());
  const rad = (deg) => deg * Math.PI / 180;

  const vertices = [
    { id:'result',    label:'Total',     angle: -90 },
    { id:'social',    label:'Social',    angle: -30 },
    { id:'ytvideo',   label:'Video',     angle:  30 },
    { id:'rights',    label:'Rights',    angle:  90 },
    { id:'authority', label:'Authority', angle: 150 },
    { id:'dsps',      label:'DSPs',      angle: 210 },
  ];

  const S = 340, cx = S/2, cy = S/2, R = 120;

  const getBlockScore = (id) => {
    if (id === 'result') {
      return Math.round(calcTotalScore(SONG_BLOCKS, songAnswers) * 10) / 10;
    }
    const block = SONG_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const hasAnswers = block.subcats.some(s => s.items.some(i => songAnswers[i.id] !== undefined));
    return hasAnswers ? Math.round(calcBlockScore(block, songAnswers) * 10) / 10 : null;
  };

  const hexPoints = vertices.map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));

  const sortedPoints = [...vertices].sort((a,b) => a.angle - b.angle).map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));

  const dataPolygon = (() => {
    const sorted = [...vertices].sort((a, b) => a.angle - b.angle);
    const pts = sorted.map(v => {
      const score = getBlockScore(v.id);
      if (score === null) return null;
      const pct = Math.max(0.01, score / 100);
      return { x: cx + R * pct * Math.cos(rad(v.angle)), y: cy + R * pct * Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      {/* Title */}
      <div style={{padding:'32px 24px 0', paddingTop:'max(32px,env(safe-area-inset-top,32px))', textAlign:'center'}}>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', fontWeight:'600', color:t.text3, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px'}}>Catálogo</div>
        <button onClick={onEdit} style={{background:'transparent', border:'none', cursor:'pointer', padding:'4px 12px', borderRadius:'12px', display:'inline-flex', alignItems:'center', gap:'8px'}}>
          {songData?.photo && (
            <img src={songData.photo} alt="" style={{width:'32px', height:'32px', borderRadius:'8px', objectFit:'cover', flexShrink:0}}/>
          )}
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:t.text, lineHeight:1}}>{songData?.title || 'Sin título'}</div>
            {songData?.artistName && (
              <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginTop:'2px'}}>{songData.artistName}</div>
            )}
          </div>
          <span style={{fontSize:'14px', color:t.text3}}>✎</span>
        </button>
      </div>

      {/* Hexagon */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
        <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0, pointerEvents:'none'}}>
            {[0.33, 0.66, 1].map((scale, ri) => {
              const pts = sortedPoints.map(p => ({ x: cx+(p.x-cx)*scale, y: cy+(p.y-cy)*scale }));
              const path = pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
              return <path key={ri} d={path} fill="none" stroke={t.border} strokeWidth="1"/>;
            })}
            {sortedPoints.map((p,i) => (
              <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>
            ))}
            {dataPolygon && <path d={dataPolygon} fill="rgba(232,21,27,0.15)" stroke="#E8151B" strokeWidth="2" strokeLinejoin="round"/>}
            {vertices.map(v => {
              const score = getBlockScore(v.id);
              if (!score) return null;
              const pct = score / 100;
              const px = cx + R * pct * Math.cos(rad(v.angle));
              const py = cy + R * pct * Math.sin(rad(v.angle));
              return <circle key={v.id} cx={px.toFixed(1)} cy={py.toFixed(1)} r="4" fill="#E8151B"/>;
            })}
          </svg>

          {vertices.map(v => {
            const px = cx + R * Math.cos(rad(v.angle));
            const py = cy + R * Math.sin(rad(v.angle));
            const score = getBlockScore(v.id);
            const isResult = v.id === 'result';
            const hasScore = score !== null;
            return (
              <button key={v.id} onClick={() => isResult ? onResult() : onBlock(v.id)}
                style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                  background: isResult ? t.accent : hasScore ? t.text : t.bg,
                  border:`1.5px solid ${isResult ? t.accent : hasScore ? t.text : t.border}`,
                  borderRadius:'20px', padding:'6px 12px', cursor:'pointer', minWidth:'62px',
                  boxShadow: hasScore||isResult ? `0 2px 10px ${t.shadow}` : 'none', transition:'all 0.2s'}}>
                {!isResult && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'9px', fontWeight:'700',
                    color: hasScore ? t.bg : t.text2, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap'}}>
                    {v.label}
                  </div>
                )}
                {(hasScore || isResult) && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize: isResult ? '20px' : '12px',
                    fontWeight:'700', color: isResult?'#fff':t.bg, lineHeight:1}}>{score}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back button */}
      <div style={{padding:'12px 32px', paddingBottom:'max(24px,env(safe-area-inset-bottom,24px))', display:'flex', flexDirection:'column', gap:'10px'}}>
        <button onClick={onPending}
          style={{width:'100%', padding:'15px', background:t.bg2, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
          <span style={{fontSize:'16px'}}>📋</span> Tareas pendientes
        </button>
        <button onClick={onBack}
          style={{display:'block', width:'100%', padding:'17px', background:'transparent', border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'600', color:t.text2, cursor:'pointer'}}>
          ← Catálogo
        </button>
      </div>
    </div>
  );
}

function ArtistCatalogueScreen({ artistData, profile, onBack, onNewProject, onOpenProject, liveArtists }) {
  const t = theme(isDark());
  useFirebaseStore(); // re-render on Firebase changes
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);

  const allArtists = getArtists();
  // Always read fresh from store — artistData prop may be stale
  const liveArtist = _artistsMeta.find(a => a.id === artistData?.id) || artistData;
  const linkedProjects = _projects
    .filter(p => p.artistId === artistData?.id)
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.date ? new Date(b.date) : b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

  const isLabelOrAdmin = profile?.type === 'label' || profile?.type === 'admin';

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleDelete = () => {
    selected.forEach(id => deleteProjectById(id));
    setSelected([]);
    setEditMode(false);
  };

  // Calculate catalogue block scores (avg across all projects)
  const rad = (deg) => deg * Math.PI / 180;
  const songVerts = [
    {id:'result',label:'Resultado',angle:-90},{id:'social',label:'Social',angle:-30},
    {id:'ytvideo',label:'Video',angle:30},{id:'rights',label:'Rights',angle:90},
    {id:'authority',label:'Authority',angle:150},{id:'dsps',label:'DSPs',angle:210},
  ];
  const getCatBlockScore = (id) => {
    const projects = linkedProjects.filter(p => p.answers && Object.keys(p.answers).length > 0);
    if (projects.length === 0) return null;
    if (id === 'result') {
      const scores = projects.map(p => calcTotalScore(SONG_BLOCKS, p.answers));
      return Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10;
    }
    const block = SONG_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const scores = projects.map(p => {
      const has = block.subcats.some(s => s.items.some(i => p.answers[i.id] !== undefined));
      return has ? calcBlockScore(block, p.answers) : null;
    }).filter(s => s !== null);
    return scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10 : null;
  };
  const catAvg = getCatBlockScore('result');
  const S = Math.min(window.innerWidth * 0.86, 360), cxh = S/2, cyh = S/2, R = S * 0.30;
  const hexPts = songVerts.map(v => ({x: cxh + R*Math.cos(rad(v.angle)), y: cyh + R*Math.sin(rad(v.angle))}));
  const catDataPoly = (() => {
    const pts = [...songVerts].sort((a,b)=>a.angle-b.angle).map(v => {
      const s = getCatBlockScore(v.id); if (s===null) return null;
      const p = Math.max(0.01, s/100);
      return {x: cxh + R*p*Math.cos(rad(v.angle)), y: cyh + R*p*Math.sin(rad(v.angle))};
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>
          {editMode ? 'Cancelar' : '← Volver'}
        </button>
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Catálogo</div>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3}}>{artistData.name}</div>
        </div>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          {!editMode && linkedProjects.length > 0 && (
            <button onClick={() => setEditMode(true)}
              style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', padding:0}}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{background:'transparent', border:'none', color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', cursor: selected.length > 0 ? 'pointer' : 'default', padding:0}}>
              Borrar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            isLabelOrAdmin
              ? <button onClick={onNewProject} style={{background:'transparent', border:'none', color:t.accent, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor:'pointer', padding:0}}>+ Nuevo</button>
              : <div style={{width:'50px'}}/>
          )}
        </div>
      </div>

      {/* Catalogue hexagon — shown when there are projects with answers */}
      {catAvg !== null && (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 20px 0', borderBottom:`1px solid ${t.border}`}}>
          <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
            <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0}}>
              {[0.33,0.66,1].map((sc,ri) => {
                const ps = hexPts.map(p => ({x:cxh+(p.x-cxh)*sc, y:cyh+(p.y-cyh)*sc}));
                return <path key={ri} d={ps.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z'} fill="none" stroke={t.border} strokeWidth="1"/>;
              })}
              {hexPts.map((p,i) => <line key={i} x1={cxh} y1={cyh} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>)}
              {catDataPoly && <path d={catDataPoly} fill="rgba(232,21,27,0.12)" stroke="#E8151B" strokeWidth="1.5" strokeLinejoin="round"/>}
            </svg>
            {/* Vertex labels */}
            {songVerts.map(v => {
              const s = getCatBlockScore(v.id);
              const px = cxh + R * Math.cos(rad(v.angle));
              const py = cyh + R * Math.sin(rad(v.angle));
              const isRes = v.id === 'result';
              if (isRes) return (
                <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  background:t.accent, borderRadius:'16px', padding:'4px 12px',
                  fontFamily:'Arial,sans-serif', fontSize:'18px', fontWeight:'700', color:'#fff', pointerEvents:'none'}}>
                  {s}
                </div>
              );
              return (
                <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  background: s!==null ? t.text : t.bg2, border:`1px solid ${s!==null ? t.text : t.border}`,
                  borderRadius:'12px', padding:'3px 7px', textAlign:'center', pointerEvents:'none', whiteSpace:'nowrap'}}>
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'8px', fontWeight:'700', color: s!==null ? t.bg : t.text3, letterSpacing:'0.05em', textTransform:'uppercase'}}>{v.label}</div>
                  {s!==null && <div style={{fontFamily:'Arial,sans-serif', fontSize:'10px', fontWeight:'700', color:t.bg, lineHeight:1}}>{s}</div>}
                </div>
              );
            })}
          </div>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3, marginBottom:'12px'}}>{linkedProjects.filter(p=>p.answers&&Object.keys(p.answers).length>0).length} proyectos evaluados</div>
        </div>
      )}

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {linkedProjects.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Vacío</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3, marginBottom:'32px'}}>No hay proyectos asignados a {artistData.name}</div>
            {isLabelOrAdmin && (
              <button onClick={onNewProject} style={{padding:'16px 32px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', cursor:'pointer'}}>
                + Nuevo proyecto
              </button>
            )}
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {linkedProjects.map((p, i) => {
              const isSelected = selected.includes(p.id);
              return (
                <button key={p.id || i}
                  onClick={() => {
                    if (editMode) { toggleSelect(p.id); return; }
                    onOpenProject(p);
                  }}
                  style={{display:'flex', alignItems:'center', gap:'14px', padding:'16px', background:t.card, border:`1px solid ${editMode && isSelected ? '#E8151B' : t.border}`, borderRadius:'16px', cursor:'pointer', textAlign:'left', width:'100%', boxShadow:`0 2px 8px ${t.shadow}`, transition:'border-color 0.15s'}}>
                  {editMode && (
                    <div style={{width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${isSelected ? '#E8151B' : t.border}`, background: isSelected ? '#E8151B' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s'}}>
                      {isSelected && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                    </div>
                  )}
                  {p.photo ? (
                    <img src={p.photo} alt="" style={{width:'48px', height:'48px', borderRadius:'10px', objectFit:'cover', flexShrink:0}}/>
                  ) : (
                    <div style={{width:'48px', height:'48px', borderRadius:'10px', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'22px'}}>🎵</div>
                  )}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text, marginBottom:'2px'}}>{p.title || 'Sin título'}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text2}}>{p.date || 'Sin fecha'}</div>
                  </div>
                  {!editMode && (() => {
                    const liveScore = p.score !== undefined ? p.score : (p.answers && Object.keys(p.answers).length > 0 ? Math.round(calcTotalScore(SONG_BLOCKS, p.answers) * 10) / 10 : null);
                    return liveScore !== null ? (
                      <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:scoreColor(liveScore), flexShrink:0}}>{liveScore}</div>
                    ) : null;
                  })()}
                  {!editMode && <div style={{color:t.text3, fontSize:'18px'}}>›</div>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════
// CLIENTS LIST SCREEN — all managers
// ═══════════════════════════════════════════
function ClientsListScreen({ onBack, onSelectArtist, liveArtists }) {
  const t = theme(isDark());

  // Collect all unique managers from all artists
  const allArtists = liveArtists || getArtists();
  const clientMap = {};
  allArtists.forEach(a => {
    if (!a.management) return;
    const managers = a.management.split(';').map(m => m.trim()).filter(Boolean);
    managers.forEach(m => {
      if (!clientMap[m]) clientMap[m] = [];
      clientMap[m].push(a);
    });
  });
  const clients = Object.entries(clientMap).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Clientes</div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{clients.length}</div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {clients.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Sin clientes</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3}}>Cuando añadas management a tus artistas aparecerán aquí</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {clients.map(([managerName, artists]) => (
              <div key={managerName} style={{padding:'16px', background:t.card, border:`1px solid ${t.border}`, borderRadius:'14px', boxShadow:`0 2px 8px ${t.shadow}`}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom: artists.length > 0 ? '12px' : 0}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'18px'}}>🤝</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text}}>{managerName}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{artists.length} artista{artists.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {artists.length > 0 && (
                  <div style={{display:'flex', flexWrap:'wrap', gap:'6px', paddingLeft:'52px'}}>
                    {artists.map(a => (
                      <button key={a.id} onClick={() => onSelectArtist(a)}
                        style={{display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px', background:t.bg2, border:`1px solid ${t.border}`, borderRadius:'20px', cursor:'pointer'}}>
                        {a.photo && <img src={a.photo} alt="" style={{width:'18px', height:'18px', borderRadius:'50%', objectFit:'cover'}}/>}
                        <span style={{fontFamily:'Arial,sans-serif', fontSize:'12px', fontWeight:'600', color:t.text}}>{a.name}</span>
                        <span style={{color:t.text3, fontSize:'10px'}}>›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// LABEL MANAGERS LIST SCREEN
// ═══════════════════════════════════════════
function LabelManagersListScreen({ onBack, onNew }) {
  const t = theme(isDark());
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [managers, setManagers] = useState(() => Object.keys(getLabelUsers()));

  const toggleSelect = (name) => setSelected(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleDelete = () => {
    const users = getLabelUsers();
    selected.forEach(name => { delete users[name]; });
    saveLabelUsers(users);
    setManagers(Object.keys(getLabelUsers()));
    setSelected([]);
    setEditMode(false);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>
          {editMode ? 'Cancelar' : '← Atrás'}
        </button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Label Managers</div>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          {!editMode && managers.length > 0 && (
            <button onClick={() => setEditMode(true)}
              style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', padding:0}}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{background:'transparent', border:'none', color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', cursor: selected.length > 0 ? 'pointer' : 'default', padding:0}}>
              Borrar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            <button onClick={onNew}
              style={{background:'transparent', border:'none', color:t.accent, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor:'pointer', padding:0}}>
              + Nuevo
            </button>
          )}
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {managers.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Sin Label Managers</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3, marginBottom:'32px'}}>Añade el primero con el botón de arriba</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {managers.map((name, i) => {
              const isSelected = selected.includes(name);
              const artistCount = getArtists().filter(a =>
                (a.labelUsers && a.labelUsers.includes(name)) || a.labelUser === name
              ).length;
              return (
                <button key={i}
                  onClick={() => editMode && toggleSelect(name)}
                  style={{display:'flex', alignItems:'center', gap:'14px', padding:'16px', background:t.card, border:`1px solid ${editMode && isSelected ? '#E8151B' : t.border}`, borderRadius:'14px', cursor: editMode ? 'pointer' : 'default', textAlign:'left', width:'100%', boxShadow:`0 2px 8px ${t.shadow}`, transition:'border-color 0.15s'}}>
                  {editMode && (
                    <div style={{width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${isSelected ? '#E8151B' : t.border}`, background: isSelected ? '#E8151B' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      {isSelected && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                    </div>
                  )}
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'18px'}}>👤</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text}}>{name}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{artistCount} artista{artistCount !== 1 ? 's' : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NEW LABEL MANAGER SCREEN
// ═══════════════════════════════════════════
function NewLabelManagerScreen({ onBack, onDone }) {
  const t = theme(isDark());
  const [newName, setNewName] = useState('');
  const [done, setDone] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const users = getLabelUsers();
    users[newName.trim()] = true;
    saveLabelUsers(users);
    setDone(true);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px'}}>
      <div style={{width:'100%', maxWidth:'360px'}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', marginBottom:'32px', padding:0}}>← Atrás</button>
        {done ? (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>✅</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Creado</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginBottom:'24px'}}><strong>{newName}</strong> ya puede entrar como Label Manager</div>
            <button onClick={onDone} style={{display:'block', width:'100%', padding:'16px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', cursor:'pointer'}}>Volver al inicio</button>
          </div>
        ) : (
          <>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Nuevo Label Manager</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginBottom:'28px'}}>Escribe el nombre con el que entrará.</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Nombre del Label Manager"
              autoFocus
              style={{display:'block', width:'100%', background:t.bg2, border:`1.5px solid ${t.border}`, borderRadius:'12px', padding:'16px 18px', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', marginBottom:'16px', WebkitAppearance:'none', boxSizing:'border-box'}}
            />
            <button onClick={handleCreate} style={{display:'block', width:'100%', padding:'17px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
              Crear →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ARTIST EDIT SCREEN
// ═══════════════════════════════════════════
function ArtistEditScreen({ artistData, onBack, onSave }) {
  const t = theme(isDark());
  const [name, setName] = useState(artistData.name || '');
  const [management, setManagement] = useState(artistData.management || '');
  const [photo, setPhoto] = useState(artistData.photo || null);
  const [selectedLabels, setSelectedLabels] = useState(
    artistData.labelUsers || [artistData.labelUser].filter(Boolean)
  );
  const fileRef = useRef();

  const allLabelUsers = Object.keys(getLabelUsers());

  const toggleLabel = (n) => setSelectedLabels(prev =>
    prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
  );

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const managers = management.split(';').map(m => m.trim()).filter(Boolean);
    if (managers.length > 0) {
      try {
        const existing = getMgmtUsers();
        managers.forEach(m => { existing[m] = true; });
        saveMgmtUsers(existing);
      } catch(e) {}
    }
    const updated = {
      ...artistData,
      name: name.trim(),
      management: managers.join('; '),
      photo,
      labelUsers: selectedLabels,
      labelUser: selectedLabels[0] || artistData.labelUser,
    };
    saveOneArtist(updated);
    onSave(updated);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Cancelar</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Editar artista</div>
        <button onClick={handleSave} disabled={!name.trim()} style={{background:'transparent', border:'none', color: name.trim() ? t.accent : t.text3, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor: name.trim() ? 'pointer' : 'default', padding:0}}>Guardar</button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Photo */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:'36px'}}>
          <div onClick={() => fileRef.current.click()}
            style={{width:'90px', height:'90px', borderRadius:'50%', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
            {photo
              ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              : <span style={{fontSize:'28px'}}>📷</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        </div>

        {/* Name */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Nombre *</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del artista"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Management */}
        <div style={{marginBottom:'32px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Management</div>
          <input
            value={management}
            onChange={e => setManagement(e.target.value)}
            placeholder="Nombre del manager"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, marginTop:'6px'}}>Separa con ; para más de un manager</div>
        </div>

        {/* Label Managers */}
        {allLabelUsers.length > 0 && (
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Label Managers con acceso</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {allLabelUsers.map(n => {
                const isSelected = selectedLabels.includes(n);
                return (
                  <button key={n} onClick={() => toggleLabel(n)}
                    style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: isSelected ? t.text : t.bg2, border:`1px solid ${isSelected ? t.text : t.border}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'}}>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color: isSelected ? t.bg : t.text}}>{n}</span>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color: isSelected ? t.bg : t.text3}}>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSave} disabled={!name.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: name.trim() ? t.text : t.bg2, color: name.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: name.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT EDIT SCREEN
// ═══════════════════════════════════════════
function ProjectEditScreen({ songData, onBack, onSave }) {
  const t = theme(isDark());
  const [title, setTitle] = useState(songData?.title || '');
  const [date, setDate] = useState(songData?.date || '');
  const [participants, setParticipants] = useState(songData?.participants || '');
  const [photo, setPhoto] = useState(songData?.photo || null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...songData, title: title.trim(), date, participants, photo });
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Cancelar</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Editar proyecto</div>
        <button onClick={handleSave} disabled={!title.trim()} style={{background:'transparent', border:'none', color: title.trim() ? t.accent : t.text3, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', padding:0}}>Guardar</button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Photo */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:'36px'}}>
          <div onClick={() => fileRef.current.click()}
            style={{width:'90px', height:'90px', borderRadius:'14px', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
            {photo
              ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              : <span style={{fontSize:'28px'}}>🎵</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        </div>

        {/* Title */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Título *</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nombre del proyecto"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Artista (read-only) */}
        {songData?.artistName && (
          <div style={{marginBottom:'28px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Artista</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text2, padding:'10px 0', borderBottom:`1.5px solid ${t.border}`}}>{songData.artistName}</div>
          </div>
        )}

        {/* Release date */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Fecha de lanzamiento</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Participants */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Participantes</div>
          <input
            value={participants}
            onChange={e => setParticipants(e.target.value)}
            placeholder="Productores, feats, etc."
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSave} disabled={!title.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: title.trim() ? t.text : t.bg2, color: title.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

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
      if (saved && saved.phase && saved.phase !== "welcome") {
      }
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
