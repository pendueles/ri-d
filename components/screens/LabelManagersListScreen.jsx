// components/screens/LabelManagersListScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { getArtists, getLabelUsers, saveLabelUsers } from "../../firebase/store";

export default function LabelManagersListScreen({ onBack, onNew }) {
  const t = theme(isDark());
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [managers, setManagers] = useState(() => Object.keys(getLabelUsers()));

  const toggleSelect = (name) => setSelected(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleDelete = () => {
    const users = getLabelUsers();
    selected.forEach(name => { delete users[name]; });
    saveLabelUsers(users);
    setManagers(Object.keys(getLabelUsers()));
    setSelected([]);
    setEditMode(false);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>
          {editMode ? 'Cancelar' : '← Atrás'}
        </button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Label Managers</div>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          {!editMode && managers.length > 0 && (
            <button onClick={() => setEditMode(true)}
              style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', padding:0}}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{background:'transparent', border:'none', color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', cursor: selected.length > 0 ? 'pointer' : 'default', padding:0}}>
              Borrar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            <button onClick={onNew}
              style={{background:'transparent', border:'none', color:t.accent, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor:'pointer', padding:0}}>
              + Nuevo
            </button>
          )}
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {managers.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Sin Label Managers</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3, marginBottom:'32px'}}>Añade el primero con el botón de arriba</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {managers.map((name, i) => {
              const isSelected = selected.includes(name);
              const artistCount = getArtists().filter(a =>
                (a.labelUsers && a.labelUsers.includes(name)) || a.labelUser === name
              ).length;
              return (
                <button key={i}
                  onClick={() => editMode && toggleSelect(name)}
                  style={{display:'flex', alignItems:'center', gap:'14px', padding:'16px', background:t.card, border:`1px solid ${editMode && isSelected ? '#E8151B' : t.border}`, borderRadius:'14px', cursor: editMode ? 'pointer' : 'default', textAlign:'left', width:'100%', boxShadow:`0 2px 8px ${t.shadow}`, transition:'border-color 0.15s'}}>
                  {editMode && (
                    <div style={{width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${isSelected ? '#E8151B' : t.border}`, background: isSelected ? '#E8151B' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      {isSelected && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                    </div>
                  )}
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'18px'}}>👤</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text}}>{name}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{artistCount} artista{artistCount !== 1 ? 's' : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NEW LABEL MANAGER SCREEN
// ═══════════════════════════════════════════
