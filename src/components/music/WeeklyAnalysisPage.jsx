import { useEffect, useState } from "react";
import Sidebar from "./PlayerSidebar";
import apiClient from "../../api/apiClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const WeeklyAnalysisPage = () => {
  const [monthlyData, setMonthlyData] = useState({});

  useEffect(() => {
    loadSessions();
  }, []);

  // Convert numeric average to level
  const convertLevel = (v) => {
    if (v >= 0.67) return "High";
    if (v >= 0.34) return "Moderate";
    return "Low";
  };

  const levelToNumber = (level) => {
    if (level === "High") return 3;
    if (level === "Moderate") return 2;
    return 1;
  };

  const loadSessions = async () => {
    try {
      const response = await apiClient.get("/sessions");
      const sessions = response.data || [];

      const groupedByMonth = {};

      // -----------------------
      // 1️⃣ Group sessions by month
      // -----------------------
      sessions.forEach((session) => {
        const date = new Date(session.started_at);

        const monthKey = date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = [];
        }

        groupedByMonth[monthKey].push(session);
      });

      const finalResult = {};

      // -----------------------
      // 2️⃣ Weekly Weighted Calculation
      // -----------------------
      Object.keys(groupedByMonth).forEach((month) => {
        const sessionsInMonth = groupedByMonth[month];
        const weeks = {};

        sessionsInMonth.forEach((session) => {
          const date = new Date(session.started_at);
          const weekNumber = Math.ceil(date.getDate() / 7);

          if (!weeks[weekNumber]) {
            weeks[weekNumber] = {
              stressTotal: 0,
              depressionTotal: 0,
              count: 0,
            };
          }

          if (
            session.prediction?.stress_probs &&
            session.prediction?.depression_probs
          ) {
            // Scientific weighted logic
            weeks[weekNumber].stressTotal +=
              session.prediction.stress_probs.high || 0;

            weeks[weekNumber].depressionTotal +=
              session.prediction.depression_probs.high || 0;

            weeks[weekNumber].count++;
          }
        });

        // -----------------------
        // 3️⃣ Calculate Weekly Average
        // -----------------------
        finalResult[month] = Object.keys(weeks).map((week) => {
          const data = weeks[week];

          const avgStress =
            data.count > 0 ? data.stressTotal / data.count : 0;

          const avgDepression =
            data.count > 0 ? data.depressionTotal / data.count : 0;

          return {
            week,
            sessions: data.count,
            stressScore: avgStress.toFixed(2),
            depressionScore: avgDepression.toFixed(2),
            stress: convertLevel(avgStress),
            depression: convertLevel(avgDepression),
          };
        });
      });

      setMonthlyData(finalResult);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-spotify-black">
      <Sidebar />

      <div className="flex-1 p-10 text-white overflow-y-auto">
        <h1 className="text-4xl font-bold mb-3">
          Weekly Mental Health Trends
        </h1>

        <p className="text-text-gray mb-10">
          Scientific weighted probability based emotional aggregation
        </p>

        {Object.keys(monthlyData).map((month) => (
          <div key={month} className="mb-20">

            <h2 className="text-2xl font-semibold mb-6">{month}</h2>

            {/* ================= TABLE ================= */}
            <div className="bg-spotify-light-gray rounded-2xl shadow-xl overflow-hidden mb-8">
              <table className="w-full text-left">
                <thead className="bg-spotify-gray text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-5">Week</th>
                    <th className="p-5">Sessions</th>
                    <th className="p-5">Stress</th>
                    <th className="p-5">Depression</th>
                  </tr>
                </thead>

                <tbody>
                  {monthlyData[month].map((weekData) => (
                    <tr
                      key={weekData.week}
                      className="border-t border-spotify-dark-gray hover:bg-spotify-dark-gray transition"
                    >
                      <td className="p-5 font-medium">
                        Week {weekData.week}
                      </td>

                      <td className="p-5">
                        {weekData.sessions}
                      </td>

                      <td className="p-5 font-semibold">
                        {weekData.stress} ({weekData.stressScore})
                      </td>

                      <td className="p-5 font-semibold">
                        {weekData.depression} ({weekData.depressionScore})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ================= CHART ================= */}
            <div className="bg-spotify-light-gray rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">
                Monthly Trend Overview
              </h3>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={monthlyData[month].map((w) => ({
                    week: `W${w.week}`,
                    stress: levelToNumber(w.stress),
                    depression: levelToNumber(w.depression),
                  }))}
                >
                  <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                  <XAxis dataKey="week" stroke="#aaa" />
                  <YAxis
                    domain={[1, 3]}
                    ticks={[1, 2, 3]}
                    stroke="#aaa"
                    tickFormatter={(v) =>
                      v === 3 ? "High" : v === 2 ? "Moderate" : "Low"
                    }
                  />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="#ef4444"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="depression"
                    stroke="#22c55e"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyAnalysisPage;
