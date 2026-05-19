import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants';
import { TransactionCard } from './Home';

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

// Get last 6 months for filter
function getMonths() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-BD', { month: 'short', year: 'numeric' }),
    });
  }
  return months;
}

export default function History() {
  const { transactions, filter, setFilter, deleteTransaction } = useExpenses();
  const months = getMonths();

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-4">
      <h1 className="text-2xl font-display font-bold">History</h1>

      {/* Month filter */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Filter by month</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterChip
            active={!filter.month}
            onClick={() => setFilter({ month: '' })}
            label="All"
          />
          {months.map(m => (
            <FilterChip key={m.value}
              active={filter.month === m.value}
              onClick={() => setFilter({ month: m.value })}
              label={m.label}
            />
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Filter by category</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterChip
            active={!filter.category}
            onClick={() => setFilter({ category: '' })}
            label="All 📋"
          />
          {ALL_CATEGORIES.map(key => {
            const cat = CATEGORIES[key];
            return (
              <FilterChip key={key}
                active={filter.category === key}
                onClick={() => setFilter({ category: key })}
                label={`${cat.icon} ${cat.label.split(' ')[0]}`}
              />
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm">{transactions.length} transactions</p>

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
            <TransactionCard key={t.id} transaction={t} onDelete={deleteTransaction} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-violet-500 text-white'
          : 'bg-[#18181f] text-gray-400 border border-white/5'
      }`}>
      {label}
    </button>
  );
}
