import { createClient, type Client } from "@libsql/client";

let _db: Client | null = null;

export function getDb(): Client {
  if (!_db) {
    const tursoUrl = process.env.TURSO_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      throw new Error(
        "TURSO_URL and TURSO_AUTH_TOKEN environment variables are required",
      );
    }

    _db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
  }
  return _db;
}

/** @deprecated Use getDb() instead */
export const db = new Proxy({} as Client, {
  get(_, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
