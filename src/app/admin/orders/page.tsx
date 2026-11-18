import { db } from "../../../../api/src/db";
import { orders, customers, products } from "../../../../api/src/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminOrdersClient from "./AdminOrdersPage"; // Adjust path if necessary

export default async function AdminOrdersPage() {
  let allOrders: any[] = [];
  try {
    allOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        quantity: orders.quantity,
        totalAmount: orders.totalAmount,
        metadata: orders.metadata,
        createdAt: orders.createdAt,
        customerEmail: customers.email,
        productName: products.name,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("Failed to load admin orders:", error);
  }

  // Pass the data to the client component
  return <AdminOrdersClient initialOrders={allOrders} />;
}