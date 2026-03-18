import { useState, useEffect } from 'react';
import Layout from '../music/PlayerLayout';
import { useAuth } from '../../context/AuthContext';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/notifications';
import { MdLock, MdNotifications, MdDeleteForever, MdSecurity, MdVolumeUp, MdRepeat, MdShuffle } from 'react-icons/md';

const MusicProfileSettings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    defaultShuffle: false,
    defaultRepeat: false,
    defaultVolume: 1,
    emailNotifications: true,
    stressAlerts: true,
    sessionAlerts: true,
  });
  
  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        setPreferences({ ...preferences, ...JSON.parse(savedPrefs) });
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
    
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      if (!isNaN(vol)) {
        setPreferences(prev => ({ ...prev, defaultVolume: vol }));
      }
    }
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showWarningToast('Please fill all password fields');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarningToast('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showWarningToast('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      // Note: Backend endpoint for password change may need to be implemented
      showWarningToast('Password change functionality coming soon');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showErrorToast('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    
    // Update volume in localStorage if changed
    if (key === 'defaultVolume') {
      localStorage.setItem('volume', value.toString());
    }
    
    showSuccessToast('Preferences saved');
  };

  const handleClearHistory = () => {
    if (!confirm('Are you sure you want to clear your listening history? This action cannot be undone.')) {
      return;
    }
    
    showWarningToast('History clearing functionality coming soon');
  };

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This will permanently delete all your data including sessions and playlists. This action cannot be undone.')) {
      return;
    }
    
    if (!confirm('This is your final warning. Click OK to permanently delete your account.')) {
      return;
    }
    
    showWarningToast('Account deletion functionality coming soon');
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-8 pb-48 mb-24 bg-gradient-to-b from-spotify-dark-gray to-spotify-black min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-text-gray">Manage your account settings and preferences</p>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Account Settings */}
          <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <MdSecurity className="text-2xl text-spotify-green" />
              <h2 className="text-xl font-bold text-white">Account Settings</h2>
            </div>
            
            <div className="space-y-4">
              {/* Email Display */}
              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <label className="block text-sm font-medium text-text-gray mb-2">Email Address</label>
                <div className="flex items-center justify-between">
                  <span className="text-white">{user?.email || 'N/A'}</span>
                  <span className="text-xs text-text-gray px-3 py-1 bg-spotify-gray rounded-full">Cannot be changed</span>
                </div>
              </div>

              {/* Account Type */}
              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <label className="block text-sm font-medium text-text-gray mb-2">Account Type</label>
                <div className="flex items-center justify-between">
                  <span className="text-white capitalize">{user?.role || 'User'} Account</span>
                  {user?.role === 'user' && (
                    <button className="text-xs text-spotify-green hover:text-green-400 hover:underline transition-colors">
                      Upgrade to Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <MdLock className="text-2xl text-spotify-green" />
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-spotify-dark-gray border border-spotify-gray rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-spotify-dark-gray border border-spotify-gray rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-gray mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-spotify-dark-gray border border-spotify-gray rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-spotify-green hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Playback Preferences */}
          <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <MdVolumeUp className="text-2xl text-spotify-green" />
              <h2 className="text-xl font-bold text-white">Playback Preferences</h2>
            </div>
            
            <div className="space-y-4">
              {/* Default Volume */}
              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white">Default Volume</label>
                  <span className="text-sm text-text-gray">{Math.round(preferences.defaultVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={preferences.defaultVolume}
                  onChange={(e) => handlePreferenceChange('defaultVolume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-spotify-gray rounded-lg appearance-none cursor-pointer accent-spotify-green"
                />
              </div>

              {/* Shuffle */}
              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MdShuffle className="text-xl text-text-gray" />
                    <div>
                      <label className="text-sm font-medium text-white">Default Shuffle Mode</label>
                      <p className="text-xs text-text-gray">Automatically enable shuffle when starting playback</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('defaultShuffle', !preferences.defaultShuffle)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      preferences.defaultShuffle ? 'bg-spotify-green' : 'bg-spotify-gray'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        preferences.defaultShuffle ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Repeat */}
              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MdRepeat className="text-xl text-text-gray" />
                    <div>
                      <label className="text-sm font-medium text-white">Default Repeat Mode</label>
                      <p className="text-xs text-text-gray">Automatically enable repeat when starting playback</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('defaultRepeat', !preferences.defaultRepeat)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      preferences.defaultRepeat ? 'bg-spotify-green' : 'bg-spotify-gray'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        preferences.defaultRepeat ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6">
              <MdNotifications className="text-2xl text-spotify-green" />
              <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Email Notifications</label>
                    <p className="text-xs text-text-gray">Receive email updates about your account</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      preferences.emailNotifications ? 'bg-spotify-green' : 'bg-spotify-gray'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        preferences.emailNotifications ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Stress Level Alerts</label>
                    <p className="text-xs text-text-gray">Get notified when high stress levels are detected</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('stressAlerts', !preferences.stressAlerts)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      preferences.stressAlerts ? 'bg-spotify-green' : 'bg-spotify-gray'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        preferences.stressAlerts ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-spotify-dark-gray rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Session Summary Emails</label>
                    <p className="text-xs text-text-gray">Receive session summary after logout</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange('sessionAlerts', !preferences.sessionAlerts)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      preferences.sessionAlerts ? 'bg-spotify-green' : 'bg-spotify-gray'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        preferences.sessionAlerts ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <MdDeleteForever className="text-2xl text-red-400" />
              <h2 className="text-xl font-bold text-white">Privacy & Data</h2>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleClearHistory}
                className="w-full bg-spotify-dark-gray hover:bg-spotify-gray text-white font-semibold py-3 rounded-lg transition-all duration-300 border border-spotify-gray hover:border-red-400"
              >
                Clear Listening History
              </button>
              
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-lg transition-all duration-300 border border-red-600/50 hover:border-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MusicProfileSettings;;

