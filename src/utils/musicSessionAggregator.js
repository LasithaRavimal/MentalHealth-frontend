/**
 * Aggregate session data from in-memory events for ML prediction
 */

export const aggregateSessionData = (sessionData) => {
  const {
    songsPlayed = [],
    songDurations = new Map(),
    skipCount = 0,
    repeatCount = 0,
    volumeHistory = [],
    sessionStartTime = null
  } = sessionData;
  
  const now = new Date();
  
  // 1. Song Category Mode (most frequent category)
  const categories = songsPlayed.map(s => s.category).filter(Boolean);
  const categoryCounts = {};
  categories.forEach(cat => {
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  let songCategoryMode = 'calm'; // Default
  if (Object.keys(categoryCounts).length > 0) {
    songCategoryMode = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    );
  }
  
  // 2. Skip Rate Bucket
  const totalSongs = songsPlayed.length || 1; // Avoid division by zero
  const skipRate = skipCount / totalSongs;
  let skipRateBucket = 'Never';
  if (skipRate === 0) {
    skipRateBucket = 'Never';
  } else if (skipRate <= 0.4) {
    skipRateBucket = '1-2 times';
  } else if (skipRate <= 0.75) {
    skipRateBucket = '3-5 times';
  } else {
    skipRateBucket = 'More than 5 times';
  }
  
  // 3. Repeat Bucket
  let repeatBucket = 'None';
  if (repeatCount === 0) {
    repeatBucket = 'None';
  } else if (repeatCount <= 2) {
    repeatBucket = '1-2 times';
  } else if (repeatCount <= 5) {
    repeatBucket = '3-5 times';
  } else {
    repeatBucket = 'More than 5';
  }
  
  // 4. Duration Ratio Bucket (average completion ratio per song)
  // This is an approximation based on skip rate and song durations
  let durationRatioBucket = 'Around 50%';
  if (skipRate === 0 && songsPlayed.length > 0) {
    // No skips, assume mostly full songs
    durationRatioBucket = 'Full song';
  } else if (skipRate < 0.3) {
    durationRatioBucket = 'About 75%';
  } else if (skipRate < 0.5) {
    durationRatioBucket = 'Around 50%';
  } else {
    durationRatioBucket = 'Less than 25%';
  }
  
  // 5. Session Length Bucket
  // let sessionLengthBucket = 'Less than 10 min';
  // if (sessionStartTime) {
  //   const durationMinutes = (now - new Date(sessionStartTime)) / (1000 * 60);
  //   if (durationMinutes < 10) {
  //     sessionLengthBucket = 'Less than 10 min';
  //   } else if (durationMinutes < 30) {
  //     sessionLengthBucket = '10-30 min';
  //   } else if (durationMinutes < 60) {
  //     sessionLengthBucket = '30-60 min';
  //   } else {
  //     sessionLengthBucket = 'More than 1 hour';
  //   }
  // }
 // 5. Session Length Bucket (based on actual listening time)
let sessionLengthBucket = 'Less than 10 min';

// Calculate total listening seconds from songDurations
const totalListeningSeconds = Array.from(songDurations.values())
  .reduce((sum, d) => sum + d, 0);

const durationMinutes = totalListeningSeconds / 60;

if (durationMinutes < 10) {
  sessionLengthBucket = 'Less than 10 min';
} else if (durationMinutes < 30) {
  sessionLengthBucket = '10-30 min';
} else if (durationMinutes < 60) {
  sessionLengthBucket = '30-60 min';
} else {
  sessionLengthBucket = 'More than 1 hour';
}


  
  // 6. Volume Level Bucket (average volume)
  let volumeLevelBucket = 'Medium';
  if (volumeHistory.length > 0) {
    const avgVolume = volumeHistory.reduce((sum, v) => sum + (v.volume || 0.5), 0) / volumeHistory.length;
    if (avgVolume < 0.33) {
      volumeLevelBucket = 'Low';
    } else if (avgVolume < 0.67) {
      volumeLevelBucket = 'Medium';
    } else {
      volumeLevelBucket = 'High';
    }
  }
  
  // 7. Song Diversity Bucket (unique categories count)
  const uniqueCategories = new Set(categories).size;
  let songDiversityBucket = '2-3 categories';
  if (uniqueCategories === 1) {
    songDiversityBucket = 'One category';
  } else if (uniqueCategories <= 3) {
    songDiversityBucket = '2-3 categories';
  } else {
    songDiversityBucket = 'More than 3 categories';
  }
  
  // 8. Listening Time of Day
  const hour = now.getHours();
  let listeningTimeOfDay = 'Afternoon (11am-3pm)';
  if (hour >= 5 && hour < 11) {
    listeningTimeOfDay = 'Morning (5am-11am)';
  } else if (hour >= 11 && hour < 15) {
    listeningTimeOfDay = 'Afternoon (11am-3pm)';
  } else if (hour >= 15 && hour < 20) {
    listeningTimeOfDay = 'Evening (3pm-8pm)';
  } else if (hour >= 20 && hour < 24) {
    listeningTimeOfDay = 'Night (8pm-12am)';
  } else {
    listeningTimeOfDay = 'Midnight (12am-5am)';
  }
  
  return {
    song_category_mode: songCategoryMode,
    skip_rate_bucket: skipRateBucket,
    repeat_bucket: repeatBucket,
    duration_ratio_bucket: durationRatioBucket,
    session_length_bucket: sessionLengthBucket,
    volume_level_bucket: volumeLevelBucket,
    song_diversity_bucket: songDiversityBucket,
    listening_time_of_day: listeningTimeOfDay,
  };
};

