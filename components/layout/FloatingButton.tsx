"use client";

import { useState } from "react";
import { Plus, X, PenLine, Bot } from "lucide-react";
import RecordManuallyModal from "@/components/modals/RecordManuallyModal";
import RecordWithAIModal from "@/components/modals/RecordWithAIModal";

export default function FloatingButton() {
  const [open, setOpen] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showAI, setShowAI] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
      )}

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {open && (
          <div className="flex flex-col items-end gap-2 fade-in">
            <button
              onClick={() => { setShowAI(true); setOpen(false); }}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-full shadow-lg transition-colors text-sm font-medium"
              style={{ backgroundColor: "#1f6feb" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#388bfd")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f6feb")}
            >
              <Bot size={16} />
              Record with AI
            </button>
            <button
              onClick={() => { setShowManual(true); setOpen(false); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-colors text-sm font-medium"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
            >
              <PenLine size={16} />
              Record manually
            </button>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: open ? "var(--bg-card-hover)" : "#1f6feb",
            color: open ? "var(--text-primary)" : "#ffffff",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
          onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = "#388bfd"; }}
          onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = "#1f6feb"; }}
        >
          {open ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showManual && <RecordManuallyModal onClose={() => setShowManual(false)} />}
      {showAI && <RecordWithAIModal onClose={() => setShowAI(false)} />}
    </>
  );
}
