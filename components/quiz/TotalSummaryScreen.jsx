// components/quiz/TotalSummaryScreen.jsx
import { scoreColor, scoreLabel } from "../../utils/helpers";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import HexRadarTotal from "../ui/HexRadarTotal";

export default function TotalSummaryScreen({ blocks, answers, title, subtitle, photo, onContinue, continueLabel, onSecondary, secondaryLabel }) {
  const totalScore = Math.round(calcTotalScore(blocks, answers)*10)/10;

  return (
    <div style={{minHeight:"100dvh", background:"#ffffff", display:"flex", flexDirection:"column"}}>
      <div style={{padding:"16px 20px", paddingTop:"max(16px,env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #EAEAEA"}}>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"#aaaaaa"}}>{subtitle}</div>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px", maxWidth:"480px", width:"100%", margin:"0 auto"}}>
        <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px"}}>
          {photo && <img src={photo} alt="" style={{width:"48px",height:"48px",borderRadius:"12px",objectFit:"cover",flexShrink:0}}/>}
          <div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:"#aaaaaa", letterSpacing:"0.12em", textTransform:"uppercase"}}>Resultado final</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"24px", fontWeight:"700", color:"#0a0a0a"}}>{title}</div>
          </div>
        </div>

        <div style={{display:"flex", justifyContent:"center", marginBottom:"24px"}}>
          <div style={{display:"inline-flex", flexDirection:"column", alignItems:"center", background:"#F7F7F7", border:"1px solid #EAEAEA", borderRadius:"20px", padding:"20px 40px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"62px", fontWeight:"700", color:scoreColor(totalScore), lineHeight:1}}>{totalScore}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:"#aaaaaa", marginTop:"6px"}}>{scoreLabel(totalScore)}</div>
          </div>
        </div>

        <div style={{border:"1px solid #EAEAEA", borderRadius:"20px", padding:"16px 8px", marginBottom:"20px", display:"flex", justifyContent:"center"}}>
          <HexRadarTotal blocks={blocks} answers={answers}/>
        </div>

        <div style={{border:"1px solid #EAEAEA", borderRadius:"20px", padding:"20px", marginBottom:"12px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:"#aaaaaa", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"16px"}}>Desglose por bloque</div>
          {blocks.map(b => {
            const bs = Math.round(calcBlockScore(b, answers)*10)/10;
            return (
              <div key={b.id} style={{marginBottom:"14px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
                  <div>
                    <span style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"#0a0a0a", fontWeight:"700"}}>{b.label}</span>
                    <span style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"#aaaaaa", marginLeft:"6px"}}>×{Math.round(b.blockWeight*100)}%</span>
                  </div>
                  <div style={{fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:scoreColor(bs)}}>{bs}</div>
                </div>
                <div style={{height:"6px", background:"#F0F0F0", borderRadius:"6px", overflow:"hidden"}}>
                  <div style={{height:"100%", width:`${bs}%`, background:scoreColor(bs), borderRadius:"6px"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"12px 20px", paddingBottom:"max(12px,env(safe-area-inset-bottom,12px))", display:"flex", flexDirection:"column", gap:"10px", borderTop:"1px solid #EAEAEA"}}>
        <button onClick={onContinue} style={{display:"block", width:"100%", padding:"17px", background:"#0a0a0a", color:"#ffffff", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer"}}>{continueLabel}</button>
        {onSecondary && <button onClick={onSecondary} style={{display:"block", width:"100%", padding:"14px", background:"transparent", color:"#555555", border:"1px solid #EAEAEA", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"600", cursor:"pointer"}}>{secondaryLabel}</button>}
      </div>
    </div>
  );
}
