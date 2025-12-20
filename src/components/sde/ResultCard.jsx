export default function ResultCard({ result }) {
  if (!result) return null;

  const confidence =
    typeof result.confidence_score === "number"
      ? (result.confidence_score * 100).toFixed(2)
      : "0.00";

  const isRisk =
    result.supportive_result?.toLowerCase().includes("schizophrenia");

  return (
    <div className="mt-4 bg-card-bg border border-border-light rounded-xl p-4">
      <p className={`font-semibold ${isRisk ? "text-red-400" : "text-spotify-green"}`}>
        {result.supportive_result}
      </p>

      <p className="text-xs text-text-secondary mt-2">
        Confidence: <span className="text-text-primary">{confidence}%</span>
      </p>

      <p className="text-xs text-text-secondary">
        Trials analyzed: {result.trials_analyzed}
      </p>
    </div>
  );
}
