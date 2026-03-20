"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import SummaryTab from "@/components/home/SummaryTab";
import BudgetTab from "@/components/home/BudgetTab";

type Tab = "summary" | "budget";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("summary");

  return (
    <AppLayout>
      {/* Tab bar */}
      <div className="flex border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-10">
        <button
          onClick={() => setTab("summary")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "summary"
              ? "text-[#e6edf3] border-b-2 border-[#3b82f6]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setTab("budget")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "budget"
              ? "text-[#e6edf3] border-b-2 border-[#3b82f6]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          Budget
        </button>
      </div>

      {tab === "summary" ? <SummaryTab /> : <BudgetTab />}
    </AppLayout>
  );
}
