// components/screens/ProjectHomeScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { SONG_BLOCKS } from "../../data/questions";
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

  // Pending tasks for the whole song
  const pendingCount = getPendingTasks(SONG_BLOCKS, songAnswers).length;

  // Area KPI cards — DSPs, Social, Authority, Video, Rights, in that order
  const areaCards = [
    { id: 'dsps',      label: 'DSPs' },
    { id: 'social',    label: 'Social' },
    { id: 'authority', label: 'Authority' },
    { id: 'ytvideo',   label: 'Video' },
    { id: 'rights',    label: 'Rights' },
  ];

  return (
    <div style={{minHeight:'100dvh', background:'#ffffff', display:'flex', flexDirection:'column'}}>

      {/* Back button — top left, discreet, same language as the rest of the app */}
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))'}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:'#aaaaaa', fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>
          ← Volver
        </button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'0 20px 32px', maxWidth:'480px', width:'100%', margin:'0 auto'}}>

        {/* Title */}
        <div style={{textAlign:'center', marginBottom:'8px'}}>
          <button onClick={onEdit} style={{background:'transparent', border:'none', cursor:'pointer', padding:'4px 12px', borderRadius:'12px', display:'inline-flex', alignItems:'center', gap:'8px'}}>
            {songData?.photo && (
              <img src={songData.photo} alt="" style={{width:'32px', height:'32px', borderRadius:'8px', objectFit:'cover', flexShrink:0}}/>
            )}
            <div style={{textAlign:'left'}}>
              <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:'#0a0a0a', lineHeight:1}}>{songData?.title || 'Sin título'}</div>
              {songData?.artistName && (
                <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:'#aaaaaa', marginTop:'2px'}}>{songData.artistName}</div>
              )}
            </div>
            <span style={{fontSize:'14px', color:'#aaaaaa'}}>✎</span>
          </button>
        </div>

        {/* Pending tasks KPI card — above the hexagon */}
        {onPending && (
          <div style={{marginTop:'20px'}}>
            <KpiCard label="Tareas pendientes" value={pendingCount} onClick={onPending} />
          </div>
        )}

        {/* Hexagon — kept as-is */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 0'}}>
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
                if (score === null) return null;
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

        {/* Area KPI cards — DSPs, Social, Authority, Video, Rights, in that order */}
        <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'8px'}}>
          {areaCards.map(area => (
            <KpiCard key={area.id} label={area.label} value={getBlockScore(area.id)} onClick={() => onBlock(area.id)} />
          ))}
        </div>

      </div>
    </div>
  );
}
