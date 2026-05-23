import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function expenseReducer(state, action) {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, transactions: action.payload };
    case 'ADD':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE':
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    case 'RESET_FILTER':
      return { ...state, filter: { month: '', category: '', sort: 'date_desc' } };
    default:
      return state;
  }
}

const initialState = {
  transactions: [],
  filter: { month: '', category: '', sort: 'date_desc' },
};

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function getToken() {
    return localStorage.getItem('auth_token');
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    };
  }

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    fetch(`${API_URL}/transactions`, { headers: authHeaders() })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { dispatch({ type: 'SET_ALL', payload: data }); setLoading(false); })
      .catch(() => { setError('Could not connect to server.'); setLoading(false); });
  }, []);

  async function addTransaction(data) {
    const payload = { ...data, id: crypto.randomUUID() };
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save');
    const saved = await res.json();
    dispatch({ type: 'ADD', payload: saved });
  }

  async function updateTransaction(data) {
    const res = await fetch(`${API_URL}/transactions/${data.id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated = await res.json();
    dispatch({ type: 'UPDATE', payload: updated });
  }

  async function deleteTransaction(id) {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete');
    dispatch({ type: 'DELETE', payload: id });
  }

  function setFilter(filterData) {
    dispatch({ type: 'SET_FILTER', payload: filterData });
  }

  function resetFilter() {
    dispatch({ type: 'RESET_FILTER' });
  }

  const { transactions, filter } = state;

  // ── Filtered transactions (used in History & Charts) ──
  const filtered = transactions
    .filter(t => {
      const monthMatch = filter.month ? t.date.startsWith(filter.month) : true;
      const catMatch = filter.category ? t.category === filter.category : true;
      return monthMatch && catMatch;
    })
    .sort((a, b) => {
      switch (filter.sort) {
        case 'date_asc':    return new Date(a.date) - new Date(b.date);
        case 'amount_desc': return Number(b.amount) - Number(a.amount);
        case 'amount_asc':  return Number(a.amount) - Number(b.amount);
        default:            return new Date(b.date) - new Date(a.date);
      }
    });

  // ── Home uses ALL transactions (no filter) ──
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // ── Summary uses ALL transactions (no filter) ──
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance      = totalIncome - totalExpense;

  return (
    <ExpenseContext.Provider value={{
      transactions: filtered,
      allTransactions: transactions,
      recent,
      filter,
      totalIncome,
      totalExpense,
      balance,
      loading,
      error,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setFilter,
      resetFilter,
    }}>
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
        </div>
      ) : children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpenseContext);
}
