import { Hono } from "hono";
import { cors } from 'hono/cors';

import { createDb } from "./db";
import { eq, desc } from "drizzle-orm";
import { products } from "./db/schema";
import { orders, customers } from "./db/schema";
type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors({
  origin: ['https://shortcut.vercel.app', 'http://localhost:3000'], 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "Shortcut API is running 🚀",
  });
});

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
  });
});

app.get("/api/products", async (c) => {
  try {
    // Pass the schema or make sure createDb binds it
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.select().from(products);

    return c.json({
      success: true,
      products: result,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      500,
    );
  }
});
// POST endpoint to handle checkout and save the order
app.post("/api/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { email, productId, quantity, metadata } = body;

    if (!email || !productId) {
      return c.json({ success: false, message: "Missing required fields" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    // 1. Check if customer exists, otherwise create them
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

    // 2. Fetch the product to get its price
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product || !product.active) {
      return c.json({ success: false, message: "Product not found or inactive" }, 404);
    }

    const totalAmount = product.price * (quantity || 1);

    // 3. Create the order with 'new' status (matches your admin dashboard)
    const [newOrder] = await db
      .insert(orders)
      .values({
        customerId: customer.id,
        productId: product.id,
        quantity: quantity || 1,
        totalAmount,
        status: "new", // Starts as 'new' for your admin dashboard
        metadata, // Stores the user's target link/requirements
      })
      .returning();

    return c.json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});
// POST endpoint to create a new product (Admin action)
app.post("/api/products", async (c) => {
  try {
    const body = await c.req.json();
    const { name, slug, description, price, currency, category, serviceType, deliveryTime } = body;

    if (!name || !slug || price === undefined || !category) {
      return c.json({ success: false, message: "Missing required product fields" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug,
        description,
        price: Number(price), // Stored in smallest unit (e.g. cents/santims)
        currency: currency || "ETB",
        category,
        serviceType: serviceType || "General",
        deliveryType: "manual", // Default for your broker model
        deliveryTime: deliveryTime || "24 Hours",
        active: true,
      })
      .returning();

    return c.json({
      success: true,
      message: "Product created successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Failed to create product:", error);
    return c.json({ success: false, message: "Internal server error (Slug might already exist)" }, 500);
  }
});
// GET endpoint for customer order tracking
app.get("/api/orders/track", async (c) => {
  try {
    const email = c.req.query("email");

    if (!email) {
      return c.json({ success: false, message: "Email parameter is required" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    // Find customer by email
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email.toLowerCase().trim()));

    if (!customer) {
      return c.json({ success: true, orders: [] }); // No customer found, return empty array
    }

    // Fetch all orders for this customer joined with product info
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

    return c.json({
      success: true,
      orders: customerOrders,
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return c.json({ success: false, message: "Internal server error" }, 400);
  }
});

export default app;