import React from 'react';

const AnalysisResults = ({ data }) => {
  if (!data || !data.prediction) {
    return null;
  }

  const { prediction, audio_duration, analyzed_at } = data;

  // Helper function to get color based on level
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'text-spotify-green';
      case 'moderate':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-text-gray';
    }
  };

  // Helper function to get score as percentage
  const getScorePercentage = (score) => {
    return Math.round(score * 100);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with metadata */}
      <div className="border-b border-spotify-gray pb-4">
        <h3 className="text-2xl font-bold text-text-white mb-2">Analysis Results</h3>
        <div className="flex flex-wrap gap-4 text-sm text-text-gray">
          <span>📅 {formatDate(analyzed_at)}</span>
          <span>⏱️ Duration: {audio_duration?.toFixed(1)}s</span>
          <span>🎯 Confidence: {getScorePercentage(prediction.confidence)}%</span>
        </div>
      </div>

      {/* Depression Analysis */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-white font-semibold text-lg">🧠 Depression</span>
          <span className={`font-bold text-lg ${getLevelColor(prediction.depression_level)}`}>
            {prediction.depression_level} ({getScorePercentage(prediction.depression_score)}%)
          </span>
        </div>
        <div className="w-full bg-spotify-gray rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              prediction.depression_level?.toLowerCase() === 'low' ? 'bg-spotify-green' :
              prediction.depression_level?.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${getScorePercentage(prediction.depression_score)}%` }}
          />
        </div>
        {prediction.depression_probabilities && (
          <div className="text-xs text-text-gray mt-2 space-y-1">
            {Object.entries(prediction.depression_probabilities).map(([level, prob]) => (
              <div key={level} className="flex justify-between">
                <span className="capitalize">{level}:</span>
                <span>{getScorePercentage(prob)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anxiety Analysis */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-white font-semibold text-lg">😰 Anxiety</span>
          <span className={`font-bold text-lg ${getLevelColor(prediction.anxiety_level)}`}>
            {prediction.anxiety_level} ({getScorePercentage(prediction.anxiety_score)}%)
          </span>
        </div>
        <div className="w-full bg-spotify-gray rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              prediction.anxiety_level?.toLowerCase() === 'low' ? 'bg-spotify-green' :
              prediction.anxiety_level?.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${getScorePercentage(prediction.anxiety_score)}%` }}
          />
        </div>
      </div>

      {/* Stress Analysis */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-white font-semibold text-lg">😓 Stress</span>
          <span className={`font-bold text-lg ${getLevelColor(prediction.stress_level)}`}>
            {prediction.stress_level} ({getScorePercentage(prediction.stress_score)}%)
          </span>
        </div>
        <div className="w-full bg-spotify-gray rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              prediction.stress_level?.toLowerCase() === 'low' ? 'bg-spotify-green' :
              prediction.stress_level?.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${getScorePercentage(prediction.stress_score)}%` }}
          />
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-spotify-light-gray rounded-lg border border-spotify-gray">
        <h4 className="font-semibold text-text-white mb-2">📊 Interpretation Guide</h4>
        <ul className="text-sm text-text-gray space-y-1">
          <li><span className="text-spotify-green">●</span> Low (0-33%): Minimal indicators detected</li>
          <li><span className="text-yellow-500">●</span> Moderate (34-66%): Some indicators present</li>
          <li><span className="text-red-500">●</span> High (67-100%): Significant indicators detected</li>
        </ul>
        <p className="text-xs text-text-gray mt-3 italic">
          ⚠️ This is an AI-based screening tool and should not replace professional medical diagnosis.
          Please consult a mental health professional for proper evaluation.
        </p>
      </div>
    </div>
  );
};

export default AnalysisResults;