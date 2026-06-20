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

// Compress + resize an image file to a small base64 JPEG so it fits well
// under Firestore's 1MB document limit and can be stored directly there
// (instead of relying on localStorage, which is per-device).
export function compressImage(file, maxDimension = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) { height = Math.round(height * (maxDimension / width)); width = maxDimension; }
        } else {
          if (height > maxDimension) { width = Math.round(width * (maxDimension / height)); height = maxDimension; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Canonical visual order for blocks (areas) and subcategories within them,
// matching the order already shown on the KPI cards across the app.
// Used both by BlockHomeScreen (for rendering) and getPendingTasks (for sorting).
export const BLOCK_ORDER = ['dsps', 'social', 'authority', 'ytvideo', 'rights'];

export const SUBCAT_ORDER = {
  artist: {
    dsps:      ['spotify', 'apple', 'ytmusic', 'otherdsps', 'soundcloud'],
    social:    ['instagram', 'tiktok', 'x', 'rrss_alt', 'web'],
    authority: ['lyrics', 'wikipedia', 'googlepanel', 'musicbrainz', 'composer'],
    ytvideo:   ['accesos', 'configuracion', 'organizacion', 'diseno', 'contenido'],
    rights:    ['publishing', 'sgae', 'agedi', 'soundexchange', 'aie'],
  },
  song: {
    dsps:      ['spotify', 'apple_music', 'youtube_music', 'other_dsps', 'soundcloud', 'beatport'],
    social:    ['instagram', 'tiktok', 'x'],
    authority: ['lyrics', 'wikipedia', 'google_panel', 'musicbrainzco', 'composser', 'ooh'],
    ytvideo:   ['upload_assets', 'content_id__derivados', 'internal_connection', 'external_connection', 'otras_dvps', 'otras_integraciones'],
    rights:    ['sgae', 'soundexchange', 'aie', 'agedi', 'samples'],
  },
};

// Build a flat, sorted list of pending tasks from a set of question
// blocks + answers. A task is "pending" only when the question was
// explicitly answered "no" (answers[item.id] === false) — unanswered
// questions don't count, since they may simply not apply yet.
// Sort order is hierarchical: Area (block) → Subcategory → Points (impact),
// matching the visual order already used across the app's KPI cards.
// `blockOrder` (array of block ids) and `subcatOrderMap` ({blockId: [subcat ids]})
// are optional; when omitted, the natural order in `blocks` is used instead.
export function getPendingTasks(blocks, answers, blockOrder = null, subcatOrderMap = null) {
  const tasks = [];
  const orderedBlocks = blockOrder
    ? blockOrder.map(id => blocks.find(b => b.id === id)).filter(Boolean)
    : blocks;

  orderedBlocks.forEach((block, blockIdx) => {
    const subcatOrder = subcatOrderMap?.[block.id];
    const orderedSubcats = subcatOrder
      ? subcatOrder.map(id => block.subcats.find(s => s.id === id)).filter(Boolean)
      : block.subcats;

    orderedSubcats.forEach((sub, subIdx) => {
      sub.items.forEach(item => {
        if (answers[item.id] !== false) return; // only explicit "no" answers are pending tasks
        const priority = item.w >= 8 ? "Alta" : item.w >= 4 ? "Media" : "Baja";
        tasks.push({
          id: item.id,
          title: item.q,
          category: block.label,
          blockId: block.id,
          subcatId: sub.id,
          subcatLabel: sub.label,
          priority,
          impact: item.w,
          status: "No cumple",
          _blockOrder: blockIdx,
          _subcatOrder: subIdx,
        });
      });
    });
  });

  return tasks.sort((a, b) =>
    a._blockOrder - b._blockOrder ||
    a._subcatOrder - b._subcatOrder ||
    b.impact - a.impact
  );
}
