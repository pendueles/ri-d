// components/screens/BlockHomeScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { calcBlockScore } from "../../utils/scoring";
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

export default function BlockHomeScreen({ block, artistAnswers, onSubcat, onBack, artistName, onGoHome, onPending, mode = 'artist' }) {
  const t = theme(isDark());
  const rad = (deg) => deg * Math.PI / 180;
  const isSong = mode === 'song';

  // Map subcats to hexagon vertices based on block id AND mode
  const getVertices = () => {
    if (!isSong) {
      // ARTIST mode
      if (block.id === 'dsps') return [
        { id:'result',       label:'Total',                 angle: -90  },
        { id:'spotify',      label:'Spotify',               angle: -150 },
        { id:'apple',        label:'Apple Music',           angle: -30  },
        { id:'otherdsps',    label:'Other DSPs',            angle:  30  },
        { id:'soundcloud',   label:'SoundCloud & Beatport', angle:  90  },
        { id:'ytmusic',      label:'YT Music',              angle:  150 },
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
        { id:'result',      label:'Puntuación',    angle: -90  },
        { id:'wikipedia',   label:'Wikipedia',     angle: -30  },
        { id:'musicbrainz', label:'MusicBrainz',   angle:  30  },
        { id:'composer',    label:'Composer',      angle:  90  },
        { id:'googlepanel', label:'Google Panel',  angle:  150 },
        { id:'lyrics',      label:'Lyrics',        angle: -150 },
      ];
      if (block.id === 'ytvideo') return [
        { id:'result',        label:'Puntuación',    angle: -90  },
        { id:'configuracion', label:'Configuración', angle: -30  },
        { id:'diseno',        label:'Diseño',        angle:  30  },
        { id:'contenido',     label:'Contenido',     angle:  90  },
        { id:'organizacion',  label:'Organización',  angle:  150 },
        { id:'accesos',       label:'Accesos',       angle: -150 },
      ];
    } else {
      // SONG mode — completely different subcat IDs
      if (block.id === 'dsps') return [
        { id:'result',         label:'Total',                 angle: -90  },
        { id:'spotify',        label:'Spotify',               angle: -150 },
        { id:'apple_music',    label:'Apple Music',           angle: -30  },
        { id:'other_dsps',     label:'Other DSPs',            angle:  30  },
        { id:'soundcloud',     label:'SoundCloud & Beatport', angle:  90  },
        { id:'youtube_music',  label:'YT Music',              angle:  150 },
      ];
      if (block.id === 'social') return [
        { id:'result',     label:'Puntuación', angle: -90  },
        { id:'tiktok',     label:'TikTok',     angle: -30  },
        { id:'x',          label:'X',          angle:  30  },
        { id:'instagram',  label:'Instagram',  angle: -150 },
      ];
      if (block.id === 'authority') return [
        { id:'result',         label:'Puntuación',    angle: -90  },
        { id:'wikipedia',      label:'Wikipedia',     angle: -30  },
        { id:'musicbrainzco',  label:'MusicBrainz',   angle:  30  },
        { id:'composser',      label:'Composser',     angle:  90  },
        { id:'google_panel',   label:'Google Panel',  angle:  150 },
        { id:'lyrics',         label:'Lyrics',        angle: -150 },
      ];
      if (block.id === 'ytvideo') return [
        { id:'result',                    label:'Puntuación',           angle: -90  },
        { id:'upload_assets',             label:'Upload Assets',        angle: -150 },
        { id:'content_id__derivados',     label:'Content ID',           angle: -30  },
        { id:'internal_connection',       label:'Internal',             angle:  30  },
        { id:'external_connection',       label:'External',             angle:  90  },
        { id:'otras_dvps',                label:'Otras DVPs',           angle:  150 },
      ];
    }
    // Default: use subcats as vertices (used for Rights and any unrecognized block)
    return [
      { id:'result', label:'Total', angle:-90 },
      ...block.subcats.slice(0, 5).map((s, i) => ({
        id: s.id, label: s.label, angle: -30 + i * 60
      }))
    ];
  };

  // KPI card order — independent from hexagon vertex angles, per mode
  const getCardOrder = () => {
    if (!isSong) {
      if (block.id === 'dsps')      return ['spotify', 'apple', 'ytmusic', 'otherdsps', 'soundcloud'];
      if (block.id === 'social')    return ['instagram', 'tiktok', 'x', 'rrss_alt', 'web'];
      if (block.id === 'authority') return ['lyrics', 'wikipedia', 'googlepanel', 'musicbrainz', 'composer'];
      if (block.id === 'ytvideo')   return ['accesos', 'configuracion', 'organizacion', 'diseno', 'contenido'];
      if (block.id === 'rights')    return ['publishing', 'sgae', 'agedi', 'soundexchange', 'aie'];
    } else {
      if (block.id === 'dsps')      return ['spotify', 'apple_music', 'youtube_music', 'other_dsps', 'soundcloud', 'beatport'];
      if (block.id === 'social')    return ['instagram', 'tiktok', 'x'];
      if (block.id === 'authority') return ['lyrics', 'wikipedia', 'google_panel', 'musicbrainzco', 'composser', 'ooh'];
      if (block.id === 'ytvideo')   return ['upload_assets', 'content_id__derivados', 'internal_connection', 'external_connection', 'otras_dvps', 'otras_integraciones'];
      if (block.id === 'rights')    return ['sgae', 'soundexchange', 'aie', 'agedi', 'samples'];
    }
    return null;
  };

  const vertices = getVertices();
  const S = 340, cx = S/2, cy = S/2, R = 120;

  const getSubcatScore = (subcatId) => {
    if (subcatId === 'result') {
      return Math.round(calcBlockScore(block, artistAnswers) * 10) / 10;
    }
    // In song mode, DSPs has soundcloud AND beatport as separate subcats —
    // the hexagon vertex 'soundcloud' combines both for display purposes.
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

  const sortedPoints = [...vertices].sort((a,b) => a.angle - b.angle).map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));
  const hasAnyData = vertices.some(v => v.id !== 'result' && getSubcatScore(v.id) !== null);
  const dataPolygon = (() => {
    const pts = [...vertices].sort((a, b) => a.angle - b.angle).map(v => {
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

  const pendingCount = getPendingTasks([block], artistAnswers).length;

  const cardOrder = getCardOrder();
  const subcatCards = cardOrder
    ? cardOrder.map(id => vertices.find(v => v.id === id)).filter(Boolean)
    : vertices.filter(v => v.id !== 'result');

  return (
    <div style={{minHeight:'100dvh', background:'#ffffff', display:'flex', flexDirection:'column'}}>

      {/* Back button — top left, discreet, same language as the rest of the app */}
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))'}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:'#aaaaaa', fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>
          ← Volver
        </button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'0 20px 32px', maxWidth:'480px', width:'100%', margin:'0 auto'}}>

        {/* Breadcrumb header */}
        <div style={{textAlign:'center', marginBottom:'8px'}}>
          <button onClick={onGoHome} style={{background:'transparent', border:'none', cursor: onGoHome ? 'pointer' : 'default', padding:'2px 8px', borderRadius:'8px', fontFamily:'Arial,sans-serif', fontSize:'13px', fontWeight:'600', color: onGoHome ? '#E8151B' : '#aaaaaa', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px', display:'block', margin:'0 auto 4px'}}>
            {artistName}
          </button>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:'#0a0a0a'}}>{block.label}</div>
        </div>

        {/* Pending tasks KPI card — above the hexagon */}
        {onPending && (
          <div style={{marginTop:'20px'}}>
            <KpiCard label="Tareas pendientes" value={pendingCount} onClick={onPending} />
          </div>
        )}

        {/* Hexagon — same size as the artist profile screen */}
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
              {hasAnyData && dataPolygon && <path d={dataPolygon} fill="rgba(232,21,27,0.15)" stroke="#E8151B" strokeWidth="2" strokeLinejoin="round"/>}
              {vertices.map(v => {
                const score = getSubcatScore(v.id);
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
              const score = getSubcatScore(v.id);
              const isTotal = v.id === 'result';
              const hasScore = score !== null;
              // Scale the label font down for long names so they still fit on one line
              const labelFontSize = v.label.length > 16 ? '6.5px' : v.label.length > 11 ? '7.5px' : '9px';
              return (
                <button key={v.id}
                  onClick={() => !isTotal && onSubcat(v.id)}
                  style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px',
                    background: isTotal ? t.accent : hasScore ? t.text : t.bg,
                    border:`1.5px solid ${isTotal ? t.accent : hasScore ? t.text : t.border}`,
                    borderRadius:'16px', padding:'6px 10px', cursor: isTotal ? 'default' : 'pointer',
                    minWidth:'62px', maxWidth:'118px', minHeight:'40px', width:'max-content',
                    boxShadow: hasScore||isTotal ? `0 2px 10px ${t.shadow}` : 'none', transition:'all 0.2s'}}>
                  {!isTotal && (
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:labelFontSize, fontWeight:'700',
                      color: hasScore ? t.bg : t.text2, letterSpacing:'0.03em', textTransform:'uppercase',
                      whiteSpace:'nowrap', textAlign:'center', lineHeight:'1.25'}}>
                      {v.label}
                    </div>
                  )}
                  {(hasScore || isTotal) && (
                    <div style={{fontFamily:'Arial,sans-serif', fontSize: isTotal ? '20px' : '12px',
                      fontWeight:'700', color: isTotal?'#fff':t.bg, lineHeight:1}}>{score}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory KPI cards — same order as the hexagon */}
        <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'8px'}}>
          {subcatCards.map(v => (
            <KpiCard key={v.id} label={v.label} value={getSubcatScore(v.id)} onClick={() => onSubcat(v.id)} />
          ))}
        </div>

      </div>
    </div>
  );
}
