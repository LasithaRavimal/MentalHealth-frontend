import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import VoiceUploader from './VoiceUploader';
import AnalysisResults from './AnalysisResults';
import LoadingSpinner from './LoadingSpinner';
import { analyzeVoice } from '../../services/voiceAPI';

const VoiceAnalysisDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleProcessAudio = async (audioData) => {
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      // Convert Blob to File if needed
      let audioFile = audioData;
      if (audioData instanceof Blob && !(audioData instanceof File)) {
        audioFile = new File([audioData], 'recording.ogg', { type: 'audio/ogg' });
      }

      // Call the API
      const response = await analyzeVoice(audioFile);
      
      console.log(' Analysis successful:', response);
      setResults(response);
    } catch (error) {
      console.error(' Error processing audio:', error);
      setError(error.message || 'Failed to analyze audio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Input Section - Only show if not loading and no results */}
      {!loading && !results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Capture Audio Section */}
          <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">🎤</span>
              Record Audio
            </h2>
            <VoiceRecorder onStop={handleProcessAudio} disabled={loading} />
          </div>

          {/* Upload Audio Section */}
          <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">📁</span>
              Upload Audio
            </h2>
            <VoiceUploader onUpload={handleProcessAudio} disabled={loading} />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray min-h-[400px]">
          <LoadingSpinner message="Analyzing voice patterns and extracting features..." />
          <div className="text-center mt-6 text-text-gray text-sm">
            <p>🔬 Extracting MFCC features</p>
            <p>🧠 Running neural network analysis</p>
            <p>📊 Calculating predictions</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-spotify-dark-gray p-8 rounded-xl border border-red-500 shadow-2xl animate-fade-in">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-500 mb-4">Analysis Failed</h3>
            <p className="text-text-gray mb-6">{error}</p>
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 bg-spotify-green hover:bg-spotify-green-hover text-black font-bold rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {!loading && results && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray shadow-2xl">
            <AnalysisResults data={results} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleTryAgain}
              className="px-8 py-3 bg-spotify-green hover:bg-spotify-green-hover text-black font-bold rounded-full transition-colors"
            >
              Analyze Another Recording
            </button>
            <button
              onClick={() => window.location.href = '/voice/history'}
              className="px-8 py-3 bg-spotify-gray hover:bg-spotify-light-gray text-text-white font-bold rounded-full transition-colors"
            >
              View History
            </button>
          </div>
        </div>
      )}

      {/* Initial State - Empty */}
      {!loading && !results && !error && (
        <div className="flex items-center justify-center h-64 text-text-gray">
          <div className="text-center">
            <svg className="w-20 h-20 mx-auto mb-4 text-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-xl font-medium mb-2">Ready for Voice Analysis</p>
            <p className="text-sm text-text-gray">Record or upload audio to begin</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAnalysisDashboard;