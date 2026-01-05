/**
 * Handle session ending: aggregate data, call API, and show prediction results
 */

import apiClient from '../api/apiClient';
import { aggregateSessionData } from './musicSessionAggregator';
import { showStressAlert, showDepressionAlert } from './notifications';

export const handleSessionEnd = async (sessionContext, onPredictionReceived = null) => {
  try {
    const { activeSession, endSession, songsPlayed, songDurations, skipCount, repeatCount, volumeHistory, sessionStartTime } = sessionContext;
    
    if (!activeSession) {
      console.warn('No active session to end');
      return null;
    }
    
    // Aggregate session data
    const aggregatedData = aggregateSessionData({
      songsPlayed,
      songDurations,
      skipCount,
      repeatCount,
      volumeHistory,
      sessionStartTime
    });
    
    // End session via context (which calls API)
    const result = await endSession(aggregatedData);
    
    if (result && result.prediction) {
      const prediction = result.prediction;
      
      // Show alerts if high stress/depression
      const stressLevel = prediction.stress_level?.toLowerCase() || '';
      const depressionLevel = prediction.depression_level?.toLowerCase() || '';
      
      if (stressLevel === 'high' || depressionLevel === 'high') {
        if (stressLevel === 'high') {
          showStressAlert(prediction.stress_level, prediction.depression_level);
        }
        if (depressionLevel === 'high') {
          showDepressionAlert(prediction.stress_level, prediction.depression_level);
        }
      }
      
      // Call callback with prediction if provided
      if (onPredictionReceived) {
        onPredictionReceived(prediction);
      }
      
      return prediction;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to end session:', error);
    // Still clear session state
    if (sessionContext.endSession) {
      await sessionContext.endSession();
    }
    return null;
  }
};

