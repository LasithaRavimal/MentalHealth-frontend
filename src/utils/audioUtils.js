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

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};