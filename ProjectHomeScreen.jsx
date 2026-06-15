// components/screens/ProjectHomeScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { SONG_BLOCKS } from "../../data/questions";

export default function ProjectHomeScreen({ songData, songAnswers, onBlock, onResult, onBack, onEdit, onPending }) {
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
