import { MdCameraAlt, MdPlayArrow, MdStop, MdReplay } from "react-icons/md";

export default function ControlsBar({
  cameraOn,
  sessionActive,
  modelReady,
  durationMinutes,
  onDurationChange,
  captureIntervalMs,
  onCaptureIntervalChange,

  onStartCamera,
  onStopCamera,
  onStartSession,
  onStopSession,
  onReset,
}) {
  const pillBase =
    "px-4 py-3 text-sm text-white border rounded-full bg-spotify-dark-gray/60 border-spotify-gray transition";
  const pillDisabled = "opacity-60 cursor-not-allowed";

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 p-4 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-[280px]">
          <div className="text-sm text-text-gray">Session Controls</div>
          <div className="mt-1 text-xs text-text-gray">
            Sampling: ~{Math.round(captureIntervalMs / 100) / 10}s • Duration:{" "}
            {durationMinutes} min
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Duration */}
          <select
            value={durationMinutes}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="px-4 py-3 text-sm text-white border rounded-full bg-spotify-dark-gray/60 border-spotify-gray"
            disabled={sessionActive}
            title="Session duration"
          >
            <option value={5}>5 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
          </select>

          {/* Sampling */}
          <select
            value={captureIntervalMs}
            onChange={(e) => onCaptureIntervalChange(Number(e.target.value))}
            className={`${pillBase} ${sessionActive ? pillDisabled : ""}`}
            disabled={sessionActive}
            title="Sampling interval (backend load control)"
          >
            <option value={1500}>1.5s</option>
            <option value={2000}>2.0s</option>
            <option value={2500}>2.5s</option>
            <option value={3000}>3.0s</option>
          </select>

          {!cameraOn ? (
            <button
              onClick={onStartCamera}
              className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={modelReady === false}
              title={
                modelReady === false ? "Model is not loaded" : "Start camera"
              }
            >
              <MdCameraAlt className="text-xl" />
              Start Camera
            </button>
          ) : (
            <>
              {!sessionActive ? (
                <button
                  onClick={onStartSession}
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={modelReady === false}
                  title={
                    modelReady === false
                      ? "Model is not loaded"
                      : "Start session"
                  }
                >
                  <MdPlayArrow className="text-2xl" />
                  Start Session
                </button>
              ) : (
                <button
                  onClick={onStopSession}
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-gray hover:bg-spotify-light-gray"
                  title="Stop session"
                >
                  <MdStop className="text-xl" />
                  Stop Session
                </button>
              )}

              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition border rounded-full bg-spotify-dark-gray/70 hover:bg-spotify-dark-gray border-spotify-gray"
                title="Reset session data"
              >
                <MdReplay className="text-xl" />
                Reset
              </button>

              <button
                onClick={onStopCamera}
                className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition border rounded-full bg-spotify-dark-gray/70 hover:bg-spotify-dark-gray border-spotify-gray"
                title="Stop camera"
              >
                <MdStop className="text-xl" />
                Stop Camera
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
