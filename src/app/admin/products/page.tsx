"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const [products, setProducts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPlatformId, setSelectedPlatformId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("Followers");
  const [pricingType, setPricingType] = useState("quantity");
  const [priceInput, setPriceInput] = useState("");
  const [averageTime, setAverageTime] = useState("13 minutes");
  const [minOrder, setMinOrder] = useState("100");
  const [maxOrder, setMaxOrder] = useState("1000000");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [active, setActive] = useState(true);

  // Rich attributes
  const [quality, setQuality] = useState("");
  const [speed, setSpeed] = useState("");
  const [startTime, setStartTime] = useState("");
  const [refill, setRefill] = useState("No Refill");
  const [dropRate, setDropRate] = useState("");
  const [serverInfo, setServerInfo] = useState("");
  const [tags, setTags] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    if (data.success) setProducts(data.products);
  };

  const fetchPlatforms = async () => {
    const res = await fetch(`${API_URL}/api/platforms`);
    const data = await res.json();
    if (data.success) {
      setPlatforms(data.platforms);
      if (data.platforms.length > 0) setSelectedPlatformId(data.platforms[0].id);
    }
  };

  const fetchCategories = async (platformId: string) => {
    const res = await fetch(`${API_URL}/api/service-categories?platformId=${platformId}`);
    const data = await res.json();
    if (data.success) {
      setCategories(data.categories);
      if (data.categories.length > 0) setCategoryId(data.categories[0].id);
      else setCategoryId("");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (selectedPlatformId) fetchCategories(selectedPlatformId);
  }, [selectedPlatformId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const priceInCents = Math.round(Number(priceInput) * 100);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          name,
          slug,
          description,
          price: priceInCents,
          currency: "ETB",
          serviceType,
          badge: badge || null,
          pricingType,
          averageTime,
          minOrder: pricingType === "quantity" ? Number(minOrder) : 1,
          maxOrder: pricingType === "quantity" ? Number(maxOrder) : 1,
          active,
          deliveryTime: averageTime,
          quality,
          speed,
          startTime,
          refill,
          dropRate,
          serverInfo,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success) {
        handleReset();
        fetchProducts();
        router.refresh();
        alert(editingId ? "Product updated!" : "Product added!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setCategoryId(p.categoryId);
    setName(p.name);
    setServiceType(p.serviceType || "Followers");
    setPricingType(p.pricingType || "quantity");
    setPriceInput((p.price / 100).toString());
    setAverageTime(p.averageTime || "Instant");
    setMinOrder((p.minOrder || 100).toString());
    setMaxOrder((p.maxOrder || 1000000).toString());
    setDescription(p.description || "");
    setBadge(p.badge || "");
    setActive(p.active);
    setQuality(p.quality || "");
    setSpeed(p.speed || "");
    setStartTime(p.startTime || "");
    setRefill(p.refill || "No Refill");
    setDropRate(p.dropRate || "");
    setServerInfo(p.serverInfo || "");
    setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
  };

  const handleReset = () => {
    setEditingId(null);
    setName("");
    setPriceInput("");
    setPricingType("quantity");
    setAverageTime("13 minutes");
    setMinOrder("100");
    setMaxOrder("1000000");
    setDescription("");
    setBadge("");
    setActive(true);
    setQuality("");
    setSpeed("");
    setStartTime("");
    setRefill("No Refill");
    setDropRate("");
    setServerInfo("");
    setTags("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchProducts();
    else alert(data.message);
  };

  const inputCls =
    "w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 text-xs";

  const labelCls = "text-[10px] uppercase text-neutral-400 block mb-1.5 font-bold";

  return (
    <div className="relative p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-2">
              Broker Admin
            </p>
            <h1 className="text-3xl font-extrabold">Products & Pricing</h1>
            <p className="text-neutral-400 text-sm mt-2">
              Add products with rich attributes like refill, speed, quality.
            </p>
          </div>
          <a
            href="/admin"
            className="px-5 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-bold"
          >
            ← Back
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold">
                  {editingId ? "Edit Product" : "Add Product"}
                </h3>
                {editingId && (
                  <span className="text-[10px] font-bold uppercase text-purple-300 bg-purple-500/10 border border-purple-400/20 px-2.5 py-1 rounded-full">
                    Editing
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Platform</label>
                  <select
                    value={selectedPlatformId}
                    onChange={(e) => setSelectedPlatformId(e.target.value)}
                    className={inputCls}
                  >
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className={inputCls}
                  >
                    {categories.length === 0 ? (
                      <option value="" className="bg-neutral-900">
                        No categories — add one first
                      </option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-neutral-900">
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Service Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., YouTube Subscribers"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Service Type</label>
                    <input
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      placeholder="e.g., Followers"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Pricing Model</label>
                    <select
                      value={pricingType}
                      onChange={(e) => setPricingType(e.target.value)}
                      className={inputCls}
                    >
                      <option value="quantity" className="bg-neutral-900">
                        Per 1K
                      </option>
                      <option value="flat" className="bg-neutral-900">
                        Flat
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Display Badge</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className={inputCls}
                  >
                    <option value="" className="bg-neutral-900">None</option>
                    <option value="new" className="bg-neutral-900">✨ New</option>
                    <option value="best_seller" className="bg-neutral-900">🔥 Best Seller</option>
                    <option value="top" className="bg-neutral-900">⭐ Top</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      {pricingType === "quantity" ? "Rate/1k (ETB)" : "Flat Price (ETB)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Delivery Time</label>
                    <input
                      value={averageTime}
                      onChange={(e) => setAverageTime(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {pricingType === "quantity" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Min Order</label>
                      <input
                        type="number"
                        value={minOrder}
                        onChange={(e) => setMinOrder(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Max Order</label>
                      <input
                        type="number"
                        value={maxOrder}
                        onChange={(e) => setMaxOrder(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}

                {/* Rich Attributes */}
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-[11px] font-bold text-purple-400 mb-3">
                    Service Specifications
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Refill Policy</label>
                      <select
                        value={refill}
                        onChange={(e) => setRefill(e.target.value)}
                        className={inputCls}
                      >
                        <option value="No Refill" className="bg-neutral-900">No Refill</option>
                        <option value="Refill: 30 Days" className="bg-neutral-900">Refill: 30 Days</option>
                        <option value="Refill: 60 Days" className="bg-neutral-900">Refill: 60 Days</option>
                        <option value="Refill: Lifetime" className="bg-neutral-900">Refill: Lifetime</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Quality</label>
                      <input
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        placeholder="e.g., HQ"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Speed</label>
                      <input
                        value={speed}
                        onChange={(e) => setSpeed(e.target.value)}
                        placeholder="e.g., Up To 50-100/Day"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Start Time</label>
                      <input
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="e.g., Instant"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Drop Rate</label>
                      <input
                        value={dropRate}
                        onChange={(e) => setDropRate(e.target.value)}
                        placeholder="e.g., 0-10%"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Server</label>
                      <input
                        value={serverInfo}
                        onChange={(e) => setServerInfo(e.target.value)}
                        placeholder="e.g., Server 6"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Tags (comma-separated)</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., Best Seller, Lowest Price"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <label htmlFor="active" className="text-neutral-300 text-xs">
                    Active on Storefront
                  </label>
                </div>

                <div className="flex gap-2 pt-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleReset}
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
                    {loading ? "Saving..." : editingId ? "Update" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-7">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-base font-bold">Product Catalog</h3>
                <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full">
                  {products.length} items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase text-neutral-400">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-neutral-500">
                          No products yet.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.03]">
                          <td className="p-4">
                            <p className="font-semibold text-white">{p.name}</p>
                            <p className="text-[10px] text-neutral-500">
                              {p.platformName} · {p.serviceType}
                            </p>
                          </td>
                          <td className="p-4 text-xs text-neutral-400">
                            {p.categoryName || "—"}
                          </td>
                          <td className="p-4 font-bold text-emerald-400">
                            {(p.price / 100).toLocaleString()}{" "}
                            <span className="text-[10px] text-neutral-500">
                              {p.currency} {p.pricingType === "quantity" ? "/1k" : "flat"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                p.active
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-red-500/10 text-red-300"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.active ? "bg-emerald-400" : "bg-red-400"
                                }`}
                              />
                              {p.active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-[11px] font-bold"
                            >
                              Delete
                            </button>
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
      </div>
    </div>
  );
}