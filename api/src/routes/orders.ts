import app from "..";
import { createDb } from "../db";
import { orders } from "../db/schema";
import { eq } from "drizzle-orm";

// PUT endpoint to update order status (Admin action)
app.put("/api/orders/:id/status", async (c) => {
  try {
    const orderId = c.req.param("id");
    const { status } = await c.req.json(); // e.g. 'processing', 'completed', 'failed', 'refunded'

    const validStatuses = ["new", "processing", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, message: "Invalid status type" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    // Update order status and timestamp
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return c.json({ success: false, message: "Order not found" }, 404);
    }

    return c.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});