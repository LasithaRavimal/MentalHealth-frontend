import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

/* 🔹 Public & User Pages */
import LoginPage from './components/user/LoginPage';
import LandingPage from './components/user/LandingPage';
import Profile from './components/user/Profile';
import ProfileSettings from './components/user/ProfileSettings';
import EEGDetectionPage from "./pages/EEGDetectionPage";

/* 🔹 Admin Pages */


/* =========================
   ROUTE GUARDS
========================= */

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return user.role === 'admin'
      ? <Navigate to="/admin" replace />
      : <Navigate to="/landing" replace />;
  }

  return children;
};

/* =========================
   APP ROUTES
========================= */
function AppRoutes() {
  console.log('AppRoutes mounted - current path:', window.location.pathname);
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* ---------- User ---------- */}
      <Route
        path="/landing"
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile-settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/eeg"
        element={
          <ProtectedRoute>
            <EEGDetectionPage />
          </ProtectedRoute>
        }
      />

     

      {/* ---------- Fallback ---------- */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/* =======================
   🚀 App Root
======================= */

function App() {
  console.log('App mounted - pathname:', window.location.pathname);
  return (
    <Router>
      {/* Visible debug badge (remove after diagnosing) */}
      <div className="fixed top-3 right-3 bg-black text-white text-xs px-2 py-1 rounded z-50">DEBUG: App running</div>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;