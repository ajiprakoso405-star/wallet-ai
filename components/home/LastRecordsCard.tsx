"use client";

import Link from "next/link";
import { formatIDR } from "@/lib/types";
import { getCategoryIcon, getCategoryColor } from "@/lib/categories";
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

interface Props {
  transactions: Transaction[];
}

export default function LastRecordsCard({ transactions }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#22c55e] via-[#3b82f6] to-transparent" />

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Last Records</p>
        <Link href="/records" className="flex items-center gap-1 text-xs font-medium text-[#3b82f6] hover:underline">
          See all <ArrowRight size={12} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          No transactions yet
        </div>
      ) : (
        <div>
          {transactions.map((tx, idx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors"
              style={{ borderTop: idx > 0 ? `1px solid var(--border)` : "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: getCategoryColor(tx.category) + "20" }}
              >
                {getCategoryIcon(tx.category)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {tx.merchant || tx.category}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {tx.subcategory || tx.category} · {format(new Date(tx.date), "d MMM")}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: tx.type === "income" ? "var(--accent-green)" : tx.type === "expense" ? "var(--accent-red)" : "var(--text-secondary)" }}
                >
                  {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                  {formatIDR(tx.amount)}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{tx.account?.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        <Link href="/records" className="flex items-center justify-center gap-2 text-sm font-medium text-[#3b82f6] hover:underline">
          Add new record <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
