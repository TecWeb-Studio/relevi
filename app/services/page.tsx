"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface Service {
  id: number;
  key: string;
  icon: string;
  recommended: boolean;
}

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filter, setFilter] = useState<string>("all");
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

  const services: Service[] = [
    { id: 1, key: "naturopathicConsultation", icon: "🌿", recommended: true },
    { id: 2, key: "holisticMassages", icon: "💆", recommended: true },
    { id: 3, key: "iridology", icon: "👁️", recommended: false },
    { id: 4, key: "orthodynamicGymnastics", icon: "🧘", recommended: true },
  ];

  const filteredServices = services.filter((service) => {
    if (filter === "recommended") return service.recommended;
    return true;
  });

  const categories = [
    { label: t("services.filters.allServices"), value: "all" },
    { label: t("services.filters.recommended"), value: "recommended" },
  ];

  const packages = [
    {
      key: "wellnessStarter",
      featured: false,
    },
    {
      key: "healingRetreat",
      featured: true,
    },
    {
      key: "premiumRejuvenation",
      featured: false,
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

      {/* Filter Section */}
      <section className="py-8 bg-white border-b border-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  filter === category.value
                    ? "bg-olive-600 text-white shadow-lg"
                    : "bg-olive-100 text-olive-700 hover:bg-olive-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="reveal group relative bg-white rounded-2xl overflow-hidden shadow-lg hover-lift transition-all duration-300 border border-olive-100 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedService(service)}
              >
                {service.recommended && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {t("services.recommended")}
                  </div>
                )}

                <div className="h-40 bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center group-hover:from-olive-200 group-hover:to-olive-300 transition-all duration-300">
                  <div className="text-7xl transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-olive-800 mb-2">
                    {t(`services.serviceTypes.${service.key}.title`)}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {t(`services.serviceTypes.${service.key}.description`)}
                  </p>

                  <div className="flex items-center justify-center pt-4 border-t border-olive-100">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        {t("services.duration")}
                      </p>
                      <p className="font-semibold text-olive-700">
                        {t(`services.durations.${service.key}`)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      window.open(
                        "https://api.whatsapp.com/message/PIEXHXZ5H3RRJ1?autoload=1&app_absent=0",
                        "_blank",
                      )
                    }
                    className="w-full mt-4 bg-olive-600 text-white py-2 rounded-lg font-semibold hover:bg-olive-700 transition-all duration-300"
                  >
                    {t("services.viewDetails")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Section */}
      <section className="py-24 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-4">
              {t("services.packages.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("services.packages.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <div
                key={pkg.key}
                className={`reveal rounded-3xl p-8 transition-all duration-300 flex flex-col ${
                  pkg.featured
                    ? "bg-gradient-to-br from-olive-600 to-olive-700 text-white shadow-2xl transform md:scale-105"
                    : "bg-white border-2 border-olive-200 hover-lift"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {pkg.featured && (
                  <div className="text-center mb-4">
                    <span className="inline-block bg-white text-olive-600 px-4 py-1 rounded-full text-sm font-bold">
                      {t("services.packages.bestValue")}
                    </span>
                  </div>
                )}

                <h3
                  className={`text-2xl font-bold mb-2 ${
                    pkg.featured ? "text-white" : "text-olive-800"
                  }`}
                >
                  {t(`services.packages.${pkg.key}.name`)}
                </h3>
                <p
                  className={`mb-6 ${
                    pkg.featured ? "text-olive-100" : "text-gray-600"
                  }`}
                >
                  {t(`services.packages.${pkg.key}.description`)}
                </p>

                <div className="mb-6">
                  {(
                    t(`services.packages.${pkg.key}.services`, {
                      returnObjects: true,
                    }) as string[]
                  ).map((service: string) => (
                    <div
                      key={service}
                      className={`py-2 flex items-center gap-2 ${
                        pkg.featured
                          ? "text-olive-100"
                          : "text-gray-700 border-b border-olive-200"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 flex-shrink-0"
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
                      {service}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    window.open(
                      "https://api.whatsapp.com/message/PIEXHXZ5H3RRJ1?autoload=1&app_absent=0",
                      "_blank",
                    )
                  }
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 mt-auto ${
                    pkg.featured
                      ? "bg-white text-olive-600 hover:bg-olive-50"
                      : "bg-olive-600 text-white hover:bg-olive-700"
                  }`}
                >
                  {t("services.packages.bookPackage")}
                </button>
              </div>
            ))}
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
              href="/"
              className="inline-block bg-white text-olive-600 px-8 py-4 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {t("services.cta.button")}
            </Link>
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-olive-100 to-olive-300 flex items-center justify-center">
                <div className="text-9xl">{selectedService.icon}</div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-olive-700 transition-colors shadow-lg"
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

            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-olive-800 mb-2">
                    {t(`services.serviceTypes.${selectedService.key}.title`)}
                  </h2>
                  {selectedService.recommended && (
                    <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {t("services.recommended")}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-2">
                  {t("services.modal.about")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(
                    `services.serviceTypes.${selectedService.key}.fullDescription`,
                  )}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-3">
                  {t("services.modal.benefits")}
                </h3>
                <ul className="grid grid-cols-2 gap-3">
                  {(
                    t(`services.serviceTypes.${selectedService.key}.benefits`, {
                      returnObjects: true,
                    }) as string[]
                  ).map((benefit: string) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <svg
                        className="w-5 h-5 text-olive-600 flex-shrink-0"
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
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-olive-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("services.duration")}
                  </p>
                  <p className="font-bold text-olive-700">
                    {t(`services.durations.${selectedService.key}`)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("services.modal.therapists")}
                  </p>
                  <p className="font-bold text-olive-700">
                    {t("services.modal.specialized")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedService(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
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
                  className="flex-1 bg-olive-600 text-white py-3 rounded-lg font-semibold hover:bg-olive-700 transition-all"
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
