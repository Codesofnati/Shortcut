import { NextResponse } from "next/server";
import { db } from "../../../../api/src/db"; // adjust alias or relative path to your db export
import { orders, customers, products } from "../../../../api/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, productId, quantity, metadata } = body;

    if (!email || !productId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 1. Check if customer exists, otherwise create them
    let [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email.toLowerCase().trim()));

    if (!customer) {
      const [newCustomer] = await db
        .insert(customers)
        .values({ email: email.toLowerCase().trim(), name: email.split("@")[0] })
        .returning();
      customer = newCustomer;
    }

    // 2. Fetch product to get price
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product || !product.active) {
      return NextResponse.json({ success: false, message: "Product not found or inactive" }, { status: 404 });
    }

    const totalAmount = product.price * (quantity || 1);

    // 3. Create order with 'new' status
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

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}