"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatIDR } from "@/lib/types";
import { getCategoryColor } from "@/lib/categories";
import { useChartColors } from "@/lib/useChartColors";

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
    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Expenses Structure</h3>
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
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getCategoryColor(entry.name)}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: colors.tooltipBg,
                  border: `1px solid ${colors.tooltipBorder}`,
                  borderRadius: 8,
                  color: colors.tooltipColor,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatIDR(v), ""]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-2 min-w-0">
            {data.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: getCategoryColor(item.name) }}
                />
                <span className="text-xs truncate flex-1" style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                <span className="text-xs font-medium flex-shrink-0" style={{ color: "var(--text-primary)" }}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
