import { NextResponse } from "next/server";
import { db } from "../../../../../api/src/db";
import { products } from "../../../../../api/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      currency, 
      categoryId,
      serviceType, 
      badge, 
      active, 
      imageUrl,
      pricingType,
      averageTime,
      minOrder,
      maxOrder,
      deliveryTime,
      quality,
      speed,
      startTime,
      refill,
      dropRate,
      serverInfo,
      tags
    } = body;

    // Validate using categoryId
    if (!name || price === undefined || !categoryId) {
      return NextResponse.json({ success: false, message: "Missing required fields (name, price, categoryId)" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Safely parse the boolean
    let parsedActive = undefined;
    if (active !== undefined) {
      parsedActive = active === true || active === "true";
    }

    const [updatedProduct] = await db
      .update(products)
      .set({
        name,
        slug,
        description,
        price: Number(price),
        currency: currency || "ETB",
        categoryId,
        serviceType: serviceType || "General",
        badge: badge ? badge : null,
        imageUrl: imageUrl || null,
        pricingType: pricingType || "quantity", 
        averageTime: averageTime || deliveryTime || "Instant",
        minOrder: pricingType === "flat" ? 1 : (minOrder ? Number(minOrder) : 100),
        maxOrder: pricingType === "flat" ? 1 : (maxOrder ? Number(maxOrder) : 1000000),
        deliveryTime: averageTime || deliveryTime || "24 Hours",
        
        // Only update 'active' if it was explicitly sent in the body
        ...(parsedActive !== undefined && { active: parsedActive }),

        quality: quality || null,
        speed: speed || null,
        startTime: startTime || null,
        refill: refill || null,
        dropRate: dropRate || null,
        serverInfo: serverInfo || null,
        tags: tags || [],
      })
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}