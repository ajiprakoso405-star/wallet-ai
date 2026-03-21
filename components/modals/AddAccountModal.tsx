"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

type AccountType = "cash" | "bank" | "ewallet";

const BANK_PRESETS = [
  { name: "BCA",     icon: "🔵", color: "#0066AE" },
  { name: "BNI",     icon: "🟠", color: "#F26522" },
  { name: "BRI",     icon: "🔵", color: "#003B6C" },
  { name: "Mandiri", icon: "🟡", color: "#003087" },
  { name: "CIMB",    icon: "🔴", color: "#CB0C0F" },
  { name: "BSI",     icon: "🟢", color: "#4B9B4E" },
];

const EWALLET_PRESETS = [
  { name: "GoPay",     icon: "💚", color: "#00AA5B" },
  { name: "ShopeePay", icon: "🧡", color: "#EE4D2D" },
  { name: "OVO",       icon: "💜", color: "#4C3494" },
  { name: "Dana",      icon: "💙", color: "#118EEA" },
];

const CURRENCIES = ["IDR", "USD", "EUR", "SGD", "MYR"];

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

export default function AddAccountModal({ onClose, onSaved }: Props) {
  const [type, setType] = useState<AccountType>("bank");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏦");
  const [color, setColor] = useState("#3b82f6");
  const [currency, setCurrency] = useState("IDR");
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);

  function applyPreset(preset: { name: string; icon: string; color: string }) {
    setName(preset.name);
    setIcon(preset.icon);
    setColor(preset.color);
  }

  function handleTypeChange(t: AccountType) {
    setType(t);
    setName("");
    if (t === "cash") { setIcon("💵"); setColor("#22c55e"); }
    else if (t === "bank") { setIcon("🏦"); setColor("#3b82f6"); }
    else { setIcon("📱"); setColor("#a855f7"); }
  }

  async function save() {
    if (!name || !balance) return;
    setSaving(true);
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, currency, balance: parseFloat(balance), color, icon }),
      });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--bg-card-hover)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };
  const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none";

  const presets = type === "bank" ? BANK_PRESETS : type === "ewallet" ? EWALLET_PRESETS : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop">
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 sticky top-0 z-10"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-secondary)" }}
        >
          <button onClick={onClose} style={{ color: "var(--text-secondary)" }}>
            <X size={20} />
          </button>
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Add Account</h2>
          <button
            onClick={save}
            disabled={!name || !balance || saving}
            className="text-[#3b82f6] font-semibold disabled:opacity-40"
          >
            {saving ? "..." : <Check size={20} />}
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Account type selector */}
          <div>
            <label className="text-xs mb-2 block font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Account Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "cash",    label: "Cash",     emoji: "💵" },
                { value: "bank",    label: "Bank",     emoji: "🏦" },
                { value: "ewallet", label: "E-Wallet", emoji: "📱" },
              ] as { value: AccountType; label: string; emoji: string }[]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: type === t.value ? color + "20" : "var(--bg-card-hover)",
                    border: `1px solid ${type === t.value ? color : "var(--border)"}`,
                    color: type === t.value ? color : "var(--text-secondary)",
                  }}
                >
                  <span className="text-xl">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presets for bank / ewallet */}
          {presets.length > 0 && (
            <div>
              <label className="text-xs mb-2 block font-medium uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                {type === "bank" ? "Pilih Bank" : "Pilih E-Wallet"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all"
                    style={{
                      backgroundColor: name === p.name ? p.color + "20" : "var(--bg-card-hover)",
                      border: `1px solid ${name === p.name ? p.color : "var(--border)"}`,
                      color: name === p.name ? p.color : "var(--text-secondary)",
                    }}
                  >
                    <span className="text-xl">{p.icon}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>Account Name*</label>
            <input
              className={inputCls}
              style={inputStyle}
              placeholder={type === "bank" ? "e.g. BCA Tabungan" : type === "ewallet" ? "e.g. GoPay" : "e.g. Dompet"}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Currency & Initial Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls} style={inputStyle}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>Initial Balance*</label>
              <input
                type="number"
                className={inputCls}
                style={inputStyle}
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
          </div>

          {/* Preview */}
          {name && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: color + "12", border: `1px solid ${color}40` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: color + "25" }}
              >
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{name}</p>
                <p className="text-xs capitalize" style={{ color: "var(--text-secondary)" }}>
                  {type} · {currency} · {balance ? Number(balance).toLocaleString("id-ID") : "0"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={!name || !balance || saving}
            className="w-full bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            {saving ? "Saving..." : "Add Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
