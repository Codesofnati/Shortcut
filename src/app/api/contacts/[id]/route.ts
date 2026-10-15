import { NextResponse } from "next/server";
import { db } from "../../../../../api/src/db";
import { contactChannels } from "../../../../../api/src/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(contactChannels)
      .set({
        type: body.type,
        label: body.label,
        value: body.value,
        iconUrl: body.iconUrl || null,
        description: body.description || null,
        sortOrder: body.sortOrder ?? 0,
        active: body.active ?? true,
      })
      .where(eq(contactChannels.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    console.error("PUT /api/contacts/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(contactChannels)
      .where(eq(contactChannels.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete contact" },
      { status: 500 }
    );
  }
}