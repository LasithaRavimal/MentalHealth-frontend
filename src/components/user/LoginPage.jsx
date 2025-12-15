import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../auth/GoogleSignInButton';
import { GoogleOAuthProvider } from '@react-oauth/google';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(email, password);

      if (result.success) {
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/landing');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (token, userInfo) => {
    setError('');
    setLoading(true);

    try {
      const result = await googleLogin(token);
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/landing');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    setError('Google sign in failed. Please try again.');
    console.error('Google sign in error:', error);
  };

  const handleOAuthClick = (provider) => {
    // Placeholder for other OAuth providers
    setError(`${provider} sign in is coming soon!`);
  };

  // Get Google Client ID from environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-spotify-black flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-spotify-dark-gray rounded-2xl p-8 shadow-elevated border border-spotify-light-gray">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-2">
                <span className="text-spotify-green">M</span>_Track
              </h1>
              <p className="text-text-gray text-sm">AI-Based Mental Health Detection</p>
            </div>

            {/* OAuth Buttons - Rounded Icon Buttons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {googleClientId && (
                <GoogleSignInButton
                  clientId={googleClientId}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  iconOnly={true}
                />
              )}

              <button
                onClick={() => handleOAuthClick('Facebook')}
                className="w-14 h-14 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                title="Sign in with Facebook"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              <button
                onClick={() => handleOAuthClick('GitHub')}
                className="w-14 h-14 rounded-full bg-spotify-gray hover:bg-spotify-light-gray text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                title="Sign in with GitHub"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>

              <button
                onClick={() => handleOAuthClick('Apple')}
                className="w-14 h-14 rounded-full bg-black hover:bg-gray-900 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/20"
                title="Sign in with Apple"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-spotify-gray"></div>
              </div>
              <div className="relative bg-spotify-dark-gray px-4 text-sm text-text-gray">
                OR
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-gray mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-gray mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-white placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-spotify-green hover:bg-spotify-green-hover text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-spotify-green hover:text-spotify-green-hover text-sm font-medium"
              >
                {isLogin ? "Don't have an account? Sign up for M_Track" : "Already have an account? Log in"}
              </button>
            </div>
          </div>

          <p className="text-center text-text-gray text-xs mt-6 max-w-md mx-auto">
            By continuing, you agree to M_Track's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
