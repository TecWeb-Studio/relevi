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
  const [showDayOff, setShowDayOff] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Day off form state
  const [dayOffForm, setDayOffForm] = useState({
    operatorKey: "",
    date: "",
    reason: "",
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

  // Fetch overrides
  const fetchOverrides = useCallback(async () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (selectedOperator) params.set("operatorKey", selectedOperator);

    const res = await fetch(`/api/admin/availability?${params}`);
    if (res.ok) {
      const data = await res.json();
      setOverrides(data.overrides);
    }
  }, [user, selectedOperator]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchOverrides();
    }
  }, [user, fetchAppointments, fetchOverrides]);

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

  const handleAddDayOff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operatorKey: dayOffForm.operatorKey || undefined,
        date: dayOffForm.date,
        available: false,
        reason: dayOffForm.reason,
      }),
    });
    if (res.ok) {
      setShowDayOff(false);
      setDayOffForm({ operatorKey: "", date: "", reason: "" });
      fetchOverrides();
    }
  };

  const handleRemoveOverride = async (operatorKey: string, date: string) => {
    const params = new URLSearchParams({ operatorKey, date });
    const res = await fetch(`/api/admin/availability?${params}`, { method: "DELETE" });
    if (res.ok) {
      fetchOverrides();
    }
  };

  const handleExport = (format: "csv" | "json") => {
    const params = new URLSearchParams({ format });
    if (selectedOperator) params.set("operatorKey", selectedOperator);
    window.open(`/api/admin/export?${params}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-olive-200 border-t-olive-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "today", label: "Oggi", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "appointments", label: "Appuntamenti", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key: "availability", label: "Disponibilità", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "stats", label: "Statistiche", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center">
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
                  className="text-sm border border-olive-200 rounded-lg px-3 py-2 focus:outline-none focus:border-olive-500 text-gray-700 bg-white"
                >
                  <option value="">Tutti gli operatori</option>
                  {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-olive-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-olive-50 hover:text-olive-700"
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
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-olive-600">{stats.today}</p>
                <p className="text-sm text-gray-500">Oggi</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-olive-600">{stats.thisMonth}</p>
                <p className="text-sm text-gray-500">Questo mese</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                <p className="text-sm text-gray-500">Confermati</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
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
                className="bg-olive-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-olive-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuovo Appuntamento
              </button>
              <button
                onClick={() => setShowDayOff(true)}
                className="bg-white text-olive-700 px-5 py-2.5 rounded-xl font-medium hover:bg-olive-50 transition-all flex items-center gap-2 border border-olive-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Segna Giorno Libero
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="bg-white text-gray-600 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2 border border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Esporta CSV
              </button>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-olive-800">Programma di Oggi</h2>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              {todayAppointments.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium">Nessun appuntamento oggi</p>
                  <p className="text-sm mt-1">Il tuo programma è libero</p>
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
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cerca</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nome, telefono, email..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-olive-500 text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stato</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-olive-500 text-gray-700 bg-white"
                  >
                    <option value="">Tutti</option>
                    <option value="confirmed">Confermato</option>
                    <option value="pending">In attesa</option>
                    <option value="completed">Completato</option>
                    <option value="cancelled">Annullato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Da data</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-olive-500 text-gray-700"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("");
                      setDateFilter("");
                    }}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowNewAppointment(true)}
                    className="px-4 py-2 text-sm bg-olive-600 text-white rounded-lg hover:bg-olive-700 flex items-center gap-1"
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

        {/* ===== AVAILABILITY TAB ===== */}
        {activeTab === "availability" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-olive-800">Gestione Disponibilità</h2>
              <button
                onClick={() => setShowDayOff(true)}
                className="bg-olive-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-olive-700 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Aggiungi Modifica
              </button>
            </div>

            {/* Overrides list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-olive-800">Giorni Liberi / Modifiche</h3>
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
                            {new Date(override.date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {OPERATOR_NAMES[override.operatorKey] || override.operatorKey}
                            {override.reason && ` — ${override.reason}`}
                          </p>
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

            {user.role === "superadmin" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-olive-800">Appuntamenti per Operatore</h3>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    {Object.entries(OPERATOR_NAMES).map(([key, name]) => {
                      const count = appointments.filter((a) => a.operatorKey === key && a.date >= todayStr).length;
                      return (
                        <div key={key} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-700">{name}</span>
                          <span className="text-sm font-bold text-olive-600">{count} prossimi</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
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

      {/* ===== DAY OFF MODAL ===== */}
      {showDayOff && (
        <Modal onClose={() => setShowDayOff(false)} title="Segna Giorno Libero">
          <form onSubmit={handleAddDayOff} className="space-y-4">
            {user.role === "superadmin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
                <select
                  value={dayOffForm.operatorKey}
                  onChange={(e) => setDayOffForm((p) => ({ ...p, operatorKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
                >
                  <option value="">Se stesso</option>
                  {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date"
                required
                value={dayOffForm.date}
                onChange={(e) => setDayOffForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input
                type="text"
                value={dayOffForm.reason}
                onChange={(e) => setDayOffForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Es: Ferie, Malattia, Formazione..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDayOff(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Segna Come Libero
              </button>
            </div>
          </form>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-olive-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
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

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="text-center flex-shrink-0 w-14">
            <p className="text-lg font-bold text-olive-600">{appointment.time}</p>
            {showDate && (
              <p className="text-xs text-gray-400">{new Date(appointment.date + "T12:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}</p>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800 truncate">{appointment.clientName}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              {showOperator && (
                <span className="font-medium text-olive-600">{OPERATOR_NAMES[appointment.operatorKey] || appointment.operatorKey}</span>
              )}
              {appointment.clientPhone && <span>{appointment.clientPhone}</span>}
              <span>{appointment.duration} min</span>
            </div>
            {appointment.notes && (
              <p className="text-xs text-gray-400 mt-1 truncate">{appointment.notes}</p>
            )}
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {showActions && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-48 z-50">
                <button onClick={() => { onEdit(); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-olive-50 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Modifica
                </button>
                {appointment.status !== "completed" && (
                  <button onClick={() => { onStatusChange("completed"); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Segna completato
                  </button>
                )}
                {appointment.status !== "cancelled" && (
                  <button onClick={() => { onStatusChange("cancelled"); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    Annulla
                  </button>
                )}
                <hr className="my-1" />
                <button onClick={() => { onDelete(); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    olive: "text-olive-600",
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
      <p className={`text-4xl font-bold ${colorMap[color] || "text-gray-800"}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
