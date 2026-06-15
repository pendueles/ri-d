// components/quiz/TotalSummaryScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { scoreColor, scoreLabel, bgColor } from "../../utils/helpers";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";

export default function TotalSummaryScreen({ blocks, answers, title, subtitle, photo, onContinue, continueLabel, onSecondary, secondaryLabel }) {
  const t = theme(isDark());
  const totalScore = Math.round(calcTotalScore(blocks, answers)*10)/10;
  return (
    <div style={{minHeight:"100dvh", background:bgColor(100), display:"flex", flexDirection:"column"}}>
      <div style={{padding:"16px 20px 0", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase"}}>{subtitle}</div>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"16px 20px 8px"}}>
        {/* Name + photo */}
        <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px"}}>
          {photo && <img src={photo} alt="" style={{width:"48px",height:"48px",borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.4)"}}/>}
          <div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.5)", letterSpacing:"0.15em", textTransform:"uppercase"}}>Resultado final</div>
            <div style={{fontFamily:"'Arial Black',Arial,sans-serif", fontSize:"20px", fontWeight:"900", color:"white"}}>{title}</div>
          </div>
        </div>

        {/* Total score */}
        <div style={{textAlign:"center", marginBottom:"16px"}}>
          <div style={{display:"inline-flex", flexDirection:"column", alignItems:"center", background:"rgba(0,0,0,0.35)", borderRadius:"18px", padding:"14px 32px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"62px", fontWeight:"700", color:scoreColor(totalScore), lineHeight:1}}>{totalScore}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.5)", marginTop:"4px"}}>{scoreLabel(totalScore)}</div>
          </div>
        </div>

        {/* Hex Radar */}
        <div style={{background:"#1e1e1e", borderRadius:"16px", padding:"16px 8px", marginBottom:"16px", display:"flex", justifyContent:"center"}}>
          <HexRadarTotal blocks={blocks} answers={answers}/>
        </div>

        {/* Block scores list */}
        <div style={{background:"rgba(0,0,0,0.25)", borderRadius:"14px", padding:"14px", marginBottom:"12px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px"}}>Desglose por bloque</div>
          {blocks.map(b => {
            const bs = Math.round(calcBlockScore(b, answers)*10)/10;
            return (
              <div key={b.id} style={{marginBottom:"10px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px"}}>
                  <div>
                    <span style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"white", fontWeight:"700"}}>{b.label}</span>
                    <span style={{fontFamily:"Arial,sans-serif", fontSize:"10px", color:"rgba(255,255,255,0.4)", marginLeft:"6px"}}>×{Math.round(b.blockWeight*100)}%</span>
                  </div>
                  <div style={{fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:scoreColor(bs)}}>{bs}</div>
                </div>
                <div style={{height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px", overflow:"hidden"}}>
                  <div style={{height:"100%", width:`${bs}%`, background:scoreColor(bs), borderRadius:"2px"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"12px 20px", paddingBottom:"max(12px, env(safe-area-inset-bottom,12px))", display:"flex", flexDirection:"column", gap:"10px"}}>
        <button onClick={onContinue} style={{display:"block", width:"100%", padding:"17px", background:t.bg, color:t.accent, border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer"}}>{continueLabel}</button>
        {onSecondary && <button onClick={onSecondary} style={{display:"block", width:"100%", padding:"14px", background:"transparent", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"600", cursor:"pointer"}}>{secondaryLabel}</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ARTIST CATALOGUE SCREEN
// ═══════════════════════════════════════════
