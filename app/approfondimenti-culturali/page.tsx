"use client";

import Link from "next/link";
import { useEffect, useState, MouseEvent } from "react";
import Image from "next/image";
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

interface CulturalShowcase {
  id: string;
  key: string;
  cover: string;
  images: string[];
  youtubeUrl?: string;
}

interface CulturalImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

function CulturalImageCarousel({
  images,
  alt,
  className = "",
}: CulturalImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  useEffect(() => {
    images.forEach((src) => {
      const preloadedImage = new window.Image();
      preloadedImage.src = src;
    });
  }, [images]);

  if (images.length <= 1) {
    return (
      <div className={`relative w-full h-full bg-olive-50 ${className}`}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain object-center"
          priority
        />
      </div>
    );
  }

  const previousImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className={`relative w-full h-full bg-olive-50 ${className}`}>
      <div className="w-full h-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${(currentIndex * 100) / images.length}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={image}
              className="relative h-full"
              style={{ width: `${100 / images.length}%` }}
            >
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain object-center"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={previousImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        aria-label="Next image"
      >
        ›
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentIndex === index ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function CulturalInsightsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [lessons, setLessons] = useState<CulturalLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShowcase, setSelectedShowcase] =
    useState<CulturalShowcase | null>(null);
  const { t } = useTranslation();

  const showcases: CulturalShowcase[] = [
    {
      id: "terziani",
      key: "terziani",
      cover: "/images/cultural/terziani/laVitaCover.jpeg",
      images: [
        "/images/cultural/terziani/laVitaCover.jpeg",
        "/images/cultural/terziani/incontroTerziani-1.jpeg",
        "/images/cultural/terziani/incontroTerziani-2.jpeg",
        "/images/cultural/terziani/incontroTerziani-3.jpeg",
      ],
    },
    {
      id: "zanatta",
      key: "zanatta",
      cover: "/images/cultural/zanatta/teLoPromettoCover.jpeg",
      images: [
        "/images/cultural/zanatta/teLoPromettoCover.jpeg",
        "/images/cultural/zanatta/incontroZanatta-1.jpeg",
        "/images/cultural/zanatta/incontroZanatta-2.jpeg",
      ],
    },
    {
      id: "medicinaIntegrata",
      key: "medicinaIntegrata",
      cover: `https://img.youtube.com/vi/tBEKG_focMw/hqdefault.jpg`,
      images: [],
      youtubeUrl: "https://www.youtube.com/watch?v=tBEKG_focMw",
    },
  ];

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
            <div>
              <div className="reveal text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-4">
                  {t("culturalInsights.showcases.title")}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {t("culturalInsights.showcases.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {showcases.map((showcase, index) => (
                  <div
                    key={showcase.id}
                    className="reveal bg-white rounded-3xl overflow-hidden shadow-xl hover-lift transition-all duration-300 border border-olive-100 cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => {
                      if (showcase.youtubeUrl) {
                        window.open(showcase.youtubeUrl, "_blank", "noopener,noreferrer");
                      } else {
                        setSelectedShowcase(showcase);
                      }
                    }}
                  >
                    <div className="relative w-full h-64 overflow-hidden bg-olive-100">
                      <img
                        src={showcase.cover}
                        alt={t(
                          `culturalInsights.showcases.${showcase.key}.title`,
                        )}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {showcase.youtubeUrl ? (
                            <svg
                              className="w-16 h-16 text-white drop-shadow-lg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-12 h-12 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-olive-800 mb-3">
                        {t(`culturalInsights.showcases.${showcase.key}.title`)}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {t(
                          `culturalInsights.showcases.${showcase.key}.description`,
                        )}
                      </p>
                      {showcase.youtubeUrl ? (
                        <span className="mt-6 inline-flex items-center gap-2 text-red-600 font-semibold group-hover:text-red-700 transition-colors">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
                          </svg>
                          {t("culturalInsights.showcases.watchOnYouTube") || "Guarda su YouTube"} →
                        </span>
                      ) : (
                        <button className="mt-6 inline-block text-olive-600 font-semibold hover:text-olive-700 transition-colors">
                          Scopri di Più →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

      {selectedShowcase && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedShowcase(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-shrink-0">
              <div className="relative w-full h-80 overflow-hidden bg-olive-100">
                <CulturalImageCarousel
                  images={selectedShowcase.images}
                  alt={t(
                    `culturalInsights.showcases.${selectedShowcase.key}.title`,
                  )}
                />
              </div>
              <button
                onClick={() => setSelectedShowcase(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-olive-700 transition-colors shadow-lg z-10"
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
            <div className="overflow-y-auto flex-1 p-8">
              <h2 className="text-2xl font-bold text-olive-800 mb-3">
                {t(`culturalInsights.showcases.${selectedShowcase.key}.title`)}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  `culturalInsights.showcases.${selectedShowcase.key}.description`,
                )}
              </p>
            </div>
          </div>
        </div>
      )}

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
