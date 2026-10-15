"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="group w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl text-[11px] font-bold uppercase tracking-wider text-red-300 hover:text-red-200 transition disabled:opacity-50 cursor-pointer"
    >
      <span className="text-sm">⏻</span>
      <span>{loading ? "Signing out..." : "Logout"}</span>
    </button>
  );
}