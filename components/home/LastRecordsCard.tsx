"use client";

import Link from "next/link";
import { formatIDR } from "@/lib/types";
import { getCategoryIcon } from "@/lib/categories";
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";

interface Props {
  transactions: Transaction[];
}

export default function LastRecordsCard({ transactions }: Props) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Last Records</h3>
        <Link href="/records" className="text-xs text-[#3b82f6] hover:underline">
          See all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          No transactions yet
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-2 rounded-lg transition-colors"
              style={{ cursor: "default" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: "var(--bg-card-hover)" }}>
                {getCategoryIcon(tx.category)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {tx.merchant || tx.category}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {tx.subcategory || tx.category} ·{" "}
                  {format(new Date(tx.date), "d MMM")}
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
      )}

      <Link
        href="/records"
        className="block mt-3 text-center text-sm text-[#3b82f6] hover:underline"
      >
        Add Record
      </Link>
    </div>
  );
}
