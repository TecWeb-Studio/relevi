import { getDb } from "./db";
import bcrypt from "bcryptjs";

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  employeeKey: string;
  displayName: string;
  role: "employee" | "superadmin";
}

export async function getUserByUsername(
  username: string,
): Promise<AdminUser | null> {
  try {
    const result = await getDb().execute({
      sql: "SELECT id, username, password_hash as passwordHash, employee_key as employeeKey, display_name as displayName, role FROM users WHERE username = ?",
      args: [username],
    });

    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as AdminUser;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return null;
  }
}

export async function getUserByEmployeeKey(
  employeeKey: string,
): Promise<AdminUser | null> {
  try {
    const result = await getDb().execute({
      sql: "SELECT id, username, password_hash as passwordHash, employee_key as employeeKey, display_name as displayName, role FROM users WHERE employee_key = ?",
      args: [employeeKey],
    });

    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as AdminUser;
  } catch (error) {
    console.error("Error fetching user by employee key:", error);
    return null;
  }
}

export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const result = await getDb().execute(
      "SELECT id, username, password_hash as passwordHash, employee_key as employeeKey, display_name as displayName, role FROM users ORDER BY display_name ASC",
    );
    return result.rows as unknown as AdminUser[];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function createUser(
  username: string,
  password: string,
  employeeKey: string,
  displayName: string,
  role: "employee" | "superadmin",
): Promise<AdminUser | null> {
  try {
    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await getDb().execute({
      sql: "INSERT INTO users (username, password_hash, employee_key, display_name, role) VALUES (?, ?, ?, ?, ?) RETURNING id, username, password_hash as passwordHash, employee_key as employeeKey, display_name as displayName, role",
      args: [username, passwordHash, employeeKey, displayName, role],
    });

    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as AdminUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function updateUser(
  id: number,
  updates: Partial<Omit<AdminUser, "id" | "passwordHash">>,
): Promise<AdminUser | null> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.username) {
      setClauses.push("username = ?");
      args.push(updates.username);
    }
    if (updates.displayName) {
      setClauses.push("display_name = ?");
      args.push(updates.displayName);
    }
    if (updates.role) {
      setClauses.push("role = ?");
      args.push(updates.role);
    }

    if (setClauses.length === 0) return null;

    args.push(id);

    const result = await getDb().execute({
      sql: `UPDATE users SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING id, username, password_hash as passwordHash, employee_key as employeeKey, display_name as displayName, role`,
      args,
    });

    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as AdminUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function updateUserPassword(
  id: number,
  newPassword: string,
): Promise<boolean> {
  try {
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    const result = await getDb().execute({
      sql: "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [passwordHash, id],
    });

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error updating user password:", error);
    return false;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const result = await getDb().execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
