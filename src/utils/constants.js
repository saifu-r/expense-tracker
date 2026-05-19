export const CATEGORIES = {
  // Expense categories
  food:          { label: 'Food & Dining',   icon: '🍜', color: '#f97316' },
  housing:       { label: 'Housing',         icon: '🏠', color: '#8b5cf6' },
  transport:     { label: 'Transport',       icon: '🚌', color: '#3b82f6' },
  utilities:     { label: 'Utilities',       icon: '💡', color: '#eab308' },
  health:        { label: 'Health',          icon: '💊', color: '#ef4444' },
  entertainment: { label: 'Entertainment',   icon: '🎮', color: '#ec4899' },
  shopping:      { label: 'Shopping',        icon: '🛍️', color: '#14b8a6' },
  education:     { label: 'Education',       icon: '📚', color: '#6366f1' },
  other:         { label: 'Other',           icon: '📦', color: '#6b7280' },
  // Income categories
  salary:        { label: 'Salary',          icon: '💼', color: '#22c55e' },
  freelance:     { label: 'Freelance',       icon: '💻', color: '#10b981' },
  investment:    { label: 'Investment',      icon: '📈', color: '#06b6d4' },
  gift:          { label: 'Gift',            icon: '🎁', color: '#a855f7' },
};

export const EXPENSE_CATEGORIES = ['food','housing','transport','utilities','health','entertainment','shopping','education','other'];
export const INCOME_CATEGORIES  = ['salary','freelance','investment','gift','other'];

export function formatCurrency(amount) {
  return '৳ ' + amount.toLocaleString('en-BD');
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-BD', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}
