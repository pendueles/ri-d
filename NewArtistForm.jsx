// components/forms/NewArtistForm.jsx
import { useState, useRef } from "react";
import { theme, isDark } from "../../theme/theme";
import { getLabelUsers, getMgmtUsers, saveMgmtUsers, registerArtistUser } from "../../firebase/store";

export default function NewArtistForm({ profile, onBack, onSave }) {
  const t = theme(isDark());
  const [step, setStep] = useState(1); // 1=nombre, 2=management, 3=label managers, 4=foto
  const [artistName, setArtistName] = useState('');
  const [management, setManagement] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([profile.name].filter(Boolean));
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const allLabelUsers = Object.keys(getLabelUsers());

  const toggleLabel = (name) => setSelectedLabels(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    const managers = management.split(';').map(m => m.trim()).filter(Boolean);
    if (managers.length > 0) {
      try {
        const existing = getMgmtUsers();
        managers.forEach(m => { existing[m] = true; });
        saveMgmtUsers(existing);
      } catch(e) {}
    }
    // Auto-register artist as a user profile
    registerArtistUser(artistName.trim());
    onSave({
      name: artistName.trim(),
      management: managers.join('; '),
      photo,
      labelUser: profile.name,
      labelUsers: selectedLabels.filter(n => n === profile.name || allLabelUsers.includes(n)),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
  };

  const steps = ['Nombre', 'Management', 'Label', 'Foto'];
  const canNext = step === 1 ? !!artistName.trim() : true;

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      {/* Topbar */}
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => step > 1 ? setStep(s => s-1) : onBack()}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>{steps[step-1]}</div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text3}}>{step}/4</div>
      </div>

      {/* Progress dots */}
      <div style={{display:'flex', justifyContent:'center', gap:'6px', padding:'16px 0 0'}}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{width: i === step ? '20px' : '6px', height:'6px', borderRadius:'3px', background: i <= step ? t.text : t.border, transition:'all 0.3s ease'}}/>
        ))}
      </div>

      {/* Step content */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 32px'}}>

        {step === 1 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && artistName.trim() && setStep(2)}
              placeholder="Nombre del artista"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={management}
              onChange={e => setManagement(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setStep(3)}
              placeholder="Management"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, textAlign:'center', marginTop:'10px'}}>Separa con ; para añadir más de un manager</div>
          </div>
        )}

        {step === 3 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={selectedLabels.filter(n => n !== profile.name).join('; ')}
              onChange={e => {
                const names = e.target.value.split(';').map(m => m.trim()).filter(Boolean);
                setSelectedLabels([profile.name, ...names]);
              }}
              onKeyDown={e => e.key === 'Enter' && setStep(4)}
              placeholder="Otro label manager"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, textAlign:'center', marginTop:'10px'}}>Separa con ; para añadir más de uno</div>
            {/* Validate — show warning if name doesn't exist */}
            {selectedLabels.filter(n => n !== profile.name).map(name => {
              const exists = allLabelUsers.includes(name);
              return (
                <div key={name} style={{fontFamily:'Arial,sans-serif', fontSize:'12px', marginTop:'8px', textAlign:'center', color: exists ? '#16a34a' : '#E8151B'}}>
                  {name}: {exists ? '✓ encontrado' : '✗ no existe como Label Manager'}
                </div>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'24px'}}>
            <div onClick={() => fileRef.current.click()}
              style={{width:'120px', height:'120px', borderRadius:'50%', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
              {photo
                ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                : <span style={{fontSize:'36px'}}>📷</span>
              }
            </div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text3}}>
              {photo ? 'Toca para cambiar' : 'Toca para añadir foto'}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
          </div>
        )}

      </div>

      {/* Bottom button */}
      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        {step < 4 ? (
          <button onClick={() => canNext && setStep(s => s+1)}
            style={{display:'block', width:'100%', padding:'17px', background: canNext ? t.text : t.bg2, color: canNext ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: canNext ? 'pointer' : 'default', transition:'all 0.2s'}}>
            Siguiente →
          </button>
        ) : (
          <button onClick={handleSave}
            style={{display:'block', width:'100%', padding:'17px', background:t.text, color:t.bg, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
            Crear artista
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT FORM — with artist linkage
// ═══════════════════════════════════════════
