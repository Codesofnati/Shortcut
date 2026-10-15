"use client";
import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import ProductGridClient from "./components/product-grid-client";

export default function Home() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${API_URL}/api/products?active=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllProducts(data.products);
        } else {
          setErrorMessage(data.message);
        }
      })
      .catch((err) => {
        console.error("Database connection error:", err);
        setErrorMessage("Unable to connect to the catalog server.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-neutral-900 font-sans selection:bg-purple-200 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-200/20 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/3" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/70 rounded-full text-emerald-700 text-[11px] font-bold tracking-[0.1em] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            YOUR DIGITAL WORLD, SIMPLIFIED
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
            Less searching. <br />
            More{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 font-serif italic">
                achieving.
              </span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-purple-200/50 -z-0 rounded-full" />
            </span>
          </h1>

          <p className="text-lg text-neutral-600 max-w-xl leading-relaxed">
            Discover useful digital products, social media growth services, and Meta
            verifications in one convenient place. Find what you need and get moving.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition shadow-xl shadow-neutral-900/15"
            >
              Explore the collection
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#collection"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-neutral-700 border border-neutral-200 bg-white/60 backdrop-blur-sm hover:bg-white hover:border-neutral-300 transition"
            >
              Discover Shortcut
            </a>
          </div>

          <div className="pt-6 flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            Digital products &amp; social growth. Simple experiences.
          </div>
        </div>

        {/* Hero Visual Accent */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative">
            {/* Outer orbit ring */}
            <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full border border-purple-200/70 flex items-center justify-center relative bg-gradient-to-tr from-purple-50/60 via-white to-fuchsia-50/40 shadow-inner">
              {/* Dotted ring */}
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-purple-200/60 animate-[spin_40s_linear_infinite]" />

              {/* Center orb */}
              <div className="relative w-48 h-48 lg:w-60 lg:h-60 rounded-full bg-gradient-to-br from-white via-purple-50 to-fuchsia-100 flex flex-col items-center justify-center text-center p-6 shadow-xl border border-purple-100">
                <div className="absolute inset-0 rounded-full bg-purple-400/10 blur-2xl" />
                <span className="relative text-3xl text-purple-600 mb-1">✦</span>
                <span className="relative font-bold text-lg text-neutral-900 tracking-tight">
                  shortcut
                </span>
                <span className="relative text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-1">
                  Your Next Move
                </span>
              </div>

              {/* Floating card 1 */}
              <div className="absolute top-4 right-0 lg:-right-2 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-3 hover:-translate-y-0.5 transition">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                  ✦
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Digital tools</p>
                  <p className="text-[10px] text-neutral-500">Work smarter</p>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="absolute bottom-8 left-0 lg:-left-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-3 hover:-translate-y-0.5 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Verified</p>
                  <p className="text-[10px] text-neutral-500">Trusted delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section
        id="collection"
        className="relative max-w-7xl mx-auto px-6 py-20 border-t border-neutral-200/60"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-600 font-bold mb-2">
              The Shortcut Collection
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
              Everything you need,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 font-serif italic">
                in one place.
              </span>
            </h2>
            <p className="text-neutral-600 mt-2">
              Discover digital tools and services selected for you.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 bg-white/80 border border-neutral-200 rounded-full px-4 py-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {allProducts.length} products available
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl mb-6 text-amber-800 text-sm flex items-start gap-3 backdrop-blur-sm">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">Catalog is temporarily updating</p>
              <p className="text-xs text-amber-700 mt-0.5">
                We are currently updating our products list. Please check back in a moment or
                visit our Shortcut Dashboard directly.
              </p>
            </div>
          </div>
        )}

        <ProductGridClient products={allProducts} />
      </section>

      {/* Footer Callout */}
      <section className="relative bg-neutral-900 text-white py-24 mt-20 overflow-hidden">
        {/* Ambient glows in footer */}
        <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/15 blur-[120px] rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center px-6 space-y-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold">
            A better way to get started
          </p>
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
            Find your next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-serif italic">
              shortcut.
            </span>
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto text-sm leading-relaxed">
            We're building a simpler way to discover and access digital products and services.
            Explore the collection and find what works for you.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-white text-neutral-900 px-6 py-3 rounded-xl font-semibold text-sm transition shadow-lg hover:bg-neutral-100"
            >
              Start exploring
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="/track"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/10 transition"
            >
              Track Order ↗
            </a>
          </div>

          <p className="pt-8 text-[11px] text-neutral-500">
            © {new Date().getFullYear()} shortcut. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}