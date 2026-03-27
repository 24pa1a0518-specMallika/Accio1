import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import AllItems from './pages/AllItems';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import Reports from './pages/Reports';
import Home from './pages/Home';

function ProtectedRoute({ children, adminRequired = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminRequired && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
        <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
        <Route path="/items" element={<ProtectedRoute><AllItems /></ProtectedRoute>} />
        <Route path="/lost-items" element={<ProtectedRoute><LostItems /></ProtectedRoute>} />
        <Route path="/found-items" element={<ProtectedRoute><FoundItems /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminRequired={true}><AdminPanel /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
