import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import {
  MdPerson,
  MdEmail,
  MdCalendarToday,
  MdMusicNote,
  MdMic,
  MdFace,
  MdHearing,
  MdArrowBack,
} from 'react-icons/md';

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
    <div className="flex-1 min-h-screen p-8 pb-48 mb-24 overflow-y-auto bg-gradient-to-b from-spotify-dark-gray to-spotify-black">
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-16 h-16 border-4 rounded-full border-spotify-green border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-white">Profile</h1>
              <p className="text-text-gray">Your account details and detection methods</p>
            </div>

            <button
              onClick={() => navigate('/landing')}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
            >
              <MdArrowBack className="text-lg" />
              <span>Back</span>
            </button>
          </div>

          {/* User Info Card */}
          <div className="p-8 mb-8 border rounded-lg shadow-xl bg-gradient-to-br from-spotify-light-gray to-spotify-gray border-spotify-gray animate-fade-in">
            <div className="flex items-start gap-6">
              <div className="flex items-center justify-center w-24 h-24 text-3xl font-bold text-white rounded-full shadow-lg bg-gradient-to-br from-spotify-green to-green-600">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <MdEmail className="text-xl text-spotify-green" />
                  <h2 className="text-2xl font-bold text-white">{user?.email || 'User'}</h2>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <MdPerson className="text-lg text-text-gray" />
                  <span className="capitalize text-text-gray">{user?.role || 'User'} Account</span>
                </div>
                {registrationDate && (
                  <div className="flex items-center gap-3">
                    <MdCalendarToday className="text-lg text-text-gray" />
                    <span className="text-text-gray">
                      Member since{' '}
                      {new Date(registrationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Method Buttons (EEG / Face / Voice / Music) */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/eeghistory')}
              className="flex flex-col items-center justify-center gap-3 p-6 transition-colors border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
            >
              <MdHearing className="w-8 h-8 text-spotify-green" />
              <span className="font-semibold text-white">EEG</span>
              <span className="text-sm text-text-gray">EEG-based detection</span>
            </button>

              <button
                onClick={() => navigate('/voicehistorypage')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 transition-colors border border-white/5"
              >
                <MdMic className="w-8 h-8 text-spotify-green" />
                <span className="text-white font-semibold">Voice</span>
                <span className="text-text-gray text-sm">Voice analysis</span>
              </button>
            <button
              onClick={() => navigate('/facehistory')}
              className="flex flex-col items-center justify-center gap-3 p-6 transition-colors border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
            >
              <MdFace className="w-8 h-8 text-spotify-green" />
              <span className="font-semibold text-white">Face</span>
              <span className="text-sm text-text-gray">Face-based detection</span>
            </button>

              <button
                onClick={() => navigate('/weekly-analysis')}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 transition-colors border border-white/5"
              >
                <MdMusicNote className="w-8 h-8 text-spotify-green" />
                <span className="text-white font-semibold">Music</span>
                <span className="text-text-gray text-sm">Open Music Player</span>
              </button>
            </div>

            {/* <button
              onClick={() => navigate('/musichistory')}
              className="flex flex-col items-center justify-center gap-3 p-6 transition-colors border rounded-xl bg-spotify-light-gray/20 hover:bg-spotify-light-gray/40 border-white/5"
            >
              <MdMusicNote className="w-8 h-8 text-spotify-green" />
              <span className="font-semibold text-white">Music</span>
              <span className="text-sm text-text-gray">Open Music Player</span>
            </button>
          </div> */}
        </>
      )}
    </div>
  );
};

export default Profile;