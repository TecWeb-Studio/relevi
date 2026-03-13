"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  employeeKey: string;
  displayName: string;
  role: "employee" | "superadmin";
}

interface Appointment {
  id: string;
  operatorKey: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  time: string;
  duration: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilityOverride {
  operatorKey: string;
  date: string;
  available: boolean;
  timeSlots?: { start: string; end: string }[];
  reason?: string;
}

interface OperatorSchedule {
  operatorKey: string;
  daysOfWeek: number[];
  timeSlots: { start: string; end: string }[];
  daySlots?: { [day: number]: { start: string; end: string }[] };
  sessionDuration: number;
  breakBetweenSessions: number;
}

const OPERATOR_NAMES: Record<string, string> = {
  headmaster: "Francesca Mayer",
  corradoZamboni: "Corrado Zamboni",
  deniseDallaPasqua: "Denise Dalla Pasqua",
  francescaTonon: "Francesca Tonon",
  giancarloPavanello: "Giancarlo Pavanello",
  massimoGnesotto: "Massimo Gnesotto",
  michelaDolce: "Michela Dolce",
  monicaBortoluzzi: "Monica Bortoluzzi",
  paoloAvella: "Paolo Avella",
  sabrinaPozzobon: "Sabrina Pozzobon",
  tamaraZanchetta: "Tamara Zanchetta",
  martinaPasut: "Martina Pasut",
};

const STATUS_CONFIG = {
  confirmed: { label: "Confermato", color: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "In attesa", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Annullato", color: "bg-red-100 text-red-700 border-red-200" },
  completed: { label: "Completato", color: "bg-blue-100 text-blue-700 border-blue-200" },
};

type TabType = "today" | "appointments" | "calendar" | "availability" | "stats";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [showOverrideEditor, setShowOverrideEditor] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [schedule, setSchedule] = useState<OperatorSchedule | null>(null);
  const [calendarDate, setCalendarDate] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });

  // New appointment form state
  const [newApt, setNewApt] = useState({
    operatorKey: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    date: "",
    time: "",
    duration: 60,
    status: "confirmed" as Appointment["status"],
    notes: "",
  });

  // Override form state
  const [overrideForm, setOverrideForm] = useState({
    operatorKey: "",
    date: "",
    available: false,
    reason: "",
    customSlots: false,
    timeSlots: [{ start: "", end: "" }] as { start: string; end: string }[],
  });

  // Auth check
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setSelectedOperator(data.user.role === "superadmin" ? "" : data.user.employeeKey);
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin");
      });
  }, [router]);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (selectedOperator) params.set("operatorKey", selectedOperator);
    if (statusFilter) params.set("status", statusFilter);
    if (dateFilter) params.set("dateFrom", dateFilter);

    const res = await fetch(`/api/admin/appointments?${params}`);
    if (res.ok) {
      const data = await res.json();
      setAppointments(data.appointments);
    }
  }, [user, selectedOperator, statusFilter, dateFilter]);

  // Fetch availability (overrides + schedule)
  const fetchAvailability = useCallback(async () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (selectedOperator) params.set("operatorKey", selectedOperator);

    const res = await fetch(`/api/admin/availability?${params}`);
    if (res.ok) {
      const data = await res.json();
      setOverrides(data.overrides);
      setSchedule(data.schedule ?? null);
    }
  }, [user, selectedOperator]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchAvailability();
    }
  }, [user, fetchAppointments, fetchAvailability]);

  // Today's date string
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Today's appointments
  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.date === todayStr && a.status !== "cancelled"),
    [appointments, todayStr]
  );

  // Upcoming appointments
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.date >= todayStr && a.status !== "cancelled").slice(0, 20),
    [appointments, todayStr]
  );

  // Filtered appointments (for search)
  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const q = searchQuery.toLowerCase();
    return appointments.filter(
      (a) =>
        a.clientName.toLowerCase().includes(q) ||
        a.clientPhone.includes(q) ||
        (a.clientEmail && a.clientEmail.toLowerCase().includes(q)) ||
        a.notes.toLowerCase().includes(q)
    );
  }, [appointments, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const thisMonth = todayStr.slice(0, 7);
    const monthAppointments = appointments.filter((a) => a.date.startsWith(thisMonth));
    return {
      today: todayAppointments.length,
      thisMonth: monthAppointments.length,
      confirmed: monthAppointments.filter((a) => a.status === "confirmed").length,
      completed: monthAppointments.filter((a) => a.status === "completed").length,
      cancelled: monthAppointments.filter((a) => a.status === "cancelled").length,
      pending: monthAppointments.filter((a) => a.status === "pending").length,
    };
  }, [appointments, todayAppointments, todayStr]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newApt),
    });
    if (res.ok) {
      setShowNewAppointment(false);
      setNewApt({
        operatorKey: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        date: "",
        time: "",
        duration: 60,
        status: "confirmed",
        notes: "",
      });
      fetchAppointments();
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      fetchAppointments();
      setEditingAppointment(null);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo appuntamento?")) return;
    const res = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAppointments();
    }
  };

  const handleSaveSchedule = async (
    formData: { daysOfWeek: number[]; timeSlots: { start: string; end: string }[]; daySlots?: { [day: number]: { start: string; end: string }[] }; sessionDuration: number; breakBetweenSessions: number },
    targetKey?: string
  ) => {
    const res = await fetch("/api/admin/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operatorKey: targetKey || selectedOperator || user?.employeeKey,
        ...formData,
      }),
    });
    if (res.ok) {
      setShowScheduleEditor(false);
      fetchAvailability();
    }
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    const { operatorKey, date, available, reason, customSlots, timeSlots } = overrideForm;
    const body: {
      operatorKey?: string;
      date: string;
      available: boolean;
      reason: string;
      timeSlots?: { start: string; end: string }[];
    } = {
      operatorKey: operatorKey || undefined,
      date,
      available,
      reason,
    };
    if (customSlots && timeSlots.length > 0) {
      body.timeSlots = timeSlots.filter((s) => s.start && s.end);
    }
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowOverrideEditor(false);
      setOverrideForm({ operatorKey: "", date: "", available: false, reason: "", customSlots: false, timeSlots: [{ start: "", end: "" }] });
      fetchAvailability();
    }
  };

  const handleRemoveOverride = async (operatorKey: string, date: string) => {
    const params = new URLSearchParams({ operatorKey, date });
    const res = await fetch(`/api/admin/availability?${params}`, { method: "DELETE" });
    if (res.ok) {
      fetchAvailability();
    }
  };

  const handleExport = (format: "csv" | "json") => {
    const params = new URLSearchParams({ format });
    if (selectedOperator) params.set("operatorKey", selectedOperator);
    window.open(`/api/admin/export?${params}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-olive-50/30 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-olive-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-olive-600 animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Caricamento...</p>
          <p className="text-xs text-gray-400 mt-1">Preparazione pannello</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "today", label: "Oggi", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "appointments", label: "Appuntamenti", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "calendar", label: "Calendario", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "availability", label: "Disponibilità", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "stats", label: "Statistiche", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-olive-50/30 pt-20">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-olive-500 to-olive-700 rounded-xl flex items-center justify-center shadow-md shadow-olive-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-olive-800">
                  {user.role === "superadmin" ? "Super Admin" : "Il Mio Pannello"}
                </h1>
                <p className="text-xs text-gray-500">{user.displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user.role === "superadmin" && (
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="text-sm border border-olive-200 rounded-xl px-3 py-2 focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-100 text-gray-700 bg-white transition-all"
                >
                  <option value="">Tutti gli operatori</option>
                  {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Esci
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-olive-600 to-olive-700 text-white shadow-md shadow-olive-200/50"
                    : "text-gray-500 hover:bg-olive-50 hover:text-olive-700"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ===== TODAY TAB ===== */}
        {activeTab === "today" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-olive-600">{stats.today}</p>
                <p className="text-sm text-gray-500">Oggi</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.thisMonth}</p>
                <p className="text-sm text-gray-500">Questo mese</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                <p className="text-sm text-gray-500">Confermati</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-sm text-gray-500">In attesa</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setNewApt((prev) => ({ ...prev, date: todayStr }));
                  setShowNewAppointment(true);
                }}
                className="bg-gradient-to-r from-olive-600 to-olive-700 text-white px-5 py-2.5 rounded-xl font-medium hover:from-olive-700 hover:to-olive-800 transition-all duration-200 flex items-center gap-2 shadow-md shadow-olive-200/50 hover:shadow-lg hover:shadow-olive-200/50 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuovo Appuntamento
              </button>
              <button
                onClick={() => { setOverrideForm((p) => ({ ...p, available: false })); setShowOverrideEditor(true); }}
                className="bg-white text-olive-700 px-5 py-2.5 rounded-xl font-medium hover:bg-olive-50 transition-all duration-200 flex items-center gap-2 border border-olive-200 hover:border-olive-300 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Segna Giorno Libero
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="bg-white text-gray-600 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 border border-gray-200 hover:border-gray-300 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Esporta CSV
              </button>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-olive-50/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-olive-800">Programma di Oggi</h2>
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
              {todayAppointments.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-olive-100 to-olive-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-olive-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-600">Nessun appuntamento oggi</p>
                  <p className="text-sm mt-1 text-gray-400">Il tuo programma è libero</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {todayAppointments.map((apt) => (
                    <AppointmentRow
                      key={apt.id}
                      appointment={apt}
                      showOperator={user.role === "superadmin" && !selectedOperator}
                      onEdit={() => setEditingAppointment(apt)}
                      onStatusChange={(status) => handleUpdateAppointment(apt.id, { status })}
                      onDelete={() => handleDeleteAppointment(apt.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-olive-800">Prossimi Appuntamenti</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {upcomingAppointments.filter((a) => a.date !== todayStr).slice(0, 10).map((apt) => (
                    <AppointmentRow
                      key={apt.id}
                      appointment={apt}
                      showOperator={user.role === "superadmin" && !selectedOperator}
                      showDate
                      onEdit={() => setEditingAppointment(apt)}
                      onStatusChange={(status) => handleUpdateAppointment(apt.id, { status })}
                      onDelete={() => handleDeleteAppointment(apt.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== APPOINTMENTS TAB ===== */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Cerca</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nome, telefono, email..."
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-100 text-gray-700 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Stato</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-100 text-gray-700 bg-white transition-all"
                  >
                    <option value="">Tutti</option>
                    <option value="confirmed">Confermato</option>
                    <option value="pending">In attesa</option>
                    <option value="completed">Completato</option>
                    <option value="cancelled">Annullato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Da data</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-100 text-gray-700 transition-all"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("");
                      setDateFilter("");
                    }}
                    className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-150"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowNewAppointment(true)}
                    className="px-4 py-2.5 text-sm bg-gradient-to-r from-olive-600 to-olive-700 text-white rounded-xl hover:from-olive-700 hover:to-olive-800 flex items-center gap-1 shadow-sm shadow-olive-200/50 transition-all duration-150 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuovo
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-olive-800">
                  Tutti gli Appuntamenti ({filteredAppointments.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport("csv")}
                    className="text-xs text-olive-600 hover:text-olive-700 font-medium"
                  >
                    CSV
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleExport("json")}
                    className="text-xs text-olive-600 hover:text-olive-700 font-medium"
                  >
                    JSON
                  </button>
                </div>
              </div>
              {filteredAppointments.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <p className="font-medium">Nessun appuntamento trovato</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredAppointments.map((apt) => (
                    <AppointmentRow
                      key={apt.id}
                      appointment={apt}
                      showOperator={user.role === "superadmin" && !selectedOperator}
                      showDate
                      onEdit={() => setEditingAppointment(apt)}
                      onStatusChange={(status) => handleUpdateAppointment(apt.id, { status })}
                      onDelete={() => handleDeleteAppointment(apt.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== CALENDAR TAB ===== */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-olive-800">Calendario</h2>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 py-1">
                <button
                  onClick={() => setCalendarDate((p) => {
                    const d = new Date(p.year, p.month - 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })}
                  className="p-1.5 text-gray-500 hover:text-olive-700 hover:bg-olive-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-32 text-center">
                  {new Date(calendarDate.year, calendarDate.month).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                </span>
                <button
                  onClick={() => setCalendarDate((p) => {
                    const d = new Date(p.year, p.month + 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })}
                  className="p-1.5 text-gray-500 hover:text-olive-700 hover:bg-olive-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
            <MonthCalendar
              year={calendarDate.year}
              month={calendarDate.month}
              appointments={appointments}
              overrides={overrides}
              schedule={schedule}
              operatorKey={selectedOperator || user.employeeKey}
              onDayClick={(date) => { setDateFilter(date); setActiveTab("appointments"); }}
            />
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-olive-100 border border-olive-200 inline-block" />Giorno lavorativo</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" />Giorno libero</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-100 border border-green-200 inline-block" />Giorno extra</span>
              <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-gradient-to-br from-olive-500 to-olive-700 text-white flex items-center justify-center font-bold inline-flex text-[10px] shadow-sm">N</span>Appuntamenti</span>
            </div>
          </div>
        )}

        {/* ===== AVAILABILITY TAB ===== */}
        {activeTab === "availability" && (
          <div className="space-y-6">
            {/* Base Schedule Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-olive-800">Orario Settimanale Base</h3>
                  <p className="text-sm text-gray-500">Giorni e fasce orarie lavorative regolari</p>
                </div>
                {(schedule || user.role !== "superadmin" || selectedOperator) && (
                  <button
                    onClick={() => setShowScheduleEditor(true)}
                    className="bg-olive-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-olive-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifica Orario
                  </button>
                )}
              </div>
              {schedule ? (
                <div className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Orario per Giorno</p>
                  <div className="space-y-2">
                    {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map((dayLabel, i) => {
                      if (!schedule.daysOfWeek.includes(i)) return null;
                      const slots = schedule.daySlots?.[i] || schedule.timeSlots;
                      return (
                        <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="w-9 text-sm font-semibold text-olive-700 pt-0.5">{dayLabel}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {slots.map((slot, si) => (
                              <span key={si} className="text-sm text-gray-700 bg-olive-50 px-2.5 py-1 rounded-lg border border-olive-100">
                                {slot.start}–{slot.end}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-6 text-sm text-gray-600 pt-1">
                    <div><span className="font-medium text-gray-700">Durata sessione:</span> {schedule.sessionDuration} min</div>
                    <div><span className="font-medium text-gray-700">Pausa:</span> {schedule.breakBetweenSessions} min</div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium">Seleziona un operatore</p>
                  <p className="text-sm mt-1">Scegli un operatore dal menu in alto per visualizzare e modificare il suo orario</p>
                </div>
              )}
            </div>

            {/* Overrides / Exceptions Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-olive-800">Eccezioni al Calendario</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setOverrideForm((p) => ({ ...p, available: true, operatorKey: selectedOperator })); setShowOverrideEditor(true); }}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Giorno Extra
                </button>
                <button
                  onClick={() => { setOverrideForm((p) => ({ ...p, available: false, operatorKey: selectedOperator })); setShowOverrideEditor(true); }}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  Giorno Libero
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-olive-800">Modifiche Programmate</h3>
                <p className="text-sm text-gray-500">Eccezioni al calendario regolare</p>
              </div>
              {overrides.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <p className="font-medium">Nessuna modifica programmata</p>
                  <p className="text-sm mt-1">Il calendario segue gli orari regolari</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {overrides.sort((a, b) => a.date.localeCompare(b.date)).map((override, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${override.available ? "bg-green-100" : "bg-red-100"}`}>
                          <svg className={`w-5 h-5 ${override.available ? "text-green-600" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={override.available ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {override.available ? "Giorno Extra" : "Giorno Libero"} —{" "}
                            {new Date(override.date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {OPERATOR_NAMES[override.operatorKey] || override.operatorKey}
                            {override.reason && ` — ${override.reason}`}
                          </p>
                          {override.timeSlots && override.timeSlots.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Orari: {override.timeSlots.map(s => `${s.start}–${s.end}`).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveOverride(override.operatorKey, override.date)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== STATS TAB ===== */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-olive-800">Statistiche</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Appuntamenti oggi" value={stats.today} color="olive" />
              <StatCard label="Questo mese" value={stats.thisMonth} color="olive" />
              <StatCard label="Confermati" value={stats.confirmed} color="green" />
              <StatCard label="Completati" value={stats.completed} color="blue" />
              <StatCard label="In attesa" value={stats.pending} color="yellow" />
              <StatCard label="Annullati" value={stats.cancelled} color="red" />
            </div>

            {user.role === "superadmin" && (() => {
              const maxCount = Math.max(1, ...Object.keys(OPERATOR_NAMES).map((key) => appointments.filter((a) => a.operatorKey === key && a.date >= todayStr).length));
              return (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-olive-800">Appuntamenti per Operatore</h3>
                    <p className="text-xs text-gray-400 mt-1">Appuntamenti futuri per ogni membro del team</p>
                  </div>
                  <div className="p-5">
                    <div className="space-y-3">
                      {Object.entries(OPERATOR_NAMES).map(([key, name]) => {
                        const count = appointments.filter((a) => a.operatorKey === key && a.date >= todayStr).length;
                        const pct = (count / maxCount) * 100;
                        return (
                          <div key={key} className="group">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700 font-medium">{name}</span>
                              <span className="text-sm font-bold text-olive-600">{count}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-olive-400 to-olive-600 rounded-full transition-all duration-500 group-hover:from-olive-500 group-hover:to-olive-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ===== NEW APPOINTMENT MODAL ===== */}
      {showNewAppointment && (
        <Modal onClose={() => setShowNewAppointment(false)} title="Nuovo Appuntamento">
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            {user.role === "superadmin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
                <select
                  value={newApt.operatorKey}
                  onChange={(e) => setNewApt((p) => ({ ...p, operatorKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
                >
                  <option value="">Seleziona operatore</option>
                  {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Cliente *</label>
                <input
                  type="text"
                  required
                  value={newApt.clientName}
                  onChange={(e) => setNewApt((p) => ({ ...p, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={newApt.clientPhone}
                  onChange={(e) => setNewApt((p) => ({ ...p, clientPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={newApt.clientEmail}
                onChange={(e) => setNewApt((p) => ({ ...p, clientEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  required
                  value={newApt.date}
                  onChange={(e) => setNewApt((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ora *</label>
                <input
                  type="time"
                  required
                  value={newApt.time}
                  onChange={(e) => setNewApt((p) => ({ ...p, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durata (min)</label>
                <select
                  value={newApt.duration}
                  onChange={(e) => setNewApt((p) => ({ ...p, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                  <option value={120}>120 min</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                value={newApt.status}
                onChange={(e) => setNewApt((p) => ({ ...p, status: e.target.value as Appointment["status"] }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
              >
                <option value="confirmed">Confermato</option>
                <option value="pending">In attesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={newApt.notes}
                onChange={(e) => setNewApt((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 resize-none"
                placeholder="Note aggiuntive sull'appuntamento..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewAppointment(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700"
              >
                Crea Appuntamento
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===== OVERRIDE EDITOR MODAL ===== */}
      {showOverrideEditor && (
        <Modal
          onClose={() => setShowOverrideEditor(false)}
          title={overrideForm.available ? "Aggiungi Giorno Extra" : "Segna Giorno Libero"}
        >
          <form onSubmit={handleSaveOverride} className="space-y-4">
            {user.role === "superadmin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
                <select
                  value={overrideForm.operatorKey}
                  onChange={(e) => setOverrideForm((p) => ({ ...p, operatorKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
                >
                  <option value="">Seleziona operatore (default: se stesso)</option>
                  {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideForm((p) => ({ ...p, available: false }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    !overrideForm.available
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Giorno Libero
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideForm((p) => ({ ...p, available: true }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    overrideForm.available
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Giorno Extra
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date"
                required
                value={overrideForm.date}
                onChange={(e) => setOverrideForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input
                type="text"
                value={overrideForm.reason}
                onChange={(e) => setOverrideForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Es: Ferie, Malattia, Formazione..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
              />
            </div>
            {overrideForm.available && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Orari Personalizzati</label>
                  <button
                    type="button"
                    onClick={() => setOverrideForm((p) => ({ ...p, customSlots: !p.customSlots }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      overrideForm.customSlots ? "bg-olive-600" : "bg-gray-200"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      overrideForm.customSlots ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {overrideForm.customSlots && (
                  <div className="space-y-2">
                    {overrideForm.timeSlots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => setOverrideForm((p) => ({ ...p, timeSlots: p.timeSlots.map((s, j) => j === i ? { ...s, start: e.target.value } : s) }))}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
                        />
                        <span className="text-gray-400 text-sm">—</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => setOverrideForm((p) => ({ ...p, timeSlots: p.timeSlots.map((s, j) => j === i ? { ...s, end: e.target.value } : s) }))}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
                        />
                        {overrideForm.timeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setOverrideForm((p) => ({ ...p, timeSlots: p.timeSlots.filter((_, j) => j !== i) }))}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setOverrideForm((p) => ({ ...p, timeSlots: [...p.timeSlots, { start: "", end: "" }] }))}
                      className="text-xs text-olive-600 hover:text-olive-700 font-medium"
                    >
                      + Aggiungi fascia
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideEditor(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium ${
                  overrideForm.available ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {overrideForm.available ? "Aggiungi Giorno Extra" : "Segna Come Libero"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===== SCHEDULE EDITOR MODAL ===== */}
      {showScheduleEditor && (
        <Modal onClose={() => setShowScheduleEditor(false)} title="Modifica Orario Settimanale">
          <ScheduleEditorForm
            schedule={schedule}
            defaultOperatorKey={selectedOperator || user.employeeKey}
            isSuperAdmin={user.role === "superadmin"}
            onSave={handleSaveSchedule}
            onCancel={() => setShowScheduleEditor(false)}
          />
        </Modal>
      )}

      {/* ===== EDIT APPOINTMENT MODAL ===== */}
      {editingAppointment && (
        <Modal onClose={() => setEditingAppointment(null)} title="Modifica Appuntamento">
          <EditAppointmentForm
            appointment={editingAppointment}
            isSuperAdmin={user.role === "superadmin"}
            onSave={(updates) => handleUpdateAppointment(editingAppointment.id, updates)}
            onCancel={() => setEditingAppointment(null)}
          />
        </Modal>
      )}
    </div>
  );
}

// ===== Sub-components =====

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-olive-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-150">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function AppointmentRow({
  appointment,
  showOperator,
  showDate,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  appointment: Appointment;
  showOperator?: boolean;
  showDate?: boolean;
  onEdit: () => void;
  onStatusChange: (status: Appointment["status"]) => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const statusCfg = STATUS_CONFIG[appointment.status];
  const initials = appointment.clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statusColors: Record<string, string> = {
    confirmed: "from-green-400 to-green-500",
    pending: "from-amber-400 to-amber-500",
    cancelled: "from-red-400 to-red-500",
    completed: "from-blue-400 to-blue-500",
  };

  return (
    <div className="p-4 hover:bg-olive-50/40 transition-all duration-200 group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Status indicator + time */}
          <div className="text-center flex-shrink-0 w-14 relative">
            <div className={`absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${statusColors[appointment.status]}`} />
            <p className="text-lg font-bold text-olive-700">{appointment.time}</p>
            {showDate && (
              <p className="text-xs text-gray-400">{new Date(appointment.date + "T12:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}</p>
            )}
          </div>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-olive-700">{initials}</span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-800 truncate">{appointment.clientName}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              {showOperator && (
                <span className="font-medium text-olive-600">{OPERATOR_NAMES[appointment.operatorKey] || appointment.operatorKey}</span>
              )}
              {appointment.clientPhone && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {appointment.clientPhone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {appointment.duration} min
              </span>
            </div>
            {appointment.notes && (
              <p className="text-xs text-gray-400 mt-1 truncate italic">{appointment.notes}</p>
            )}
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {showActions && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 w-48 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <button onClick={() => { onEdit(); setShowActions(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-olive-50 flex items-center gap-2.5 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Modifica
                </button>
                {appointment.status !== "completed" && (
                  <button onClick={() => { onStatusChange("completed"); setShowActions(false); }} className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2.5 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Segna completato
                  </button>
                )}
                {appointment.status !== "cancelled" && (
                  <button onClick={() => { onStatusChange("cancelled"); setShowActions(false); }} className="w-full px-4 py-2.5 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    Annulla
                  </button>
                )}
                <div className="my-1.5 border-t border-gray-100" />
                <button onClick={() => { onDelete(); setShowActions(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Elimina
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EditAppointmentForm({
  appointment,
  isSuperAdmin,
  onSave,
  onCancel,
}: {
  appointment: Appointment;
  isSuperAdmin: boolean;
  onSave: (updates: Partial<Appointment>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    clientName: appointment.clientName,
    clientPhone: appointment.clientPhone,
    clientEmail: appointment.clientEmail || "",
    date: appointment.date,
    time: appointment.time,
    duration: appointment.duration,
    status: appointment.status,
    notes: appointment.notes,
    operatorKey: appointment.operatorKey,
  });

  return (
    <div className="space-y-4">
      {isSuperAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
          <select
            value={form.operatorKey}
            onChange={(e) => setForm((p) => ({ ...p, operatorKey: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
          >
            {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Cliente</label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
          <input
            type="tel"
            value={form.clientPhone}
            onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={form.clientEmail}
          onChange={(e) => setForm((p) => ({ ...p, clientEmail: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durata</label>
          <select
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value={120}>120 min</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
        <select
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Appointment["status"] }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
        >
          <option value="confirmed">Confermato</option>
          <option value="pending">In attesa</option>
          <option value="completed">Completato</option>
          <option value="cancelled">Annullato</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
          Annulla
        </button>
        <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700">
          Salva Modifiche
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon?: string }) {
  const colorMap: Record<string, { text: string; bg: string; iconBg: string }> = {
    olive: { text: "text-olive-600", bg: "bg-olive-50", iconBg: "bg-olive-100" },
    green: { text: "text-green-600", bg: "bg-green-50", iconBg: "bg-green-100" },
    blue: { text: "text-blue-600", bg: "bg-blue-50", iconBg: "bg-blue-100" },
    yellow: { text: "text-amber-600", bg: "bg-amber-50", iconBg: "bg-amber-100" },
    red: { text: "text-red-600", bg: "bg-red-50", iconBg: "bg-red-100" },
  };
  const c = colorMap[color] || colorMap.olive;
  const icons: Record<string, string> = {
    olive: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    green: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    blue: "M5 13l4 4L19 7",
    yellow: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    red: "M6 18L18 6M6 6l12 12",
  };
  return (
    <div className={`${c.bg} rounded-2xl p-6 border border-gray-100/50 shadow-sm hover:shadow-md transition-all duration-200 group`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 ${c.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <svg className={`w-4.5 h-4.5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon || icons[color] || icons.olive} />
          </svg>
        </div>
      </div>
      <p className={`text-4xl font-bold ${c.text}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function MonthCalendar({
  year,
  month,
  appointments,
  overrides,
  schedule,
  operatorKey,
  onDayClick,
}: {
  year: number;
  month: number;
  appointments: Appointment[];
  overrides: AvailabilityOverride[];
  schedule: OperatorSchedule | null;
  operatorKey: string;
  onDayClick: (date: string) => void;
}) {
  const DAY_LABELS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const firstDay = new Date(year, month, 1);
  const lastDayNum = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDayNum; d++) cells.push(d);

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-olive-50/30">
        {DAY_LABELS.map((d) => (
          <div key={d} className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="min-h-20 border-b border-r border-gray-50 bg-gray-50/30" />;
          }

          const dateStr = getDateStr(day);
          const dayOfWeek = new Date(year, month, day).getDay();
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          const isWorkingDay = schedule ? schedule.daysOfWeek.includes(dayOfWeek) : false;
          const override = overrides.find(
            (o) => o.date === dateStr && (!operatorKey || o.operatorKey === operatorKey)
          );
          const aptCount = appointments.filter(
            (a) =>
              a.date === dateStr &&
              a.status !== "cancelled" &&
              (!operatorKey || a.operatorKey === operatorKey)
          ).length;

          let bgClass = "";
          if (override) {
            bgClass = override.available ? "bg-green-50/70" : "bg-red-50/70";
          } else if (isWorkingDay) {
            bgClass = isPast ? "bg-olive-50/30" : "bg-olive-50/60";
          } else {
            bgClass = "";
          }

          return (
            <div
              key={idx}
              onClick={() => aptCount > 0 && onDayClick(dateStr)}
              className={`min-h-20 p-2 border-b border-r border-gray-50 transition-all duration-150 ${
                bgClass
              } ${isToday ? "ring-2 ring-olive-500 ring-inset rounded-sm" : ""} ${
                aptCount > 0 ? "cursor-pointer hover:brightness-[0.97] hover:shadow-inner" : ""
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? "w-7 h-7 bg-olive-600 text-white rounded-full flex items-center justify-center font-bold"
                    : isPast
                    ? "text-gray-400"
                    : "text-gray-700"
                }`}
              >
                {day}
              </div>
              {override && (
                <div
                  className={`text-xs font-semibold ${
                    override.available ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {override.available ? "Extra" : override.reason || "Libero"}
                </div>
              )}
              {aptCount > 0 && (
                <div className="mt-1 inline-flex w-5 h-5 bg-gradient-to-br from-olive-500 to-olive-700 text-white text-[10px] rounded-full items-center justify-center font-bold shadow-sm">
                  {aptCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleEditorForm({
  schedule,
  defaultOperatorKey,
  isSuperAdmin,
  onSave,
  onCancel,
}: {
  schedule: OperatorSchedule | null;
  defaultOperatorKey: string;
  isSuperAdmin: boolean;
  onSave: (
    formData: {
      daysOfWeek: number[];
      timeSlots: { start: string; end: string }[];
      daySlots?: { [day: number]: { start: string; end: string }[] };
      sessionDuration: number;
      breakBetweenSessions: number;
    },
    targetKey?: string
  ) => void;
  onCancel: () => void;
}) {
  type DayConfig = { enabled: boolean; slots: { start: string; end: string }[] };
  const DAY_LABELS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

  const initDayConfigs = (): DayConfig[] => {
    const defaultSlots = schedule?.timeSlots ?? [{ start: "09:00", end: "18:00" }];
    return Array.from({ length: 7 }, (_, i) => ({
      enabled: schedule ? schedule.daysOfWeek.includes(i) : [1, 2, 3, 4, 5].includes(i),
      slots: schedule?.daySlots?.[i]
        ? schedule.daySlots[i].map((s) => ({ ...s }))
        : defaultSlots.map((s) => ({ ...s })),
    }));
  };

  const [operatorKey, setOperatorKey] = useState(schedule?.operatorKey || defaultOperatorKey);
  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>(initDayConfigs);
  const [sessionDuration, setSessionDuration] = useState(schedule?.sessionDuration ?? 60);
  const [breakBetweenSessions, setBreakBetweenSessions] = useState(schedule?.breakBetweenSessions ?? 15);

  const toggleDay = (i: number) =>
    setDayConfigs((prev) => prev.map((d, idx) => (idx === i ? { ...d, enabled: !d.enabled } : d)));

  const updateSlot = (dayIdx: number, slotIdx: number, field: "start" | "end", val: string) =>
    setDayConfigs((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: d.slots.map((s, j) => (j === slotIdx ? { ...s, [field]: val } : s)) }
          : d
      )
    );

  const addSlot = (dayIdx: number) =>
    setDayConfigs((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, slots: [...d.slots, { start: "", end: "" }] } : d))
    );

  const removeSlot = (dayIdx: number, slotIdx: number) =>
    setDayConfigs((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, slots: d.slots.filter((_, j) => j !== slotIdx) } : d
      )
    );

  const handleSave = () => {
    const daysOfWeek = dayConfigs.map((d, i) => (d.enabled ? i : -1)).filter((i) => i !== -1);
    const daySlots: { [day: number]: { start: string; end: string }[] } = {};
    dayConfigs.forEach((d, i) => { if (d.enabled) daySlots[i] = d.slots; });
    const firstEnabled = dayConfigs.find((d) => d.enabled);
    const timeSlots = firstEnabled?.slots ?? [{ start: "09:00", end: "18:00" }];
    onSave({ daysOfWeek, timeSlots, daySlots, sessionDuration, breakBetweenSessions }, operatorKey || undefined);
  };

  return (
    <div className="space-y-5">
      {isSuperAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
          <select
            value={operatorKey}
            onChange={(e) => {
              setOperatorKey(e.target.value);
              setDayConfigs(Array.from({ length: 7 }, (_, i) => ({
                enabled: [1, 2, 3, 4, 5].includes(i),
                slots: [{ start: "09:00", end: "18:00" }],
              })));
              setSessionDuration(60);
              setBreakBetweenSessions(15);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value="">Seleziona operatore</option>
            {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Orario per Giorno</label>
        <div className="space-y-2">
          {dayConfigs.map((config, dayIdx) => (
            <div
              key={dayIdx}
              className={`border rounded-xl overflow-hidden ${
                config.enabled ? "border-olive-200" : "border-gray-100"
              }`}
            >
              {/* Day header with toggle */}
              <div
                className={`flex items-center justify-between px-3 py-2.5 ${
                  config.enabled ? "bg-olive-50" : "bg-gray-50"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    config.enabled ? "text-olive-800" : "text-gray-400"
                  }`}
                >
                  {DAY_LABELS[dayIdx]}
                </span>
                <button
                  type="button"
                  onClick={() => toggleDay(dayIdx)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    config.enabled ? "bg-olive-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      config.enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Time slots */}
              {config.enabled && (
                <div className="p-3 space-y-2 bg-white">
                  {config.slots.map((slot, slotIdx) => (
                    <div key={slotIdx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateSlot(dayIdx, slotIdx, "start", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700"
                      />
                      <span className="text-gray-400 text-sm">—</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateSlot(dayIdx, slotIdx, "end", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700"
                      />
                      {config.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(dayIdx, slotIdx)}
                          className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(dayIdx)}
                    className="text-xs text-olive-600 hover:text-olive-700 font-medium"
                  >
                    + Aggiungi fascia
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durata Sessione</label>
          <select
            value={sessionDuration}
            onChange={(e) => setSessionDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value={120}>120 min</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pausa tra Sessioni</label>
          <select
            value={breakBetweenSessions}
            onChange={(e) => setBreakBetweenSessions(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value={0}>Nessuna</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700"
        >
          Salva Orario
        </button>
      </div>
    </div>
  );
}
