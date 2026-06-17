// components/forms/FormScreen.jsx
import { useState, useRef } from "react";
import { theme, isDark } from "../../theme/theme";

export default function FormScreen({ title, subtitle, fields, onSubmit, bgProgress=0, onBack=null }) {
  const t = theme(isDark());
  const [vals, setVals] = useState({});
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = () => {
    const required = fields.filter(f => f.required);
    for (const f of required) {
      if (!vals[f.id] || !vals[f.id].trim()) {
        alert(`Por favor rellena: ${f.label}`);
        return;
      }
    }
    onSubmit({ ...vals, photo });
  };

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      {/* Topbar */}
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top, 16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        {onBack
          ? <button onClick={onBack} style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>← Atrás</button>
          : <div style={{ width:"60px" }}/>
        }
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>{title}</div>
        <div style={{ width:"60px" }}/>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"32px 24px" }}>
        {subtitle && (
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:"13px", color:t.text3, marginBottom:"28px" }}>{subtitle}</div>
        )}

        {/* Photo upload */}
        {fields.some(f => f.id === 'photo') || (
          <div style={{ display:"flex", justifyContent:"center", marginBottom:"32px" }}>
            <div onClick={() => fileRef.current.click()}
              style={{ width:"80px", height:"80px", borderRadius:"50%", background: photo ? "transparent" : t.bg2, border:`1.5px dashed ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden" }}>
              {photo
                ? <img src={photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontSize:"24px" }}>📷</span>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
          </div>
        )}

        {fields.map(f => (
          <div key={f.id} style={{ marginBottom:"28px" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>{f.label}{f.required ? " *" : ""}</div>
            <input
              type={f.type || "text"}
              placeholder={f.placeholder || ""}
              value={vals[f.id] || ""}
              onChange={e => setVals(v => ({ ...v, [f.id]: e.target.value }))}
              style={{ display:"block", width:"100%", background:"transparent", border:"none", borderBottom:`1.5px solid ${t.border}`, padding:"10px 0", fontFamily:"Arial,sans-serif", fontSize:"17px", color:t.text, outline:"none", WebkitAppearance:"none" }}
            />
          </div>
        ))}
      </div>

      <div style={{ padding:"16px 24px", paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", borderTop:`1px solid ${t.border}` }}>
        <button onClick={handleSubmit}
          style={{ display:"block", width:"100%", padding:"17px", background:t.text, color:t.bg, border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer" }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}
