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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const WeeklyAnalysisPage = () => {

  const [monthlyData, setMonthlyData] = useState({});

  useEffect(() => {
    loadSessions();
  }, []);

  // -------------------------
  // Convert score to label
  // -------------------------
  const convertLevel = (v) => {
    if (v >= 0.67) return "High";
    if (v >= 0.34) return "Moderate";
    return "Low";
  };

  // -------------------------
  // Chart numeric conversion
  // -------------------------
  const levelToNumber = (level) => {
    if (level === "High") return 3;
    if (level === "Moderate") return 2;
    return 1;
  };

  // -------------------------
  // Load session history
  // -------------------------
  const loadSessions = async () => {

    try {

      const response = await apiClient.get("/sessions");
      const sessions = response.data || [];

      const groupedByMonth = {};

      sessions.forEach((session) => {

        if (!session.started_at) return;

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

      Object.keys(groupedByMonth).forEach((month) => {

        const sessionsInMonth = groupedByMonth[month];

        const weeks = {};

        sessionsInMonth.forEach((session) => {

          if (!session.prediction) return;

          const date = new Date(session.started_at);
          const weekNumber = Math.ceil(date.getDate() / 7);

          if (!weeks[weekNumber]) {
            weeks[weekNumber] = {
              stressTotal: 0,
              depressionTotal: 0,
              count: 0,
            };
          }

          const stress = session.prediction?.stress_probs;
          const depression = session.prediction?.depression_probs;

          if (!stress || !depression) return;

          const stressScore =
            (stress.high || 0) +
            (stress.moderate || 0) * 0.5;

          const depressionScore =
            (depression.high || 0) +
            (depression.moderate || 0) * 0.5;

          weeks[weekNumber].stressTotal += stressScore;
          weeks[weekNumber].depressionTotal += depressionScore;
          weeks[weekNumber].count++;

        });

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
      console.error("Weekly analysis error:", error);
    }
  };

  // -------------------------
  // Generate PDF Report
  // -------------------------
  const generateReport = () => {

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("M_Track Weekly Mental Health Report-Music", 14, 20);

    let startY = 30;

    Object.keys(monthlyData).forEach((month) => {

      doc.setFontSize(14);
      doc.text(month, 14, startY);

      const rows = monthlyData[month].map((w) => [
        `Week ${w.week}`,
        w.sessions,
        `${w.stress} (${w.stressScore})`,
        `${w.depression} (${w.depressionScore})`
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [["Week", "Sessions", "Stress", "Depression"]],
        body: rows
      });

      startY = doc.lastAutoTable.finalY + 15;

    });

    doc.save("MTrack_Weekly_Report.pdf");

  };

  return (
    <div className="flex h-screen bg-spotify-black">

      <Sidebar />

      <div className="flex-1 p-10 text-white overflow-y-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-4xl font-bold">
            Weekly Mental Health Trends
          </h1>

          <button
            onClick={generateReport}
            className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-700"
          >
            Download Report
          </button>

        </div>

        <p className="text-text-gray mb-10">
          Scientific weighted probability based emotional aggregation
        </p>

        {Object.keys(monthlyData).map((month) => (

          <div key={month} className="mb-20">

            <h2 className="text-2xl font-semibold mb-6">
              {month}
            </h2>

            {/* TABLE */}

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

            {/* CHART */}

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
                      v === 3 ? "High"
                        : v === 2 ? "Moderate"
                        : "Low"
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