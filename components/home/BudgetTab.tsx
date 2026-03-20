"use client";

import { useEffect, useState } from "react";
import { Plus, X, Check, AlertTriangle } from "lucide-react";
import type { Budget, Account } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";

export default function BudgetTab() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [spendingMap, setSpendingMap] = useState<Record<string, number>>({});

  // New budget form state
  const [form, setForm] = useState({
    name: "",
    amount: "",
    currency: "IDR",
    periodEnd: "",
    category: "",
    accountId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [budgetRes, accRes, txRes] = await Promise.all([
      fetch("/api/budgets").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/transactions?limit=500").then((r) => r.json()),
    ]);
    setBudgets(budgetRes.budgets || []);
    setAccounts(accRes.accounts || []);

    // Calculate spending per budget
    const transactions = txRes.transactions || [];
    const now = new Date();
    const spending: Record<string, number> = {};
    (budgetRes.budgets || []).forEach((b: Budget) => {
      const start = new Date(b.periodStart);
      const end = new Date(b.periodEnd);
      const relevant = transactions.filter((t: any) => {
        const d = new Date(t.date);
        const inPeriod = d >= start && d <= end && d <= now;
        const matchCat = !b.category || t.category === b.category;
        const matchAcc = !b.accountId || t.accountId === b.accountId;
        return inPeriod && matchCat && matchAcc && t.type === "expense";
      });
      spending[b.id] = relevant.reduce((s: number, t: any) => s + t.amount, 0);
    });
    setSpendingMap(spending);
    setLoading(false);
  }

  async function createBudget() {
    if (!form.name || !form.amount || !form.periodEnd) return;
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount),
        periodStart: new Date().toISOString(),
      }),
    });
    setForm({ name: "", amount: "", currency: "IDR", periodEnd: "", category: "", accountId: "" });
    setShowForm(false);
    loadData();
  }

  async function deleteBudget(id: string) {
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Budget list */}
      {budgets.length === 0 && !showForm ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="text-[#e6edf3] font-semibold mb-1">Budgets</h3>
          <p className="text-[#8b949e] text-sm mb-4">
            Start with Budgets to have an efficient overview of your spending limits.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-[#3b82f6] text-sm font-medium hover:underline"
          >
            Create budget
          </button>
        </div>
      ) : (
        <>
          {budgets.map((budget) => {
            const spent = spendingMap[budget.id] || 0;
            const percent = Math.min((spent / budget.amount) * 100, 100);
            const isOver = spent > budget.amount;
            const isRisk = percent >= 80 && !isOver;

            return (
              <div key={budget.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-[#e6edf3] font-semibold">{budget.name}</h4>
                    <p className="text-xs text-[#8b949e]">
                      Until {format(new Date(budget.periodEnd), "d MMM yyyy")}
                      {budget.category && ` · ${budget.category}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && <AlertTriangle size={14} className="text-[#f85149]" />}
                    {isRisk && <AlertTriangle size={14} className="text-[#f97316]" />}
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="text-[#8b949e] hover:text-[#f85149]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-1.5">
                  <span className={isOver ? "text-[#f85149]" : "text-[#e6edf3]"}>
                    {formatIDR(spent)} spent
                  </span>
                  <span className="text-[#8b949e]">{formatIDR(budget.amount)}</span>
                </div>

                <div className="w-full bg-[#21262d] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isOver ? "bg-[#f85149]" : isRisk ? "bg-[#f97316]" : "bg-[#3b82f6]"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {isOver && (
                  <p className="text-xs text-[#f85149] mt-1">
                    Over by {formatIDR(spent - budget.amount)}
                  </p>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#30363d] rounded-xl text-[#3b82f6] hover:bg-[#161b22] text-sm transition-colors"
          >
            <Plus size={16} />
            Create budget
          </button>
        </>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-[#161b22] border border-[#3b82f6] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[#e6edf3] font-semibold">New Budget</h4>
            <button onClick={() => setShowForm(false)} className="text-[#8b949e] hover:text-[#e6edf3]">
              <X size={18} />
            </button>
          </div>

          <input
            className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6]"
            placeholder="Budget name*"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6]"
              placeholder="Amount*"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <select
              className="bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#3b82f6]"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option>IDR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Period (until)*</label>
            <input
              type="date"
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#3b82f6]"
              value={form.periodEnd}
              onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Category (optional)</label>
            <select
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#3b82f6]"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Account (optional)</label>
            <select
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#3b82f6]"
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            >
              <option value="">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={createBudget}
            className="w-full bg-[#1f6feb] hover:bg-[#388bfd] text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Save Budget
          </button>
        </div>
      )}
    </div>
  );
}
