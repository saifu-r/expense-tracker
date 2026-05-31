import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../components/Toast';
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import { TransactionCard } from './Home';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

// function getMonths() {
//   const months = [];
//   const now = new Date();
//   for (let i = 0; i < 6; i++) {
//     const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//     months.push({
//       value: d.toISOString().slice(0, 7),
//       label: d.toLocaleDateString('en-BD', { month: 'short', year: 'numeric' }),
//     });
//   }
//   return months;
// }

function getMonths() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-BD', { month: 'short', year: 'numeric' }),
    });
  }
  return months;
}

const SORT_OPTIONS = [
  { value: 'date_desc',   label: '↓ Newest' },
  { value: 'date_asc',    label: '↑ Oldest' },
  { value: 'amount_desc', label: '↓ Highest' },
  { value: 'amount_asc',  label: '↑ Lowest' },
];

export default function History() {
  const { transactions, filter, setFilter, resetFilter, deleteTransaction } = useExpenses();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const months = getMonths();
  const [confirmId, setConfirmId] = useState(null);

  function haptic() { if (navigator.vibrate) navigator.vibrate(40); }

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

  const hasFilter = filter.month || filter.category;
  const currentSort = filter.sort || 'date_desc';

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">History</h1>
        {hasFilter && (
          <button onClick={resetFilter} className="text-violet-400 text-sm">
            Clear filters
          </button>
        )}
      </div>

      {/* Month filter */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Month</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Chip active={!filter.month} onClick={() => setFilter({ month: '' })} label="All" />
          {months.map(m => (
            <Chip key={m.value} active={filter.month === m.value}
              onClick={() => {
                // console.log('Setting month to:', m.value);
                setFilter({ month: m.value });
              }} label={m.label} />
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Category</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Chip active={!filter.category} onClick={() => setFilter({ category: '' })} label="All" />
          {ALL_CATEGORIES.map(key => {
            const cat = CATEGORIES[key];
            return (
              <Chip key={key} active={filter.category === key}
                onClick={() => setFilter({ category: key })}
                label={`${cat.icon} ${cat.label.split(' ')[0]}`} />
            );
          })}
        </div>
      </div>

      {/* Sort options */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Sort by</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SORT_OPTIONS.map(s => (
            <Chip key={s.value} active={currentSort === s.value}
              onClick={() => setFilter({ sort: s.value })} label={s.label} />
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-600 text-xs">{transactions.length} transactions</p>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>No transactions found</p>
          <p className="text-sm mt-1">Try changing the filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map(t => (
            <TransactionCard key={t.id} transaction={t}
              onDelete={() => { haptic(); setConfirmId(t.id); }}
              onEdit={() => navigate(`/edit/${t.id}`)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmId}
        title="Delete Transaction"
        message="Are you sure? This cannot be undone."
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function Chip({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-violet-500 text-white'
          : 'bg-[#18181f] text-gray-400 border border-white/5'
      }`}>
      {label}
    </button>
  );
}
