"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatIDR } from "@/lib/types";
import type { Transaction, Account } from "@/lib/types";
import { useChartColors } from "@/lib/useChartColors";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  subDays, subMonths, format, startOfMonth,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
} from "date-fns";

interface Props {
  transactions: Transaction[];
  accounts: Account[];
}

type PeriodType = "1W" | "1M" | "3M" | "6M" | "1Y";

const PERIODS: { label: string; value: PeriodType }[] = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
];

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

export default function BalanceTrendCard({ transactions, accounts }: Props) {
  const [period, setPeriod] = useState<PeriodType>("1M");
  const colors = useChartColors();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const data = useMemo(() => buildChartData(transactions, totalBalance, period), [transactions, totalBalance, period]);

  const first = data[0]?.balance ?? 0;
  const last = data[data.length - 1]?.balance ?? 0;
  const isUp = last >= first;
  const diffPct = first > 0 ? Math.abs(((last - first) / first) * 100).toFixed(1) : "0.0";

  return (
    <div className="rounded-2xl p-4 overflow-hidden relative" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-transparent" />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>Balance Trend</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{formatIDR(totalBalance)}</p>
          <div className="flex items-center gap-1 mt-1">
            {isUp ? <TrendingUp size={12} color="#22c55e" /> : <TrendingDown size={12} color="#ef4444" />}
            <span className="text-xs font-medium" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>
              {isUp ? "+" : "-"}{diffPct}% this period
            </span>
          </div>
        </div>
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

      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8, color: colors.tooltipColor, fontSize: 12 }}
            formatter={(v: number) => [formatIDR(v), "Balance"]}
          />
          <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} fill="url(#balanceGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <Link href="/balance" className="flex items-center justify-center gap-1 text-xs font-medium text-[#3b82f6] hover:underline">
          Selengkapnya <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
