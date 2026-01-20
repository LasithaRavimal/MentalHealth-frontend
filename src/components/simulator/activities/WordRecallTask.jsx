import { useEffect, useMemo, useRef, useState } from "react";

const WORD_BANK = [
  "lecture", "deadline", "project", "library", "seminar", "midterm", "syllabus",
  "research", "dataset", "analysis", "method", "results", "discussion", "abstract",
  "concept", "theory", "practice", "report", "submission", "revision", "outline",
  "citation", "reference", "summary", "strategy", "planning", "focus", "memory",
  "problem", "solution", "logic", "model", "feature", "training", "testing",
];

const pickWords = (n = 6) => {
  const copy = [...WORD_BANK];
  const out = [];
  while (out.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};

const normalizeTokens = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
};

export default function WordRecallTask({ active }) {
  const [stage, setStage] = useState("idle"); // idle | study | recall | done
  const [words, setWords] = useState(() => pickWords(6));
  const [input, setInput] = useState("");
  const [round, setRound] = useState(0);

  const [totalRounds, setTotalRounds] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const timerRef = useRef(null);

  const startRound = () => {
    setWords(pickWords(6));
    setInput("");
    setStage("study");
    setRound((r) => r + 1);

    // 8 sec study window
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStage("recall");
    }, 8000);
  };

  useEffect(() => {
    if (!active) {
      setStage("idle");
      clearTimeout(timerRef.current);
      return;
    }
    // On activate, auto start first round
    startRound();

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const submit = () => {
    if (!active) return;

    const expected = new Set(words.map((w) => w.toLowerCase()));
    const typed = new Set(normalizeTokens(input));

    let correct = 0;
    typed.forEach((t) => {
      if (expected.has(t)) correct += 1;
    });

    setTotalRounds((t) => t + 1);
    setTotalCorrect((c) => c + correct);
    setStage("done");
  };

  const next = () => {
    if (!active) return;
    startRound();
  };

  const accuracy = useMemo(() => {
    if (!totalRounds) return 0;
    // max correct per round = 6
    const max = totalRounds * 6;
    return max ? Math.round((totalCorrect / max) * 100) : 0;
  }, [totalRounds, totalCorrect]);

  return (
    <div className="p-5 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/40">
      <div className="text-sm text-text-gray">Activity: Word Recall</div>
      <div className="mt-1 text-xs text-text-gray">
        Memorize the words (8 seconds), then type what you remember.
      </div>

      {/* STUDY */}
      {stage === "study" && (
        <div className="mt-5">
          <div className="text-xs text-text-gray">Memorize these:</div>
          <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
            {words.map((w) => (
              <div
                key={w}
                className="px-3 py-2 text-center text-white border rounded-xl border-spotify-gray bg-spotify-black/30"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-text-gray">
            Round {round} • Switching to recall automatically...
          </div>
        </div>
      )}

      {/* RECALL */}
      {stage === "recall" && (
        <div className="mt-5">
          <div className="text-xs text-text-gray">
            Type remembered words (space or new line separated):
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 mt-3 text-white border h-28 rounded-xl bg-spotify-black/40 border-spotify-gray"
            placeholder="e.g., lecture dataset analysis ..."
            disabled={!active}
          />

          <div className="flex gap-3 mt-3">
            <button
              onClick={submit}
              className="px-5 py-3 font-semibold text-white transition rounded-xl bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50"
              disabled={!active}
            >
              Submit
            </button>
            <button
              onClick={() => setInput("")}
              className="px-5 py-3 font-semibold text-white transition border rounded-xl border-spotify-gray bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray disabled:opacity-50"
              disabled={!active}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* DONE */}
      {stage === "done" && (
        <div className="mt-5">
          <div className="text-sm text-text-gray">Round scored.</div>
          <div className="mt-2 text-xs text-text-gray">
            Correct words are counted only once. Continue for more rounds.
          </div>

          <button
            onClick={next}
            className="px-5 py-3 mt-4 font-semibold text-white transition rounded-xl bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50"
            disabled={!active}
          >
            Next Round
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-5 text-xs text-text-gray">
        <span>
          Total correct: <span className="font-semibold text-white">{totalCorrect}</span>
        </span>
        <span>
          Accuracy: <span className="font-semibold text-white">{accuracy}%</span>
        </span>
      </div>
    </div>
  );
}
