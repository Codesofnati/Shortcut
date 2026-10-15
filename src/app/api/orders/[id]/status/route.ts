import { NextResponse } from "next/server";
import { db } from "../../../../../../api/src/db";
import { orders } from "../../../../../../api/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ["new", "processing", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status type" }, { status: 400 });
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Order updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}