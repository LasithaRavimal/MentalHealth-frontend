import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdCalendarToday,
  MdInsights,
  MdMood,
  MdTimeline,
  MdAccessTime,
  MdSentimentSatisfiedAlt,
  MdBarChart,
  MdRefresh,
} from "react-icons/md";
import { getMyFaceEmotionHistory } from "../api/faceHistoryApi";

const prettyEmotion = (value) => {
  if (!value) return "—";
  const normalized = String(value).toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getEmotionKey = (emotion) => String(emotion || "").toLowerCase();

const getEmotionColor = (emotion) => {
  const key = getEmotionKey(emotion);

  const map = {
    happy: "text-green-400",
    sad: "text-blue-400",
    angry: "text-red-400",
    fear: "text-yellow-300",
  };

  return map[key] || "text-white";
};

const getEmotionBadgeClass = (emotion) => {
  const key = getEmotionKey(emotion);

  const map = {
    happy: "bg-green-500/15 text-green-300 border-green-500/20",
    sad: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    angry: "bg-red-500/15 text-red-300 border-red-500/20",
    fear: "bg-yellow-500/15 text-yellow-200 border-yellow-500/20",
  };

  return map[key] || "bg-white/10 text-white border-white/10";
};

const getPct = (session, key) => {
  const percentages = session?.emotion_percentages || {};
  return (
    percentages[key] ??
    percentages[key.toLowerCase()] ??
    percentages[key.charAt(0).toUpperCase() + key.slice(1)] ??
    0
  );
};

const getTopEmotionFromSession = (session) => {
  const values = [
    { key: "happy", value: getPct(session, "happy") },
    { key: "sad", value: getPct(session, "sad") },
    { key: "angry", value: getPct(session, "angry") },
    { key: "fear", value: getPct(session, "fear") },
  ];

  const top = values.sort((a, b) => b.value - a.value)[0];
  return top?.key || null;
};

const StatCard = ({ title, value, icon, accent = "text-spotify-green", subtext }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-sm transition hover:bg-white/[0.06]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-gray">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
        {subtext ? <p className="mt-2 text-xs text-text-gray">{subtext}</p> : null}
      </div>
      <div className={`text-3xl ${accent}`}>{icon}</div>
    </div>
  </div>
);

const EmotionProgressBar = ({ label, value, emotionKey }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-gray">{label}</span>
      <span className={`font-semibold ${getEmotionColor(emotionKey)}`}>{value}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${
          emotionKey === "happy"
            ? "bg-green-400"
            : emotionKey === "sad"
            ? "bg-blue-400"
            : emotionKey === "angry"
            ? "bg-red-400"
            : emotionKey === "fear"
            ? "bg-yellow-300"
            : "bg-white"
        }`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  </div>
);

export default function FaceHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState({
    sessions: [],
    total: 0,
    weekly_summary: {
      days: [],
      total_sessions_this_week: 0,
      overall_weekly_emotion: null,
    },
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyFaceEmotionHistory();

      setHistory(
        data || {
          sessions: [],
          total: 0,
          weekly_summary: {
            days: [],
            total_sessions_this_week: 0,
            overall_weekly_emotion: null,
          },
        }
      );
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load face emotion history");
    } finally {
      setLoading(false);
    }
  };

  const todaySummary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return history?.weekly_summary?.days?.find((d) => d.date === today) || null;
  }, [history]);

  const latestSession = useMemo(() => {
    return history?.sessions?.length ? history.sessions[0] : null;
  }, [history]);

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-spotify-dark-gray via-spotify-black to-black">
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-text-gray">
              <MdBarChart className="text-spotify-green" />
              Face emotion analytics
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Face Progress Dashboard
            </h1>
            <p className="max-w-3xl mt-3 text-text-gray">
              Monitor daily performance, weekly emotion patterns, and completed session outcomes
              through a cleaner behavioral summary view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadHistory}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition border rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            >
              <MdRefresh className="text-lg" />
              Refresh
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition border rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            >
              <MdArrowBack className="text-lg" />
              Back
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="border-4 rounded-full h-14 w-14 border-spotify-green border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-5 text-red-200 border rounded-2xl border-red-500/30 bg-red-500/10">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Sessions"
                value={history.total}
                icon={<MdInsights />}
                subtext="All completed face detection sessions"
              />
              <StatCard
                title="Sessions This Week"
                value={history?.weekly_summary?.total_sessions_this_week || 0}
                icon={<MdTimeline />}
                subtext="Rolling 7-day activity volume"
              />
              <StatCard
                title="Weekly Top Emotion"
                value={prettyEmotion(history?.weekly_summary?.overall_weekly_emotion)}
                icon={<MdMood />}
                accent={getEmotionColor(history?.weekly_summary?.overall_weekly_emotion)}
                subtext="Most frequent weekly dominant emotion"
              />
              <StatCard
                title="Latest Session"
                value={
                  latestSession
                    ? new Date(latestSession.created_at).toLocaleDateString()
                    : "—"
                }
                icon={<MdAccessTime />}
                subtext="Most recently captured session date"
              />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-sm xl:col-span-1">
                <div className="flex items-center gap-2 mb-5 text-xl font-semibold">
                  <MdCalendarToday className="text-spotify-green" />
                  Today Snapshot
                </div>

                {!todaySummary ? (
                  <div className="p-6 text-center border border-dashed rounded-2xl border-white/10 bg-black/20 text-text-gray">
                    No face sessions recorded today.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/20">
                      <p className="text-sm text-text-gray">Sessions today</p>
                      <p className="mt-2 text-3xl font-bold text-white">{todaySummary.sessions}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/20">
                      <p className="text-sm text-text-gray">Dominant daily emotion</p>
                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${getEmotionBadgeClass(
                            todaySummary.top_emotion
                          )}`}
                        >
                          {prettyEmotion(todaySummary.top_emotion)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-sm xl:col-span-2">
                <div className="flex items-center gap-2 mb-5 text-xl font-semibold">
                  <MdTimeline className="text-spotify-green" />
                  Weekly Activity
                </div>

                {history?.weekly_summary?.days?.length ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {history.weekly_summary.days.map((day) => (
                      <div
                        key={day.date}
                        className="p-4 transition border rounded-2xl border-white/5 bg-black/20 hover:bg-black/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm text-text-gray">{day.date}</div>
                            <div className="mt-1 text-lg font-semibold text-white">
                              {day.sessions} session{day.sessions > 1 ? "s" : ""}
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getEmotionBadgeClass(
                              day.top_emotion
                            )}`}
                          >
                            {prettyEmotion(day.top_emotion)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed rounded-2xl border-white/10 bg-black/20 text-text-gray">
                    No weekly records yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Recorded Sessions</h2>
                  <p className="mt-1 text-sm text-text-gray">
                    Session-level breakdown with emotion distribution and detection volume.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 text-sm border rounded-full border-white/10 bg-black/20 text-text-gray">
                  <MdSentimentSatisfiedAlt className="text-spotify-green" />
                  {history.sessions.length} entries
                </div>
              </div>

              {!history.sessions.length ? (
                <div className="p-10 text-center border border-dashed rounded-2xl border-white/10 bg-black/20 text-text-gray">
                  No saved face emotion sessions yet.
                </div>
              ) : (
                <div className="space-y-5">
                  {history.sessions.map((session) => {
                    const happy = getPct(session, "happy");
                    const sad = getPct(session, "sad");
                    const angry = getPct(session, "angry");
                    const fear = getPct(session, "fear");
                    const topEmotion = getTopEmotionFromSession(session);

                    return (
                      <div
                        key={session.id}
                        className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-black/40 to-white/[0.03] p-5 shadow-lg transition hover:border-white/15 hover:bg-white/[0.05]"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm text-text-gray">
                              {new Date(session.created_at).toLocaleString()}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <h3
                                className={`text-3xl font-bold ${getEmotionColor(
                                  session.dominant_emotion
                                )}`}
                              >
                                {prettyEmotion(session.dominant_emotion)}
                              </h3>

                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getEmotionBadgeClass(
                                  topEmotion
                                )}`}
                              >
                                Top mix: {prettyEmotion(topEmotion)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:min-w-[360px]">
                            <div className="p-3 rounded-2xl bg-black/25">
                              <p className="text-xs tracking-wide uppercase text-text-gray">
                                Detections
                              </p>
                              <p className="mt-2 text-lg font-bold text-white">
                                {session.total_detections}
                              </p>
                            </div>

                            <div className="p-3 rounded-2xl bg-black/25">
                              <p className="text-xs tracking-wide uppercase text-text-gray">
                                Duration
                              </p>
                              <p className="mt-2 text-lg font-bold text-white">
                                {Math.round(session.duration_seconds / 60)} min
                              </p>
                            </div>

                            <div className="p-3 rounded-2xl bg-black/25">
                              <p className="text-xs tracking-wide uppercase text-text-gray">
                                Main Emotion
                              </p>
                              <p
                                className={`mt-2 text-lg font-bold ${getEmotionColor(
                                  session.dominant_emotion
                                )}`}
                              >
                                {prettyEmotion(session.dominant_emotion)}
                              </p>
                            </div>

                            <div className="p-3 rounded-2xl bg-black/25">
                              <p className="text-xs tracking-wide uppercase text-text-gray">
                                Recorded
                              </p>
                              <p className="mt-2 text-sm font-semibold text-white">
                                {new Date(session.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
                          <div className="p-4 border rounded-2xl border-white/5 bg-black/20">
                            <h4 className="mb-4 text-sm font-semibold tracking-wide uppercase text-text-gray">
                              Emotion Distribution
                            </h4>

                            <div className="space-y-4">
                              <EmotionProgressBar label="Happy" value={happy} emotionKey="happy" />
                              <EmotionProgressBar label="Sad" value={sad} emotionKey="sad" />
                              <EmotionProgressBar label="Angry" value={angry} emotionKey="angry" />
                              <EmotionProgressBar label="Fear" value={fear} emotionKey="fear" />
                            </div>
                          </div>

                          <div className="p-4 border rounded-2xl border-white/5 bg-black/20">
                            <h4 className="mb-4 text-sm font-semibold tracking-wide uppercase text-text-gray">
                              Quick Breakdown
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-sm text-text-gray">Happy</p>
                                <p className="mt-2 text-xl font-bold text-green-400">{happy}%</p>
                              </div>
                              <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-sm text-text-gray">Sad</p>
                                <p className="mt-2 text-xl font-bold text-blue-400">{sad}%</p>
                              </div>
                              <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-sm text-text-gray">Angry</p>
                                <p className="mt-2 text-xl font-bold text-red-400">{angry}%</p>
                              </div>
                              <div className="p-4 rounded-xl bg-white/5">
                                <p className="text-sm text-text-gray">Fear</p>
                                <p className="mt-2 text-xl font-bold text-yellow-300">{fear}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}