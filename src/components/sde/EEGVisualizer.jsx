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

export default function EEGVisualizer({ eeg }) {
  if (!eeg || !eeg.signals || !eeg.channels) {
    return (
      <div className="bg-bg-tertiary p-4 rounded-xl text-text-secondary">
        EEG signal data not available
      </div>
    );
  }

  const labels = eeg.signals?.[0]?.map((_, i) => i) || [];

  const datasets = eeg.signals.map((signal, idx) => ({
    label: eeg.channels[idx] || `Channel ${idx + 1}`,
    data: signal,
    borderColor: COLORS[idx % COLORS.length],
    borderWidth: 1,
    pointRadius: 0,
    tension: 0.3,
  }));

  return (
    <div className="bg-bg-tertiary p-4 rounded-xl">
      <h3 className="font-semibold mb-2">EEG Signal Pattern</h3>
      <div className="h-[300px]">
        <Line
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { position: "right" } },
            scales: {
              x: { title: { display: true, text: "Time" } },
              y: { title: { display: true, text: "Amplitude (µV)" } },
            },
          }}
        />
      </div>
    </div>
  );
}
