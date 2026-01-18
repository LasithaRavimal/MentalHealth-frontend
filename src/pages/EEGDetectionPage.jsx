import EEGUploadCard from "../components/sde/EEGUploadCard";
import EEGVisualizer from "../components/sde/EEGVisualizer";
import ResultCard from "../components/sde/ResultCard";
export default function EEGDetectionPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">
          EEG-Based Schizophrenia Assessment
        </h1>

        <p className="text-text-secondary mb-6">
          AI-powered schizophrenia risk assessment using EEG signal analysis
        </p>

        {/* Everything handled here */}
        <EEGUploadCard />
      </main>
    </div>
  );
}
