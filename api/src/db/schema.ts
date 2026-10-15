import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(), // Stored in smallest currency unit
  currency: text("currency").default("ETB").notNull(),
  badge: text("badge"), // e.g., 'new', 'best_seller', 'top'
  category: text("category").notNull(),        // e.g., "TikTok", "Instagram", "YouTube"
  serviceType: text("service_type").notNull(), // e.g., "views", "followers", "likes"
  imageUrl: text("image_url"),
  deliveryType: text("delivery_type").default("automatic").notNull(),
  deliveryTime: text("delivery_time"),
  requirements: jsonb("requirements"), // e.g., target profile/video URL
  refundPolicy: text("refund_policy"),
  provider: text("provider"),
  pricingType: text("pricing_type").default("quantity").notNull(), // "quantity" (per 1k) or "flat" (fixed price)
  averageTime: text("average_time").default("15 minutes"), // e.g., "13 minutes"
  minOrder: integer("min_order").default(100).notNull(),
  maxOrder: integer("max_order").default(1000000).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// 1. Customers Table (Supports wallets and customer tracking)
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  walletBalance: integer("wallet_balance").default(0).notNull(), // Stored in smallest currency unit (e.g., cents)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platforms = pgTable("platforms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"), // Icon or logo image URL
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Orders Table (Tracks new, processing, completed, failed, and refunded orders)
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  
  // Matches your admin dashboard categories: new, processing, completed, failed, refunded
  status: text("status").default("new").notNull(), 
  
  quantity: integer("quantity").default(1).notNull(),
  totalAmount: integer("total_amount").notNull(), // Total price in smallest currency unit
  
  // Stores user-submitted info like their TikTok link, Instagram handle, or Meta verification details
  metadata: jsonb("metadata"), 
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// 3. Transactions Table (Tracks wallet deposits, purchases, and refunds)
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  amount: integer("amount").notNull(), // Positive for deposits, negative for purchases
  type: text("type").notNull(), // 'deposit', 'purchase', 'refund'
  status: text("status").default("completed").notNull(), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactChannels = pgTable("contact_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),        // 'telegram' | 'facebook' | 'instagram' | 'email' | 'whatsapp' | 'custom'
  label: text("label").notNull(),      // e.g. "Support Bot", "Sales", "@shortcut_official"
  value: text("value").notNull(),      // the URL, phone, or email
  iconUrl: text("icon_url"),           // optional override image
  description: text("description"),    // optional short text
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});