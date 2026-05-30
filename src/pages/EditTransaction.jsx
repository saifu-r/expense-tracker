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
  const [existingReceipts, setExistingReceipts] = useState([]);
  const [newReceipt, setNewReceipt] = useState(null);
  const [newReceiptPreview, setNewReceiptPreview] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

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
      setExistingReceipts(transaction.receipts || []);
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

  function handleNewReceiptChange(file) {
    if (!file) return;
    setNewReceipt(file);
    const reader = new FileReader();
    reader.onload = e => setNewReceiptPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  async function handleDeleteReceipt(receiptId) {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/transactions/${transaction.id}/receipts/${receiptId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Accept': 'application/json',
          },
        }
      );
      setExistingReceipts(prev => prev.filter(r => r.id !== receiptId));
      showToast('Photo deleted');
    } catch {
      showToast('Failed to delete photo', 'error');
    }
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError('Please enter a title.');
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError('Please enter a valid amount.');
    if (navigator.vibrate) navigator.vibrate(40);
    setLoading(true);

    // Step 1 — Update transaction
    try {
      await updateTransaction({ ...transaction, ...form, type, amount: Number(form.amount) });
    } catch {
      setError('Failed to update. Try again.');
      setLoading(false);
      return;
    }

    // Step 2 — Upload new receipt if selected
    if (newReceipt) {
      try {
        const formData = new FormData();
        formData.append('receipt', newReceipt);
        await fetch(
          `${import.meta.env.VITE_API_URL}/transactions/${transaction.id}/receipts`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Accept': 'application/json',
            },
            body: formData,
          }
        );
      } catch {
        showToast('Transaction updated but photo failed to upload', 'error');
      }
    }

    showToast('Transaction updated!');
    navigate('/history');
  }

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="text-gray-400 active:scale-90 transition-transform">
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

      {/* Form fields */}
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

        {/* ── Existing receipts ── */}
        {existingReceipts.length > 0 && (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Attached Photos</label>
            <div className="flex flex-col gap-2">
              {existingReceipts.map(r => (
                <div key={r.id} className="relative rounded-2xl overflow-hidden border border-white/5">
                  {r.mime_type?.includes('pdf') ? (
                    // PDF
                    <div className="flex items-center gap-3 bg-[#18181f] p-3">
                      <span className="text-3xl">📄</span>
                      <div className="flex-1">
                        <p className="text-sm text-white truncate">{r.file_name}</p>
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-violet-400">Open PDF</a>
                      </div>
                      <button onClick={() => handleDeleteReceipt(r.id)}
                        className="text-gray-600 hover:text-red-400 p-1 active:scale-90 transition-transform text-lg">
                        ✕
                      </button>
                    </div>
                  ) : (
                    // Image with preview
                    <div className="relative">
                      <img
                        src={r.url}
                        alt={r.file_name}
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() => setViewingImage(r.url)}
                      />
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteReceipt(r.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white active:scale-90 transition-transform">
                        ✕
                      </button>
                      {/* Tap hint */}
                      <div className="absolute bottom-2 left-2 bg-black/50 rounded-lg px-2 py-1">
                        <span className="text-white text-xs">👁 Tap to view full screen</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Add new photo ── */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">
            {existingReceipts.length > 0 ? 'Add Another Photo' : 'Add Photo (optional)'}
          </label>
          {newReceiptPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/5">
              <img src={newReceiptPreview} alt="new receipt"
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setViewingImage(newReceiptPreview)} />
              <button
                onClick={() => { setNewReceipt(null); setNewReceiptPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white active:scale-90 transition-transform">
                ✕
              </button>
              <div className="absolute bottom-2 left-2 bg-black/50 rounded-lg px-2 py-1">
                <span className="text-white text-xs">👁 Tap to view full screen</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <label className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border border-dashed border-white/10 bg-[#18181f] cursor-pointer active:scale-95 transition-transform">
                <input type="file" accept="image/*" capture="environment"
                  className="hidden"
                  onChange={e => handleNewReceiptChange(e.target.files[0])} />
                <span className="text-2xl">📷</span>
                <span className="text-xs text-gray-500">Take Photo</span>
              </label>
              <label className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border border-dashed border-white/10 bg-[#18181f] cursor-pointer active:scale-95 transition-transform">
                <input type="file" accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => handleNewReceiptChange(e.target.files[0])} />
                <span className="text-2xl">🖼️</span>
                <span className="text-xs text-gray-500">From Gallery</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-4 rounded-2xl font-display font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 active:scale-95 transition-transform disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* ── Full screen image viewer ── */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setViewingImage(null)}>
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xl z-10 active:scale-90 transition-transform">
            ✕
          </button>
          {/* Hint */}
          <p className="absolute bottom-8 text-gray-500 text-xs">Tap anywhere to close</p>
          {/* Image */}
          <img
            src={viewingImage}
            alt="receipt full view"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
