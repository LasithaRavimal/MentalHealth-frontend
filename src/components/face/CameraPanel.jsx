import { MdTimer, MdWarningAmber, MdFace } from "react-icons/md";

export default function CameraPanel({
  title = "Live Camera",
  subtitle = "Keep face visible for stable tracking",
  videoRef,
  canvasRef,
  cameraOn,
  sessionActive,
  mirror,
  statusBadge,
  timeLeftLabel,
  noFace,
  noFaceMsg,
  variant = "full", // "full" | "pip"
}) {
  const wrapperClass =
    variant === "pip"
      ? "overflow-hidden border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card"
      : "overflow-hidden border lg:col-span-2 rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card";

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between gap-4 p-4 border-b border-spotify-gray">
        <div className="min-w-0">
          <div className="font-semibold truncate">{title}</div>
          <div className="text-xs truncate text-text-gray">{subtitle}</div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-xs px-3 py-1 rounded-full border ${statusBadge.cls}`}
            title="Session state"
          >
            {statusBadge.label}
          </span>

          {sessionActive && (
            <div className="flex items-center gap-2 text-xs text-text-gray">
              <MdTimer className="text-base" />
              <span className="font-semibold text-white">{timeLeftLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-spotify-black">
        <div className="w-full aspect-video">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${mirror ? "scale-x-[-1]" : ""}`}
            playsInline
            muted
            autoPlay
          />
        </div>

        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-6 text-center">
              <div className="text-xl font-semibold">Camera is off</div>
              <div className="mt-2 text-text-gray">
                Click <span className="font-semibold text-white">Start Camera</span> to continue.
              </div>
            </div>
          </div>
        )}

        {cameraOn && sessionActive && noFace && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <div className="max-w-md p-5 mx-4 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/80 backdrop-blur">
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <MdWarningAmber className="text-2xl text-spotify-green" />
                No face detected
              </div>
              <div className="mt-2 text-sm text-text-gray">
                {noFaceMsg || "Please face the camera and keep your face in the frame."}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-text-gray">
                <MdFace className="text-base" />
                Tip: Move closer, improve lighting, and avoid covering the camera.
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
