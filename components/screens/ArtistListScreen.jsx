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

  // Score helpers for KPI cards
  const getArtistScore = (artist) => {
    const ans = artist.answers || {};
    if (Object.keys(ans).length === 0) return null;
    return Math.round(calcTotalScore(ARTIST_BLOCKS, ans) * 10) / 10;
  };

  const kpiColor = (score) => {
    if (score === null) return { solid: '#9CA3AF', text: '#374151' }; // gris neutro si no hay score
    if (score > 80) return { solid: '#639922', text: '#173404' }; // verde
    if (score >= 60) return { solid: '#378ADD', text: '#042C53' }; // azul
    if (score >= 40) return { solid: '#BA7517', text: '#412402' }; // naranja
    return { solid: '#E24B4A', text: '#501313' }; // rojo
  };

  // Ordenar por score descendente; sin score al final
  const sortedArtists = [...artists].sort((a, b) => {
    const sa = getArtistScore(a);
    const sb = getArtistScore(b);
    if (sa === null && sb === null) return 0;
    if (sa === null) return 1;
    if (sb === null) return -1;
    return sb - sa;
  });

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

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px", background:"#ffffff" }}>
        {sortedArtists.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            <div style={{ fontSize:"56px", marginBottom:"20px" }}>🎤</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:"#0a0a0a", marginBottom:"10px" }}>No tienes artistas en tu Roster todavía</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"14px", color:"#555555", marginBottom:"32px", maxWidth:"260px", lineHeight:"1.5" }}>Añade tu primer artista al Roster para empezar a evaluar</div>
            <button onClick={onCreate} style={{ padding:"16px 32px", background:t.accent, color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
              + Nuevo artista
            </button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"20px" }}>
            {sortedArtists.map((artist, i) => {
              const score = getArtistScore(artist);
              const color = kpiColor(score);
              const isSelected = selected.includes(artist.id);
              const team = (artist.labelUsers?.length > 0 ? artist.labelUsers : [artist.labelUser].filter(Boolean));
              return (
                <ArtistKpiCard
                  key={artist.id || i}
                  artist={artist}
                  score={score}
                  color={color}
                  team={team}
                  editMode={editMode}
                  isSelected={isSelected}
                  canEdit={canEdit}
                  onClick={() => editMode ? toggleSelect(artist.id) : onSelect(artist)}
                  onEditManagement={(e) => { e.stopPropagation(); setEditingManagement(artist); setMgmtInput(artist.management || ''); }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// KPI card: foto a sangre completa, score como badge,
// degradado inferior con nombre + barra + equipo
// ─────────────────────────────────────────
function ArtistKpiCard({ artist, score, color, team, editMode, isSelected, canEdit, onClick, onEditManagement }) {
  const [hover, setHover] = useState(false);
  const hasPhoto = !!artist.photo;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:"relative",
        aspectRatio:"3/4",
        border: isSelected ? "2px solid #E8151B" : "none",
        borderRadius:"22px",
        overflow:"hidden",
        cursor:"pointer",
        textAlign:"left",
        background: hasPhoto ? "#1a1a1a" : color.solid,
        boxShadow: hover ? "0 14px 30px rgba(0,0,0,0.18)" : "0 2px 10px rgba(0,0,0,0.08)",
        transform: hover ? "translateY(-2px) scale(1.02)" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}>

      {hasPhoto && (
        <img src={artist.photo} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
      )}

      {/* Degradado inferior para legibilidad */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)" }}/>

      {/* Checkbox en modo edición */}
      {editMode && (
        <div style={{ position:"absolute", top:"14px", left:"14px", width:"24px", height:"24px", borderRadius:"50%", border:`2px solid ${isSelected ? '#E8151B' : '#ffffff'}`, background: isSelected ? '#E8151B' : 'rgba(0,0,0,0.25)', display:"flex", alignItems:"center", justifyContent:"center" }}>
          {isSelected && <span style={{color:'white', fontSize:'13px', fontWeight:'700'}}>✓</span>}
        </div>
      )}

      {/* Score como badge */}
      {score !== null && (
        <div style={{ position:"absolute", top:"14px", left: editMode ? "48px" : "14px", background:"#ffffff", color:color.text, fontFamily:"Arial,sans-serif", fontSize:"18px", fontWeight:"700", padding:"6px 12px", borderRadius:"12px", boxShadow:"0 2px 6px rgba(0,0,0,0.15)" }}>
          {score.toFixed(1)}
        </div>
      )}

      {/* Flecha de detalle / botón de gestión */}
      {!editMode && canEdit && (
        <button onClick={onEditManagement}
          style={{ position:"absolute", top:"12px", right:"10px", background:"rgba(0,0,0,0.35)", border:"none", color:"#ffffff", fontSize:"14px", cursor:"pointer", padding:"6px 8px", borderRadius:"8px" }}>
          ✎
        </button>
      )}
      {!editMode && (
        <div style={{ position:"absolute", bottom:"18px", right:"18px", color:"#ffffff", fontSize:"20px" }}>›</div>
      )}

      {/* Nombre + barra + equipo */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"18px" }}>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"19px", fontWeight:"700", color:"#ffffff", marginBottom:"8px" }}>
          {artist.name}
        </div>

        {score !== null && (
          <div style={{ width:"100%", height:"6px", borderRadius:"6px", background:"rgba(255,255,255,0.25)", overflow:"hidden", marginBottom:"10px" }}>
            <div style={{ width:`${score}%`, height:"100%", background:"#ffffff", borderRadius:"6px" }}/>
          </div>
        )}

        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.85)" }}>
          {team.length > 0 ? team.join(' · ') : "Sin equipo asignado"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT (SONG) LIST SCREEN
// ═══════════════════════════════════════════
