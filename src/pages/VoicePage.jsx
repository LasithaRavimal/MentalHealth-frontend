"use client";
import VoiceAnalysisDashboard from '../components/voice/VoiceAnalysisDashboard';

export default function VoicePage() {
  return (
    <main className="min-h-screen bg-spotify-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Simplified Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-spotify-green mb-4">
            Voice-Based Mental Health Prediction
          </h1>
          
          {/* Instructions Section */}
          <div className="bg-spotify-dark-gray border-l-4 border-spotify-green p-6 rounded-r-lg mb-8 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center">
              <span className="mr-2">💡</span> How to provide a clear sample:
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-text-gray">
              <li className="flex items-start">
                <span className="text-spotify-green mr-2">•</span>
                Find a quiet environment with minimal background noise.
              </li>
              <li className="flex items-start">
                <span className="text-spotify-green mr-2">•</span>
                Speak naturally for at least 15-30 seconds.
              </li>
              <li className="flex items-start">
                <span className="text-spotify-green mr-2">•</span>
                Keep the microphone about 6 inches (15cm) from your mouth.
              </li>
              <li className="flex items-start">
                <span className="text-spotify-green mr-2">•</span>
                Avoid using low-quality Bluetooth headsets if possible.
              </li>
            </ul>
          </div>
        </header>

        {/* Dashboard Component */}
        <VoiceAnalysisDashboard />
      </div>
    </main>
  );
}