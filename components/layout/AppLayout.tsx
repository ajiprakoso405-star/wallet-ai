"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Bell, Sun, Moon, Wallet } from "lucide-react";
import FloatingButton from "./FloatingButton";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/balance", label: "Balance", icon: Wallet },
  { href: "/records", label: "Records", icon: List },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 py-3 z-10"
        style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
      >
        <h1 className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Wallet AI"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-card-hover)" }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button style={{ color: "var(--text-secondary)" }}>
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Main content — pb-20 agar tidak tertutup bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20" style={{ backgroundColor: "var(--bg-primary)" }}>
        {children}
      </main>

      {/* Bottom tab bar — fixed supaya selalu muncul di semua browser mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around z-50"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
          paddingTop: "8px",
          paddingLeft: "8px",
          paddingRight: "8px",
          minHeight: "60px",
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors"
              style={{
                color: active ? "var(--accent-blue)" : "var(--text-secondary)",
                backgroundColor: active ? "rgba(9,105,218,0.12)" : "transparent",
              }}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <FloatingButton />
    </div>
  );
}
