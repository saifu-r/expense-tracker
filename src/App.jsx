import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { ToastProvider } from './components/Toast';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import History from './pages/History';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import Charts from './pages/Charts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';

function ProtectedLayout() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
    <ExpenseProvider>
      <ToastProvider>
        <Outlet />
        <BottomNav />
      </ToastProvider>
    </ExpenseProvider>
  );
}

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
            <Route element={<PublicLayout />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Route>
            <Route element={<ProtectedLayout />}>
              <Route path="/"              element={<Home />} />
              <Route path="/history"       element={<History />} />
              <Route path="/add"           element={<AddTransaction />} />
              <Route path="/edit/:id"      element={<EditTransaction />} />
              <Route path="/charts"        element={<Charts />} />
              <Route path="/settings"      element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
