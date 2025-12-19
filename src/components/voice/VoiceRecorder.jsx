import React, { useState, useRef } from 'react';
import AudioVisualizer from './AudioVisualizer';

const VoiceRecorder = ({ onStop, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' });
      onStop(blob);
      chunksRef.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-spotify-light-gray rounded-lg">
      <AudioVisualizer isRecording={isRecording} />
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`mt-4 px-6 py-2 rounded-full font-bold transition ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-spotify-green hover:bg-spotify-green-hover text-black'
        } disabled:opacity-50`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default VoiceRecorder;