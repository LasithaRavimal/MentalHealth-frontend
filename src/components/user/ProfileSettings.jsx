import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/notifications';
import { MdLock, MdNotifications, MdDeleteForever, MdSecurity } from 'react-icons/md';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      try {
        setPreferences({ ...preferences, ...JSON.parse(savedPrefs) });
      } catch (e) {
        console.error('Failed to load preferences:', e);
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
    showSuccessToast('Preferences saved');
  };

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!confirm('Final warning: Delete your account permanently?')) return;

    showWarningToast('Account deletion functionality coming soon');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-spotify-dark-gray to-spotify-black min-h-screen flex justify-center">

      <div className="w-full max-w-3xl space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-text-gray">Manage your account and privacy</p>
        </div>

        {/* ===================== ACCOUNT SETTINGS ===================== */}
        <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray">
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
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CHANGE PASSWORD ===================== */}
        <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray">
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
                className="w-full px-4 py-3 bg-spotify-dark-gray border border-spotify-gray rounded-lg text-white placeholder-text-gray focus:ring-2 focus:ring-spotify-green"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-spotify-dark-gray border border-spotify-gray rounded-lg text-white placeholder-text-gray focus:ring-2 focus:ring-spotify-green"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-spotify-dark-gray border border-spotify-gray rounded-lg text-white placeholder-text-gray focus:ring-2 focus:ring-spotify-green"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-spotify-green hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* ===================== EMAIL NOTIFICATION ONLY ===================== */}
        <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray">
          <div className="flex items-center gap-3 mb-6">
            <MdNotifications className="text-2xl text-spotify-green" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>

          <div className="bg-spotify-dark-gray rounded-lg p-4 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-white">Email Notifications</label>
              <p className="text-xs text-text-gray">Receive email updates about your account</p>
            </div>

            <button
              onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                preferences.emailNotifications ? 'bg-spotify-green' : 'bg-spotify-gray'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  preferences.emailNotifications ? 'translate-x-7' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* ===================== DELETE ACCOUNT ===================== */}
        <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-lg p-6 shadow-xl border border-spotify-gray">
          <div className="flex items-center gap-3 mb-6">
            <MdDeleteForever className="text-2xl text-red-400" />
            <h2 className="text-xl font-bold text-white">Privacy & Data</h2>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-lg transition-all border border-red-600/50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
