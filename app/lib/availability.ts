// Operator availability configuration
// Each operator has per-day schedule (0=Sunday, 1=Monday, ..., 6=Saturday)
// Each day can have its own time slots independently

export interface TimeSlot {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

// Per-day schedule: keys are day numbers 0-6
export type WeekSchedule = Record<string, DaySchedule>;

export interface OperatorAvailability {
  key: string;
  schedule: WeekSchedule;
  sessionDuration: number; // minutes
  breakBetweenSessions: number; // minutes
}

export interface VacationPeriod {
  id?: number;
  operator_key: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  note?: string;
}

// Helper: convert old format (daysOfWeek + timeSlots) to new per-day format
export function convertLegacyToSchedule(
  daysOfWeek: number[],
  timeSlots: TimeSlot[]
): WeekSchedule {
  const schedule: WeekSchedule = {};
  for (let d = 0; d <= 6; d++) {
    schedule[d] = {
      enabled: daysOfWeek.includes(d),
      timeSlots: daysOfWeek.includes(d)
        ? timeSlots.map((s) => ({ ...s }))
        : [{ start: "09:00", end: "13:00" }],
    };
  }
  return schedule;
}

// Helper: build a default week schedule from shorthand
function makeSchedule(
  days: number[],
  slots: TimeSlot[]
): WeekSchedule {
  return convertLegacyToSchedule(days, slots);
}

export const operatorAvailability: OperatorAvailability[] = [
  {
    key: "headmaster", // Francesca Mayer
    schedule: makeSchedule([1, 2, 3, 4, 5], [
      { start: "09:00", end: "13:00" },
      { start: "14:30", end: "18:00" },
    ]),
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "corradoZamboni",
    schedule: makeSchedule([2, 4], [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "19:00" },
    ]),
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "martinaPasut",
    schedule: makeSchedule([2, 4, 6], [
      { start: "09:00", end: "12:00" },
      { start: "16:00", end: "20:00" },
    ]),
    sessionDuration: 45,
    breakBetweenSessions: 15,
  },
  {
    key: "massimoGnesotto",
    schedule: makeSchedule([2, 4, 6], [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "19:00" },
    ]),
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "michelaDolce",
    schedule: makeSchedule([1, 3, 5], [
      { start: "10:00", end: "13:00" },
      { start: "14:30", end: "18:30" },
    ]),
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "monicaBortoluzzi",
    schedule: makeSchedule([1, 3, 5], [
      { start: "09:30", end: "12:30" },
      { start: "14:30", end: "18:30" },
    ]),
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "paoloAvella",
    schedule: makeSchedule([1, 2, 3, 4, 5, 6], [
      { start: "08:00", end: "12:00" },
      { start: "15:00", end: "19:00" },
    ]),
    sessionDuration: 45,
    breakBetweenSessions: 15,
  },
  {
    key: "sabrinaPozzobon",
    schedule: makeSchedule([2, 4, 6], [
      { start: "10:00", end: "13:00" },
      { start: "14:30", end: "18:00" },
    ]),
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "tamaraZanchetta",
    schedule: makeSchedule([1, 3, 5, 6], [
      { start: "09:00", end: "12:00" },
      { start: "15:00", end: "19:00" },
    ]),
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
];

/**
 * Get enabled days from a schedule
 */
export function getEnabledDays(schedule: WeekSchedule): number[] {
  return Object.entries(schedule)
    .filter(([, day]) => day.enabled)
    .map(([d]) => Number(d))
    .sort((a, b) => a - b);
}

/**
 * Generate available time slots for a given operator and date
 */
export function getAvailableSlots(operatorKey: string, date: Date): string[] {
  const availability = operatorAvailability.find((a) => a.key === operatorKey);
  if (!availability) return [];

  const dayOfWeek = date.getDay();
  const daySchedule = availability.schedule[dayOfWeek];
  if (!daySchedule || !daySchedule.enabled) return [];

  const slots: string[] = [];
  const { sessionDuration, breakBetweenSessions } = availability;

  for (const range of daySchedule.timeSlots) {
    const [startH, startM] = range.start.split(":").map(Number);
    const [endH, endM] = range.end.split(":").map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + sessionDuration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      );
      currentMinutes += sessionDuration + breakBetweenSessions;
    }
  }

  return slots;
}

/**
 * Check if a given date has any available slots for an operator
 */
export function hasAvailability(operatorKey: string, date: Date): boolean {
  const availability = operatorAvailability.find((a) => a.key === operatorKey);
  if (!availability) return false;
  const daySchedule = availability.schedule[date.getDay()];
  return !!daySchedule && daySchedule.enabled;
}

/**
 * Get operator availability summary (which days they work)
 */
export function getOperatorScheduleSummary(
  operatorKey: string,
): { daysOfWeek: number[]; schedule: WeekSchedule } | null {
  const availability = operatorAvailability.find((a) => a.key === operatorKey);
  if (!availability) return null;
  return {
    daysOfWeek: getEnabledDays(availability.schedule),
    schedule: availability.schedule,
  };
}
