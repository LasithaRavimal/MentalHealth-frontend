// src/pages/FaceWeeklyTrackingPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFaceWeekly, deleteFaceSession } from "../api/faceTrackingApi";
import { MdArrowBack, MdRefresh, MdDelete } from "react-icons/md";

import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

const toMin = (sec) => Math.round((sec || 0) / 60);

function KpiCard({ title, value, sub }) {
  return (
    <div className="p-5 border bg-spotify-light-gray/10 border-white/5 rounded-2xl">
      <div className="text-sm text-text-gray">{title}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-text-gray">{sub}</div>
    </div>
  );
}

export default function FaceWeeklyTrackingPage() {
  const navigate = useNavigate();

  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const labels = useMemo(() => {
    const fallback = ["Angry", "Fear", "Happy", "Sad"];
    if (!data?.daily?.[0]?.emotion_counts) return fallback;
    return Object.keys(data.daily[0].emotion_counts);
  }, [data]);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetchFaceWeekly(days);
      setData(res);
    } catch (e) {
      setErr("Failed to load weekly tracking. Check backend + auth token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const dailyStacked = useMemo(() => {
    if (!data?.daily) return [];
    return data.daily.map((d) => {
      const row = { date: d.date.slice(5), sessions: d.sessions || 0, minutes: toMin(d.total_seconds || 0) };
      labels.forEach((lbl) => (row[lbl] = d.emotion_counts?.[lbl] || 0));
      return row;
    });
  }, [data, labels]);

  const weeklyTrend = useMemo(() => {
    if (!data?.weekly) return [];
    return data.weekly.map((w) => ({
      week: w.week_start.slice(5),
      ecs: w.ecs,
      sessions: w.sessions,
      minutes: toMin(w.total_seconds),
    }));
  }, [data]);

  const pie7d = useMemo(() => {
    if (!data?.daily) return [];
    const last7 = data.daily.slice(-7);
    const agg = {};
    labels.forEach((l) => (agg[l] = 0));
    last7.forEach((d) => labels.forEach((l) => (agg[l] += d.emotion_counts?.[l] || 0)));
    return labels.map((l) => ({ name: l, value: agg[l] }));
  }, [data, labels]);

  const onDelete = async (id) => {
    try {
      await deleteFaceSession(id);
      await load();
    } catch {
      alert("Delete failed.");
    }
  };

  return (
    <div className="flex-1 min-h-screen p-8 pb-32 overflow-y-auto bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3 py-2 text-white border rounded-lg bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
          >
            <MdArrowBack /> Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Face Weekly Tracking</h1>
            <p className="text-sm text-text-gray">Session summaries • Daily + Weekly analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 text-white border rounded-lg bg-spotify-light-gray/20 border-white/5"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={28}>Last 28 days</option>
            <option value={56}>Last 56 days</option>
          </select>

          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 font-semibold text-black rounded-lg bg-spotify-green hover:opacity-90"
          >
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-16 h-16 border-4 rounded-full border-spotify-green border-t-transparent animate-spin"></div>
        </div>
      ) : err ? (
        <div className="p-6 text-red-200 border rounded-xl bg-red-500/10 border-red-500/30">{err}</div>
      ) : !data ? (
        <div className="p-6 border rounded-xl bg-spotify-light-gray/10 border-white/5 text-text-gray">No data.</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard title="ECS (7d)" value={`${data.kpis.ecs_7d}%`} sub="Consistency score" />
            <KpiCard title="Active Days" value={data.kpis.active_days_7d} sub="Days with sessions" />
            <KpiCard title="Sessions (7d)" value={data.kpis.sessions_7d} sub="Total sessions" />
            <KpiCard title="Minutes (7d)" value={data.kpis.minutes_7d} sub="Total duration" />
            <KpiCard title="Top Emotion" value={data.kpis.dominant_emotion_7d} sub="Most frequent" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 mb-8 xl:grid-cols-3">
            <div className="p-5 border xl:col-span-2 bg-spotify-light-gray/10 border-white/5 rounded-2xl">
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Daily Emotion Counts</h2>
                <span className="text-sm text-text-gray">Stacked by label</span>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStacked}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {labels.map((lbl) => (
                      <Bar key={lbl} dataKey={lbl} stackId="a" />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 border bg-spotify-light-gray/10 border-white/5 rounded-2xl">
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Last 7 Days Split</h2>
                <span className="text-sm text-text-gray">Distribution</span>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie data={pie7d} dataKey="value" nameKey="name" outerRadius={110} label />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="p-5 mb-8 border bg-spotify-light-gray/10 border-white/5 rounded-2xl">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Weekly ECS Trend</h2>
              <span className="text-sm text-text-gray">Higher = more stable</span>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ecs" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent sessions */}
          <div className="p-5 border bg-spotify-light-gray/10 border-white/5 rounded-2xl">
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
              <span className="text-sm text-text-gray">Last 25</span>
            </div>

            {data.recent_sessions?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm border-b text-text-gray border-white/10">
                      <th className="py-3 pr-3">Date</th>
                      <th className="py-3 pr-3">Start</th>
                      <th className="py-3 pr-3">Minutes</th>
                      <th className="py-3 pr-3">Dominant</th>
                      <th className="py-3 pr-3">Avg Conf</th>
                      <th className="py-3 pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_sessions.map((s) => (
                      <tr key={s.id} className="border-b border-white/5 text-white/90">
                        <td className="py-3 pr-3">{s.day}</td>
                        <td className="py-3 pr-3">
                          {new Date(s.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 pr-3">{toMin(s.duration_seconds)}</td>
                        <td className="py-3 pr-3">{s.dominant_emotion}</td>
                        <td className="py-3 pr-3">{typeof s.avg_confidence === "number" ? s.avg_confidence.toFixed(2) : "—"}</td>
                        <td className="py-3 pr-3">
                          <button
                            onClick={() => onDelete(s.id)}
                            className="flex items-center gap-2 px-3 py-2 text-red-200 border rounded-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30"
                          >
                            <MdDelete /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-text-gray">No sessions yet. Run a face tracking session first.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
