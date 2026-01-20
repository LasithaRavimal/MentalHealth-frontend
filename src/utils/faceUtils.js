export const isNoFaceBackend = (data, errMsg) => {
  const msg = String(data?.detail ?? data?.message ?? data?.error ?? errMsg ?? "")
    .toLowerCase()
    .trim();

  if (
    msg.includes("no face") ||
    msg.includes("face not detected") ||
    msg.includes("no_faces") ||
    msg.includes("not detect face")
  )
    return true;

  if (data?.no_face === true || data?.face_detected === false) return true;

  return false;
};

export const looksCoveredOrBlank = (canvas) => {
  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;

    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return false;

    const img = ctx.getImageData(0, 0, w, h).data;

    const step = 16;
    let count = 0;
    let sum = 0;
    let sum2 = 0;

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        const r = img[i] || 0;
        const g = img[i + 1] || 0;
        const b = img[i + 2] || 0;

        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        sum += lum;
        sum2 += lum * lum;
        count += 1;
      }
    }

    if (!count) return false;

    const mean = sum / count;
    const variance = sum2 / count - mean * mean;
    const std = Math.sqrt(Math.max(0, variance));

    const tooDark = mean < 25;
    const tooFlat = std < 10;

    return tooDark || tooFlat;
  } catch {
    return false;
  }
};
