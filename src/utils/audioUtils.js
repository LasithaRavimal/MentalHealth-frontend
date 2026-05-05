export const validateAudioFile = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Unsupported file format. Please use MP3, WAV, or OGG." };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File is too large. Maximum size is 10MB." };
  }

  return { valid: true };
};

export const MIN_RECORDING_DURATION_SECONDS = 3;
export const MIN_RECORDED_BLOB_SIZE_BYTES = 1024;

const RECORDER_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg'
];

const MIME_TYPE_TO_EXTENSION = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/flac': 'flac',
  'audio/x-flac': 'flac'
};

export const getPreferredRecorderMimeType = () => {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }

  return RECORDER_MIME_CANDIDATES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || '';
};

export const normalizeAudioMimeType = (mimeType = '') => mimeType.split(';')[0].trim().toLowerCase();

export const getAudioExtensionFromMimeType = (mimeType = '') => {
  const normalizedMimeType = normalizeAudioMimeType(mimeType);
  return MIME_TYPE_TO_EXTENSION[normalizedMimeType] || 'webm';
};

export const buildAudioFilename = (mimeType = '', baseName = 'recording') => {
  const extension = getAudioExtensionFromMimeType(mimeType);
  return `${baseName}.${extension}`;
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
