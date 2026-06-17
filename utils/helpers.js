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
