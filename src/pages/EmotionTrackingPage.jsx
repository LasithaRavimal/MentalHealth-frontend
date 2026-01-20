import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/face/TopBar";
import ControlsBar from "../components/face/ControlsBar";
import CameraPanel from "../components/face/CameraPanel";
import CurrentEmotionCard from "../components/face/CurrentEmotionCard";
import OverallResultCard from "../components/face/OverallResultCard";
import HowToUseCard from "../components/face/HowToUseCard";
import useEmotionTracking from "../hooks/useEmotionTracking";
import { formatTime } from "../utils/emotionUtils";

export default function EmotionTrackingPage() {
  const navigate = useNavigate();
  const [mirror, setMirror] = useState(true);

  const tracking = useEmotionTracking();
  const durationMinutes = Math.round(tracking.durationSeconds / 60);

  const statusBadge = useMemo(() => {
    if (!tracking.cameraOn) return { label: "OFF", cls: "border-spotify-gray text-text-gray" };
    if (tracking.sessionActive)
      return { label: "TRACKING", cls: "border-spotify-green text-spotify-green" };
    return { label: "READY", cls: "border-spotify-green/60 text-spotify-green/90" };
  }, [tracking.cameraOn, tracking.sessionActive]);

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
      <TopBar
        onBack={() => navigate("/landing")}
        mirror={mirror}
        onToggleMirror={() => setMirror((m) => !m)}
        onRefreshStatus={tracking.refreshStatus}
      />

      <div className="max-w-6xl px-6 mx-auto pb-14">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">
              Emotion <span className="text-spotify-green">Tracking</span> Dashboard
            </h1>
            <p className="max-w-2xl mt-2 text-text-gray">
              Calibration + testing view. For real student sessions, use the Simulator page.
            </p>

            <button
              onClick={() => navigate("/emotion-simulator")}
              className="px-4 py-2 mt-3 border rounded-full border-spotify-gray bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray"
            >
              Open Student Simulator →
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
              <div className="text-xs text-text-gray">Session</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-3 py-1 rounded-full border ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
                <span className="text-xs text-text-gray">
                  {tracking.sessionActive
                    ? `Time left: ${formatTime(tracking.timeLeft)}`
                    : `Length: ${durationMinutes} min`}
                </span>
              </div>
            </div>

            <div className="px-4 py-3 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
              <div className="text-xs text-text-gray">Model</div>
              <div className="mt-1 text-sm font-semibold text-white">
                {tracking.modelReady === null
                  ? "Checking..."
                  : tracking.modelReady
                  ? "Ready"
                  : "Not loaded"}
              </div>
            </div>
          </div>
        </div>

        <ControlsBar
          cameraOn={tracking.cameraOn}
          sessionActive={tracking.sessionActive}
          modelReady={tracking.modelReady}
          durationMinutes={durationMinutes}
          onDurationChange={(m) => tracking.applyDurationMinutes(m)}
          captureIntervalMs={tracking.captureIntervalMs}
          onCaptureIntervalChange={(ms) => tracking.setCaptureIntervalMs(ms)}
          onStartCamera={tracking.startCamera}
          onStopCamera={tracking.stopCamera}
          onStartSession={tracking.startSession}
          onStopSession={tracking.stopSession}
          onReset={tracking.restartSession}
        />

        {tracking.error && (
          <div className="p-4 mt-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/60 text-text-gray">
            {tracking.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-hidden border lg:col-span-2 rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
            <CameraPanel
              title="Live Camera"
              subtitle="Calibration view"
              videoRef={tracking.videoRef}
              canvasRef={tracking.canvasRef}
              cameraOn={tracking.cameraOn}
              sessionActive={tracking.sessionActive}
              mirror={mirror}
              statusBadge={statusBadge}
              timeLeftLabel={formatTime(tracking.timeLeft)}
              noFace={tracking.noFace}
              noFaceMsg={tracking.noFaceMsg}
              variant="full"
            />

            <CurrentEmotionCard
              latest={tracking.latest}
              probsNormalized={tracking.probsNormalized}
              sessionActive={tracking.sessionActive}
              timeLeft={tracking.timeLeft}
              durationSeconds={tracking.durationSeconds}
              captureIntervalMs={tracking.captureIntervalMs}
            />
          </div>

          <div className="space-y-6">
            <OverallResultCard
              sessionActive={tracking.sessionActive}
              sessionEnded={tracking.sessionEnded}
              timeLeft={tracking.timeLeft}
              durationSeconds={tracking.durationSeconds}
              counts={tracking.counts}
              totalDetections={tracking.totalDetections}
              noFace={tracking.noFace}
            />

            <HowToUseCard />
          </div>
        </div>
      </div>
    </div>
  );
}
