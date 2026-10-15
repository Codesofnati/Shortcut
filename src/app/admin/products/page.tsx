"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [serviceType, setServiceType] = useState("Views");
  const [pricingType, setPricingType] = useState("quantity");
  const [priceInput, setPriceInput] = useState("");
  const [averageTime, setAverageTime] = useState("13 minutes");
  const [minOrder, setMinOrder] = useState("100");
  const [maxOrder, setMaxOrder] = useState("1000000");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const [prodRes, platRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/platforms`),
      ]);
      const prodData = await prodRes.json();
      const platData = await platRes.json();

      if (prodData.success) setProducts(prodData.products);
      if (platData.success) {
        setPlatforms(platData.platforms);
        if (platData.platforms.length > 0 && !category) {
          setCategory(platData.platforms[0].name);
          setImageUrl(platData.platforms[0].imageUrl || "");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlatformChange = (selectedName: string) => {
    setCategory(selectedName);
    const found = platforms.find((p) => p.name === selectedName);
    if (found) setImageUrl(found.imageUrl || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const priceInCents = Math.round(Number(priceInput) * 100);
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: priceInCents,
          currency: "ETB",
          category,
          imageUrl,
          serviceType,
          badge: badge ? badge : null,
          pricingType,
          averageTime,
          minOrder: pricingType === "quantity" ? Number(minOrder) : 1,
          maxOrder: pricingType === "quantity" ? Number(maxOrder) : 1,
          active,
          deliveryTime: averageTime,
        }),
      });

      const data = await res.json();
      if (data.success) {
        handleReset();
        fetchData();
        router.refresh();
        alert(editingId ? "Product updated successfully!" : "Product added successfully!");
      } else {
        alert(data.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setImageUrl(p.imageUrl || "");
    setServiceType(p.serviceType || "Views");
    setPricingType(p.pricingType || "quantity");
    setPriceInput((p.price / 100).toString());
    setAverageTime(p.averageTime || "Instant");
    setMinOrder((p.minOrder || 100).toString());
    setMaxOrder((p.maxOrder || 1000000).toString());
    setDescription(p.description || "");
    setBadge(p.badge || "");
    setActive(p.active);
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
    if (platforms.length > 0) {
      setCategory(platforms[0].name);
      setImageUrl(platforms[0].imageUrl || "");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchData();
        router.refresh();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  const inputCls =
    "w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/10 transition text-xs";

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
              Products &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-serif italic">
                Pricing.
              </span>
            </h1>
            <p className="text-neutral-400 text-sm mt-2">
              Manage SMM packages or flat-rate digital subscriptions like Canva Pro.
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl text-xs font-bold transition"
          >
            ← Back to Overview
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-4">
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl sticky top-6 overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-purple-500/15 blur-3xl rounded-full" />

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold tracking-tight">
                    {editingId ? "Edit Item" : "Add New Store Item"}
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
                      Item / Service Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Canva Pro 1 Year Subscription"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                      Platform / Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => handlePlatformChange(e.target.value)}
                      required
                      className={inputCls}
                    >
                      {platforms.map((p) => (
                        <option key={p.id} value={p.name} className="bg-neutral-900">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                      Pricing Model
                    </label>
                    <select
                      value={pricingType}
                      onChange={(e) => setPricingType(e.target.value)}
                      className={inputCls}
                    >
                      <option value="quantity" className="bg-neutral-900">
                        Quantity-Based (per 1k)
                      </option>
                      <option value="flat" className="bg-neutral-900">
                        Flat-Rate (Subscription)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                      Display Section (Homepage Tab)
                    </label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className={inputCls}
                    >
                      <option value="" className="bg-neutral-900">
                        None (Hidden from tabs)
                      </option>
                      <option value="new" className="bg-neutral-900">
                        ✨ New Arrival
                      </option>
                      <option value="best_seller" className="bg-neutral-900">
                        🔥 Very Selled
                      </option>
                      <option value="top" className="bg-neutral-900">
                        ⭐ Top Feature
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                        {pricingType === "quantity"
                          ? "Rate / 1k (ETB)"
                          : "Flat Price (ETB)"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        placeholder={pricingType === "quantity" ? "300" : "250"}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                        Delivery Speed
                      </label>
                      <input
                        type="text"
                        value={averageTime}
                        onChange={(e) => setAverageTime(e.target.value)}
                        placeholder="Instant"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {pricingType === "quantity" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                          Min Order
                        </label>
                        <input
                          type="number"
                          value={minOrder}
                          onChange={(e) => setMinOrder(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                          Max Order
                        </label>
                        <input
                          type="number"
                          value={maxOrder}
                          onChange={(e) => setMaxOrder(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                      Description & Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter account credentials instructions..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/5 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="active"
                      className="text-neutral-300 font-medium cursor-pointer"
                    >
                      Active on Storefront
                    </label>
                  </div>

                  <div className="flex gap-2 pt-3">
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
                          ? "Update Item"
                          : "Add Item"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Table Column */}
          <div className="lg:col-span-8">
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full" />

              <div className="relative p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-base font-bold tracking-tight">
                  Active Store Catalog
                </h3>
                <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  {products.length} items
                </span>
              </div>

              <div className="relative overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-bold">
                    <tr>
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Price / Rate</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-neutral-500"
                        >
                          <div className="inline-flex flex-col items-center gap-2">
                            <span className="text-3xl opacity-40">📦</span>
                            <p className="text-sm font-medium">
                              No items found.
                            </p>
                            <p className="text-[11px] text-neutral-600">
                              Add one using the form on the left.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-white/[0.03] transition group"
                        >
                          <td className="p-4 font-semibold text-white">
                            {p.name}
                            <span className="block text-[10px] font-mono text-neutral-500 mt-0.5">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block border ${
                                p.pricingType === "flat"
                                  ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                                  : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                              }`}
                            >
                              {p.pricingType === "flat" ? "Flat-Rate" : "Quantity"}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-emerald-400">
                            {(p.price / 100).toLocaleString()}{" "}
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {p.currency} {p.pricingType === "quantity" ? "/1k" : "flat"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                p.active
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-300 border-red-500/20"
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
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-lg text-[11px] font-bold transition cursor-pointer"
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