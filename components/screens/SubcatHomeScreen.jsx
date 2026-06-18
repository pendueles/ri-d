// components/screens/SubcatHomeScreen.jsx
import { useState } from "react";
import { theme, isDark } from "../../theme/theme";
import { getPendingTasks } from "../../utils/helpers";

function KpiCard({ label, value, onClick }) {
  const [hover, setHover] = useState(false);
  const clickable = typeof onClick === 'function';
  return (
    <button
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => clickable && setHover(true)}
      onMouseLeave={() => clickable && setHover(false)}
      disabled={!clickable}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: '#ffffff',
        border: '1px solid #EAEAEA',
        borderRadius: '20px',
        padding: '20px',
        cursor: clickable ? 'pointer' : 'default',
        boxShadow: hover ? '0 8px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
      }}>
      <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '28px', fontWeight: '700', color: '#0a0a0a' }}>
        {value !== null ? value : '—'}
      </div>
    </button>
  );
}

// Intermediate screen shown when entering a subcategory (e.g. Spotify)
// before jumping into the question-by-question quiz. Shows three KPI
// cards: current score, pending tasks scoped to this subcategory only,
// and a card to actually start/continue the questions.
export default function SubcatHomeScreen({ block, subcat, answers, artistName, onBack, onStartQuestions, onPending }) {
  const t = theme(isDark());

  const hasData = subcat.items.some(i => answers[i.id] !== undefined);
  const score = hasData
    ? Math.min(100, Math.round(subcat.items.reduce((sum, item) => sum + (answers[item.id] === true ? item.w : 0), 0) * 10) / 10)
    : null;

  const pendingCount = getPendingTasks([{ ...block, subcats: [subcat] }], answers).length;
  const answeredCount = subcat.items.filter(i => answers[i.id] !== undefined).length;

  return (
    <div style={{ minHeight: '100dvh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', paddingTop: 'max(16px,env(safe-area-inset-top,16px))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}` }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#aaaaaa', fontFamily: 'Arial,sans-serif', fontSize: '15px', cursor: 'pointer', padding: 0 }}>
          ← {block.label}
        </button>
        <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>{subcat.label}</div>
        <div style={{ width: '60px' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 20px 32px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '28px', fontWeight: '700', color: '#0a0a0a' }}>{subcat.label}</div>
          <div style={{ fontFamily: 'Arial,sans-serif', fontSize: '13px', color: '#aaaaaa', marginTop: '4px' }}>{artistName}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <KpiCard label="Puntuación" value={score} onClick={null} />
          <KpiCard label="Tareas pendientes" value={pendingCount} onClick={onPending} />
          <KpiCard label="Preguntas" value={`${answeredCount}/${subcat.items.length}`} onClick={onStartQuestions} />
        </div>

      </div>
    </div>
  );
}
