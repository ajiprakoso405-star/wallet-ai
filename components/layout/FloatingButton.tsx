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
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB menu */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {open && (
          <div className="flex flex-col items-end gap-2 fade-in">
            <button
              onClick={() => { setShowAI(true); setOpen(false); }}
              className="flex items-center gap-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white px-4 py-2.5 rounded-full shadow-lg transition-colors text-sm font-medium"
            >
              <Bot size={16} />
              Record with AI
            </button>
            <button
              onClick={() => { setShowManual(true); setOpen(false); }}
              className="flex items-center gap-2 bg-[#1c2128] hover:bg-[#21262d] text-[#e6edf3] border border-[#30363d] px-4 py-2.5 rounded-full shadow-lg transition-colors text-sm font-medium"
            >
              <PenLine size={16} />
              Record manually
            </button>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className={`
            w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200
            ${open
              ? "bg-[#30363d] rotate-45 text-[#e6edf3]"
              : "bg-[#1f6feb] hover:bg-[#388bfd] text-white scale-100 hover:scale-105"
            }
          `}
        >
          {open ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showManual && (
        <RecordManuallyModal onClose={() => setShowManual(false)} />
      )}
      {showAI && (
        <RecordWithAIModal onClose={() => setShowAI(false)} />
      )}
    </>
  );
}
