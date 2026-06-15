// components/quiz/SubcatSummaryScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { scoreColor, scoreLabel } from "../../utils/helpers";

export default function SubcatSummaryScreen({ subcatInfo, photo, phaseName, onContinue, onBack }) {
  const t = theme(isDark());
  const { subcat, block, answers, isBlockEnd } = subcatInfo || {};

  // Calculate subcat score
  const subcatScore = (() => {
    if (!subcat || !answers) return 0;
    let raw = 0;
    subcat.items.forEach(item => { if (answers[item.id] === true) raw += item.w; });
    return Math.min(100, Math.round(raw * 10) / 10);
  })();

  const color = scoreColor(subcatScore);
  const label = scoreLabel(subcatScore);

  // Item breakdown
  const items = subcat?.items || [];
  const answered = items.filter(i => answers?.[i.id] !== undefined);
  const correct = items.filter(i => answers?.[i.id] === true);
  const missed = items.filter(i => answers?.[i.id] === false);

  // Ring animation
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (subcatScore / 100) * circumference;

  return (
    <div style={{minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column", overflow:"hidden"}}>

      {/* Colored accent bar top */}
      <div style={{height:"3px", background:`linear-gradient(90deg, ${color}, ${color}88)`}}/>

      {/* Header */}
      <div style={{padding:"14px 20px", paddingTop:"max(14px, env(safe-area-inset-top,14px))", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <button onClick={onBack} style={{background:"transparent", border:"none", color:t.text3, fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:0}}>← Revisar</button>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase"}}>{phaseName}</div>
        <div style={{width:"60px"}}/>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"8px 24px 16px"}}>

        {/* Block > Subcat breadcrumb */}
        <div style={{display:"flex", alignItems:"center", gap:"6px", marginBottom:"20px"}}>
          <span style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.08em", textTransform:"uppercase"}}>{block?.label}</span>
          <span style={{color:t.text3, fontSize:"10px"}}>›</span>
          <span style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:color, letterSpacing:"0.08em", textTransform:"uppercase"}}>{subcat?.label}</span>
        </div>

        {/* Score ring + number */}
        <div style={{display:"flex", alignItems:"center", gap:"24px", marginBottom:"28px", padding:"20px", background:t.bg2, borderRadius:"20px", border:`1px solid ${t.border}`}}>
          <div style={{position:"relative", flexShrink:0}}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke={t.bg3} strokeWidth="8"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"}}
              />
            </svg>
            <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
              <div style={{fontFamily:"Arial,sans-serif", fontSize:"26px", fontWeight:"700", color:t.text, lineHeight:1}}>{subcatScore}</div>
              <div style={{fontFamily:"Arial,sans-serif", fontSize:"9px", color:t.text3}}>/100</div>
            </div>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:t.text, lineHeight:1.1, marginBottom:"6px"}}>{subcat?.label}</div>
            <div style={{display:"inline-block", padding:"3px 12px", borderRadius:"20px", background:color+"18", border:`1px solid ${color}44`, fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color, marginBottom:"8px"}}>{label}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:t.text3}}>{correct.length}/{items.length} completadas</div>
          </div>
        </div>

        {/* Item breakdown */}
        <div style={{marginBottom:"16px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px"}}>Desglose</div>
          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
            {items.map(item => {
              const isYes = answers?.[item.id] === true;
              const isNo = answers?.[item.id] === false;
              const isUnanswered = answers?.[item.id] === undefined;
              return (
                <div key={item.id} style={{display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:t.card, border:`1px solid ${isYes ? color+"44" : t.border}`, borderRadius:"10px"}}>
                  <div style={{width:"20px", height:"20px", borderRadius:"50%", background: isYes ? color+"22" : t.bg2, border:`1.5px solid ${isYes ? color : t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    <span style={{fontSize:"10px", color: isYes ? color : t.text3}}>{isYes ? "✓" : isNo ? "✗" : "–"}</span>
                  </div>
                  <div style={{flex:1, minWidth:0, fontFamily:"Arial,sans-serif", fontSize:"12px", color: isUnanswered ? t.text3 : t.text, lineHeight:"1.3"}}>{item.q}</div>
                  <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color: isYes ? color : t.text3, flexShrink:0}}>{isYes ? `+${item.w}` : `${item.w}pts`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Block end note */}
        {isBlockEnd && (
          <div style={{padding:"12px 14px", background:t.bg2, borderRadius:"12px", border:`1px solid ${t.border}`, marginBottom:"8px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"2px"}}>Bloque completado</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text2}}>Has terminado todas las preguntas de {block?.label}</div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{padding:"12px 24px", paddingBottom:"max(16px, env(safe-area-inset-bottom,16px))", borderTop:`1px solid ${t.border}`}}>
        <button onClick={onContinue}
          style={{display:"block", width:"100%", padding:"17px", background:t.text, color:t.bg, border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer"}}>
          {isBlockEnd ? `Ver resumen · ${block?.label}` : "Continuar →"}
        </button>
      </div>
    </div>
  );
}
