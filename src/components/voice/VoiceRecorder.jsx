import React, { useState, useRef, useEffect, useCallback } from 'react';
import AudioVisualizer from './AudioVisualizer';
import ConfirmationDialog from './ConfirmationDialog';
import {
  getPreferredRecorderMimeType,
  MIN_RECORDED_BLOB_SIZE_BYTES,
  MIN_RECORDING_DURATION_SECONDS
} from '../../utils/audioUtils';

const RECORDING_DURATION = 60; // 1 minute in seconds

const VoiceRecorder = ({ onStop, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBlob, setPendingBlob] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(RECORDING_DURATION);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const recordingStartedAtRef = useRef(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Auto-stop when timer runs out
  useEffect(() => {
    if (isRecording && timeRemaining <= 0) {
      stopRecording();
    }
  }, [isRecording, timeRemaining, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType = getPreferredRecorderMimeType();
      const recorderOptions = preferredMimeType ? { mimeType: preferredMimeType } : undefined;

      streamRef.current = stream;
      mediaRecorderRef.current = recorderOptions
        ? new MediaRecorder(stream, recorderOptions)
        : new MediaRecorder(stream);

      console.debug('[VoiceRecorder] MediaRecorder mimeType selected:', mediaRecorderRef.current.mimeType || preferredMimeType || 'browser-default');

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const recordingDurationMs = recordingStartedAtRef.current
          ? Date.now() - recordingStartedAtRef.current
          : 0;
        const blobMimeType =
          chunksRef.current.find((chunk) => chunk.type)?.type ||
          mediaRecorderRef.current?.mimeType ||
          preferredMimeType ||
          'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobMimeType });

        console.debug('[VoiceRecorder] audioBlob.type:', blob.type || '(empty)');
        console.debug('[VoiceRecorder] audioBlob.size:', blob.size);
        console.debug('[VoiceRecorder] recordingDurationMs:', recordingDurationMs);

        if (blob.size < MIN_RECORDED_BLOB_SIZE_BYTES) {
          setError('Recording is too short or empty. Please record at least 3 seconds and speak clearly.');
        } else if (recordingDurationMs < MIN_RECORDING_DURATION_SECONDS * 1000) {
          setError('Please record for at least 3 seconds before submitting.');
        } else {
          setPendingBlob(blob);
          setShowConfirmation(true);
        }

        chunksRef.current = [];
        recordingStartedAtRef.current = null;

        // Stop all tracks to release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      recordingStartedAtRef.current = Date.now();
      setIsRecording(true);
      setTimeRemaining(RECORDING_DURATION);

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (recordingError) {
      console.error('Error starting recording:', recordingError);
      setError('Unable to access your microphone. Please check browser permissions and try again.');

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    onStop(pendingBlob);
    setPendingBlob(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPendingBlob(null);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress for the circular timer (0 to 1)
  const progress = (RECORDING_DURATION - timeRemaining) / RECORDING_DURATION;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <>
      <div className="flex flex-col items-center p-6 bg-spotify-light-gray rounded-lg">
        <AudioVisualizer isRecording={isRecording} />

        {/* Timer Display - visible while recording */}
        {isRecording && (
          <div className="my-4 flex flex-col items-center animate-fade-in">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Background circle */}
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={timeRemaining <= 10 ? '#ef4444' : '#1db954'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Time text */}
              <div className="flex flex-col items-center z-10">
                <span className={`text-2xl font-mono font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-[10px] text-text-gray uppercase tracking-widest mt-0.5">remaining</span>
              </div>
            </div>
            <p className="text-xs text-text-gray mt-2">
              Recording will auto-stop at 1 minute
            </p>
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`mt-4 px-6 py-2 rounded-full font-bold transition ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-spotify-green hover:bg-spotify-green-hover text-black'
          } disabled:opacity-50`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Submit Recording?"
        message="Are you sure you want to submit this audio recording for analysis?"
      />
    </>
  );
};

export default VoiceRecorder;
