const {createClient} = require("@libsql/client");
const bcrypt = require("bcryptjs");

(async () => {
  const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const users = [
    { username: "daria.debona", password: "daria.debona2026", employeeKey: "dariaDeBona", displayName: "Daria De Bona" },
    { username: "giada.giacomini", password: "giada.giacomini2026", employeeKey: "giadaGiacomini", displayName: "Giada Giacomini" },
    { username: "stefano.perinotto", password: "stefano.perinotto2026", employeeKey: "stefanoPerinotto", displayName: "Stefano Perinotto" },
    { username: "monica.degiusti", password: "monica.degiusti2026", employeeKey: "monicaDeGiusti", displayName: "Monica De Giusti" },
  ];

  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    try {
      const r = await db.execute({
        sql: "INSERT INTO users (username, password_hash, employee_key, display_name, role) VALUES (?, ?, ?, ?, ?) RETURNING id, username, display_name, role",
        args: [u.username, hash, u.employeeKey, u.displayName, "employee"],
      });
      console.log("CREATED:", JSON.stringify(r.rows[0]));
    } catch (e) {
      console.error("FAIL " + u.username + ":", e.message);
    }
  }

  process.exit(0);
})();
