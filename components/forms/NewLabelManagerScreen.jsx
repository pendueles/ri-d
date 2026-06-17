// components/forms/NewLabelManagerScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { getLabelUsers, saveLabelUsers } from "../../firebase/store";

export default function NewLabelManagerScreen({ onBack, onDone }) {
  const t = theme(isDark());
  const [newName, setNewName] = useState('');
  const [done, setDone] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const users = getLabelUsers();
    users[newName.trim()] = true;
    saveLabelUsers(users);
    setDone(true);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px'}}>
      <div style={{width:'100%', maxWidth:'360px'}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', marginBottom:'32px', padding:0}}>← Atrás</button>
        {done ? (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>✅</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Creado</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginBottom:'24px'}}><strong>{newName}</strong> ya puede entrar como Label Manager</div>
            <button onClick={onDone} style={{display:'block', width:'100%', padding:'16px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', cursor:'pointer'}}>Volver al inicio</button>
          </div>
        ) : (
          <>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Nuevo Label Manager</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginBottom:'28px'}}>Escribe el nombre con el que entrará.</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Nombre del Label Manager"
              autoFocus
              style={{display:'block', width:'100%', background:t.bg2, border:`1.5px solid ${t.border}`, borderRadius:'12px', padding:'16px 18px', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', marginBottom:'16px', WebkitAppearance:'none', boxSizing:'border-box'}}
            />
            <button onClick={handleCreate} style={{display:'block', width:'100%', padding:'17px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
              Crear →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ARTIST EDIT SCREEN
// ═══════════════════════════════════════════
