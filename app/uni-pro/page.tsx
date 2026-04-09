"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function UniProPage() {
  const { t } = useTranslation();

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
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              {t("home.uniPro.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("home.uniPro.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Attestazione Relevi */}
      <section className="py-10 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <img
            src="/images/certificates/attestazioneRelevi.png"
            alt="Attestazione Relevi"
            className="mx-auto rounded-2xl shadow-lg w-full"
          />
        </div>
      </section>

      {/* Summary + Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-olive-100 p-8 md:p-10 reveal">
            <p className="text-gray-700 leading-relaxed mb-6">
              {t("home.uniPro.summary")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                t("home.uniPro.highlights", { returnObjects: true }) as string[]
              ).map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 bg-olive-50 rounded-2xl p-4 border border-olive-100"
                >
                  <span className="mt-1 w-2.5 h-2.5 bg-olive-500 rounded-full" />
                  <p className="text-olive-800 text-sm leading-relaxed">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
