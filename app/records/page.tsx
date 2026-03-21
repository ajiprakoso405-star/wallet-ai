"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import RecordsByTime from "@/components/records/RecordsByTime";
import RecordsByCategory from "@/components/records/RecordsByCategory";

type Tab = "time" | "category";

export default function RecordsPage() {
  const [tab, setTab] = useState<Tab>("time");

  return (
    <AppLayout>
      <div className="flex sticky top-0 z-10" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}>
        <button
          onClick={() => setTab("time")}
          className="flex-1 py-3 text-sm font-medium transition-colors"
          style={{
            color: tab === "time" ? "var(--text-primary)" : "var(--text-secondary)",
            borderBottom: tab === "time" ? "2px solid #3b82f6" : "2px solid transparent",
          }}
        >
          By Time
        </button>
        <button
          onClick={() => setTab("category")}
          className="flex-1 py-3 text-sm font-medium transition-colors"
          style={{
            color: tab === "category" ? "var(--text-primary)" : "var(--text-secondary)",
            borderBottom: tab === "category" ? "2px solid #3b82f6" : "2px solid transparent",
          }}
        >
          By Category
        </button>
      </div>

      {tab === "time" ? <RecordsByTime /> : <RecordsByCategory />}
    </AppLayout>
  );
}
