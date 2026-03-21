"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatIDR } from "@/lib/types";
import { getCategoryColor } from "@/lib/categories";
import { useChartColors } from "@/lib/useChartColors";
import { PieChart as PieIcon, ArrowRight } from "lucide-react";

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

interface Props {
  data: CategoryData[];
  total: number;
}

export default function ExpenseStructureCard({ data, total }: Props) {
  const colors = useChartColors();

  return (
    <div className="rounded-2xl p-4 overflow-hidden relative" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-transparent" />

      <div className="flex items-center gap-2 mb-1">
        <PieIcon size={14} style={{ color: "var(--text-secondary)" }} />
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Expenses Structure</p>
      </div>
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>LAST 30 DAYS</p>
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{formatIDR(total)}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8" style={{ color: "var(--text-secondary)" }}>
          <div className="w-20 h-20 rounded-full border-4 border-dashed mb-3" style={{ borderColor: "var(--border)" }} />
          <p className="text-sm">No expenses yet</p>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="amount">
                  {data.map((entry, index) => (
                    <Cell key={index} fill={getCategoryColor(entry.name)} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 8, color: colors.tooltipColor, fontSize: 12 }}
                  formatter={(v: number) => [formatIDR(v), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {data.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: getCategoryColor(item.name) }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                    <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: "var(--text-primary)" }}>{item.percentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-1" style={{ backgroundColor: "var(--bg-card-hover)" }}>
                    <div className="h-1 rounded-full transition-all" style={{ width: `${item.percentage}%`, backgroundColor: getCategoryColor(item.name) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <Link href="/records" className="flex items-center justify-center gap-1 text-xs font-medium text-[#3b82f6] hover:underline">
          Selengkapnya <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
