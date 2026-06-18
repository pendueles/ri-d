// components/screens/ArtistProfileScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { ARTIST_BLOCKS } from "../../data/questions";
import { getPendingTasks } from "../../utils/helpers";

function KpiCard({ label, value, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: '#ffffff',
        border: '1px solid #EAEAEA',
        borderRadius: '20px',
        padding: '20px',
        cursor: 'pointer',
        boxShadow: hover ? '0 8px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
      }}>
      <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '28px', fontWeight: '700', color: '#0a0a0a' }}>
        {value !== null ? value : '—'}
      </div>
    </button>
  );
}

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

  // Areas shown as KPI cards below the hexagon, in this exact order
  const areaCards = [
    { id: 'dsps',      label: 'DSPs' },
    { id: 'social',    label: 'Social' },
    { id: 'authority', label: 'Authority' },
    { id: 'ytvideo',   label: 'Video' },
    { id: 'rights',    label: 'Rights' },
  ];

  const pendingCount = getPendingTasks(ARTIST_BLOCKS, artistAnswers).length;

  return (
    <div style={{minHeight:'100dvh', background:'#ffffff', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:'#aaaaaa', fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Volver</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:'#0a0a0a'}}>Perfil · {artistData.name}</div>
        <div style={{width:'60px'}}/>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'20px 20px 32px', maxWidth:'480px', width:'100%', margin:'0 auto'}}>

        {/* Pending tasks KPI card — above the hexagon */}
        {onPending && (
          <div style={{marginBottom:'20px'}}>
            <KpiCard label="Tareas pendientes" value={pendingCount} onClick={onPending} />
          </div>
        )}

        {/* RI+D hexagon — kept exactly as-is */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 0'}}>
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

        {/* Area KPI cards — DSPs, Social, Authority, Video, Rights, in that order */}
        <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'24px'}}>
          {areaCards.map(area => (
            <KpiCard key={area.id} label={area.label} value={getBlockScore(area.id)} onClick={() => onBlock(area.id)} />
          ))}
        </div>

      </div>
    </div>
  );
}
