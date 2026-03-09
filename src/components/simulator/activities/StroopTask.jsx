import { useEffect, useMemo, useState } from "react";

const COLORS = [
  { key: "red", label: "RED", cls: "bg-red-500/15 border-red-500/70 text-red-200" },
  { key: "green", label: "GREEN", cls: "bg-green-500/15 border-green-500/70 text-green-200" },
  { key: "blue", label: "BLUE", cls: "bg-blue-500/15 border-blue-500/70 text-blue-200" },
  { key: "yellow", label: "YELLOW", cls: "bg-yellow-500/15 border-yellow-500/70 text-yellow-200" },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function StroopTask({ active }) {
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);

  const [stimulus, setStimulus] = useState(() => ({
    word: pick(COLORS).label,
    ink: pick(COLORS).key,
  }));

  const inkClass = useMemo(() => {
    if (stimulus.ink === "red") return "text-red-400";
    if (stimulus.ink === "green") return "text-green-400";
    if (stimulus.ink === "blue") return "text-blue-400";
    return "text-yellow-300";
  }, [stimulus]);

  useEffect(() => {
    if (!active) return;
    setStimulus({ word: pick(COLORS).label, ink: pick(COLORS).key });
  }, [active]);

  const answer = (colorKey) => {
    if (!active) return;
    setTotal((t) => t + 1);
    if (colorKey === stimulus.ink) setCorrect((c) => c + 1);
    setStimulus({ word: pick(COLORS).label, ink: pick(COLORS).key });
  };

  const acc = total ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="p-5 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/40">
      <div className="text-sm text-text-gray">Activity: Stroop Focus Test</div>
      <div className="mt-1 text-xs text-text-gray">
        Click the <span className="font-semibold text-white">INK COLOR</span> (not the word).
      </div>

      <div className={`mt-6 text-center text-5xl font-extrabold ${inkClass}`}>
        {stimulus.word}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {COLORS.map((c) => (
          <button
            key={c.key}
            onClick={() => answer(c.key)}
            disabled={!active}
            className={`px-4 py-3 border rounded-xl transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${c.cls}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-text-gray">
        <span>
          Score: <span className="font-semibold text-white">{correct}</span> / {total}
        </span>
        <span>
          Accuracy: <span className="font-semibold text-white">{acc}%</span>
        </span>
      </div>
    </div>
  );
}
