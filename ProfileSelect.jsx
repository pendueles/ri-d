// components/screens/ProfileSelect.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { RIMAS_LOGO } from "../../data/assets";

export default function ProfileSelect({ onSelect }) {
  const t = theme(isDark());
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('name'); // 'name' | 'password'
  const [error, setError] = useState('');

  const handleEnter = () => {
    const n = name.trim();
    if (!n) { setError('Escribe tu nombre'); return; }

    if (n.toLowerCase() === 'admin') {
      if (step === 'name') {
        setStep('password');
        setError('');
        return;
      }
      // password step
      if (password === 'Fedora') {
        onSelect({ type: 'admin', name: 'Admin' });
      } else {
        setError('Contraseña incorrecta');
      }
      return;
    }

    // All other profiles disabled for now
    setError('Acceso no disponible. Contacta con el administrador.');
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 32px', paddingTop:'max(40px,env(safe-area-inset-top,40px))'}}>

      <img src={RIMAS_LOGO} alt="Ri+D" style={{width:'56px', height:'56px', objectFit:'contain', marginBottom:'56px', filter: isDark() ? 'invert(1)' : 'none'}}/>

      <div style={{width:'100%', maxWidth:'320px'}}>
        {step === 'name' ? (
          <input
            key="name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            placeholder="¿Quién eres?"
            autoFocus
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${error ? '#E8151B' : t.border}`, borderRadius:0, padding:'12px 0', fontFamily:'Arial,sans-serif', fontSize:'24px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', boxSizing:'border-box', textAlign:'center'}}
          />
        ) : (
          <input
            key="password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            placeholder="Contraseña"
            autoFocus
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${error ? '#E8151B' : t.border}`, borderRadius:0, padding:'12px 0', fontFamily:'Arial,sans-serif', fontSize:'24px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', boxSizing:'border-box', textAlign:'center'}}
          />
        )}

        {error && (
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#E8151B', marginTop:'10px', textAlign:'center'}}>{error}</div>
        )}

        <button onClick={handleEnter} style={{display:'block', margin:'40px auto 0', background:'transparent', border:'none', cursor:'pointer', padding:'8px'}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke={t.text3} strokeWidth="1.5"/>
            <path d="M13 16h8M17 12l4 4-4 4" stroke={t.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {step === 'password' && (
          <button onClick={() => { setStep('name'); setPassword(''); setError(''); }}
            style={{display:'block', margin:'16px auto 0', background:'transparent', border:'none', color:t.text3, fontFamily:'Arial,sans-serif', fontSize:'13px', cursor:'pointer'}}>
            ← Volver
          </button>
        )}
      </div>
    </div>
  );
}
// Shows: block score + subcategory breakdown (no hex)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// ARTIST LIST SCREEN
// ═══════════════════════════════════════════
