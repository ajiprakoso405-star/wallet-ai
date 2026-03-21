"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, ImagePlus, Bot } from "lucide-react";
import RecordManuallyModal from "./RecordManuallyModal";
import type { AIParseResult } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface Props {
  onClose: () => void;
}

export default function RecordWithAIModal({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya Asisten AI Anda. Anda bisa mengetik transaksi atau upload foto struk.",
    },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefill, setPrefill] = useState<AIParseResult | null>(null);
  const [showManual, setShowManual] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function send() {
    const text = input.trim();
    if (!text && !image) return;

    const userMsg: Message = { role: "user", content: text, image: image ?? undefined };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, image }),
      });
      const data = await res.json();

      if (data.parsed) {
        setMessages((prev) => [...prev, { role: "assistant", content: "✅ Transaksi berhasil dicatat! Membuka formulir..." }]);
        setPrefill(data.parsed);
        setTimeout(() => setShowManual(true), 800);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Maaf, saya tidak mengerti." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Gagal menyambung ke AI." }]);
    } finally {
      setLoading(false);
    }
  }

  if (showManual) return <RecordManuallyModal onClose={() => { setShowManual(false); onClose(); }} prefill={prefill ?? undefined} />;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px]" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-[#3b82f6]" />
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Asisten AI</h2>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-secondary)" }}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
                style={{
                  backgroundColor: msg.role === "user" ? "#3b82f6" : "var(--bg-card-hover)",
                  color: msg.role === "user" ? "#ffffff" : "var(--text-primary)",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-secondary)" }}>
                Memproses...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={() => fileRef.current?.click()} style={{ color: "var(--text-secondary)" }}><ImagePlus size={20} /></button>
          <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleImageChange} />
          <input
            className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{ backgroundColor: "var(--bg-card-hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            placeholder="Ketik transaksi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={() => alert("Fitur suara dimatikan")} style={{ color: "var(--text-secondary)" }}><Mic size={20} /></button>
          <button onClick={send} disabled={loading} className="text-[#3b82f6]"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
}
