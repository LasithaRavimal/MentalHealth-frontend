import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdCalendarToday, MdInsights, MdMood, MdTimeline } from "react-icons/md";
import { getMyFaceEmotionHistory } from "../api/faceHistoryApi";

const prettyEmotion = (value) => value || "—";

const getEmotionColor = (emotion) => {
  const map = {
    Happy: "text-green-400",
    Sad: "text-blue-400",
    Angry: "text-red-400",
    Fear: "text-yellow-300",
  };
  return map[emotion] || "text-white";
};

export default function FaceHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState({ sessions: [], total: 0, weekly_summary: { days: [] } });
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyFaceEmotionHistory();
      setHistory(data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load face emotion history");
    } finally {
      setLoading(false);
    }
  };

  const todaySummary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayItem = history?.weekly_summary?.days?.find((d) => d.date === today);
    return todayItem || null;
  }, [history]);

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
      <div className="max-w-6xl px-6 py-8 mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Face Progress</h1>
            <p className="mt-2 text-text-gray">
              Daily and weekly emotion progress based on completed face simulator sessions.
            </p>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 px-4 py-2 text-white transition border rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
          >
            <MdArrowBack />
            Back
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="border-4 rounded-full w-14 h-14 border-spotify-green border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-200 border rounded-2xl border-red-500/30 bg-red-500/10">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-gray">Total sessions</div>
                  <MdInsights className="text-2xl text-spotify-green" />
                </div>
                <div className="mt-3 text-3xl font-bold">{history.total}</div>
              </div>

              <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-gray">This week</div>
                  <MdTimeline className="text-2xl text-spotify-green" />
                </div>
                <div className="mt-3 text-3xl font-bold">
                  {history?.weekly_summary?.total_sessions_this_week || 0}
                </div>
              </div>

              <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-gray">Weekly top emotion</div>
                  <MdMood className="text-2xl text-spotify-green" />
                </div>
                <div className={`mt-3 text-3xl font-bold ${getEmotionColor(history?.weekly_summary?.overall_weekly_emotion)}`}>
                  {prettyEmotion(history?.weekly_summary?.overall_weekly_emotion)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
                <div className="flex items-center gap-2 mb-4 text-xl font-semibold">
                  <MdCalendarToday className="text-spotify-green" />
                  Today
                </div>

                {!todaySummary ? (
                  <div className="text-text-gray">No face sessions recorded today.</div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-text-gray">
                      Sessions today: <span className="font-semibold text-white">{todaySummary.sessions}</span>
                    </div>
                    <div className="text-text-gray">
                      Dominant daily emotion:{" "}
                      <span className={`font-semibold ${getEmotionColor(todaySummary.top_emotion)}`}>
                        {prettyEmotion(todaySummary.top_emotion)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
                <div className="mb-4 text-xl font-semibold">Last 7 days</div>

                <div className="space-y-3">
                  {history?.weekly_summary?.days?.length ? (
                    history.weekly_summary.days.map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between p-3 border rounded-xl border-white/5 bg-black/20"
                      >
                        <div>
                          <div className="font-medium text-white">{day.date}</div>
                          <div className="text-sm text-text-gray">{day.sessions} session(s)</div>
                        </div>
                        <div className={`font-semibold ${getEmotionColor(day.top_emotion)}`}>
                          {prettyEmotion(day.top_emotion)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-text-gray">No weekly records yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-2xl border-spotify-gray bg-spotify-light-gray/10">
              <div className="mb-4 text-xl font-semibold">All recorded sessions</div>

              {!history.sessions.length ? (
                <div className="text-text-gray">No saved face emotion sessions yet.</div>
              ) : (
                <div className="space-y-4">
                  {history.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 border rounded-xl border-white/5 bg-black/20"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm text-text-gray">
                            {new Date(session.created_at).toLocaleString()}
                          </div>
                          <div className={`mt-1 text-2xl font-bold ${getEmotionColor(session.dominant_emotion)}`}>
                            {session.dominant_emotion}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                          <div>
                            <div className="text-text-gray">Detections</div>
                            <div className="font-semibold text-white">{session.total_detections}</div>
                          </div>
                          <div>
                            <div className="text-text-gray">Duration</div>
                            <div className="font-semibold text-white">{Math.round(session.duration_seconds / 60)} min</div>
                          </div>
                          <div>
                            <div className="text-text-gray">Happy</div>
                            <div className="font-semibold text-white">{session.emotion_percentages?.Happy || 0}%</div>
                          </div>
                          <div>
                            <div className="text-text-gray">Sad</div>
                            <div className="font-semibold text-white">{session.emotion_percentages?.Sad || 0}%</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 text-sm md:grid-cols-4">
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-text-gray">Angry</div>
                          <div className="font-semibold text-white">{session.emotion_percentages?.Angry || 0}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-text-gray">Fear</div>
                          <div className="font-semibold text-white">{session.emotion_percentages?.Fear || 0}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-text-gray">Happy</div>
                          <div className="font-semibold text-white">{session.emotion_percentages?.Happy || 0}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-text-gray">Sad</div>
                          <div className="font-semibold text-white">{session.emotion_percentages?.Sad || 0}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}