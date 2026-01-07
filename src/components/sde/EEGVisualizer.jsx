import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState } from "react";
import EEGScalpLayout from "./EEGScalpLayout";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

const COLORS = [
  "#ff6384", "#36a2eb", "#ffce56",
  "#4bc0c0", "#9966ff", "#ff9f40",
  "#2ecc71", "#e74c3c", "#3498db"
];

const CHANNELS = [
  "Fp1", "Fp2", "F3", "F4",
  "C3", "C4", "P3", "P4", "O1"
];

export default function EEGVisualizer({ eeg }) {
  const [activeChannel, setActiveChannel] = useState("P3"); // default

  if (!eeg || !Array.isArray(eeg.signals)) return null;

  const labels = eeg.signals[0].map((_, i) => i);

  const datasets = eeg.signals.map((signal, idx) => ({
    label: CHANNELS[idx],
    data: signal,
    hidden: CHANNELS[idx] !== activeChannel, // 🔑 only show selected
    borderColor: COLORS[idx % COLORS.length],
    borderWidth: 1,
    pointRadius: 0,
    tension: 0.3,
  }));

  return (
    <div className="bg-bg-tertiary p-4 rounded-xl">
      <h3 className="font-semibold mb-3">EEG Signal Pattern</h3>

      {/* Channel selector */}
      <select
        value={activeChannel}
        onChange={(e) => setActiveChannel(e.target.value)}
        className="mb-4 bg-black text-white p-2 rounded"
      >
        {CHANNELS.map((ch) => (
          <option key={ch} value={ch}>{ch}</option>
        ))}
      </select>

      <div className="h-[280px] mb-6">
        <Line
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { title: { display: true, text: "Time" } },
              y: { title: { display: true, text: "Amplitude (µV)" } },
            },
          }}
        />
      </div>

      {/* 🔗 Pass selected channel */}
      <EEGScalpLayout activeChannels={[activeChannel]} />
    </div>
  );
}
