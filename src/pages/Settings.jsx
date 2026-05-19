import { useState, useEffect } from 'react';

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  currency: '৳',
  monthlyBudget: '',
};

export default function Settings() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load profile from API on mount
  useEffect(() => {
    const stored = localStorage.getItem('user-profile');
    if (stored) setProfile(JSON.parse(stored));
    // Later: fetch from your Laravel API
    // fetch('https://your-api.com/api/profile')
    //   .then(r => r.json())
    //   .then(data => setProfile(data));
  }, []);

  function handleChange(e) {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);

    // Save to localStorage for now
    // Later replace with: await fetch('https://your-api.com/api/profile', { method: 'PUT', ... })
    localStorage.setItem('user-profile', JSON.stringify(profile));

    await new Promise(r => setTimeout(r, 600)); // simulate API delay
    setLoading(false);
    setSaved(true);
  }

  function handleReset() {
    if (confirm('Are you sure you want to reset all settings?')) {
      setProfile(DEFAULT_PROFILE);
      localStorage.removeItem('user-profile');
      setSaved(false);
    }
  }

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-6">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-display font-bold text-white shadow-lg shadow-violet-500/30">
          {profile.name ? profile.name[0].toUpperCase() : '?'}
        </div>
        <p className="text-gray-400 text-sm">Your Profile</p>
      </div>

      {/* Profile section */}
      <Section title="Personal Info">
        <Field label="Full Name" name="name" value={profile.name}
          onChange={handleChange} placeholder="e.g. Rahim Uddin" />
        <Field label="Email" name="email" value={profile.email}
          onChange={handleChange} placeholder="you@email.com" type="email" />
        <Field label="Phone" name="phone" value={profile.phone}
          onChange={handleChange} placeholder="01XXXXXXXXX" type="tel" />
      </Section>

      {/* Preferences section */}
      <Section title="Preferences">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Currency</label>
          <select name="currency" value={profile.currency} onChange={handleChange}
            className="w-full bg-[#0f0f14] border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
            <option value="৳">৳ — Bangladeshi Taka</option>
            <option value="$">$ — US Dollar</option>
            <option value="€">€ — Euro</option>
            <option value="£">£ — British Pound</option>
            <option value="₹">₹ — Indian Rupee</option>
          </select>
        </div>
        <Field label="Monthly Budget (optional)" name="monthlyBudget"
          value={profile.monthlyBudget} onChange={handleChange}
          placeholder="e.g. 30000" type="number" />
      </Section>

      {/* App info section */}
      <Section title="About">
        <div className="flex flex-col gap-3">
          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Backend" value="Laravel + MySQL" />
          <InfoRow label="Storage" value="WebHostBD" />
        </div>
      </Section>

      {/* Save button */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3">
          <span className="text-green-400 text-lg">✓</span>
          <p className="text-green-400 text-sm font-medium">Settings saved successfully!</p>
        </div>
      )}

      <button onClick={handleSave} disabled={loading}
        className="w-full py-4 rounded-2xl font-display font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 active:scale-95 transition-transform disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      <button onClick={handleReset}
        className="w-full py-3 rounded-2xl font-medium text-red-400 border border-red-500/20 bg-red-500/5 active:scale-95 transition-transform text-sm">
        Reset Settings
      </button>
    </div>
  );
}

// ── Reusable components ──
function Section({ title, children }) {
  return (
    <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5 flex flex-col gap-3">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
      <input name={name} value={value} onChange={onChange}
        placeholder={placeholder} type={type}
        className="w-full bg-[#0f0f14] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-300 font-medium">{value}</span>
    </div>
  );
}
