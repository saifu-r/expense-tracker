import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../components/Toast';
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';

export default function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allTransactions, updateTransaction } = useExpenses();
  const { showToast } = useToast();

  const transaction = allTransactions.find(t => t.id === id);

  const [type, setType] = useState('expense');
  const [form, setForm] = useState({
    title: '', amount: '', category: 'food', date: '', note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setForm({
        title:    transaction.title,
        amount:   transaction.amount,
        category: transaction.category,
        date:     transaction.date,
        note:     transaction.note || '',
      });
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-500">
        <p className="text-4xl">😕</p>
        <p>Transaction not found</p>
        <button onClick={() => navigate('/history')} className="text-violet-400">Go back</button>
      </div>
    );
  }

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError('Please enter a title.');
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError('Please enter a valid amount.');

    setLoading(true);
    try {
      await updateTransaction({ ...transaction, ...form, type, amount: Number(form.amount) });
      showToast('Transaction updated!');
      navigate('/history');
    } catch {
      showToast('Failed to update', 'error');
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-display font-bold">Edit Transaction</h1>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 bg-[#18181f] p-1 rounded-2xl">
        {['expense', 'income'].map(t => (
          <button key={t} onClick={() => setType(t)}
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

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Title</label>
          <input name="title" value={form.title} onChange={handleChange}
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Amount (৳)</label>
          <input name="amount" value={form.amount} onChange={handleChange}
            type="number" inputMode="decimal"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors text-xl font-display font-bold" />
        </div>

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

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Date</label>
          <input name="date" value={form.date} onChange={handleChange} type="date"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Note (optional)</label>
          <input name="note" value={form.note} onChange={handleChange}
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-4 rounded-2xl font-display font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 active:scale-95 transition-transform disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
