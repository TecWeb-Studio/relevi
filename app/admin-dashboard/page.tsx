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

interface TimeSlotRange {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlotRange[];
}

type WeekSchedule = Record<string, DaySchedule>;

interface AvailabilityData {
  key: string;
  schedule: WeekSchedule;
  daysOfWeek: number[];
  sessionDuration: number;
  breakBetweenSessions: number;
  source?: string;
}

interface VacationPeriod {
  id?: number;
  operator_key: string;
  start_date: string;
  end_date: string;
  note: string;
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

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const DAY_FULL = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

// Build a default empty schedule for all 7 days
function emptySchedule(): WeekSchedule {
  const s: WeekSchedule = {};
  for (let d = 0; d <= 6; d++) {
    s[d] = { enabled: false, timeSlots: [{ start: "09:00", end: "13:00" }] };
  }
  return s;
}

// ─── Availability Editor Sub-component ──────────────────────────
function AvailabilityEditor({ secret }: { secret: string }) {
  const [allAvailability, setAllAvailability] = useState<AvailabilityData[]>([]);
  const [allVacations, setAllVacations] = useState<Record<string, VacationPeriod[]>>({});
  const [selectedOp, setSelectedOp] = useState<string>("");
  const [editSchedule, setEditSchedule] = useState<WeekSchedule>(emptySchedule());
  const [editSessionDuration, setEditSessionDuration] = useState(60);
  const [editBreakBetween, setEditBreakBetween] = useState(15);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Vacation form state
  const [vacStart, setVacStart] = useState("");
  const [vacEnd, setVacEnd] = useState("");
  const [vacNote, setVacNote] = useState("");
  const [vacSaving, setVacSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/availability?vacations=1");
      const data = await res.json();
      setAllAvailability(data.availability || []);
      setAllVacations(data.vacations || {});
    } catch {
      console.error("Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // When an operator is selected, populate the edit form
  useEffect(() => {
    if (!selectedOp) { return; }
    const existing = allAvailability.find((a) => a.key === selectedOp);
    if (existing && existing.schedule) {
      // Deep copy the schedule
      const copy: WeekSchedule = {};
      for (let d = 0; d <= 6; d++) {
        const day = existing.schedule[d];
        if (day) {
          copy[d] = { enabled: day.enabled, timeSlots: day.timeSlots.map((s) => ({ ...s })) };
        } else {
          copy[d] = { enabled: false, timeSlots: [{ start: "09:00", end: "13:00" }] };
        }
      }
      setEditSchedule(copy);
      setEditSessionDuration(existing.sessionDuration);
      setEditBreakBetween(existing.breakBetweenSessions);
    } else {
      setEditSchedule(emptySchedule());
      setEditSessionDuration(60);
      setEditBreakBetween(15);
    }
    setSaveMsg(null);
    setExpandedDay(null);
  }, [selectedOp, allAvailability]);

  const toggleDay = (day: number) => {
    setEditSchedule((prev) => {
      const copy = { ...prev };
      copy[day] = { ...copy[day], enabled: !copy[day].enabled };
      return copy;
    });
  };

  const updateDaySlot = (day: number, idx: number, field: "start" | "end", value: string) => {
    setEditSchedule((prev) => {
      const copy = { ...prev };
      const slots = [...copy[day].timeSlots];
      slots[idx] = { ...slots[idx], [field]: value };
      copy[day] = { ...copy[day], timeSlots: slots };
      return copy;
    });
  };

  const addDaySlot = (day: number) => {
    setEditSchedule((prev) => {
      const copy = { ...prev };
      copy[day] = { ...copy[day], timeSlots: [...copy[day].timeSlots, { start: "14:00", end: "18:00" }] };
      return copy;
    });
  };

  const removeDaySlot = (day: number, idx: number) => {
    setEditSchedule((prev) => {
      if (prev[day].timeSlots.length <= 1) return prev;
      const copy = { ...prev };
      copy[day] = { ...copy[day], timeSlots: copy[day].timeSlots.filter((_, i) => i !== idx) };
      return copy;
    });
  };

  // Copy schedule from one day to others
  const copyDayToAll = (sourceDay: number) => {
    setEditSchedule((prev) => {
      const source = prev[sourceDay];
      const copy = { ...prev };
      for (let d = 0; d <= 6; d++) {
        if (d !== sourceDay && copy[d].enabled) {
          copy[d] = { enabled: true, timeSlots: source.timeSlots.map((s) => ({ ...s })) };
        }
      }
      return copy;
    });
  };

  const handleSave = async () => {
    // Validate enabled days have valid time slots
    for (let d = 0; d <= 6; d++) {
      const day = editSchedule[d];
      if (!day.enabled) continue;
      for (const slot of day.timeSlots) {
        if (!slot.start || !slot.end) {
          setSaveMsg({ type: "err", text: `${DAY_FULL[d]}: compila tutti gli orari` });
          return;
        }
        if (slot.start >= slot.end) {
          setSaveMsg({ type: "err", text: `${DAY_FULL[d]}: ${slot.start} deve essere prima di ${slot.end}` });
          return;
        }
      }
    }

    const hasAnyDay = Object.values(editSchedule).some((d) => d.enabled);
    if (!hasAnyDay) {
      setSaveMsg({ type: "err", text: "Seleziona almeno un giorno" });
      return;
    }

    if (editSessionDuration < 10 || editSessionDuration > 240) {
      setSaveMsg({ type: "err", text: "Durata sessione deve essere tra 10 e 240 minuti" });
      return;
    }

    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          operator_key: selectedOp,
          schedule: editSchedule,
          session_duration: editSessionDuration,
          break_between: editBreakBetween,
        }),
      });
      if (res.ok) {
        setSaveMsg({ type: "ok", text: "Disponibilità salvata!" });
        fetchAll();
      } else {
        const d = await res.json();
        setSaveMsg({ type: "err", text: d.error || "Errore nel salvataggio" });
      }
    } catch {
      setSaveMsg({ type: "err", text: "Errore di connessione" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedOp || !confirm("Ripristinare gli orari predefiniti per questo operatore?")) return;
    try {
      await fetch("/api/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, operator_key: selectedOp }),
      });
      setSaveMsg({ type: "ok", text: "Ripristinato ai valori predefiniti" });
      fetchAll();
    } catch {
      setSaveMsg({ type: "err", text: "Errore nel ripristino" });
    }
  };

  // Add vacation
  const addVacation = async () => {
    if (!selectedOp || !vacStart || !vacEnd) return;
    if (vacStart > vacEnd) {
      setSaveMsg({ type: "err", text: "La data di inizio ferie deve essere prima della data di fine" });
      return;
    }
    setVacSaving(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          action: "add_vacation",
          operator_key: selectedOp,
          start_date: vacStart,
          end_date: vacEnd,
          note: vacNote,
        }),
      });
      if (res.ok) {
        setVacStart(""); setVacEnd(""); setVacNote("");
        fetchAll();
      }
    } catch {
      setSaveMsg({ type: "err", text: "Errore aggiunta ferie" });
    } finally {
      setVacSaving(false);
    }
  };

  // Delete vacation
  const deleteVacation = async (vacId: number) => {
    if (!confirm("Eliminare questo periodo di ferie?")) return;
    try {
      await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, action: "delete_vacation", vacation_id: vacId }),
      });
      fetchAll();
    } catch {
      setSaveMsg({ type: "err", text: "Errore eliminazione ferie" });
    }
  };

  // Compute preview slots for a given day
  const computePreview = (day: number): string[] => {
    const daySchedule = editSchedule[day];
    if (!daySchedule || !daySchedule.enabled) return [];
    const slots: string[] = [];
    for (const range of daySchedule.timeSlots) {
      const [sH, sM] = range.start.split(":").map(Number);
      const [eH, eM] = range.end.split(":").map(Number);
      let cur = sH * 60 + sM;
      const end = eH * 60 + eM;
      while (cur + editSessionDuration <= end) {
        const h = Math.floor(cur / 60);
        const m = cur % 60;
        slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
        cur += editSessionDuration + editBreakBetween;
      }
    }
    return slots;
  };

  const opVacations = selectedOp ? (allVacations[selectedOp] || []) : [];

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Operator overview grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Panoramica Disponibilità
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(OPERATOR_NAMES).map(([key, name]) => {
            const avail = allAvailability.find((a) => a.key === key);
            const isSelected = selectedOp === key;
            const enabledDays = avail?.daysOfWeek || [];
            const vacCount = (allVacations[key] || []).length;
            return (
              <button key={key} onClick={() => setSelectedOp(key)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected ? "border-olive-500 bg-olive-50 shadow-md" : "border-gray-100 hover:border-olive-300 hover:bg-gray-50"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm ${isSelected ? "text-olive-800" : "text-gray-800"}`}>{name}</span>
                  <div className="flex gap-1">
                    {avail?.source === "db" && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">Personalizzato</span>
                    )}
                    {vacCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">Ferie ({vacCount})</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <span key={d} className={`w-7 h-6 flex items-center justify-center rounded text-[10px] font-medium ${
                      enabledDays.includes(d) ? "bg-olive-500 text-white" : "bg-gray-100 text-gray-400"
                    }`}>{DAY_NAMES[d]}</span>
                  ))}
                </div>
                {avail && avail.schedule && (
                  <div className="mt-1.5 text-[11px] text-gray-500">
                    {avail.sessionDuration}min · {enabledDays.length} giorni/sett
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor */}
      {selectedOp && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-olive-600 text-white p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{OPERATOR_NAMES[selectedOp]}</h3>
              <p className="text-olive-100 text-sm">Modifica disponibilità per giorno</p>
            </div>
            <button onClick={() => setSelectedOp("")} className="p-2 hover:bg-olive-500 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Per-Day Schedule */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Orari per giorno</label>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const dayData = editSchedule[d];
                  const isExpanded = expandedDay === d;
                  const preview = computePreview(d);
                  return (
                    <div key={d} className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                      dayData.enabled ? "border-olive-200 bg-olive-50/30" : "border-gray-100 bg-gray-50/50"
                    }`}>
                      {/* Day header row */}
                      <div className="flex items-center gap-3 p-3">
                        {/* Toggle enabled */}
                        <button onClick={() => toggleDay(d)}
                          className={`w-10 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                            dayData.enabled ? "bg-olive-500" : "bg-gray-300"
                          }`}>
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            dayData.enabled ? "translate-x-4.5 left-0" : "left-0.5"
                          }`} />
                        </button>
                        {/* Day name */}
                        <button onClick={() => dayData.enabled && setExpandedDay(isExpanded ? null : d)}
                          className={`flex-1 text-left font-semibold text-sm ${dayData.enabled ? "text-gray-800 cursor-pointer" : "text-gray-400 cursor-default"}`}>
                          {DAY_FULL[d]}
                        </button>
                        {/* Summary */}
                        {dayData.enabled && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-500">
                              {dayData.timeSlots.map((s, i) => (
                                <span key={i}>{i > 0 && " | "}{s.start}-{s.end}</span>
                              ))}
                            </span>
                            <span className="text-[10px] bg-olive-100 text-olive-700 px-1.5 py-0.5 rounded-full font-medium">
                              {preview.length} slot
                            </span>
                            <button onClick={() => setExpandedDay(isExpanded ? null : d)}
                              className="p-1 hover:bg-olive-100 rounded-lg transition-colors">
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expanded time slot editor */}
                      {dayData.enabled && isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-olive-100">
                          <div className="pt-3 space-y-2">
                            {dayData.timeSlots.map((slot, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-gray-100">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-xs text-gray-500 w-10">Dalle</span>
                                  <input type="time" value={slot.start} onChange={(e) => updateDaySlot(d, idx, "start", e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-mono focus:border-olive-500 focus:outline-none text-gray-800 bg-white" />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-xs text-gray-500 w-10">Alle</span>
                                  <input type="time" value={slot.end} onChange={(e) => updateDaySlot(d, idx, "end", e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-mono focus:border-olive-500 focus:outline-none text-gray-800 bg-white" />
                                </div>
                                <button onClick={() => removeDaySlot(d, idx)} disabled={dayData.timeSlots.length <= 1}
                                  className={`p-1.5 rounded-lg transition-colors ${dayData.timeSlots.length <= 1 ? "text-gray-300 cursor-not-allowed" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => addDaySlot(d)}
                              className="flex-1 py-2 border-2 border-dashed border-olive-300 rounded-lg text-olive-600 font-medium text-xs hover:bg-olive-50 hover:border-olive-400 transition-colors flex items-center justify-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Aggiungi fascia
                            </button>
                            <button onClick={() => copyDayToAll(d)}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 text-xs hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-1"
                              title="Copia questi orari su tutti i giorni attivi">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copia su tutti i giorni attivi
                            </button>
                          </div>
                          {/* Day-level preview */}
                          {preview.length > 0 && (
                            <div>
                              <p className="text-[11px] text-gray-500 mb-1">{preview.length} slot generati:</p>
                              <div className="flex flex-wrap gap-1">
                                {preview.map((s) => (
                                  <span key={s} className="px-2 py-0.5 bg-olive-50 text-olive-700 rounded text-[11px] font-mono border border-olive-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Duration sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Durata sessione (min)</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={15} max={120} step={5} value={editSessionDuration}
                    onChange={(e) => setEditSessionDuration(Number(e.target.value))} className="flex-1 accent-olive-600" />
                  <span className="text-lg font-bold text-olive-700 w-14 text-center bg-olive-50 rounded-lg py-1">{editSessionDuration}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pausa tra sessioni (min)</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={60} step={5} value={editBreakBetween}
                    onChange={(e) => setEditBreakBetween(Number(e.target.value))} className="flex-1 accent-olive-600" />
                  <span className="text-lg font-bold text-olive-700 w-14 text-center bg-olive-50 rounded-lg py-1">{editBreakBetween}</span>
                </div>
              </div>
            </div>

            {/* Vacations / Ferie */}
            <div className="border-t border-gray-100 pt-5">
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                Ferie / Periodi di assenza
              </label>

              {/* Existing vacations */}
              {opVacations.length > 0 && (
                <div className="space-y-2 mb-4">
                  {opVacations.map((vac) => {
                    const startD = new Date(vac.start_date + "T00:00:00");
                    const endD = new Date(vac.end_date + "T00:00:00");
                    const isPast = vac.end_date < new Date().toISOString().split("T")[0];
                    return (
                      <div key={vac.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isPast ? "bg-gray-50 border-gray-200 opacity-60" : "bg-amber-50 border-amber-200"}`}>
                        <div className="flex-1">
                          <span className="font-medium text-sm text-gray-800">
                            {startD.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                            {" → "}
                            {endD.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {vac.note && <span className="ml-2 text-xs text-gray-500">({vac.note})</span>}
                          {isPast && <span className="ml-2 text-[10px] text-gray-400 font-medium">PASSATO</span>}
                        </div>
                        <button onClick={() => vac.id && deleteVacation(vac.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add vacation form */}
              <div className="flex flex-wrap items-end gap-3 bg-gray-50 rounded-lg p-3">
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-[11px] text-gray-500 mb-1">Dal</label>
                  <input type="date" value={vacStart} onChange={(e) => setVacStart(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-olive-500 focus:outline-none text-gray-800 bg-white" />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-[11px] text-gray-500 mb-1">Al</label>
                  <input type="date" value={vacEnd} onChange={(e) => setVacEnd(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-olive-500 focus:outline-none text-gray-800 bg-white" />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-[11px] text-gray-500 mb-1">Note (opzionale)</label>
                  <input type="text" value={vacNote} onChange={(e) => setVacNote(e.target.value)} placeholder="Es. Vacanze estive"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-olive-500 focus:outline-none text-gray-800 bg-white" />
                </div>
                <button onClick={addVacation} disabled={vacSaving || !vacStart || !vacEnd}
                  className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  {vacSaving ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  Aggiungi ferie
                </button>
              </div>
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-xl text-sm font-medium ${saveMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {saveMsg.text}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-olive-600 text-white rounded-xl font-semibold hover:bg-olive-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                {saving ? "Salvataggio..." : "Salva modifiche"}
              </button>
              <button onClick={handleReset}
                className="px-4 py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm">
                Ripristina default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────
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
  const [bookingView, setBookingView] = useState<"table" | "calendar">("table");
  const [activeTab, setActiveTab] = useState<"bookings" | "availability">("bookings");

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
              <p className="text-xs text-gray-500">Gestione Prenotazioni & Disponibilità</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "bookings" && (
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-olive-100 text-olive-700 rounded-lg hover:bg-olive-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Aggiorna
            </button>
            )}
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
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 max-w-md">
          <button onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "bookings" ? "bg-white text-olive-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Prenotazioni
          </button>
          <button onClick={() => setActiveTab("availability")}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "availability" ? "bg-white text-olive-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Disponibilità
          </button>
        </div>

        {/* Availability Tab */}
        {activeTab === "availability" && <AvailabilityEditor secret={secret} />}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (<>
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
            onClick={() => setBookingView("table")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bookingView === "table" ? "bg-olive-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            Tabella
          </button>
          <button
            onClick={() => setBookingView("calendar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bookingView === "calendar" ? "bg-olive-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
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
        ) : bookingView === "table" ? (
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
        </>)}
      </div>
    </div>
  );
}
