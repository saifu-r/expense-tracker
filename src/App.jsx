import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import History from './pages/History';
import AddTransaction from './pages/AddTransaction';
import Charts from './pages/Charts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// ── Protected layout — wraps all authenticated pages ──
function ProtectedLayout() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
    <ExpenseProvider>
      <Outlet />
      <BottomNav />
    </ExpenseProvider>
  );
}

// ── Public layout — redirects to home if already logged in ──
function PublicLayout() {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/"         element={<Home />} />
              <Route path="/history"  element={<History />} />
              <Route path="/add"      element={<AddTransaction />} />
              <Route path="/charts"   element={<Charts />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
