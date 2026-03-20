"use client";

import { useState, useEffect } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import type { Account } from "@/lib/types";

type TxType = "income" | "expense" | "transfer";

interface Props {
  onClose: () => void;
  prefill?: {
    type?: TxType;
    amount?: number;
    currency?: string;
    category?: string;
    subcategory?: string;
    merchant?: string;
    location?: string;
    note?: string;
  };
}

const CURRENCIES = ["IDR", "USD", "EUR", "SGD", "MYR"];

export default function RecordManuallyModal({ onClose, prefill }: Props) {
  const [txType, setTxType] = useState<TxType>(prefill?.type ?? "expense");
  const [amount, setAmount] = useState(prefill?.amount?.toString() ?? "");
  const [currency, setCurrency] = useState(prefill?.currency ?? "IDR");
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState(prefill?.category ?? "");
  const [subcategory, setSubcategory] = useState(prefill?.subcategory ?? "");
  const [merchant, setMerchant] = useState(prefill?.merchant ?? "");
  const [location, setLocation] = useState(prefill?.location ?? "");
  const [note, setNote] = useState(prefill?.note ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => {
        const accs = d.accounts || [];
        setAccounts(accs);
        if (accs.length > 0) setAccountId(accs[0].id);
      });
  }, []);

  const availableCategories =
    txType === "income" ? CATEGORIES.filter((c) => c.name === "Income" || c.name === "Others") : CATEGORIES;

  const selectedCategory = CATEGORIES.find((c) => c.name === category);

  async function save() {
    if (!amount || !category || !accountId) return;
    setSaving(true);
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txType,
          amount: parseFloat(amount),
          currency,
          category,
          subcategory: subcategory || null,
          merchant: merchant || null,
          location: location || null,
          note: note || null,
          date: new Date(date).toISOString(),
          accountId,
        }),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop">
      <div className="w-full sm:max-w-md bg-[#161b22] rounded-t-2xl sm:rounded-2xl border border-[#30363d] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d] sticky top-0 bg-[#161b22] z-10">
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]">
            <X size={20} />
          </button>
          <h2 className="text-[#e6edf3] font-semibold">New Record</h2>
          <button
            onClick={save}
            disabled={!amount || !category || !accountId || saving}
            className="text-[#3b82f6] font-semibold disabled:opacity-40"
          >
            {saving ? "..." : <Check size={20} />}
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex bg-[#3b82f6] sticky top-14 z-10">
          {(["income", "expense", "transfer"] as TxType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTxType(t)}
              className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                txType === t
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#1f3a5f] text-[#93c5fd] hover:bg-[#1e40af]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* Amount */}
          <div className="flex items-center gap-3 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-xl p-4">
            <div className="flex-1">
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-3xl font-bold text-[#e6edf3] placeholder-[#8b949e] focus:outline-none"
              />
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] rounded-lg px-2 py-1.5 text-sm focus:outline-none"
            >
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Account*</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm focus:outline-none focus:border-[#3b82f6]"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Category*</label>
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm flex items-center justify-between focus:outline-none hover:border-[#3b82f6]"
            >
              <span className={category ? "text-[#e6edf3]" : "text-[#8b949e]"}>
                {category ? `${selectedCategory?.icon} ${category}` : "Select category"}
              </span>
              <ChevronDown size={16} className="text-[#8b949e]" />
            </button>

            {showCategoryPicker && (
              <div className="mt-1 bg-[#1c2128] border border-[#30363d] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setCategory(cat.name);
                      setSubcategory("");
                      setShowCategoryPicker(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#21262d] text-sm text-left"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-[#e6edf3]">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subcategory */}
          {category && selectedCategory && selectedCategory.subcategories.length > 0 && (
            <div>
              <label className="text-xs text-[#8b949e] mb-1 block">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="">Select subcategory</option>
                {selectedCategory.subcategories.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Merchant */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Where (Merchant)</label>
            <input
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6]"
              placeholder="e.g. Starbucks, KFC..."
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Location</label>
            <input
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6]"
              placeholder="e.g. Jakarta, Bandung..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Note</label>
            <input
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#3b82f6]"
              placeholder="Optional note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-[#8b949e] mb-1 block">Date & Time</label>
            <input
              type="datetime-local"
              className="w-full bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm focus:outline-none focus:border-[#3b82f6]"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            onClick={save}
            disabled={!amount || !category || !accountId || saving}
            className="w-full bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            {saving ? "Saving..." : "Save Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
