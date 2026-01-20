import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/face/TopBar";
import ControlsBar from "../components/face/ControlsBar";
import CameraPanel from "../components/face/CameraPanel";
import OverallResultCard from "../components/face/OverallResultCard";
import ActivitySimulator from "../components/simulator/ActivitySimulator";
import useEmotionTracking from "../hooks/useEmotionTracking";
import { formatTime } from "../utils/emotionUtils";
import { MdCheckCircle, MdInfo } from "react-icons/md";

export default function EmotionSimulatorPage() {
  const navigate = useNavigate();
  const [mirror, setMirror] = useState(true);

  const tracking = useEmotionTracking();
  const durationMinutes = Math.round(tracking.durationSeconds / 60);

  const statusBadge = useMemo(() => {
    if (!tracking.cameraOn) return { label: "OFF", cls: "border-spotify-gray text-text-gray" };
    if (tracking.sessionActive)
      return { label: "SESSION LIVE", cls: "border-spotify-green text-spotify-green" };
    return { label: "READY", cls: "border-spotify-green/60 text-spotify-green/90" };
  }, [tracking.cameraOn, tracking.sessionActive]);

  const sessionHealth = useMemo(() => {
    if (!tracking.cameraOn) return { ok: false, msg: "Camera is off" };
    if (tracking.sessionActive && tracking.noFace) return { ok: false, msg: "Face not visible" };
    if (tracking.sessionActive && tracking.totalDetections === 0)
      return { ok: true, msg: "Running… collecting detections" };
    if (tracking.totalDetections > 0) return { ok: true, msg: "Tracking stable" };
    return { ok: true, msg: "Ready" };
  }, [tracking.cameraOn, tracking.sessionActive, tracking.noFace, tracking.totalDetections]);

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
      <TopBar
        onBack={() => navigate("/landing")}
        mirror={mirror}
        onToggleMirror={() => setMirror((m) => !m)}
        onRefreshStatus={tracking.refreshStatus}
      />

      <div className="max-w-6xl px-6 mx-auto pb-14">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-6">
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">
              Face Emotion <span className="text-spotify-green">Detection</span>
            </h1>
            <p className="max-w-3xl mt-2 text-text-gray">
              Start the session and do the activity. Results publish automatically when time ends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-gray">
              <MdCheckCircle
                className={`text-lg ${sessionHealth.ok ? "text-spotify-green" : "text-yellow-300"}`}
              />
              <span>{sessionHealth.msg}</span>
            </div>

            <span className={`text-xs px-3 py-1 rounded-full border ${statusBadge.cls}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Controls */}
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

        {/* Error */}
        {tracking.error && (
          <div className="p-4 mt-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/60 text-text-gray">
            {tracking.error}
          </div>
        )}

        {/* Main */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Activities */}
          <div className="space-y-6 lg:col-span-2">
            <ActivitySimulator
              sessionActive={tracking.sessionActive}
              durationSeconds={tracking.durationSeconds}
              timeLeft={tracking.timeLeft}
            />
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            <CameraPanel
              title="Camera (PiP)"
              subtitle="Keep your face visible while doing the activity"
              videoRef={tracking.videoRef}
              canvasRef={tracking.canvasRef}
              cameraOn={tracking.cameraOn}
              sessionActive={tracking.sessionActive}
              mirror={mirror}
              statusBadge={statusBadge}
              timeLeftLabel={formatTime(tracking.timeLeft)}
              noFace={tracking.noFace}
              noFaceMsg={tracking.noFaceMsg}
              variant="pip"
            />

            <OverallResultCard
              sessionActive={tracking.sessionActive}
              sessionEnded={tracking.sessionEnded}
              timeLeft={tracking.timeLeft}
              durationSeconds={tracking.durationSeconds}
              counts={tracking.counts}
              totalDetections={tracking.totalDetections}
              noFace={tracking.noFace}
            />

            {/* How to use */}
            <div className="p-5 text-sm border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 text-text-gray">
              <div className="flex items-center gap-2 font-semibold text-white">
                <MdInfo className="text-lg text-spotify-green" />
                How to use
              </div>

              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li>Click <span className="font-semibold text-white">Start Camera</span> and allow permission.</li>
                <li>Select duration (5/15/30/60) and keep sampling at 2.0–3.0s.</li>
                <li>Click <span className="font-semibold text-white">Start Session</span> and do the activity normally.</li>
                <li>Keep your face visible (front lighting helps). Don’t cover the camera.</li>
                <li>When time ends, the overall result publishes automatically.</li>
              </ul>

              <div className="mt-4 text-xs text-text-gray">
                Tip: If “No face detected” keeps showing, move closer and increase lighting.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
