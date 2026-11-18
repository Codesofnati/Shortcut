import { NextResponse } from "next/server";
import { db } from "../../../../api/src/db"; // Adjust path if needed
import { serviceCategories } from "../../../../api/src/db/schema";
import { eq } from "drizzle-orm";

// GET: Fetch categories (optionally filtered by platformId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get("platformId");

    // Apply the where clause directly in the query chain
    const categories = platformId
      ? await db.select().from(serviceCategories).where(eq(serviceCategories.platformId, platformId))
      : await db.select().from(serviceCategories);

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const { platformId, name } = await request.json();
    if (!platformId || !name) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const [newCategory] = await db.insert(serviceCategories).values({
      platformId,
      name,
      slug,
    }).returning();

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}