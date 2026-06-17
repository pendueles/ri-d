// components/forms/ProjectEditScreen.jsx
import { useState, useEffect, useRef } from "react";
import { theme, isDark, useDarkMode } from "../../theme/theme";
import { scoreColor, scoreLabel, bgColor } from "../../utils/helpers";
import { calcBlockScore, calcTotalScore } from "../../utils/scoring";
import { RIMAS_LOGO, ICON_ARTISTA, ICON_PROYECTO } from "../../data/assets";
import HexRadarTotal from "../ui/HexRadarTotal";
import { getArtists, saveOneArtist, saveProject } from "../../firebase/store";
import { ARTIST_BLOCKS, SONG_BLOCKS, SONG_QUESTIONS } from "../../data/questions";

export default function ProjectEditScreen({ songData, onBack, onSave }) {
  const t = theme(isDark());
  const [title, setTitle] = useState(songData?.title || '');
  const [date, setDate] = useState(songData?.date || '');
  const [participants, setParticipants] = useState(songData?.participants || '');
  const [photo, setPhoto] = useState(songData?.photo || null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...songData, title: title.trim(), date, participants, photo });
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Cancelar</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Editar proyecto</div>
        <button onClick={handleSave} disabled={!title.trim()} style={{background:'transparent', border:'none', color: title.trim() ? t.accent : t.text3, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', padding:0}}>Guardar</button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Photo */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:'36px'}}>
          <div onClick={() => fileRef.current.click()}
            style={{width:'90px', height:'90px', borderRadius:'14px', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
            {photo
              ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              : <span style={{fontSize:'28px'}}>🎵</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        </div>

        {/* Title */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Título *</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nombre del proyecto"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Artista (read-only) */}
        {songData?.artistName && (
          <div style={{marginBottom:'28px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Artista</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text2, padding:'10px 0', borderBottom:`1.5px solid ${t.border}`}}>{songData.artistName}</div>
          </div>
        )}

        {/* Release date */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Fecha de lanzamiento</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Participants */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Participantes</div>
          <input
            value={participants}
            onChange={e => setParticipants(e.target.value)}
            placeholder="Productores, feats, etc."
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSave} disabled={!title.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: title.trim() ? t.text : t.bg2, color: title.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
