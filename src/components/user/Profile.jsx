// frontend/src/components/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { MdPerson, MdEmail, MdCalendarToday, MdMusicNote, MdMic, MdFace, MdHearing } from 'react-icons/md';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registrationDate, setRegistrationDate] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
       
      const res = await apiClient.get('/auth/me').catch(() => ({ data: null }));
      const userData = res.data || {};
      setRegistrationDate(userData.created_at || user?.created_at || null);
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    
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
              <p className="text-text-gray">Your account details and detection methods</p>
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
                  {registrationDate && (
                    <div className="flex items-center gap-3">
                      <MdCalendarToday className="text-lg text-text-gray" />
                      <span className="text-text-gray">
                        Member since {new Date(registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Method Buttons (EEG / Face / Voice / Music) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button
                onClick={() => navigate('/eeghistory')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 transition-colors border border-white/5"
              >
                <MdHearing className="w-8 h-8 text-spotify-green" />
                <span className="text-white font-semibold">EEG</span>
                <span className="text-text-gray text-sm">EEG-based detection</span>
              </button>

              <button
                onClick={() => navigate('/facehistory')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 transition-colors border border-white/5"
              >
                <MdFace className="w-8 h-8 text-spotify-green" />
                <span className="text-white font-semibold">Face</span>
                <span className="text-text-gray text-sm">Face-based detection</span>
              </button>

              <button
                onClick={() => navigate('/voicehistory')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 transition-colors border border-white/5"
              >
                <MdMic className="w-8 h-8 text-spotify-green" />
                <span className="text-white font-semibold">Voice</span>
                <span className="text-text-gray text-sm">Voice analysis</span>
              </button>

              <button
                onClick={() => navigate('/musichistory')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 transition-colors border border-white/5"
              >
                <MdMusicNote className="w-8 h-8 text-spotify-green" />
                <span className="text-white font-semibold">Music</span>
                <span className="text-text-gray text-sm">Open Music Player</span>
              </button>
            </div>

            
          </>
        )}
      </div>
   
  );
};

export default Profile;
