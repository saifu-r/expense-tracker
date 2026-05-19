import { createContext, useContext, useReducer, useEffect, useState } from 'react';

// ── Change this to your real Laravel API URL when deployed ──
// const API_URL = 'http://127.0.0.1:8000/api';
// e.g: const API_URL = 'https://api.yoursite.com/api';

const API_URL = 'https://et.rimlobd.com/api';

// this is nothing

function expenseReducer(state, action) {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, transactions: action.payload };
    case 'ADD':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'DELETE':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    default:
      return state;
  }
}

const initialState = {
  transactions: [],
  filter: { month: '', category: '' },
};

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Load all transactions from Laravel API on app start ──
  // This is like ngOnInit in Angular
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/transactions`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        dispatch({ type: 'SET_ALL', payload: data });
        setLoading(false);
      })
      .catch(err => {
        setError('Could not connect to server.');
        setLoading(false);
      });
  }, []);

  // ── Add transaction — POST to API ──
  async function addTransaction(data) {
    const payload = { ...data, id: crypto.randomUUID() };
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      const saved = await res.json();
      dispatch({ type: 'ADD', payload: saved });
    } catch (err) {
      alert('Failed to save transaction. Check your connection.');
    }
  }

  // ── Delete transaction — DELETE to API ──
  async function deleteTransaction(id) {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      dispatch({ type: 'DELETE', payload: id });
    } catch (err) {
      alert('Failed to delete transaction. Check your connection.');
    }
  }

  function setFilter(filterData) {
    dispatch({ type: 'SET_FILTER', payload: filterData });
  }

  // ── Derived values ──
  const { transactions, filter } = state;

  const filtered = transactions.filter(t => {
    const monthMatch = filter.month ? t.date.startsWith(filter.month) : true;
    const catMatch   = filter.category ? t.category === filter.category : true;
    return monthMatch && catMatch;
  });

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance      = totalIncome - totalExpense;

  return (
    <ExpenseContext.Provider value={{
      transactions: filtered,
      allTransactions: transactions,
      filter,
      totalIncome,
      totalExpense,
      balance,
      loading,
      error,
      addTransaction,
      deleteTransaction,
      setFilter,
    }}>
      {/* Show loading screen while fetching from API */}
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse" />
          <p className="text-gray-400 text-sm">Loading your finances...</p>
        </div>
      ) : error ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-4xl">⚠️</p>
          <p className="text-white font-bold">Connection Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs">Make sure your Laravel API is running</p>
        </div>
      ) : (
        children
      )}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpenseContext);
}
