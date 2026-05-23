import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
  const { user, token, logout } = useAuth();
  const { allTransactions } = useExpenses();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', darkMode ? '#0f0f14' : '#f5f5f5');
    document.body.style.backgroundColor = darkMode ? '#0f0f14' : '#f0f0f0';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });
    } catch {}
    logout();
    navigate('/login');
  }

  async function handleSaveProfile() {
    if (!form.name.trim()) return showToast('Name cannot be empty', 'error');
    setSaving(true);
    // Update locally for now — wire to API when you add profile update endpoint
    localStorage.setItem('user-profile-name', form.name);
    // localStorage.setItem('auth_user',  JSON.stringify(userData));
    await new Promise(r => setTimeout(r, 500));
    showToast('Profile updated!');
    setSaving(false);
    setEditing(false);
  }

  // Export to CSV
  function exportCSV() {
    if (allTransactions.length === 0) return showToast('No transactions to export', 'error');
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Note'];
    const rows = allTransactions.map(t => [
      t.date, t.title, t.type, t.category, t.amount, t.note || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!');
  }

  // Export to PDF (simple print)
  function exportPDF() {
    if (allTransactions.length === 0) return showToast('No transactions to export', 'error');
    const rows = allTransactions.map(t =>
      `<tr>
        <td>${t.date}</td>
        <td>${t.title}</td>
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td>${formatCurrency(t.amount)}</td>
      </tr>`
    ).join('');

    const html = `
      <html><head><title>Expense Report</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { color: #6d28d9; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #6d28d9; color: white; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #f9f9f9; }
      </style></head>
      <body>
        <h1>Expense Report</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead><tr><th>Date</th><th>Title</th><th>Type</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
    showToast('PDF ready to print!');
  }

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-6">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-display font-bold text-white shadow-lg shadow-violet-500/30">
          {firstName[0].toUpperCase()}
        </div>
        {!editing ? (
          <div className="text-center">
            <p className="font-display font-bold text-white text-lg">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <button onClick={() => setEditing(true)}
              className="text-violet-400 text-sm mt-1 active:scale-95 transition-transform">
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#18181f] border border-violet-500 rounded-2xl px-4 py-3 text-white focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input value={form.email} disabled
                className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2.5 rounded-2xl text-gray-400 bg-white/5 border border-white/10 text-sm active:scale-95 transition-transform">
                Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex-1 py-2.5 rounded-2xl text-white bg-violet-600 text-sm font-bold active:scale-95 transition-transform disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5 flex flex-col gap-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Preferences</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Dark Mode</p>
            <p className="text-xs text-gray-500">Toggle app theme</p>
          </div>
          <button onClick={() => setDarkMode(p => !p)}
            className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-violet-500' : 'bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5 flex flex-col gap-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Export Data</p>
        <p className="text-xs text-gray-500">{allTransactions.length} transactions total</p>
        <div className="flex gap-3">
          <button onClick={exportCSV}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-sm active:scale-95 transition-transform">
            📊 Export CSV
          </button>
          <button onClick={exportPDF}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium text-sm active:scale-95 transition-transform">
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5 flex flex-col gap-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">About</p>
        <InfoRow label="App Version" value="1.0.0" />
        <InfoRow label="Backend"     value="Laravel + MySQL" />
        <InfoRow label="Hosting"     value="WebHostBD" />
        <InfoRow label="Member since" value={user?.created_at
          ? new Date(user.created_at).toLocaleDateString('en-BD', { month: 'short', year: 'numeric' })
          : '—'} />
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
