import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initializeDatabase } from "@/lib/schema";

// Ensure tables exist
let initialized = false;
async function ensureDb() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

// GET /api/bookings - list bookings (with optional filters)
export async function GET(request: Request) {
  await ensureDb();

  const { searchParams } = new URL(request.url);
  const operatorKey = searchParams.get("operator");
  const date = searchParams.get("date"); // YYYY-MM-DD
  const status = searchParams.get("status");
  const from = searchParams.get("from"); // YYYY-MM-DD
  const to = searchParams.get("to"); // YYYY-MM-DD

  let query = "SELECT * FROM bookings WHERE 1=1";
  const args: (string | number)[] = [];

  if (operatorKey) {
    query += " AND operator_key = ?";
    args.push(operatorKey);
  }
  if (date) {
    query += " AND booking_date = ?";
    args.push(date);
  }
  if (status) {
    query += " AND status = ?";
    args.push(status);
  }
  if (from) {
    query += " AND booking_date >= ?";
    args.push(from);
  }
  if (to) {
    query += " AND booking_date <= ?";
    args.push(to);
  }

  query += " ORDER BY booking_date ASC, time_slot ASC";

  try {
    const result = await db.execute({ sql: query, args });
    return NextResponse.json({ bookings: result.rows });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST /api/bookings - create a new booking
export async function POST(request: Request) {
  await ensureDb();

  try {
    const body = await request.json();
    const {
      operator_key,
      client_name,
      client_phone,
      client_email = "",
      booking_date,
      time_slot,
      service = "",
      notes = "",
    } = body;

    // Validate required fields
    if (!operator_key || !client_name || !client_phone || !booking_date || !time_slot) {
      return NextResponse.json(
        { error: "Missing required fields: operator_key, client_name, client_phone, booking_date, time_slot" },
        { status: 400 }
      );
    }

    // Check for conflicting booking
    const existing = await db.execute({
      sql: `SELECT id FROM bookings 
            WHERE operator_key = ? AND booking_date = ? AND time_slot = ? AND status != 'cancelled'`,
      args: [operator_key, booking_date, time_slot],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO bookings (operator_key, client_name, client_phone, client_email, booking_date, time_slot, service, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [operator_key, client_name, client_phone, client_email, booking_date, time_slot, service, notes],
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: Number(result.lastInsertRowid),
        operator_key,
        client_name,
        client_phone,
        client_email,
        booking_date,
        time_slot,
        service,
        notes,
        status: "confirmed",
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
