import { useState } from "react";
import ResultCard from "./ResultCard";
import EEGVisualizer from "./EEGVisualizer";

export default function UploadCard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/sde/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Prediction failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Prediction failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Upload bar */}
      <div className="bg-card-bg p-6 rounded-xl shadow-xl flex gap-4 items-center mb-8">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-text-secondary"
        />

        <button
          onClick={handlePredict}
          disabled={loading}
          className="bg-spotify-green hover:bg-spotify-green-hover text-black px-6 py-2 rounded font-semibold"
        >
          {loading ? "Analyzing..." : "Upload & Predict"}
        </button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: EEG Chart */}
        <div className="lg:col-span-2 bg-card-bg rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">
            EEG Signal Pattern
          </h2>

          <EEGVisualizer eeg={result?.eeg_preview} />
        </div>

        {/* RIGHT: Result */}
        <div className="lg:col-span-1">
          <ResultCard result={result} />
        </div>
      </div>
    </>
  );
}
