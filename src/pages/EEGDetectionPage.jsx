import EEGUploadCard from "../components/EEGUploadCard";

export default function EEGDetectionPage() {
  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <h1 className="text-2xl font-semibold">
        EEG-Based Schizophrenia Assessment
      </h1>
      <p className="text-sm text-text-secondary mt-2">
        AI-powered schizophrenia risk assessment using EEG signal analysis
      </p>

      <div className="mt-6">
        <EEGUploadCard />
      </div>
    </div>
  );
}
