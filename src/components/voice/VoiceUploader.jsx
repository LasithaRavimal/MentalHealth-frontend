export default function VoiceUploader({ onComplete, disabled }) {
  const handleFile = (e) => {
    if (!e.target.files.length) return;
    onComplete();
  };

  return (
    <div className="bg-card-bg p-4 rounded-lg shadow-card">
      <h2 className="font-medium mb-3">Upload Audio File</h2>

      <input
        type="file"
        accept="audio/*"
        disabled={disabled}
        onChange={handleFile}
        className="block w-full text-sm text-text-secondary
                   file:mr-4 file:py-2 file:px-4
                   file:rounded file:border-0
                   file:bg-spotify-green file:text-black
                   hover:file:bg-spotify-green-hover"
      />
    </div>
  );
}
