import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

export default function AddTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addTransaction } = useExpenses();

  // Pre-select type from URL query param (e.g. /add?type=income)
  const [type, setType] = useState(searchParams.get('type') || 'expense');
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: type === 'income' ? 'salary' : 'food',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [error, setError] = useState('');

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleTypeChange(newType) {
    setType(newType);
    setForm(prev => ({
      ...prev,
      category: newType === 'income' ? 'salary' : 'food',
    }));
  }

  function handleSubmit() {
    if (!form.title.trim()) return setError('Please enter a title.');
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError('Please enter a valid amount.');

    addTransaction({
      ...form,
      type,
      amount: Number(form.amount),
    });
    navigate('/');
  }

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-5">
      <h1 className="text-2xl font-display font-bold">Add Transaction</h1>

      {/* Type toggle */}
      <div className="flex gap-2 bg-[#18181f] p-1 rounded-2xl">
        {['expense', 'income'].map(t => (
          <button key={t} onClick={() => handleTypeChange(t)}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm capitalize transition-all ${
              type === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                : 'text-gray-400'
            }`}>
            {t === 'expense' ? '↓ Expense' : '↑ Income'}
          </button>
        ))}
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-3">
        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Title</label>
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Lunch, Salary..."
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Amount (৳)</label>
          <input name="amount" value={form.amount} onChange={handleChange}
            type="number" inputMode="decimal" placeholder="0.00"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors text-xl font-display font-bold" />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {cats.map(key => {
              const cat = CATEGORIES[key];
              return (
                <button key={key} onClick={() => setForm(p => ({ ...p, category: key }))}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all text-xs ${
                    form.category === key
                      ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                      : 'border-white/5 bg-[#18181f] text-gray-400'
                  }`}>
                  <span className="text-xl">{cat.icon}</span>
                  <span className="truncate w-full text-center">{cat.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Date</label>
          <input name="date" value={form.date} onChange={handleChange}
            type="date"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
        </div>

        {/* Note */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Note (optional)</label>
          <input name="note" value={form.note} onChange={handleChange}
            placeholder="Add a note..."
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Submit */}
      <button onClick={handleSubmit}
        className="w-full py-4 rounded-2xl font-display font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 active:scale-95 transition-transform">
        Save Transaction
      </button>
    </div>
  );
}
