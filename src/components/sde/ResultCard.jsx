export default function ResultCard({ result }) {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="bg-bg-tertiary border border-spotify-green text-spotify-green p-8 rounded-2xl shadow-elevated">
        {result.error}
      </div>
    );
  }

  const confidence = result.confidence_score ?? 0;

  return (
    <div
      className="
        bg-bg-tertiary
        border border-spotify-green
        p-10
        rounded-3xl
        shadow-elevated
        animate-fade-in
      "
    >
      <h3 className="text-3xl font-semibold text-text-primary mb-6">
        EEG Assessment Result
      </h3>

      {/* Result Text */}
      <p className="text-xl font-bold text-spotify-green mb-6">
        {result.supportive_result}
      </p>

      {/* Confidence */}
      <div className="mt-6">
        <p className="text-text-secondary text-sm mb-1">
          Confidence Score
        </p>

        <p className="text-4xl font-bold text-text-primary mb-3">
          {(confidence * 100).toFixed(2)}%
        </p>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-border-light rounded-full overflow-hidden">
          <div
            className="h-full bg-spotify-green transition-all duration-700"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="mt-6 text-sm text-text-tertiary">
        Trials analyzed: {result.trials_analyzed}
      </div>
    </div>
  );
}
