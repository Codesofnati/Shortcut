import { NextResponse } from "next/server";
import { db } from "../../../../api/src/db"; 
import { products, serviceCategories, platforms } from "../../../../api/src/db/schema"; 
import { eq, desc } from "drizzle-orm";

// GET: Fetch all products (now joined with categories & platforms for the storefront)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const query = db
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

    let allProducts;
    if (activeOnly) {
      allProducts = await query.where(eq(products.active, true));
    } else {
      allProducts = await query;
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
      categoryId, // <--- CHANGED from 'category'
      serviceType, 
      badge, 
      imageUrl, 
      deliveryTime,
      pricingType,
      averageTime,
      minOrder,
      maxOrder,
      active,
      // NEW rich attributes
      quality,
      speed,
      startTime,
      refill,
      dropRate,
      serverInfo,
      tags
    } = body;

    // Validate that categoryId is provided instead of category
    if (!name || price === undefined || !categoryId) {
      return NextResponse.json({ success: false, message: "Missing required product fields (name, price, categoryId)" }, { status: 400 });
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
        categoryId, // <--- CHANGED to match schema
        serviceType: serviceType || "General",
        badge: badge ? badge : null,
        imageUrl: imageUrl || null,
        pricingType: pricingType || "quantity", 
        averageTime: averageTime || deliveryTime || "Instant",
        minOrder: pricingType === "flat" ? 1 : (minOrder ? Number(minOrder) : 100),
        maxOrder: pricingType === "flat" ? 1 : (maxOrder ? Number(maxOrder) : 1000000),
        deliveryType: "manual",
        deliveryTime: averageTime || deliveryTime || "24 Hours",
        active: active !== undefined ? active : true,
        
        // NEW rich attributes
        quality: quality || null,
        speed: speed || null,
        startTime: startTime || null,
        refill: refill || null,
        dropRate: dropRate || null,
        serverInfo: serverInfo || null,
        tags: tags || [],
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