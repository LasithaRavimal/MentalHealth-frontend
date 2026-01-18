export const ANALYSIS_CATEGORIES = {
  DEPRESSION: { label: 'Depression', key: 'depression', color: '#1DB954' },
  STRESS: { label: 'Stress', key: 'stress', color: '#1ed760' },
  ANXIETY: { label: 'Anxiety', key: 'anxiety', color: '#169c46' }
};

export const GET_LEVEL_TEXT = (score) => {
  if (score < 30) return { text: 'Low', class: 'text-spotify-green' };
  if (score < 60) return { text: 'Moderate', class: 'text-yellow-500' };
  return { text: 'High', class: 'text-red-500' };
};