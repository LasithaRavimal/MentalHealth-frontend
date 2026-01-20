import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/face/TopBar";
import ControlsBar from "../components/face/ControlsBar";
import CameraPanel from "../components/face/CameraPanel";
import OverallResultCard from "../components/face/OverallResultCard";
import ActivitySimulator from "../components/simulator/ActivitySimulator";
import useEmotionTracking from "../hooks/useEmotionTracking";
import { formatTime } from "../utils/emotionUtils";
import { MdCheckCircle } from "react-icons/md";

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
    if (tracking.totalDetections > 0) return { ok: true, msg: "Stable tracking" };
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
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">
                Student Session <span className="text-spotify-green">Simulator</span>
              </h1>
              <p className="max-w-3xl text-text-gray">
  Do the activity while the system tracks emotions in the background. This reduces “camera staring”
  and improves signal quality for university sessions.
</p>
            </div>

          
          </div>

          <div className="flex items-center gap-2 text-sm text-text-gray">
            <MdCheckCircle className={`text-lg ${sessionHealth.ok ? "text-spotify-green" : "text-yellow-300"}`} />
            <span>{sessionHealth.msg}</span>
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
          <div className="space-y-6 lg:col-span-2">
            <ActivitySimulator
              sessionActive={tracking.sessionActive}
              durationSeconds={tracking.durationSeconds}
              timeLeft={tracking.timeLeft}
            />
          </div>

          <div className="space-y-6">
            <CameraPanel
              title="Camera (PiP)"
              subtitle="Keep face visible while doing the activity"
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

            <div className="p-4 text-sm border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 text-text-gray">
              KPI tip: For 30–60 min sessions, keep sampling at 2.5–3.0s to reduce backend load.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
