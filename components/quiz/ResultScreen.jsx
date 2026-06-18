// components/quiz/ResultScreen.jsx
import { scoreColor, scoreLabel } from "../../utils/helpers";
import { calcBlockScore } from "../../utils/scoring";
import { RIMAS_LOGO } from "../../data/assets";

export default function ResultScreen({ title, subtitle, score, blocks, answers, photo, onContinue, continueLabel, onSecondary, secondaryLabel, extra }) {
  return (
    <div style={{ minHeight:"100dvh", background:"#ffffff", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", paddingTop:"max(16px,env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #EAEAEA" }}>
        <img src={RIMAS_LOGO} alt="Ri+D" style={{ height:"28px", width:"28px", objectFit:"contain" }}/>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:"#aaaaaa" }}>Resultado</div>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px", maxWidth:"480px", width:"100%", margin:"0 auto" }}>
        <div style={{ border:"1px solid #EAEAEA", borderRadius:"20px", padding:"24px 20px", marginBottom:"16px", textAlign:"center" }}>
          {photo && <img src={photo} alt="" style={{ width:"64px", height:"64px", borderRadius:"12px", objectFit:"cover", margin:"0 auto 12px", display:"block" }}/>}
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:"13px", fontWeight:"700", color:"#aaaaaa", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>{subtitle}</div>
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:"24px", fontWeight:"700", color:"#0a0a0a", marginBottom:"16px" }}>{title}</div>
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:"62px", fontWeight:"700", color:scoreColor(score), lineHeight:1 }}>{score}</div>
          <div style={{ display:"inline-block", padding:"6px 16px", borderRadius:"20px", background:scoreColor(score)+"22", border:`1px solid ${scoreColor(score)}44`, fontFamily:"Arial,sans-serif", fontSize:"13px", fontWeight:"700", color:scoreColor(score), marginTop:"8px" }}>
            {scoreLabel(score)}
          </div>
        </div>

        {blocks && answers && (
          <div style={{ border:"1px solid #EAEAEA", borderRadius:"20px", padding:"20px", marginBottom:"16px" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:"#aaaaaa", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"16px" }}>Desglose por bloque</div>
            {blocks.map(b => {
              const bs = Math.round(calcBlockScore(b, answers)*10)/10;
              return (
                <div key={b.id} style={{marginBottom:"14px"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
                    <div style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"#0a0a0a", fontWeight:"700"}}>{b.label}</div>
                    <div style={{fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:scoreColor(bs)}}>{bs}</div>
                  </div>
                  <div style={{height:"6px", background:"#F0F0F0", borderRadius:"6px", overflow:"hidden"}}>
                    <div style={{height:"100%", width:`${bs}%`, background:scoreColor(bs), borderRadius:"6px"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {extra && <div style={{ marginBottom:"16px" }}>{extra}</div>}
      </div>

      <div style={{ padding:"12px 20px", paddingBottom:"max(12px,env(safe-area-inset-bottom,12px))", display:"flex", flexDirection:"column", gap:"10px", borderTop:"1px solid #EAEAEA" }}>
        <button onClick={onContinue} style={{ display:"block", width:"100%", padding:"17px", background:"#0a0a0a", color:"#ffffff", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer" }}>
          {continueLabel}
        </button>
        {onSecondary && (
          <button onClick={onSecondary} style={{ display:"block", width:"100%", padding:"15px", background:"transparent", color:"#555555", border:"1px solid #EAEAEA", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"600", cursor:"pointer" }}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
