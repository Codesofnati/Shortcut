"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductForm() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  
  // Basic Info
  const [name, setName] = useState("");
  const [priceInEtb, setPriceInEtb] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Relations
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Rich Attributes (from screenshots)
  const [quality, setQuality] = useState("");
  const [speed, setSpeed] = useState("");
  const [startTime, setStartTime] = useState("");
  const [refill, setRefill] = useState("No Refill");
  const [dropRate, setDropRate] = useState("");
  const [serverInfo, setServerInfo] = useState("");
  const [tags, setTags] = useState(""); // Comma separated string

  // Fetch Platforms on mount
  useEffect(() => {
    fetch(`${API_URL}/api/platforms`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.platforms.length > 0) {
          setPlatforms(data.platforms);
          setSelectedPlatform(data.platforms[0].id);
        }
      });
  }, []);

  // Fetch Categories when Platform changes
  useEffect(() => {
    if (!selectedPlatform) return;
    fetch(`${API_URL}/api/service-categories?platformId=${selectedPlatform}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories.length > 0) {
          setCategories(data.categories);
          setSelectedCategory(data.categories[0].id);
        } else {
          setCategories([]);
          setSelectedCategory("");
        }
      });
  }, [selectedPlatform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const priceInCents = Math.round(Number(priceInEtb) * 100);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          name,
          slug,
          price: priceInCents,
          quality,
          speed,
          startTime,
          refill,
          dropRate,
          serverInfo,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Product added!");
        router.refresh();
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 text-xs";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* 1. Platform & Category Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Platform</label>
          <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className={inputCls}>
            {platforms.map(p => <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Category</label>
          <select required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputCls}>
            {categories.length === 0 ? (
              <option value="" className="bg-neutral-900">No categories found</option>
            ) : (
              categories.map(c => <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>)
            )}
          </select>
        </div>
      </div>

      {/* 2. Basic Info */}
      <div>
        <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Service Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., YouTube Subscribers" className={inputCls} />
      </div>
      
      <div>
        <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Price (ETB per 1000)</label>
        <input type="number" step="0.01" required value={priceInEtb} onChange={(e) => setPriceInEtb(e.target.value)} placeholder="15.00" className={inputCls} />
      </div>

      {/* 3. Rich Attributes (Matching the Screenshots) */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <h4 className="text-[11px] font-bold text-purple-400 mb-3">Service Specifications</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Refill Policy</label>
            <select value={refill} onChange={(e) => setRefill(e.target.value)} className={inputCls}>
              <option value="No Refill" className="bg-neutral-900">No Refill</option>
              <option value="Refill: 30 Days" className="bg-neutral-900">Refill: 30 Days</option>
              <option value="Refill: 60 Days" className="bg-neutral-900">Refill: 60 Days</option>
              <option value="Refill: Lifetime" className="bg-neutral-900">Refill: Lifetime</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Quality</label>
            <input value={quality} onChange={(e) => setQuality(e.target.value)} placeholder="e.g., HQ, Low Quality" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Speed</label>
            <input value={speed} onChange={(e) => setSpeed(e.target.value)} placeholder="e.g., Up To 50-100/Day" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Start Time</label>
            <input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="e.g., Instant" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Drop Rate</label>
            <input value={dropRate} onChange={(e) => setDropRate(e.target.value)} placeholder="e.g., 0-10%" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Server Info</label>
            <input value={serverInfo} onChange={(e) => setServerInfo(e.target.value)} placeholder="e.g., Server 6" className={inputCls} />
          </div>
        </div>
      </div>

      {/* 4. Badges / Tags */}
      <div>
        <label className="text-[10px] uppercase text-neutral-400 font-bold mb-1 block">Tags / Badges (Comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., Best Seller, Lowest Price" className={inputCls} />
      </div>

      <button type="submit" disabled={loading} className="w-full py-3.5 bg-purple-600 rounded-xl font-bold text-white mt-4">
        {loading ? "Saving..." : "Add Product"}
      </button>
    </form>
  );
}