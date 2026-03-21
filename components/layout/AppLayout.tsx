"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Menu, X, Bell, Sun, Moon } from "lucide-react";
import { useState } from "react";
import FloatingButton from "./FloatingButton";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/records", label: "Records", icon: List },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 modal-backdrop md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:flex-col
        `}
        style={{ backgroundColor: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}
      >
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: "var(--bg-card-hover)" }}>
            👤
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>My Wallet</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Personal Finance</p>
          </div>
          <button
            className="ml-auto md:hidden"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? "rgba(9,105,218,0.15)" : "transparent",
                  color: active ? "var(--accent-blue)" : "var(--text-secondary)",
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>Wallet AI v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 py-3 z-10"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Wallet AI"}
            </h1>
          </div>
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

        <main className="flex-1 overflow-y-auto pb-20" style={{ backgroundColor: "var(--bg-primary)" }}>
          {children}
        </main>
      </div>

      <FloatingButton />
    </div>
  );
}
