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
      <div className="flex sticky top-0 z-10" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}>
        <button
          onClick={() => setTab("summary")}
          className="flex-1 py-3 text-sm font-medium transition-colors"
          style={{
            color: tab === "summary" ? "var(--text-primary)" : "var(--text-secondary)",
            borderBottom: tab === "summary" ? "2px solid #3b82f6" : "2px solid transparent",
          }}
        >
          Summary
        </button>
        <button
          onClick={() => setTab("budget")}
          className="flex-1 py-3 text-sm font-medium transition-colors"
          style={{
            color: tab === "budget" ? "var(--text-primary)" : "var(--text-secondary)",
            borderBottom: tab === "budget" ? "2px solid #3b82f6" : "2px solid transparent",
          }}
        >
          Budget
        </button>
      </div>

      {tab === "summary" ? <SummaryTab /> : <BudgetTab />}
    </AppLayout>
  );
}
