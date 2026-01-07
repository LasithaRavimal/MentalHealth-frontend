import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import {
  MdArrowBack,
  MdCameraAlt,
  MdStop,
  MdRefresh,
  MdPlayArrow,
  MdReplay,
  MdTimer,
} from "react-icons/md";

const CAPTURE_INTERVAL_MS = 1200; // backend load control
const JPEG_QUALITY = 0.75; // 0..1
const CAPTURE_WIDTH = 360; // downscale
const SESSION_SECONDS = 180; // 3 minutes

const EMOTIONS = ["happy", "fear", "sad", "angry"]; // keep same order as your UI example

const initCounts = () =>
  EMOTIONS.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {});

const FaceDetectionPage = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const captureIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const inFlightRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [mirror, setMirror] = useState(true);

  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  // session
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);

  // latest prediction (for the "current emotion" UI)
  const [latest, setLatest] = useState(null); // { label, confidence, probabilities }

  // overall aggregation
  const [counts, setCounts] = useState(initCounts());
  const [totalDetections, setTotalDetections] = useState(0);

  const modelReady = useMemo(() => {
    if (!status) return null;
    return !!status.loaded;
  }, [status]);

  // ---------------- helpers ----------------
  const prettyConfidence = (c) => {
    const n = Number(c);
    if (Number.isNaN(n)) return "—";
    return `${Math.round(n * 100)}%`;
  };

  const formatTime = (sec) => {
    const s = Math.max(0, sec);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const normalizeLabel = (label) => {
    const v = String(label || "").toLowerCase().trim();
    if (v === "happiness") return "happy";
    if (v === "anger") return "angry";
    if (v === "sadness") return "sad";
    if (v === "fearful") return "fear";
    return v;
  };

  const normalizeProbabilities = (probs) => {
    // backend can send keys in any case; normalize to our 4 labels
    const src = probs && typeof probs === "object" ? probs : {};
    const out = {};
    for (const [k, v] of Object.entries(src)) {
      out[String(k).toLowerCase().trim()] = Number(v);
    }

    // map common variants
    if (out.happiness != null && out.happy == null) out.happy = out.happiness;
    if (out.anger != null && out.angry == null) out.angry = out.anger;
    if (out.sadness != null && out.sad == null) out.sad = out.sadness;
    if (out.fearful != null && out.fear == null) out.fear = out.fearful;

    // ensure all 4 exist (fallback 0)
    return EMOTIONS.reduce((acc, k) => {
      acc[k] = Number.isFinite(out[k]) ? out[k] : 0;
      return acc;
    }, {});
  };

  // current probability bars under camera (like your screenshot)
  const currentBars = useMemo(() => {
    const probs = normalizeProbabilities(latest?.probabilities);
    return EMOTIONS.map((k) => {
      const raw = probs[k] || 0;
      const pct = Math.max(0, Math.min(100, Math.round(raw * 100)));
      return { k, pct };
    });
  }, [latest]);

  const timeProgressPct = useMemo(() => {
    const done = SESSION_SECONDS - timeLeft;
    return Math.max(0, Math.min(100, Math.round((done / SESSION_SECONDS) * 100)));
  }, [timeLeft]);

  const overallStatus = useMemo(() => {
    if (!sessionEnded || !totalDetections) return null;

    let best = EMOTIONS[0];
    let bestVal = counts[best] ?? 0;

    for (const k of EMOTIONS) {
      const v = counts[k] ?? 0;
      if (v > bestVal) {
        best = k;
        bestVal = v;
      }
    }
    return best;
  }, [sessionEnded, totalDetections, counts]);

  const overallDist = useMemo(() => {
    const total = totalDetections || 0;
    return EMOTIONS.map((k) => {
      const v = counts[k] || 0;
      const pct = total ? Math.round((v / total) * 100) : 0;
      return { k, v, pct };
    }).sort((a, b) => b.v - a.v);
  }, [counts, totalDetections]);

  const statusBadge = useMemo(() => {
    if (!cameraOn) return { label: "OFF", cls: "border-spotify-gray text-text-gray" };
    if (sessionActive) return { label: "TRACKING", cls: "border-spotify-green text-spotify-green" };
    return { label: "READY", cls: "border-spotify-green/60 text-spotify-green/90" };
  }, [cameraOn, sessionActive]);

  // ---------------- lifecycle ----------------
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

  useEffect(() => {
    return () => {
      hardStopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- actions ----------------
  const refreshStatus = async () => {
    setError("");
    try {
      const res = await apiClient.get("/face/status");
      setStatus(res.data);
    } catch (e) {
      setError("Unable to refresh status. Check API connectivity.");
    }
  };

  const startCamera = async () => {
    setError("");
    setLatest(null);
    setSessionEnded(false);

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
    } catch (e) {
      setError("Camera permission denied or camera not available.");
      setCameraOn(false);
    }
  };

  const stopSessionInternal = (autoEnded) => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    inFlightRef.current = false;

    if (sessionActive || autoEnded) {
      setSessionActive(false);
      setSessionEnded(true);
    } else {
      setSessionActive(false);
    }
  };

  const stopCamera = () => {
    stopSessionInternal(false);

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  const hardStopAll = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    inFlightRef.current = false;

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setSessionActive(false);
    setSessionEnded(false);
    setCameraOn(false);
  };

  const resetSessionData = () => {
    setLatest(null);
    setCounts(initCounts());
    setTotalDetections(0);
    setTimeLeft(SESSION_SECONDS);
    setSessionEnded(false);
    setError("");
  };

  const restartSession = () => {
    setError("");
    stopSessionInternal(false);
    resetSessionData();
  };

  const startTracking = () => {
    setError("");

    if (!cameraOn) {
      setError("Turn on the camera first.");
      return;
    }
    if (modelReady === false) {
      setError("Model is not loaded on the server.");
      return;
    }
    if (sessionActive) return;

    // new session KPIs
    setSessionActive(true);
    setSessionEnded(false);
    setLatest(null);
    setCounts(initCounts());
    setTotalDetections(0);
    setTimeLeft(SESSION_SECONDS);

    // capture loop
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    captureIntervalRef.current = setInterval(() => {
      captureAndPredict();
    }, CAPTURE_INTERVAL_MS);

    // countdown
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopSessionInternal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureAndPredict = async () => {
    if (inFlightRef.current) return;
    if (!sessionActive) return;
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      inFlightRef.current = true;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      const scale = CAPTURE_WIDTH / vw;
      const cw = CAPTURE_WIDTH;
      const ch = Math.round(vh * scale);

      canvas.width = cw;
      canvas.height = ch;

      ctx.drawImage(video, 0, 0, cw, ch);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      const res = await apiClient.post("/face/predict-base64", {
        image_base64: dataUrl,
        filename: "frame.jpg",
        mime_type: "image/jpeg",
      });

      const label = normalizeLabel(res?.data?.label);
      const confidence = res?.data?.confidence;
      const probabilities = res?.data?.probabilities || {};

      setLatest({ label, confidence, probabilities });

      if (EMOTIONS.includes(label)) {
        setCounts((prev) => ({ ...prev, [label]: (prev[label] || 0) + 1 }));
        setTotalDetections((t) => t + 1);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Prediction failed. Check model is loaded and API is healthy.";
      setError(msg);
    } finally {
      inFlightRef.current = false;
    }
  };

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

      <div className="max-w-6xl px-6 mx-auto pb-14">
        <div className="mb-8">
          <h1 className="text-4xl font-bold md:text-5xl">
            Student Emotion <span className="text-spotify-green">Tracking</span>
          </h1>
          <p className="max-w-2xl mt-3 text-text-gray">
            Start camera → Start tracking → wait 3 minutes → get the overall result.
          </p>
        </div>

        {/* Control banner */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 p-4 border rounded-xl border-spotify-gray bg-spotify-light-gray/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-[240px]">
              <div className="text-sm text-text-gray">Service health</div>
              <div className="font-semibold text-white">
                {modelReady === null
                  ? "Checking model availability..."
                  : modelReady
                  ? "Model ready"
                  : "Model not loaded on server"}
              </div>
              <div className="mt-1 text-xs text-text-gray">
                Session length: 3 minutes • Sampling: ~{Math.round(CAPTURE_INTERVAL_MS / 100) / 10}s
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={modelReady === false}
                >
                  <MdCameraAlt className="text-xl" />
                  Start Camera
                </button>
              ) : (
                <>
                  {!sessionActive ? (
                    <button
                      onClick={startTracking}
                      className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-green hover:bg-spotify-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={modelReady === false}
                    >
                      <MdPlayArrow className="text-2xl" />
                      Start Tracking
                    </button>
                  ) : (
                    <button
                      onClick={() => stopSessionInternal(false)}
                      className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition rounded-full bg-spotify-gray hover:bg-spotify-light-gray"
                    >
                      <MdStop className="text-xl" />
                      Stop Tracking
                    </button>
                  )}

                  <button
                    onClick={restartSession}
                    className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition border rounded-full bg-spotify-dark-gray/70 hover:bg-spotify-dark-gray border-spotify-gray"
                  >
                    <MdReplay className="text-xl" />
                    Reset
                  </button>

                  <button
                    onClick={stopCamera}
                    className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition border rounded-full bg-spotify-dark-gray/70 hover:bg-spotify-dark-gray border-spotify-gray"
                  >
                    <MdStop className="text-xl" />
                    Stop Camera
                  </button>
                </>
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
          {/* Camera + Current emotion UI */}
          <div className="overflow-hidden border lg:col-span-2 rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
            <div className="flex items-center justify-between p-4 border-b border-spotify-gray">
              <div>
                <div className="font-semibold">Live Camera</div>
                <div className="text-xs text-text-gray">
                  Keep the face centered for stable predictions
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full border ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>

                {sessionActive && (
                  <div className="flex items-center gap-2 text-xs text-text-gray">
                    <MdTimer className="text-base" />
                    <span className="font-semibold text-white">{formatTime(timeLeft)}</span>
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
                      Click <span className="text-white">Start Camera</span> to continue.
                    </div>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Current emotion states (UNDER CAMERA) */}
            <div className="p-5 border-t border-spotify-gray">
              <div className="text-sm text-text-gray">Current emotion</div>

              <div className="flex flex-wrap items-end gap-3 mt-1">
                <div className="text-3xl font-bold">
                  {latest?.label ? (
                    <span className="text-spotify-green">
                      {latest.label.charAt(0).toUpperCase() + latest.label.slice(1)}
                    </span>
                  ) : (
                    <span className="text-white">—</span>
                  )}
                </div>

                <div className="text-text-gray">
                  Confidence:{" "}
                  <span className="font-semibold text-white">
                    {latest?.confidence != null ? prettyConfidence(latest.confidence) : "—"}
                  </span>
                </div>
              </div>

              {/* Bars exactly like your example */}
              <div className="mt-5 space-y-4">
                {currentBars.map(({ k, pct }) => (
                  <div key={k} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </span>
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
                  <div className="h-2 overflow-hidden rounded-full bg-spotify-gray">
                    <div className="h-full bg-spotify-green" style={{ width: `${timeProgressPct}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-text-gray">
                    Tracking will auto-end at 03:00 and show the final overall result.
                  </div>
                </div>
              )}

              <div className="mt-5 text-xs text-text-gray">
                Requests are throttled (~{Math.round(CAPTURE_INTERVAL_MS / 100) / 10}s) to balance UX and backend load.
              </div>
            </div>
          </div>

          {/* Overall result (final) */}
          <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
            <div className="text-lg font-semibold">Overall result</div>
            <div className="mt-2 text-sm text-text-gray">
              Final output after the 3-minute tracking session.
            </div>

            <div className="p-4 mt-5 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
              {!sessionEnded ? (
                <div className="text-text-gray">
                  Start tracking and wait until the session completes.
                </div>
              ) : !totalDetections ? (
                <div className="text-text-gray">
                  No valid detections captured. Improve lighting and keep the face centered, then retry.
                </div>
              ) : (
                <>
                  <div className="text-sm text-text-gray">Overall status</div>
                  <div className="mt-1 text-3xl font-bold text-spotify-green">
                    {overallStatus}
                  </div>

                  <div className="mt-4 text-sm text-text-gray">Session distribution</div>

                  <div className="mt-3 space-y-3">
                    {overallDist.map(({ k, v, pct }) => (
                      <div key={k} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white">
                            {k.charAt(0).toUpperCase() + k.slice(1)}
                          </span>
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

            <div className="p-4 mt-6 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
              <div className="text-sm font-semibold">Runbook</div>
              <ul className="mt-2 space-y-2 text-sm text-text-gray">
                <li>Front lighting is a must (avoid backlight).</li>
                <li>Keep one face only in view.</li>
                <li>If results are unstable, reset and run again.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionPage;
