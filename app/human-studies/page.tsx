"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  EVENTS,
  EventDetail,
  isEventPassed,
  getEventTypeColor,
  mergeEventDetails,
} from "../lib/eventsData";

export default function HumanStudiesPage() {
  const { t, i18n } = useTranslation();

  const PARTNER_EVENT_KEYS = ["allergiesEvent", "studyDaysEvent"];
  const partnerEvents = EVENTS.filter((e) =>
    PARTNER_EVENT_KEYS.includes(e.key),
  );

  const getEventDetails = (key: string): EventDetail =>
    mergeEventDetails(
      key,
      t(`events.eventDetails.${key}`, { returnObjects: true }),
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === "it" ? "it-IT" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const activeEvents = partnerEvents.filter((e) => {
    const details = getEventDetails(e.key);
    return !isEventPassed(details);
  });
  const passedPartnerEvents = partnerEvents.filter((e) => {
    const details = getEventDetails(e.key);
    return isEventPassed(details);
  });
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

  return (
    <div className="bg-white min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <p className="text-olive-600 font-semibold uppercase tracking-widest text-sm mb-4">
              Partner
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              Human Studies
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Una collaborazione orientata a un approccio umano, professionale e
              fondato su basi scientifiche e culturali.
            </p>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal">
          <div className="w-full h-130 rounded-3xl shadow-xl overflow-hidden bg-white">
            <img
              src="/images/partners/humanStudies.jpeg"
              alt="Human Studies"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal bg-white rounded-3xl shadow-xl border border-olive-100 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-olive-800 mb-6">
              La nostra collaborazione
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Human Studies (HS) è una realtà in formazione (I semestre 2025)
              costituita da professionisti che si rivolge al mondo Re.Le.Vi.
              Healing con una proposta di cura ampia, sostenuta da solidi
              fondamenti scientifici e culturali. HS affronta la richiesta di
              attenzione e presenza nella cura, ponendo al centro la persona:
              human being, nel doppio significato di essere umani e benessere
              (well being).
            </p>
            <p className="text-gray-700 leading-relaxed">
              In una fase in cui molte proposte si orientano al mercato e a
              soluzioni standardizzate, HS e RH scelgono di integrarsi nelle
              rispettive funzioni per offrire un percorso umano, professionale e
              gentile. In questa prima fase, la collaborazione mira a
              consolidare i passi iniziali di entrambe le strutture, ampliare la
              proposta di RH e costruire un progetto condiviso per partecipanti
              consapevoli, con l&apos;ambizione di crescere in competenza,
              presenza e maestria.
            </p>
          </div>
        </div>
      </section>

      {/* Events section */}
      <section className="py-16 bg-olive-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-10">
            <h2 className="text-3xl font-bold text-olive-800 mb-3">
              {t("events.upcomingEvents.title")}
            </h2>
            <p className="text-gray-600 text-lg">
              Un evento passato e il prossimo appuntamento in collaborazione con
              Human Studies
            </p>
          </div>

          {activeEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {activeEvents.map((event, index) => {
                const details = getEventDetails(event.key);
                return (
                  <div
                    key={event.id}
                    className="reveal bg-white rounded-3xl overflow-hidden shadow-lg hover-lift transition-all duration-300 border border-olive-100 flex flex-col"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`w-full overflow-hidden relative ${
                        event.images || event.video ? "h-28" : "h-20"
                      }`}
                    >
                      {event.video ? (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white ml-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      ) : (
                        <img
                          src={event.image}
                          alt={t(`events.eventList.${event.key}.title`)}
                          className="w-full h-full object-cover object-top"
                        />
                      )}
                    </div>
                    <div className="p-6 grow">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}
                        >
                          {t(`events.filters.${event.type}`)}
                        </span>
                        <span className="text-olive-600 font-bold text-sm">
                          {t(`events.eventList.${event.key}.price`)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-olive-800 mb-3">
                        {t(`events.eventList.${event.key}.title`)}
                      </h3>
                      <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 shrink-0 text-olive-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {details.dateDisplay ?? formatDate(details.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 shrink-0 text-olive-600"
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
                          <span>{details.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {t(`events.eventList.${event.key}.description`)}
                      </p>
                    </div>
                    <div className="p-6 pt-0">
                      <Link
                        href="/events"
                        className="block w-full bg-olive-600 text-white py-3 rounded-xl font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02] text-center"
                      >
                        {t("events.learnMore")} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {passedPartnerEvents.length > 0 && (
            <div
              className={
                activeEvents.length > 0
                  ? "mt-8 pt-8 border-t border-olive-100"
                  : ""
              }
            >
              {activeEvents.length > 0 && (
                <h3 className="text-2xl font-bold text-olive-800 mb-6">
                  {t("events.passedEvents.title")}
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {passedPartnerEvents.map((event, index) => {
                  const details = getEventDetails(event.key);
                  return (
                    <div
                      key={event.id}
                      className="reveal bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300 border border-olive-100 flex flex-col opacity-60"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`w-full overflow-hidden relative ${
                          event.images || event.video ? "h-28" : "h-20"
                        }`}
                      >
                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {t("events.eventPassed")}
                          </span>
                        </div>
                        {event.video ? (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                        ) : (
                          <img
                            src={event.image}
                            alt={t(`events.eventList.${event.key}.title`)}
                            className="w-full h-full object-cover object-top"
                          />
                        )}
                      </div>
                      <div className="p-6 grow">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}
                          >
                            {t(`events.filters.${event.type}`)}
                          </span>
                          <span className="text-olive-600 font-bold text-sm">
                            {t(`events.eventList.${event.key}.price`)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-olive-800 mb-3">
                          {t(`events.eventList.${event.key}.title`)}
                        </h3>
                        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 shrink-0 text-olive-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {details.dateDisplay ?? formatDate(details.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 shrink-0 text-olive-600"
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
                            <span>{details.location}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {t(`events.eventList.${event.key}.description`)}
                        </p>
                      </div>
                      <div className="p-6 pt-0">
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                        >
                          {t("events.eventPassed")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
