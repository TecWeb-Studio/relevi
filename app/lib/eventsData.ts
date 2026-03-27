export interface EventData {
  id: number;
  key: string;
  type: "workshop" | "retreat" | "special" | "class";
  image: string;
  images?: string[];
  video?: string;
}

export interface EventDetail {
  date: string;
  dateDisplay?: string;
  time: string;
  endTime: string;
  location: string;
  spots: number;
  spotsLeft: number;
}

const DEFAULT_EVENT_DETAIL: EventDetail = {
  date: "2099-01-01",
  time: "09:00",
  endTime: "17:00",
  location: "",
  spots: 0,
  spotsLeft: 0,
};

export const EVENTS: EventData[] = [
  {
    id: 1,
    key: "allergiesEvent",
    type: "workshop",
    image: "/images/events/allergie.png",
  },
  {
    id: 2,
    key: "studyDaysEvent",
    type: "workshop",
    image: "/images/events/studydays.jpeg",
  },
  {
    id: 3,
    key: "equilibrioDonnaEvent",
    type: "special",
    image: "/images/events/equilibrio-donna/donna.avif",
    images: [
      "/images/events/equilibrio-donna/1.png",
      "/images/events/equilibrio-donna/2.png",
      "/images/events/equilibrio-donna/3.png",
      "/images/events/equilibrio-donna/4.png",
      "/images/events/equilibrio-donna/5.png",
    ],
  },
  {
    id: 4,
    key: "dinamicheEducativeEvent",
    type: "workshop",
    image: "/images/events/dinamiche-educative/banner.jpg",
    images: [
      "/images/events/dinamiche-educative/1.png",
      "/images/events/dinamiche-educative/2.png",
    ],
  },
  {
    id: 5,
    key: "benessereRelaxEvent",
    type: "special",
    image: "/images/events/benessere-relax/bannerBenessere.jpg",
    video: "/images/events/benessere-relax/benessere.mp4",
  },
];

export const EVENT_DETAILS_BY_KEY: Record<string, EventDetail> = {
  allergiesEvent: {
    date: "2026-02-28",
    time: "10:00",
    endTime: "17:00",
    location: "Via Campagna 46, San Polo di Piave (TV)",
    spots: 30,
    spotsLeft: 30,
  },
  studyDaysEvent: {
    date: "2026-04-01",
    dateDisplay: "1 Aprile - 20 Giugno 2026",
    time: "09:30",
    endTime: "16:30",
    location: "Via Campagna 46, San Polo di Piave (TV)",
    spots: 0,
    spotsLeft: 0,
  },
  equilibrioDonnaEvent: {
    date: "2026-03-08",
    time: "09:30",
    endTime: "17:30",
    location: "Via Campagna 46, San Polo di Piave (TV)",
    spots: 40,
    spotsLeft: 40,
  },
  dinamicheEducativeEvent: {
    date: "2026-04-15",
    time: "09:30",
    endTime: "16:30",
    location: "Via Campagna 46, San Polo di Piave (TV)",
    spots: 20,
    spotsLeft: 20,
  },
  benessereRelaxEvent: {
    date: "2026-03-28",
    dateDisplay: "28-29 Marzo 2026",
    time: "09:30",
    endTime: "16:30",
    location: "Via Campagna 46, San Polo di Piave (TV)",
    spots: 0,
    spotsLeft: 0,
  },
};

const parseNumeric = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

export const mergeEventDetails = (key: string, raw: unknown): EventDetail => {
  const base = EVENT_DETAILS_BY_KEY[key] ?? DEFAULT_EVENT_DETAIL;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }

  const translated = raw as Partial<EventDetail>;
  return {
    date:
      typeof translated.date === "string" && translated.date
        ? translated.date
        : base.date,
    dateDisplay:
      typeof translated.dateDisplay === "string"
        ? translated.dateDisplay
        : base.dateDisplay,
    time:
      typeof translated.time === "string" && translated.time
        ? translated.time
        : base.time,
    endTime:
      typeof translated.endTime === "string" && translated.endTime
        ? translated.endTime
        : base.endTime,
    location:
      typeof translated.location === "string" && translated.location
        ? translated.location
        : base.location,
    spots: parseNumeric(translated.spots, base.spots),
    spotsLeft: parseNumeric(translated.spotsLeft, base.spotsLeft),
  };
};

const normalizeTimeTo24 = (value: string): string | null => {
  const normalized = value.trim().toLowerCase().replace(/\./g, "");

  const match12h = normalized.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (match12h) {
    let hour = Number(match12h[1]);
    const minutes = match12h[2];
    const period = match12h[3];
    if (period === "pm" && hour < 12) {
      hour += 12;
    }
    if (period === "am" && hour === 12) {
      hour = 0;
    }
    return `${String(hour).padStart(2, "0")}:${minutes}`;
  }

  const match24h = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (match24h) {
    const hour = Number(match24h[1]);
    const minutes = Number(match24h[2]);
    if (hour >= 0 && hour <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  return null;
};

export const isEventPassed = (
  detail: Partial<EventDetail> | null | undefined,
): boolean => {
  if (!detail?.date) {
    return false;
  }

  const endTime = normalizeTimeTo24(detail.endTime ?? "") ?? "23:59";
  const eventDate = new Date(`${detail.date}T${endTime}:00`);
  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  return new Date() > eventDate;
};

export const getEventTypeColor = (type: string): string => {
  switch (type) {
    case "workshop":
      return "bg-blue-100 text-blue-700";
    case "retreat":
      return "bg-purple-100 text-purple-700";
    case "special":
      return "bg-pink-100 text-pink-700";
    case "class":
      return "bg-green-100 text-green-700";
    default:
      return "bg-olive-100 text-olive-700";
  }
};
