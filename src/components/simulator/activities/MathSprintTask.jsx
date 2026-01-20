import { useEffect, useMemo, useState } from "react";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeQ = () => {
  const a = rand(2, 20);
  const b = rand(2, 20);
  const ops = ["+", "-", "×"];
  const op = ops[rand(0, ops.length - 1)];
  let answer = a + b;
  if (op === "-") answer = a - b;
  if (op === "×") answer = a * b;
  return { a, b, op, answer };
};

export default function MathSprintTask({ active }) {
  const [q, setQ] = useState(makeQ);
  const [input, setInput] = useState("");
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    if (!active) return;
    setQ(makeQ());
    setInput("");
  }, [active]);

  const submit = () => {
    if (!active) return;
    const n = Number(input);
    setTotal((t) => t + 1);
    if (Number.isFinite(n) && n === q.answer) setCorrect((c) => c + 1);
    setQ(makeQ());
    setInput("");
  };

  const acc = useMemo(() => (total ? Math.round((correct / total) * 100) : 0), [total, correct]);

  return (
    <div className="p-5 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/40">
      <div className="text-sm text-text-gray">Activity: Math Sprint</div>
      <div className="mt-1 text-xs text-text-gray">Solve quickly. Press Enter to submit.</div>

      <div className="mt-6 text-4xl font-extrabold text-center text-white">
        {q.a} {q.op} {q.b} = ?
      </div>

      <div className="flex gap-3 mt-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="flex-1 px-4 py-3 text-white border rounded-xl bg-spotify-black/40 border-spotify-gray disabled:opacity-60"
          placeholder="Type answer"
          disabled={!active}
        />
        <button
          onClick={submit}
          className="px-5 py-3 font-semibold text-white transition rounded-xl bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!active}
        >
          Submit
        </button>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-text-gray">
        <span>
          Correct: <span className="font-semibold text-white">{correct}</span> / {total}
        </span>
        <span>
          Accuracy: <span className="font-semibold text-white">{acc}%</span>
        </span>
      </div>
    </div>
  );
}
