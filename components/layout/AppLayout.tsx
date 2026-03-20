"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Menu, X, Bell } from "lucide-react";
import { useState } from "react";
import FloatingButton from "./FloatingButton";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/records", label: "Records", icon: List },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 modal-backdrop md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 bg-[#161b22] border-r border-[#30363d]
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:flex-col
        `}
      >
        {/* User header */}
        <div className="p-4 border-b border-[#30363d] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#30363d] flex items-center justify-center text-lg">
            👤
          </div>
          <div>
            <p className="font-semibold text-[#e6edf3]">My Wallet</p>
            <p className="text-xs text-[#8b949e]">Personal Finance</p>
          </div>
          <button
            className="ml-auto md:hidden text-[#8b949e] hover:text-[#e6edf3]"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-[#1f6feb]/20 text-[#58a6ff]"
                    : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#30363d]">
          <p className="text-xs text-[#8b949e] text-center">Wallet AI v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#0d1117] z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[#8b949e] hover:text-[#e6edf3]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-[#e6edf3]">
              {navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Wallet AI"}
            </h1>
          </div>
          <button className="text-[#8b949e] hover:text-[#e6edf3] relative">
            <Bell size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0d1117] pb-20">
          {children}
        </main>
      </div>

      {/* Floating action button */}
      <FloatingButton />
    </div>
  );
}
