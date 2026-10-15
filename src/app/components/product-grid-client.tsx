"use client";
import { useState } from "react";
import OrderModal from "./order-modal";

export default function ProductGridClient({ products }: { products: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Filter products by search query if user is typing
  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group products by their badge or category
  const categories = [
    { id: "new", label: "✨ New Arrivals", badge: "new" },
    { id: "best_seller", label: "🔥 Best Sellers", badge: "best_seller" },
    { id: "top", label: "⭐ Top Featured", badge: "top" },
  ];

  const cardThemes = [
    {
      bg: "bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE]",
      border: "border-purple-100",
      accent: "text-purple-700",
      glow: "hover:shadow-purple-200/50",
    },
    {
      bg: "bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]",
      border: "border-emerald-100",
      accent: "text-emerald-700",
      glow: "hover:shadow-emerald-200/50",
    },
    {
      bg: "bg-gradient-to-br from-[#FFF7ED] via-white to-[#FFEDD5]",
      border: "border-amber-100",
      accent: "text-amber-700",
      glow: "hover:shadow-amber-200/50",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Search Bar Header */}
      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search products and services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:border-purple-600 shadow-xs transition"
          />
        </div>
      </div>

      {/* If searching, show flat search results */}
      {searchQuery ? (
        <div>
          <h3 className="text-lg font-bold mb-6 text-neutral-900">Search Results</h3>
          {filteredProducts.length === 0 ? (
            <div className="p-8 bg-white border border-neutral-200 rounded-3xl text-center shadow-xs">
              <p className="text-neutral-500 text-xs">No products found matching "{searchQuery}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product, index) => renderCompactCard(product, index, cardThemes, setSelectedProduct))}
            </div>
          )}
        </div>
      ) : (
        /* Otherwise, show grouped rows for each category */
        categories.map((cat) => {
          const rowProducts = products.filter((p) => p.badge === cat.badge).slice(0, 3);

          if (rowProducts.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
                <h3 className="text-xl font-extrabold tracking-tight text-neutral-900">
                  {cat.label}
                </h3>
                <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                  {rowProducts.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rowProducts.map((product, index) => renderCompactCard(product, index, cardThemes, setSelectedProduct))}
              </div>
            </div>
          );
        })
      )}

      {/* Bottom Link to SMM Dashboard */}
      <div className="mt-16 text-center">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-purple-600/20"
        >
          Open Full Shortcut Dashboard & Order Flow →
        </a>
      </div>

      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

// Minimized, highly refined compact card component
function renderCompactCard(product: any, index: number, cardThemes: any[], setSelectedProduct: (p: any) => void) {
  const theme = cardThemes[index % cardThemes.length];
  const isFlat = product.pricingType === "flat";

  return (
    <div
      key={product.id}
      className={`group relative border ${theme.border} ${theme.bg} rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${theme.glow}`}
    >
      <div>
        {/* Top Header: Category & Badge */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 bg-white/70 border border-white/80 rounded-full text-neutral-600 shadow-xs">
            {product.category}
          </span>
          {product.badge && (
            <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-neutral-900 text-white shadow-xs">
              {product.badge === "new" ? "New" : product.badge === "best_seller" ? "Hot" : "Top"}
            </span>
          )}
        </div>

        {/* Minimalist Header Row with Small Image Icon & Title */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-white/90 overflow-hidden shrink-0 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className={`text-base font-extrabold ${theme.accent}`}>
                {product.category?.[0] || "S"}
              </span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-neutral-900 leading-snug line-clamp-1">
              {product.name}
            </h4>
            <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Order Action Bar */}
      <div className="mt-4 pt-3.5 border-t border-black/5 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">
            {isFlat ? "Price" : "Rate / 1k"}
          </span>
          <span className="text-base font-black text-neutral-900 leading-none">
            {(product.price / 100).toLocaleString()}
            <span className="text-[11px] font-bold text-neutral-500 ml-1">
              {product.currency}
            </span>
          </span>
        </div>

        <button
          onClick={() => setSelectedProduct(product)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-[11px] font-bold hover:bg-neutral-800 transition shadow-xs cursor-pointer group-hover:bg-purple-600"
          title="Select Service"
        >
          Order
          <span className="text-xs leading-none">→</span>
        </button>
      </div>
    </div>
  );
}