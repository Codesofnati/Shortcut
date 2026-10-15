import { NextResponse } from "next/server";
import { db } from "../../../../api/src/db"; // Adjust alias/path to your db instance
import { products } from "../../../../api/src/db/schema"; // Adjust alias/path to your schema
import { eq, desc } from "drizzle-orm";

// GET: Fetch all products (optionally filtered by active status or category)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let allProducts;
    if (activeOnly) {
      allProducts = await db
        .select()
        .from(products)
        .where(eq(products.active, true))
        .orderBy(desc(products.createdAt));
    } else {
      allProducts = await db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt));
    }

    return NextResponse.json({ success: true, products: allProducts });
  } catch (error: any) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}

// POST: Admin action to create a new product/service
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      currency, 
      category, 
      serviceType, 
      badge, 
      imageUrl, 
      deliveryTime,
      pricingType,
      averageTime,
      minOrder,
      maxOrder,
      active 
    } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json({ success: false, message: "Missing required product fields" }, { status: 400 });
    }

    // Automatically generate slug from name if not provided
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug,
        description,
        price: Number(price),
        currency: currency || "ETB",
        category,
        serviceType: serviceType || "General",
        badge: badge ? badge : null,
        imageUrl: imageUrl || null,
        pricingType: pricingType || "quantity", // "quantity" or "flat"
        averageTime: averageTime || deliveryTime || "Instant",
        minOrder: pricingType === "flat" ? 1 : (minOrder ? Number(minOrder) : 100),
        maxOrder: pricingType === "flat" ? 1 : (maxOrder ? Number(maxOrder) : 1000000),
        deliveryType: "manual",
        deliveryTime: averageTime || deliveryTime || "24 Hours",
        active: active !== undefined ? active : true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Product created successfully!",
      product: newProduct,
    });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}