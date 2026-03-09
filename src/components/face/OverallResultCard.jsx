import { MdInsights, MdVerified, MdTimer } from "react-icons/md";
import { buildOverallDist, formatTime, pickOverallStatus } from "../../utils/emotionUtils";

export default function OverallResultCard({
  sessionActive,
  sessionEnded,
  timeLeft,
  durationSeconds,
  counts,
  totalDetections,
  noFace,
}) {
  const overallStatus = pickOverallStatus(counts, totalDetections);
  const overallLabelPretty = overallStatus
    ? overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)
    : "—";

  const overallDist = buildOverallDist(counts, totalDetections);

  const timeProgressPct = (() => {
    const done = durationSeconds - timeLeft;
    return Math.max(0, Math.min(100, Math.round((done / durationSeconds) * 100)));
  })();

  return (
    <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Overall result</div>
        <MdInsights className="text-2xl text-spotify-green" />
      </div>
      <div className="mt-2 text-sm text-text-gray">
        Published when the session finishes.
      </div>

      <div className="p-4 mt-5 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
        {!sessionEnded ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-gray">
              <MdVerified className="text-xl text-spotify-green" />
              <span>Complete the session to generate the final status.</span>
            </div>

            {sessionActive && noFace ? (
              <div className="text-xs text-text-gray">
                Waiting for a valid face. Keep your face visible to collect detections.
              </div>
            ) : (
              <div className="text-xs text-text-gray">
                Tip: Use front lighting and keep your face in frame while doing the activity.
              </div>
            )}
          </div>
        ) : !totalDetections ? (
          <div className="text-text-gray">
            No valid detections captured. Improve lighting and keep the face visible, then retry.
          </div>
        ) : (
          <>
            <div className="text-sm text-text-gray">Overall status</div>
            <div className="mt-1 text-3xl font-bold text-spotify-green">{overallLabelPretty}</div>

            <div className="mt-4 text-sm text-text-gray">Session distribution</div>
            <div className="mt-3 space-y-3">
              {overallDist.map(({ k, v, pct }) => (
                <div key={k} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                    <span className="text-text-gray">
                      {pct}% ({v})
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-spotify-gray">
                    <div className="h-full bg-spotify-green" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-text-gray">
              Total detections:{" "}
              <span className="font-semibold text-white">{totalDetections}</span>
            </div>
          </>
        )}
      </div>

      {sessionActive && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-text-gray">
            <span>Time left</span>
            <span className="font-semibold text-white">
              <MdTimer className="inline-block mr-1 text-sm" />
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="h-2 mt-2 overflow-hidden rounded-full bg-spotify-gray">
            <div className="h-full bg-spotify-green" style={{ width: `${timeProgressPct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
