import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export interface Appointment {
  id: string;
  operatorKey: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityOverride {
  operatorKey: string;
  date: string; // YYYY-MM-DD
  available: boolean; // false = day off, true = extra day
  timeSlots?: { start: string; end: string }[]; // custom slots for that day
  reason?: string;
}

interface DataStore {
  appointments: Appointment[];
  availabilityOverrides: AvailabilityOverride[];
}

const DATA_PATH = join(process.cwd(), "data");
const APPOINTMENTS_FILE = join(DATA_PATH, "appointments.json");

function ensureDataDir() {
  const fs = require("fs");
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
  }
}

function readData(): DataStore {
  ensureDataDir();
  if (!existsSync(APPOINTMENTS_FILE)) {
    const defaultData: DataStore = { appointments: [], availabilityOverrides: [] };
    writeFileSync(APPOINTMENTS_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = readFileSync(APPOINTMENTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { appointments: [], availabilityOverrides: [] };
  }
}

function writeData(data: DataStore) {
  ensureDataDir();
  writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2));
}

// Appointments CRUD
export function getAllAppointments(): Appointment[] {
  return readData().appointments;
}

export function getAppointmentsByOperator(operatorKey: string): Appointment[] {
  return readData().appointments.filter((a) => a.operatorKey === operatorKey);
}

export function getAppointmentById(id: string): Appointment | undefined {
  return readData().appointments.find((a) => a.id === id);
}

export function createAppointment(
  appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
): Appointment {
  const data = readData();
  const now = new Date().toISOString();
  const newAppointment: Appointment = {
    ...appointment,
    id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  data.appointments.push(newAppointment);
  writeData(data);
  return newAppointment;
}

export function updateAppointment(
  id: string,
  updates: Partial<Omit<Appointment, "id" | "createdAt">>
): Appointment | null {
  const data = readData();
  const idx = data.appointments.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  data.appointments[idx] = {
    ...data.appointments[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  return data.appointments[idx];
}

export function deleteAppointment(id: string): boolean {
  const data = readData();
  const idx = data.appointments.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  data.appointments.splice(idx, 1);
  writeData(data);
  return true;
}

// Availability Overrides
export function getAvailabilityOverrides(operatorKey?: string): AvailabilityOverride[] {
  const data = readData();
  if (operatorKey) {
    return data.availabilityOverrides.filter((o) => o.operatorKey === operatorKey);
  }
  return data.availabilityOverrides;
}

export function setAvailabilityOverride(override: AvailabilityOverride): void {
  const data = readData();
  const idx = data.availabilityOverrides.findIndex(
    (o) => o.operatorKey === override.operatorKey && o.date === override.date
  );
  if (idx >= 0) {
    data.availabilityOverrides[idx] = override;
  } else {
    data.availabilityOverrides.push(override);
  }
  writeData(data);
}

export function removeAvailabilityOverride(operatorKey: string, date: string): boolean {
  const data = readData();
  const idx = data.availabilityOverrides.findIndex(
    (o) => o.operatorKey === operatorKey && o.date === date
  );
  if (idx === -1) return false;
  data.availabilityOverrides.splice(idx, 1);
  writeData(data);
  return true;
}
