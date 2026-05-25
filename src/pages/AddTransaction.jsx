import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import { useToast } from "../components/Toast";
import {
  CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../utils/constants";

export default function AddTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addTransaction } = useExpenses();
  const { showToast } = useToast();

  const [type, setType] = useState(searchParams.get("type") || "expense");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: type === "income" ? "salary" : "food",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [receipt, setReceipt] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleTypeChange(newType) {
    setType(newType);
    setForm((prev) => ({
      ...prev,
      category: newType === "income" ? "salary" : "food",
    }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError("Please enter a title.");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError("Please enter a valid amount.");
    if (navigator.vibrate) navigator.vibrate(40);
    setLoading(true);

    // Step 1 — Save transaction
    let saved;
    try {
      saved = await addTransaction({
        ...form,
        type,
        amount: Number(form.amount),
      });
    } catch (err) {
      console.error("Transaction error:", err);
      setError("Failed to save transaction. Try again.");
      setLoading(false);
      return; // ← stop here, don't continue
    }

    // Step 2 — Upload receipt (separate try/catch)
    if (receipt && saved?.id) {
      try {
        const formData = new FormData();
        formData.append("receipt", receipt);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/transactions/${saved.id}/receipts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              Accept: "application/json",
            },
            body: formData,
          },
        );
        if (!res.ok) {
          const data = await res.json();
          console.error("Receipt error:", data);
          showToast("Transaction saved but receipt failed to upload", "error");
        }
      } catch (err) {
        console.error("Receipt upload error:", err);
        showToast("Transaction saved but receipt failed to upload", "error");
      }
    }

    // Step 3 — Always navigate after transaction is saved
    showToast("Transaction saved!");
    navigate("/");
  }

  return (
    <div className="flex flex-col p-4 pb-28 pt-6 gap-5">
      <h1 className="text-2xl font-display font-bold">Add Transaction</h1>

      {/* Type toggle */}
      <div className="flex gap-2 bg-[#18181f] p-1 rounded-2xl">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm capitalize transition-all ${
              type === t
                ? t === "expense"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  : "bg-green-500 text-white shadow-lg shadow-green-500/20"
                : "text-gray-400"
            }`}
          >
            {t === "expense" ? "↓ Expense" : "↑ Income"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Lunch, Salary..."
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">
            Amount (৳)
          </label>
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors text-xl font-display font-bold"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {cats.map((key) => {
              const cat = CATEGORIES[key];
              return (
                <button
                  key={key}
                  onClick={() => setForm((p) => ({ ...p, category: key }))}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all text-xs ${
                    form.category === key
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-white/5 bg-[#18181f] text-gray-400"
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="truncate w-full text-center">
                    {cat.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Date</label>
          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">
            Note (optional)
          </label>
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Add a note..."
            className="w-full bg-[#18181f] border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">
            Receipt / Proof (optional)
          </label>
          <label className="w-full flex flex-col items-center gap-2 py-4 rounded-2xl border border-dashed border-white/10 bg-[#18181f] cursor-pointer active:scale-95 transition-transform">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setReceipt(e.target.files[0])}
            />
            {receipt ? (
              <div className="flex items-center gap-2 text-violet-400">
                <span className="text-xl">📎</span>
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {receipt.name}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setReceipt(null);
                  }}
                  className="text-gray-500 hover:text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span className="text-2xl">📷</span>
                <span className="text-sm text-gray-500">
                  Tap to attach receipt
                </span>
                <span className="text-xs text-gray-600">
                  JPG, PNG or PDF • Max 5MB
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-display font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 active:scale-95 transition-transform disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Transaction"}
      </button>
    </div>
  );
}
