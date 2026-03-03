"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function HumanStudiesPage() {
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

      {/* Event highlights */}
      <section className="py-16 bg-olive-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-10">
            <h2 className="text-3xl font-bold text-olive-800 mb-3">
              Eventi ospitati e in programma
            </h2>
            <p className="text-gray-600 text-lg">
              Un evento passato e il prossimo appuntamento di aprile in
              collaborazione con Human Studies
            </p>
          </div>

          <div className="space-y-8">
            <div className="reveal bg-white rounded-3xl overflow-hidden shadow-xl border border-olive-100 flex flex-col md:flex-row opacity-80">
              <div className="md:w-2/5 h-56 md:h-auto overflow-hidden relative">
                <img
                  src="/images/events/allergie.png"
                  alt="Allergie"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Passato</span>
                </div>
              </div>
              <div className="md:w-3/5 p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-4">
                    Workshop
                  </span>
                  <h3 className="text-2xl font-bold text-olive-800 mb-3">
                    ALLERGIE: risposta immunitaria e nutrizione
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Evento formativo con approfondimenti su sistema immunitario,
                    alimentazione, microbioma intestinale e fitoterapia.
                  </p>
                  <div className="space-y-1.5 text-sm text-gray-600 mb-6">
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
                      <span>23 Marzo 2025</span>
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
                      <span>Via Campagna 46, San Polo di Piave (TV)</span>
                    </div>
                  </div>
                </div>
                <button
                  disabled
                  className="inline-block bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-semibold cursor-not-allowed text-center"
                >
                  Evento passato
                </button>
              </div>
            </div>

            <div className="reveal bg-white rounded-3xl overflow-hidden shadow-xl border border-olive-100 flex flex-col md:flex-row">
              <div className="md:w-2/5 h-56 md:h-auto overflow-hidden bg-olive-100">
                <img
                  src="/images/events/studydays.jpeg"
                  alt="Studio Days"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="md:w-3/5 p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-4">
                    Workshop
                  </span>
                  <h3 className="text-2xl font-bold text-olive-800 mb-3">
                    Studio Days: Giornate di Approfondimento Olistico
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Giornate di approfondimento olistico con sessioni teoriche e
                    pratiche guidate da professionisti esperti.
                  </p>
                  <div className="space-y-1.5 text-sm text-gray-600 mb-6">
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
                      <span>1 Aprile – 20 Giugno 2026</span>
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
                      <span>Via Campagna 46, San Polo di Piave (TV)</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/events"
                  className="inline-block bg-olive-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02] text-center"
                >
                  Scopri l&apos;evento →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
