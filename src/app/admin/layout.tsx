import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import LogoutButton from "../admin-login/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verify authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-login");
  }

  // 2. Verify admin role (authoritative check via service role)
  const admin = createAdminClient();
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isAdmin = roles?.some((r) => r.role === "admin") ?? false;

  if (!isAdmin) {
    redirect("/");
  }

  const navLinks = [
    { href: "/admin", label: "Overview", icon: "📊" },
    { href: "/admin/orders", label: "Orders Management", icon: "📦" },
    { href: "/admin/products", label: "Products & Pricing", icon: "🏷️" },
    { href: "/admin/platforms", label: "Platforms", icon: "🧩" },
    { href: "/admin/contacts", label: "Contact us", icon: "📞"},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0812] via-neutral-950 to-[#0F0A1A] text-white flex font-sans relative overflow-x-hidden">
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] bg-purple-600/15 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/3" />

      <aside className="relative w-64 border-r border-white/5 p-6 flex flex-col justify-between hidden md:flex sticky top-0 h-screen bg-white/[0.02] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-10">
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

          <nav className="space-y-1.5 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/10 transition-all"
              >
                <span className="text-base transition-transform group-hover:scale-110">
                  {link.icon}
                </span>
                <span className="tracking-tight">{link.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">
              Signed in as
            </p>
            <p className="text-[11px] font-bold text-white truncate">
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              System Online
            </span>
          </div>

          <LogoutButton />

          <a
            href="/"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition px-2 py-1"
          >
            ← Back to Storefront
          </a>
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}