import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';
import VoiceUploader from './VoiceUploader';
import AnalysisResults from './AnalysisResults';
import LoadingSpinner from './LoadingSpinner';

const VoiceAnalysisDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleProcessAudio = async (audioData) => {
    setLoading(true);
    setResults(null);

    try {
      // Simulate API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock results - replace with actual API response
      const mockResults = {
        transcript: "This is a sample transcription of the audio.",
        sentiment: "positive",
        confidence: 0.95,
        keywords: ["sample", "audio", "transcription"],
        duration: "00:15"
      };
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error processing audio:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spotify-black text-text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Voice Analysis Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Capture Audio Section */}
          <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Capture Audio</h2>
            <VoiceRecorder onStop={handleProcessAudio} disabled={loading} />
          </div>

          {/* Upload Audio Section */}
          <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Upload Audio</h2>
            <VoiceUploader onUpload={handleProcessAudio} disabled={loading} />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray min-h-[300px]">
            <LoadingSpinner message="Extracting vocal features..." />
          </div>
        )}

        {/* Results Section */}
        {!loading && results && (
          <div className="bg-spotify-dark-gray p-8 rounded-xl border border-spotify-gray shadow-2xl animate-fade-in">
            <AnalysisResults data={results} />
          </div>
        )}

        {/* Initial State */}
        {!loading && !results && (
          <div className="flex items-center justify-center h-full text-text-gray">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-xl font-medium">Record voice to begin analysis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAnalysisDashboard;