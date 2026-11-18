import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// --------------------------------------------------
// CUSTOMERS
// --------------------------------------------------
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  walletBalance: integer("wallet_balance").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --------------------------------------------------
// PLATFORMS (e.g., YouTube, TikTok, Instagram)
// --------------------------------------------------
export const platforms = pgTable("platforms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --------------------------------------------------
// SERVICE CATEGORIES (e.g., YouTube Subscribers, YouTube Views)
// --------------------------------------------------
export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  platformId: uuid("platform_id")
    .references(() => platforms.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --------------------------------------------------
// PRODUCTS
// --------------------------------------------------
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .references(() => serviceCategories.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: text("currency").default("ETB").notNull(),
  badge: text("badge"),

  // Rich attributes (match your screenshots)
  quality: text("quality"),
  speed: text("speed"),
  startTime: text("start_time"),
  refill: text("refill"),
  dropRate: text("drop_rate"),
  serverInfo: text("server_info"),
  tags: jsonb("tags").default([]),

  serviceType: text("service_type").notNull().default("General"),
  imageUrl: text("image_url"),
  deliveryType: text("delivery_type").default("automatic").notNull(),
  deliveryTime: text("delivery_time"),
  requirements: jsonb("requirements"),
  refundPolicy: text("refund_policy"),
  provider: text("provider"),
  pricingType: text("pricing_type").default("quantity").notNull(),
  averageTime: text("average_time").default("15 minutes"),
  minOrder: integer("min_order").default(100).notNull(),
  maxOrder: integer("max_order").default(1000000).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --------------------------------------------------
// ORDERS
// --------------------------------------------------
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  status: text("status").default("new").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  totalAmount: integer("total_amount").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --------------------------------------------------
// TRANSACTIONS
// --------------------------------------------------
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  status: text("status").default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --------------------------------------------------
// CONTACT CHANNELS
// --------------------------------------------------
export const contactChannels = pgTable("contact_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  iconUrl: text("icon_url"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Add this to your schema.ts
export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});