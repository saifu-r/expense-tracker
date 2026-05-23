import { useState, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { CATEGORIES, formatCurrency, formatDate } from '../utils/constants';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Home() {
  const { balance, totalIncome, totalExpense, recent, deleteTransaction } = useExpenses();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [confirmId, setConfirmId] = useState(null);

  // Haptic feedback helper
  function haptic() {
    if (navigator.vibrate) navigator.vibrate(40);
  }

  async function handleDelete(id) {
    haptic();
    try {
      await deleteTransaction(id);
      showToast('Transaction deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
    setConfirmId(null);
  }

  // Greeting based on time
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col gap-5 p-4 pb-28">
      {/* Header */}
      <div className="pt-3 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{getGreeting()} 👋</p>
          <h1 className="text-2xl font-display font-bold text-white">{firstName}'s Finances</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-display font-bold text-white shadow-lg shadow-violet-500/30">
          {firstName[0].toUpperCase()}
        </div>
      </div>

      {/* Balance card */}
      <div className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #a21caf 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
        <p className="text-violet-200 text-sm font-medium mb-1">Total Balance</p>
        <p className="text-4xl font-display font-extrabold text-white mb-5">
          {formatCurrency(balance)}
        </p>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-green-300 text-xs">↑</span>
              <span className="text-violet-200 text-xs">Income</span>
            </div>
            <p className="text-white font-display font-bold">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-red-300 text-xs">↓</span>
              <span className="text-violet-200 text-xs">Expense</span>
            </div>
            <p className="text-white font-display font-bold">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-3">
        <Link to="/add?type=expense" onClick={haptic}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm active:scale-95 transition-transform">
          <span className="text-lg">↓</span> Add Expense
        </Link>
        <Link to="/add?type=income" onClick={haptic}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-sm active:scale-95 transition-transform">
          <span className="text-lg">↑</span> Add Income
        </Link>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Recent</h2>
          <Link to="/history" className="text-violet-400 text-sm">See all</Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-3xl mb-2">🪙</p>
            <p>No transactions yet</p>
            <p className="text-sm mt-1 text-gray-600">Tap + to add your first one</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map(t => (
              <TransactionCard key={t.id} transaction={t}
                onDelete={() => { haptic(); setConfirmId(t.id); }} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This cannot be undone."
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

// ── Reusable transaction card with swipe to delete ──
export function TransactionCard({ transaction: t, onDelete, onEdit }) {
  const cat = CATEGORIES[t.category] || CATEGORIES.other;
  const isExpense = t.type === 'expense';
  const navigate = useNavigate();

  // Swipe to delete
  const startX = useRef(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  }

  function onTouchMove(e) {
    if (startX.current === null) return;
    const diff = e.touches[0].clientX - startX.current;
    if (diff < 0) setSwipeX(Math.max(diff, -80));
  }

  function onTouchEnd() {
    if (swipeX < -60) {
      onDelete?.();
    }
    setSwipeX(0);
    setSwiping(false);
    startX.current = null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete hint behind card */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-red-500 rounded-2xl">
        <span className="text-white text-xs font-bold">Delete</span>
      </div>

      {/* Card */}
      <div
        className="flex items-center gap-3 bg-[#18181f] rounded-2xl p-3 border border-white/5 relative"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Category icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: cat.color + '22' }}>
          {cat.icon}
        </div>

        {/* Title + date */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-white truncate">{t.title}</p>
          <p className="text-gray-500 text-xs">{formatDate(t.date)}</p>
        </div>

        {/* Amount + actions */}
        <div className="flex items-center gap-2">
          <span className={`font-display font-bold text-sm ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
            {isExpense ? '−' : '+'}{formatCurrency(t.amount)}
          </span>
          {onEdit && (
            <button onClick={() => navigate(`/edit/${t.id}`)}
              className="text-gray-600 hover:text-violet-400 transition-colors p-1 active:scale-90">
              <EditIcon />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 active:scale-90">
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}
