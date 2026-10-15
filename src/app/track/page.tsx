"use client";
import { useState } from "react";
import Navbar from "../components/navbar";

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(
        `${API_URL}/api/orders/track?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
      alert("Error searching orders");
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = (status: string) => {
    switch (status) {
      case "new":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFBFA] via-white to-[#FAF8FF] text-neutral-900 font-sans selection:bg-purple-200 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] bg-purple-300/25 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-300/20 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/3" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 w-[400px] h-[400px] bg-emerald-200/10 blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/2" />

      <Navbar />

      {/* Main Container */}
      <main className="relative max-w-3xl mx-auto px-6 py-16">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50/80 border border-purple-200/70 rounded-full text-purple-700 text-[11px] font-bold tracking-[0.1em] backdrop-blur-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            ORDER STATUS TRACKER
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
            Track your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 font-serif italic">
                orders.
              </span>
              <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-purple-200/50 -z-0 rounded-full" />
            </span>
          </h1>
          <p className="text-neutral-600 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Enter your email address to view all your service requests and payment statuses
            in real time.
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="relative bg-white/85 backdrop-blur-sm border border-neutral-200/80 rounded-3xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_40px_-20px_rgba(139,92,246,0.15)] flex flex-col md:flex-row gap-3 mb-10 overflow-hidden"
        >
          {/* Soft corner glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-purple-200/40 blur-3xl rounded-full" />

          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
              🔍
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="w-full pl-11 pr-4 p-4 bg-white border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-300/50 cursor-pointer disabled:opacity-50 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative inline-flex items-center gap-2">
              {loading ? "Searching..." : "Track Orders"}
              {!loading && (
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              )}
            </span>
          </button>
        </form>

        {/* Results Section */}
        {searched && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="relative bg-white/85 backdrop-blur-sm border border-neutral-200/80 rounded-3xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_40px_-20px_rgba(139,92,246,0.15)] overflow-hidden">
                <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-amber-200/30 blur-3xl rounded-full" />

                <div className="relative w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
                  🔍
                </div>
                <p className="relative text-neutral-800 font-bold text-base">
                  No orders found for this email address.
                </p>
                <p className="relative text-xs text-neutral-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Make sure you use the exact email address you provided during checkout.
                </p>
              </div>
            ) : (
              orders.map((order, idx) => (
                <div
                  key={order.id}
                  className="group relative bg-white/85 backdrop-blur-sm border border-neutral-200/80 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_40px_-20px_rgba(139,92,246,0.15)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_3px_rgba(0,0,0,0.02),0_25px_50px_-20px_rgba(139,92,246,0.25)] overflow-hidden"
                >
                  {/* Soft corner glow */}
                  <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-purple-200/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 border border-neutral-200/80 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg">
                        Qty: {order.quantity}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-neutral-900 tracking-tight">
                      {order.productName || "Digital Service"}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1.5 truncate">
                      <span className="text-neutral-400">Target:</span>{" "}
                      {order.metadata?.target || "N/A"}
                    </p>
                  </div>

                  <div className="relative flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-bold">
                        Total Paid
                      </span>
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg leading-none">
                        {(order.totalAmount / 100).toLocaleString()}
                        <span className="text-[11px] ml-1 font-bold text-emerald-600">
                          ETB
                        </span>
                      </span>
                    </div>
                    <div>
                      <span
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider block text-center border ${statusStyles(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Empty pre-search hint */}
        {!searched && (
          <div className="relative mt-6 text-center">
            <p className="text-[11px] text-neutral-400 font-medium">
              Your orders are private — only visible to you via your email.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}