// components/forms/ArtistEditScreen.jsx
import { useState, useRef } from "react";
import { theme, isDark } from "../../theme/theme";
import { compressImage } from "../../utils/helpers";
import { saveOneArtist, getLabelUsers, getMgmtUsers, saveMgmtUsers } from "../../firebase/store";

export default function ArtistEditScreen({ artistData, onBack, onSave }) {
  const t = theme(isDark());
  const [name, setName] = useState(artistData.name || '');
  const [management, setManagement] = useState(artistData.management || '');
  const [photo, setPhoto] = useState(artistData.photo || null);
  const [selectedLabels, setSelectedLabels] = useState(
    artistData.labelUsers || [artistData.labelUser].filter(Boolean)
  );
  const fileRef = useRef();

  const allLabelUsers = Object.keys(getLabelUsers());

  const toggleLabel = (n) => setSelectedLabels(prev =>
    prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
  );

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const compressed = await compressImage(f);
      setPhoto(compressed);
    } catch (err) {
      console.error("No se pudo procesar la imagen:", err);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const managers = management.split(';').map(m => m.trim()).filter(Boolean);
    if (managers.length > 0) {
      try {
        const existing = getMgmtUsers();
        managers.forEach(m => { existing[m] = true; });
        saveMgmtUsers(existing);
      } catch(e) {}
    }
    const updated = {
      ...artistData,
      name: name.trim(),
      management: managers.join('; '),
      photo,
      labelUsers: selectedLabels,
      labelUser: selectedLabels[0] || artistData.labelUser,
    };
    saveOneArtist(updated);
    onSave(updated);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Cancelar</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Editar artista</div>
        <button onClick={handleSave} disabled={!name.trim()} style={{background:'transparent', border:'none', color: name.trim() ? t.accent : t.text3, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor: name.trim() ? 'pointer' : 'default', padding:0}}>Guardar</button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Photo */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:'36px'}}>
          <div onClick={() => fileRef.current.click()}
            style={{width:'90px', height:'90px', borderRadius:'50%', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
            {photo
              ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              : <span style={{fontSize:'28px'}}>📷</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        </div>

        {/* Name */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Nombre *</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del artista"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Management */}
        <div style={{marginBottom:'32px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Management</div>
          <input
            value={management}
            onChange={e => setManagement(e.target.value)}
            placeholder="Nombre del manager"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, marginTop:'6px'}}>Separa con ; para más de un manager</div>
        </div>

        {/* Label Managers */}
        {allLabelUsers.length > 0 && (
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Label Managers con acceso</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {allLabelUsers.map(n => {
                const isSelected = selectedLabels.includes(n);
                return (
                  <button key={n} onClick={() => toggleLabel(n)}
                    style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: isSelected ? t.text : t.bg2, border:`1px solid ${isSelected ? t.text : t.border}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'}}>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color: isSelected ? t.bg : t.text}}>{n}</span>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color: isSelected ? t.bg : t.text3}}>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSave} disabled={!name.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: name.trim() ? t.text : t.bg2, color: name.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: name.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT EDIT SCREEN
// ═══════════════════════════════════════════
