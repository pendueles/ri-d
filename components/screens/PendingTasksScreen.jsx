// components/quiz/PendingTasksScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { getPendingTasks } from "../../utils/helpers";

// Renders pending tasks grouped by Area > Subcategory, in hierarchical
// order (Area position > Subcategory position > Points). A task is only
// "pending" when explicitly answered "No" — unanswered questions don't count.
export default function PendingTasksScreen({ blocks, answers, title, onBack, onGoToQuestion, blockOrder = null, subcatOrderMap = null }) {
  const t = theme(isDark());

  const tasks = getPendingTasks(blocks, answers, blockOrder, subcatOrderMap);

  // Re-group the flat, already-ordered task list back into Block > Subcat
  // sections for rendering, preserving the order getPendingTasks produced.
  const groups = [];
  tasks.forEach(task => {
    let blockGroup = groups.find(g => g.blockId === task.blockId);
    if (!blockGroup) { blockGroup = { blockId: task.blockId, label: task.category, subcats: [] }; groups.push(blockGroup); }
    let subGroup = blockGroup.subcats.find(s => s.subcatId === task.subcatId);
    if (!subGroup) { subGroup = { subcatId: task.subcatId, label: task.subcatLabel, tasks: [] }; blockGroup.subcats.push(subGroup); }
    subGroup.tasks.push(task);
  });

  // Build a flat index map: itemId → question index (within `blocks`, in
  // its natural/global order), used to jump into the quiz at the right spot.
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
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', fontWeight:'700', color:'#E8151B'}}>{tasks.length}</div>
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
              <div key={block.blockId}>
                <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'12px', paddingTop:'8px'}}>
                  {block.label}
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {block.subcats.map(sub => (
                    <div key={sub.subcatId}>
                      <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', color:t.text2, marginBottom:'8px', marginTop:'12px', paddingLeft:'2px'}}>
                        {sub.label}
                      </div>
                      {sub.tasks.map(task => (
                        <button key={task.id}
                          onClick={() => onGoToQuestion(questionIndex[task.id], task.id)}
                          style={{display:'flex', alignItems:'center', gap:'12px', width:'100%', padding:'14px 14px', background:t.card, border:'1px solid #E8151B44', borderRadius:'12px', cursor:'pointer', textAlign:'left', marginBottom:'6px'}}>
                          <div style={{width:'22px', height:'22px', borderRadius:'50%', border:'2px solid #E8151B', background:'#E8151B18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                            <span style={{color:'#E8151B', fontSize:'10px', fontWeight:'700'}}>✗</span>
                          </div>
                          <div style={{flex:1, fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text, lineHeight:'1.4'}}>{task.title}</div>
                          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, flexShrink:0}}>{task.impact}pts</div>
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
