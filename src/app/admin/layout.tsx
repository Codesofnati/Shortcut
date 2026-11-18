import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import AdminShell from "./admin-shell";
import AdminTimeoutTracker from "./AdminTimeoutTracker";

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

  return (
    <AdminShell email={user.email ?? ""}>
      {/* The tracker sits silently in the background listening for mouse/keyboard activity */}
      <AdminTimeoutTracker />
      {children}
    </AdminShell>
  );
}