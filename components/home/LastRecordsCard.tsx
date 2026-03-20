"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { formatIDR } from "@/lib/types";
import { getCategoryIcon } from "@/lib/categories";
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";

interface Props {
  transactions: Transaction[];
}

export default function LastRecordsCard({ transactions }: Props) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#e6edf3]">Last Records</h3>
        <Link href="/records" className="text-xs text-[#3b82f6] hover:underline">
          See all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-6 text-[#8b949e] text-sm">
          No transactions yet
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262d] transition-colors"
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-full bg-[#21262d] flex items-center justify-center text-base flex-shrink-0">
                {getCategoryIcon(tx.category)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e6edf3] truncate">
                  {tx.merchant || tx.category}
                </p>
                <p className="text-xs text-[#8b949e]">
                  {tx.subcategory || tx.category} ·{" "}
                  {format(new Date(tx.date), "d MMM")}
                </p>
              </div>

              {/* Amount + type */}
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
