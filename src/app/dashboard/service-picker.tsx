"use client";
import { useEffect, useRef, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  pricingType: string;
  imageUrl?: string;
};

type Platform = {
  id: string;
  name: string;
  imageUrl?: string;
};

export default function ServicePicker({
  products,
  platforms,
  selectedService,
  onSelect,
}: {
  products: Product[];
  platforms: Platform[];
  selectedService: Product | null;
  onSelect: (p: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const getIcon = (p: Product) => {
    const plat = platforms.find((pl) => pl.name === p.category);
    return p.imageUrl || plat?.imageUrl;
  };

  const selectedIcon = selectedService ? getIcon(selectedService) : null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full p-3.5 bg-white border rounded-2xl text-sm font-medium text-left flex items-center gap-3 transition cursor-pointer ${
          open
            ? "border-purple-400 ring-4 ring-purple-100"
            : "border-neutral-200 hover:border-neutral-300"
        }`}
      >
        {selectedIcon ? (
          <img
            src={selectedIcon}
            alt=""
            className="w-7 h-7 rounded-lg object-cover bg-white border border-neutral-200 p-0.5 shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {selectedService?.category?.[0]?.toUpperCase() || "?"}
          </div>
        )}

        <span className="flex-1 min-w-0 truncate text-neutral-900">
          {selectedService
            ? `${selectedService.category} — ${selectedService.name}`
            : "Select a service"}
        </span>

        {selectedService && (
          <span className="text-[11px] font-bold text-emerald-600 shrink-0 hidden sm:inline">
            {selectedService.price / 100} {selectedService.currency}{" "}
            {selectedService.pricingType === "flat" ? "flat" : "/ 1k"}
          </span>
        )}

        <span
          className={`text-neutral-400 text-xs shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-96 overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl shadow-purple-300/20 p-1.5 backdrop-blur-sm">
          {products.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No services available for this platform.
            </div>
          ) : (
            products.map((p) => {
              const icon = getIcon(p);
              const isSelected = selectedService?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                    isSelected
                      ? "bg-purple-50 border border-purple-200"
                      : "hover:bg-neutral-50 border border-transparent"
                  }`}
                >
                  {icon ? (
                    <img
                      src={icon}
                      alt=""
                      className="w-9 h-9 rounded-xl object-cover bg-white border border-neutral-200 p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {p.category?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                      {p.category}
                    </p>
                    <p className="text-sm font-bold text-neutral-900 truncate">
                      {p.name}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-emerald-600">
                      {p.price / 100} {p.currency}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                      {p.pricingType === "flat" ? "flat" : "per 1k"}
                    </p>
                  </div>

                  {isSelected && (
                    <span className="text-purple-600 text-sm shrink-0">✓</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}