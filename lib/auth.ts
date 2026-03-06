import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername } from "./userQueries";

const JWT_SECRET = process.env.JWT_SECRET || "relevi-healing-admin-secret-key-2026";

export interface AdminUser {
  id?: number;
  username: string;
  passwordHash: string;
  employeeKey: string; // matches operator key in availability.ts
  displayName: string;
  role: "employee" | "superadmin";
}


export async function verifyCredentials(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? user : null;
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
