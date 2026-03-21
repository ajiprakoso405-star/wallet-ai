"use client";

import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatIDR } from "@/lib/types";
import type { Transaction, Account } from "@/lib/types";
import { useChartColors } from "@/lib/useChartColors";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  subDays, subMonths, format, startOfMonth,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
} from "date-fns";

type Tab = "summary" | "account" | "currency";
type PeriodType = "1W" | "1M" | "3M" | "6M" | "1Y";

const PERIODS: { label: string; value: PeriodType }[] = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
];

const CURRENCY_COLORS: Record<string, string> = {
  IDR: "#3b82f6",
  USD: "#22c55e",
  EUR: "#f59e0b",
  SGD: "#a855f7",
  JPY: "#ec4899",
};

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  cash: "#22c55e",
  bank: "#3b82f6",
  ewallet: "#a855f7",
};

function getPeriodStart(period: PeriodType): Date {
  const today = new Date();
  switch (period) {
    case "1W": return subDays(today, 7);
    case "1M": return subMonths(today, 1);
    case "3M": return subMonths(today, 3);
    case "6M": return subMonths(today, 6);
    case "1Y": return subMonths(today, 12);
  }
}

function balanceAt(d: Date, currentBalance: number, transactions: Transaction[]): number {
  const adjustment = transactions
    .filter((t) => new Date(t.date) > d)
    .reduce((sum, t) => {
      if (t.type === "income") return sum - t.amount;
      if (t.type === "expense") return sum + t.amount;
      return sum;
    }, 0);
  return Math.max(0, currentBalance + adjustment);
}

function buildChartData(transactions: Transaction[], currentBalance: number, period: PeriodType) {
  const today = new Date();
  const start = getPeriodStart(period);

  if (period === "1W") {
    return eachDayOfInterval({ start, end: today }).map((d) => ({
      date: format(d, "EEE d"),
      balance: balanceAt(d, currentBalance, transactions),
    }));
  }
  if (period === "1M" || period === "3M") {
    return eachWeekOfInterval({ start, end: today }, { weekStartsOn: 1 }).map((w) => ({
      date: format(w, "MMM d"),
      balance: balanceAt(w, currentBalance, transactions),
    }));
  }
  return eachMonthOfInterval({ start: startOfMonth(start), end: today }).map((m) => ({
    date: period === "1Y" ? format(m, "MMM") : format(m, "MMM yy"),
    balance: balanceAt(m, currentBalance, transactions),
  }));
}

function BalanceChart({
  label,
  subtitle,
  currentBalance,
  transactions,
  period,
  color = "#3b82f6",
  formatAmount,
}: {
  label: string;
  subtitle?: string;
  currentBalance: number;
  transactions: Transaction[];
  period: PeriodType;
  color?: string;
  formatAmount?: (n: number) => string;
}) {
  const colors = useChartColors();
  const data = useMemo(
    () => buildChartData(transactions, currentBalance, period),
    [transactions, currentBalance, period]
  );

  const first = data[0]?.balance ?? 0;
  const last = data[data.length - 1]?.balance ?? 0;
  const isUp = last >= first;
  const diffPct = first > 0 ? Math.abs(((last - first) / first) * 100).toFixed(1) : "0.0";
  const fmt = formatAmount ?? formatIDR;
  const gradId = `grad-${label.replace(/\s+/g, "-")}`;

  return (
    <div
      className="rounded-2xl p-4 overflow-hidden relative"
      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />

      <p className="text-xs font-medium uppercase tracking-widest mb-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {subtitle && <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>}
      <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{fmt(currentBalance)}</p>
      <div className="flex items-center gap-1 mb-4">
        {isUp ? <TrendingUp size={12} color="#22c55e" /> : <TrendingDown size={12} color="#ef4444" />}
        <span className="text-xs font-medium" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>
          {isUp ? "+" : "-"}{diffPct}% this period
        </span>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8, color: colors.tooltipColor, fontSize: 12 }}
            formatter={(v: number) => [fmt(v), "Balance"]}
          />
          <Area type="monotone" dataKey="balance" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BalancePage() {
  const [tab, setTab] = useState<Tab>("summary");
  const [period, setPeriod] = useState<PeriodType>("1M");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/transactions?limit=500").then((r) => r.json()),
    ])
      .then(([accData, txData]) => {
        setAccounts(accData.accounts ?? []);
        setTransactions(txData.transactions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  // For "By Account" tab — filtered by selected account
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const filteredByAccount = useMemo(() => {
    if (selectedAccountId === "all") return { balance: totalBalance, txs: transactions };
    if (!selectedAccount) return { balance: 0, txs: [] };
    return {
      balance: selectedAccount.balance,
      txs: transactions.filter((t) => t.accountId === selectedAccountId),
    };
  }, [selectedAccountId, selectedAccount, totalBalance, transactions]);

  // For "By Currency" tab
  const accountsByCurrency = useMemo(() => {
    const map: Record<string, { balance: number; transactions: Transaction[] }> = {};
    for (const acc of accounts) {
      const cur = acc.currency;
      if (!map[cur]) map[cur] = { balance: 0, transactions: [] };
      map[cur].balance += acc.balance;
      map[cur].transactions.push(...transactions.filter((t) => t.accountId === acc.id));
    }
    return map;
  }, [accounts, transactions]);

  return (
    <AppLayout>
      {/* Sub-tab bar */}
      <div
        className="flex sticky top-0 z-10"
        style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
      >
        {(["summary", "account", "currency"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-sm font-medium transition-colors"
            style={{
              color: tab === t ? "var(--text-primary)" : "var(--text-secondary)",
              borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent",
            }}
          >
            {t === "summary" ? "Summary" : t === "account" ? "By Account" : "By Currency"}
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          Balance Trend
        </p>
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--bg-card-hover)" }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-2 py-0.5 text-xs rounded-md font-medium transition-all"
              style={{
                backgroundColor: period === p.value ? "#3b82f6" : "transparent",
                color: period === p.value ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>
        ) : tab === "summary" ? (
          <>
            {/* Total balance */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>Total Balance</p>
              <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{formatIDR(totalBalance)}</p>
            </div>

            {/* Breakdown by type */}
            {(["bank", "ewallet", "cash"] as const).map((type) => {
              const typeAccounts = accounts.filter((a) => a.type === type);
              if (typeAccounts.length === 0) return null;
              const typeBal = typeAccounts.reduce((s, a) => s + a.balance, 0);
              const labels = { cash: "Cash", bank: "Bank", ewallet: "E-Wallet" };
              const color = ACCOUNT_TYPE_COLORS[type];
              return (
                <div key={type} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  {/* Type header */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>{labels[type]}</p>
                    <p className="text-sm font-bold" style={{ color }}>{formatIDR(typeBal)}</p>
                  </div>
                  {/* Per-account rows */}
                  {typeAccounts.map((acc, idx) => (
                    <div
                      key={acc.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: acc.color + "20" }}
                      >
                        {acc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{acc.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{acc.currency}</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: acc.color }}>
                        {formatCurrency(acc.balance, acc.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}

            <BalanceChart
              label="Overall Balance"
              currentBalance={totalBalance}
              transactions={transactions}
              period={period}
              color="#3b82f6"
            />
          </>
        ) : tab === "account" ? (
          <>
            {/* Account filter dropdown */}
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Filter Account
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAccountId("all")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedAccountId === "all" ? "#3b82f6" : "var(--bg-card-hover)",
                    color: selectedAccountId === "all" ? "#ffffff" : "var(--text-secondary)",
                    border: `1px solid ${selectedAccountId === "all" ? "#3b82f6" : "var(--border)"}`,
                  }}
                >
                  All Accounts
                </button>
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                    style={{
                      backgroundColor: selectedAccountId === acc.id ? (ACCOUNT_TYPE_COLORS[acc.type] + "20") : "var(--bg-card-hover)",
                      color: selectedAccountId === acc.id ? ACCOUNT_TYPE_COLORS[acc.type] : "var(--text-secondary)",
                      border: `1px solid ${selectedAccountId === acc.id ? ACCOUNT_TYPE_COLORS[acc.type] : "var(--border)"}`,
                    }}
                  >
                    <span>{acc.icon}</span>
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>

            {accounts.length === 0 ? (
              <div className="text-center py-16 text-sm" style={{ color: "var(--text-secondary)" }}>No accounts yet</div>
            ) : (
              <BalanceChart
                label={selectedAccountId === "all" ? "All Accounts" : (selectedAccount?.name ?? "Account")}
                subtitle={selectedAccountId !== "all" && selectedAccount ? `${selectedAccount.type.charAt(0).toUpperCase() + selectedAccount.type.slice(1)} · ${selectedAccount.currency}` : undefined}
                currentBalance={filteredByAccount.balance}
                transactions={filteredByAccount.txs}
                period={period}
                color={selectedAccountId === "all" ? "#3b82f6" : (ACCOUNT_TYPE_COLORS[selectedAccount?.type ?? "bank"] ?? "#3b82f6")}
                formatAmount={selectedAccount ? (n) => formatCurrency(n, selectedAccount.currency) : undefined}
              />
            )}

            {/* Balance summary per account */}
            {accounts.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <p className="px-4 pt-3 pb-2 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Account Balances</p>
                {accounts.map((acc, idx) => (
                  <div
                    key={acc.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: idx > 0 ? "1px solid var(--border)" : "none" }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: acc.color + "20" }}
                    >
                      {acc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{acc.name}</p>
                      <p className="text-xs capitalize" style={{ color: "var(--text-secondary)" }}>{acc.type} · {acc.currency}</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: ACCOUNT_TYPE_COLORS[acc.type] ?? "var(--text-primary)" }}>
                      {formatCurrency(acc.balance, acc.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // By Currency tab
          Object.keys(accountsByCurrency).length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: "var(--text-secondary)" }}>No accounts yet</div>
          ) : (
            Object.entries(accountsByCurrency).map(([cur, data]) => (
              <BalanceChart
                key={cur}
                label={`Balance in ${cur}`}
                currentBalance={data.balance}
                transactions={data.transactions}
                period={period}
                color={CURRENCY_COLORS[cur] ?? "#6366f1"}
                formatAmount={(n) => formatCurrency(n, cur)}
              />
            ))
          )
        )}
      </div>
    </AppLayout>
  );
}
