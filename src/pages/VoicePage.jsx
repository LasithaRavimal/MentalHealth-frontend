"use client";
import VoiceAnalysisDashboard from '../components/voice/VoiceAnalysisDashboard';

export default function VoicePage() {
  return (
    <main className="min-h-screen bg-spotify-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-spotify-green mb-2">
            Research Portal: Voice Biomarkers
          </h1>
          <p className="text-text-gray text-lg">AI-powered mental health assessment</p>
        </header>
        <VoiceAnalysisDashboard />
      </div>
    </main>
  );
}