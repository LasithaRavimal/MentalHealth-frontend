import React, { useState } from 'react';
import { validateAudioFile } from '../../utils/audioUtils';

const VoiceUploader = ({ onUpload, disabled }) => {
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    onUpload(file);
  };

  return (
    <div className="w-full">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        disabled ? 'border-spotify-gray bg-transparent opacity-50' : 'border-spotify-gray hover:border-spotify-green bg-spotify-light-gray'
      }`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-3 text-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-2 text-sm text-text-gray"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-text-gray-dark">WAV, MP3, or OGG (Max 10MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="audio/*" 
          onChange={handleFileChange} 
          disabled={disabled}
        />
      </label>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
};

export default VoiceUploader;