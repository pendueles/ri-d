// components/screens/BlockHomeScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore } from "../../utils/scoring";

export default function BlockHomeScreen({ block, artistAnswers, onSubcat, onBack, artistName, onGoHome }) {
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
