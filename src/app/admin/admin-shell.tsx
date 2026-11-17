"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "../admin-login/logout-button";

const navLinks = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/orders", label: "Orders Management", icon: "📦" },
  { href: "/admin/products", label: "Products & Pricing", icon: "🏷️" },
  { href: "/admin/platforms", label: "Platforms", icon: "🧩" },
  { href: "/admin/contacts", label: "Contact us", icon: "📞" },
];

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0812] via-neutral-950 to-[#0F0A1A] text-white flex font-sans relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-600/15 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-fuchsia-600/10 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/3" />

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          border-r border-white/5 p-6 flex flex-col justify-between
          bg-[#0A0812]/95 md:bg-white/[0.02] backdrop-blur-xl
          h-screen
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:sticky md:top-0 md:z-auto
        `}
      >
        <div>
          {/* Brand + mobile close button */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-purple-500 blur-md opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-purple-900/50">
                  S
                </div>
              </div>
              <div>
                <span className="font-bold text-base block leading-tight tracking-tight">
                  Broker Admin
                </span>
                <span className="text-[10px] text-purple-300/70 uppercase tracking-[0.15em] font-mono font-bold">
                  Control Panel
                </span>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="md:hidden p-2 -mr-2 text-neutral-400 hover:text-white"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-1.5 text-sm font-medium">
            {navLinks.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    border transition-all
                    ${
                      active
                        ? "bg-white/[0.08] text-white border-white/10"
                        : "text-neutral-300 hover:bg-white/[0.06] hover:text-white border-transparent hover:border-white/10"
                    }
                  `}
                >
                  <span className="text-base transition-transform group-hover:scale-110">
                    {link.icon}
                  </span>
                  <span className="tracking-tight">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">
              Signed in as
            </p>
            <p className="text-[11px] font-bold text-white truncate">{email}</p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              System Online
            </span>
          </div>

          <LogoutButton />

          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition px-2 py-1"
          >
            ← Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="relative flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0A0812]/80 backdrop-blur-xl border-b border-white/5">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 text-neutral-300 hover:text-white"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center text-xs font-bold">
              S
            </div>
            <span className="text-sm font-bold tracking-tight">Admin</span>
          </div>

          <div className="w-8" /> {/* spacer for centering */}
        </header>

        <main className="relative flex-1 overflow-y-auto p-4 md:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}