// components/forms/ProjectForm.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { getArtists } from "../../firebase/store";

export default function ProjectForm({ profile, songNum, onBack, onSubmit, prefilledArtist }) {
  const t = theme(isDark());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [participants, setParticipants] = useState('');
  const [artistInput, setArtistInput] = useState(prefilledArtist?.name || '');
  const [linkedArtist, setLinkedArtist] = useState(prefilledArtist || null);
  const [artistError, setArtistError] = useState('');

  const allArtists = getArtists();

  const handleArtistChange = (val) => {
    setArtistInput(val);
    setArtistError('');
    const found = allArtists.find(a => a.name && a.name.toLowerCase() === val.toLowerCase());
    setLinkedArtist(found || null);
    if (val.trim() && !found) setArtistError('Artista no encontrado');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, date, participants, artistName: linkedArtist?.name || artistInput, linkedArtist });
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Nuevo proyecto</div>
        <div style={{width:'60px'}}/>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Artista */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Artista</div>
          <input
            value={artistInput}
            onChange={e => handleArtistChange(e.target.value)}
            placeholder="Nombre del artista"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${artistError ? '#E8151B' : linkedArtist ? '#16a34a' : t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
          {linkedArtist && (
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#16a34a', marginTop:'6px', display:'flex', alignItems:'center', gap:'6px'}}>
              {linkedArtist.photo && <img src={linkedArtist.photo} alt="" style={{width:'20px', height:'20px', borderRadius:'50%', objectFit:'cover'}}/>}
              ✓ Vinculado a {linkedArtist.name}
            </div>
          )}
          {artistError && <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#E8151B', marginTop:'6px'}}>{artistError}</div>}
        </div>

        {/* Título */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Título *</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título del proyecto"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Fecha */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Fecha de lanzamiento</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Participantes */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Participantes / Featurings</div>
          <input
            value={participants}
            onChange={e => setParticipants(e.target.value)}
            placeholder="Nombres separados por coma"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSubmit} disabled={!title.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: title.trim() ? t.text : t.bg2, color: title.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Continuar →
        </button>
      </div>
    </div>
  );
}
