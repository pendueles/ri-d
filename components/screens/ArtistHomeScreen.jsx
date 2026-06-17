// components/screens/ArtistHomeScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { ARTIST_BLOCKS, SONG_BLOCKS } from "../../data/questions";
import { getArtists, useFirebaseStore } from "../../firebase/store";

export default function ArtistHomeScreen({ artistData, artistAnswers, onBlock, onResult, onBack, profile, onCatalogue, onNewProject, onEdit, onPending, onProfile }) {
  const t = theme(isDark());
  useFirebaseStore(); // re-render on Firebase changes

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
        const liveArtist = getArtists().find(a => a.id === artistData?.id);
        const artistProjects = (liveArtist?.projects || []).filter(p => p.artistId === artistData?.id);
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
