import { NextResponse } from "next/server";
import { db } from "../../../../api/src/db";
import { platforms } from "../../../../api/src/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allPlatforms = await db.select().from(platforms).orderBy(desc(platforms.createdAt));
    return NextResponse.json({ success: true, platforms: allPlatforms });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, imageUrl } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, message: "Platform name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const [newPlatform] = await db
      .insert(platforms)
      .values({ name, slug, imageUrl: imageUrl || null, active: true })
      .returning();

    return NextResponse.json({ success: true, platform: newPlatform });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Platform name or slug already exists" }, { status: 500 });
  }
}