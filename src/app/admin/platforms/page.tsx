"use client";
import { useState, useEffect } from "react";

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlatforms = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_URL}/api/platforms`);
      const data = await res.json();
      if (data.success) setPlatforms(data.platforms);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    try {
      const url = editingId ? `/api/platforms/${editingId}` : "/api/platforms";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imageUrl }),
      });

      const data = await res.json();
      if (data.success) {
        handleReset();
        fetchPlatforms();
        alert(
          editingId
            ? "Platform updated successfully!"
            : "Platform added successfully!"
        );
      } else {
        alert(data.message || "Failed to save platform");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving platform");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plat: any) => {
    setEditingId(plat.id);
    setName(plat.name);
    setImageUrl(plat.imageUrl || "");
  };

  const handleReset = () => {
    setEditingId(null);
    setName("");
    setImageUrl("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this platform?")) return;

    try {
      const res = await fetch(`/api/platforms/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchPlatforms();
      } else {
        alert(data.message || "Failed to delete platform");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting platform");
    }
  };

  const inputCls =
    "w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/10 transition text-xs";

  return (
    <div className="relative p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-2">
              Broker Admin
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Platforms &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-serif italic">
                Icons.
              </span>
            </h1>
            <p className="text-neutral-400 text-sm mt-2">
              Add, update, or remove social media platforms and their icons.
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl text-xs font-bold transition"
          >
            ← Back to Overview
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add / Edit Platform Form */}
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl h-fit overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-purple-500/15 blur-3xl rounded-full" />

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold tracking-tight">
                  {editingId ? "Edit Platform" : "Add New Platform"}
                </h3>
                {editingId && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 border border-purple-400/20 px-2.5 py-1 rounded-full">
                    Editing
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., TikTok, Instagram"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Platform Icon / Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/tiktok-icon.png"
                    className={inputCls}
                  />
                </div>

                {/* Live preview */}
                {(name || imageUrl) && (
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center gap-3">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="preview"
                        className="w-9 h-9 rounded-xl object-cover bg-white/5 border border-white/10 p-1"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold">
                        {name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        Preview
                      </p>
                      <p className="text-xs font-bold text-white truncate">
                        {name || "Platform name"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-bold rounded-xl transition cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-lg shadow-purple-900/40 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">
                      {loading
                        ? "Saving..."
                        : editingId
                        ? "Update Platform"
                        : "Add Platform"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Platforms List */}
          <div className="md:col-span-2 relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full" />

            <div className="relative p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-base font-bold tracking-tight">
                Existing Platforms
              </h3>
              <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {platforms.length} total
              </span>
            </div>

            <div className="relative divide-y divide-white/5">
              {platforms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex flex-col items-center gap-2">
                    <span className="text-3xl opacity-40">🧩</span>
                    <p className="text-sm font-medium text-neutral-400">
                      No platforms yet.
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      Add one using the form on the left.
                    </p>
                  </div>
                </div>
              ) : (
                platforms.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 px-6 flex justify-between items-center hover:bg-white/[0.03] transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-2xl object-cover bg-white/5 border border-white/10 p-1 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-purple-900/40">
                          {p.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-base tracking-tight truncate">
                          {p.name}
                        </h4>
                        <span className="text-[10px] font-mono text-neutral-500 block truncate">
                          slug: {p.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}