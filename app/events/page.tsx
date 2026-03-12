"use client";

import { MouseEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  EVENTS,
  EventData as Event,
  EventDetail,
  isEventPassed,
  getEventTypeColor,
  mergeEventDetails,
} from "../lib/eventsData";

interface EventImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

function EventImageCarousel({
  images,
  alt,
  className = "",
}: EventImageCarouselProps) {
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

export default function EventsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { t, i18n } = useTranslation();

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
  }, [filter]);

  const events: Event[] = EVENTS;

  const filteredEvents =
    filter === "all" ? events : events.filter((event) => event.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === "it" ? "it-IT" : "en-US";

    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getEventDetails = (key: string): EventDetail => {
    return mergeEventDetails(
      key,
      t(`events.eventDetails.${key}`, {
        returnObjects: true,
      }),
    );
  };

  const upcomingEvents = filteredEvents.filter((event) => {
    const details = getEventDetails(event.key);
    return !isEventPassed(details);
  });

  const passedEvents = filteredEvents.filter((event) => {
    const details = getEventDetails(event.key);
    return isEventPassed(details);
  });

  const filterTypes = ["all", "workshop", "retreat", "special", "class"];

  return (
    <div className="bg-white min-h-screen pt-24">
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              {
                t("events.hero.title").split(
                  t("events.hero.title").includes("Events")
                    ? "Events"
                    : "Eventi",
                )[0]
              }
              <span className="text-gradient">
                {t("events.hero.title").includes("Events")
                  ? "Events"
                  : "Eventi"}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("events.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 reveal">
            {filterTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  filter === type
                    ? "bg-olive-600 text-white shadow-lg"
                    : "bg-olive-50 text-olive-700 hover:bg-olive-100"
                }`}
              >
                {t(`events.filters.${type}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {upcomingEvents.length > 0 && (
            <div className="mb-16">
              <div className="mb-8 reveal">
                <h2 className="text-4xl font-bold text-olive-800 mb-2">
                  {t("events.upcomingEvents.title")}
                </h2>
                <p className="text-lg text-gray-600">
                  {t("events.upcomingEvents.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event, index) => {
                  const details = getEventDetails(event.key);
                  return (
                    <div
                      key={event.id}
                      className="reveal bg-white rounded-3xl overflow-hidden shadow-lg hover-lift transition-all duration-300 border border-olive-100 flex flex-col"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <>
                        <div
                          className={`w-full overflow-hidden relative ${
                            event.image
                              ? "h-20"
                              : event.images || event.video
                                ? "h-28"
                                : "h-20"
                          }`}
                        >
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={t(`events.eventList.${event.key}.title`)}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : event.video ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                <svg
                                  className="w-7 h-7 text-white ml-1"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          ) : event.images && event.images.length > 0 ? (
                            <EventImageCarousel
                              images={event.images}
                              alt={t(`events.eventList.${event.key}.title`)}
                            />
                          ) : null}
                        </div>
                        <div className="p-8 grow">
                          <div className="flex items-center justify-between mb-4">
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}
                            >
                              {t(`events.filters.${event.type}`)}
                            </span>
                            <span className="text-olive-600 font-bold">
                              {t(`events.eventList.${event.key}.price`)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-olive-800 mb-3">
                            {t(`events.eventList.${event.key}.title`)}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 shrink-0"
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
                              <span>
                                {details.dateDisplay ??
                                  formatDate(details.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>
                                {details.time} - {details.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 shrink-0"
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
                              <span>{details.location}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {t(`events.eventList.${event.key}.description`)}
                          </p>
                          {details.spots > 0 && (
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="text-sm">
                                <span className="text-gray-500">
                                  {t("events.spotsAvailable")}:{" "}
                                </span>
                                <span
                                  className={`font-semibold ${details.spotsLeft <= 3 ? "text-red-500" : "text-olive-600"}`}
                                >
                                  {details.spotsLeft}/{details.spots}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-6 pt-0">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="w-full bg-olive-600 text-white py-3 rounded-xl font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02]"
                          >
                            {t("events.learnMore")}
                          </button>
                        </div>
                      </>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {passedEvents.length > 0 && (
            <div className="mt-16 pt-16 border-t border-olive-100">
              <div className="mb-8 reveal">
                <h2 className="text-4xl font-bold text-olive-800 mb-2">
                  {t("events.passedEvents.title")}
                </h2>
                <p className="text-lg text-gray-600">
                  {t("events.passedEvents.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {passedEvents.map((event, index) => {
                  const details = getEventDetails(event.key);
                  return (
                    <div
                      key={event.id}
                      className="reveal bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300 border border-olive-100 flex flex-col opacity-60"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <>
                        <div
                          className={`w-full overflow-hidden relative ${
                            event.image
                              ? "h-20"
                              : event.images || event.video
                                ? "h-28"
                                : "h-20"
                          }`}
                        >
                          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {t("events.eventPassed")}
                            </span>
                          </div>
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={t(`events.eventList.${event.key}.title`)}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : event.video ? (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                <svg
                                  className="w-7 h-7 text-white ml-1"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          ) : event.images && event.images.length > 0 ? (
                            <EventImageCarousel
                              images={event.images}
                              alt={t(`events.eventList.${event.key}.title`)}
                            />
                          ) : null}
                        </div>
                        <div className="p-8 grow">
                          <div className="flex items-center justify-between mb-4">
                            <span
                              className={`px-4 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}
                            >
                              {t(`events.filters.${event.type}`)}
                            </span>
                            <span className="text-olive-600 font-bold">
                              {t(`events.eventList.${event.key}.price`)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-olive-800 mb-3">
                            {t(`events.eventList.${event.key}.title`)}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 shrink-0"
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
                              <span>
                                {details.dateDisplay ??
                                  formatDate(details.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>
                                {details.time} - {details.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 shrink-0"
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
                              <span>{details.location}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {t(`events.eventList.${event.key}.description`)}
                          </p>
                        </div>
                        <div className="p-6 pt-0">
                          <button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                          >
                            {t("events.eventPassed")}
                          </button>
                        </div>
                      </>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingEvents.length === 0 && passedEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-olive-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-olive-600"
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
              </div>
              <h3 className="text-2xl font-bold text-olive-800 mb-2">
                {t("events.noEvents.title")}
              </h3>
              <p className="text-gray-600">{t("events.noEvents.subtitle")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <h2 className="text-4xl font-bold text-olive-800 mb-6">
                {t("events.hostEvent.title")}
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t("events.hostEvent.subtitle")}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
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
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800">
                      {t("events.hostEvent.privateParties.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("events.hostEvent.privateParties.description")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800">
                      {t("events.hostEvent.corporateEvents.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("events.hostEvent.corporateEvents.description")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800">
                      {t("events.hostEvent.specialOccasions.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("events.hostEvent.specialOccasions.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="reveal bg-white rounded-3xl p-8 md:p-12 shadow-xl"
              style={{ animationDelay: "200ms" }}
            >
              <h3 className="text-2xl font-bold text-olive-800 mb-6">
                {t("events.hostEvent.requestInfo")}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("events.hostEvent.name")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                    placeholder={t("events.hostEvent.namePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("events.hostEvent.email")}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                    placeholder={t("events.hostEvent.emailPlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("events.hostEvent.eventType")}
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all">
                    <option>
                      {t("events.hostEvent.eventTypes.privateParty")}
                    </option>
                    <option>
                      {t("events.hostEvent.eventTypes.corporateEvent")}
                    </option>
                    <option>
                      {t("events.hostEvent.eventTypes.specialOccasion")}
                    </option>
                    <option>{t("events.hostEvent.eventTypes.other")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("events.hostEvent.message")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all resize-none"
                    placeholder={t("events.hostEvent.messagePlaceholder")}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-olive-600 text-white py-4 rounded-lg font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02] shadow-lg"
                >
                  {t("events.hostEvent.sendRequest")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <>
              <div className="relative">
                {selectedEvent.video ? (
                  <div className="relative bg-black">
                    <video
                      controls
                      src={selectedEvent.video}
                      className="w-full max-h-64 md:max-h-80 object-contain"
                    >
                      <source src={selectedEvent.video} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <div className="relative w-full h-36 overflow-hidden bg-olive-100">
                    <img
                      src={selectedEvent.image}
                      alt={t(`events.eventList.${selectedEvent.key}.title`)}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </div>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                    selectedEvent.video
                      ? "bg-black/60 text-white hover:bg-black/80"
                      : "bg-white text-gray-600 hover:text-olive-700"
                  }`}
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
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-medium ${getEventTypeColor(
                      selectedEvent.type,
                    )}`}
                  >
                    {t(`events.filters.${selectedEvent.type}`)}
                  </span>
                  <span className="text-2xl font-bold text-olive-600">
                    {t(`events.eventList.${selectedEvent.key}.price`)}
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-olive-800 mb-4">
                  {t(`events.eventList.${selectedEvent.key}.title`)}
                </h2>

                {(() => {
                  const details = getEventDetails(selectedEvent.key);
                  const isPassed = isEventPassed(details);
                  return (
                    <>
                      {isPassed && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-red-700 font-semibold">
                            {t("events.modal.eventHasPassed")}
                          </p>
                        </div>
                      )}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-gray-700">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium">
                            {formatDate(details.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {details.time} - {details.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{details.location}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-olive-800 mb-2">
                          {t("events.modal.description")}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t(
                            `events.eventList.${selectedEvent.key}.description`,
                          )}
                        </p>
                      </div>

                      {selectedEvent.images &&
                        selectedEvent.images.length > 1 && (
                          <div className="mb-6">
                            <div className="w-full h-[22rem] md:h-[26rem] lg:h-[28rem] rounded-2xl overflow-hidden bg-olive-50">
                              <EventImageCarousel
                                images={selectedEvent.images}
                                alt={t(
                                  `events.eventList.${selectedEvent.key}.title`,
                                )}
                              />
                            </div>
                          </div>
                        )}

                      {Array.isArray(
                        t(`events.eventList.${selectedEvent.key}.programme`, {
                          returnObjects: true,
                        }),
                      ) && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-olive-800 mb-2">
                            {t("events.modal.programme")}
                          </h3>
                          <ul className="space-y-2 text-gray-600">
                            {(
                              t(
                                `events.eventList.${selectedEvent.key}.programme`,
                                { returnObjects: true },
                              ) as string[]
                            ).map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-olive-600 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(
                        t(`events.eventList.${selectedEvent.key}.cost`, {
                          returnObjects: true,
                        }),
                      ) && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-olive-800 mb-2">
                            {t("events.modal.cost")}
                          </h3>
                          <ul className="space-y-1 text-gray-600">
                            {(
                              t(`events.eventList.${selectedEvent.key}.cost`, {
                                returnObjects: true,
                              }) as string[]
                            ).map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-olive-600 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {t(
                        `events.eventList.${selectedEvent.key}.reservations`,
                      ) && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-olive-800 mb-2">
                            {t("events.modal.reservations")}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {t(
                              `events.eventList.${selectedEvent.key}.reservations`,
                            )}
                          </p>
                        </div>
                      )}

                      <div
                        className={`flex items-center pt-6 border-t border-gray-200 ${
                          details.spots > 0 ? "justify-between" : "justify-end"
                        }`}
                      >
                        {details.spots > 0 && (
                          <div>
                            <p className="text-gray-500">
                              {t("events.modal.availableSpots")}
                            </p>
                            <p
                              className={`text-lg font-semibold ${
                                details.spotsLeft <= 3
                                  ? "text-red-500"
                                  : "text-olive-600"
                              }`}
                            >
                              {details.spotsLeft} {t("events.modal.remaining")}{" "}
                              {details.spots}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <button
                            onClick={() => setSelectedEvent(null)}
                            className="px-6 py-3 border-2 border-olive-600 text-olive-600 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300"
                          >
                            {t("events.modal.close")}
                          </button>
                          <button
                            onClick={() =>
                              window.open(
                                "https://api.whatsapp.com/message/PIEXHXZ5H3RRJ1?autoload=1&app_absent=0",
                                "_blank",
                              )
                            }
                            disabled={isPassed}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                              isPassed
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-olive-600 text-white hover:bg-olive-700"
                            }`}
                          >
                            {t("events.modal.registerNow")}
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
}
