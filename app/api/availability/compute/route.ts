import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initializeDatabase } from "@/lib/schema";
import { operatorAvailability as defaults } from "@/app/lib/availability";

let initialized = false;
async function ensureDb() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

interface TimeSlot {
  start: string;
  end: string;
}

function computeSlots(
  timeSlots: TimeSlot[],
  sessionDuration: number,
  breakBetween: number
): string[] {
  const slots: string[] = [];
  for (const range of timeSlots) {
    const [startH, startM] = range.start.split(":").map(Number);
    const [endH, endM] = range.end.split(":").map(Number);
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    while (currentMinutes + sessionDuration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
      currentMinutes += sessionDuration + breakBetween;
    }
  }
  return slots;
}

// GET /api/availability/compute?operator=KEY&date=YYYY-MM-DD
// Returns { allSlots, bookedSlots, availableSlots, daysOfWeek, timeSlots, sessionDuration, breakBetweenSessions }
export async function GET(request: Request) {
  await ensureDb();

  const { searchParams } = new URL(request.url);
  const operatorKey = searchParams.get("operator");
  const date = searchParams.get("date");

  if (!operatorKey) {
    return NextResponse.json({ error: "Missing operator param" }, { status: 400 });
  }

  try {
    // 1. Get availability (DB first, then defaults)
    const dbResult = await db.execute({
      sql: "SELECT * FROM operator_availability WHERE operator_key = ?",
      args: [operatorKey],
    });

    let daysOfWeek: number[];
    let timeSlots: TimeSlot[];
    let sessionDuration: number;
    let breakBetween: number;

    if (dbResult.rows.length > 0) {
      const row = dbResult.rows[0];
      daysOfWeek = JSON.parse(row.days_of_week as string);
      timeSlots = JSON.parse(row.time_slots as string);
      sessionDuration = row.session_duration as number;
      breakBetween = row.break_between as number;
    } else {
      const fallback = defaults.find((d) => d.key === operatorKey);
      if (!fallback) {
        return NextResponse.json({
          daysOfWeek: [],
          timeSlots: [],
          sessionDuration: 60,
          breakBetweenSessions: 15,
          allSlots: [],
          bookedSlots: [],
          availableSlots: [],
        });
      }
      daysOfWeek = fallback.daysOfWeek;
      timeSlots = fallback.timeSlots;
      sessionDuration = fallback.sessionDuration;
      breakBetween = fallback.breakBetweenSessions;
    }

    // If no date provided, just return schedule info
    if (!date) {
      return NextResponse.json({
        daysOfWeek,
        timeSlots,
        sessionDuration,
        breakBetweenSessions: breakBetween,
      });
    }

    // 2. Check if the day of week matches
    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();

    if (!daysOfWeek.includes(dayOfWeek)) {
      return NextResponse.json({
        daysOfWeek,
        timeSlots,
        sessionDuration,
        breakBetweenSessions: breakBetween,
        allSlots: [],
        bookedSlots: [],
        availableSlots: [],
      });
    }

    // 3. Compute all possible slots
    const allSlots = computeSlots(timeSlots, sessionDuration, breakBetween);

    // 4. Get booked slots
    const bookedResult = await db.execute({
      sql: `SELECT time_slot FROM bookings 
            WHERE operator_key = ? AND booking_date = ? AND status != 'cancelled'
            ORDER BY time_slot ASC`,
      args: [operatorKey, date],
    });
    const bookedSlots = bookedResult.rows.map((r) => r.time_slot as string);

    // 5. Filter
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    return NextResponse.json({
      daysOfWeek,
      timeSlots,
      sessionDuration,
      breakBetweenSessions: breakBetween,
      allSlots,
      bookedSlots,
      availableSlots,
    });
  } catch (error) {
    console.error("Error computing availability:", error);
    return NextResponse.json({ error: "Failed to compute availability" }, { status: 500 });
  }
}
