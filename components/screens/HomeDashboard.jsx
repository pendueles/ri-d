// components/screens/HomeDashboard.jsx
import { useState } from "react";

const BG = "#F7F7F7";
const CARD_BG = "#ffffff";
const BORDER = "#EAEAEA";
const TEXT = "#0a0a0a";
const TEXT_MUTED = "#aaaaaa";
const FONT = "Inter, Arial, sans-serif";

function KpiCard({ label, value, big, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: "20px",
        height: big ? "260px" : "130px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        width: "100%",
        boxShadow: hover ? "0 8px 20px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hover ? "translateY(-3px)" : "none",
        transition: "all 0.2s ease",
      }}>
      <div style={{ fontFamily: FONT, fontSize: big ? "26px" : "17px", fontWeight: "700", letterSpacing: "0.02em", color: TEXT, marginBottom: big ? "10px" : "6px" }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT, fontSize: big ? "22px" : "14px", fontWeight: "700", color: TEXT_MUTED, lineHeight: 1 }}>
        {value}
      </div>
    </button>
  );
}

export default function HomeDashboard({ logo, dark, errorBanner, totalArtists, totalCatalogue, totalTeam, totalClients, onArtists, onCatalogue, onTeam, onClients, onChangeProfile }) {
  return (
    <div style={{ minHeight: "100dvh", background: BG, display: "flex", flexDirection: "column" }}>
      {errorBanner}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 20px", paddingTop: "max(32px, env(safe-area-inset-top, 32px))", maxWidth: "480px", width: "100%", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <img src={logo} alt="RI+D" style={{ width: "64px", height: "64px", objectFit: "contain", filter: dark ? "invert(1)" : "none" }}/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <KpiCard label="Artistas" value={totalArtists} big onClick={onArtists}/>
          <KpiCard label="Catálogo" value={totalCatalogue} big onClick={onCatalogue}/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <KpiCard label="Equipo" value={totalTeam} onClick={onTeam}/>
          <KpiCard label="Clientes" value={totalClients} onClick={onClients}/>
        </div>

      </div>

      <div style={{ padding: "16px 24px", paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))", display: "flex", justifyContent: "center" }}>
        <button onClick={onChangeProfile} style={{ background: "transparent", border: "none", color: "#aaaaaa", fontFamily: FONT, fontSize: "13px", cursor: "pointer", padding: "8px" }}>
          Cambiar perfil
        </button>
      </div>
    </div>
  );
}
