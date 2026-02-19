"use client";

import { useEffect, useState, useCallback } from "react";

interface Booking {
  id: number;
  operator_key: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  booking_date: string;
  time_slot: string;
  service: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const OPERATOR_NAMES: Record<string, string> = {
  headmaster: "Francesca Mayer",
  corradoZamboni: "Corrado Zamboni",
  deniseDallaPasqua: "Denise Dalla Pasqua",
  giancarloPavanello: "Giancarlo Pavanello",
  massimoGnesotto: "Massimo Gnesotto",
  michelaDolce: "Michela Dolce",
  martinaPasut: "Martina Pasut",
  monicaBortoluzzi: "Monica Bortoluzzi",
  paoloAvella: "Paolo Avella",
  sabrinaPozzobon: "Sabrina Pozzobon",
  tamaraZanchetta: "Tamara Zanchetta",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
  "no-show": "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOperator, setFilterOperator] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [dbInitialized, setDbInitialized] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [view, setView] = useState<"table" | "calendar">("table");

  // Initialize DB on first auth
  const initDb = useCallback(async (sec: string) => {
    try {
      await fetch("/api/db/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: sec }),
      });
      setDbInitialized(true);
    } catch {
      console.error("DB init failed");
    }
  }, []);

  const handleAuth = async () => {
    // Try a test request to verify the secret
    try {
      const res = await fetch("/api/db/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setAuthError("");
        setDbInitialized(true);
        // Store in sessionStorage for convenience
        sessionStorage.setItem("admin_secret", secret);
      } else {
        setAuthError("Password errata / Wrong password");
      }
    } catch {
      setAuthError("Errore di connessione / Connection error");
    }
  };

  // Restore session
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_secret");
    if (stored) {
      setSecret(stored);
      setIsAuthenticated(true);
      initDb(stored);
    }
  }, [initDb]);

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    const params = new URLSearchParams();
    if (filterOperator) params.set("operator", filterOperator);
    if (filterStatus) params.set("status", filterStatus);
    if (filterFrom) params.set("from", filterFrom);
    if (filterTo) params.set("to", filterTo);

    try {
      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filterOperator, filterStatus, filterFrom, filterTo]);

  useEffect(() => {
    if (isAuthenticated && dbInitialized) {
      fetchBookings();
    }
  }, [isAuthenticated, dbInitialized, fetchBookings]);

  const updateBookingStatus = async (id: number, newStatus: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, status: newStatus }),
      });
      fetchBookings();
    } catch {
      console.error("Failed to update booking");
    }
  };

  const saveNote = async (id: number) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, notes: noteText }),
      });
      setEditingNote(null);
      fetchBookings();
    } catch {
      console.error("Failed to save note");
    }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questa prenotazione?")) return;
    try {
      await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      fetchBookings();
    } catch {
      console.error("Failed to delete booking");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSecret("");
    setBookings([]);
    sessionStorage.removeItem("admin_secret");
  };

  // Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.booking_date === todayStr && b.status !== "cancelled");
  const upcomingBookings = bookings.filter((b) => b.booking_date >= todayStr && b.status === "confirmed");
  const totalConfirmed = bookings.filter((b) => b.status === "confirmed").length;
  const totalCancelled = bookings.filter((b) => b.status === "cancelled").length;

  // Group bookings by date for calendar view
  const bookingsByDate = bookings.reduce(
    (acc, b) => {
      if (!acc[b.booking_date]) acc[b.booking_date] = [];
      acc[b.booking_date].push(b);
      return acc;
    },
    {} as Record<string, Booking[]>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Inserisci la password per accedere</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-olive-500 focus:outline-none transition-colors text-gray-800"
            />
            {authError && (
              <p className="text-red-500 text-sm text-center">{authError}</p>
            )}
            <button
              onClick={handleAuth}
              className="w-full py-3 bg-olive-600 text-white rounded-xl font-semibold hover:bg-olive-700 transition-colors"
            >
              Accedi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Relevi Admin</h1>
              <p className="text-xs text-gray-500">Gestione Prenotazioni</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-olive-100 text-olive-700 rounded-lg hover:bg-olive-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Aggiorna
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Esci
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{todayBookings.length}</p>
                <p className="text-xs text-gray-500">Oggi</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalConfirmed}</p>
                <p className="text-xs text-gray-500">Confermate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{upcomingBookings.length}</p>
                <p className="text-xs text-gray-500">In arrivo</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalCancelled}</p>
                <p className="text-xs text-gray-500">Cancellate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Professionista</label>
              <select
                value={filterOperator}
                onChange={(e) => setFilterOperator(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-olive-500 focus:outline-none text-gray-800"
              >
                <option value="">Tutti</option>
                {Object.entries(OPERATOR_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Stato</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-olive-500 focus:outline-none text-gray-800"
              >
                <option value="">Tutti</option>
                <option value="confirmed">Confermata</option>
                <option value="completed">Completata</option>
                <option value="cancelled">Cancellata</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Dal</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-olive-500 focus:outline-none text-gray-800"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Al</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-olive-500 focus:outline-none text-gray-800"
              />
            </div>
            <button
              onClick={() => {
                setFilterOperator("");
                setFilterStatus("");
                setFilterFrom("");
                setFilterTo("");
              }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView("table")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "table" ? "bg-olive-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Tabella
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "calendar" ? "bg-olive-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Per Data
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-olive-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nessuna prenotazione</h3>
            <p className="text-gray-400">Le prenotazioni appariranno qui quando verranno create.</p>
          </div>
        ) : view === "table" ? (
          /* Table View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ora</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Professionista</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contatto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stato</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => {
                    const isPast = booking.booking_date < todayStr;
                    return (
                      <tr key={booking.id} className={`hover:bg-gray-50 transition-colors ${isPast ? "opacity-60" : ""}`}>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium whitespace-nowrap">
                          {new Date(booking.booking_date + "T00:00:00").toLocaleDateString("it-IT", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-mono">{booking.time_slot}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{OPERATOR_NAMES[booking.operator_key] || booking.operator_key}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{booking.client_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-gray-700">{booking.client_phone}</div>
                          {booking.client_email && (
                            <div className="text-gray-400 text-xs">{booking.client_email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800"} cursor-pointer`}
                          >
                            <option value="confirmed">Confermata</option>
                            <option value="completed">Completata</option>
                            <option value="cancelled">Cancellata</option>
                            <option value="no-show">No Show</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm max-w-[200px]">
                          {editingNote === booking.id ? (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveNote(booking.id)}
                                className="w-full px-2 py-1 border rounded text-xs text-gray-800"
                                autoFocus
                              />
                              <button onClick={() => saveNote(booking.id)} className="text-green-600 hover:text-green-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button onClick={() => setEditingNote(null)} className="text-red-500 hover:text-red-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingNote(booking.id);
                                setNoteText(booking.notes || "");
                              }}
                              className="text-gray-400 hover:text-gray-600 text-xs truncate block max-w-full"
                            >
                              {booking.notes || "Aggiungi nota..."}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Elimina"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
              {bookings.length} prenotazion{bookings.length === 1 ? "e" : "i"} trovate
            </div>
          </div>
        ) : (
          /* Calendar/Date View */
          <div className="space-y-6">
            {Object.entries(bookingsByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, dateBookings]) => {
                const dateObj = new Date(date + "T00:00:00");
                const isToday = date === todayStr;
                return (
                  <div key={date} className={`bg-white rounded-xl shadow-sm border ${isToday ? "border-olive-400 ring-2 ring-olive-200" : "border-gray-100"} overflow-hidden`}>
                    <div className={`px-5 py-3 border-b ${isToday ? "bg-olive-50 border-olive-200" : "bg-gray-50 border-gray-200"} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-bold ${isToday ? "text-olive-800" : "text-gray-800"}`}>
                          {dateObj.toLocaleDateString("it-IT", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-olive-600 text-white rounded-full text-xs font-medium">OGGI</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {dateBookings.filter((b) => b.status !== "cancelled").length} sessioni
                      </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {dateBookings
                        .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
                        .map((booking) => (
                          <div key={booking.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50">
                            <div className="text-lg font-mono font-bold text-olive-600 w-14">{booking.time_slot}</div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{booking.client_name}</div>
                              <div className="text-xs text-gray-500">
                                {OPERATOR_NAMES[booking.operator_key] || booking.operator_key} &middot; {booking.client_phone}
                              </div>
                            </div>
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                              className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800"} cursor-pointer`}
                            >
                              <option value="confirmed">Confermata</option>
                              <option value="completed">Completata</option>
                              <option value="cancelled">Cancellata</option>
                              <option value="no-show">No Show</option>
                            </select>
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
