import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAnalysisHistory,
  getVoiceTrendAnalysis,
  deleteAnalysis,
} from "../services/voiceAPI";
import LoadingSpinner from "../components/voice/LoadingSpinner";

const VoiceHistoryPage = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const [weeks, setWeeks] = useState(4);
  const [trendData, setTrendData] = useState(null);
  const [isTrendLoading, setIsTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    fetchTrendData();
  }, [weeks]);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getAnalysisHistory(50, 0);
      const items = Array.isArray(data?.analyses)
        ? data.analyses
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];
      setHistory(items);
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistoryError("Failed to load history. " + (error.message || ""));
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const fetchTrendData = async () => {
    setIsTrendLoading(true);
    setTrendError(null);
    try {
      const data = await getVoiceTrendAnalysis(weeks);
      setTrendData(data || {});
    } catch (error) {
      console.error("Error fetching trend data:", error);
      setTrendError("Failed to load trend analysis. " + (error.message || ""));
    } finally {
      setIsTrendLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        await deleteAnalysis(id);
        fetchHistory();
      } catch (error) {
        alert("Failed to delete analysis: " + (error.message || ""));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizedTrend = trendData
    ? {
        summaryMessage: trendData.trend_summary ?? null,
        totalSessions: trendData.total_analyses ?? 0,
        avgDepressionLevel: trendData.average_predictions?.depression_level ?? null,
        avgStressLevel: trendData.average_predictions?.stress_level ?? null,
      }
    : null;

  // Map level strings to numeric values for charting
  const depressionLevelToNum = (level) => {
    switch (level?.toLowerCase()) {
      case 'depression': return 1;
      case 'normal': default: return 0;
    }
  };

  const stressLevelToNum = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 2;
      case 'moderate': return 1;
      case 'low': default: return 0;
    }
  };

  const depressionNumToLabel = (num) => {
    if (num >= 0.5) return 'Depression';
    return 'No Depression';
  };

  const stressNumToLabel = (num) => {
    if (num >= 1.5) return 'High';
    if (num >= 0.5) return 'Moderate';
    return 'Low';
  };

  const buildChartFromHistory = (historyItems, numWeeks) => {
    if (!historyItems || historyItems.length === 0) return [];
    const now = new Date();
    const slots = [];
    for (let i = numWeeks - 1; i >= 0; i--) {
      const slotEnd = new Date(now);
      slotEnd.setDate(now.getDate() - i * 7);
      const slotStart = new Date(slotEnd);
      slotStart.setDate(slotEnd.getDate() - 7);
      const label = slotStart.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      slots.push({ start: slotStart, end: slotEnd, label });
    }
    return slots
      .map(({ start, end, label }) => {
        const bucket = historyItems.filter((item) => {
          const d = new Date(
            item.analyzed_at ?? item.created_at ?? item.timestamp,
          );
          return d >= start && d < end;
        });
        if (bucket.length === 0) return null;
        const avgLevel = (levelKey, mapFn) =>
          bucket.reduce((s, i) => s + mapFn(i.prediction?.[levelKey]), 0) /
          bucket.length;
        return {
          date: label,
          depression: avgLevel("depression_level", depressionLevelToNum),
          stress: avgLevel("stress_level", stressLevelToNum),
        };
      })
      .filter(Boolean);
  };

  const chartData = buildChartFromHistory(history, weeks);

  const hasDepression = chartData.some((d) => d.depression > 0);
  const hasStress = chartData.some((d) => d.stress > 0);

  const normalizeHistoryItem = (item) => {
    const predictionObj =
      typeof item?.prediction === "object" ? item.prediction : {};
    const overallPrediction =
      typeof item?.prediction === "string"
        ? item.prediction
        : (predictionObj?.overall_prediction ??
          predictionObj?.label ??
          item?.overall_prediction ??
          "Analyzed");

    return {
      id: item?.id ?? item?._id ?? item?.analysis_id,
      createdAt:
        item?.created_at ??
        item?.createdAt ??
        item?.analyzed_at ??
        item?.timestamp,
      prediction: overallPrediction,
      confidence:
        item?.confidence ??
        predictionObj?.confidence ??
        predictionObj?.overall_confidence ??
        null,
      emotions: item?.emotions ?? predictionObj?.emotions ?? null,
      depressionLevel:
        predictionObj?.depression_level ?? item?.depression_level,
      stressLevel: predictionObj?.stress_level ?? item?.stress_level,
    };
  };

  return (
    <main className="min-h-screen bg-spotify-black text-white p-6 md:p-12 relative pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/voice")}
              className="text-text-gray hover:text-white mb-2 flex items-center text-sm font-medium transition-colors"
            >
              <span className="mr-1">&larr;</span> Back to Voice Analysis
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight text-spotify-green">
              Voice Analysis History &amp; Trends
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── History Panel ── */}
          <div className="col-span-1 border border-spotify-gray rounded-xl bg-spotify-dark-gray overflow-hidden shadow-2xl flex flex-col h-[700px]">
            <div className="p-6 border-b border-spotify-gray bg-zinc-900">
              <h2 className="text-xl font-bold">History</h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {isHistoryLoading ? (
                <div className="flex justify-center mt-10">
                  <LoadingSpinner message="Loading history..." />
                </div>
              ) : historyError ? (
                <div className="text-red-400 text-center mt-10 px-4">
                  <p className="font-semibold mb-1">⚠️ Error</p>
                  <p className="text-sm">{historyError}</p>
                  <button
                    onClick={fetchHistory}
                    className="mt-4 px-4 py-1.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-hover transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : history.length === 0 ? (
                <div className="text-text-gray text-center mt-10 leading-relaxed">
                  No previous voice analysis records found.
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => {
                    const normalized = normalizeHistoryItem(item);
                    const hasEmotionObject =
                      normalized.emotions &&
                      typeof normalized.emotions === "object" &&
                      !Array.isArray(normalized.emotions);
                    const topEmotionEntry =
                      hasEmotionObject &&
                      Object.keys(normalized.emotions).length > 0
                        ? Object.entries(normalized.emotions).sort(
                            (a, b) => b[1] - a[1],
                          )[0]
                        : null;

                    return (
                      <div
                        key={normalized.id || `history-item-${index}`}
                        className="p-4 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-spotify-green transition-colors relative group shadow-sm"
                      >
                        <button
                          onClick={() => handleDelete(normalized.id)}
                          className="absolute top-2 right-2 text-text-gray hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold px-1"
                          title="Delete"
                        >
                          ✕
                        </button>

                        <div className="text-sm text-text-gray mb-1">
                          {formatDate(normalized.createdAt)}
                        </div>

                        <div className="font-bold text-lg mb-2 flex items-center justify-between pr-6">
                          <span
                            className={
                              normalized.prediction === "Healthy"
                                ? "text-spotify-green"
                                : "text-blue-400"
                            }
                          >
                            {normalized.prediction}
                          </span>
                        </div>

                        {topEmotionEntry && (
                          <div className="mt-2 pt-2 border-t border-zinc-700/50">
                            <span className="text-xs text-text-gray uppercase tracking-wider">
                              Top Emotion:{" "}
                            </span>
                            <span className="text-sm capitalize">
                              {topEmotionEntry[0]}
                              <span className="text-text-gray text-xs ml-1">
                                ({(topEmotionEntry[1] * 100).toFixed(0)}%)
                              </span>
                            </span>
                          </div>
                        )}

                        {(normalized.depressionLevel ||
                          normalized.stressLevel) && (
                          <div className="mt-2 pt-2 border-t border-zinc-700/50 text-sm text-zinc-300 space-y-0.5">
                            {normalized.depressionLevel && (
                              <div>
                                Depression:{" "}
                                <span className="capitalize">
                                  {normalized.depressionLevel?.toLowerCase() === 'normal' ? 'No Depression' : normalized.depressionLevel}
                                </span>
                              </div>
                            )}
                            {normalized.stressLevel && (
                              <div>
                                Stress:{" "}
                                <span className="capitalize">
                                  {normalized.stressLevel}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Trend Analysis Panel ── */}
          <div className="col-span-1 lg:col-span-2 space-y-6 flex flex-col h-full">
            <div className="border border-spotify-gray rounded-xl bg-spotify-dark-gray p-6 shadow-2xl flex-1 flex flex-col min-h-[700px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-spotify-gray border-opacity-50">
                <h2 className="text-2xl font-bold flex items-center mb-4 sm:mb-0">
                  Trend Analysis
                </h2>
                <div className="flex items-center space-x-2 bg-zinc-900 rounded-lg p-1 border border-zinc-700">
                  {[1, 2, 3, 4].map((w) => (
                    <button
                      key={w}
                      onClick={() => setWeeks(w)}
                      className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                        weeks === w
                          ? "bg-spotify-green text-black shadow-md"
                          : "text-text-gray hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {w}W
                    </button>
                  ))}
                </div>
              </div>

              {isTrendLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <LoadingSpinner
                    message={`Analyzing ${weeks} week trend...`}
                  />
                </div>
              ) : trendError ? (
                <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-3">
                  <p>⚠️ {trendError}</p>
                  <button
                    onClick={fetchTrendData}
                    className="px-4 py-1.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-hover transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : !chartData || chartData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-text-gray bg-zinc-800/20 rounded-lg border border-dashed border-zinc-700/50 p-8">
                  <p className="font-medium text-lg text-white">
                    Not enough data available.
                  </p>
                  <p className="mt-2 text-center max-w-sm text-sm">
                    Record or upload more voice samples within the selected
                    timeframe to generate trend insights.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 flex flex-col shadow-inner">
                      <div className="text-xs text-text-gray uppercase tracking-wider mb-1">
                        Sessions
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {normalizedTrend?.totalSessions ?? chartData.length}
                      </div>
                      <p className="text-xs mt-1 text-zinc-400">
                        in {weeks} week{weeks > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 flex flex-col shadow-inner">
                      <div className="text-xs text-text-gray uppercase tracking-wider mb-1">
                        Depression Level
                      </div>
                      <div className={`text-2xl font-bold capitalize ${
                        normalizedTrend?.avgDepressionLevel?.toLowerCase() === 'normal' ? 'text-spotify-green' : 'text-red-400'
                      }`}>
                        {normalizedTrend?.avgDepressionLevel?.toLowerCase() === 'normal' ? 'No Depression' : (normalizedTrend?.avgDepressionLevel ?? "--")}
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 flex flex-col shadow-inner">
                      <div className="text-xs text-text-gray uppercase tracking-wider mb-1">
                        Stress Level
                      </div>
                      <div className={`text-2xl font-bold capitalize ${
                        normalizedTrend?.avgStressLevel?.toLowerCase() === 'low' ? 'text-spotify-green' :
                        normalizedTrend?.avgStressLevel?.toLowerCase() === 'moderate' ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {normalizedTrend?.avgStressLevel ?? "--"}
                      </div>
                    </div>
                  </div>
                  {normalizedTrend?.summaryMessage && (
                    <div className="text-sm text-zinc-400 px-1">
                      📋 {normalizedTrend.summaryMessage}
                    </div>
                  )}

                  {/* Chart */}
                  <div className="flex-1 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 w-full min-h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#333"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#888"
                          tick={{ fill: "#888", fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis
                          yAxisId="depression"
                          orientation="left"
                          stroke="#f87171"
                          tick={{ fill: "#f87171", fontSize: 11 }}
                          tickFormatter={(val) => val >= 0.5 ? 'Depression' : 'Normal'}
                          domain={[0, 1]}
                          ticks={[0, 1]}
                          width={90}
                          label={{ value: 'Depression', angle: -90, position: 'insideLeft', fill: '#f87171', fontSize: 12, offset: -5 }}
                        />
                        <YAxis
                          yAxisId="stress"
                          orientation="right"
                          stroke="#fb923c"
                          tick={{ fill: "#fb923c", fontSize: 11 }}
                          tickFormatter={(val) => {
                            if (val >= 1.5) return 'High';
                            if (val >= 0.5) return 'Moderate';
                            return 'Low';
                          }}
                          domain={[0, 2]}
                          ticks={[0, 1, 2]}
                          width={80}
                          label={{ value: 'Stress', angle: 90, position: 'insideRight', fill: '#fb923c', fontSize: 12, offset: -5 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#27272a",
                            color: "#fff",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
                          formatter={(value, name) => {
                            if (name === 'Depression') return [depressionNumToLabel(value), name];
                            if (name === 'Stress') return [stressNumToLabel(value), name];
                            return [value, name];
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />

                        {/* Depression Line */}
                        <Line
                          yAxisId="depression"
                          type="stepAfter"
                          dataKey="depression"
                          stroke="#f87171"
                          strokeWidth={3}
                          dot={{ r: 5, fill: "#f87171", strokeWidth: 2, stroke: "#18181b" }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name="Depression"
                          connectNulls
                        />
                        {/* Stress Line */}
                        <Line
                          yAxisId="stress"
                          type="stepAfter"
                          dataKey="stress"
                          stroke="#fb923c"
                          strokeWidth={3}
                          dot={{ r: 5, fill: "#fb923c", strokeWidth: 2, stroke: "#18181b" }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name="Stress"
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <button
                    onClick={() => navigate("/mentalhealthresources")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-spotify-dark-gray hover:bg-spotify-light-gray border border-spotify-gray hover:border-spotify-green text-white text-sm font-semibold rounded-full transition-all"
                  >
                    <span>💚</span> Mental Health Resources
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VoiceHistoryPage;
