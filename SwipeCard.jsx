// components/quiz/SwipeCard.jsx
import { useState, useRef, useCallback } from "react";
import { theme, isDark } from "../../theme/theme";
import { QUESTION_HINTS } from "../../data/questions";

export default function SwipeCard({ question, onAnswer, currentIndex, total, answers, blockLabel, subcatLabel, phase, phaseName, photo, onHome, onGoHome, onGoBlock }) {
  const [showHint, setShowHint] = useState(false);
  const cardRef = useRef(null);
  const startX = useRef(null);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [leaving, setLeaving] = useState(null);

  const hint = question && QUESTION_HINTS && QUESTION_HINTS[question.id];
  const answered = question ? answers[question.id] : undefined;

  const triggerAnswer = useCallback((yes) => {
    if (!question) return;
    setLeaving(yes ? "right" : "left");
    setTimeout(() => {
      setLeaving(null);
      setDragX(0);
      onAnswer(question.id, yes);
    }, 280);
  }, [question?.id, onAnswer]);

  if (!question) return null;

  // Touch handlers
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };
  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    if (Math.abs(currentX.current) > 80) {
      triggerAnswer(currentX.current > 0);
    } else {
      setDragX(0);
    }
    currentX.current = 0;
  };

  // Mouse handlers (desktop)
  const onMouseDown = (e) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (Math.abs(currentX.current) > 80) {
      triggerAnswer(currentX.current > 0);
    } else {
      setDragX(0);
    }
    currentX.current = 0;
  };

  const rotation = dragX * 0.08;
  const opacity = leaving ? 0 : Math.max(0.3, 1 - Math.abs(dragX) / 300);
  let tx = dragX;
  if (leaving === "right") tx = 400;
  if (leaving === "left") tx = -400;

  const showYes = dragX > 30 || leaving === "right";
  const showNo = dragX < -30 || leaving === "left";

  const progress = Math.round((currentIndex / total) * 100);

  const t = theme(isDark());
  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100dvh", background:t.bg, position:"relative", overflow:"hidden" }}>

      {/* Progress bar — top */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"#f0f0f0", zIndex:10 }}>
        <div style={{ height:"100%", width:`${progress}%`, background:"#111", transition:"width 0.3s ease" }}/>
      </div>

      {/* Header — breadcrumb navigation */}
      <div style={{ padding:"20px 20px 0", paddingTop:"max(20px, env(safe-area-inset-top, 20px))", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onHome} style={{ background:"transparent", border:"none", color:"#aaa", fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:0 }}>
          {onHome ? "← Volver" : ""}
        </button>
        {/* Breadcrumb: Artista/Canción › Bloque › Subcat */}
        <div style={{ display:"flex", alignItems:"center", gap:"4px", flex:1, justifyContent:"center" }}>
          {phaseName && (
            <button onClick={onGoHome} style={{ background:"transparent", border:"none", fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color: onGoHome ? "#E8151B" : "#bbb", letterSpacing:"0.06em", textTransform:"uppercase", cursor: onGoHome ? "pointer" : "default", padding:"2px 4px", borderRadius:"6px" }}>
              {phaseName}
            </button>
          )}
          {blockLabel && phaseName && <span style={{ color:"#ccc", fontSize:"10px" }}>›</span>}
          {blockLabel && (
            <button onClick={onGoBlock} style={{ background:"transparent", border:"none", fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color: onGoBlock ? "#111" : "#bbb", letterSpacing:"0.06em", textTransform:"uppercase", cursor: onGoBlock ? "pointer" : "default", padding:"2px 4px", borderRadius:"6px" }}>
              {blockLabel}
            </button>
          )}
          {subcatLabel && blockLabel && <span style={{ color:"#ccc", fontSize:"10px" }}>›</span>}
          {subcatLabel && (
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", color:"#bbb", letterSpacing:"0.06em", textTransform:"uppercase" }}>{subcatLabel}</span>
          )}
        </div>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"13px", fontWeight:"700", color:"#aaa" }}>{currentIndex}/{total}</div>
      </div>

      {/* Swipe hint labels */}
      <div style={{ position:"absolute", top:"50%", left:"20px", transform:"translateY(-50%)", opacity: showNo ? 1 : 0, transition:"opacity 0.15s", background:"#E8151B", color:"white", fontFamily:"Arial,sans-serif", fontWeight:"700", fontSize:"16px", padding:"6px 14px", borderRadius:"8px" }}>NO</div>
      <div style={{ position:"absolute", top:"50%", right:"20px", transform:"translateY(-50%)", opacity: showYes ? 1 : 0, transition:"opacity 0.15s", background:"#111", color:"white", fontFamily:"Arial,sans-serif", fontWeight:"700", fontSize:"16px", padding:"6px 14px", borderRadius:"8px" }}>SÍ</div>

      {/* Card */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 20px" }}>
        <div
          ref={cardRef}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{
            width:"100%", maxWidth:"380px",
            background:"#fff",
            borderRadius:"20px",
            padding:"32px 28px",
            boxShadow:"0 4px 40px rgba(0,0,0,0.08)",
            border:"1px solid #f0f0f0",
            transform:`translateX(${tx}px) rotate(${rotation}deg)`,
            transition: leaving ? "transform 0.28s ease, opacity 0.28s ease" : dragX === 0 ? "transform 0.3s ease" : "none",
            opacity,
            cursor:"grab",
            userSelect:"none",
            touchAction:"none",
            position:"relative",
          }}
        >
          {/* Block badge */}
          <div style={{ marginBottom:"24px" }}>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:t?.text3 || "#bbb", letterSpacing:"0.12em", textTransform:"uppercase" }}>{blockLabel}</span>
          </div>

          {/* Question + hint */}
          <div style={{ position:"relative", marginBottom:"32px" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"20px", fontWeight:"700", color:"#111", lineHeight:"1.35", paddingRight: hint ? "36px" : "0" }}>
              {question.q || question.label}
            </div>
            {hint && (
              <button onClick={() => setShowHint(!showHint)}
                style={{ position:"absolute", top:"2px", right:0, width:"26px", height:"26px", borderRadius:"50%", background:"#f5f5f5", border:"1px solid #e8e8e8", color:"#999", fontFamily:"Arial,sans-serif", fontSize:"12px", fontWeight:"700", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ?
              </button>
            )}
            {hint && showHint && (
              <div style={{ marginTop:"12px", background:"#f8f8f8", color:"#444", fontFamily:"Arial,sans-serif", fontSize:"12px", lineHeight:"1.6", padding:"14px 16px", borderRadius:"12px", border:"1px solid #eee" }}>
                {hint}
              </div>
            )}
          </div>

          {/* Already answered indicator */}
          {answered !== undefined && (
            <div style={{ padding:"8px 12px", borderRadius:"8px", background: answered ? "#f0fdf4" : t.bg2, border:`1px solid ${answered ? "#86efac" : t.border}`, fontFamily:"Arial,sans-serif", fontSize:"12px", fontWeight:"700", color: answered ? "#15803d" : t.text2, textAlign:"center", marginBottom:"16px" }}>
              {answered ? "✓ SÍ" : "✗ NO"} — desliza para cambiar
            </div>
          )}

          {/* Swipe hint */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", color:"#888", fontWeight:"700" }}>← NO</span>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"10px", color:"#ccc" }}>desliza</span>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", color:"#111", fontWeight:"700" }}>SÍ →</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding:"0 20px 16px" }}>
        <div style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
          <button onClick={() => triggerAnswer(false)}
            style={{ flex:1, padding:"16px", background:"#111", color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
            ✗ NO
          </button>
          <button onClick={() => triggerAnswer(true)}
            style={{ flex:1, padding:"16px", background:"#111", color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
            ✓ SÍ
          </button>
        </div>
        <div style={{ display:"flex", gap:"8px", justifyContent:"center" }}>
          {currentIndex > 1 && (
            <button onClick={() => onAnswer("__back__")}
              style={{ background:"transparent", border:"1px solid #e8e8e8", color:"#aaa", fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:"10px 20px", borderRadius:"10px" }}>← Atrás</button>
          )}
          <button onClick={() => onAnswer("__skip__")}
            style={{ background:"transparent", border:"1px solid #e8e8e8", color:"#aaa", fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:"10px 20px", borderRadius:"10px" }}>Saltar →</button>
        </div>
      </div>

      <div style={{ paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))" }}/>
    </div>
  );
}
