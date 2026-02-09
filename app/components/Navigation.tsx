'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/services', label: t('nav.services') },
    { href: '/team', label: t('nav.team') },
    { href: '/events', label: t('nav.events') },
    { href: '/#contact', label: t('nav.contact') },
  ];

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'it', label: 'IT' },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const currentLang = i18n.language || 'en';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-olive-700 hover:text-olive-600 transition-colors duration-300 animate-fadeIn"
          >
            <span className="text-olive-600">Relevi</span>{' '}
            <span className="text-olive-800">Healing</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-olive-600 font-medium transition-all duration-300 hover:scale-105 relative group animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <div className="flex items-center space-x-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`px-3 py-1 rounded-md text-sm border transition-all duration-300 ${
                    currentLang === l.code
                      ? 'bg-olive-600 text-white border-olive-600'
                      : 'border-olive-100 bg-white hover:bg-olive-50 text-gray-700'
                  }`}
                  aria-label={`Switch to ${l.label}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-olive-700 hover:text-olive-600 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="flex flex-col space-y-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-olive-600 font-medium transition-colors duration-300 px-4 py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 px-4">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`px-3 py-2 rounded-md text-sm border transition-all duration-300 w-full ${
                    currentLang === l.code
                      ? 'bg-olive-600 text-white border-olive-600'
                      : 'border-olive-100 bg-white hover:bg-olive-50 text-gray-700'
                  }`}
                  aria-label={`Switch to ${l.label}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
