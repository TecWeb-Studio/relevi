import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initializeDatabase } from "@/lib/schema";
import {
  operatorAvailability as defaults,
  convertLegacyToSchedule,
  getEnabledDays,
  type WeekSchedule,
  type TimeSlot,
  type DaySchedule,
} from "@/app/lib/availability";

let initialized = false;
async function ensureDb() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
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
// Returns { allSlots, bookedSlots, availableSlots, daysOfWeek, schedule, sessionDuration, breakBetweenSessions, onVacation }
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

    let schedule: WeekSchedule;
    let sessionDuration: number;
    let breakBetween: number;

    if (dbResult.rows.length > 0) {
      const row = dbResult.rows[0];
      const scheduleRaw = row.schedule_json as string | null;
      sessionDuration = row.session_duration as number;
      breakBetween = row.break_between as number;

      if (scheduleRaw) {
        schedule = JSON.parse(scheduleRaw);
      } else {
        // Legacy format
        const daysOfWeek: number[] = JSON.parse(row.days_of_week as string);
        const timeSlots: TimeSlot[] = JSON.parse(row.time_slots as string);
        schedule = convertLegacyToSchedule(daysOfWeek, timeSlots);
      }
    } else {
      const fallback = defaults.find((d) => d.key === operatorKey);
      if (!fallback) {
        return NextResponse.json({
          daysOfWeek: [],
          schedule: {},
          sessionDuration: 60,
          breakBetweenSessions: 15,
          allSlots: [],
          bookedSlots: [],
          availableSlots: [],
          onVacation: false,
        });
      }
      schedule = fallback.schedule;
      sessionDuration = fallback.sessionDuration;
      breakBetween = fallback.breakBetweenSessions;
    }

    const daysOfWeek = getEnabledDays(schedule);

    // If no date provided, just return schedule info
    if (!date) {
      return NextResponse.json({
        daysOfWeek,
        schedule,
        sessionDuration,
        breakBetweenSessions: breakBetween,
      });
    }

    // 2. Check if the operator is on vacation for this date
    const vacResult = await db.execute({
      sql: `SELECT COUNT(*) as cnt FROM operator_vacations 
            WHERE operator_key = ? AND start_date <= ? AND end_date >= ?`,
      args: [operatorKey, date, date],
    });
    const onVacation = (vacResult.rows[0].cnt as number) > 0;

    if (onVacation) {
      return NextResponse.json({
        daysOfWeek,
        schedule,
        sessionDuration,
        breakBetweenSessions: breakBetween,
        allSlots: [],
        bookedSlots: [],
        availableSlots: [],
        onVacation: true,
      });
    }

    // 3. Check if the day of week matches (per-day schedule)
    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();
    const daySchedule: DaySchedule | undefined = schedule[dayOfWeek];

    if (!daySchedule || !daySchedule.enabled) {
      return NextResponse.json({
        daysOfWeek,
        schedule,
        sessionDuration,
        breakBetweenSessions: breakBetween,
        allSlots: [],
        bookedSlots: [],
        availableSlots: [],
        onVacation: false,
      });
    }

    // 4. Compute all possible slots for THIS day's schedule
    const allSlots = computeSlots(daySchedule.timeSlots, sessionDuration, breakBetween);

    // 5. Get booked slots
    const bookedResult = await db.execute({
      sql: `SELECT time_slot FROM bookings 
            WHERE operator_key = ? AND booking_date = ? AND status != 'cancelled'
            ORDER BY time_slot ASC`,
      args: [operatorKey, date],
    });
    const bookedSlots = bookedResult.rows.map((r) => r.time_slot as string);

    // 6. Filter
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    return NextResponse.json({
      daysOfWeek,
      schedule,
      sessionDuration,
      breakBetweenSessions: breakBetween,
      allSlots,
      bookedSlots,
      availableSlots,
      onVacation: false,
    });
  } catch (error) {
    console.error("Error computing availability:", error);
    return NextResponse.json({ error: "Failed to compute availability" }, { status: 500 });
  }
}
