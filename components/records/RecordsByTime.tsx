"use client";

import { useEffect, useState } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { Search, Filter } from "lucide-react";
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
      {/* Search + filter */}
      <div className="p-4 space-y-3 sticky top-0 bg-[#0d1117] z-10 border-b border-[#30363d]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-9 pr-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6]"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                timeFilter === f.value
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-[#161b22] rounded-lg h-16 animate-pulse" />
          ))}
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="text-center py-12 text-[#8b949e]">
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
                  <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">
                    {dateLabel}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      dayTotal >= 0 ? "text-[#3fb950]" : "text-[#f85149]"
                    }`}
                  >
                    {dayTotal >= 0 ? "+" : ""}
                    {formatIDR(dayTotal)}
                  </span>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                  {txs.map((tx, idx) => (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-3 p-3 hover:bg-[#21262d] transition-colors ${
                        idx > 0 ? "border-t border-[#30363d]" : ""
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: getCategoryColor(tx.category) + "22" }}
                      >
                        {getCategoryIcon(tx.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#e6edf3] truncate">
                          {tx.merchant || tx.category}
                        </p>
                        <p className="text-xs text-[#8b949e] truncate">
                          {tx.subcategory || tx.category}
                          {tx.location && ` · ${tx.location}`}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm font-semibold ${
                            tx.type === "income"
                              ? "text-[#3fb950]"
                              : tx.type === "expense"
                              ? "text-[#f85149]"
                              : "text-[#8b949e]"
                          }`}
                        >
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatIDR(tx.amount)}
                        </p>
                        <p className="text-xs text-[#8b949e]">{tx.account?.name}</p>
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
