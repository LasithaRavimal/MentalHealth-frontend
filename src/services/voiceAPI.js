const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

//Get authentication token from localStorage

const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Analyze voice audio file
 * @param {File|Blob} audioFile - Audio file to analyze
 * @returns {Promise} Analysis results
 */
export const analyzeVoice = async (audioFile) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }

  const formData = new FormData();
  formData.append('audio', audioFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/voice/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing voice:', error);
    throw error;
  }
};

/**
 * Get voice analysis history
 * @param {number} limit - Number of results to fetch
 * @param {number} skip - Number of results to skip
 * @returns {Promise} Array of past analyses
 */
export const getAnalysisHistory = async (limit = 10, skip = 0) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/voice/history?limit=${limit}&skip=${skip}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
};

/**
 * Get specific analysis result by ID
 * @param {string} analysisId - ID of the analysis
 * @returns {Promise} Analysis result
 */
export const getAnalysisResult = async (analysisId) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/voice/result/${analysisId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analysis result:', error);
    throw error;
  }
};

/**
 * Delete analysis result
 * @param {string} analysisId - ID of the analysis to delete
 * @returns {Promise} Deletion confirmation
 */
export const deleteAnalysis = async (analysisId) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/voice/result/${analysisId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};