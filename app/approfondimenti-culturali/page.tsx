"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface PDFFile {
  id: number;
  filename: string;
  key: string;
  category: string;
}

interface CulturalLesson {
  id: number;
  key: string;
  pdfUrl: string;
  category: string;
}

export default function CulturalInsightsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [lessons, setLessons] = useState<CulturalLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch PDFs from the API
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const response = await fetch("/api/pdfs");
        if (!response.ok) throw new Error("Failed to fetch PDFs");

        const pdfFiles: PDFFile[] = await response.json();

        // Transform PDF files to lessons
        const transformedLessons: CulturalLesson[] = pdfFiles.map((pdf) => ({
          id: pdf.id,
          key: pdf.key,
          pdfUrl: `/pdfs/${pdf.filename}`,
          category: pdf.category,
        }));

        setLessons(transformedLessons);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, []);

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
    elements.forEach((el) => {
      el.classList.remove("animate-fadeInUp");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [lessons, filter]);

  const categories = [
    "all",
    "philosophy",
    "history",
    "wellness",
    "spirituality",
  ];

  const filteredLessons =
    filter === "all"
      ? lessons
      : lessons.filter((lesson) => lesson.category === filter);

  return (
    <div className="bg-white min-h-screen pt-24">
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              {t("culturalInsights.hero.title")
                .split(" ")
                .slice(0, -1)
                .join(" ")}{" "}
              <span className="text-gradient">
                {t("culturalInsights.hero.title").split(" ").slice(-1)}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("culturalInsights.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  filter === category
                    ? "bg-olive-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-olive-100"
                }`}
              >
                {t(`culturalInsights.filters.${category}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-olive-200 border-t-olive-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600">
                {t("culturalInsights.loading") || "Loading lessons..."}
              </p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-olive-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-olive-800 mb-4">
                {t("culturalInsights.noLessons.title")}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {t("culturalInsights.noLessons.description")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="reveal bg-white rounded-3xl overflow-hidden shadow-lg hover-lift transition-all duration-300 group border border-olive-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-48 bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center group-hover:from-olive-200 group-hover:to-olive-300 transition-all duration-300">
                    <svg
                      className="w-20 h-20 text-olive-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="p-6">
                    <div className="inline-block px-3 py-1 bg-olive-100 text-olive-700 rounded-full text-sm font-medium mb-3">
                      {t(`culturalInsights.categories.${lesson.category}`)}
                    </div>
                    <h3 className="text-xl font-bold text-olive-800 mb-3">
                      {t(`culturalInsights.lessons.${lesson.key}.title`) ===
                      `culturalInsights.lessons.${lesson.key}.title`
                        ? lesson.key.replace(/([A-Z])/g, " $1").trim()
                        : t(`culturalInsights.lessons.${lesson.key}.title`)}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(
                        `culturalInsights.lessons.${lesson.key}.description`,
                      ) === `culturalInsights.lessons.${lesson.key}.description`
                        ? "PDF lesson content"
                        : t(
                            `culturalInsights.lessons.${lesson.key}.description`,
                          )}
                    </p>
                    <a
                      href={lesson.pdfUrl}
                      download
                      className="flex items-center justify-center gap-2 w-full bg-olive-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-olive-700 transition-all duration-300"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {t("culturalInsights.downloadPdf")}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-olive-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="reveal">
            <h2 className="text-3xl font-bold text-olive-800 mb-6">
              {t("culturalInsights.cta.title")}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t("culturalInsights.cta.subtitle")}
            </p>
            <Link
              href="/#contact"
              className="inline-block bg-olive-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-olive-700 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {t("culturalInsights.cta.button")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
