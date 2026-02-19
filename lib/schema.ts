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
  ]);
}
