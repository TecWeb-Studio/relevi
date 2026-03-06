import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error(
    "TURSO_URL and TURSO_AUTH_TOKEN environment variables are required",
  );
}

export const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});
