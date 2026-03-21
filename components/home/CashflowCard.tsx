"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatIDR } from "@/lib/types";
import type { Transaction } from "@/lib/types";
import { useChartColors } from "@/lib/useChartColors";
import { subDays, subMonths, format, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

interface Props {
  transactions: Transaction[];
}

type TabType = "cashflow" | "expense" | "income";
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

function getPeriodLabel(period: PeriodType): string {
  switch (period) {
    case "1W": return "LAST 7 DAYS";
    case "1M": return "LAST 30 DAYS";
    case "3M": return "LAST 3 MONTHS";
    case "6M": return "LAST 6 MONTHS";
    case "1Y": return "LAST 12 MONTHS";
  }
}

function buildChartData(transactions: Transaction[], period: PeriodType) {
  const today = new Date();
  const start = getPeriodStart(period);

  const filtered = transactions.filter(
    (t) => new Date(t.date) >= start && new Date(t.date) <= today
  );

  if (period === "1W") {
    const days = eachDayOfInterval({ start, end: today });
    return days.map((d) => {
      const label = format(d, "EEE d");
      const dayTx = filtered.filter(
        (t) => format(new Date(t.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")
      );
      const income = dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { date: label, income, expense, cashflow: income - expense };
    });
  }

  if (period === "1M" || period === "3M") {
    const weeks = eachWeekOfInterval({ start, end: today }, { weekStartsOn: 1 });
    return weeks.map((wStart) => {
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);
      const label = format(wStart, "MMM d");
      const weekTx = filtered.filter(
        (t) => new Date(t.date) >= wStart && new Date(t.date) <= wEnd
      );
      const income = weekTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = weekTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { date: label, income, expense, cashflow: income - expense };
    });
  }

  const months = eachMonthOfInterval({ start: startOfMonth(start), end: today });
  return months.map((mStart) => {
    const label = period === "1Y" ? format(mStart, "MMM") : format(mStart, "MMM yy");
    const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0);
    const monthTx = filtered.filter(
      (t) => new Date(t.date) >= mStart && new Date(t.date) <= mEnd
    );
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { date: label, income, expense, cashflow: income - expense };
  });
}

export default function CashflowCard({ transactions }: Props) {
  const [tab, setTab] = useState<TabType>("cashflow");
  const [period, setPeriod] = useState<PeriodType>("1M");
  const colors = useChartColors();

  const chartData = useMemo(() => buildChartData(transactions, period), [transactions, period]);

  const periodTx = useMemo(() => {
    const start = getPeriodStart(period);
    return transactions.filter((t) => new Date(t.date) >= start);
  }, [transactions, period]);

  const totalIncome = periodTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = periodTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalCashflow = totalIncome - totalExpense;

  const tabConfig = {
    cashflow: { key: "cashflow", color: "#3b82f6", total: totalCashflow },
    expense: { key: "expense", color: "#ef4444", total: totalExpense },
    income: { key: "income", color: "#22c55e", total: totalIncome },
  };

  const current = tabConfig[tab];

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Period to Period Comparison</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-2 py-0.5 text-xs rounded font-medium transition-colors"
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
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>{getPeriodLabel(period)}</p>
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{formatIDR(current.total)}</p>
      </div>

      <div className="flex gap-2 mb-3 rounded-lg p-1" style={{ backgroundColor: "var(--bg-card-hover)" }}>
        {(["cashflow", "expense", "income"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize"
            style={{
              backgroundColor: tab === t ? "#3b82f6" : "transparent",
              color: tab === t ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            {t === "cashflow" ? "Cash Flow" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: colors.tickFill, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 8,
              color: colors.tooltipColor,
              fontSize: 12,
            }}
            formatter={(v: number) => [formatIDR(v), tab]}
          />
          <Line
            type="monotone"
            dataKey={current.key}
            stroke={current.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: current.color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
