import { getDb } from "./db";

export interface Appointment {
  id: string;
  operatorKey: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes (not stored in DB, defaults to 60)
  service?: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityOverride {
  operatorKey: string;
  date: string; // YYYY-MM-DD (maps to start_date in operator_vacations)
  endDate?: string; // YYYY-MM-DD (maps to end_date; same as date for single-day overrides)
  available: boolean; // always false for vacations
  timeSlots?: { start: string; end: string }[];
  reason?: string;
}

export interface OperatorSchedule {
  operatorKey: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  timeSlots: { start: string; end: string }[];
  daySlots?: { [day: number]: { start: string; end: string }[] };
  sessionDuration: number;
  breakBetweenSessions: number;
}

const DEFAULT_SCHEDULES: OperatorSchedule[] = [
  { operatorKey: "headmaster", daysOfWeek: [1,2,3,4,5], timeSlots: [{ start: "09:00", end: "13:00" }, { start: "14:30", end: "18:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "corradoZamboni", daysOfWeek: [2,4], timeSlots: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "19:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "deniseDallaPasqua", daysOfWeek: [1,3,5], timeSlots: [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "18:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "francescaTonon", daysOfWeek: [2,4,6], timeSlots: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "19:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "giancarloPavanello", daysOfWeek: [1,2,3,4,5], timeSlots: [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "18:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "martinaPasut", daysOfWeek: [2,4,6], timeSlots: [{ start: "09:00", end: "12:00" }, { start: "16:00", end: "20:00" }], sessionDuration: 45, breakBetweenSessions: 15 },
  { operatorKey: "massimoGnesotto", daysOfWeek: [2,4,6], timeSlots: [{ start: "10:00", end: "13:00" }, { start: "15:00", end: "19:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "michelaDolce", daysOfWeek: [1,3,5], timeSlots: [{ start: "10:00", end: "13:00" }, { start: "14:30", end: "18:30" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "monicaBortoluzzi", daysOfWeek: [1,3,5], timeSlots: [{ start: "09:30", end: "12:30" }, { start: "14:30", end: "18:30" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "paoloAvella", daysOfWeek: [1,2,3,4,5,6], timeSlots: [{ start: "08:00", end: "12:00" }, { start: "15:00", end: "19:00" }], sessionDuration: 45, breakBetweenSessions: 15 },
  { operatorKey: "sabrinaPozzobon", daysOfWeek: [2,4,6], timeSlots: [{ start: "10:00", end: "13:00" }, { start: "14:30", end: "18:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
  { operatorKey: "tamaraZanchetta", daysOfWeek: [1,3,5,6], timeSlots: [{ start: "09:00", end: "12:00" }, { start: "15:00", end: "19:00" }], sessionDuration: 60, breakBetweenSessions: 15 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAppointment(row: any): Appointment {
  return {
    id: String(row.id),
    operatorKey: row.operator_key as string,
    clientName: row.client_name as string,
    clientPhone: row.client_phone as string,
    clientEmail: (row.client_email as string) || "",
    date: row.booking_date as string,
    time: row.time_slot as string,
    duration: 60,
    service: (row.service as string) || "",
    status: (row.status as Appointment["status"]) || "confirmed",
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSchedule(row: any): OperatorSchedule {
  let daySlots: OperatorSchedule["daySlots"] | undefined;
  if (row.schedule_json) {
    try { daySlots = JSON.parse(row.schedule_json as string); } catch { /* ignore */ }
  }
  let timeSlots: { start: string; end: string }[] = [];
  try { timeSlots = JSON.parse(row.time_slots as string); } catch { /* ignore */ }
  let daysOfWeek: number[] = [];
  try { daysOfWeek = JSON.parse(row.days_of_week as string); } catch { /* ignore */ }

  return {
    operatorKey: row.operator_key as string,
    daysOfWeek,
    timeSlots,
    daySlots,
    sessionDuration: (row.session_duration as number) || 60,
    breakBetweenSessions: (row.break_between as number) || 15,
  };
}

// ─── Appointments CRUD ────────────────────────────────────────────────────────

export async function getAllAppointments(): Promise<Appointment[]> {
  const result = await getDb().execute(
    "SELECT * FROM bookings ORDER BY booking_date ASC, time_slot ASC"
  );
  return result.rows.map(rowToAppointment);
}

export async function getAppointmentsByOperator(operatorKey: string): Promise<Appointment[]> {
  const result = await getDb().execute({
    sql: "SELECT * FROM bookings WHERE operator_key = ? ORDER BY booking_date ASC, time_slot ASC",
    args: [operatorKey],
  });
  return result.rows.map(rowToAppointment);
}

export async function getAppointmentById(id: string): Promise<Appointment | undefined> {
  const result = await getDb().execute({
    sql: "SELECT * FROM bookings WHERE id = ?",
    args: [Number(id)],
  });
  if (result.rows.length === 0) return undefined;
  return rowToAppointment(result.rows[0]);
}

export async function createAppointment(
  appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
): Promise<Appointment> {
  const result = await getDb().execute({
    sql: `INSERT INTO bookings
            (operator_key, client_name, client_phone, client_email, booking_date, time_slot, service, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *`,
    args: [
      appointment.operatorKey,
      appointment.clientName,
      appointment.clientPhone,
      appointment.clientEmail || "",
      appointment.date,
      appointment.time,
      appointment.service || "",
      appointment.status || "confirmed",
      appointment.notes || "",
    ],
  });
  return rowToAppointment(result.rows[0]);
}

export async function updateAppointment(
  id: string,
  updates: Partial<Omit<Appointment, "id" | "createdAt">>
): Promise<Appointment | null> {
  const setClauses: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args: any[] = [];

  if (updates.operatorKey !== undefined) { setClauses.push("operator_key = ?"); args.push(updates.operatorKey); }
  if (updates.clientName !== undefined) { setClauses.push("client_name = ?"); args.push(updates.clientName); }
  if (updates.clientPhone !== undefined) { setClauses.push("client_phone = ?"); args.push(updates.clientPhone); }
  if (updates.clientEmail !== undefined) { setClauses.push("client_email = ?"); args.push(updates.clientEmail); }
  if (updates.date !== undefined) { setClauses.push("booking_date = ?"); args.push(updates.date); }
  if (updates.time !== undefined) { setClauses.push("time_slot = ?"); args.push(updates.time); }
  if (updates.service !== undefined) { setClauses.push("service = ?"); args.push(updates.service); }
  if (updates.status !== undefined) { setClauses.push("status = ?"); args.push(updates.status); }
  if (updates.notes !== undefined) { setClauses.push("notes = ?"); args.push(updates.notes); }

  if (setClauses.length === 0) return (await getAppointmentById(id)) ?? null;

  setClauses.push("updated_at = datetime('now')");
  args.push(Number(id));

  const result = await getDb().execute({
    sql: `UPDATE bookings SET ${setClauses.join(", ")} WHERE id = ? RETURNING *`,
    args,
  });
  if (result.rows.length === 0) return null;
  return rowToAppointment(result.rows[0]);
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const result = await getDb().execute({
    sql: "DELETE FROM bookings WHERE id = ?",
    args: [Number(id)],
  });
  return result.rowsAffected > 0;
}

// ─── Availability Overrides (operator_vacations) ──────────────────────────────

export async function getAvailabilityOverrides(operatorKey?: string): Promise<AvailabilityOverride[]> {
  const result = operatorKey
    ? await getDb().execute({
        sql: "SELECT * FROM operator_vacations WHERE operator_key = ? ORDER BY start_date ASC",
        args: [operatorKey],
      })
    : await getDb().execute("SELECT * FROM operator_vacations ORDER BY start_date ASC");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.rows.map((row: any) => ({
    operatorKey: row.operator_key as string,
    date: row.start_date as string,
    endDate: row.end_date as string,
    available: false, // vacations are always unavailable
    reason: (row.note as string) || "",
  }));
}

export async function setAvailabilityOverride(override: AvailabilityOverride): Promise<void> {
  const endDate = override.endDate || override.date;
  // Upsert: delete existing range for that operator+start_date, then insert
  await getDb().execute({
    sql: "DELETE FROM operator_vacations WHERE operator_key = ? AND start_date = ?",
    args: [override.operatorKey, override.date],
  });
  await getDb().execute({
    sql: "INSERT INTO operator_vacations (operator_key, start_date, end_date, note) VALUES (?, ?, ?, ?)",
    args: [override.operatorKey, override.date, endDate, override.reason || ""],
  });
}

export async function removeAvailabilityOverride(operatorKey: string, date: string): Promise<boolean> {
  const result = await getDb().execute({
    sql: "DELETE FROM operator_vacations WHERE operator_key = ? AND start_date = ?",
    args: [operatorKey, date],
  });
  return result.rowsAffected > 0;
}

// ─── Operator Schedules (operator_availability) ───────────────────────────────

export async function getOperatorSchedule(operatorKey: string): Promise<OperatorSchedule> {
  const result = await getDb().execute({
    sql: "SELECT * FROM operator_availability WHERE operator_key = ?",
    args: [operatorKey],
  });
  if (result.rows.length > 0) return rowToSchedule(result.rows[0]);

  // Fall back to hardcoded defaults
  return (
    DEFAULT_SCHEDULES.find((s) => s.operatorKey === operatorKey) || {
      operatorKey,
      daysOfWeek: [1, 2, 3, 4, 5],
      timeSlots: [{ start: "09:00", end: "18:00" }],
      sessionDuration: 60,
      breakBetweenSessions: 15,
    }
  );
}

export async function setOperatorSchedule(schedule: OperatorSchedule): Promise<void> {
  await getDb().execute({
    sql: `INSERT INTO operator_availability
            (operator_key, days_of_week, time_slots, session_duration, break_between, schedule_json, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(operator_key) DO UPDATE SET
            days_of_week   = excluded.days_of_week,
            time_slots     = excluded.time_slots,
            session_duration = excluded.session_duration,
            break_between  = excluded.break_between,
            schedule_json  = excluded.schedule_json,
            updated_at     = datetime('now')`,
    args: [
      schedule.operatorKey,
      JSON.stringify(schedule.daysOfWeek),
      JSON.stringify(schedule.timeSlots),
      schedule.sessionDuration,
      schedule.breakBetweenSessions,
      schedule.daySlots ? JSON.stringify(schedule.daySlots) : null,
    ],
  });
}

export async function getAllOperatorSchedules(): Promise<OperatorSchedule[]> {
  const result = await getDb().execute(
    "SELECT * FROM operator_availability"
  );
  const dbSchedules = result.rows.map(rowToSchedule);
  const dbKeys = new Set(dbSchedules.map((s) => s.operatorKey));
  const defaults = DEFAULT_SCHEDULES.filter((s) => !dbKeys.has(s.operatorKey));
  return [...dbSchedules, ...defaults];
}
