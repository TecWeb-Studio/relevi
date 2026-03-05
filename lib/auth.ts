import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "relevi-healing-admin-secret-key-2026";

export interface AdminUser {
  username: string;
  passwordHash: string;
  employeeKey: string; // matches operator key in availability.ts
  displayName: string;
  role: "employee" | "superadmin";
}

// Pre-hashed passwords (bcrypt hash of the plain passwords)
// Passwords are listed in the credentials document
export const adminUsers: AdminUser[] = [
  {
    username: "francesca.mayer",
    passwordHash: bcrypt.hashSync("Relevi_FM2026!", 10),
    employeeKey: "headmaster",
    displayName: "Francesca Mayer",
    role: "superadmin",
  },
  {
    username: "corrado.zamboni",
    passwordHash: bcrypt.hashSync("Relevi_CZ2026!", 10),
    employeeKey: "corradoZamboni",
    displayName: "Corrado Zamboni",
    role: "employee",
  },
  {
    username: "denise.dallapasqua",
    passwordHash: bcrypt.hashSync("Relevi_DDP2026!", 10),
    employeeKey: "deniseDallaPasqua",
    displayName: "Denise Dalla Pasqua",
    role: "employee",
  },
  {
    username: "francesca.tonon",
    passwordHash: bcrypt.hashSync("Relevi_FT2026!", 10),
    employeeKey: "francescaTonon",
    displayName: "Francesca Tonon",
    role: "employee",
  },
  {
    username: "giancarlo.pavanello",
    passwordHash: bcrypt.hashSync("Relevi_GP2026!", 10),
    employeeKey: "giancarloPavanello",
    displayName: "Giancarlo Pavanello",
    role: "employee",
  },
  {
    username: "massimo.gnesotto",
    passwordHash: bcrypt.hashSync("Relevi_MG2026!", 10),
    employeeKey: "massimoGnesotto",
    displayName: "Massimo Gnesotto",
    role: "employee",
  },
  {
    username: "michela.dolce",
    passwordHash: bcrypt.hashSync("Relevi_MD2026!", 10),
    employeeKey: "michelaDolce",
    displayName: "Michela Dolce",
    role: "employee",
  },
  {
    username: "monica.bortoluzzi",
    passwordHash: bcrypt.hashSync("Relevi_MB2026!", 10),
    employeeKey: "monicaBortoluzzi",
    displayName: "Monica Bortoluzzi",
    role: "employee",
  },
  {
    username: "paolo.avella",
    passwordHash: bcrypt.hashSync("Relevi_PA2026!", 10),
    employeeKey: "paoloAvella",
    displayName: "Paolo Avella",
    role: "employee",
  },
  {
    username: "sabrina.pozzobon",
    passwordHash: bcrypt.hashSync("Relevi_SP2026!", 10),
    employeeKey: "sabrinaPozzobon",
    displayName: "Sabrina Pozzobon",
    role: "employee",
  },
  {
    username: "tamara.zanchetta",
    passwordHash: bcrypt.hashSync("Relevi_TZ2026!", 10),
    employeeKey: "tamaraZanchetta",
    displayName: "Tamara Zanchetta",
    role: "employee",
  },
  {
    username: "martina.pasut",
    passwordHash: bcrypt.hashSync("Relevi_MP2026!", 10),
    employeeKey: "martinaPasut",
    displayName: "Martina Pasut",
    role: "employee",
  },
];

export function verifyCredentials(username: string, password: string): AdminUser | null {
  const user = adminUsers.find((u) => u.username === username);
  if (!user) return null;
  if (!bcrypt.compareSync(password, user.passwordHash)) return null;
  return user;
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      username: user.username,
      employeeKey: user.employeeKey,
      displayName: user.displayName,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export interface TokenPayload {
  username: string;
  employeeKey: string;
  displayName: string;
  role: "employee" | "superadmin";
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
