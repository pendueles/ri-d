// components/screens/ArtistProfileScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { ARTIST_BLOCKS } from "../../data/questions";

export default function ArtistProfileScreen({ artistData, artistAnswers, onBack, onBlock, onResult, onPending }) {
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
