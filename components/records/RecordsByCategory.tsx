"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import { getCategoryIcon, getCategoryColor } from "@/lib/categories";
import { format } from "date-fns";

const TIME_FILTERS = [
  { label: "1 month", value: "30d" },
  { label: "3 months", value: "90d" },
  { label: "6 months", value: "180d" },
  { label: "1 year", value: "365d" },
  { label: "All time", value: "all" },
];

export default function RecordsByCategory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("30d");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/transactions?limit=500&period=${timeFilter}`)
      .then((r) => r.json())
      .then((d) => {
        setTransactions(d.transactions || []);
        setLoading(false);
      });
  }, [timeFilter]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const byCategory: Record<string, { transactions: Transaction[]; total: number }> = {};
  transactions.forEach((tx) => {
    if (!byCategory[tx.category]) {
      byCategory[tx.category] = { transactions: [], total: 0 };
    }
    byCategory[tx.category].transactions.push(tx);
    if (tx.type === "expense") byCategory[tx.category].total += tx.amount;
    else if (tx.type === "income") byCategory[tx.category].total -= tx.amount;
  });

  const sorted = Object.entries(byCategory).sort(
    (a, b) => Math.abs(b[1].total) - Math.abs(a[1].total)
  );

  return (
    <div>
      <div className="p-4 sticky top-0 z-10" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}>
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg h-16 animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>
          <p className="text-4xl mb-3">📊</p>
          <p>No transactions in this period</p>
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {sorted.map(([category, { transactions: txs, total }]) => {
            const isExpanded = expandedCategories.has(category);
            const color = getCategoryColor(category);
            const icon = getCategoryIcon(category);
            const mainAmount = txs.reduce((s, t) => {
              return t.type === "expense" ? s + t.amount : t.type === "income" ? s - t.amount : s;
            }, 0);

            return (
              <div key={category} className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <button
                  className="w-full flex items-center gap-3 p-4 transition-colors"
                  onClick={() => toggleCategory(category)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: color + "22" }}
                  >
                    {icon}
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{category}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{txs.length} transactions</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: mainAmount > 0 ? "var(--accent-red)" : "var(--accent-green)" }}>
                      {mainAmount > 0 ? "-" : "+"}
                      {formatIDR(Math.abs(mainAmount))}
                    </p>
                  </div>

                  <div style={{ color: "var(--text-secondary)" }} className="ml-1">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {txs.map((tx, idx) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                        style={{ borderTop: idx > 0 ? `1px solid var(--border)` : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                            {tx.merchant || tx.subcategory || tx.category}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {format(new Date(tx.date), "d MMM yyyy")}
                            {tx.location && ` · ${tx.location}`}
                          </p>
                        </div>
                        <p
                          className="text-sm font-medium flex-shrink-0"
                          style={{ color: tx.type === "income" ? "var(--accent-green)" : "var(--accent-red)" }}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatIDR(tx.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
