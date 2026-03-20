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
      {/* Tab bar */}
      <div className="flex border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-10">
        <button
          onClick={() => setTab("time")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "time"
              ? "text-[#e6edf3] border-b-2 border-[#3b82f6]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          By Time
        </button>
        <button
          onClick={() => setTab("category")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "category"
              ? "text-[#e6edf3] border-b-2 border-[#3b82f6]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          By Category
        </button>
      </div>

      {tab === "time" ? <RecordsByTime /> : <RecordsByCategory />}
    </AppLayout>
  );
}
