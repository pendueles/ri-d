// components/ui/ResetButton.jsx
import { useState } from "react";

export default function ResetButton({ onReset }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
      <span style={{ fontFamily:"Arial, sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.7)" }}>¿Seguro?</span>
      <button onClick={onReset} style={{ background:"#dc2626", border:"none", color:"white", fontFamily:"Arial, sans-serif", fontSize:"11px", fontWeight:"700", padding:"4px 10px", borderRadius:"6px", cursor:"pointer" }}>Sí</button>
      <button onClick={() => setConfirm(false)} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", fontFamily:"Arial, sans-serif", fontSize:"11px", padding:"4px 10px", borderRadius:"6px", cursor:"pointer" }}>No</button>
    </div>
  );
  return (
    <button onClick={() => setConfirm(true)} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"rgba(255,255,255,0.8)", fontFamily:"Arial, sans-serif", fontSize:"11px", fontWeight:"600", padding:"5px 10px", borderRadius:"8px", cursor:"pointer" }}>
      ⟳ Inicio
    </button>
  );
}
