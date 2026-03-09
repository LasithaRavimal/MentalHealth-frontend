import { useEffect, useMemo, useState } from "react";

const PROMPTS = [
  "Explain what you studied today in 3–5 sentences.",
  "Write a short summary of the last lecture topic.",
  "Describe one thing you found difficult and why.",
  "Write a small plan for the next 30 minutes of studying.",
];

export default function MicroWritingTask({ active }) {
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) return;
    setPromptIdx((i) => (i + 1) % PROMPTS.length);
  }, [active]);

  const wordCount = useMemo(() => {
    const t = text.trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
  }, [text]);

  return (
    <div className="p-5 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/40">
      <div className="text-sm text-text-gray">Activity: Micro Writing</div>
      <div className="mt-1 text-xs text-text-gray">{PROMPTS[promptIdx]}</div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!active}
        className="w-full h-40 px-4 py-3 mt-4 text-white border rounded-xl bg-spotify-black/40 border-spotify-gray disabled:opacity-60"
        placeholder="Type here..."
      />

      <div className="flex items-center justify-between mt-3 text-xs text-text-gray">
        <span>
          Words: <span className="font-semibold text-white">{wordCount}</span>
        </span>
        <button
          onClick={() => setText("")}
          disabled={!active}
          className="px-3 py-2 border rounded-lg border-spotify-gray bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
