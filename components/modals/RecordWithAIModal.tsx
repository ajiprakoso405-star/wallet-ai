"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, MicOff, ImagePlus, Bot, Loader2 } from "lucide-react";
import RecordManuallyModal from "./RecordManuallyModal";
import type { AIParseResult } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string; // base64
}

interface Props {
  onClose: () => void;
}

export default function RecordWithAIModal({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you record transactions. Just tell me what you spent or earned — for example:\n\n• \"Lunch at KFC 45k\"\n• \"Transfer salary 5 million\"\n• \"Grab 25rb to office\"\n\nYou can also send a photo of a receipt! 📸",
    },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [prefill, setPrefill] = useState<AIParseResult | null>(null);
  const [showManual, setShowManual] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // PERBAIKAN 1: Menggunakan <any> agar Vercel tidak error
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startVoice() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    // PERBAIKAN 2: Menggunakan tipe : any
    const rec: any = new SR();
    rec.lang = "id-ID";
    rec.interimResults = false;
    // PERBAIKAN 3: Menggunakan e: any
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
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
        const p: AIParseResult = data.parsed;
        const summary = [
          `✅ Got it! Here's what I found:`,
          ``,
          `**Type:** ${p.type}`,
          `**Amount:** ${p.amount ? `${p.currency ?? "IDR"} ${p.amount.toLocaleString()}` : "—"}`,
          p.category ? `**Category:** ${p.category}` : null,
          p.subcategory ? `**Subcategory:** ${p.subcategory}` : null,
          p.merchant ? `**Merchant:** ${p.merchant}` : null,
          p.location ? `**Location:** ${p.location}` : null,
          p.note ? `**Note:** ${p.note}` : null,
          ``,
          `Does this look right? I'll open the form so you can review and save.`,
        ]
          .filter((l) => l !== null)
          .join("\n");

        setMessages((prev) => [...prev, { role: "assistant", content: summary }]);
        setPrefill(p);
        setTimeout(() => setShowManual(true), 800);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply ?? "Sorry, I couldn't parse that. Could you try again with more details?" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (showManual) {
    return (
      <RecordManuallyModal
        onClose={() => {
          setShowManual(false);
          onClose();
        }}
        prefill={prefill ?? undefined}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop">
      <div className="w-full sm:max-w-md bg-[#161b22] rounded-t-2xl sm:rounded-2xl border border-[#30363d] shadow-2xl flex flex-col h-[85vh] sm:h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
              <Bot size={16} className="text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-[#e6edf3] font-semibold text-sm">AI Assistant</h2>
              <p className="text-[#8b949e] text-xs">Record transactions with AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-[#3b82f6]/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Bot size={12} className="text-[#3b82f6]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-[#3b82f6] text-white rounded-br-sm"
                    : "bg-[#21262d] text-[#e6edf3] rounded-bl-sm"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="receipt"
                    className="w-full rounded-lg mb-2 max-h-40 object-cover"
                  />
                )}
                {msg.content.split("\n").map((line, j) => (
                  <span key={j}>
                    {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                    {j < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-[#3b82f6]/20 flex items-center justify-center mr-2 flex-shrink-0">
                <Bot size={12} className="text-[#3b82f6]" />
              </div>
              <div className="bg-[#21262d] rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 size={14} className="text-[#8b949e] animate-spin" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Image preview */}
        {image && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="relative inline-block">
              <img src={image} alt="preview" className="h-16 rounded-lg object-cover" />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[#f85149] rounded-full flex items-center justify-center"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-[#30363d] flex-shrink-0">
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-[#8b949e] hover:text-[#3b82f6] flex-shrink-0 mb-1"
            >
              <ImagePlus size={20} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileRef}
              onChange={handleImageChange}
            />

            <textarea
              className="flex-1 bg-[#21262d] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6] resize-none max-h-24"
              placeholder="Type a transaction..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            <button
              onClick={listening ? stopVoice : startVoice}
              className={`flex-shrink-0 mb-1 ${listening ? "text-[#f85149] animate-pulse" : "text-[#8b949e] hover:text-[#3b82f6]"}`}
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={send}
              disabled={loading || (!input.trim() && !image)}
              className="flex-shrink-0 mb-1 text-[#3b82f6] disabled:opacity-40 hover:text-[#60a5fa]"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}