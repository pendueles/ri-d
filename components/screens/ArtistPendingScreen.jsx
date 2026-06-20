// components/screens/ArtistPendingScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { getPendingTasks, BLOCK_ORDER, SUBCAT_ORDER } from "../../utils/helpers";

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
        <span style={{ fontFamily: "Arial,sans-serif", fontSize: "11px", fontWeight: "700", color: PRIORITY_COLOR[task.priority] }}>{task.priority} prioridad</span>
        <span style={{ fontFamily: "Arial,sans-serif", fontSize: "11px", fontWeight: "700", color: "#639922", marginLeft: "auto" }}>+{task.impact} pts</span>
      </div>
    </button>
  );
}

// Re-groups an already block/subcat-sorted flat task list into
// Area > Subcategory sections, for clear visual separation when rendering.
function groupTasksByAreaAndSubcat(tasks) {
  const groups = [];
  tasks.forEach(task => {
    let blockGroup = groups.find(g => g.blockId === task.blockId);
    if (!blockGroup) { blockGroup = { blockId: task.blockId, label: task.category, subcats: [] }; groups.push(blockGroup); }
    let subGroup = blockGroup.subcats.find(s => s.subcatId === task.subcatId);
    if (!subGroup) { subGroup = { subcatId: task.subcatId, label: task.subcatLabel, tasks: [] }; blockGroup.subcats.push(subGroup); }
    subGroup.tasks.push(task);
  });
  return groups;
}

function TaskSections({ tasks, onTaskClick, showAreaHeader = true }) {
  const groups = groupTasksByAreaAndSubcat(tasks);
  return (
    <div>
      {groups.map(block => (
        <div key={block.blockId} style={{ marginBottom: "28px" }}>
          {showAreaHeader && (
            <div style={{ fontFamily: "Arial,sans-serif", fontSize: "18px", fontWeight: "700", color: "#0a0a0a", marginBottom: "12px" }}>
              {block.label}
            </div>
          )}
          {block.subcats.map(sub => (
            <div key={sub.subcatId} style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: "Arial,sans-serif", fontSize: "13px", fontWeight: "700", color: "#aaaaaa", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
                {sub.label}
              </div>
              {sub.tasks.map((task, i) => (
                <TaskRow key={`${task.id}-${i}`} task={task} onClick={() => onTaskClick(task)} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Two KPI cards (Perfil / Catálogo) leading into the detailed task list for
// whichever the person taps — mirrors the Perfil/Catálogo cards on the
// artist home screen, just scoped to pending ("answered no") tasks.
export default function ArtistPendingScreen({ artistAnswers, artistProjects, artistBlocks, songBlocks, onBack, onGoToProfileQuestion, onGoToProjectQuestion, initialView = "overview", blockFilter = null }) {
  const t = theme(isDark());
  const [view, setView] = useState(initialView); // "overview" | "perfil" | "catalogo"
  const skippedOverview = initialView !== "overview"; // came directly from Perfil/Catálogo card elsewhere in the app

  // When entering scoped to a single block (e.g. DSPs) or a single
  // subcategory within it (e.g. Spotify), use the passed-in object as-is —
  // it may already be pre-filtered to just one subcat.
  const effectiveBlocks = blockFilter ? [blockFilter] : artistBlocks;
  const profileTasks = getPendingTasks(effectiveBlocks, artistAnswers, BLOCK_ORDER, SUBCAT_ORDER.artist);

  // Catalogue tasks keep their natural song order (as the songs come in),
  // and within each song are sorted Area → Subcategory → Points.
  const catalogueTasksBySong = (artistProjects || []).map(p => ({
    projectId: p.id,
    projectTitle: p.title || "Sin título",
    tasks: getPendingTasks(songBlocks, p.answers || {}, BLOCK_ORDER, SUBCAT_ORDER.song).map(t => ({ ...t, projectId: p.id, projectTitle: p.title })),
  })).filter(group => group.tasks.length > 0);
  const catalogueTasks = catalogueTasksBySong.flatMap(g => g.tasks);

  const title = blockFilter ? blockFilter.label : view === "perfil" ? "Perfil" : view === "catalogo" ? "Catálogo" : "Tareas pendientes";
  const sortedTasks = blockFilter ? profileTasks : view === "perfil" ? profileTasks : [];
  const showOverviewButton = !blockFilter && view !== "overview" && !skippedOverview;

  return (
    <div style={{ minHeight: "100dvh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px", paddingTop: "max(16px,env(safe-area-inset-top,16px))", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.border}` }}>
        <button onClick={() => showOverviewButton ? setView("overview") : onBack()} style={{ background: "transparent", border: "none", color: "#aaaaaa", fontFamily: "Arial,sans-serif", fontSize: "15px", cursor: "pointer", padding: 0 }}>
          {showOverviewButton ? "← Tareas pendientes" : "← Volver"}
        </button>
        <div style={{ fontFamily: "Arial,sans-serif", fontSize: "15px", fontWeight: "700", color: "#0a0a0a" }}>{title}</div>
        <div style={{ width: "60px" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "24px 20px", maxWidth: "480px", width: "100%", margin: "0 auto" }}>
        {(!blockFilter && view === "overview") ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <KpiCard label="Perfil" value={profileTasks.length} onClick={() => setView("perfil")} />
            <KpiCard label="Catálogo" value={catalogueTasks.length} onClick={() => setView("catalogo")} />
          </div>
        ) : view === "catalogo" && !blockFilter ? (
          catalogueTasksBySong.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", textAlign: "center" }}>
              <div style={{ fontFamily: "Arial,sans-serif", fontSize: "18px", fontWeight: "700", color: "#0a0a0a", marginBottom: "6px" }}>Todo al día</div>
              <div style={{ fontFamily: "Arial,sans-serif", fontSize: "14px", color: "#aaaaaa" }}>No hay tareas pendientes en el catálogo</div>
            </div>
          ) : (
            <div>
              {catalogueTasksBySong.map(group => (
                <div key={group.projectId} style={{ marginBottom: "24px" }}>
                  <div style={{ fontFamily: "Arial,sans-serif", fontSize: "13px", fontWeight: "700", color: "#0a0a0a", marginBottom: "4px" }}>
                    {group.projectTitle}
                  </div>
                  {group.tasks.map((task, i) => (
                    <TaskRow
                      key={`${task.id}-${task.projectId}-${i}`}
                      task={task}
                      onClick={() => onGoToProjectQuestion(task)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )
        ) : sortedTasks.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", textAlign: "center" }}>
            <div style={{ fontFamily: "Arial,sans-serif", fontSize: "18px", fontWeight: "700", color: "#0a0a0a", marginBottom: "6px" }}>Todo al día</div>
            <div style={{ fontFamily: "Arial,sans-serif", fontSize: "14px", color: "#aaaaaa" }}>No hay tareas pendientes en {title.toLowerCase()}</div>
          </div>
        ) : (
          <TaskSections tasks={sortedTasks} onTaskClick={(task) => onGoToProfileQuestion(task.id)} showAreaHeader={!blockFilter} />
        )}
      </div>
    </div>
  );
}
