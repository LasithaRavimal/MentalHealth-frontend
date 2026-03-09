import { useMemo } from "react";
import { MdTimer } from "react-icons/md";
import { EMOTIONS, formatTime, normalizeLabel, prettyConfidence } from "../../utils/emotionUtils";

export default function CurrentEmotionCard({
  latest,
  probsNormalized,
  sessionActive,
  timeLeft,
  durationSeconds,
  captureIntervalMs,
}) {
  const currentBars = useMemo(() => {
    const label = normalizeLabel(latest?.label);

    const base = EMOTIONS.map((k) => {
      const pct = Math.max(0, Math.min(100, Math.round((probsNormalized?.[k] || 0) * 100)));
      return { k, pct };
    });

    if (!label || !EMOTIONS.includes(label)) return base;

    const currentItem = base.find((x) => x.k === label);
    const rest = base.filter((x) => x.k !== label);
    return currentItem ? [currentItem, ...rest] : base;
  }, [latest, probsNormalized]);

  const timeProgressPct = useMemo(() => {
    const done = durationSeconds - timeLeft;
    return Math.max(0, Math.min(100, Math.round((done / durationSeconds) * 100)));
  }, [timeLeft, durationSeconds]);

  const labelPretty = latest?.label
    ? latest.label.charAt(0).toUpperCase() + latest.label.slice(1)
    : "—";

  return (
    <div className="p-6 border-t border-spotify-gray">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-text-gray">Current emotion</div>
          <div className="flex flex-wrap items-end gap-3 mt-1">
            <div className="text-3xl font-bold">
              {latest?.label ? <span className="text-spotify-green">{labelPretty}</span> : <span>—</span>}
            </div>

            <div className="text-text-gray">
              Confidence:{" "}
              <span className="font-semibold text-white">
                {latest?.confidence != null ? prettyConfidence(latest.confidence) : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-text-gray">Sampling</div>
          <div className="text-sm font-semibold text-white">
            ~{Math.round(captureIntervalMs / 100) / 10}s
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {currentBars.map(({ k, pct }) => (
          <div key={k} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
              <span className="text-text-gray">{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-spotify-gray">
              <div className="h-full bg-spotify-green" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {sessionActive && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-text-gray">
            <span>Session progress</span>
            <span className="font-semibold text-white">{formatTime(timeLeft)}</span>
          </div>
          <div className="h-2 mt-2 overflow-hidden rounded-full bg-spotify-gray">
            <div className="h-full bg-spotify-green" style={{ width: `${timeProgressPct}%` }} />
          </div>
          <div className="mt-2 text-xs text-text-gray">
            <MdTimer className="inline-block mr-1 text-sm" />
            Auto-end and publish overall result.
          </div>
        </div>
      )}

      <div className="mt-5 text-xs text-text-gray">
        Sampling is throttled to protect backend stability for longer sessions.
      </div>
    </div>
  );
}
