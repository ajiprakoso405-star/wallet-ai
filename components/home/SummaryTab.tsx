"use client";

import { useEffect, useState } from "react";
import BalanceTrendCard from "./BalanceTrendCard";
import CashflowCard from "./CashflowCard";
import ExpenseStructureCard from "./ExpenseStructureCard";
import LastRecordsCard from "./LastRecordsCard";
import type { Transaction, Account } from "@/lib/types";
import { subDays } from "date-fns";


export default function SummaryTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions?limit=2000").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]).then(([txData, acData]) => {
      setTransactions(txData.transactions || []);
      setAccounts(acData.accounts || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-4 h-48 animate-pulse" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }} />
        ))}
      </div>
    );
  }

  const today = new Date();
  const cutoff = subDays(today, 30);
  const recent = transactions.filter((t) => new Date(t.date) >= cutoff);

  const totalExpense = recent.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const expenseByCategory: Record<string, number> = {};
  recent
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
  const categoryData = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }));

  const lastFive = transactions.slice(0, 5);

  return (
    <div className="space-y-4 p-4">
      <BalanceTrendCard transactions={transactions} accounts={accounts} />
      <CashflowCard transactions={transactions} />
      <ExpenseStructureCard data={categoryData} total={totalExpense} />
      <LastRecordsCard transactions={lastFive} />
    </div>
  );
}
