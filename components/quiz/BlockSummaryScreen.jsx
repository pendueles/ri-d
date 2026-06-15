// components/quiz/BlockSummaryScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { scoreColor, bgColor } from "../../utils/helpers";
import { calcBlockScore } from "../../utils/scoring";

export default function BlockSummaryScreen({ block, answers, blockIndex, totalBlocks, phaseName, photo, onContinue, onBack }) {
  const t = theme(isDark());
  const blockScore = Math.round(calcBlockScore(block, answers)*10)/10;

  // subcategory scores
  const subcatScores = block.subcats.map(sub => {
    let raw = 0;
    sub.items.forEach(item => { if (answers[item.id] === true) raw += item.w; });
    return { label: sub.label, score: Math.min(100, Math.round(raw*10)/10), weight: sub.subcatWeight };
  });

  return (
    <div style={{minHeight:"100dvh", background:bgColor(70), display:"flex", flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"16px 20px 0", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase"}}>{phaseName}</div>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.5)"}}>Bloque {blockIndex}/{totalBlocks}</div>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"16px 20px 8px"}}>
        {/* Block title */}
        <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px"}}>
          {photo && <img src={photo} alt="" style={{width:"40px",height:"40px",borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.3)"}}/>}
          <div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.5)", letterSpacing:"0.15em", textTransform:"uppercase"}}>Resumen · Bloque {blockIndex}</div>
            <div style={{fontFamily:"'Arial Black',Arial,sans-serif", fontSize:"22px", fontWeight:"900", color:"white", textTransform:"uppercase"}}>{block.label}</div>
          </div>
        </div>

        {/* Block score big */}
        <div style={{textAlign:"center", marginBottom:"20px"}}>
          <div style={{display:"inline-flex", flexDirection:"column", alignItems:"center", background:"rgba(0,0,0,0.35)", borderRadius:"18px", padding:"16px 32px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"56px", fontWeight:"700", color:scoreColor(blockScore), lineHeight:1}}>{blockScore}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.5)", marginTop:"4px"}}>/ 100 &nbsp;·&nbsp; peso {Math.round(block.blockWeight*100)}%</div>
          </div>
        </div>

        {/* Subcategory breakdown */}
        <div style={{background:"rgba(0,0,0,0.25)", borderRadius:"14px", padding:"14px", marginBottom:"12px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px"}}>Desglose por subcategoría</div>
          {subcatScores.map((s,i) => (
            <div key={i} style={{marginBottom:"10px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px"}}>
                <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.85)", fontWeight:"600"}}>{s.label}</div>
                <div style={{fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"700", color:scoreColor(s.score)}}>{s.score}</div>
              </div>
              {/* Progress bar */}
              <div style={{height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px", overflow:"hidden"}}>
                <div style={{height:"100%", width:`${s.score}%`, background:scoreColor(s.score), borderRadius:"2px", transition:"width 0.6s ease"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 20px", paddingBottom:"max(12px, env(safe-area-inset-bottom,12px))", display:"flex", gap:"10px"}}>
        <button onClick={onBack} style={{flex:1, padding:"14px", background:"rgba(0,0,0,0.5)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"12px", fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer"}}>← Revisar</button>
        <button onClick={onContinue} style={{flex:2, padding:"14px", background:t.bg, color:t.accent, border:"none", borderRadius:"12px", fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer"}}>
          {blockIndex < totalBlocks ? "Siguiente bloque →" : "Ver resultado →"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TOTAL SUMMARY SCREEN — after all blocks
// Shows hex radar + all block scores
// ═══════════════════════════════════════════
