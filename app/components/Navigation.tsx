'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Prevent scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/services', label: t('nav.services') },
    { href: '/team', label: t('nav.team') },
    { href: '/prenota', label: t('nav.booking') },
    { href: '/events', label: t('nav.events') },
    { href: '/approfondimenti-culturali', label: t('nav.culturalInsights') },
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
  const isLinkActive = (href: string) => {
    const baseHref = href.split('#')[0] || '/';

    if (baseHref === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(baseHref);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
        : isMobileMenuOpen
          ? 'bg-white/92 backdrop-blur-md shadow-md py-4'
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
                className={`text-gray-700 hover:text-olive-600 font-medium transition-colors duration-200 hover:scale-105 relative group animate-slideIn ${
                  isLinkActive(link.href) ? 'text-olive-700' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-olive-600 transition-all duration-200 ${
                    isLinkActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
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
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100 scale-100 mt-4 pointer-events-auto' : '-translate-y-2 opacity-0 scale-95 pointer-events-none'
            } will-change-transform bg-white/95 backdrop-blur-md absolute top-full left-0 right-0 border-t border-olive-100 shadow-lg`}
        >
          <div className="flex flex-col space-y-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-gray-700 hover:text-olive-600 font-medium transition-colors duration-200 px-4 py-2 ${
                  isLinkActive(link.href)
                    ? 'border-l-4 border-olive-600 bg-olive-50 text-olive-700'
                    : ''
                }`}
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
