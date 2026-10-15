import { db } from "../../../api/src/db";
import { orders, customers } from "../../../api/src/db/schema";
import { sql } from "drizzle-orm";

export default async function AdminOverviewPage() {
  let stats = {
    totalRevenue: 0,
    totalOrders: 0,
    newOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
  };

  try {
    const [customerCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers);
    stats.totalCustomers = Number(customerCountResult?.count || 0);

    const allOrders = await db.select().from(orders);
    stats.totalOrders = allOrders.length;

    allOrders.forEach((order) => {
      if (order.status === "new") stats.newOrders++;
      if (order.status === "processing") stats.processingOrders++;
      if (order.status === "completed") {
        stats.completedOrders++;
        stats.totalRevenue += order.totalAmount;
      }
    });
  } catch (error) {
    console.error("Failed to load admin overview stats:", error);
  }

  const statCards = [
    {
      label: "Total Revenue (Completed)",
      value: `${(stats.totalRevenue / 100000).toLocaleString()}`,
      suffix: "ETB",
      hint: "Verified earnings from fulfilled orders",
      glyph: "ETB",
      accentText: "text-emerald-400",
      accentBg: "from-emerald-500/20",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      suffix: "",
      hint: "All time customer transactions",
      glyph: "#",
      accentText: "text-indigo-300",
      accentBg: "from-indigo-500/20",
    },
    {
      label: "New / Unverified",
      value: stats.newOrders,
      suffix: "",
      hint: "Awaiting payment receipt check",
      glyph: "!",
      accentText: "text-amber-300",
      accentBg: "from-amber-500/20",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      suffix: "",
      hint: "Registered buyer accounts",
      glyph: "@",
      accentText: "text-purple-300",
      accentBg: "from-purple-500/20",
    },
  ];

  return (
    <div className="relative p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-2">
              Broker Admin
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Overview,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-serif italic">
                at a glance.
              </span>
            </h1>
            <p className="text-neutral-400 text-sm mt-2">
              Real-time analytics and performance metrics for your digital storefront.
            </p>
          </div>
          <a
            href="/admin/orders"
            className="group inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-purple-900/40"
          >
            Manage Orders
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden transition-all hover:-translate-y-0.5 hover:border-white/20"
            >
              <div
                className={`pointer-events-none absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${card.accentBg} to-transparent blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}
              />
              <div
                className={`absolute top-4 right-4 text-5xl font-black opacity-[0.06] select-none ${card.accentText}`}
              >
                {card.glyph}
              </div>
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-bold">
                  {card.label}
                </p>
                <h3
                  className={`text-3xl font-extrabold mt-3 tracking-tight ${card.accentText}`}
                >
                  {card.value}
                  {card.suffix && (
                    <span className="text-sm font-bold text-neutral-400 ml-2">
                      {card.suffix}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">
                  {card.hint}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-purple-500/10 blur-3xl rounded-full" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold tracking-tight">
                  Order Status Breakdown
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  Live
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "New (Pending Verification)",
                    value: stats.newOrders,
                    dot: "bg-amber-400",
                    text: "text-amber-300",
                    bg: "bg-amber-500/5 border-amber-500/20",
                  },
                  {
                    label: "Processing",
                    value: stats.processingOrders,
                    dot: "bg-blue-400",
                    text: "text-blue-300",
                    bg: "bg-blue-500/5 border-blue-500/20",
                  },
                  {
                    label: "Completed (Fulfilled)",
                    value: stats.completedOrders,
                    dot: "bg-emerald-400",
                    text: "text-emerald-300",
                    bg: "bg-emerald-500/5 border-emerald-500/20",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center p-4 rounded-2xl border ${row.bg} transition hover:bg-white/[0.05]`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                      <span className={`text-sm font-semibold ${row.text}`}>
                        {row.label}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white text-base">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-fuchsia-500/10 blur-3xl rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💡</span>
                <h3 className="text-base font-bold tracking-tight">
                  Quick Broker Tip
                </h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                When a user places an order, check your Telebirr or CBE account for
                the payment reference ID submitted by the customer. Once confirmed,
                go to the{" "}
                <a
                  href="/admin/orders"
                  className="text-purple-300 underline font-semibold hover:text-purple-200 transition"
                >
                  Orders page
                </a>{" "}
                and change their status to{" "}
                <span className="text-blue-300 font-semibold">Processing</span> or{" "}
                <span className="text-emerald-300 font-semibold">Completed</span>.
              </p>
            </div>
            <div className="relative mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
              <span>Mekrez Broker Engine v1.0</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}