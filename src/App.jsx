// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import FaceWeeklyTrackingPage from "./pages/FaceWeeklyTrackingPage";


/* =========================
   PAGES
========================= */
/* Public & User */
import LoginPage from "./components/user/LoginPage";
import LandingPage from "./components/user/LandingPage";
import Profile from "./components/user/Profile";
import ProfileSettings from "./components/user/ProfileSettings";
import VoicePage from "./pages/VoicePage";
import EEGDetectionPage from "./pages/EEGDetectionPage";

/* ✅ ONLY FACE PAGE (Simulator) */
import EmotionSimulatorPage from "./pages/EmotionSimulatorPage";

/* Admin */
import SongManagement from "./components/admin/music/SongManagement";

/* Music */
import MusicWrapper from "./components/music/MusicWrapper";
import MusicPlayerHome from "./components/music/MusicPlayerHome";

/* =========================
   SHARED UI
========================= */
const FullScreenLoader = () => (
  <div className="flex items-center justify-center min-h-screen">Loading...</div>
);

/* =========================
   ROUTE GUARDS
========================= */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  if (user) {
    return user.role === "admin" ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/landing" replace />
    );
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return user.role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/landing" replace />;
};

/* =========================
   APP ROUTES
========================= */
function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

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
  path="/facehistory"
  element={
    <ProtectedRoute>
      <FaceWeeklyTrackingPage />
    </ProtectedRoute>
  }
/>


      {/* ✅ SINGLE SOURCE OF TRUTH: Simulator */}
      <Route
        path="/emotion-simulator"
        element={
          <ProtectedRoute>
            <EmotionSimulatorPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ Redirect old paths to simulator (no broken links) */}
      <Route path="/emotion-tracking" element={<Navigate to="/emotion-simulator" replace />} />
      <Route path="/face" element={<Navigate to="/emotion-simulator" replace />} />

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
        path="/pages/VoicePage"
        element={
          <ProtectedRoute>
            <VoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voice"
        element={
          <ProtectedRoute>
            <VoicePage />
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

      {/* ---------- Music ---------- */}
      <Route
        path="/musichome"
        element={
          <ProtectedRoute>
            <MusicWrapper>
              <MusicPlayerHome />
            </MusicWrapper>
          </ProtectedRoute>
        }
      />

      {/* ---------- Admin ---------- */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <SongManagement />
          </ProtectedRoute>
        }
      />

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/* =========================
   APP ROOT
========================= */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
