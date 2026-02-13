"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  getAvailableSlots,
  hasAvailability,
  getOperatorScheduleSummary,
} from "../lib/availability";

interface OperatorInfo {
  key: string;
  image: string;
}

const allOperators: OperatorInfo[] = [
  { key: "headmaster", image: "/team-photos-crop/FrancescaMayer.jpg" },
  { key: "corradoZamboni", image: "/team-photos-crop/CorradoZamboni.jpg" },
  {
    key: "deniseDallaPasqua",
    image: "/team-photos-crop/DeniseDallaPasqua.jpg",
  },
  {
    key: "giancarloPavanello",
    image: "/team-photos-crop/GiancarloPavanello.jpg",
  },
  { key: "graziaSferrazzaCallea", image: "/team-photos-crop/GraziaCallea.jpg" },
  { key: "martinaPasut", image: "/team-photos-crop/MartinaPasut.jpg" },
  { key: "martinaRoma", image: "/team-photos-crop/MartinaRoma.jpg" },
  { key: "massimoGnesotto", image: "/team-photos-crop/MassimoGnesotto2.jpg" },
  { key: "michelaDolce", image: "/team-photos-crop/MichelaDolce.jpg" },
  { key: "monicaBortoluzzi", image: "/team-photos-crop/MonicaBortoluzzi.jpg" },
  { key: "paoloAvella", image: "/team-photos-crop/PaoloAvella.jpg" },
  { key: "sabrinaPozzobon", image: "/team-photos-crop/SabrinaPozzobon.jpg" },
  { key: "tamaraZanchetta", image: "/team-photos-crop/TamaraZanchetta.jpg" },
];

const DAY_NAMES_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES_IT = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];
const FULL_DAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTH_NAMES_IT = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];
const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function BookingContent() {
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "it";

  const preselectedOperator =
    searchParams.get("operatore") || searchParams.get("operator") || "";

  const [selectedOperator, setSelectedOperator] = useState<string>(
    allOperators.some((op) => op.key === preselectedOperator)
      ? preselectedOperator
      : "",
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [animateCalendar, setAnimateCalendar] = useState(false);

  const dayNames = lang === "it" ? DAY_NAMES_IT : DAY_NAMES_EN;
  const fullDayNames = lang === "it" ? FULL_DAY_NAMES_IT : FULL_DAY_NAMES_EN;
  const monthNames = lang === "it" ? MONTH_NAMES_IT : MONTH_NAMES_EN;

  const handleSelectOperator = useCallback((key: string) => {
    setSelectedOperator(key);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAnimateCalendar(true);
    setTimeout(() => setAnimateCalendar(false), 400);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  // Scroll to calendar when operator is pre-selected
  useEffect(() => {
    if (preselectedOperator) {
      const timer = setTimeout(() => {
        document
          .getElementById("calendar-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [preselectedOperator]);

  // Intersection observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start calendar on Monday (1)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (Date | null)[] = [];

    // Padding for the beginning
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // All days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const mondayFirstDayNames = useMemo(() => {
    // Reorder: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const names = [...dayNames];
    const sun = names.shift()!;
    names.push(sun);
    return names;
  }, [dayNames]);

  const availableSlots = useMemo(() => {
    if (!selectedOperator || !selectedDate) return [];
    return getAvailableSlots(selectedOperator, selectedDate);
  }, [selectedOperator, selectedDate]);

  const scheduleSummary = useMemo(() => {
    if (!selectedOperator) return null;
    return getOperatorScheduleSummary(selectedOperator);
  }, [selectedOperator]);

  const selectedOperatorInfo = useMemo(() => {
    return allOperators.find((op) => op.key === selectedOperator) || null;
  }, [selectedOperator]);

  const navigateMonth = useCallback((direction: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  }, []);

  const isDateAvailable = useCallback(
    (date: Date) => {
      if (!selectedOperator) return false;
      if (date < today) return false;
      return hasAvailability(selectedOperator, date);
    },
    [selectedOperator, today],
  );

  const isSameDate = (a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const isToday = (date: Date) => isSameDate(date, today);

  const formatDate = (date: Date) => {
    return `${fullDayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleBooking = () => {
    if (!selectedOperator || !selectedDate || !selectedSlot) return;
    const operatorName = t(`team.members.${selectedOperator}.name`);
    const dateStr = formatDate(selectedDate);
    const message =
      lang === "it"
        ? `Salve, vorrei prenotare una sessione con ${operatorName} il ${dateStr} alle ${selectedSlot}. Grazie!`
        : `Hello, I would like to book a session with ${operatorName} on ${dateStr} at ${selectedSlot}. Thank you!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://api.whatsapp.com/send?phone=393517471159&text=${encodedMessage}`,
      "_blank",
    );
  };

  const canGoBack =
    currentMonth.getMonth() !== today.getMonth() ||
    currentMonth.getFullYear() !== today.getFullYear();

  return (
    <div className="bg-white min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              {t("booking.hero.title").split(
                t("booking.hero.highlight") || "___",
              ).length > 1 ? (
                <>
                  {
                    t("booking.hero.title").split(
                      t("booking.hero.highlight"),
                    )[0]
                  }
                  <span className="text-gradient">
                    {t("booking.hero.highlight")}
                  </span>
                  {
                    t("booking.hero.title").split(
                      t("booking.hero.highlight"),
                    )[1]
                  }
                </>
              ) : (
                <>{t("booking.hero.title")}</>
              )}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("booking.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Steps Guide */}
      <section className="py-12 bg-white border-b border-olive-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold transition-all duration-300 ${
                    step === 1 && selectedOperator
                      ? "bg-olive-600 text-white"
                      : step === 2 && selectedDate
                        ? "bg-olive-600 text-white"
                        : step === 3 && selectedSlot
                          ? "bg-olive-600 text-white"
                          : "bg-olive-100 text-olive-600"
                  }`}
                >
                  {(step === 1 && selectedOperator) ||
                  (step === 2 && selectedDate) ||
                  (step === 3 && selectedSlot) ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-olive-800 text-lg">
                    {t(`booking.steps.step${step}.title`)}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {t(`booking.steps.step${step}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operator Selection */}
      <section className="py-16 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 reveal">
            <h2 className="text-3xl font-bold text-olive-800 mb-3">
              {t("booking.selectOperator.title")}
            </h2>
            <p className="text-gray-600">
              {t("booking.selectOperator.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 reveal">
            {allOperators.map((op) => {
              const isSelected = selectedOperator === op.key;
              return (
                <button
                  key={op.key}
                  onClick={() => handleSelectOperator(op.key)}
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                    isSelected
                      ? "border-olive-600 shadow-lg shadow-olive-200 ring-2 ring-olive-400 scale-105"
                      : "border-transparent hover:border-olive-300 hover:shadow-md"
                  }`}
                >
                  <div className="aspect-square bg-gradient-to-br from-olive-100 to-olive-200 overflow-hidden">
                    <img
                      src={op.image}
                      alt={t(`team.members.${op.key}.name`)}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isSelected ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <div
                    className={`p-3 text-center transition-colors duration-300 ${
                      isSelected
                        ? "bg-olive-600"
                        : "bg-white group-hover:bg-olive-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-white" : "text-olive-800"
                      }`}
                    >
                      {t(`team.members.${op.key}.name`)}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        isSelected ? "text-olive-100" : "text-gray-500"
                      }`}
                    >
                      {t(`team.members.${op.key}.role`)}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-olive-600 rounded-full flex items-center justify-center shadow-md">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calendar + Time Slots */}
      {selectedOperator && (
        <section id="calendar-section" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Operator Info Banner */}
            {selectedOperatorInfo && (
              <div className="mb-10 reveal">
                <div className="bg-gradient-to-r from-olive-50 to-olive-100 rounded-2xl p-6 flex items-center gap-6 border border-olive-200">
                  <img
                    src={selectedOperatorInfo.image}
                    alt={t(`team.members.${selectedOperator}.name`)}
                    className="w-16 h-16 rounded-full object-cover border-2 border-olive-400 shadow-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-olive-800">
                      {t(`team.members.${selectedOperator}.name`)}
                    </h3>
                    <p className="text-olive-600 text-sm">
                      {t(`team.members.${selectedOperator}.role`)}
                    </p>
                    {scheduleSummary && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">
                          {t("booking.availableDays")}:
                        </span>
                        {scheduleSummary.daysOfWeek.map((d) => (
                          <span
                            key={d}
                            className="px-2 py-0.5 bg-olive-200 text-olive-700 rounded-full text-xs font-medium"
                          >
                            {fullDayNames[d]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-500">
                      {t("booking.sessionInfo")}
                    </p>
                    {scheduleSummary && (
                      <p className="text-sm font-medium text-olive-700">
                        {scheduleSummary.timeSlots
                          .map((s) => `${s.start} - ${s.end}`)
                          .join(" | ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div
              className={`grid grid-cols-1 lg:grid-cols-5 gap-8 ${animateCalendar ? "animate-fadeInUp" : ""}`}
            >
              {/* Calendar */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-olive-200 shadow-lg overflow-hidden">
                  {/* Calendar Header */}
                  <div className="bg-olive-600 text-white p-5 flex items-center justify-between">
                    <button
                      onClick={() => navigateMonth(-1)}
                      disabled={!canGoBack}
                      className={`p-2 rounded-full transition-all ${
                        canGoBack
                          ? "hover:bg-olive-500 active:bg-olive-700"
                          : "opacity-30 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <h3 className="text-xl font-bold">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </h3>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 rounded-full hover:bg-olive-500 active:bg-olive-700 transition-all"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Day names */}
                  <div className="grid grid-cols-7 bg-olive-50 border-b border-olive-200">
                    {mondayFirstDayNames.map((name) => (
                      <div
                        key={name}
                        className="p-3 text-center text-sm font-semibold text-olive-700"
                      >
                        {name}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 p-2 gap-1">
                    {calendarDays.map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} className="p-3" />;
                      }

                      const available = isDateAvailable(date);
                      const selected = isSameDate(date, selectedDate);
                      const todayDate = isToday(date);
                      const isPast = date < today;

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => available && handleSelectDate(date)}
                          disabled={!available}
                          className={`relative p-3 rounded-xl text-center transition-all duration-200 text-sm font-medium ${
                            selected
                              ? "bg-olive-600 text-white shadow-lg scale-110 z-10"
                              : available
                                ? "hover:bg-olive-100 text-olive-800 hover:scale-105 cursor-pointer"
                                : isPast
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {date.getDate()}
                          {todayDate && !selected && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-olive-500 rounded-full" />
                          )}
                          {available && !selected && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="p-4 border-t border-olive-100 flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      {t("booking.calendar.available")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-olive-600 rounded" />
                      {t("booking.calendar.selected")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-olive-500 rounded-full" />
                      {t("booking.calendar.today")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Slots Panel */}
              <div className="lg:col-span-2">
                {selectedDate ? (
                  <div className="bg-white rounded-2xl border border-olive-200 shadow-lg overflow-hidden">
                    <div className="bg-olive-600 text-white p-5">
                      <h3 className="font-bold text-lg">
                        {t("booking.timeSlots.title")}
                      </h3>
                      <p className="text-olive-100 text-sm mt-1">
                        {formatDate(selectedDate)}
                      </p>
                    </div>

                    <div className="p-5">
                      {availableSlots.length > 0 ? (
                        <>
                          <p className="text-sm text-gray-500 mb-4">
                            {availableSlots.length}{" "}
                            {t("booking.timeSlots.slotsAvailable")}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-3 rounded-xl text-center font-medium transition-all duration-200 border ${
                                  selectedSlot === slot
                                    ? "bg-olive-600 text-white border-olive-600 shadow-md scale-105"
                                    : "bg-olive-50 text-olive-700 border-olive-200 hover:bg-olive-100 hover:border-olive-400 hover:scale-102"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4 mx-auto mb-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {slot}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <svg
                            className="w-12 h-12 mx-auto mb-3 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p>{t("booking.timeSlots.noSlots")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-olive-50 rounded-2xl border-2 border-dashed border-olive-300 p-10 text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-olive-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-olive-600 font-medium text-lg">
                      {t("booking.timeSlots.selectDatePrompt")}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {t("booking.timeSlots.selectDateHint")}
                    </p>
                  </div>
                )}

                {/* Booking Summary + CTA */}
                {selectedSlot && selectedDate && (
                  <div className="mt-6 bg-gradient-to-br from-olive-600 to-olive-700 rounded-2xl p-6 text-white shadow-xl animate-fadeInUp">
                    <h4 className="font-bold text-lg mb-4">
                      {t("booking.summary.title")}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-olive-200">
                          {t("booking.summary.operator")}
                        </span>
                        <span className="font-medium">
                          {t(`team.members.${selectedOperator}.name`)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-olive-200">
                          {t("booking.summary.date")}
                        </span>
                        <span className="font-medium">
                          {selectedDate.getDate()}{" "}
                          {monthNames[selectedDate.getMonth()]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-olive-200">
                          {t("booking.summary.time")}
                        </span>
                        <span className="font-medium">{selectedSlot}</span>
                      </div>
                      <hr className="border-olive-500/40" />
                    </div>

                    <button
                      onClick={() => setIsConfirming(true)}
                      className="w-full mt-5 bg-white text-olive-700 py-3.5 rounded-xl font-bold text-lg hover:bg-olive-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      </svg>
                      {t("booking.summary.bookViaWhatsApp")}
                    </button>

                    <p className="text-center text-olive-200 text-xs mt-3">
                      {t("booking.summary.whatsappNote")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty state when no operator selected */}
      {!selectedOperator && (
        <section className="py-24 bg-white">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="reveal">
              <svg
                className="w-24 h-24 mx-auto mb-6 text-olive-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-olive-800 mb-3">
                {t("booking.emptyState.title")}
              </h3>
              <p className="text-gray-500">
                {t("booking.emptyState.description")}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Confirmation Modal */}
      {isConfirming && selectedDate && selectedSlot && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsConfirming(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full animate-scaleIn overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-olive-600 p-6 text-white text-center">
              <svg
                className="w-14 h-14 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-2xl font-bold">
                {t("booking.confirm.title")}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 p-3 bg-olive-50 rounded-xl">
                  {selectedOperatorInfo && (
                    <img
                      src={selectedOperatorInfo.image}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-olive-300"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-olive-800">
                      {t(`team.members.${selectedOperator}.name`)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t(`team.members.${selectedOperator}.role`)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-olive-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("booking.summary.date")}
                    </p>
                    <p className="font-bold text-olive-800">
                      {selectedDate.getDate()}{" "}
                      {monthNames[selectedDate.getMonth()]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fullDayNames[selectedDate.getDay()]}
                    </p>
                  </div>
                  <div className="p-3 bg-olive-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("booking.summary.time")}
                    </p>
                    <p className="font-bold text-olive-800">{selectedSlot}</p>
                  </div>
                </div>

                <div className="p-3 bg-olive-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-olive-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-olive-800">
                        {t("booking.confirm.location")}
                      </p>
                      <p className="text-xs text-gray-500">
                        Via Campagna 46, San Polo di Piave (TV)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 py-3 border-2 border-olive-300 text-olive-700 rounded-xl font-semibold hover:bg-olive-50 transition-all"
                >
                  {t("booking.confirm.cancel")}
                </button>
                <button
                  onClick={() => {
                    setIsConfirming(false);
                    handleBooking();
                  }}
                  className="flex-1 py-3 bg-olive-600 text-white rounded-xl font-semibold hover:bg-olive-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  {t("booking.confirm.confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen pt-24 flex items-center justify-center">
          <div className="animate-pulse text-olive-600 text-lg">Loading...</div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
