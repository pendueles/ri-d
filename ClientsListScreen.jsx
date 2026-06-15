// components/screens/ClientsListScreen.jsx
import { theme, isDark } from "../../theme/theme";
import { getArtists } from "../../firebase/store";

export default function ClientsListScreen({ onBack, onSelectArtist, liveArtists }) {
  const t = theme(isDark());

  // Collect all unique managers from all artists
  const allArtists = liveArtists || getArtists();
  const clientMap = {};
  allArtists.forEach(a => {
    if (!a.management) return;
    const managers = a.management.split(';').map(m => m.trim()).filter(Boolean);
    managers.forEach(m => {
      if (!clientMap[m]) clientMap[m] = [];
      clientMap[m].push(a);
    });
  });
  const clients = Object.entries(clientMap).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Clientes</div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{clients.length}</div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {clients.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Sin clientes</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3}}>Cuando añadas management a tus artistas aparecerán aquí</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {clients.map(([managerName, artists]) => (
              <div key={managerName} style={{padding:'16px', background:t.card, border:`1px solid ${t.border}`, borderRadius:'14px', boxShadow:`0 2px 8px ${t.shadow}`}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom: artists.length > 0 ? '12px' : 0}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'18px'}}>🤝</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text}}>{managerName}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{artists.length} artista{artists.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {artists.length > 0 && (
                  <div style={{display:'flex', flexWrap:'wrap', gap:'6px', paddingLeft:'52px'}}>
                    {artists.map(a => (
                      <button key={a.id} onClick={() => onSelectArtist(a)}
                        style={{display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px', background:t.bg2, border:`1px solid ${t.border}`, borderRadius:'20px', cursor:'pointer'}}>
                        {a.photo && <img src={a.photo} alt="" style={{width:'18px', height:'18px', borderRadius:'50%', objectFit:'cover'}}/>}
                        <span style={{fontFamily:'Arial,sans-serif', fontSize:'12px', fontWeight:'600', color:t.text}}>{a.name}</span>
                        <span style={{color:t.text3, fontSize:'10px'}}>›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// LABEL MANAGERS LIST SCREEN
// ═══════════════════════════════════════════
