"use client";
import { useState, useEffect } from "react";

export default function AdminCategoriesPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [platformId, setPlatformId] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchData = async () => {
    try {
      const [platRes, catRes] = await Promise.all([
        fetch(`${API_URL}/api/platforms`),
        fetch(`${API_URL}/api/service-categories`),
      ]);
      const platData = await platRes.json();
      const catData = await catRes.json();

      if (platData.success) {
        setPlatforms(platData.platforms);
        if (platData.platforms.length > 0 && !platformId) {
          setPlatformId(platData.platforms[0].id);
        }
      }
      if (catData.success) setCategories(catData.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformId || !name) return;
    setLoading(true);

    try {
      const url = editingId
        ? `${API_URL}/api/service-categories/${editingId}`
        : `${API_URL}/api/service-categories`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId, name }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setEditingId(null);
        fetchData();
        alert(editingId ? "Category updated!" : "Category added!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setPlatformId(cat.platformId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? All products under it will be removed.")) return;
    try {
      const res = await fetch(`${API_URL}/api/service-categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchData();
      else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const platformName = (id: string) => platforms.find((p) => p.id === id)?.name || "—";

  const inputCls =
    "w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 text-xs";

  return (
    <div className="relative p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-2">
              Broker Admin
            </p>
            <h1 className="text-3xl font-extrabold">Service Categories</h1>
            <p className="text-neutral-400 text-sm mt-2">
              Add categories (e.g., YouTube Subscribers) under a platform.
            </p>
          </div>
          <a
            href="/admin"
            className="px-5 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-bold"
          >
            ← Back
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 h-fit">
            <h3 className="text-base font-bold mb-5">
              {editingId ? "Edit Category" : "Add Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase text-neutral-400 block mb-1.5 font-bold">
                  Platform
                </label>
                <select
                  value={platformId}
                  onChange={(e) => setPlatformId(e.target.value)}
                  className={inputCls}
                  required
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id} className="bg-neutral-900">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-neutral-400 block mb-1.5 font-bold">
                  Category Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., YouTube Subscribers"
                  className={inputCls}
                />
              </div>
              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setName("");
                    }}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-xl text-xs disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Add Category"}
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-base font-bold">Existing Categories</h3>
              <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full">
                {categories.length} total
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {categories.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">No categories yet.</div>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="p-4 px-6 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">{cat.name}</h4>
                      <span className="text-[10px] text-neutral-500">
                        Platform: <strong>{platformName(cat.platformId)}</strong> · slug: {cat.slug}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-[11px] font-bold"
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