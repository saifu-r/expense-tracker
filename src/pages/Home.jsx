import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, formatCurrency, formatDate } from '../utils/constants';
import { Link } from 'react-router-dom';

export default function Home() {
  const { balance, totalIncome, totalExpense, transactions } = useExpenses();

  const recent = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-5 p-4 pb-28">
      {/* Header */}
      <div className="pt-3">
        <p className="text-gray-400 text-sm">Good day 👋</p>
        <h1 className="text-2xl font-display font-bold text-white">My Finances</h1>
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
        <Link to="/add?type=expense"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm active:scale-95 transition-transform">
          <span className="text-lg">↓</span> Add Expense
        </Link>
        <Link to="/add?type=income"
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
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map(t => <TransactionCard key={t.id} transaction={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable transaction card ──
export function TransactionCard({ transaction: t, onDelete }) {
  const cat = CATEGORIES[t.category] || CATEGORIES.other;
  const isExpense = t.type === 'expense';

  return (
    <div className="flex items-center gap-3 bg-[#18181f] rounded-2xl p-3 border border-white/5">
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

      {/* Amount + delete */}
      <div className="flex items-center gap-2">
        <span className={`font-display font-bold text-sm ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
          {isExpense ? '−' : '+'}{formatCurrency(t.amount)}
        </span>
        {onDelete && (
          <button onClick={() => onDelete(t.id)}
            className="text-gray-600 hover:text-red-400 transition-colors p-1 active:scale-90">
            <TrashIcon />
          </button>
        )}
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
