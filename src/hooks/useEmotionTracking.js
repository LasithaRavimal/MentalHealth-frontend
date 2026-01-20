import { useMemo, useRef, useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { EMOTIONS, initCounts, normalizeLabel, normalizeProbabilities } from "../utils/emotionUtils";
import { isNoFaceBackend, looksCoveredOrBlank } from "../utils/faceUtils";

// no-face UX tuning
const NO_FACE_STREAK_SHOW = 2;
const NO_FACE_STREAK_CLEAR_LATEST = 4;

const defaultIntervalForDuration = (durationSeconds) => {
  // Backend load guardrails
  if (durationSeconds >= 3600) return 3000; // 60m
  if (durationSeconds >= 1800) return 2500; // 30m
  if (durationSeconds >= 900) return 2000;  // 15m
  return 1500;                               // 5m
};

export default function useEmotionTracking() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const captureIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const inFlightRef = useRef(false);

  const sessionActiveRef = useRef(false);
  const cameraOnRef = useRef(false);

  const faceDetectorRef = useRef(null);
  const noFaceStreakRef = useRef(0);

  const [cameraOn, setCameraOn] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const [noFace, setNoFace] = useState(false);
  const [noFaceMsg, setNoFaceMsg] = useState("");

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  // ✅ default 15 min, but supports 5/15/30/60
  const [durationSeconds, setDurationSeconds] = useState(15 * 60);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const [captureIntervalMs, setCaptureIntervalMs] = useState(defaultIntervalForDuration(15 * 60));

  const [latest, setLatest] = useState(null);
  const [counts, setCounts] = useState(initCounts());
  const [totalDetections, setTotalDetections] = useState(0);

  const modelReady = useMemo(() => {
    if (!status) return null;
    return !!status.loaded;
  }, [status]);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    cameraOnRef.current = cameraOn;
  }, [cameraOn]);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get("/face/status");
        if (!mounted) return;
        setStatus(res.data);
      } catch {
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

  const refreshStatus = async () => {
    setError("");
    try {
      const res = await apiClient.get("/face/status");
      setStatus(res.data);
    } catch {
      setError("Unable to refresh status. Check API connectivity.");
    }
  };

  const setNoFaceState = (msg) => {
    setNoFace(true);
    setNoFaceMsg(msg || "No face detected. Please face the camera and keep your face in the frame.");
  };

  const clearNoFaceState = () => {
    setNoFace(false);
    setNoFaceMsg("");
    noFaceStreakRef.current = 0;
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

      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setNoFaceState("Camera stopped. Start camera again to continue.");
          stopSessionInternal(false);
          setCameraOn(false);
        };
        track.onmute = () => {
          setNoFaceState("Camera is blocked. Uncover the camera / allow permission.");
        };
        track.onunmute = () => {
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
    } catch {
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
    if (videoRef.current) videoRef.current.srcObject = null;

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
    if (videoRef.current) videoRef.current.srcObject = null;

    setSessionActive(false);
    setSessionEnded(false);
    setCameraOn(false);
  };

  const resetSessionData = (secs = durationSeconds) => {
    setLatest(null);
    setCounts(initCounts());
    setTotalDetections(0);
    setTimeLeft(secs);
    setSessionEnded(false);
    setError("");
    clearNoFaceState();
  };

  const restartSession = () => {
    setError("");
    stopSessionInternal(false);
    resetSessionData();
  };

  const applyDurationMinutes = (minutes) => {
    const m = Number(minutes);
    const allowed = [5, 15, 30, 60];
    const safe = allowed.includes(m) ? m : 15;

    const secs = safe * 60;
    setDurationSeconds(secs);
    setTimeLeft(secs);

    const suggested = defaultIntervalForDuration(secs);
    setCaptureIntervalMs(suggested);
  };

  const detectFaceFrontend = async (canvas) => {
    const fd = faceDetectorRef.current;
    if (fd) {
      try {
        const faces = await fd.detect(canvas);
        return Array.isArray(faces) && faces.length > 0;
      } catch {
        // fallback below
      }
    }

    if (looksCoveredOrBlank(canvas)) return false;

    // Can't reliably detect face without a model; let backend decide.
    return true;
  };

  const startSession = async () => {
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
    setTimeLeft(durationSeconds);

    await captureAndPredict();

    captureIntervalRef.current = setInterval(() => {
      captureAndPredict();
    }, captureIntervalMs);

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

      const CAPTURE_WIDTH = 360;
      const JPEG_QUALITY = 0.75;

      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      const scale = CAPTURE_WIDTH / vw;
      const cw = CAPTURE_WIDTH;
      const ch = Math.round(vh * scale);

      canvas.width = cw;
      canvas.height = ch;

      ctx.drawImage(video, 0, 0, cw, ch);

      const faceOk = await detectFaceFrontend(canvas);
      if (!faceOk) {
        noFaceStreakRef.current += 1;

        if (noFaceStreakRef.current >= NO_FACE_STREAK_SHOW) {
          setNoFaceState("No face detected. Face the camera and keep your face in the frame.");
        }
        if (noFaceStreakRef.current >= NO_FACE_STREAK_CLEAR_LATEST) {
          setLatest(null);
        }
        return;
      }

      clearNoFaceState();

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      const res = await apiClient.post("/face/predict-base64", {
        image_base64: dataUrl,
        filename: "frame.jpg",
        mime_type: "image/jpeg",
      });

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

      setLatest({ label, confidence, probabilities: rawProbs });

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

  const probsNormalized = useMemo(() => normalizeProbabilities(latest?.probabilities), [latest]);

  return {
    videoRef,
    canvasRef,

    cameraOn,
    status,
    modelReady,
    error,

    noFace,
    noFaceMsg,

    sessionActive,
    sessionEnded,
    durationSeconds,
    timeLeft,

    captureIntervalMs,

    latest,
    probsNormalized,
    counts,
    totalDetections,

    refreshStatus,
    startCamera,
    stopCamera,
    hardStopAll,
    restartSession,
    resetSessionData,
    startSession,
    stopSession: () => stopSessionInternal(false),

    applyDurationMinutes,
    setCaptureIntervalMs,
    setError,
    setLatest,
  };
}
