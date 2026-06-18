// components/quiz/BlockSummaryScreen.jsx
import { scoreColor } from "../../utils/helpers";
import { calcBlockScore } from "../../utils/scoring";

export default function BlockSummaryScreen({ block, answers, blockIndex, totalBlocks, phaseName, photo, onContinue, onBack }) {
  const blockScore = Math.round(calcBlockScore(block, answers)*10)/10;

  const subcatScores = block.subcats.map(sub => {
    let raw = 0;
    sub.items.forEach(item => { if (answers[item.id] === true) raw += item.w; });
    return { label: sub.label, score: Math.min(100, Math.round(raw*10)/10) };
  });

  return (
    <div style={{minHeight:"100dvh", background:"#ffffff", display:"flex", flexDirection:"column"}}>
      <div style={{padding:"16px 20px", paddingTop:"max(16px,env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #EAEAEA"}}>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"#aaaaaa"}}>{phaseName}</div>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"#aaaaaa"}}>Bloque {blockIndex}/{totalBlocks}</div>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px", maxWidth:"480px", width:"100%", margin:"0 auto"}}>
        <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px"}}>
          {photo && <img src={photo} alt="" style={{width:"40px",height:"40px",borderRadius:"10px",objectFit:"cover",flexShrink:0}}/>}
          <div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:"#aaaaaa", letterSpacing:"0.12em", textTransform:"uppercase"}}>Resumen · Bloque {blockIndex}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"24px", fontWeight:"700", color:"#0a0a0a"}}>{block.label}</div>
          </div>
        </div>

        <div style={{display:"flex", justifyContent:"center", marginBottom:"28px"}}>
          <div style={{display:"inline-flex", flexDirection:"column", alignItems:"center", background:"#F7F7F7", border:"1px solid #EAEAEA", borderRadius:"20px", padding:"20px 40px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"56px", fontWeight:"700", color:scoreColor(blockScore), lineHeight:1}}>{blockScore}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:"#aaaaaa", marginTop:"6px"}}>/ 100 · peso {Math.round(block.blockWeight*100)}%</div>
          </div>
        </div>

        <div style={{border:"1px solid #EAEAEA", borderRadius:"20px", padding:"20px", marginBottom:"12px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:"#aaaaaa", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"16px"}}>Desglose por subcategoría</div>
          {subcatScores.map((s,i) => (
            <div key={i} style={{marginBottom:"14px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
                <div style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"#0a0a0a", fontWeight:"600"}}>{s.label}</div>
                <div style={{fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:scoreColor(s.score)}}>{s.score}</div>
              </div>
              <div style={{height:"6px", background:"#F0F0F0", borderRadius:"6px", overflow:"hidden"}}>
                <div style={{height:"100%", width:`${s.score}%`, background:scoreColor(s.score), borderRadius:"6px", transition:"width 0.6s ease"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 20px", paddingBottom:"max(12px,env(safe-area-inset-bottom,12px))", display:"flex", gap:"10px", borderTop:"1px solid #EAEAEA"}}>
        <button onClick={onBack} style={{flex:1, padding:"14px", background:"#F7F7F7", color:"#555555", border:"1px solid #EAEAEA", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer"}}>← Revisar</button>
        <button onClick={onContinue} style={{flex:2, padding:"14px", background:"#0a0a0a", color:"#ffffff", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer"}}>
          {blockIndex < totalBlocks ? "Siguiente bloque →" : "Ver resultado →"}
        </button>
      </div>
    </div>
  );
}
