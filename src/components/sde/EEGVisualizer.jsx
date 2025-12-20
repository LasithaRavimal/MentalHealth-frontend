import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

export default function EEGVisualizer({ eegData }) {
  if (!eegData?.length) return null;

  return (
    <div className="mt-4 bg-bg-tertiary rounded-xl p-4">
      <p className="text-xs text-text-secondary mb-2">
        EEG Signal Preview
      </p>
      <Line
        data={{
          labels: eegData.map((_, i) => i),
          datasets: [
            {
              data: eegData,
              borderColor: "#1DB954",
              pointRadius: 0,
              tension: 0.3,
            },
          ],
        }}
        options={{ plugins: { legend: { display: false } } }}
      />
    </div>
  );
}
