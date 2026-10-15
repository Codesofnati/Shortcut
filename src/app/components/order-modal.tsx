"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderModal({ product, onClose }: { product: any; onClose: () => void }) {
  const router = useRouter();
  const [targetInput, setTargetInput] = useState("");
  const [email, setEmail] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  
  const isFlatRate = product.pricingType === "flat";
  // Use a string state so clearing the field completely doesn't force a strict "0"
  const [quantityStr, setQuantityStr] = useState(isFlatRate ? "1" : String(product.minOrder || 100));

  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [loading, setLoading] = useState(false);

  const parsedQty = Number(quantityStr) || 0;

  // Dynamic Total Price Calculation
  const calculateTotal = () => {
    const basePriceInEtb = product.price / 100;
    if (isFlatRate) {
      return basePriceInEtb.toFixed(2);
    } else {
      return ((basePriceInEtb / 1000) * parsedQty).toFixed(2);
    }
  };

  const handleQuantityChange = (val: string) => {
    setQuantityStr(val);
    const num = Number(val);
    // If user types greater than 500 for a quick modal order, redirect them to the full dashboard flow
    if (!isFlatRate && num > 500) {
      router.push("/dashboard");
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !targetInput) return;
    if (!isFlatRate && (parsedQty < 100 || parsedQty > 500)) {
      alert("Minimum order is 100. For orders greater than 500, please use the main Dashboard.");
      router.push("/dashboard");
      return;
    }
    setStep("payment");
  };

  const handleFinalCheckout = async () => {
    if (!paymentRef) {
      alert("Please enter your payment reference / transaction ID.");
      return;
    }
    setLoading(true);

    try {
      const totalAmountInCents = Math.round(Number(calculateTotal()) * 100);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productId: product.id,
          quantity: isFlatRate ? 1 : parsedQty,
          totalAmount: totalAmountInCents,
          metadata: {
            target: targetInput,
            paymentReference: paymentRef,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStep("success");
      } else {
        alert(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-[#1A1625] via-neutral-900 to-[#0F0D15] border border-white/10 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl shadow-purple-900/40 overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-purple-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-fuchsia-600/20 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white text-sm transition cursor-pointer"
        >
          ✕
        </button>

        <div className="relative">
          {/* STEP 1: Details Form */}
          {step === "form" && (
            <div>
              <span className="text-[10px] uppercase tracking-[0.15em] text-purple-300 font-bold px-3 py-1 bg-purple-500/15 border border-purple-400/20 rounded-full inline-block">
                {product.category}
              </span>
              <h2 className="text-xl font-extrabold mt-3 tracking-tight">{product.name}</h2>
              <p className="text-neutral-400 text-sm mt-1 leading-relaxed">{product.description}</p>

              {/* Price Calculation Box */}
              <div className="my-4 p-4 bg-white/5 rounded-2xl flex justify-between items-center border border-white/10 backdrop-blur-sm">
                <div>
                  <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block">Total Price</span>
                  {!isFlatRate && (
                    <span className="text-[10px] text-neutral-500">Rate: {product.price / 100} {product.currency} per 1k</span>
                  )}
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 font-extrabold text-lg">
                  {calculateTotal()} {product.currency}
                </span>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Your Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition text-sm"
                  />
                </div>

                {/* Conditional Quantity Field */}
                {!isFlatRate && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                      Quantity (100 — 500)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={500}
                      required
                      value={quantityStr}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition text-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
                        {[100, 250, 500].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setQuantityStr(String(num))}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-neutral-300 transition cursor-pointer"
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <span>For more quantity:</span>
                        <a href="/dashboard" className="text-purple-400 hover:underline font-bold">
                          Dashboard →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    {isFlatRate
                      ? "Account Email / Username for Delivery"
                      : "Target Profile URL / Username"}
                  </label>
                  <input
                    type="text"
                    required
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder={
                      isFlatRate
                        ? "e.g., your-email@gmail.com"
                        : "https://instagram.com/username"
                    }
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/10 transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl transition mt-2 shadow-lg shadow-purple-900/40 cursor-pointer text-sm inline-flex items-center justify-center gap-2"
                >
                  Proceed to Payment ({calculateTotal()} {product.currency})
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: ETB Payment Instructions & Reference */}
          {step === "payment" && (
            <div>
              <span className="text-[10px] uppercase tracking-[0.15em] text-amber-300 font-bold px-3 py-1 bg-amber-500/15 border border-amber-400/20 rounded-full inline-block">
                Step 2 · Send Payment
              </span>
              <h2 className="text-xl font-extrabold mt-3 tracking-tight">Transfer ETB</h2>
              <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                Please transfer{" "}
                <span className="text-emerald-400 font-bold">
                  {calculateTotal()} {product.currency}
                </span>{" "}
                using one of the methods below, then paste your transaction ID.
              </p>

              <div className="my-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2.5 text-xs backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Telebirr</span>
                  <span className="font-mono font-bold text-white tracking-wider">
                    0984181221
                  </span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Account Name</span>
                  <span className="font-semibold text-white">Nitnael</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1.5 font-bold">
                    Transaction Reference / Receipt ID
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g., FT2438910XYZ"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition text-sm uppercase font-mono tracking-wider"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1.5">
                    We verify payments manually before processing fulfillment.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={loading || !paymentRef}
                    onClick={handleFinalCheckout}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm cursor-pointer shadow-lg shadow-emerald-900/40"
                  >
                    {loading ? "Submitting..." : "Confirm & Submit Order"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === "success" && (
            <div className="text-center py-6">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-900/50 border border-emerald-300/30">
                  ✓
                </div>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Order Placed Successfully!</h3>
              <p className="text-neutral-400 text-xs mt-2 leading-relaxed">
                Your order is recorded as{" "}
                <span className="text-amber-400 font-bold uppercase">New</span>. Once we verify
                your payment reference (
                <span className="font-mono text-white">{paymentRef}</span>), we will fulfill your
                item immediately!
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-purple-900/40"
              >
                Done · Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}