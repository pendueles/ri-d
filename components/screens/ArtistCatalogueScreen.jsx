// components/screens/ArtistCatalogueScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { scoreColor } from "../../utils/helpers";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { getArtists } from "../../firebase/store";
import { SONG_BLOCKS } from "../../data/questions";

export default function ArtistCatalogueScreen({ artistData, profile, onBack, onNewProject, onOpenProject, liveArtists }) {
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
