import { useEffect, useMemo, useState } from "react";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
};

// Generates "uni-level but not too hard" questions.
// Mix: fractions, exponents, roots (perfect squares), distributive expansion, and linear equations.
const makeQ = () => {
  const type = rand(1, 5);

  // 1) Fraction addition/subtraction: a/b ± c/d (kept reducible)
  if (type === 1) {
    let b = rand(2, 9);
    let d = rand(2, 9);
    let a = rand(1, b - 1);
    let c = rand(1, d - 1);

    const op = Math.random() < 0.5 ? "+" : "-";
    const numerator = op === "+" ? a * d + c * b : a * d - c * b;
    const denominator = b * d;

    const g = gcd(numerator, denominator);
    const n = numerator / g;
    const den = denominator / g;

    const prompt = `${a}/${b} ${op} ${c}/${d} = ? (answer as a/b)`;
    const answer = `${n}/${den}`;

    return { prompt, answer, kind: "fraction" };
  }

  // 2) Exponents: a^2 ± b^2 or a^3 - b^3 (small numbers)
  if (type === 2) {
    const a = rand(2, 9);
    const b = rand(2, 9);
    const variant = rand(1, 3);

    let prompt = "";
    let answer = 0;

    if (variant === 1) {
      prompt = `${a}^2 + ${b}^2 = ?`;
      answer = a * a + b * b;
    } else if (variant === 2) {
      prompt = `${a}^2 - ${b}^2 = ?`;
      answer = a * a - b * b;
    } else {
      prompt = `${a}^3 - ${b}^3 = ?`;
      answer = a * a * a - b * b * b;
    }

    return { prompt, answer, kind: "number" };
  }

  // 3) Roots (perfect squares): √(k) + √(m) or √(k) - √(m)
  if (type === 3) {
    const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
    const k = squares[rand(0, squares.length - 1)];
    const m = squares[rand(0, squares.length - 1)];
    const op = Math.random() < 0.5 ? "+" : "-";
    const prompt = `√${k} ${op} √${m} = ?`;
    const answer = op === "+" ? Math.sqrt(k) + Math.sqrt(m) : Math.sqrt(k) - Math.sqrt(m);
    return { prompt, answer, kind: "number" };
  }

  // 4) Distributive expansion: (ax + b) when x = n  => compute value
  if (type === 4) {
    const a = rand(2, 12);
    const b = rand(-20, 20);
    const x = rand(-6, 6);
    const prompt = `If x = ${x}, evaluate: (${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}) = ?`;
    const answer = a * x + b;
    return { prompt, answer, kind: "number" };
  }

  // 5) Linear equation: ax + b = c  => solve for x (integer by construction)
  const a = rand(2, 12);
  const x = rand(-8, 8);
  const b = rand(-20, 20);
  const c = a * x + b;

  const prompt = `Solve for x: ${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${c}`;
  const answer = x;

  return { prompt, answer, kind: "number" };
};

const parseFraction = (s) => {
  const t = String(s || "").trim();
  if (!t.includes("/")) return null;
  const [nStr, dStr] = t.split("/").map((x) => x.trim());
  const n = Number(nStr);
  const d = Number(dStr);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
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

  const isCorrect = (userInput) => {
    if (q.kind === "fraction") {
      const userFrac = parseFraction(userInput);
      if (!userFrac) return false;

      const expected = parseFraction(q.answer);
      if (!expected) return false;

      return userFrac.n === expected.n && userFrac.d === expected.d;
    }

    const n = Number(userInput);
    if (!Number.isFinite(n)) return false;

    // allow tiny tolerance for numeric types (even though most are integers)
    const expected = Number(q.answer);
    return Math.abs(n - expected) < 1e-9;
  };

  const submit = () => {
    if (!active) return;

    setTotal((t) => t + 1);
    if (isCorrect(input)) setCorrect((c) => c + 1);

    setQ(makeQ());
    setInput("");
  };

  const acc = useMemo(() => (total ? Math.round((correct / total) * 100) : 0), [total, correct]);

  return (
    <div className="p-5 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/40">
      <div className="text-sm text-text-gray">Activity: Math Sprint</div>
      <div className="mt-1 text-xs text-text-gray">
        Uni-style quick maths. Press Enter to submit. For fractions, type a/b.
      </div>

      <div className="mt-6 text-3xl font-extrabold text-center text-white sm:text-4xl">
        {q.prompt}
      </div>

      <div className="flex gap-3 mt-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="flex-1 px-4 py-3 text-white border rounded-xl bg-spotify-black/40 border-spotify-gray disabled:opacity-60"
          placeholder={q.kind === "fraction" ? "e.g., 3/4" : "Type answer"}
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