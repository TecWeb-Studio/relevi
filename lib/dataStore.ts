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

export interface OperatorSchedule {
  operatorKey: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  timeSlots: { start: string; end: string }[]; // default slots (backward compat)
  daySlots?: { [day: number]: { start: string; end: string }[] }; // per-day slots override
  sessionDuration: number; // minutes
  breakBetweenSessions: number; // minutes
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

interface DataStore {
  appointments: Appointment[];
  availabilityOverrides: AvailabilityOverride[];
  operatorSchedules: OperatorSchedule[];
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
    const defaultData: DataStore = { appointments: [], availabilityOverrides: [], operatorSchedules: [] };
    writeFileSync(APPOINTMENTS_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = readFileSync(APPOINTMENTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.operatorSchedules) parsed.operatorSchedules = [];
    return parsed;
  } catch {
    return { appointments: [], availabilityOverrides: [], operatorSchedules: [] };
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

// Operator Schedules
export function getOperatorSchedule(operatorKey: string): OperatorSchedule {
  const data = readData();
  const found = data.operatorSchedules.find((s) => s.operatorKey === operatorKey);
  if (found) return found;
  const def = DEFAULT_SCHEDULES.find((s) => s.operatorKey === operatorKey);
  return def || { operatorKey, daysOfWeek: [1, 2, 3, 4, 5], timeSlots: [{ start: "09:00", end: "18:00" }], sessionDuration: 60, breakBetweenSessions: 15 };
}

export function setOperatorSchedule(schedule: OperatorSchedule): void {
  const data = readData();
  const idx = data.operatorSchedules.findIndex((s) => s.operatorKey === schedule.operatorKey);
  if (idx >= 0) {
    data.operatorSchedules[idx] = schedule;
  } else {
    data.operatorSchedules.push(schedule);
  }
  writeData(data);
}

export function getAllOperatorSchedules(): OperatorSchedule[] {
  const data = readData();
  const dbKeys = new Set(data.operatorSchedules.map((s) => s.operatorKey));
  const defaults = DEFAULT_SCHEDULES.filter((s) => !dbKeys.has(s.operatorKey));
  return [...data.operatorSchedules, ...defaults];
}
