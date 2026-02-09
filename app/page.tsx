'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-light"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-olive-400 rounded-full mix-blend-multiply filter blur-xl animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-olive-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-olive-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInDown">
            <span className="text-olive-800">{t('home.hero.title').split('ReleviHealing')[0]}</span>
            <span className="text-gradient">ReleviHealing</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scaleIn" style={{ animationDelay: '400ms' }}>
            <Link
              href="/services"
              className="bg-olive-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t('home.hero.exploreServices')}
            </Link>
            <Link
              href="/team"
              className="bg-white text-olive-600 border-2 border-olive-600 px-8 py-4 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300 hover:scale-105"
            >
              {t('home.hero.meetTeam')}
            </Link>
            <Link
              href="/events"
              className="bg-white text-olive-600 border-2 border-olive-600 px-8 py-4 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300 hover:scale-105"
            >
              {t('home.hero.viewEvents')}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-olive-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      <section className="py-24 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-6">
                {t('home.whyChoose.title')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      {t('home.whyChoose.expertTherapists.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('home.whyChoose.expertTherapists.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      {t('home.whyChoose.tranquilEnvironment.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('home.whyChoose.tranquilEnvironment.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      {t('home.whyChoose.premiumProducts.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('home.whyChoose.premiumProducts.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal relative" style={{ animationDelay: '200ms' }}>
              <div className="aspect-square bg-olive-200 rounded-3xl flex items-center justify-center animate-pulse-slow">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-olive-600 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-olive-800 text-lg font-medium">
                    {t('home.whyChoose.peacefulEnvironment')}
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-olive-400 rounded-2xl -z-10 animate-float" />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-4">
              {t('home.contact.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="reveal bg-olive-50 rounded-3xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-olive-800 mb-6">
                {t('home.contact.contactInfo')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{t('home.contact.address')}</p>
                    <p className="text-gray-600">{t('home.contact.addressValue')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{t('home.contact.phone')}</p>
                    <p className="text-gray-600">{t('home.contact.phoneValue')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{t('home.contact.email')}</p>
                    <p className="text-gray-600">info@revelihealing.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{t('home.contact.hours')}</p>
                    <p className="text-gray-600">{t('home.contact.hoursValue')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal" style={{ animationDelay: '200ms' }}>
              <form className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-olive-100">
                <h3 className="text-2xl font-bold text-olive-800 mb-6">
                  {t('home.contact.bookAppointment')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('home.contact.name')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                      placeholder={t('home.contact.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('home.contact.email')}
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                      placeholder={t('home.contact.emailPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('home.contact.message')}
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all resize-none"
                      placeholder={t('home.contact.messagePlaceholder')}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-olive-600 text-white py-4 rounded-lg font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02] shadow-lg"
                  >
                    {t('home.contact.sendMessage')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
