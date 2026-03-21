"use client";

import { useEffect, useState } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { Search } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import { getCategoryIcon, getCategoryColor } from "@/lib/categories";

const TIME_FILTERS = [
  { label: "All time", value: "all" },
  { label: "Today", value: "1d" },
  { label: "1 week", value: "7d" },
  { label: "1 month", value: "30d" },
  { label: "3 months", value: "90d" },
  { label: "6 months", value: "180d" },
  { label: "1 year", value: "365d" },
];

function groupByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    let label: string;
    if (isToday(d)) label = "Today";
    else if (isYesterday(d)) label = "Yesterday";
    else if (isThisWeek(d)) label = format(d, "EEEE");
    else label = format(d, "d MMMM yyyy");

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
}

export default function RecordsByTime() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    fetch(`/api/transactions?limit=500&period=${timeFilter}`)
      .then((r) => r.json())
      .then((d) => {
        setTransactions(d.transactions || []);
        setLoading(false);
      });
  }, [timeFilter]);

  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.category?.toLowerCase().includes(q) ||
      t.merchant?.toLowerCase().includes(q) ||
      t.note?.toLowerCase().includes(q) ||
      t.subcategory?.toLowerCase().includes(q)
    );
  });

  const groups = groupByDate(filtered);

  return (
    <div>
      <div className="p-4 space-y-3 sticky top-0 z-10" style={{ backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border)" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          <input
            className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: timeFilter === f.value ? "#3b82f6" : "var(--bg-card-hover)",
                color: timeFilter === f.value ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg h-16 animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />
          ))}
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
          <p className="text-4xl mb-3">📭</p>
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {Object.entries(groups).map(([dateLabel, txs]) => {
            const dayTotal = txs.reduce((s, t) => {
              if (t.type === "income") return s + t.amount;
              if (t.type === "expense") return s - t.amount;
              return s;
            }, 0);

            return (
              <div key={dateLabel}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                    {dateLabel}
                  </span>
                  <span className="text-xs font-medium" style={{ color: dayTotal >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                    {dayTotal >= 0 ? "+" : ""}
                    {formatIDR(dayTotal)}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  {txs.map((tx, idx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 transition-colors"
                      style={{ borderTop: idx > 0 ? `1px solid var(--border)` : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: getCategoryColor(tx.category) + "22" }}
                      >
                        {getCategoryIcon(tx.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {tx.merchant || tx.category}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                          {tx.subcategory || tx.category}
                          {tx.location && ` · ${tx.location}`}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: tx.type === "income" ? "var(--accent-green)" : tx.type === "expense" ? "var(--accent-red)" : "var(--text-secondary)",
                          }}
                        >
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatIDR(tx.amount)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{tx.account?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
