import db from "./db";

export async function initializeDatabase() {
  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operator_key TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        client_email TEXT DEFAULT '',
        booking_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        service TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'confirmed',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS operator_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operator_key TEXT NOT NULL UNIQUE,
        days_of_week TEXT NOT NULL DEFAULT '[]',
        time_slots TEXT NOT NULL DEFAULT '[]',
        session_duration INTEGER NOT NULL DEFAULT 60,
        break_between INTEGER NOT NULL DEFAULT 15,
        schedule_json TEXT DEFAULT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS operator_vacations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operator_key TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        note TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_bookings_operator_date 
            ON bookings(operator_key, booking_date)`,
      args: [],
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_bookings_status 
            ON bookings(status)`,
      args: [],
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_bookings_date 
            ON bookings(booking_date)`,
      args: [],
    },
    {
      sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_operator
            ON operator_availability(operator_key)`,
      args: [],
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_vacations_operator
            ON operator_vacations(operator_key)`,
      args: [],
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_vacations_dates
            ON operator_vacations(start_date, end_date)`,
      args: [],
    },
  ]);

  // Migration: add schedule_json column if it doesn't exist (safe for existing DBs)
  try {
    await db.execute({ sql: `ALTER TABLE operator_availability ADD COLUMN schedule_json TEXT DEFAULT NULL`, args: [] });
  } catch {
    // Column already exists — ignore
  }

  // Migration: create operator_vacations if not exists (already handled by CREATE TABLE IF NOT EXISTS above)
}
