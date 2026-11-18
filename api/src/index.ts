import { Hono } from "hono";
import { cors } from "hono/cors";
import { eq, desc } from "drizzle-orm";

import { createDb } from "./db";
import {
  products,
  orders,
  customers,
  platforms,
  serviceCategories,
} from "./db/schema";

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: ["https://shortcut.vercel.app", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// --------------------------------------------------
// HEALTH
// --------------------------------------------------
app.get("/", (c) =>
  c.json({ success: true, message: "Shortcut API is running 🚀" })
);
app.get("/api/health", (c) => c.json({ status: "ok" }));

// --------------------------------------------------
// PLATFORMS
// --------------------------------------------------
app.get("/api/platforms", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const result = await db.select().from(platforms).orderBy(desc(platforms.createdAt));
    return c.json({ success: true, platforms: result });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to fetch platforms" }, 500);
  }
});

app.post("/api/platforms", async (c) => {
  try {
    const { name, imageUrl } = await c.req.json();
    if (!name) return c.json({ success: false, message: "Name is required" }, 400);

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const db = createDb(c.env.DATABASE_URL);

    const [newPlatform] = await db
      .insert(platforms)
      .values({ name, slug, imageUrl })
      .returning();

    return c.json({ success: true, platform: newPlatform });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to create platform (slug might exist)" }, 500);
  }
});

app.put("/api/platforms/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, imageUrl } = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(platforms)
      .set({ name, slug: name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"), imageUrl })
      .where(eq(platforms.id, id))
      .returning();

    return c.json({ success: true, platform: updated });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to update platform" }, 500);
  }
});

app.delete("/api/platforms/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    await db.delete(platforms).where(eq(platforms.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to delete platform" }, 500);
  }
});

// --------------------------------------------------
// SERVICE CATEGORIES
// --------------------------------------------------
app.get("/api/service-categories", async (c) => {
  try {
    const platformId = c.req.query("platformId");
    const db = createDb(c.env.DATABASE_URL);

    const query = db.select().from(serviceCategories);
    const result = platformId
      ? await query.where(eq(serviceCategories.platformId, platformId))
      : await query;

    return c.json({ success: true, categories: result });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to fetch categories" }, 500);
  }
});

app.post("/api/service-categories", async (c) => {
  try {
    const { platformId, name } = await c.req.json();
    if (!platformId || !name)
      return c.json({ success: false, message: "Missing fields" }, 400);

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const db = createDb(c.env.DATABASE_URL);

    const [newCategory] = await db
      .insert(serviceCategories)
      .values({ platformId, name, slug })
      .returning();

    return c.json({ success: true, category: newCategory });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to create category" }, 500);
  }
});

app.put("/api/service-categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name } = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(serviceCategories)
      .set({ name, slug: name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") })
      .where(eq(serviceCategories.id, id))
      .returning();

    return c.json({ success: true, category: updated });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to update category" }, 500);
  }
});

app.delete("/api/service-categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to delete category" }, 500);
  }
});

// --------------------------------------------------
// PRODUCTS
// --------------------------------------------------
app.get("/api/products", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        currency: products.currency,
        badge: products.badge,
        quality: products.quality,
        speed: products.speed,
        startTime: products.startTime,
        refill: products.refill,
        dropRate: products.dropRate,
        serverInfo: products.serverInfo,
        tags: products.tags,
        serviceType: products.serviceType,
        imageUrl: products.imageUrl,
        pricingType: products.pricingType,
        minOrder: products.minOrder,
        maxOrder: products.maxOrder,
        active: products.active,
        categoryId: products.categoryId,
        categoryName: serviceCategories.name,
        platformName: platforms.name,
        platformImage: platforms.imageUrl,
      })
      .from(products)
      .leftJoin(serviceCategories, eq(products.categoryId, serviceCategories.id))
      .leftJoin(platforms, eq(serviceCategories.platformId, platforms.id))
      .orderBy(desc(products.createdAt));

    return c.json({ success: true, products: result });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to fetch products" }, 500);
  }
});

app.post("/api/products", async (c) => {
  try {
    const body = await c.req.json();
    const {
      categoryId,
      name,
      slug,
      description,
      price,
      currency,
      serviceType,
      deliveryTime,
      imageUrl,
      badge,
      quality,
      speed,
      startTime,
      refill,
      dropRate,
      serverInfo,
      tags,
      pricingType,
      averageTime,
      minOrder,
      maxOrder,
      active,
    } = body;

    if (!name || !slug || price === undefined || !categoryId) {
      return c.json(
        { success: false, message: "Missing required fields (name, slug, price, categoryId)" },
        400
      );
    }

    const db = createDb(c.env.DATABASE_URL);

    const [newProduct] = await db
      .insert(products)
      .values({
        categoryId,
        name,
        slug,
        description: description || null,
        price: Number(price),
        currency: currency || "ETB",
        serviceType: serviceType || "General",
        deliveryType: "manual",
        deliveryTime: deliveryTime || "24 Hours",
        imageUrl: imageUrl || null,
        badge: badge || null,
        quality: quality || null,
        speed: speed || null,
        startTime: startTime || null,
        refill: refill || null,
        dropRate: dropRate || null,
        serverInfo: serverInfo || null,
        tags: Array.isArray(tags) ? tags : [],
        pricingType: pricingType || "quantity",
        averageTime: averageTime || "15 minutes",
        minOrder: minOrder !== undefined ? Number(minOrder) : 100,
        maxOrder: maxOrder !== undefined ? Number(maxOrder) : 1000000,
        active: active !== undefined ? active : true,
      })
      .returning();

    return c.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Failed to create product:", error);
    return c.json(
      { success: false, message: "Internal server error (slug might already exist)" },
      500
    );
  }
});

app.put("/api/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const {
      categoryId,
      name,
      description,
      price,
      currency,
      serviceType,
      imageUrl,
      badge,
      quality,
      speed,
      startTime,
      refill,
      dropRate,
      serverInfo,
      tags,
      pricingType,
      averageTime,
      minOrder,
      maxOrder,
      active,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (currency !== undefined) updateData.currency = currency;
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (badge !== undefined) updateData.badge = badge;
    if (quality !== undefined) updateData.quality = quality;
    if (speed !== undefined) updateData.speed = speed;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (refill !== undefined) updateData.refill = refill;
    if (dropRate !== undefined) updateData.dropRate = dropRate;
    if (serverInfo !== undefined) updateData.serverInfo = serverInfo;
    if (tags !== undefined) updateData.tags = tags;
    if (pricingType !== undefined) updateData.pricingType = pricingType;
    if (averageTime !== undefined) updateData.averageTime = averageTime;
    if (minOrder !== undefined) updateData.minOrder = Number(minOrder);
    if (maxOrder !== undefined) updateData.maxOrder = Number(maxOrder);
    if (active !== undefined) updateData.active = active;

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (!updated) return c.json({ success: false, message: "Product not found" }, 404);

    return c.json({ success: true, product: updated });
  } catch (error) {
    console.error("Failed to update product:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

app.delete("/api/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    await db.delete(products).where(eq(products.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to delete product" }, 500);
  }
});

// --------------------------------------------------
// ORDERS
// --------------------------------------------------
app.post("/api/orders", async (c) => {
  try {
    const { email, productId, quantity, metadata } = await c.req.json();

    if (!email || !productId) {
      return c.json({ success: false, message: "Missing required fields" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    let [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email));

    if (!customer) {
      const [newCustomer] = await db
        .insert(customers)
        .values({ email, name: email.split("@")[0] })
        .returning();
      customer = newCustomer;
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product || !product.active) {
      return c.json({ success: false, message: "Product not found or inactive" }, 404);
    }

    const totalAmount = product.price * (quantity || 1);

    const [newOrder] = await db
      .insert(orders)
      .values({
        customerId: customer.id,
        productId: product.id,
        quantity: quantity || 1,
        totalAmount,
        status: "new",
        metadata,
      })
      .returning();

    return c.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

app.get("/api/orders/track", async (c) => {
  try {
    const email = c.req.query("email");
    if (!email) return c.json({ success: false, message: "Email required" }, 400);

    const db = createDb(c.env.DATABASE_URL);

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email.toLowerCase().trim()));

    if (!customer) return c.json({ success: true, orders: [] });

    const customerOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        quantity: orders.quantity,
        totalAmount: orders.totalAmount,
        metadata: orders.metadata,
        createdAt: orders.createdAt,
        productName: products.name,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.customerId, customer.id))
      .orderBy(desc(orders.createdAt));

    return c.json({ success: true, orders: customerOrders });
  } catch (error) {
    console.error("Order tracking error:", error);
    return c.json({ success: false, message: "Internal server error" }, 400);
  }
});

app.put("/api/orders/:id/status", async (c) => {
  try {
    const orderId = c.req.param("id");
    const { status } = await c.req.json();

    const validStatuses = ["new", "processing", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, message: "Invalid status type" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return c.json({ success: false, message: "Order not found" }, 404);
    }

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

export default app;