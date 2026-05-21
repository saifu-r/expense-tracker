import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Accept':        'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch {
      // Even if API call fails, log out locally
    }
    logout();
    navigate('/login');
  }

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-6">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-display font-bold text-white shadow-lg shadow-violet-500/30">
          {user?.name ? user.name[0].toUpperCase() : '?'}
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-white text-lg">{user?.name}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5 flex flex-col gap-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Account</p>
        <InfoRow label="Name"   value={user?.name} />
        <InfoRow label="Email"  value={user?.email} />
        <InfoRow label="Member since" value={user?.created_at
          ? new Date(user.created_at).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' })
          : '—'} />
      </div>

      {/* App info */}
      <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5 flex flex-col gap-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">About</p>
        <InfoRow label="App Version" value="1.0.0" />
        <InfoRow label="Backend"     value="Laravel + MySQL" />
        <InfoRow label="Hosting"     value="WebHostBD" />
      </div>

      {/* Logout */}
      <button onClick={handleLogout} disabled={loggingOut}
        className="w-full py-4 rounded-2xl font-display font-bold text-red-400 border border-red-500/20 bg-red-500/5 active:scale-95 transition-transform disabled:opacity-60">
        {loggingOut ? 'Logging out...' : '← Log Out'}
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-300 font-medium">{value || '—'}</span>
    </div>
  );
}
