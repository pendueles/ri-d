// components/quiz/PendingTasksScreen.jsx
import { theme, isDark } from "../../theme/theme";

export default function PendingTasksScreen({ blocks, answers, title, onBack, onGoToQuestion }) {
  const t = theme(isDark());

  // Build pending tasks grouped by block > subcat
  // Pending = answered NO (false) OR not yet answered (undefined)
  const groups = blocks.map(block => {
    const subcats = block.subcats.map(sub => {
      const pending = sub.items.filter(item => answers[item.id] !== true);
      return { ...sub, pending };
    }).filter(s => s.pending.length > 0);
    return { ...block, subcats };
  }).filter(b => b.subcats.length > 0);

  const totalPending = groups.reduce((acc, b) => acc + b.subcats.reduce((a, s) => a + s.pending.length, 0), 0);

  // Build a flat index map: itemId → question index
  const questionIndex = {};
  let idx = 0;
  blocks.forEach(block => {
    block.subcats.forEach(sub => {
      sub.items.forEach(item => {
        questionIndex[item.id] = idx++;
      });
    });
  });

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Volver</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Tareas pendientes</div>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3}}>{title}</div>
        </div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', fontWeight:'700', color:'#E8151B'}}>{totalPending}</div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'16px 20px'}}>
        {groups.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center'}}>
            <div style={{fontSize:'56px', marginBottom:'16px'}}>✅</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Todo al día</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2}}>No hay tareas pendientes</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            {groups.map(block => (
              <div key={block.id}>
                {/* Block header */}
                <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'12px', paddingTop:'8px'}}>
                  {block.label}
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {block.subcats.map(sub => (
                    <div key={sub.id}>
                      {/* Subcat label */}
                      <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', color:t.text2, marginBottom:'8px', marginTop:'12px', paddingLeft:'2px'}}>
                        {sub.label}
                      </div>
                      {/* Tasks */}
                      {sub.pending.map(item => (
                        <button key={item.id}
                          onClick={() => onGoToQuestion(questionIndex[item.id])}
                          style={{display:'flex', alignItems:'center', gap:'12px', width:'100%', padding:'14px 14px', background:t.card, border:`1px solid ${answers[item.id] === false ? '#E8151B44' : t.border}`, borderRadius:'12px', cursor:'pointer', textAlign:'left', marginBottom:'6px'}}>
                          <div style={{width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${answers[item.id] === false ? '#E8151B' : t.border}`, background: answers[item.id] === false ? '#E8151B18' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                            {answers[item.id] === false
                              ? <span style={{color:'#E8151B', fontSize:'10px', fontWeight:'700'}}>✗</span>
                              : <span style={{color:t.text3, fontSize:'10px'}}>○</span>
                            }
                          </div>
                          <div style={{flex:1, fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text, lineHeight:'1.4'}}>{item.q}</div>
                          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, flexShrink:0}}>{item.w}pts</div>
                          <div style={{color:t.text3, fontSize:'16px'}}>›</div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SUBCAT SUMMARY SCREEN — shown after each subcategory
// ═══════════════════════════════════════════
