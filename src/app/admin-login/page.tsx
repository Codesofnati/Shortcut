"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0812] via-neutral-950 to-[#0F0A1A] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/15 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/3" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-purple-500 blur-xl opacity-60" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-900/50">
              S
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-1">
            Broker Admin
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sign in to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-serif italic">
              continue.
            </span>
          </h1>
        </div>

        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-purple-500/15 blur-3xl rounded-full" />

          <form onSubmit={handleSubmit} className="relative space-y-5">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full p-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/10 transition text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/10 transition text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-900/40 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">
                {loading ? "Signing in..." : "Sign In"}
              </span>
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-neutral-500 mt-6">
          Admin access only. Unauthorized attempts are logged.
        </p>
      </div>
    </div>
  );
}