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
      case 'normal':
        return 'text-spotify-green';
      case 'moderate':
        return 'text-yellow-500';
      case 'high':
      case 'depression':
        return 'text-red-500';
      default:
        return 'text-text-gray';
    }
  };

  // Helper function to get background color for level badge
  const getLevelBgColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
      case 'normal':
        return 'bg-spotify-green/20 border-spotify-green/40';
      case 'moderate':
        return 'bg-yellow-500/20 border-yellow-500/40';
      case 'high':
      case 'depression':
        return 'bg-red-500/20 border-red-500/40';
      default:
        return 'bg-zinc-700/20 border-zinc-700/40';
    }
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
        </div>
      </div>

      {/* Depression Analysis */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
        <span className="text-text-white font-semibold text-lg">🧠 Depression</span>
        <span className={`font-bold text-lg px-4 py-1.5 rounded-full border ${getLevelColor(prediction.depression_level)} ${getLevelBgColor(prediction.depression_level)}`}>
          {prediction.depression_level?.toLowerCase() === 'normal' ? 'No Depression' : prediction.depression_level}
        </span>
      </div>

      {/* Stress Analysis */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
        <span className="text-text-white font-semibold text-lg">⚡ Stress</span>
        <span className={`font-bold text-lg px-4 py-1.5 rounded-full border ${getLevelColor(prediction.stress_level)} ${getLevelBgColor(prediction.stress_level)}`}>
          {prediction.stress_level}
        </span>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-spotify-light-gray rounded-lg border border-spotify-gray">
        <h4 className="font-semibold text-text-white mb-2">📊 Understanding Your Results</h4>
        <ul className="text-sm text-text-gray space-y-2">
          <li>
            <span className="text-spotify-green font-bold">● Levels:</span> 
            Results are categorized into levels based on vocal biomarker patterns detected during this recording.
          </li>
          <li>
            <span className="text-yellow-400 font-bold">● Focus on Trends:</span> 
            Single results are snapshots. Monitor how these levels change over time in your History tab to identify personal patterns.
          </li>
        </ul>
        <div className="mt-4 pt-3 border-t border-spotify-gray">
          <p className="text-xs text-text-gray italic">
            ⚠️ This screening tool analyzes vocal biomarkers and should not be used as a medical diagnosis.
            Always consult a qualified mental health professional for clinical evaluation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;