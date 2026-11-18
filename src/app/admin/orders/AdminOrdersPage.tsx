"use client";

import { useState, useEffect } from "react";
import OrderActionRow from "./order-action-row";

// Since this is now a client component, we can't use server-side db directly here.
// If you have an API route to fetch orders, use fetch. Otherwise, pass allOrders as a prop from a server wrapper.
// For simplicity, assuming you fetch from an API or pass it down.
// I'll write the UI and logic, you just need to ensure allOrders is passed in.

export default function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Optional: Re-fetch orders if needed
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const statusStyles: Record<string, string> = {
    new: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-300 border-red-500/20",
    refunded: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  };

  const statusDot: Record<string, string> = {
    new: "bg-amber-400",
    processing: "bg-blue-400",
    completed: "bg-emerald-400",
    failed: "bg-red-400",
    refunded: "bg-purple-400",
  };

  return (
    <div className="relative p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-2">
              Broker Admin
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Orders,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-serif italic">
                managed.
              </span>
            </h1>
            <p className="text-neutral-400 text-sm mt-2">
              Verify external payments, process requests, and update order statuses manually.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {orders.length} orders total
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />

          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-bold">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">FT Number</th>
                  <th className="p-4">Service Requested</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Total (ETB)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-16 text-center">
                      <div className="inline-flex flex-col items-center gap-2">
                        <span className="text-3xl opacity-40">📦</span>
                        <p className="text-sm font-medium text-neutral-400">
                          No orders placed yet.
                        </p>
                        <p className="text-[11px] text-neutral-600">
                          Test your storefront by placing a sample order.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-white/[0.05] transition group cursor-pointer"
                    >
                      <td className="p-4">
                        <span className="font-mono text-[11px] font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-white">
                        {order.customerEmail || "Guest"}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {order.metadata?.paymentReference || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-purple-300">
                        {order.productName || "Unknown Service"}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-neutral-400 max-w-xs truncate">
                        {order.metadata?.target ||
                          order.metadata?.targetLink ||
                          "N/A"}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {order.quantity}
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
                          {(order.totalAmount / 100000).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold ml-1">
                          ETB
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[order.status] ||
                            "bg-neutral-800 text-neutral-300 border-neutral-700"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusDot[order.status] || "bg-neutral-400"
                              }`}
                          />
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <OrderActionRow
                          orderId={order.id}
                          initialStatus={order.status}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Order Details
                  <span className="text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                    #{selectedOrder.id.slice(0, 8)}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status & Action */}
              <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">
                    Current Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusStyles[selectedOrder.status]}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDot[selectedOrder.status]}`} />
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1 text-right">
                    Update Status
                  </p>
                  <OrderActionRow orderId={selectedOrder.id} initialStatus={selectedOrder.status} />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">Customer Email</p>
                  <p className="text-sm font-semibold text-white">{selectedOrder.customerEmail || "Guest"}</p>
                </div>
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">Service Ordered</p>
                  <p className="text-sm font-semibold text-purple-300">{selectedOrder.productName || "Unknown"}</p>
                </div>
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">Quantity</p>
                  <p className="text-sm font-semibold text-white">{selectedOrder.quantity}</p>
                </div>
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">Total Amount</p>
                  <p className="text-sm font-extrabold text-emerald-400">{(selectedOrder.totalAmount / 100000).toFixed(2)} ETB</p>
                </div>
              </div>

              {/* Target & Payment Ref */}
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-2">Target URL / Username</p>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 font-mono text-xs text-blue-300 break-all select-all">
                    {selectedOrder.metadata?.target || selectedOrder.metadata?.targetLink || "N/A"}
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-bold mb-2">Payment Reference (FT Number)</p>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-white/5 font-mono text-sm font-bold text-emerald-400 tracking-wider select-all">
                    {selectedOrder.metadata?.paymentReference || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}