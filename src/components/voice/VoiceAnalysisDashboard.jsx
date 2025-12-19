import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import AnalysisResults from './AnalysisResults';
import { analyzeVoiceData } from '../../api/voiceAnalysisService';

const VoiceAnalysisDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleProcessAudio = async (audioBlob) => {
    setLoading(true);
    const response = await analyzeVoiceData(audioBlob);
    setResults(response);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Capture Audio</h2>
        <VoiceRecorder onStop={handleProcessAudio} disabled={loading} />
        <p className="mt-4 text-text-gray text-xs text-center italic">
          Your audio is processed locally for research purposes.
        </p>
      </div>

      <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-spotify-green animate-pulse">Extracting vocal features...</p>
          </div>
        ) : results ? (
          <AnalysisResults data={results} />
        ) : (
          <div className="flex items-center justify-center h-full text-text-gray">
            Record voice to begin analysis
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAnalysisDashboard;