import { NextResponse } from "next/server";
import { db } from "../../../../../api/src/db";
import { orders, customers, products } from "../../../../../api/src/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Email parameter is required" }, { status: 400 });
    }

    // 1. Find customer by email
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email.toLowerCase().trim()));

    if (!customer) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // 2. Fetch all orders for this customer joined with product info
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

    return NextResponse.json({
      success: true,
      orders: customerOrders,
    });
  } catch (error: any) {
    console.error("Order tracking error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}