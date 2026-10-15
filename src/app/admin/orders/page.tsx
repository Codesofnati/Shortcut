import { db } from "../../../../api/src/db";
import { orders, customers, products } from "../../../../api/src/db/schema";
import { eq, desc } from "drizzle-orm";
import OrderActionRow from "./order-action-row";

export default async function AdminOrdersPage() {
  let allOrders: any[] = [];
  try {
    allOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        quantity: orders.quantity,
        totalAmount: orders.totalAmount,
        metadata: orders.metadata,
        createdAt: orders.createdAt,
        customerEmail: customers.email,
        productName: products.name,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Failed to load admin orders:", error);
  }

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
            {allOrders.length} orders total
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
                  <th className="p-4">Service Requested</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Total (ETB)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-16 text-center">
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
                  allOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.03] transition group"
                    >
                      <td className="p-4">
                        <span className="font-mono text-[11px] font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-white">
                        {order.customerEmail || "Guest"}
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusStyles[order.status] ||
                            "bg-neutral-800 text-neutral-300 border-neutral-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              statusDot[order.status] || "bg-neutral-400"
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
    </div>
  );
}