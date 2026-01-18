import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* 🔹 Public & User Pages */
import LoginPage from "./components/user/LoginPage";
import LandingPage from "./components/user/LandingPage";
import FaceDetectionPage from "./pages/faceDetectionPage";

import Profile from "./components/user/Profile";
import ProfileSettings from "./components/user/ProfileSettings";

/* 🔹 Admin Pages */

/* =========================
   ROUTE GUARDS
========================= */

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (user) {
    return user.role === "admin" ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/landing" replace />
    );
  }

  return children;
};

/* =========================
   APP ROUTES
========================= */
function AppRoutes() {
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
 {/* ---------- FAce main page route ---------- */}
      <Route
        path="/face"
        element={
          <ProtectedRoute>
            <FaceDetectionPage />
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
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
