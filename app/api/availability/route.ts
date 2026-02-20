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

// GET /api/availability?operator=KEY (optional, if omitted returns all)
export async function GET(request: Request) {
  await ensureDb();

  const { searchParams } = new URL(request.url);
  const operatorKey = searchParams.get("operator");

  try {
    if (operatorKey) {
      // Single operator
      const result = await db.execute({
        sql: "SELECT * FROM operator_availability WHERE operator_key = ?",
        args: [operatorKey],
      });

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return NextResponse.json({
          availability: {
            key: row.operator_key as string,
            daysOfWeek: JSON.parse(row.days_of_week as string),
            timeSlots: JSON.parse(row.time_slots as string),
            sessionDuration: row.session_duration as number,
            breakBetweenSessions: row.break_between as number,
          },
          source: "db",
        });
      }

      // Fallback to hardcoded defaults
      const fallback = defaults.find((d) => d.key === operatorKey);
      if (fallback) {
        return NextResponse.json({ availability: fallback, source: "default" });
      }

      return NextResponse.json({ availability: null, source: "none" });
    }

    // All operators - merge DB overrides with defaults
    const result = await db.execute({
      sql: "SELECT * FROM operator_availability",
      args: [],
    });

    const dbMap = new Map<string, {
      key: string;
      daysOfWeek: number[];
      timeSlots: { start: string; end: string }[];
      sessionDuration: number;
      breakBetweenSessions: number;
    }>();

    for (const row of result.rows) {
      dbMap.set(row.operator_key as string, {
        key: row.operator_key as string,
        daysOfWeek: JSON.parse(row.days_of_week as string),
        timeSlots: JSON.parse(row.time_slots as string),
        sessionDuration: row.session_duration as number,
        breakBetweenSessions: row.break_between as number,
      });
    }

    // Start with defaults, override with DB values
    const allKeys = new Set([
      ...defaults.map((d) => d.key),
      ...dbMap.keys(),
    ]);

    const merged = Array.from(allKeys).map((key) => {
      if (dbMap.has(key)) return { ...dbMap.get(key)!, source: "db" };
      const def = defaults.find((d) => d.key === key);
      return def ? { ...def, source: "default" } : null;
    }).filter(Boolean);

    return NextResponse.json({ availability: merged });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

// PUT /api/availability - save/update operator availability (admin only)
export async function PUT(request: Request) {
  await ensureDb();

  try {
    const body = await request.json();
    const { secret, operator_key, days_of_week, time_slots, session_duration, break_between } = body;

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!operator_key || !Array.isArray(days_of_week) || !Array.isArray(time_slots)) {
      return NextResponse.json(
        { error: "Missing required fields: operator_key, days_of_week, time_slots" },
        { status: 400 }
      );
    }

    // Validate time slots format
    for (const slot of time_slots) {
      if (!slot.start || !slot.end) {
        return NextResponse.json({ error: "Each time slot must have start and end" }, { status: 400 });
      }
      if (!/^\d{2}:\d{2}$/.test(slot.start) || !/^\d{2}:\d{2}$/.test(slot.end)) {
        return NextResponse.json({ error: "Time format must be HH:MM" }, { status: 400 });
      }
    }

    // Upsert
    await db.execute({
      sql: `INSERT INTO operator_availability (operator_key, days_of_week, time_slots, session_duration, break_between, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(operator_key) DO UPDATE SET
              days_of_week = excluded.days_of_week,
              time_slots = excluded.time_slots,
              session_duration = excluded.session_duration,
              break_between = excluded.break_between,
              updated_at = datetime('now')`,
      args: [
        operator_key,
        JSON.stringify(days_of_week),
        JSON.stringify(time_slots),
        session_duration || 60,
        break_between || 15,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json({ error: "Failed to save availability" }, { status: 500 });
  }
}

// DELETE /api/availability - reset to default (removes DB override)
export async function DELETE(request: Request) {
  await ensureDb();

  try {
    const body = await request.json();
    const { secret, operator_key } = body;

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.execute({
      sql: "DELETE FROM operator_availability WHERE operator_key = ?",
      args: [operator_key],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json({ error: "Failed to reset availability" }, { status: 500 });
  }
}
