"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Collaborator {
  name: string;
  role: string;
  image: string;
  shortBio: string;
  bio: string;
}

export default function UniProPage() {
  const { t } = useTranslation();
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<Collaborator | null>(null);

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

  const collaborators = t("home.uniPro.collaborators.list", {
    returnObjects: true,
  }) as Collaborator[];

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

      {/* Collaborators */}
      <section className="py-16 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              {t("home.uniPro.collaborators.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collaborators.map((collaborator, index) => (
              <div
                key={collaborator.name}
                className="reveal bg-white rounded-3xl overflow-hidden shadow-lg hover-lift transition-all duration-300 group cursor-pointer border border-olive-100"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedCollaborator(collaborator)}
              >
                <div className="h-55 bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center group-hover:from-olive-200 group-hover:to-olive-300 transition-all duration-300">
                  <img
                    src={collaborator.image}
                    alt={collaborator.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-olive-800 mb-2">
                    {collaborator.name}
                  </h3>
                  <p className="text-olive-600 font-medium mb-4">
                    {collaborator.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {collaborator.shortBio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedCollaborator && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedCollaborator(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="h-94 bg-gradient-to-br from-olive-100 to-olive-300 flex items-center justify-center">
                <img
                  src={selectedCollaborator.image}
                  alt={selectedCollaborator.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setSelectedCollaborator(null)}
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
              <h2 className="text-3xl font-bold text-olive-800 mb-2">
                {selectedCollaborator.name}
              </h2>
              <p className="text-olive-600 text-lg mb-6">
                {selectedCollaborator.role}
              </p>

              <div className="mb-6">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedCollaborator.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
