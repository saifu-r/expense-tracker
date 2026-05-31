import { useExpenses } from "../context/ExpenseContext";
import { CATEGORIES, formatCurrency } from "../utils/constants";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Charts() {
  const {
    allTransactions: transactions,
    // totalExpense,
    // totalIncome,
  } = useExpenses();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  // ── Pie data: group expenses by category ──
  const expenseByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      // acc[t.category] = (acc[t.category] || 0) + t.amount;
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([key, value]) => ({
    name: CATEGORIES[key]?.label || key,
    value,
    color: CATEGORIES[key]?.color || "#6b7280",
    icon: CATEGORIES[key]?.icon || "📦",
  }));

  // ── Bar data: income vs expense by month ──
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.slice(0, 7);
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    // acc[month][t.type] += t.amount;
    acc[month][t.type] += Number(t.amount);
    return acc;
  }, {});

  const barData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((d) => {
      // Fix: append -01 so date parsing works correctly in all browsers
      const [year, month] = d.month.split("-");
      const label = new Date(
        Number(year),
        Number(month) - 1,
        1,
      ).toLocaleDateString("en-BD", { month: "short", year: "2-digit" });
      return { ...d, month: label };
    });

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#18181f] border border-white/10 rounded-xl p-3 text-sm">
        <p className="font-bold text-white">{payload[0]?.name}</p>
        <p className="text-violet-300">{formatCurrency(payload[0]?.value)}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-6">
      <h1 className="text-2xl font-display font-bold">Analytics</h1>

      {/* Summary pills */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[#18181f] rounded-2xl p-4 border border-green-500/10">
          <p className="text-xs text-gray-400 mb-1">Total Income</p>
          <p className="font-display font-bold text-green-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="flex-1 bg-[#18181f] rounded-2xl p-4 border border-red-500/10">
          <p className="text-xs text-gray-400 mb-1">Total Expense</p>
          <p className="font-display font-bold text-red-400">
            {formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      {/* Expense breakdown pie */}
      {pieData.length > 0 && (
        <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5">
          <h2 className="font-display font-bold mb-4">Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs text-gray-400 truncate">
                  {d.icon} {d.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly bar chart */}
      {barData.length > 0 && (
        <div className="bg-[#18181f] rounded-3xl p-4 border border-white/5">
          <h2 className="font-display font-bold mb-4">Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ffffff08"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  "৳" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#ffffff08" }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span className="text-xs text-gray-400">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-orange-500" />
              <span className="text-xs text-gray-400">Expense</span>
            </div>
          </div>
        </div>
      )}

      {pieData.length === 0 && barData.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📊</p>
          <p>No data to chart yet</p>
          <p className="text-sm mt-1">Add some transactions first</p>
        </div>
      )}
    </div>
  );
}
