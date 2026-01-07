import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { MdArrowBack, MdCameraAlt, MdStop, MdRefresh } from "react-icons/md";

const CAPTURE_INTERVAL_MS = 1200; // controls backend load (lower = more requests)
const JPEG_QUALITY = 0.75; // 0..1 (higher = bigger payload)
const CAPTURE_WIDTH = 360; // downscale for bandwidth (backend will resize anyway)

const FaceDetectionPage = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null); 
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const inFlightRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [mirror, setMirror] = useState(true);

  const [emotion, setEmotion] = useState(null); // { label, confidence, probabilities }
  const [status, setStatus] = useState(null); // /face/status payload (internal only)
  const [error, setError] = useState("");

  const modelReady = useMemo(() => {
    if (!status) return null;
    return !!status.loaded;
  }, [status]);

  // Load backend model status once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get("/face/status");
        if (!mounted) return;
        setStatus(res.data);
      } catch (e) {
        if (!mounted) return;
        setStatus(null);
        setError("Unable to reach the Face service. Check API is running.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    setError("");
    setEmotion(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }

      setCameraOn(true);
      startDetectionLoop();
    } catch (e) {
      setError("Camera permission denied or camera not available.");
      setCameraOn(false);
    }
  };

  const stopCamera = () => {
    // stop detection loop
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDetecting(false);

    // stop tracks
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // clear video srcObject
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  const startDetectionLoop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (inFlightRef.current) return;
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      if (video.readyState < 2) return;

      try {
        inFlightRef.current = true;
        setDetecting(true);
        setError("");

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;

        const scale = CAPTURE_WIDTH / vw;
        const cw = CAPTURE_WIDTH;
        const ch = Math.round(vh * scale);

        canvas.width = cw;
        canvas.height = ch;

        // draw as-is (mirroring is UI-only)
        ctx.drawImage(video, 0, 0, cw, ch);

        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        const res = await apiClient.post("/face/predict-base64", {
          image_base64: dataUrl,
          filename: "frame.jpg",
          mime_type: "image/jpeg",
        });

        setEmotion(res.data);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          "Prediction failed. Check model is loaded and API is healthy.";
        setError(msg);
      } finally {
        inFlightRef.current = false;
        setDetecting(false);
      }
    }, CAPTURE_INTERVAL_MS);
  };

  const refreshStatus = async () => {
    setError("");
    try {
      const res = await apiClient.get("/face/status");
      setStatus(res.data);
    } catch (e) {
      setError("Unable to refresh status. Check API connectivity.");
    }
  };

  const prettyConfidence = (c) => {
    const n = Number(c);
    if (Number.isNaN(n)) return "—";
    return `${Math.round(n * 100)}%`;
  };

  const probEntries = useMemo(() => {
    const probs = emotion?.probabilities || {};
    return Object.entries(probs).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  }, [emotion]);

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-6xl px-6 py-6 mx-auto">
        <button
          onClick={() => navigate("/landing")}
          className="inline-flex items-center gap-2 px-4 py-2 transition border rounded-full bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray/80 border-spotify-gray"
        >
          <MdArrowBack />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMirror((m) => !m)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition ${
              mirror
                ? "bg-spotify-green/20 border-spotify-green text-spotify-green"
                : "bg-spotify-dark-gray/60 border-spotify-gray text-text-gray hover:bg-spotify-dark-gray/80"
            }`}
            title="Toggle mirror view"
          >
            Mirror: {mirror ? "On" : "Off"}
          </button>

          <button
            onClick={refreshStatus}
            className="inline-flex items-center gap-2 px-4 py-2 transition border rounded-full bg-spotify-dark-gray/60 hover:bg-spotify-dark-gray/80 border-spotify-gray"
            title="Refresh model status"
          >
            <MdRefresh />
            Status
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-6 mx-auto pb-14">
        <div className="mb-8">
          <h1 className="text-4xl font-bold md:text-5xl">
            Facial Emotion <span className="text-spotify-green">Detection</span>
          </h1>
          <p className="max-w-2xl mt-3 text-text-gray">
            Real-time emotion insights from your live camera feed. Your face is analyzed per-frame to estimate the current emotional state.
          </p>
        </div>

        {/* Control banner */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 p-4 border rounded-xl border-spotify-gray bg-spotify-light-gray/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-text-gray">Detection</div>
              <div className="font-semibold text-white">
                {cameraOn ? (detecting ? "Running" : "Camera ready") : "Stopped"}
              </div>
              <div className="mt-1 text-xs text-text-gray">
                {modelReady === null
                  ? "Checking model availability..."
                  : modelReady
                  ? "Model ready"
                  : "Model not loaded on server"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={modelReady === false}
                  title={modelReady === false ? "Model not loaded" : "Start camera"}
                >
                  <MdCameraAlt className="text-xl" />
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-gray hover:bg-spotify-light-gray"
                >
                  <MdStop className="text-xl" />
                  Stop
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 mt-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/60 text-text-gray">
              {error}
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Camera card */}
          <div className="overflow-hidden border lg:col-span-2 rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
            <div className="flex items-center justify-between p-4 border-b border-spotify-gray">
              <div>
                <div className="font-semibold">Live Camera</div>
                <div className="text-xs text-text-gray">
                  Keep your face centered for best accuracy
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${
                    cameraOn
                      ? "border-spotify-green text-spotify-green"
                      : "border-spotify-gray text-text-gray"
                  }`}
                >
                  {cameraOn ? "LIVE" : "OFF"}
                </span>

                <span className="text-xs text-text-gray">
                  {detecting ? "Detecting..." : cameraOn ? "Idle" : "—"}
                </span>
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
                      Click <span className="text-white">Start Camera</span> to enable detection.
                    </div>
                  </div>
                </div>
              )}

              {/* hidden capture canvas */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Current emotion */}
            <div className="p-5">
              <div className="text-sm text-text-gray">Current emotion</div>
              <div className="flex items-end gap-3 mt-1">
                <div className="text-3xl font-bold">
                  {emotion?.label ? (
                    <span className="text-spotify-green">{emotion.label}</span>
                  ) : (
                    <span className="text-white">—</span>
                  )}
                </div>
                <div className="text-text-gray">
                  Confidence:{" "}
                  <span className="font-semibold text-white">
                    {emotion?.confidence != null ? prettyConfidence(emotion.confidence) : "—"}
                  </span>
                </div>
              </div>

              {/* Probabilities */}
              {probEntries.length > 0 && (
                <div className="mt-5 space-y-3">
                  {probEntries.map(([k, v]) => {
                    const pct = Math.max(0, Math.min(100, Math.round((v || 0) * 100)));
                    return (
                      <div key={k} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white">{k}</span>
                          <span className="text-text-gray">{pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-spotify-gray">
                          <div className="h-full bg-spotify-green" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 text-xs text-text-gray">
                Requests are throttled (~{Math.round(CAPTURE_INTERVAL_MS / 100) / 10}s) to balance UX and backend load.
              </div>
            </div>
          </div>

          {/* Right side card */}
          <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
            <div className="text-lg font-semibold">Tips for best results</div>
            <ul className="mt-4 space-y-3 text-sm text-text-gray">
              <li className="p-3 border bg-spotify-dark-gray/40 border-spotify-gray rounded-xl">
                Use good lighting (avoid strong backlight).
              </li>
              <li className="p-3 border bg-spotify-dark-gray/40 border-spotify-gray rounded-xl">
                Keep your face in the center and stable for a second.
              </li>
              <li className="p-3 border bg-spotify-dark-gray/40 border-spotify-gray rounded-xl">
                If accuracy drops, stop and restart the camera.
              </li>
              <li className="p-3 border bg-spotify-dark-gray/40 border-spotify-gray rounded-xl">
                Make sure your browser allows camera access for this site.
              </li>
            </ul>

            <div className="p-4 mt-6 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
              <div className="text-sm font-semibold">Privacy note</div>
              <div className="mt-2 text-sm text-text-gray">
                Only camera frames needed for detection are processed. Stop the camera anytime.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionPage;