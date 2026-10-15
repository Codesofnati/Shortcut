import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log("🌱 Seeding database with categorized badges...");

  // Optional: clear existing products so you don't run into duplicate slugs
  await db.delete(schema.products);

  await db.insert(schema.products).values([
    // --- NEW PRODUCTS ---
    {
      name: "TikTok 1,000 Views",
      slug: "tiktok-1000-views",
      description: "Fast instant delivery TikTok video views.",
      price: 3000, // 30.00 ETB
      currency: "ETB",
      category: "TikTok",
      serviceType: "Views",
      badge: "new",
      deliveryType: "automatic",
      deliveryTime: "Instant",
      requirements: { type: "url", label: "TikTok Video URL" },
      active: true,
    },
    {
      name: "Instagram Reels 2,000 Views",
      slug: "instagram-reels-2000-views",
      description: "Boost your reach with instant Instagram Reels views.",
      price: 4500, // 45.00 ETB
      currency: "ETB",
      category: "Instagram",
      serviceType: "Views",
      badge: "new",
      deliveryType: "automatic",
      deliveryTime: "Instant",
      active: true,
    },
    {
      name: "Telegram Channel Members",
      slug: "telegram-channel-members",
      description: "Grow your Telegram community quickly.",
      price: 6000, // 60.00 ETB
      currency: "ETB",
      category: "Telegram",
      serviceType: "Members",
      badge: "new",
      deliveryType: "automatic",
      deliveryTime: "1-12 Hours",
      active: true,
    },

    // --- VERY SELLED (BEST SELLER) PRODUCTS ---
    {
      name: "TikTok 500 Followers",
      slug: "tiktok-500-followers",
      description: "Real-looking active followers for your TikTok account.",
      price: 25000, // 250.00 ETB
      currency: "ETB",
      category: "TikTok",
      serviceType: "Followers",
      badge: "best_seller",
      deliveryType: "automatic",
      deliveryTime: "1-24 Hours",
      requirements: { type: "text", label: "TikTok Profile Username" },
      active: true,
    },
    {
      name: "Instagram 1,000 Likes",
      slug: "instagram-1000-likes",
      description: "High-quality likes for your Instagram posts.",
      price: 12000, // 120.00 ETB
      currency: "ETB",
      category: "Instagram",
      serviceType: "Likes",
      badge: "best_seller",
      deliveryType: "automatic",
      deliveryTime: "Instant",
      active: true,
    },
    {
      name: "YouTube 500 Subscribers",
      slug: "youtube-500-subscribers",
      description: "Organic-looking channel subscribers to boost credibility.",
      price: 45000, // 450.00 ETB
      currency: "ETB",
      category: "YouTube",
      serviceType: "Subscribers",
      badge: "best_seller",
      deliveryType: "automatic",
      deliveryTime: "24-48 Hours",
      active: true,
    },

    // --- TOP FEATURED PRODUCTS ---
    {
      name: "Meta Verification Assist",
      slug: "meta-verification-assist",
      description: "Professional assistance for obtaining verified status.",
      price: 150000, // 1,500.00 ETB
      currency: "ETB",
      category: "Social Media",
      serviceType: "Verification",
      badge: "top",
      deliveryType: "manual",
      deliveryTime: "24-48 Hours",
      requirements: { type: "text", label: "Profile Username & Details" },
      active: true,
    },
    {
      name: "TikTok Live Stream Viewers",
      slug: "tiktok-live-stream-viewers",
      description: "Keep your TikTok live stream active with concurrent viewers.",
      price: 35000, // 350.00 ETB
      currency: "ETB",
      category: "TikTok",
      serviceType: "Live Stream",
      badge: "top",
      deliveryType: "automatic",
      deliveryTime: "Instant",
      active: true,
    },
    {
      name: "VIP Telegram Post Reactions",
      slug: "vip-telegram-post-reactions",
      description: "Boost engagement on your latest channel posts.",
      price: 8000, // 80.00 ETB
      currency: "ETB",
      category: "Telegram",
      serviceType: "Reactions",
      badge: "top",
      deliveryType: "automatic",
      deliveryTime: "Instant",
      active: true,
    },
  ]);

  console.log("✅ Seeding with badges completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});