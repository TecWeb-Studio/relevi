"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const CAROUSEL_IMAGES = [
  "/images/carousel/i1.jpeg",
  "/images/carousel/i2.jpeg",
  "/images/carousel/i3.jpeg",
  "/images/carousel/i4.jpeg",
  "/images/carousel/i5.jpeg",
  "/images/carousel/i6.jpeg",
  "/images/carousel/i7.jpeg",
  "/images/carousel/i8.jpeg",
  "/images/carousel/carousel-01.jpeg",
  "/images/carousel/carousel-05.jpeg",
  "/images/carousel/carousel-09.jpeg",
  "/images/carousel/carousel-21.jpeg",
  "/images/carousel/carousel-30.jpeg",
  "/images/carousel/carousel-32.jpeg",
  "/images/carousel/carousel-33.jpeg",
  "/images/carousel/carousel-40.jpeg",
];

export default function ImageCarousel() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSlides = CAROUSEL_IMAGES.length;

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning],
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  // Autoplay
  useEffect(() => {
    if (isPaused || lightboxOpen) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = setInterval(nextSlide, 4500);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPaused, nextSlide, lightboxOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "Escape" && lightboxOpen) setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide, lightboxOpen]);

  // Drag / swipe handlers
  const handleDragStart = (clientX: number) => {
    setDragStart(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStart === null) return;
    const diff = clientX - dragStart;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (dragStart === null) return;
    if (Math.abs(dragOffset) > 60) {
      if (dragOffset < 0) nextSlide();
      else prevSlide();
    }
    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Compute per-slide position: -1 (left), 0 (center), 1 (right), or null (hidden)
  const getSlideOffset = (imgIndex: number): number => {
    let d = imgIndex - currentIndex;
    // Wrap to [-half, half]
    if (d > totalSlides / 2) d -= totalSlides;
    if (d < -totalSlides / 2) d += totalSlides;
    return d;
  };

  return (
    <>
      <section
        className="carousel-section relative overflow-hidden py-16 bg-olive-50"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full opacity-20 blur-[120px] transition-colors duration-2000"
            style={{
              background: `radial-gradient(circle, var(--color-olive-300), transparent 70%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 reveal">
            <h2 className="text-4xl font-bold text-olive-800 mb-3">
              {t("home.gallery.title")}
            </h2>
            <div className="w-16 h-1 bg-olive-500 mx-auto rounded-full" />
          </div>

          {/* Carousel track — all slides rendered with stable keys so CSS transitions play */}
          <div
            ref={trackRef}
            className="relative flex items-center justify-center gap-6 select-none"
            style={{ minHeight: "480px" }}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={() => {
              if (isDragging) handleDragEnd();
            }}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
          >
            {CAROUSEL_IMAGES.map((_, imgIndex) => {
              const imageSrc = CAROUSEL_IMAGES[imgIndex];
              const isContainImage = false;
              const offset = getSlideOffset(imgIndex);
              const isCurrent = offset === 0;
              const isLeft = offset === -1;
              const isRight = offset === 1;
              const isVisible = isCurrent || isLeft || isRight;

              let translateX = "0%";
              let scale = 1;
              let zIndex = 1;
              let opacity = 0;
              let rotateY = "0deg";
              let pointerEvents: "auto" | "none" = "none";

              if (isCurrent) {
                translateX = `calc(0% + ${isDragging ? dragOffset * 0.5 : 0}px)`;
                scale = 1;
                zIndex = 10;
                opacity = 1;
                rotateY = "0deg";
                pointerEvents = "auto";
              } else if (isLeft) {
                translateX = `calc(-75% + ${isDragging ? dragOffset * 0.3 : 0}px)`;
                scale = 0.78;
                zIndex = 5;
                opacity = 0.5;
                rotateY = "8deg";
                pointerEvents = "auto";
              } else if (isRight) {
                translateX = `calc(75% + ${isDragging ? dragOffset * 0.3 : 0}px)`;
                scale = 0.78;
                zIndex = 5;
                opacity = 0.5;
                rotateY = "-8deg";
                pointerEvents = "auto";
              } else {
                // Off-screen: position to the logical side so it slides in correctly
                translateX = offset < 0 ? "calc(-75%)" : "calc(75%)";
                scale = 0.78;
                zIndex = 1;
                opacity = 0;
                rotateY = offset < 0 ? "8deg" : "-8deg";
              }

              return (
                <div
                  key={imgIndex}
                  className="carousel-slide absolute"
                  style={{
                    transform: `translateX(${translateX}) scale(${scale}) perspective(1200px) rotateY(${rotateY})`,
                    zIndex,
                    opacity,
                    pointerEvents,
                    transition: isDragging
                      ? "none"
                      : "transform 0.75s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.75s cubic-bezier(0.25, 1, 0.5, 1)",
                    width: "min(720px, 75vw)",
                    visibility: isVisible ? "visible" : "hidden",
                  }}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl shadow-2xl ${
                      isCurrent
                        ? "carousel-image-active cursor-pointer"
                        : "cursor-pointer"
                    }`}
                    style={{
                      aspectRatio: "16 / 10",
                      boxShadow: isCurrent
                        ? "0 25px 60px -12px rgba(85, 97, 52, 0.35), 0 0 0 1px rgba(85, 97, 52, 0.05)"
                        : "0 10px 30px -8px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={() => {
                      if (isCurrent && !isDragging) openLightbox(imgIndex);
                      else if (isLeft) prevSlide();
                      else if (isRight) nextSlide();
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={`Gallery image ${imgIndex + 1}`}
                      className={`w-full h-full ${isContainImage ? "object-contain bg-olive-100" : "object-cover"}`}
                      style={{
                        transition: "transform 8s ease-out",
                        transform: isCurrent
                          ? isContainImage
                            ? "scale(1.01)"
                            : "scale(1.08)"
                          : "scale(1)",
                      }}
                      draggable={false}
                    />

                    {/* Subtle gradient overlay on side slides */}
                    {!isCurrent && (
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                    )}

                    {/* Shine effect on current */}
                    {isCurrent && (
                      <div className="carousel-shine absolute inset-0 pointer-events-none" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 translate-y-2 z-20 group"
            aria-label="Previous image"
          >
            <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-olive-200/50 flex items-center justify-center shadow-lg group-hover:bg-white group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-5 h-5 text-olive-700 group-hover:text-olive-900 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 translate-y-2 z-20 group"
            aria-label="Next image"
          >
            <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-olive-200/50 flex items-center justify-center shadow-lg group-hover:bg-white group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <svg
                className="w-5 h-5 text-olive-700 group-hover:text-olive-900 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          {/* Dot indicators */}
          <div className="flex justify-center items-center gap-2 mt-10">
            {CAROUSEL_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="group relative p-1"
                aria-label={`Go to image ${index + 1}`}
              >
                <div
                  className={`rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? "w-8 h-2.5 bg-olive-600"
                      : "w-2.5 h-2.5 bg-olive-300 group-hover:bg-olive-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto mt-4">
            <div className="h-0.5 bg-olive-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-olive-500 rounded-full carousel-progress"
                style={{
                  width: `${((currentIndex + 1) / totalSlides) * 100}%`,
                  transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>

          {/* Image counter */}
          <div className="text-center mt-3">
            <span className="text-sm text-olive-500 font-medium tabular-nums">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(totalSlides).padStart(2, "0")}
            </span>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fadeIn"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            onClick={() => setLightboxOpen(false)}
          >
            <svg
              className="w-6 h-6"
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

          {/* Previous */}
          <button
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex - 1 + totalSlides) % totalSlides);
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={CAROUSEL_IMAGES[lightboxIndex]}
              alt={`Gallery image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next */}
          <button
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % totalSlides);
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tabular-nums">
            {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
            {String(totalSlides).padStart(2, "0")}
          </div>
        </div>
      )}
    </>
  );
}
