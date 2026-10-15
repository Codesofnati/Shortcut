"use client";
import { useState } from "react";

export default function OrderFlow({ products }: { products: any[] }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [targetLink, setTargetLink] = useState("");
const [userEmail, setUserEmail] = useState("");
const [loading, setLoading] = useState(false);

const handleCheckout = async () => {
  setLoading(true);
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail || "guest@mekrez.com",
        productId: selectedProduct.id,
        quantity: 1,
        metadata: { targetLink }, // Passed directly to JSONB field
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert(`Order placed successfully! Order ID: ${data.order.id}`);
      // Reset flow or redirect to success page
      setSelectedProduct(null);
      setTargetLink("");
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong during checkout.");
  } finally {
    setLoading(false);
  }
};
  // Step 1: Unique platforms from database (e.g., TikTok, Instagram)
  const platforms = Array.from(new Set(products.map((p) => p.category)));

  // Step 2: Service types available for chosen platform (e.g., Views, Followers)
  const serviceTypes = Array.from(
    new Set(
      products
        .filter((p) => p.category === selectedPlatform)
        .map((p) => p.serviceType)
    )
  );

  // Step 3: Specific packages/quantities for platform + service type
  const availablePackages = products.filter(
    (p) => p.category === selectedPlatform && p.serviceType === selectedServiceType
  );

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 border border-gray-800 rounded-2xl text-white">
      <h2 className="text-2xl font-bold mb-6">Select Your Service</h2>

      {/* STAGE 1: Choose Platform */}
      {!selectedPlatform && (
        <div>
          <label className="text-sm text-gray-400 mb-2 block">1. Choose Platform</label>
          <div className="grid grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform as string)}
                className="p-4 bg-gray-800 hover:bg-purple-600 rounded-xl font-semibold transition"
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: Choose Service Type */}
      {selectedPlatform && !selectedServiceType && (
        <div>
          <button
            onClick={() => setSelectedPlatform(null)}
            className="text-xs text-purple-400 mb-4 hover:underline"
          >
            ← Back to Platforms
          </button>
          <label className="text-sm text-gray-400 mb-2 block">2. Choose Service for {selectedPlatform}</label>
          <div className="grid grid-cols-2 gap-4">
            {serviceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedServiceType(type as string)}
                className="p-4 bg-gray-800 hover:bg-purple-600 rounded-xl font-semibold transition"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 3: Choose Quantity / Package */}
      {selectedServiceType && !selectedProduct && (
        <div>
          <button
            onClick={() => setSelectedServiceType(null)}
            className="text-xs text-purple-400 mb-4 hover:underline"
          >
            ← Back to Services
          </button>
          <label className="text-sm text-gray-400 mb-2 block">3. Select Package Amount</label>
          <div className="space-y-3">
            {availablePackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedProduct(pkg)}
                className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl flex justify-between items-center cursor-pointer transition"
              >
                <div>
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <p className="text-xs text-gray-400">{pkg.description}</p>
                </div>
                <span className="font-bold text-green-400">{pkg.price / 100} {pkg.currency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 4: Enter Link / Requirements & Checkout */}
      {selectedProduct && (
        <div>
          <button
            onClick={() => setSelectedProduct(null)}
            className="text-xs text-purple-400 mb-4 hover:underline"
          >
            ← Back to Packages
          </button>
          <div className="bg-gray-800 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
            <p className="text-green-400 font-bold mt-1">{selectedProduct.price / 100} {selectedProduct.currency}</p>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">
              {selectedProduct.requirements?.label || "Target URL or Username"}
            </label>
            <input
              type="text"
              value={targetLink}
              onChange={(e) => setTargetLink(e.target.value)}
              placeholder="Paste link here..."
              className="w-full p-3 bg-gray-950 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            disabled={!targetLink}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition"
            onClick={() => alert(`Processing order for ${selectedProduct.name} to target: ${targetLink}`)}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}