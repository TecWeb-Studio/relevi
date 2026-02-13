// Operator availability configuration
// Each operator has their available days (0=Sunday, 1=Monday, ..., 6=Saturday)
// and time slots for those days

export interface TimeSlot {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface OperatorAvailability {
  key: string;
  daysOfWeek: number[]; // 0-6
  timeSlots: TimeSlot[];
  sessionDuration: number; // minutes
  breakBetweenSessions: number; // minutes
}

export const operatorAvailability: OperatorAvailability[] = [
  {
    key: "headmaster", // Francesca Mayer
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    timeSlots: [
      { start: "09:00", end: "13:00" },
      { start: "14:30", end: "18:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "corradoZamboni",
    daysOfWeek: [2, 4], // Tue, Thu
    timeSlots: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "19:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "deniseDallaPasqua",
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    timeSlots: [
      { start: "09:00", end: "13:00" },
      { start: "14:00", end: "18:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "giancarloPavanello",
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon-Sat
    timeSlots: [
      { start: "09:00", end: "13:00" },
      { start: "14:30", end: "19:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "graziaSferrazzaCallea",
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    timeSlots: [
      { start: "10:00", end: "13:00" },
      { start: "14:30", end: "17:30" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "martinaPasut",
    daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    timeSlots: [
      { start: "09:00", end: "12:00" },
      { start: "16:00", end: "20:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "martinaRoma",
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    timeSlots: [
      { start: "09:00", end: "13:00" },
      { start: "14:00", end: "18:00" },
    ],
    sessionDuration: 45,
    breakBetweenSessions: 15,
  },
  {
    key: "massimoGnesotto",
    daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    timeSlots: [
      { start: "10:00", end: "13:00" },
      { start: "15:00", end: "19:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "michelaDolce",
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    timeSlots: [
      { start: "10:00", end: "13:00" },
      { start: "14:30", end: "18:30" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "monicaBortoluzzi",
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    timeSlots: [
      { start: "09:30", end: "12:30" },
      { start: "14:30", end: "18:30" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "paoloAvella",
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon-Sat
    timeSlots: [
      { start: "08:00", end: "12:00" },
      { start: "15:00", end: "19:00" },
    ],
    sessionDuration: 45,
    breakBetweenSessions: 15,
  },
  {
    key: "sabrinaPozzobon",
    daysOfWeek: [2, 4, 6], // Tue, Thu, Sat
    timeSlots: [
      { start: "10:00", end: "13:00" },
      { start: "14:30", end: "18:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
  {
    key: "tamaraZanchetta",
    daysOfWeek: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
    timeSlots: [
      { start: "09:00", end: "12:00" },
      { start: "15:00", end: "19:00" },
    ],
    sessionDuration: 60,
    breakBetweenSessions: 15,
  },
];

/**
 * Generate available time slots for a given operator and date
 */
export function getAvailableSlots(operatorKey: string, date: Date): string[] {
  const availability = operatorAvailability.find((a) => a.key === operatorKey);
  if (!availability) return [];

  const dayOfWeek = date.getDay();
  if (!availability.daysOfWeek.includes(dayOfWeek)) return [];

  const slots: string[] = [];
  const { sessionDuration, breakBetweenSessions } = availability;

  for (const range of availability.timeSlots) {
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
  return availability.daysOfWeek.includes(date.getDay());
}

/**
 * Get operator availability summary (which days they work)
 */
export function getOperatorScheduleSummary(
  operatorKey: string,
): { daysOfWeek: number[]; timeSlots: TimeSlot[] } | null {
  const availability = operatorAvailability.find((a) => a.key === operatorKey);
  if (!availability) return null;
  return {
    daysOfWeek: availability.daysOfWeek,
    timeSlots: availability.timeSlots,
  };
}
