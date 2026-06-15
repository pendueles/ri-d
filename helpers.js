// utils/helpers.js

export function flattenQuestions(blocks) {
  const qs = [];
  blocks.forEach(block => {
    block.subcats.forEach(sub => {
      sub.items.forEach(item => {
        qs.push({ ...item, blockId: block.id, blockLabel: block.label, subcatId: sub.id, subcatLabel: sub.label });
      });
    });
  });
  return qs;
}

export function scoreColor(s) {
  if (s >= 75) return "#1B6AE8";
  if (s >= 50) return "#5B9EF0";
  if (s >= 25) return "#E8611B";
  return "#E8151B";
}

export function scoreLabel(s) {
  if (s >= 75) return "Excelente";
  if (s >= 50) return "Bueno";
  if (s >= 25) return "Mejorable";
  return "Crítico";
}

// Red palette that evolves with progress
export function bgColor(progress) {
  const t = progress / 100;
  const r = Math.round(180 + (232 - 180) * t);
  const g = Math.round(8 + (21 - 8) * t);
  const b = Math.round(8 + (27 - 8) * t);
  return `rgb(${r},${g},${b})`;
}
