import { NextResponse } from "next/server";
import db from "@/lib/db";
import { initializeDatabase } from "@/lib/schema";
import {
  operatorAvailability as defaults,
  convertLegacyToSchedule,
  getEnabledDays,
  type WeekSchedule,
  type TimeSlot,
} from "@/app/lib/availability";

let initialized = false;
async function ensureDb() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

// Helper: parse a DB row into the new schedule format (handles legacy rows too)
function parseDbRow(row: Record<string, unknown>) {
  const key = row.operator_key as string;
  const scheduleRaw = row.schedule_json as string | null;
  const sessionDuration = row.session_duration as number;
  const breakBetweenSessions = row.break_between as number;

  let schedule: WeekSchedule;
  if (scheduleRaw) {
    schedule = JSON.parse(scheduleRaw);
  } else {
    // Legacy format — convert
    const daysOfWeek: number[] = JSON.parse(row.days_of_week as string);
    const timeSlots: TimeSlot[] = JSON.parse(row.time_slots as string);
    schedule = convertLegacyToSchedule(daysOfWeek, timeSlots);
  }

  return {
    key,
    schedule,
    daysOfWeek: getEnabledDays(schedule),
    sessionDuration,
    breakBetweenSessions,
  };
}

// GET /api/availability?operator=KEY (optional, if omitted returns all)
// GET /api/availability?operator=KEY&vacations=1 — also returns vacations
export async function GET(request: Request) {
  await ensureDb();

  const { searchParams } = new URL(request.url);
  const operatorKey = searchParams.get("operator");
  const wantVacations = searchParams.get("vacations") === "1";

  try {
    if (operatorKey) {
      // Single operator
      const result = await db.execute({
        sql: "SELECT * FROM operator_availability WHERE operator_key = ?",
        args: [operatorKey],
      });

      let availData;
      let source = "default";
      if (result.rows.length > 0) {
        availData = parseDbRow(result.rows[0] as Record<string, unknown>);
        source = "db";
      } else {
        const fallback = defaults.find((d) => d.key === operatorKey);
        if (fallback) {
          availData = {
            ...fallback,
            daysOfWeek: getEnabledDays(fallback.schedule),
          };
        }
      }

      const resp: Record<string, unknown> = {
        availability: availData || null,
        source: availData ? source : "none",
      };

      if (wantVacations) {
        const vacResult = await db.execute({
          sql: "SELECT * FROM operator_vacations WHERE operator_key = ? ORDER BY start_date ASC",
          args: [operatorKey],
        });
        resp.vacations = vacResult.rows.map((r) => ({
          id: r.id,
          operator_key: r.operator_key,
          start_date: r.start_date,
          end_date: r.end_date,
          note: r.note || "",
        }));
      }

      return NextResponse.json(resp);
    }

    // All operators — merge DB overrides with defaults
    const result = await db.execute({
      sql: "SELECT * FROM operator_availability",
      args: [],
    });

    const dbMap = new Map<string, ReturnType<typeof parseDbRow>>();
    for (const row of result.rows) {
      const parsed = parseDbRow(row as Record<string, unknown>);
      dbMap.set(parsed.key, parsed);
    }

    const allKeys = new Set([
      ...defaults.map((d) => d.key),
      ...dbMap.keys(),
    ]);

    const merged = Array.from(allKeys)
      .map((key) => {
        if (dbMap.has(key)) return { ...dbMap.get(key)!, source: "db" };
        const def = defaults.find((d) => d.key === key);
        if (!def) return null;
        return {
          ...def,
          daysOfWeek: getEnabledDays(def.schedule),
          source: "default",
        };
      })
      .filter(Boolean);

    // If vacations requested, fetch all
    let vacations: Record<string, unknown[]> = {};
    if (wantVacations) {
      const vacResult = await db.execute({
        sql: "SELECT * FROM operator_vacations ORDER BY start_date ASC",
        args: [],
      });
      for (const r of vacResult.rows) {
        const opKey = r.operator_key as string;
        if (!vacations[opKey]) vacations[opKey] = [];
        vacations[opKey].push({
          id: r.id,
          operator_key: opKey,
          start_date: r.start_date,
          end_date: r.end_date,
          note: r.note || "",
        });
      }
    }

    return NextResponse.json({ availability: merged, vacations });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

// PUT /api/availability — save/update operator availability (admin only)
// Body: { secret, operator_key, schedule, session_duration, break_between }
export async function PUT(request: Request) {
  await ensureDb();

  try {
    const body = await request.json();
    const { secret, operator_key, schedule, session_duration, break_between } = body;

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!operator_key || !schedule || typeof schedule !== "object") {
      return NextResponse.json(
        { error: "Missing required fields: operator_key, schedule" },
        { status: 400 }
      );
    }

    // Validate schedule format
    for (const [dayKey, dayVal] of Object.entries(schedule)) {
      const d = Number(dayKey);
      if (isNaN(d) || d < 0 || d > 6) {
        return NextResponse.json({ error: `Invalid day key: ${dayKey}` }, { status: 400 });
      }
      const dv = dayVal as { enabled: boolean; timeSlots: { start: string; end: string }[] };
      if (typeof dv.enabled !== "boolean" || !Array.isArray(dv.timeSlots)) {
        return NextResponse.json({ error: `Invalid schedule for day ${dayKey}` }, { status: 400 });
      }
      if (dv.enabled) {
        for (const slot of dv.timeSlots) {
          if (!slot.start || !slot.end) {
            return NextResponse.json({ error: "Each time slot must have start and end" }, { status: 400 });
          }
          if (!/^\d{2}:\d{2}$/.test(slot.start) || !/^\d{2}:\d{2}$/.test(slot.end)) {
            return NextResponse.json({ error: "Time format must be HH:MM" }, { status: 400 });
          }
        }
      }
    }

    // Compute legacy fields from schedule for backward compat
    const daysOfWeek = Object.entries(schedule)
      .filter(([, v]) => (v as { enabled: boolean }).enabled)
      .map(([k]) => Number(k))
      .sort((a, b) => a - b);

    // Use first enabled day's time slots as the legacy time_slots
    const firstEnabledDay = daysOfWeek[0];
    const legacyTimeSlots =
      firstEnabledDay !== undefined
        ? (schedule[firstEnabledDay] as { timeSlots: TimeSlot[] }).timeSlots
        : [];

    // Upsert
    await db.execute({
      sql: `INSERT INTO operator_availability (operator_key, days_of_week, time_slots, session_duration, break_between, schedule_json, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(operator_key) DO UPDATE SET
              days_of_week = excluded.days_of_week,
              time_slots = excluded.time_slots,
              session_duration = excluded.session_duration,
              break_between = excluded.break_between,
              schedule_json = excluded.schedule_json,
              updated_at = datetime('now')`,
      args: [
        operator_key,
        JSON.stringify(daysOfWeek),
        JSON.stringify(legacyTimeSlots),
        session_duration || 60,
        break_between || 15,
        JSON.stringify(schedule),
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json({ error: "Failed to save availability" }, { status: 500 });
  }
}

// DELETE /api/availability — reset to default (removes DB override)
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

// POST /api/availability — manage vacations
// Body: { secret, action: "add_vacation"|"delete_vacation", ... }
export async function POST(request: Request) {
  await ensureDb();

  try {
    const body = await request.json();
    const { secret, action } = body;

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "add_vacation") {
      const { operator_key, start_date, end_date, note } = body;
      if (!operator_key || !start_date || !end_date) {
        return NextResponse.json({ error: "Missing fields: operator_key, start_date, end_date" }, { status: 400 });
      }
      if (start_date > end_date) {
        return NextResponse.json({ error: "start_date must be before end_date" }, { status: 400 });
      }
      await db.execute({
        sql: `INSERT INTO operator_vacations (operator_key, start_date, end_date, note) VALUES (?, ?, ?, ?)`,
        args: [operator_key, start_date, end_date, note || ""],
      });
      return NextResponse.json({ success: true });
    }

    if (action === "delete_vacation") {
      const { vacation_id } = body;
      if (!vacation_id) {
        return NextResponse.json({ error: "Missing vacation_id" }, { status: 400 });
      }
      await db.execute({
        sql: "DELETE FROM operator_vacations WHERE id = ?",
        args: [vacation_id],
      });
      return NextResponse.json({ success: true });
    }

    if (action === "get_vacations") {
      const { operator_key } = body;
      const sql = operator_key
        ? "SELECT * FROM operator_vacations WHERE operator_key = ? ORDER BY start_date ASC"
        : "SELECT * FROM operator_vacations ORDER BY start_date ASC";
      const args = operator_key ? [operator_key] : [];
      const result = await db.execute({ sql, args });
      const vacations = result.rows.map((r) => ({
        id: r.id,
        operator_key: r.operator_key,
        start_date: r.start_date,
        end_date: r.end_date,
        note: r.note || "",
      }));
      return NextResponse.json({ vacations });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error in availability POST:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
