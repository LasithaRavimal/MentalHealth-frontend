import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../music/PlayerLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { MdPerson, MdEmail, MdCalendarToday, MdMusicNote, MdTrendingUp, MdTrendingDown, MdFavorite, MdAccessTime } from 'react-icons/md';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MusicProfile  = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListeningTime: 0, // in minutes
    totalSessions: 0,
    favoriteCategories: [],
    mostPlayedSongs: [],
    recentPredictions: [],
    stressTrends: [],
    depressionTrends: [],
    registrationDate: null,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user sessions
      const sessionsRes = await apiClient.get('/sessions').catch((err) => {
        console.error('Failed to fetch sessions:', err);
        return { data: [] };
      });
      const sessions = sessionsRes.data || [];
      console.log('Loaded sessions:', sessions.length);
      
      // Fetch user favorites - extract song_ids from response
      const favoritesRes = await apiClient.get('/songs/favorites').catch((err) => {
        console.error('Failed to fetch favorites:', err);
        return { data: { song_ids: [] } };
      });
      const favoriteIds = favoritesRes.data?.song_ids || [];
      console.log('Favorite song IDs:', favoriteIds.length);
      
      // Fetch all songs to get actual song objects for favorites
      const songsRes = await apiClient.get('/songs').catch((err) => {
        console.error('Failed to fetch songs:', err);
        return { data: [] };
      });
      const allSongs = songsRes.data || [];
      
      // Filter songs to get favorite song objects
      const favoriteSongs = allSongs.filter(song => favoriteIds.includes(song.id));
      console.log('Favorite songs:', favoriteSongs.length);
      
      // Calculate total listening time
      let totalMinutes = 0;
      sessions.forEach(session => {
        const started = session.started_at ? new Date(session.started_at) : null;
        const ended = session.ended_at ? new Date(session.ended_at) : null;
        if (started && ended) {
          const diff = (ended - started) / (1000 * 60); // Convert to minutes
          totalMinutes += diff;
        }
      });
      console.log('Total listening time (minutes):', totalMinutes);
      
      // Calculate favorite categories from both sessions and favorite songs
      const categoryCounts = {};
      
      // Add categories from sessions
      sessions.forEach(session => {
        const category = session.aggregated_data?.song_category_mode;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
      
      // Add categories from favorite songs
      favoriteSongs.forEach(song => {
        const category = song.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
      
      // Get top categories
      const favoriteCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);
      console.log('Top categories:', favoriteCategories);
      
      // Get recent predictions
      const recentPredictions = sessions
        .filter(s => s.prediction)
        .slice(0, 5)
        .map(s => ({
          date: s.ended_at ? new Date(s.ended_at).toLocaleDateString() : 'N/A',
          stress: s.prediction?.stress_level || 'Unknown',
          depression: s.prediction?.depression_level || 'Unknown',
        }));
      
      // Build trend data (last 7 sessions with predictions)
      const recentSessionsWithPredictions = sessions
        .filter(s => s.prediction && s.ended_at)
        .slice(0, 7)
        .reverse();
      
      const stressTrends = recentSessionsWithPredictions.map((s, idx) => ({
        session: `Session ${idx + 1}`,
        level: s.prediction?.stress_level === 'High' ? 3 : s.prediction?.stress_level === 'Moderate' ? 2 : 1,
        label: s.prediction?.stress_level || 'Low',
      }));
      
      const depressionTrends = recentSessionsWithPredictions.map((s, idx) => ({
        session: `Session ${idx + 1}`,
        level: s.prediction?.depression_level === 'High' ? 3 : s.prediction?.depression_level === 'Moderate' ? 2 : 1,
        label: s.prediction?.depression_level || 'Low',
      }));
      
      // Get user creation date
      const userRes = await apiClient.get('/auth/me').catch((err) => {
        console.error('Failed to fetch user data:', err);
        return { data: null };
      });
      const userData = userRes.data;
      
      setStats({
        totalListeningTime: Math.round(totalMinutes),
        totalSessions: sessions.length,
        favoriteCategories,
        mostPlayedSongs: favoriteSongs.slice(0, 5),
        recentPredictions,
        stressTrends,
        depressionTrends,
        registrationDate: user?.created_at || userData?.created_at || null,
      });
      
      console.log('Profile stats updated:', {
        totalListeningTime: Math.round(totalMinutes),
        totalSessions: sessions.length,
        favoriteCategories: favoriteCategories.length,
        favoriteSongs: favoriteSongs.length,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setLoading(false);
      // Set default stats on error
      setStats({
        totalListeningTime: 0,
        totalSessions: 0,
        favoriteCategories: [],
        mostPlayedSongs: [],
        recentPredictions: [],
        stressTrends: [],
        depressionTrends: [],
        registrationDate: null,
      });
    }
  };

  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8 pb-48 mb-24 bg-gradient-to-b from-spotify-dark-gray to-spotify-black min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
              <p className="text-text-gray">Your music listening insights and statistics</p>
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-8 mb-8 shadow-xl border border-spotify-gray animate-fade-in">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-spotify-green to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <MdEmail className="text-xl text-spotify-green" />
                    <h2 className="text-2xl font-bold text-white">{user?.email || 'User'}</h2>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <MdPerson className="text-lg text-text-gray" />
                    <span className="text-text-gray capitalize">{user?.role || 'User'} Account</span>
                  </div>
                  {stats.registrationDate && (
                    <div className="flex items-center gap-3">
                      <MdCalendarToday className="text-lg text-text-gray" />
                      <span className="text-text-gray">
                        Member since {new Date(stats.registrationDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <MdAccessTime className="text-2xl text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{formatTime(stats.totalListeningTime)}</div>
                <div className="text-text-gray">Total Listening Time</div>
              </div>

              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <MdMusicNote className="text-2xl text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalSessions}</div>
                <div className="text-text-gray">Total Sessions</div>
              </div>

              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MdFavorite className="text-2xl text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.mostPlayedSongs.length}</div>
                <div className="text-text-gray">Liked Songs</div>
              </div>

              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <MdTrendingUp className="text-2xl text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.favoriteCategories.length}</div>
                <div className="text-text-gray">Top Categories</div>
              </div>
            </div>

            {/* Favorite Categories */}
            {stats.favoriteCategories.length > 0 && (
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 mb-8 shadow-lg border border-spotify-gray animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4">Favorite Categories</h2>
                <div className="flex flex-wrap gap-3">
                  {stats.favoriteCategories.map((category, idx) => (
                    <div
                      key={category}
                      onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
                      className="px-4 py-2 bg-spotify-green/20 hover:bg-spotify-green/30 rounded-full text-spotify-green font-semibold cursor-pointer transition-all hover:scale-105"
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends Charts */}
            {(stats.stressTrends.length > 0 || stats.depressionTrends.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {stats.stressTrends.length > 0 && (
                  <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-lg border border-spotify-gray animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Stress Level Trends</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats.stressTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                        <XAxis dataKey="session" stroke="#888" />
                        <YAxis domain={[0, 3]} stroke="#888" tick={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#181818',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value, name, props) => [props.payload.label, 'Stress Level']}
                        />
                        <Line
                          type="monotone"
                          dataKey="level"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {stats.depressionTrends.length > 0 && (
                  <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-lg border border-spotify-gray animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Depression Level Trends</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats.depressionTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                        <XAxis dataKey="session" stroke="#888" />
                        <YAxis domain={[0, 3]} stroke="#888" tick={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#181818',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value, name, props) => [props.payload.label, 'Depression Level']}
                        />
                        <Line
                          type="monotone"
                          dataKey="level"
                          stroke="#eab308"
                          strokeWidth={3}
                          dot={{ fill: '#eab308', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Recent Predictions */}
            {stats.recentPredictions.length > 0 && (
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 mb-8 shadow-lg border border-spotify-gray animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recent Session Predictions</h2>
                  <button
                    onClick={() => navigate('/sessions')}
                    className="text-sm text-spotify-green hover:text-green-400 hover:underline transition-colors"
                  >
                    View All Sessions
                  </button>
                </div>
                <div className="space-y-3">
                  {stats.recentPredictions.map((pred, idx) => (
                    <div
                      key={idx}
                      className="bg-spotify-dark-gray rounded-lg p-4 hover:bg-spotify-gray transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-gray text-sm">{pred.date}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-text-gray text-sm">Stress:</span>
                            <span
                              className={`font-semibold ${
                                pred.stress === 'High' ? 'text-red-400' :
                                pred.stress === 'Moderate' ? 'text-yellow-400' : 'text-green-400'
                              }`}
                            >
                              {pred.stress}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-text-gray text-sm">Depression:</span>
                            <span
                              className={`font-semibold ${
                                pred.depression === 'High' ? 'text-red-400' :
                                pred.depression === 'Moderate' ? 'text-yellow-400' : 'text-green-400'
                              }`}
                            >
                              {pred.depression}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liked Songs */}
            {stats.mostPlayedSongs.length > 0 && (
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-lg border border-spotify-gray animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Liked Songs</h2>
                  <button
                    onClick={() => navigate('/library')}
                    className="text-sm text-spotify-green hover:text-green-400 hover:underline transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.mostPlayedSongs.slice(0, 6).map((song) => (
                    <div
                      key={song.id}
                      className="bg-spotify-dark-gray rounded-lg p-4 hover:bg-spotify-gray transition-colors cursor-pointer group"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(song.title)}`)}
                    >
                      {song.thumbnail_url && (
                        <img
                          src={song.thumbnail_url}
                          alt={song.title}
                          className="w-full h-32 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="font-semibold text-white truncate">{song.title}</div>
                      <div className="text-sm text-text-gray truncate">{song.artist}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MusicProfile ;

