import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initializeDatabase } from "@/lib/schema";

let initialized = false;
async function ensureDb() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

// GET /api/bookings/slots?operator=KEY&date=YYYY-MM-DD
// Returns booked slots for a given operator and date
export async function GET(request: Request) {
  await ensureDb();

  const { searchParams } = new URL(request.url);
  const operatorKey = searchParams.get("operator");
  const date = searchParams.get("date");

  if (!operatorKey || !date) {
    return NextResponse.json(
      { error: "Missing required params: operator, date" },
      { status: 400 }
    );
  }

  try {
    const result = await db.execute({
      sql: `SELECT time_slot FROM bookings 
            WHERE operator_key = ? AND booking_date = ? AND status != 'cancelled'
            ORDER BY time_slot ASC`,
      args: [operatorKey, date],
    });

    const bookedSlots = result.rows.map((row) => row.time_slot as string);
    return NextResponse.json({ bookedSlots });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
