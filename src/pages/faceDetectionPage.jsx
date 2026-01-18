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
  MdInfo,
  MdCheckCircle,
  MdInsights,
  MdVerified,
  MdWarningAmber,
  MdFace,
} from "react-icons/md";

const CAPTURE_INTERVAL_MS = 1200;
const JPEG_QUALITY = 0.75;
const CAPTURE_WIDTH = 360;
const SESSION_SECONDS = 180;

const EMOTIONS = ["happy", "fear", "sad", "angry"];

// no-face UX tuning
const NO_FACE_STREAK_SHOW = 2; // show banner after N consecutive no-face checks
const NO_FACE_STREAK_CLEAR_LATEST = 4; // clear latest after N consecutive no-face checks

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

  // Prevent stale state inside intervals
  const sessionActiveRef = useRef(false);
  const cameraOnRef = useRef(false);

  // Face detector (browser native) + fallback heuristic
  const faceDetectorRef = useRef(null);
  const noFaceStreakRef = useRef(0);

  const [cameraOn, setCameraOn] = useState(false);
  const [mirror, setMirror] = useState(true);

  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  // Face detection UX (frontend-level)
  const [noFace, setNoFace] = useState(false);
  const [noFaceMsg, setNoFaceMsg] = useState("");

  // session
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);

  // latest prediction
  const [latest, setLatest] = useState(null); // { label, confidence, probabilities }

  // overall aggregation
  const [counts, setCounts] = useState(initCounts());
  const [totalDetections, setTotalDetections] = useState(0);

  const modelReady = useMemo(() => {
    if (!status) return null;
    return !!status.loaded;
  }, [status]);

  // keep refs synced
  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    cameraOnRef.current = cameraOn;
  }, [cameraOn]);

  // init native FaceDetector if browser supports it
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && "FaceDetector" in window) {
        // eslint-disable-next-line no-undef
        faceDetectorRef.current = new window.FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1,
        });
      }
    } catch {
      faceDetectorRef.current = null;
    }
  }, []);

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

  /**
   * Accepts multiple backend shapes:
   * - object map: { happy: 0.6, sad: 0.2 }
   * - array of objects: [{ label:"Happy", probability:0.6 }]
   * - array of tuples: [["Happy",0.6]]
   */
  const normalizeProbabilities = (raw) => {
    const out = {};

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (!item) continue;

        if (typeof item === "object" && !Array.isArray(item)) {
          const k = item.label ?? item.emotion ?? item.name ?? item.class ?? item.key;
          const v = item.probability ?? item.prob ?? item.score ?? item.value ?? item.p;
          if (k != null && v != null) out[String(k).toLowerCase().trim()] = Number(v);
          continue;
        }

        if (Array.isArray(item) && item.length >= 2) {
          out[String(item[0]).toLowerCase().trim()] = Number(item[1]);
        }
      }
    }

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [k, v] of Object.entries(raw)) {
        out[String(k).toLowerCase().trim()] = Number(v);
      }
    }

    // map variants
    if (out.happiness != null && out.happy == null) out.happy = out.happiness;
    if (out.anger != null && out.angry == null) out.angry = out.anger;
    if (out.sadness != null && out.sad == null) out.sad = out.sadness;
    if (out.fearful != null && out.fear == null) out.fear = out.fearful;

    return EMOTIONS.reduce((acc, k) => {
      acc[k] = Number.isFinite(out[k]) ? out[k] : 0;
      return acc;
    }, {});
  };

  // backend “no face” detection (in case backend already supports it)
  const isNoFaceBackend = (data, errMsg) => {
    const msg = String(data?.detail ?? data?.message ?? data?.error ?? errMsg ?? "")
      .toLowerCase()
      .trim();

    if (
      msg.includes("no face") ||
      msg.includes("face not detected") ||
      msg.includes("no_faces") ||
      msg.includes("not detect face")
    )
      return true;

    if (data?.no_face === true || data?.face_detected === false) return true;

    return false;
  };

  // quick heuristic for “camera covered / too dark / blank”
  const looksCoveredOrBlank = (canvas) => {
    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;

      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return false;

      const img = ctx.getImageData(0, 0, w, h).data;

      // sample every N pixels to keep it cheap
      const step = 16; // bigger = faster
      let count = 0;
      let sum = 0;
      let sum2 = 0;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          const r = img[i] || 0;
          const g = img[i + 1] || 0;
          const b = img[i + 2] || 0;

          // luminance
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          sum += lum;
          sum2 += lum * lum;
          count += 1;
        }
      }

      if (!count) return false;

      const mean = sum / count;
      const variance = sum2 / count - mean * mean;
      const std = Math.sqrt(Math.max(0, variance));

      // thresholds tuned for “hand covering camera / black screen / very low detail”
      const tooDark = mean < 25;
      const tooFlat = std < 10;

      return tooDark || tooFlat;
    } catch {
      return false;
    }
  };

  // frontend face check: native FaceDetector if available, else heuristic fallback
  const detectFaceFrontend = async (canvas) => {
    // 1) native detector (best)
    const fd = faceDetectorRef.current;
    if (fd) {
      try {
        const faces = await fd.detect(canvas);
        return Array.isArray(faces) && faces.length > 0;
      } catch {
        // if detector fails, fallback
      }
    }

    // 2) heuristic fallback
    // If camera is covered/black/blank, treat as no-face
    if (looksCoveredOrBlank(canvas)) return false;

    // Otherwise, we can't reliably detect face without a model,
    // so allow backend to decide.
    return true;
  };

  const probsNormalized = useMemo(() => normalizeProbabilities(latest?.probabilities), [latest]);

  // current emotion bar should be first (top)
  const currentBars = useMemo(() => {
    const label = normalizeLabel(latest?.label);
    const base = EMOTIONS.map((k) => {
      const pct = Math.max(0, Math.min(100, Math.round((probsNormalized[k] || 0) * 100)));
      return { k, pct };
    });

    if (!label || !EMOTIONS.includes(label)) return base;

    const currentItem = base.find((x) => x.k === label);
    const rest = base.filter((x) => x.k !== label);

    return currentItem ? [currentItem, ...rest] : base;
  }, [latest, probsNormalized]);

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

  const overallLabelPretty = useMemo(() => {
    if (!overallStatus) return "—";
    return overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1);
  }, [overallStatus]);

  const setNoFaceState = (msg) => {
    setNoFace(true);
    setNoFaceMsg(msg || "No face detected. Please face the camera and keep your face in the frame.");
  };

  const clearNoFaceState = () => {
    setNoFace(false);
    setNoFaceMsg("");
    noFaceStreakRef.current = 0;
  };

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

  const clearTimers = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    inFlightRef.current = false;
  };

  const stopSessionInternal = (autoEnded) => {
    clearTimers();
    sessionActiveRef.current = false;

    if (sessionActive || autoEnded) {
      setSessionActive(false);
      setSessionEnded(true);
    } else {
      setSessionActive(false);
    }
  };

  const startCamera = async () => {
    setError("");
    setLatest(null);
    setSessionEnded(false);
    clearNoFaceState();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      // detect if user/browser stops camera
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setNoFaceState("Camera stopped. Start camera again to continue.");
          stopSessionInternal(false);
          setCameraOn(false);
        };
        track.onmute = () => {
          // some browsers mark track muted when camera is blocked/covered
          setNoFaceState("Camera is blocked. Uncover the camera / allow permission.");
        };
        track.onunmute = () => {
          // when camera becomes available again
          clearNoFaceState();
        };
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

    setNoFaceState("Camera is off. Start camera to continue detection.");
  };

  const hardStopAll = () => {
    clearTimers();
    sessionActiveRef.current = false;

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
    clearNoFaceState();
  };

  const restartSession = () => {
    setError("");
    stopSessionInternal(false);
    resetSessionData();
  };

  const startTracking = async () => {
    setError("");

    if (!cameraOnRef.current) {
      setError("Turn on the camera first.");
      return;
    }
    if (modelReady === false) {
      setError("Model is not loaded on the server.");
      return;
    }
    if (sessionActiveRef.current) return;

    clearNoFaceState();
    noFaceStreakRef.current = 0;

    sessionActiveRef.current = true;
    setSessionActive(true);
    setSessionEnded(false);
    setLatest(null);
    setCounts(initCounts());
    setTotalDetections(0);
    setTimeLeft(SESSION_SECONDS);

    await captureAndPredict();

    captureIntervalRef.current = setInterval(() => {
      captureAndPredict();
    }, CAPTURE_INTERVAL_MS);

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
    if (!sessionActiveRef.current) return;
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

      // ✅ FRONTEND "NO FACE" CHECK (works even if backend always returns a label)
      const faceOk = await detectFaceFrontend(canvas);
      if (!faceOk) {
        noFaceStreakRef.current += 1;

        if (noFaceStreakRef.current >= NO_FACE_STREAK_SHOW) {
          setNoFaceState("No face detected. Face the camera and keep your face in the frame.");
        }
        if (noFaceStreakRef.current >= NO_FACE_STREAK_CLEAR_LATEST) {
          setLatest(null);
        }

        // don't call backend, don't count detections
        return;
      }

      // If face is ok, clear no-face state (stops sticky banner)
      clearNoFaceState();

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      const res = await apiClient.post("/face/predict-base64", {
        image_base64: dataUrl,
        filename: "frame.jpg",
        mime_type: "image/jpeg",
      });

      // If backend indicates no-face (optional support)
      if (isNoFaceBackend(res?.data, "")) {
        noFaceStreakRef.current += 1;
        if (noFaceStreakRef.current >= NO_FACE_STREAK_SHOW) {
          setNoFaceState("No face detected. Face the camera and keep your face in the frame.");
        }
        if (noFaceStreakRef.current >= NO_FACE_STREAK_CLEAR_LATEST) {
          setLatest(null);
        }
        return;
      }

      noFaceStreakRef.current = 0;
      setNoFace(false);
      setNoFaceMsg("");

      const label = normalizeLabel(res?.data?.label);
      const confidence = res?.data?.confidence;

      const rawProbs =
        res?.data?.probabilities ??
        res?.data?.probs ??
        res?.data?.scores ??
        res?.data?.predictions ??
        null;

      setLatest({
        label,
        confidence,
        probabilities: rawProbs,
      });

      if (EMOTIONS.includes(label)) {
        setCounts((prev) => ({ ...prev, [label]: (prev[label] || 0) + 1 }));
        setTotalDetections((t) => t + 1);
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || "Prediction failed. Check model and API health.";

      if (isNoFaceBackend(e?.response?.data, msg)) {
        noFaceStreakRef.current += 1;
        if (noFaceStreakRef.current >= NO_FACE_STREAK_SHOW) {
          setNoFaceState("No face detected. Face the camera and keep your face in the frame.");
        }
        if (noFaceStreakRef.current >= NO_FACE_STREAK_CLEAR_LATEST) {
          setLatest(null);
        }
        return;
      }

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
        {/* Header */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">
              Student Emotion <span className="text-spotify-green">Tracking</span>
            </h1>
            <p className="max-w-2xl mt-2 text-text-gray">
              Start camera → Start tracking → auto ends in 3 minutes → overall result appears.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
              <div className="text-xs text-text-gray">Session</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-3 py-1 rounded-full border ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
                <span className="text-xs text-text-gray">
                  {sessionActive ? `Time left: ${formatTime(timeLeft)}` : `Length: 03:00`}
                </span>
              </div>
            </div>

            <div className="px-4 py-3 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
              <div className="text-xs text-text-gray">Model</div>
              <div className="mt-1 text-sm font-semibold text-white">
                {modelReady === null ? "Checking..." : modelReady ? "Ready" : "Not loaded"}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 p-4 border rounded-xl border-spotify-gray bg-spotify-light-gray/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-[240px]">
              <div className="text-sm text-text-gray">Controls</div>
              <div className="mt-1 text-xs text-text-gray">
                Sampling: ~{Math.round(CAPTURE_INTERVAL_MS / 100) / 10}s • Session: 3 minutes
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

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Camera */}
          <div className="overflow-hidden border lg:col-span-2 rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
            <div className="flex items-center justify-between p-4 border-b border-spotify-gray">
              <div>
                <div className="font-semibold">Live Camera</div>
                <div className="text-xs text-text-gray">
                  Keep face centered for stable confidence + probabilities
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

              {/* No face overlay */}
              {cameraOn && sessionActive && noFace && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <div className="max-w-md p-4 mx-4 border rounded-2xl border-spotify-gray bg-spotify-dark-gray/70">
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

            {/* Current emotion */}
            <div className="p-5 border-t border-spotify-gray">
              <div className="flex items-center justify-between gap-3">
                <div>
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
                </div>

                <div className="text-right">
                  <div className="text-xs text-text-gray">Sampling</div>
                  <div className="text-sm font-semibold text-white">
                    ~{Math.round(CAPTURE_INTERVAL_MS / 100) / 10}s
                  </div>
                </div>
              </div>

              {/* Bars */}
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
                  <div className="flex items-center justify-between text-xs text-text-gray">
                    <span>Session progress</span>
                    <span className="font-semibold text-white">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="h-2 mt-2 overflow-hidden rounded-full bg-spotify-gray">
                    <div className="h-full bg-spotify-green" style={{ width: `${timeProgressPct}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-text-gray">
                    Auto-end at 03:00 and publish overall result.
                  </div>
                </div>
              )}

              <div className="mt-5 text-xs text-text-gray">
                Requests are throttled to balance UX and backend load.
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-6">
            {/* Overall result */}
            <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Overall result</div>
                <MdInsights className="text-2xl text-spotify-green" />
              </div>
              <div className="mt-2 text-sm text-text-gray">
                Published when the 3-minute session finishes.
              </div>

              <div className="p-4 mt-5 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
                {!sessionEnded ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-text-gray">
                      <MdVerified className="text-xl text-spotify-green" />
                      <span>Run a full session to generate the final status.</span>
                    </div>

                    {sessionActive && noFace ? (
                      <div className="text-xs text-text-gray">
                        Waiting for a valid face. Keep your face visible to collect detections.
                      </div>
                    ) : (
                      <div className="text-xs text-text-gray">
                        Tip: Keep your face centered and don’t cover the camera.
                      </div>
                    )}
                  </div>
                ) : !totalDetections ? (
                  <div className="text-text-gray">
                    No valid detections captured. Improve lighting and keep the face centered, then retry.
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-text-gray">Overall status</div>
                    <div className="mt-1 text-3xl font-bold text-spotify-green">
                      {overallLabelPretty}
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

            {/* Tips */}
            <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10 shadow-card">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MdInfo className="text-xl text-spotify-green" />
                How to use
              </div>

              <div className="mt-4 space-y-3 text-sm text-text-gray">
                <div className="flex gap-3 p-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
                  <MdCheckCircle className="mt-0.5 text-lg text-spotify-green" />
                  <div>
                    Click <span className="font-semibold text-white">Start Camera</span> and allow camera access.
                  </div>
                </div>

                <div className="flex gap-3 p-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
                  <MdCheckCircle className="mt-0.5 text-lg text-spotify-green" />
                  <div>
                    Click <span className="font-semibold text-white">Start Tracking</span> to start the 3-minute session.
                  </div>
                </div>

                <div className="flex gap-3 p-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
                  <MdCheckCircle className="mt-0.5 text-lg text-spotify-green" />
                  <div>Face forward, keep your head still, and use front lighting.</div>
                </div>

                <div className="flex gap-3 p-3 border rounded-xl border-spotify-gray bg-spotify-dark-gray/40">
                  <MdCheckCircle className="mt-0.5 text-lg text-spotify-green" />
                  <div>
                    If you cover/close the camera, the UI will flag{" "}
                    <span className="font-semibold text-white">No face detected</span>.
                  </div>
                </div>
              </div>

              <div className="p-4 mt-5 text-sm border rounded-xl border-spotify-gray bg-spotify-dark-gray/40 text-text-gray">
                If output becomes unstable, click <span className="font-semibold text-white">Reset</span> and rerun.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionPage;
