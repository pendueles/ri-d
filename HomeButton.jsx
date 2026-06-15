// components/ui/HomeButton.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";

export default function HomeButton({ onHome, dark }) {
  const t = theme(isDark());
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
      <span style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text2}}>¿Ir al inicio?</span>
      <button onClick={onHome} style={{background:t.accent, border:'none', color:'#fff', fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'6px', cursor:'pointer'}}>Sí</button>
      <button onClick={() => setConfirm(false)} style={{background:t.bg3, border:`1px solid ${t.border}`, color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'11px', padding:'4px 10px', borderRadius:'6px', cursor:'pointer'}}>No</button>
    </div>
  );
  return (
    <button onClick={() => setConfirm(true)} style={{background:'transparent', border:'none', cursor:'pointer', padding:'4px', display:'flex', alignItems:'center', gap:'4px'}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </button>
  );
}
