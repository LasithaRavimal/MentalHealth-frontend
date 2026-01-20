import { useMemo } from "react";
import StroopTask from "./activities/StroopTask";
import MathSprintTask from "./activities/MathSprintTask";
import MicroWritingTask from "./activities/MicroWritingTask";
import { formatTime } from "../../utils/emotionUtils";
import { MdBolt, MdTimer } from "react-icons/md";

const buildProtocol = (durationSeconds) => {
  if (durationSeconds >= 3600) {
    return [
      { type: "stroop", label: "Focus Test", minutes: 15 },
      { type: "math", label: "Math Sprint", minutes: 15 },
      { type: "write", label: "Micro Writing", minutes: 15 },
      { type: "stroop", label: "Focus Test", minutes: 15 },
    ];
  }
  if (durationSeconds >= 1800) {
    return [
      { type: "stroop", label: "Focus Test", minutes: 10 },
      { type: "math", label: "Math Sprint", minutes: 10 },
      { type: "write", label: "Micro Writing", minutes: 10 },
    ];
  }
  if (durationSeconds >= 900) {
    return [
      { type: "stroop", label: "Focus Test", minutes: 5 },
      { type: "math", label: "Math Sprint", minutes: 5 },
      { type: "write", label: "Micro Writing", minutes: 5 },
    ];
  }
  // 5 min: fast cycle (2+2+1)
  return [
    { type: "stroop", label: "Focus Test", minutes: 2 },
    { type: "math", label: "Math Sprint", minutes: 2 },
    { type: "write", label: "Micro Writing", minutes: 1 },
  ];
};

const expandSegments = (segments, durationSeconds) => {
  let start = 0;
  const expanded = segments.map((s) => {
    const len = s.minutes * 60;
    const seg = { ...s, start, end: Math.min(durationSeconds, start + len) };
    start += len;
    return seg;
  });
  // ensure it covers full duration (pad last segment if needed)
  if (expanded.length) expanded[expanded.length - 1].end = durationSeconds;
  return expanded;
};

export default function ActivitySimulator({ sessionActive, durationSeconds, timeLeft }) {
  const segments = useMemo(() => {
    const proto = buildProtocol(durationSeconds);
    return expandSegments(proto, durationSeconds);
  }, [durationSeconds]);

  const elapsed = Math.max(0, durationSeconds - timeLeft);

  const activeSeg = useMemo(() => {
    if (!segments.length) return null;
    return segments.find((s) => elapsed >= s.start && elapsed < s.end) || segments[segments.length - 1];
  }, [segments, elapsed]);

  const segTimeLeft = activeSeg ? Math.max(0, activeSeg.end - elapsed) : 0;

  const ActiveComponent = useMemo(() => {
    if (!activeSeg) return null;
    if (activeSeg.type === "stroop") return StroopTask;
    if (activeSeg.type === "math") return MathSprintTask;
    return MicroWritingTask;
  }, [activeSeg]);

  return (
    <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Student Activity Simulator</div>
          <div className="mt-1 text-sm text-text-gray">
            Student stays busy while emotion tracking runs quietly in the background.
          </div>
        </div>
        <MdBolt className="text-2xl text-spotify-green" />
      </div>

      <div className="p-5 mt-4 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/40">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-text-gray">Current activity block</div>
          <div className="text-xs text-text-gray">
            <MdTimer className="inline-block mr-1 text-sm" />
            Block left: <span className="font-semibold text-white">{formatTime(segTimeLeft)}</span>
          </div>
        </div>

        <div className="mt-2 text-xl font-bold text-white">{activeSeg ? activeSeg.label : "—"}</div>

        <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
          {segments.map((s, idx) => {
            const isActive = activeSeg && s.start === activeSeg.start;
            return (
              <div
                key={`${s.type}-${idx}`}
                className={`p-2 border rounded-lg text-xs ${
                  isActive
                    ? "border-spotify-green bg-spotify-green/10 text-white"
                    : "border-spotify-gray bg-spotify-black/20 text-text-gray"
                }`}
              >
                {s.label} • {Math.max(1, Math.round((s.end - s.start) / 60))}m
              </div>
            );
          })}
        </div>

        <div className="mt-4">{ActiveComponent ? <ActiveComponent active={sessionActive} /> : null}</div>

        {!sessionActive && (
          <div className="mt-4 text-sm text-text-gray">
            Start the session to activate the simulator blocks.
          </div>
        )}
      </div>
    </div>
  );
}
