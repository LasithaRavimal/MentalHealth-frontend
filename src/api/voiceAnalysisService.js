export const analyzeVoiceData = async (audioBlob) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  return {
    success: true,
    results: {
      depression: Math.floor(Math.random() * 70) + 10,
      stress: Math.floor(Math.random() * 80) + 15,
      anxiety: Math.floor(Math.random() * 60) + 20,
    },
    message: "Analysis completed based on vocal pitch, jitter, and shimmer variance."
  };
};