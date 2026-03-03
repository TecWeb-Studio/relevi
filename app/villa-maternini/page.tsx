"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function VillaMaterniniPage() {
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
              Villa Maternini
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Una villa storica immersa nel verde, spazio d&apos;eccellenza per
              eventi, benessere e attività culturali in collaborazione con
              Relevi Healing.
            </p>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 reveal">
          <div className="w-full h-130 rounded-3xl shadow-xl overflow-hidden bg-white">
            <img
              src="/images/partners/villaMaternini.jpg.jpeg"
              alt="Villa Maternini"
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
              Villa Maternini è uno degli spazi privilegiati in cui Relevi
              Healing porta le proprie attività di benessere, workshop e
              eventi speciali. La villa offre un ambiente suggestivo e
              accogliente, perfetto per esperienze di crescita personale e
              comunitaria.
            </p>
            <p className="text-gray-700 leading-relaxed">
              La sinergia tra Relevi Healing e Villa Maternini nasce dalla
              condivisione di valori comuni: attenzione alla persona,
              rispetto per la natura e la cultura del territorio, e
              l&apos;impegno nel creare momenti di valore per la comunità.
            </p>
          </div>
        </div>
      </section>

      {/* Event highlight — Equilibrio Donna */}
      <section className="py-16 bg-olive-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-10">
            <h2 className="text-3xl font-bold text-olive-800 mb-3">
              Prossimo evento ospitato
            </h2>
            <p className="text-gray-600 text-lg">
              Un appuntamento speciale in collaborazione con Villa Maternini
            </p>
          </div>

          <div className="reveal bg-white rounded-3xl overflow-hidden shadow-xl border border-olive-100 flex flex-col md:flex-row">
            <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
              <img
                src="/images/events/equilibrio-donna/donna.avif"
                alt="Equilibrio Donna"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-3/5 p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 mb-4">
                  Speciale
                </span>
                <h3 className="text-2xl font-bold text-olive-800 mb-3">
                  Equilibrio Donna
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Una giornata dedicata al benessere femminile: sessioni
                  esperienziali, ascolto e condivisione per ritrovare
                  equilibrio, energia e armonia.
                </p>
                <div className="space-y-1.5 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>8 Marzo 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
      </section>
    </div>
  );
}
