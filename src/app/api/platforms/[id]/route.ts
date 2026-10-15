import { NextResponse } from "next/server";
import { db } from "../../../../../api/src/db";
import { platforms } from "../../../../../api/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, imageUrl, active } = await request.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "Platform name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const [updatedPlatform] = await db
      .update(platforms)
      .set({
        name,
        slug,
        imageUrl: imageUrl || null,
        active: active !== undefined ? active : true,
      })
      .where(eq(platforms.id, id))
      .returning();

    if (!updatedPlatform) {
      return NextResponse.json({ success: false, message: "Platform not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, platform: updatedPlatform });
  } catch (error: any) {
    console.error("Failed to update platform:", error);
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
      .delete(platforms)
      .where(eq(platforms.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Platform not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Platform deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete platform:", error);
    return NextResponse.json({ success: false, message: "Cannot delete platform while active products are assigned to it." }, { status: 500 });
  }
}