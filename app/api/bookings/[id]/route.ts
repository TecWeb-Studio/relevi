import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/bookings/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM bookings WHERE id = ?",
      args: [Number(id)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking: result.rows[0] });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] - update booking status or details
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { secret } = body;

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (body.status) {
      updates.push("status = ?");
      args.push(body.status);
    }
    if (body.notes !== undefined) {
      updates.push("notes = ?");
      args.push(body.notes);
    }
    if (body.client_name) {
      updates.push("client_name = ?");
      args.push(body.client_name);
    }
    if (body.client_phone) {
      updates.push("client_phone = ?");
      args.push(body.client_phone);
    }
    if (body.client_email !== undefined) {
      updates.push("client_email = ?");
      args.push(body.client_email);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    args.push(Number(id));

    await db.execute({
      sql: `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    const result = await db.execute({
      sql: "SELECT * FROM bookings WHERE id = ?",
      args: [Number(id)],
    });

    return NextResponse.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// DELETE /api/bookings/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    if (body.secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.execute({
      sql: "DELETE FROM bookings WHERE id = ?",
      args: [Number(id)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
