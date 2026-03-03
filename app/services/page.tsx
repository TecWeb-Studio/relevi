"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface Pack {
  key: string;
  image: string;
  badge?: "bestValue" | "popular";
  accent: string;
  accentBg: string;
}

export default function ServicesPage() {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
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

  const packs: Pack[] = [
    {
      key: "p1",
      image: "/images/services/packs/p1.jpeg",
      accent: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-500",
    },
    {
      key: "p2",
      image: "/images/services/packs/p2.jpeg",
      accent: "from-olive-500 to-olive-700",
      accentBg: "bg-olive-600",
    },
    {
      key: "p3",
      image: "/images/services/packs/p3.jpeg",
      accent: "from-violet-500 to-purple-600",
      accentBg: "bg-violet-500",
    },
    {
      key: "p4",
      image: "/images/services/packs/p4.jpeg",
      accent: "from-sky-500 to-cyan-600",
      accentBg: "bg-sky-500",
    },
    {
      key: "p5",
      image: "/images/services/packs/p5.jpeg",
      badge: "bestValue",
      accent: "from-olive-600 to-olive-800",
      accentBg: "bg-olive-700",
    },
    {
      key: "p6",
      image: "/images/services/packs/p6.jpeg",
      accent: "from-rose-400 to-pink-600",
      accentBg: "bg-rose-500",
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              {
                t("services.hero.title").split(
                  t("services.hero.title").includes("Services")
                    ? "Services"
                    : "Servizi",
                )[0]
              }
              <span className="text-gradient">
                {t("services.hero.title").includes("Services")
                  ? "Services"
                  : "Servizi"}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("services.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Packs Hero with Main Image ── */}
      <section className="relative py-0 overflow-hidden">
        <div className="relative h-[50vh] min-h-[400px] max-h-[600px] w-full">
          <Image
            src="/images/services/packs/main.jpeg"
            alt="Wellness packs"
            fill
            className="object-cover"
            priority
          />
          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-olive-950/90 via-olive-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-olive-950/30 to-transparent" />

          {/* Floating content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="reveal">
              <span className="inline-block px-5 py-1.5 rounded-full text-sm font-medium tracking-widest uppercase bg-white/15 text-white/90 backdrop-blur-md border border-white/20 mb-6">
                {t("services.packages.heroTagline")}
              </span>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
                {t("services.packages.title")}
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                {t("services.packages.subtitle")}
              </p>
            </div>
          </div>

          {/* Bottom fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-olive-50 to-transparent" />
        </div>
      </section>

      {/* ── Pack Cards Grid ── */}
      <section className="py-20 bg-olive-50 relative">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(85,97,52,1) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packs.map((pack, idx) => (
              <div
                key={pack.key}
                className="reveal group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-olive-100/50 cursor-pointer"
                style={{ animationDelay: `${idx * 120}ms` }}
                onClick={() => setSelectedPack(pack)}
              >
                {/* ── Card Header: Title + tagline on top ── */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-xl font-bold text-olive-800 group-hover:text-olive-600 transition-colors leading-tight">
                      {t(`services.packages.${pack.key}.name`)}
                    </h3>
                    {pack.badge && (
                      <span
                        className={`ml-2 flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase text-white shadow-sm ${
                          pack.badge === "bestValue"
                            ? "bg-gradient-to-r from-amber-400 to-orange-500"
                            : "bg-gradient-to-r from-olive-500 to-olive-600"
                        }`}
                      >
                        {pack.badge === "bestValue" ? (
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        )}
                        {t(`services.packages.${pack.badge}`)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm italic text-olive-500 tracking-wide">
                    {t(`services.packages.${pack.key}.tagline`)}
                  </p>
                </div>

                {/* ── Image ── */}
                <div className="relative h-48 mx-4 rounded-2xl overflow-hidden">
                  <Image
                    src={pack.image}
                    alt={t(`services.packages.${pack.key}.name`)}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Soft gradient on bottom of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Shine on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-5 pt-4">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {t(`services.packages.${pack.key}.description`)}
                  </p>

                  {/* Included services preview (compact) */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(
                      t(`services.packages.${pack.key}.services`, {
                        returnObjects: true,
                      }) as string[]
                    ).map((service: string) => (
                      <span
                        key={service}
                        className="inline-block px-2.5 py-1 rounded-full bg-olive-50 text-olive-600 text-xs font-medium border border-olive-100"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r ${pack.accent} text-white hover:shadow-lg hover:shadow-olive-200/50 active:scale-[0.98]`}
                  >
                    {t("services.viewDetails")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotional Banner Section ── */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal relative rounded-3xl overflow-hidden shadow-2xl border border-olive-100/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
              {/* Image side */}
              <div className="relative h-64 lg:h-auto">
                <Image
                  src="/images/services/packs/payment.jpeg"
                  alt="Your wellness journey"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/60 hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent lg:hidden" />
              </div>

              {/* Content side */}
              <div className="relative flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white">
                {/* Decorative elements */}
                <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-olive-50 opacity-60 blur-2xl" />
                <div className="absolute bottom-12 right-16 w-32 h-32 rounded-full bg-olive-100 opacity-40 blur-3xl" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-olive-50 text-olive-600 text-sm font-semibold mb-6">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {t("services.packages.paymentBadge")}
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold text-olive-800 mb-4">
                    {t("services.packages.paymentTitle")}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {t("services.packages.paymentSubtitle")}
                  </p>

                  <button
                    onClick={() =>
                      window.open(
                        "https://api.whatsapp.com/message/PIEXHXZ5H3RRJ1?autoload=1&app_absent=0",
                        "_blank",
                      )
                    }
                    className="inline-flex items-center gap-2 bg-olive-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-olive-700 transition-all duration-300 hover:shadow-lg hover:shadow-olive-200/50 active:scale-[0.98]"
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {t("services.packages.paymentCta")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-olive-600 to-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("services.cta.title")}
            </h2>
            <p className="text-xl text-olive-100 mb-8 max-w-2xl mx-auto">
              {t("services.cta.subtitle")}
            </p>
            <Link
              href="/prenota"
              className="inline-block bg-white text-olive-600 px-8 py-4 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {t("nav.booking")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pack Detail Modal ── */}
      {selectedPack && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPack(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal: full image, no overlays */}
            <div className="relative">
              <div className="relative h-72 sm:h-96">
                <Image
                  src={selectedPack.image}
                  alt={t(`services.packages.${selectedPack.key}.name`)}
                  fill
                  className="object-cover rounded-t-3xl"
                />
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedPack(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-olive-700 transition-colors shadow-lg"
                aria-label="Close"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body: only buttons */}
            <div className="p-6">
              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPack(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  {t("services.modal.close")}
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://api.whatsapp.com/message/PIEXHXZ5H3RRJ1?autoload=1&app_absent=0",
                      "_blank",
                    )
                  }
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r ${selectedPack.accent} text-white hover:shadow-lg active:scale-[0.98]`}
                >
                  {t("services.modal.bookNow")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
