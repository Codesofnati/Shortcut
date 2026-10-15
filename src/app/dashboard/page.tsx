"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";

export default function SmmDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1000);
  const [targetLink, setTargetLink] = useState("");
  const [email, setEmail] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Custom picker open/close state
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/platforms").then((res) => res.json()),
    ])
      .then(([prodData, platData]) => {
        if (prodData.success) {
          setProducts(prodData.products);
          if (prodData.products.length > 0) {
            setSelectedService(prodData.products[0]);
            setQuantity(prodData.products[0].minOrder || 100);
          }
        }
        if (platData.success) {
          setPlatforms(platData.platforms);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Close picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close picker on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const filteredServices = products.filter(
    (p) =>
      selectedPlatform === "All" ||
      p.category.toLowerCase() === selectedPlatform.toLowerCase()
  );

  // ✅ Sync selected service with active platform filter
  // When the user clicks a new platform, if the currently-selected
  // service isn't in the new filtered list, auto-select the first one.
  useEffect(() => {
    if (products.length === 0) return;

    const stillVisible =
      selectedService &&
      filteredServices.some((p) => p.id === selectedService.id);

    if (!stillVisible) {
      const first = filteredServices[0] || null;
      setSelectedService(first);
      setQuantity(first?.minOrder || 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, products.length]);

  const currentPlatformObj = platforms.find(
    (p) => p.name === selectedService?.category
  );
  const serviceImageUrl = selectedService?.imageUrl || currentPlatformObj?.imageUrl;

  const getIcon = (p: any) => {
    const plat = platforms.find((pl) => pl.name === p.category);
    return p.imageUrl || plat?.imageUrl;
  };

  const calculateTotal = () => {
    if (!selectedService) return "0.00";
    const basePriceInEtb = selectedService.price / 100;

    if (selectedService.pricingType === "flat") {
      return basePriceInEtb.toFixed(2);
    } else {
      const total = (basePriceInEtb / 1000) * quantity;
      return total.toFixed(2);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLink || !selectedService || !email || !paymentRef) {
      alert("Please fill in all fields including your email and payment reference.");
      return;
    }
    setSubmitting(true);

    try {
      const totalAmountInCents = Math.round(Number(calculateTotal()) * 100);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productId: selectedService.id,
          quantity: selectedService.pricingType === "flat" ? 1 : quantity,
          totalAmount: totalAmountInCents,
          metadata: { target: targetLink, paymentReference: paymentRef },
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Order placed successfully! We will verify your payment and process it.");
        setTargetLink("");
        setPaymentRef("");
        setEmail("");
      } else {
        alert(data.message || "Order failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting order.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedIcon = selectedService ? getIcon(selectedService) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBFBFA] via-white to-[#FAF8FF] text-neutral-900 font-sans selection:bg-purple-200 relative overflow-x-hidden">
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] bg-purple-300/25 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-300/20 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/3" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 w-[400px] h-[400px] bg-emerald-200/10 blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/2" />

      <Navbar />

      {/* Platform Filter Bar */}
      <div className="relative bg-white/70 backdrop-blur-xl border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2.5 overflow-x-auto">
          <button
            onClick={() => setSelectedPlatform("All")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              selectedPlatform === "All"
                ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-300/40 scale-[1.02]"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
            }`}
          >
            <span>✨</span> All Platforms
          </button>
          {platforms.map((plat) => (
            <button
              key={plat.id}
              onClick={() => setSelectedPlatform(plat.name)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                selectedPlatform === plat.name
                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-300/40 scale-[1.02]"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              {plat.imageUrl && (
                <img
                  src={plat.imageUrl}
                  alt=""
                  className="w-4 h-4 rounded object-cover"
                />
              )}
              {plat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Page Header */}
      <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-600 font-bold mb-2">
              SMM Dashboard
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
              Place your order,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 font-serif italic">
                in seconds.
              </span>
            </h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-md">
              Pick a service, enter your details, and confirm your payment reference
              — we'll handle the rest.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-neutral-600 bg-white/80 border border-neutral-200 rounded-full px-4 py-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {filteredServices.length} services available
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="relative max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleOrderSubmit}
            className="relative bg-white/85 backdrop-blur-sm border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_40px_-20px_rgba(139,92,246,0.15)] space-y-8 overflow-hidden"
          >
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-purple-200/50 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-200/30 blur-3xl rounded-full" />

            <div className="relative space-y-8">
              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-xs flex items-center justify-center font-bold shadow-md shadow-purple-300/50 ring-4 ring-purple-100/60">
                    1
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 tracking-tight leading-tight">
                      Choose a service
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Browse by platform above, or pick from the list
                    </p>
                  </div>
                </div>

                {/* Custom Service Picker */}
                <div ref={pickerRef} className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    className={`w-full p-3.5 bg-white border rounded-2xl text-sm font-medium text-left flex items-center gap-3 transition cursor-pointer ${
                      pickerOpen
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
                        pickerOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Dropdown */}
                  {pickerOpen && (
                    <div className="absolute z-50 mt-2 w-full max-h-96 overflow-y-auto bg-white border border-neutral-200 rounded-2xl shadow-2xl shadow-purple-300/20 p-1.5">
                      {filteredServices.length === 0 ? (
                        <div className="p-6 text-center text-xs text-neutral-500">
                          No services available for this platform.
                        </div>
                      ) : (
                        filteredServices.map((p) => {
                          const icon = getIcon(p);
                          const isSelected = selectedService?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedService(p);
                                setQuantity(p.minOrder || 100);
                                setPickerOpen(false);
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
                                <span className="text-purple-600 text-sm shrink-0">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-xs flex items-center justify-center font-bold shadow-md shadow-purple-300/50 ring-4 ring-purple-100/60">
                    2
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 tracking-tight leading-tight">
                      Your details
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Where we deliver and how we reach you
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1.5 font-bold">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full p-4 bg-white border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1.5 font-bold">
                      {selectedService?.pricingType === "flat"
                        ? "Account Email / Username for delivery"
                        : "Target URL / Username"}
                    </label>
                    <input
                      type="text"
                      required
                      value={targetLink}
                      onChange={(e) => setTargetLink(e.target.value)}
                      placeholder={
                        selectedService?.pricingType === "flat"
                          ? "e.g. your-email@gmail.com"
                          : "https://www.instagram.com/username"
                      }
                      className="w-full p-4 bg-white border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition"
                    />
                  </div>

                  {selectedService?.pricingType !== "flat" && (
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1.5 font-bold">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={selectedService?.minOrder || 10}
                        max={selectedService?.maxOrder || 10000000}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full p-4 bg-white border border-neutral-200 rounded-2xl font-bold text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[100, 500, 1000, 5000].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuantity(num)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              quantity === num
                                ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                                : "bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700"
                            }`}
                          >
                            +{num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="relative rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 overflow-hidden">
                <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 bg-amber-200/40 blur-3xl rounded-full" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💳</span>
                    <h4 className="font-bold text-sm text-neutral-900 tracking-tight">
                      Payment Instructions
                    </h4>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                    Send the exact total to one of the accounts below, then paste your
                    transaction ID in the field at the bottom of this form.
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
                          TB
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                            Telebirr
                          </p>
                          <p className="font-mono font-bold text-sm text-neutral-900 truncate">
                            0984181221
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText("0984181221")
                        }
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition cursor-pointer shrink-0"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold shrink-0">
                          @
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                            Account Name
                          </p>
                          <p className="font-bold text-sm text-neutral-900 truncate">
                            Nitnael
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3 bg-white border border-neutral-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                          ETB
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                            Amount to Send
                          </p>
                          <p className="font-bold text-sm text-emerald-600 truncate">
                            {calculateTotal()} {selectedService?.currency || "ETB"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1.5 font-bold">
                      Payment Reference / Transaction ID
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. FT2438910XYZ"
                      className="w-full p-4 bg-white border border-neutral-200 rounded-2xl text-sm uppercase font-mono tracking-wider focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1.5">
                      We verify payments manually before fulfillment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

              {/* Step 3 */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-xs flex items-center justify-center font-bold shadow-md shadow-purple-300/50 ring-4 ring-purple-100/60">
                    3
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 tracking-tight leading-tight">
                      Review & place
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      One last look before we get to work
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-neutral-50 via-white to-purple-50/50 border border-neutral-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>Pricing Model</span>
                    <span className="font-bold text-neutral-900 uppercase tracking-wide">
                      {selectedService?.pricingType === "flat"
                        ? "Flat-Rate Subscription"
                        : "Quantity Based"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span>Delivery Speed</span>
                    <span className="font-bold text-purple-600">
                      {selectedService?.averageTime || "Instant"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-neutral-200/80">
                    <span className="text-sm font-bold text-neutral-900">
                      Total Price
                    </span>
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600 text-2xl leading-none">
                      {calculateTotal()}{" "}
                      <span className="text-sm">
                        {selectedService?.currency || "ETB"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-300/50 cursor-pointer overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative inline-flex items-center justify-center gap-2">
                  {submitting
                    ? "Submitting..."
                    : `Submit Order — ${calculateTotal()} ${
                        selectedService?.currency || "ETB"
                      }`}
                  {!submitting && (
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          {selectedService && (
            <>
              <div className="relative bg-white/85 backdrop-blur-sm border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_40px_-20px_rgba(139,92,246,0.15)] space-y-6 overflow-hidden lg:sticky lg:top-24">
                <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-200/40 blur-3xl rounded-full" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 bg-purple-200/30 blur-3xl rounded-full" />

                <div className="relative bg-gradient-to-br from-purple-700 via-purple-900 to-neutral-900 text-white p-6 rounded-2xl shadow-lg shadow-purple-300/30 flex items-center gap-4 overflow-hidden">
                  <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/30 blur-3xl rounded-full" />
                  <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full" />
                  {serviceImageUrl ? (
                    <img
                      src={serviceImageUrl}
                      alt=""
                      className="relative w-16 h-16 rounded-2xl object-cover bg-white/10 p-1 border border-white/20 shrink-0"
                    />
                  ) : (
                    <div className="relative w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shrink-0 flex items-center justify-center text-xl font-bold">
                      {selectedService.category?.[0] || "S"}
                    </div>
                  )}
                  <div className="relative flex-1 min-w-0">
                    <span className="text-[10px] bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {selectedService.category}
                    </span>
                    <h2 className="text-lg font-extrabold mt-2 truncate tracking-tight">
                      {selectedService.name}
                    </h2>
                  </div>
                </div>

                <div className="relative grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider mb-1">
                      {selectedService.pricingType === "flat"
                        ? "Subscription Price"
                        : "Rate / 1k"}
                    </span>
                    <span className="font-extrabold text-sm text-neutral-900">
                      {(selectedService.price / 100).toLocaleString()}{" "}
                      {selectedService.currency}
                    </span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider mb-1">
                      Delivery Time
                    </span>
                    <span className="font-extrabold text-sm text-purple-600">
                      {selectedService.averageTime || "Instant"}
                    </span>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-neutral-200/80 bg-white/60 overflow-hidden">
                  {[
                    { label: "Start Time", value: "Instant", icon: "⏳" },
                    { label: "Link Format", value: "Post Link", icon: "🔗" },
                  ].map((row, i, arr) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between px-4 py-3 text-xs ${
                        i !== arr.length - 1 ? "border-b border-neutral-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 text-neutral-600 font-semibold">
                        <span>{row.icon}</span>
                        {row.label}
                      </div>
                      <span className="font-bold text-neutral-900 text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative space-y-3 text-xs text-neutral-600">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-[0.15em] text-[10px]">
                    Description & Instructions
                  </h4>
                  <p className="leading-relaxed bg-gradient-to-br from-neutral-50 to-purple-50/30 p-4 rounded-2xl border border-neutral-200/80 text-neutral-600 whitespace-pre-line">
                    {selectedService.description}
                  </p>
                </div>

                <div className="relative rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📌</span>
                    <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                      Before you order
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Before submitting your order, double-check the link format and
                    follow the instructions.
                  </p>
                </div>

                <div className="relative space-y-2">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-[0.15em] text-[10px] mb-2">
                    Common Mistakes to Avoid
                  </h4>
                  {[
                    "Using a private link when a public link is required (check the Link Format above).",
                    "Submitting a duplicate order for the same link before the first is fully delivered.",
                    "Changing the link while your order is in progress — this marks it completed and voids any refund.",
                  ].map((tip) => (
                    <div
                      key={tip}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-800 leading-relaxed"
                    >
                      <span className="text-red-500 font-bold shrink-0 mt-[1px]">
                        ✕
                      </span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white/70 backdrop-blur-sm border border-neutral-200/70 rounded-2xl">
                  <span className="text-lg">⚡</span>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
                    Fast start
                  </p>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-sm border border-neutral-200/70 rounded-2xl">
                  <span className="text-lg">🔒</span>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
                    Verified
                  </p>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-sm border border-neutral-200/70 rounded-2xl">
                  <span className="text-lg">💬</span>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
                    Support
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}