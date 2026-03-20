"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatIDR } from "@/lib/types";
import { getCategoryColor } from "@/lib/categories";

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
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#e6edf3]">Expenses Structure</h3>
      </div>
      <div className="mb-3">
        <p className="text-xs text-[#8b949e] uppercase tracking-wide">LAST 30 DAYS</p>
        <p className="text-2xl font-bold text-[#e6edf3]">{formatIDR(total)}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-[#8b949e]">
          <div className="w-20 h-20 rounded-full border-4 border-[#30363d] border-dashed mb-3" />
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
                paddingAngle={0}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getCategoryColor(entry.name)}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1c2128",
                  border: "1px solid #30363d",
                  borderRadius: 8,
                  color: "#e6edf3",
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatIDR(v), ""]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-1.5 min-w-0">
            {data.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: getCategoryColor(item.name) }}
                />
                <span className="text-xs text-[#8b949e] truncate flex-1">{item.name}</span>
                <span className="text-xs text-[#e6edf3] flex-shrink-0">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
