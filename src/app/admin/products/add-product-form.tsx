"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [serviceType, setServiceType] = useState("Views");
  const [priceInEtb, setPriceInEtb] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("new");
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${API_URL}/api/platforms`)

      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.platforms.length > 0) {
          setPlatforms(data.platforms);
          setCategory(data.platforms[0].name);
          setImageUrl(data.platforms[0].imageUrl || "");
        } else {
          setPlatforms([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load platforms:", err);
        setPlatforms([]);
      });
  }, []);

  const handlePlatformChange = (selectedName: string) => {
    setCategory(selectedName);
    const found = platforms.find((p) => p.name === selectedName);
    if (found) setImageUrl(found.imageUrl || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const priceInCents = Math.round(Number(priceInEtb) * 100);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: priceInCents,
          currency: "ETB",
          category,
          imageUrl,
          serviceType,
          badge,
          deliveryTime: "Instant / 24h",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setName("");
        setPriceInEtb("");
        setDescription("");
        setBadge("new");
        router.refresh();
        alert("Product added successfully!");
      } else {
        alert(data.message || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/10 transition text-xs";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
          Service Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., TikTok 5,000 Views"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
          Platform Category
        </label>
        <select
          value={category}
          onChange={(e) => handlePlatformChange(e.target.value)}
          required
          className={inputCls}
        >
          {platforms.length === 0 ? (
            <option value="" className="bg-neutral-900">
              No platforms found — add one first
            </option>
          ) : (
            platforms.map((p) => (
              <option key={p.id} value={p.name} className="bg-neutral-900">
                {p.name}
              </option>
            ))
          )}
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

      <div>
        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
          Service Type
        </label>
        <input
          type="text"
          required
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          placeholder="e.g., Views, Followers, Verification"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
          Price in ETB
        </label>
        <input
          type="number"
          step="0.01"
          required
          value={priceInEtb}
          onChange={(e) => setPriceInEtb(e.target.value)}
          placeholder="e.g., 150"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Fast delivery, high quality..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-lg shadow-purple-900/40 overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="relative">
          {loading ? "Saving..." : "Add Product to Store"}
        </span>
      </button>
    </form>
  );
}