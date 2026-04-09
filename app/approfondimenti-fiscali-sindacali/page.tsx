"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface DirectionMember {
  name: string;
  role: string;
  image: string;
  shortBio: string;
  bio: string;
}

export default function ApprofondimentiFiscaliPage() {
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

  const directionMembers = t("fiscalInsights.direction.list", {
    returnObjects: true,
  }) as DirectionMember[];

  return (
    <div className="bg-white min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              {t("fiscalInsights.hero.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("fiscalInsights.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Settore Olistico */}
      <section className="py-16 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              {t("fiscalInsights.holisticSector.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("fiscalInsights.holisticSector.subtitle")}
            </p>
          </div>

          {/* Direction */}
          <div className="text-center mb-8 reveal">
            <h3 className="text-2xl font-bold text-olive-700">
              {t("fiscalInsights.direction.title")}
            </h3>
          </div>

          {directionMembers.map((member, index) => (
            <div
              key={member.name}
              className="reveal max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-olive-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-full bg-gradient-to-br from-olive-100 to-olive-200">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full object-cover"
                />
              </div>
              <div className="p-8 md:p-10 text-center">
                {/* <h3 className="text-3xl font-bold text-olive-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-olive-600 font-semibold text-lg mb-4">
                  {member.role}
                </p> */}
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
