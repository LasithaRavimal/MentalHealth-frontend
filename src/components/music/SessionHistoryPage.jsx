import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './PlayerSidebar';
import TopBar from './PlayerTopBar';
import PlayerBar from './player/PlayerBar';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../admin/music/context/PlayerContext';
import { MdArrowBack, MdCheckCircle, MdWarning, MdError, MdCalendarToday, MdAccessTime } from 'react-icons/md';

const SessionHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onPlaySong } = usePlayer();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sessions');
      setSessions(response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startedAt, endedAt) => {
    if (!startedAt || !endedAt) return 'N/A';
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getStressColor = (level) => {
    if (!level) return 'text-text-gray';
    const l = level.toLowerCase();
    if (l === 'high') return 'text-red-400';
    if (l === 'moderate') return 'text-yellow-400';
    return 'text-green-400';
  };

  const getDepressionColor = (level) => {
    if (!level) return 'text-text-gray';
    const l = level.toLowerCase();
    if (l === 'high') return 'text-red-400';
    if (l === 'moderate') return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStressIcon = (level) => {
    if (!level) return null;
    const l = level.toLowerCase();
    if (l === 'high') return <MdError className="w-5 h-5 text-red-400" />;
    if (l === 'moderate') return <MdWarning className="w-5 h-5 text-yellow-400" />;
    return <MdCheckCircle className="w-5 h-5 text-green-400" />;
  };

  const getDepressionIcon = (level) => {
    if (!level) return null;
    const l = level.toLowerCase();
    if (l === 'high') return <MdError className="w-5 h-5 text-red-400" />;
    if (l === 'moderate') return <MdWarning className="w-5 h-5 text-yellow-400" />;
    return <MdCheckCircle className="w-5 h-5 text-green-400" />;
  };

  return (
    <div className="flex h-screen bg-spotify-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-spotify-dark-gray pb-24">
        <TopBar />

        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-text-gray hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              <MdArrowBack className="text-xl" />
              <span>Back</span>
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">Session History</h1>
            <p className="text-text-gray">View your past listening sessions and predictions</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-gray">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-spotify-gray rounded-full flex items-center justify-center mb-6">
                <MdCalendarToday className="w-12 h-12 text-text-gray" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No sessions yet</h3>
              <p className="text-text-gray text-center max-w-md">
                Start listening to music to track your sessions and receive stress and depression predictions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-spotify-light-gray rounded-lg p-6 hover:bg-spotify-gray transition-colors cursor-pointer"
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MdCalendarToday className="text-text-gray" />
                        <span className="text-white font-semibold">
                          {formatDate(session.started_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-text-gray">
                        <MdAccessTime className="text-text-gray" />
                        <span>Duration: {calculateDuration(session.started_at, session.ended_at)}</span>
                      </div>
                    </div>
                    
                    {session.prediction && (
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            {getStressIcon(session.prediction.stress_level)}
                            <span className={`text-sm font-semibold ${getStressColor(session.prediction.stress_level)}`}>
                              {session.prediction.stress_level || 'N/A'}
                            </span>
                          </div>
                          <span className="text-xs text-text-gray">Stress</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-2 mb-1">
                            {getDepressionIcon(session.prediction.depression_level)}
                            <span className={`text-sm font-semibold ${getDepressionColor(session.prediction.depression_level)}`}>
                              {session.prediction.depression_level || 'N/A'}
                            </span>
                          </div>
                          <span className="text-xs text-text-gray">Depression</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedSession?.id === session.id && session.prediction && (
                    <div className="mt-4 pt-4 border-t border-spotify-gray space-y-4">
                      {/* Stress Details */}
                      <div>
                        <h4 className="text-white font-semibold mb-2">Stress Level</h4>
                        <div className="mb-3">
                          <div className={`text-2xl font-bold ${getStressColor(session.prediction.stress_level)} mb-2`}>
                            {session.prediction.stress_level}
                          </div>
                          {session.prediction.stress_probs && (
                            <div className="space-y-2">
                              {Object.entries(session.prediction.stress_probs).map(([level, prob]) => (
                                <div key={level} className="flex items-center gap-3">
                                  <div className="w-20 text-sm text-text-gray capitalize">{level}:</div>
                                  <div className="flex-1 bg-spotify-gray rounded-full h-2 overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        level.toLowerCase() === 'high' ? 'bg-red-500' :
                                        level.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${prob * 100}%` }}
                                    />
                                  </div>
                                  <div className="w-16 text-sm text-white text-right">
                                    {(prob * 100).toFixed(1)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Depression Details */}
                      <div>
                        <h4 className="text-white font-semibold mb-2">Depression Level</h4>
                        <div className="mb-3">
                          <div className={`text-2xl font-bold ${getDepressionColor(session.prediction.depression_level)} mb-2`}>
                            {session.prediction.depression_level}
                          </div>
                          {session.prediction.depression_probs && (
                            <div className="space-y-2">
                              {Object.entries(session.prediction.depression_probs).map(([level, prob]) => (
                                <div key={level} className="flex items-center gap-3">
                                  <div className="w-20 text-sm text-text-gray capitalize">{level}:</div>
                                  <div className="flex-1 bg-spotify-gray rounded-full h-2 overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        level.toLowerCase() === 'high' ? 'bg-red-500' :
                                        level.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${prob * 100}%` }}
                                    />
                                  </div>
                                  <div className="w-16 text-sm text-white text-right">
                                    {(prob * 100).toFixed(1)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Explanations */}
                      {session.prediction.explanations && session.prediction.explanations.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Session Insights</h4>
                          <ul className="space-y-2">
                            {session.prediction.explanations.map((explanation, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-spotify-green rounded-full mt-2 flex-shrink-0" />
                                <p className="text-text-gray text-sm leading-relaxed">{explanation}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Session Events */}
                      {session.events && session.events.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Activity Summary</h4>
                          <p className="text-text-gray text-sm">
                            {session.events.length} event{session.events.length !== 1 ? 's' : ''} tracked
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PlayerBar />
    </div>
  );
};

export default SessionHistoryPage;

