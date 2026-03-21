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
          <div key={i} className="rounded-xl p-4 h-24 animate-pulse" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }} />
        ))}
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    backgroundColor: "var(--bg-card-hover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div className="p-4 space-y-4">
      {budgets.length === 0 && !showForm ? (
        <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">💰</div>
          <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Budgets</h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Start with Budgets to have an efficient overview of your spending limits.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-[#3b82f6] hover:underline"
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
              <div key={budget.id} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>{budget.name}</h4>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Until {format(new Date(budget.periodEnd), "d MMM yyyy")}
                      {budget.category && ` · ${budget.category}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && <AlertTriangle size={14} className="text-[#ef4444]" />}
                    {isRisk && <AlertTriangle size={14} className="text-[#f97316]" />}
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: isOver ? "#ef4444" : "var(--text-primary)" }}>
                    {formatIDR(spent)} spent
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{formatIDR(budget.amount)}</span>
                </div>

                <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--bg-card-hover)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: isOver ? "#ef4444" : isRisk ? "#f97316" : "#3b82f6",
                    }}
                  />
                </div>

                {isOver && (
                  <p className="text-xs mt-1 text-[#ef4444]">
                    Over by {formatIDR(spent - budget.amount)}
                  </p>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[#3b82f6] text-sm transition-colors"
            style={{ border: "1px dashed var(--border)" }}
          >
            <Plus size={16} />
            Create budget
          </button>
        </>
      )}

      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid #3b82f6" }}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>New Budget</h4>
            <button onClick={() => setShowForm(false)} style={{ color: "var(--text-secondary)" }}>
              <X size={18} />
            </button>
          </div>

          <input style={inputStyle} placeholder="Budget name*" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div className="flex gap-2">
            <input type="number" style={{ ...inputStyle, width: "auto", flex: 1 }} placeholder="Amount*" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <select style={{ ...inputStyle, width: "auto" }} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option>IDR</option><option>USD</option><option>EUR</option>
            </select>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>Period (until)*</label>
            <input type="date" style={inputStyle} value={form.periodEnd} onChange={(e) => setForm({ ...form, periodEnd: e.target.value })} />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>Category (optional)</label>
            <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>Account (optional)</label>
            <select style={inputStyle} value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
              <option value="">All accounts</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
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
