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
  "#e6194b","#3cb44b","#ffe119","#4363d8","#f58231","#911eb4","#46f0f0","#f032e6","#bcf60c","#fabebe",
  "#008080","#e6beff","#9a6324","#fffac8","#800000","#aaffc3","#808000","#ffd8b1","#000075","#808080",
  "#ff6f61","#6b5b95","#88b04b","#f7cac9","#92a8d1","#955251","#b565a7","#009b77","#dd4124","#45b8ac",
  "#e94b3c","#6f9fd8","#c3447a","#00a86b","#ffb347","#b19cd9","#77dd77","#ff6961","#aec6cf","#cfcfc4",
  "#836953","#ffb6c1","#20b2aa","#9370db","#3cb371","#ff7f50","#6495ed","#dc143c","#00ced1","#9400d3",
  "#ff1493","#00bfff","#696969","#1e90ff","#b22222","#228b22","#ff8c00","#9932cc","#8fbc8f","#483d8b",
  "#2f4f4f","#00fa9a","#7b68ee","#ff4500","#2e8b57","#daa520","#adff2f","#ff6347","#4682b4","#d2691e"
];

const CHANNELS = [
  'Fp1', 'AF7', 'AF3', 'F1', 'F3', 'F5', 'F7', 'FT7',
  'FC5', 'FC3', 'FC1', 'C1', 'C3', 'C5', 'T7', 'TP7',
  'CP5', 'CP3', 'CP1', 'P1', 'P3', 'P5', 'P7', 'P9',
  'PO7', 'PO3', 'O1', 'Iz', 'Oz', 'POz', 'Pz', 'CPz',
  'Fpz', 'Fp2', 'AF8', 'AF4', 'AFz', 'Fz', 'F2', 'F4',
  'F6', 'F8', 'FT8', 'FC6', 'FC4', 'FC2', 'FCz', 'Cz',
  'C2', 'C4', 'C6', 'T8', 'TP8', 'CP6', 'CP4', 'CP2',
  'P2', 'P4', 'P6', 'P8', 'P10', 'PO8', 'PO4', 'O2',
  'VEOa', 'VEOb', 'HEOL', 'HEOR', 'Nose', 'TP10'
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
