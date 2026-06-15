// components/quiz/ResultScreen.jsx
import { isDark } from "../../theme/theme";
import { scoreColor, scoreLabel, bgColor } from "../../utils/helpers";
import { RIMAS_LOGO } from "../../data/assets";

export default function ResultScreen({ title, subtitle, score, blocks, answers, photo, onContinue, continueLabel, onSecondary, secondaryLabel, extra }) {
  return (
    <div style={{ minHeight:"100dvh", background: bgColor(100), display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"20px 20px 0", paddingTop:"max(20px, env(safe-area-inset-top, 20px))", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <img src={RIMAS_LOGO} alt="Ri+D" style={{ height:"28px", width:"28px", objectFit:"contain", filter: isDark() ? "invert(1)" : "none" }}/>
        <div style={{ fontFamily:"Arial, sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>Resultado</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"20px" }}>
        {/* Score hero */}
        <div style={{ background:"white", borderRadius:"20px", padding:"24px 20px", marginBottom:"14px", textAlign:"center", boxShadow:"0 8px 30px rgba(0,0,0,0.15)" }}>
          {photo && <img src={photo} alt="" style={{ width:"64px", height:"64px", borderRadius:"50%", objectFit:"cover", margin:"0 auto 12px", display:"block", border:"3px solid #f0f0f0" }}/>}
          <div style={{ fontFamily:"Arial, sans-serif", fontSize:"13px", fontWeight:"700", color:"#999", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>{subtitle}</div>
          <div style={{ fontFamily:"Arial, sans-serif", fontSize:"26px", fontWeight:"700", color:"#111", marginBottom:"16px" }}>{title}</div>
          <ScoreRing score={score}/>
          <div style={{ display:"inline-block", padding:"6px 16px", borderRadius:"20px", background: scoreColor(score) + "22", border:`1px solid ${scoreColor(score)}44`, fontFamily:"Arial, sans-serif", fontSize:"13px", fontWeight:"700", color: scoreColor(score), marginTop:"8px" }}>
            {scoreLabel(score)}
          </div>
        </div>

        {/* Block breakdown */}
        <div style={{ marginBottom:"14px" }}>
          <div style={{ fontFamily:"Arial, sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"10px" }}>Desglose por bloque</div>
          <BlockScores blocks={blocks} answers={answers}/>
        </div>

        {extra && <div style={{ marginBottom:"14px" }}>{extra}</div>}
      </div>
      <div style={{ padding:"16px 20px", paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", background:"rgba(0,0,0,0.2)", display:"flex", flexDirection:"column", gap:"10px" }}>
        <button onClick={onContinue} style={{ display:"block", width:"100%", padding:"17px", background:"white", color:"#111", border:"none", borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer" }}>
          {continueLabel}
        </button>
        {onSecondary && (
          <button onClick={onSecondary} style={{ display:"block", width:"100%", padding:"15px", background:"transparent", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"15px", fontWeight:"600", cursor:"pointer" }}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// HEX RADAR — 6 vertices (5 blocks + 1 total)
// Top=TOTAL, clockwise: DSPs, YT&Video, Authority, Rights, Social
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// ARTIST HOME SCREEN — hexagon nav
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// BLOCK HOME SCREEN — sub-hexagon for block subcats
// ═══════════════════════════════════════════
