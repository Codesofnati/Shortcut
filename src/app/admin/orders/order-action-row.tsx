"use client";
import { useState } from "react";

export default function OrderActionRow({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(newStatus);
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => updateStatus(e.target.value)}
      disabled={loading}
      className="bg-white/[0.03] border border-white/10 hover:border-white/20 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/10 cursor-pointer disabled:opacity-50 transition"
    >
      <option value="new" className="bg-neutral-900 normal-case">
        New
      </option>
      <option value="processing" className="bg-neutral-900 normal-case">
        Processing
      </option>
      <option value="completed" className="bg-neutral-900 normal-case">
        Completed
      </option>
      <option value="failed" className="bg-neutral-900 normal-case">
        Failed
      </option>
      <option value="refunded" className="bg-neutral-900 normal-case">
        Refunded
      </option>
    </select>
  );
}