"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Explore the collection" },
    { href: "/track", label: "Track Order ↗" },
    { href: "/contact", label: "Contact" },
  ];

  // A link is active when the current path matches it exactly, or
  // starts with it (so /track/123 also highlights "Track Order").
  // Home ("/") only matches exactly to avoid highlighting everywhere.
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-purple-500 blur-md opacity-40 group-hover:opacity-70 transition" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-300/50">
              S
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-900">
            shortcut.
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white/60 border border-neutral-200/70 rounded-2xl p-1.5 shadow-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                isActive(link.href)
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

       {/* Desktop CTA */}
<div className="hidden md:flex items-center gap-3">
  <a
    href="/#collection"
    className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-300/40"
  >
    Explore products
    <span className="transition-transform group-hover:translate-x-0.5">↗</span>
  </a>
</div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-neutral-100 text-neutral-800 focus:outline-none hover:bg-neutral-200 transition"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-xl px-6 py-5 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition ${
                isActive(link.href)
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-purple-600"
              }`}
            >
              {link.label}
            </a>
          ))}
         <a
  href="/#collection"
  className="block text-center mt-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-300/40"
>
  Explore products ↗
</a>
        </div>
      )}
    </header>
  );
}