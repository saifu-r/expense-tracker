import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit() {
    if (!form.email || !form.password) return setError('Please fill in all fields.');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':        'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      navigate('/');
    } catch {
      setError('Could not connect to server. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-violet-500/30">
          💰
        </div>
        <h1 className="text-3xl font-display font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 mt-1 text-sm">Sign in to your account</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="you@email.com"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl font-display font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 active:scale-95 transition-transform disabled:opacity-60 mt-2">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>

      {/* Register link */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-violet-400 font-medium">Create one</Link>
      </p>
    </div>
  );
}
