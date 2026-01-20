export const EMOTIONS = ["happy", "fear", "sad", "angry"];

export const initCounts = () =>
  EMOTIONS.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {});

export const prettyConfidence = (c) => {
  const n = Number(c);
  if (Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
};

export const formatTime = (sec) => {
  const s = Math.max(0, sec);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export const normalizeLabel = (label) => {
  const v = String(label || "").toLowerCase().trim();
  if (v === "happiness") return "happy";
  if (v === "anger") return "angry";
  if (v === "sadness") return "sad";
  if (v === "fearful") return "fear";
  return v;
};

export const normalizeProbabilities = (raw) => {
  const out = {};

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item) continue;

      if (typeof item === "object" && !Array.isArray(item)) {
        const k = item.label ?? item.emotion ?? item.name ?? item.class ?? item.key;
        const v = item.probability ?? item.prob ?? item.score ?? item.value ?? item.p;
        if (k != null && v != null) out[String(k).toLowerCase().trim()] = Number(v);
        continue;
      }

      if (Array.isArray(item) && item.length >= 2) {
        out[String(item[0]).toLowerCase().trim()] = Number(item[1]);
      }
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw)) {
      out[String(k).toLowerCase().trim()] = Number(v);
    }
  }

  // map variants
  if (out.happiness != null && out.happy == null) out.happy = out.happiness;
  if (out.anger != null && out.angry == null) out.angry = out.anger;
  if (out.sadness != null && out.sad == null) out.sad = out.sadness;
  if (out.fearful != null && out.fear == null) out.fear = out.fearful;

  return EMOTIONS.reduce((acc, k) => {
    acc[k] = Number.isFinite(out[k]) ? out[k] : 0;
    return acc;
  }, {});
};

export const pickOverallStatus = (counts, totalDetections) => {
  if (!totalDetections) return null;
  let best = EMOTIONS[0];
  let bestVal = counts?.[best] ?? 0;
  for (const k of EMOTIONS) {
    const v = counts?.[k] ?? 0;
    if (v > bestVal) {
      best = k;
      bestVal = v;
    }
  }
  return best;
};

export const buildOverallDist = (counts, totalDetections) => {
  const total = totalDetections || 0;
  return EMOTIONS.map((k) => {
    const v = counts?.[k] || 0;
    const pct = total ? Math.round((v / total) * 100) : 0;
    return { k, v, pct };
  }).sort((a, b) => b.v - a.v);
};
