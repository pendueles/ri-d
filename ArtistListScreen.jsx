// components/screens/ArtistListScreen.jsx
import { useState, useEffect } from "react";
import { theme, isDark } from "../../theme/theme";
import { scoreColor } from "../../utils/helpers";
import { calcTotalScore } from "../../utils/scoring";
import { getArtists, saveOneArtist } from "../../firebase/store";
import { ARTIST_BLOCKS } from "../../data/questions";

export default function ArtistListScreen({ profile, onBack, onSelect, onCreate, liveArtists }) {
  const t = theme(isDark());
  useFirebaseStore(); // re-render on Firebase changes
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editingManagement, setEditingManagement] = useState(null);
  const [mgmtInput, setMgmtInput] = useState('');
  const allArtists = liveArtists || getArtists();
  const artists = profile.type === 'admin'
    ? allArtists
    : profile.type === 'label'
    ? allArtists.filter(a => a.labelUser === profile.name || (a.labelUsers && a.labelUsers.includes(profile.name)))
    : profile.type === 'management'
    ? allArtists.filter(a => a.management && a.management.split(';').map(m => m.trim().toLowerCase()).includes(profile.name.toLowerCase()))
    : allArtists.filter(a => a.name?.toLowerCase() === profile.name?.toLowerCase());

  const canEdit = profile.type === 'label' || profile.type === 'admin';

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleDelete = () => {
    deleteArtists(selected);
    setSelected([]);
    setEditMode(false);
  };

  const [selectedLabels, setSelectedLabels] = useState([]);
  useEffect(() => {
    if (editingManagement) {
      setSelectedLabels(editingManagement.labelUsers || [editingManagement.labelUser].filter(Boolean));
    }
  }, [editingManagement?.id]);
  const toggleLabel = (name) => setSelectedLabels(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleSaveManagement = (extraLabelUsers) => {
    const managers = mgmtInput.split(';').map(m => m.trim()).filter(Boolean);
    try {
      const existing = getMgmtUsers();
      managers.forEach(m => { existing[m] = true; });
      saveMgmtUsers(existing);
    } catch(e) {}
    const updated = { ...editingManagement, management: managers.join('; '), labelUsers: extraLabelUsers };
    saveOneArtist(updated);
    setEditingManagement(null);
    setMgmtInput('');
  };

  // Management edit modal
  if (editingManagement) {
    const allLabelUsers = Object.keys(getLabelUsers());

    return (
      <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
        <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
          <button onClick={() => setEditingManagement(null)} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>{editingManagement.name}</div>
          <div style={{width:'60px'}}/>
        </div>

        <div style={{flex:1, overflowY:'auto', padding:'32px 24px'}}>
          {/* Management */}
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Management</div>
            <input value={mgmtInput} onChange={e => setMgmtInput(e.target.value)}
              placeholder="Nombre del manager"
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'18px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}/>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, marginTop:'6px'}}>Separa con ; para añadir más de un manager</div>
          </div>

          {/* Label co-owners */}
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Label Managers con acceso</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {allLabelUsers.map(name => {
                const isSelected = selectedLabels.includes(name);
                return (
                  <button key={name} onClick={() => toggleLabel(name)}
                    style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: isSelected ? t.text : t.bg2, border:`1px solid ${isSelected ? t.text : t.border}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'}}>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color: isSelected ? t.bg : t.text}}>{name}</span>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color: isSelected ? t.bg : t.text3}}>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
          <button onClick={() => handleSaveManagement(selectedLabels)}
            style={{display:'block', width:'100%', padding:'17px', background:t.text, color:t.bg, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
            Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>
          {editMode ? 'Cancelar' : '← Atrás'}
        </button>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>Roster</div>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          {canEdit && !editMode && (
            <button onClick={() => setEditMode(true)}
              style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"14px", cursor:"pointer", padding:0 }}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{ background:"transparent", border:"none", color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"700", cursor: selected.length > 0 ? "pointer" : "default", padding:0 }}>
              Eliminar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            <button onClick={onCreate}
              style={{ background:"transparent", border:"none", color:t.accent, fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer", padding:0 }}>
              + Nuevo
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px" }}>
        {artists.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            <div style={{ fontSize:"56px", marginBottom:"20px" }}>🎤</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:t.text, marginBottom:"10px" }}>No tienes artistas en tu Roster todavía</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"14px", color:t.text2, marginBottom:"32px", maxWidth:"260px", lineHeight:"1.5" }}>Añade tu primer artista al Roster para empezar a evaluar</div>
            <button onClick={onCreate} style={{ padding:"16px 32px", background:t.accent, color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
              + Nuevo artista
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {artists.map((artist, i) => (
              <button key={artist.id || i}
                onClick={() => editMode ? toggleSelect(artist.id) : onSelect(artist)}
                style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px", background:t.card, border:`1px solid ${editMode && selected.includes(artist.id) ? '#E8151B' : t.border}`, borderRadius:"16px", cursor:"pointer", textAlign:"left", width:"100%", boxShadow:`0 2px 8px ${t.shadow}` }}>

                {/* Checkbox in edit mode */}
                {editMode && (
                  <div style={{ width:"22px", height:"22px", borderRadius:"50%", border:`2px solid ${selected.includes(artist.id) ? '#E8151B' : t.border}`, background: selected.includes(artist.id) ? '#E8151B' : 'transparent', display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {selected.includes(artist.id) && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                  </div>
                )}

                {artist.photo ? (
                  <img src={artist.photo} alt="" style={{ width:"48px", height:"48px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:t.bg2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"22px" }}>🎤</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:t.text, marginBottom:"2px" }}>{artist.name}</div>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text2 }}>
                    {(artist.labelUsers?.length > 0 ? artist.labelUsers : [artist.labelUser].filter(Boolean)).join(', ') || "Sin label manager"}
                  </div>
                </div>
                {!editMode && (() => {
                  const ans = artist.answers || {};
                  const answered = Object.keys(ans).length;
                  if (answered === 0) return null;
                  const score = Math.round(calcTotalScore(ARTIST_BLOCKS, ans) * 10) / 10;
                  return <div style={{ fontFamily:"Arial,sans-serif", fontSize:"18px", fontWeight:"700", color:scoreColor(score), flexShrink:0, marginRight:'4px' }}>{score}</div>;
                })()}
                {!editMode && canEdit && (
                  <button onClick={e => { e.stopPropagation(); setEditingManagement(artist); setMgmtInput(artist.management || ''); }}
                    style={{ background:"transparent", border:"none", color:t.text3, fontFamily:"Arial,sans-serif", fontSize:"12px", cursor:"pointer", padding:"4px 8px", flexShrink:0 }}>
                    ✎
                  </button>
                )}
                {!editMode && <div style={{ color:t.text3, fontSize:"18px" }}>›</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT (SONG) LIST SCREEN
// ═══════════════════════════════════════════
