import React from 'react';
import { ANALYSIS_CATEGORIES, GET_LEVEL_TEXT } from '../../constants/voiceAnalysis';

const AnalysisResults = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-xl font-bold border-b border-spotify-gray pb-2">Analysis Results</h3>
      {Object.values(ANALYSIS_CATEGORIES).map((cat) => {
        const score = data.results[cat.key];
        const level = GET_LEVEL_TEXT(score);
        return (
          <div key={cat.key} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-white font-medium">{cat.label}</span>
              <span className={level.class}>{level.text} ({score}%)</span>
            </div>
            <div className="w-full bg-spotify-gray rounded-full h-2">
              <div 
                className="bg-spotify-green h-2 rounded-full transition-all duration-1000"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisResults;