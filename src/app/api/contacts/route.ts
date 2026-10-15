import { NextResponse } from "next/server";
import { db } from "../../../../api/src/db";
import { contactChannels } from "../../../../api/src/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(contactChannels)
      .orderBy(asc(contactChannels.sortOrder), asc(contactChannels.createdAt));

    return NextResponse.json({ success: true, contacts: rows });
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, label, value, iconUrl, description, sortOrder, active } = body;

    if (!type || !label || !value) {
      return NextResponse.json(
        { success: false, message: "type, label, and value are required" },
        { status: 400 }
      );
    }

    const [inserted] = await db
      .insert(contactChannels)
      .values({
        type,
        label,
        value,
        iconUrl: iconUrl || null,
        description: description || null,
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      })
      .returning();

    return NextResponse.json({ success: true, contact: inserted });
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create contact" },
      { status: 500 }
    );
  }
}