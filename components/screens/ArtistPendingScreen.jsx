// components/screens/ArtistPendingScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { getPendingTasks } from "../../utils/helpers";

const PRIORITY_COLOR = { Alta: "#E24B4A", Media: "#BA7517", Baja: "#378ADD" };

function KpiCard({ label, value, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        background: "#ffffff",
        border: "1px solid #EAEAEA",
        borderRadius: "20px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: hover ? "0 8px 20px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hover ? "translateY(-3px)" : "none",
        transition: "all 0.2s ease",
      }}>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: "13px", fontWeight: "700", color: "#888888", letterSpacing: "0.06em", marginBottom: "8px" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: "34px", fontWeight: "700", color: "#0a0a0a" }}>
        {value}
      </div>
    </button>
  );
}

function TaskRow({ task, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: "1px solid #F2F2F2", padding: "12px 0", cursor: "pointer" }}>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: "14px", fontWeight: "700", color: "#0a0a0a", marginBottom: "4px" }}>
        {task.title}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontFamily: "Arial,sans-serif", fontSize: "11px", color: "#aaaaaa" }}>{task.category}</span>
        <span style={{ fontFamily: "Arial,sans-serif", fontSize: "11px", fontWeight: "700", color: PRIORITY_COLOR[task.priority] }}>{task.priority} prioridad</span>
        <span style={{ fontFamily: "Arial,sans-serif", fontSize: "11px", fontWeight: "700", color: "#639922", marginLeft: "auto" }}>+{task.impact} pts</span>
      </div>
    </button>
  );
}

// Two KPI cards (Perfil / Catálogo) leading into the detailed task list for
// whichever the person taps — mirrors the Perfil/Catálogo cards on the
// artist home screen, just scoped to pending ("answered no") tasks.
export default function ArtistPendingScreen({ artistAnswers, artistProjects, artistBlocks, songBlocks, onBack, onGoToProfileQuestion, onGoToProjectQuestion }) {
  const t = theme(isDark());
  const [view, setView] = useState("overview"); // "overview" | "perfil" | "catalogo"

  const profileTasks = getPendingTasks(artistBlocks, artistAnswers);
  const catalogueTasks = (artistProjects || []).flatMap(p =>
    getPendingTasks(songBlocks, p.answers || {}).map(t => ({ ...t, projectId: p.id, projectTitle: p.title }))
  );

  const title = view === "perfil" ? "Perfil" : view === "catalogo" ? "Catálogo" : "Tareas pendientes";
  const tasks = view === "perfil" ? profileTasks : view === "catalogo" ? catalogueTasks : [];
  const priorityRank = { Alta: 0, Media: 1, Baja: 2 };
  const sortedTasks = [...tasks].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.impact - a.impact);

  return (
    <div style={{ minHeight: "100dvh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", paddingTop: "max(16px,env(safe-area-inset-top,16px))", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.border}` }}>
        <button onClick={() => view === "overview" ? onBack() : setView("overview")} style={{ background: "transparent", border: "none", color: "#aaaaaa", fontFamily: "Arial,sans-serif", fontSize: "15px", cursor: "pointer", padding: 0 }}>
          {view === "overview" ? "← Volver" : "← Tareas pendientes"}
        </button>
        <div style={{ fontFamily: "Arial,sans-serif", fontSize: "15px", fontWeight: "700", color: "#0a0a0a" }}>{title}</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "24px 20px", maxWidth: "480px", width: "100%", margin: "0 auto" }}>
        {view === "overview" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <KpiCard label="Perfil" value={profileTasks.length} onClick={() => setView("perfil")} />
            <KpiCard label="Catálogo" value={catalogueTasks.length} onClick={() => setView("catalogo")} />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", textAlign: "center" }}>
            <div style={{ fontFamily: "Arial,sans-serif", fontSize: "18px", fontWeight: "700", color: "#0a0a0a", marginBottom: "6px" }}>Todo al día</div>
            <div style={{ fontFamily: "Arial,sans-serif", fontSize: "14px", color: "#aaaaaa" }}>No hay tareas pendientes en {title.toLowerCase()}</div>
          </div>
        ) : (
          <div>
            {sortedTasks.map((task, i) => (
              <TaskRow
                key={`${task.id}-${task.projectId || 'profile'}-${i}`}
                task={task}
                onClick={() => view === "perfil" ? onGoToProfileQuestion(task.id) : onGoToProjectQuestion(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
