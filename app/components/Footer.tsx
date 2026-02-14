'use client';

import Link from "next/link";
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-olive-900 text-white py-12 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="animate-slideInLeft">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-olive-300">{t('footer.brandName').split(' ')[0]}</span>{' '}
              {t('footer.brandName').split(' ')[1] || 'Touch'}
            </h3>
            <p className="text-olive-200 mb-4">
              {t('footer.tagline')}
            </p>
          </div>

          <div
            className="animate-slideInUp"
            style={{ animationDelay: "100ms" }}
          >
            <h4 className="text-lg font-semibold mb-4 text-olive-300">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  {t('nav.team')}
                </Link>
              </li>
              <li>
                <Link
                  href="/prenota"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  {t('nav.booking')}
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  {t('nav.events')}
                </Link>
              </li>
            </ul>
          </div>

          <div
            className="animate-slideInRight"
            style={{ animationDelay: "200ms" }}
          >
            <h4 className="text-lg font-semibold mb-4 text-olive-300">
              {t('footer.contactUs')}
            </h4>
            <ul className="space-y-2 text-olive-200">
              <li>{t('home.contact.addressValue')}</li>
              <li>{t('home.contact.phoneValue')}</li>
              <li>info@revelihealing.com</li>
            </ul>
            <div className="mt-4 space-y-2">
              <a
                href="https://www.instagram.com/relevihealing/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-olive-200 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 3C4.79 3 3 4.79 3 7v10c0 2.21 1.79 4 4 4h10c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H7zm10 2c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h10zm-5 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm4.75-2.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                </svg>
                Instagram
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61574114280279"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-olive-200 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13 10.5V8.75c0-.63.4-1.25 1.66-1.25H16V5h-1.75C11.7 5 10 6.57 10 8.75V10.5H8v2.5h2V19h3v-6h2.2l.8-2.5H13z" />
                </svg>
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 text-sm text-olive-200 space-y-2 text-center">
          <p>{t('footer.patronage')}</p>
          <p>{t('footer.collaboration')}</p>
        </div>

        <div className="border-t border-olive-700 mt-8 pt-8 text-center text-olive-300 animate-fadeIn">
          <p>
            &copy; {new Date().getFullYear()} Relevi Healing. {t('footer.copyright')}{" "}
            <Link
              href="https://www.tecwebstudio.it"
              className="text-olive-100 hover:text-white transition-colors duration-300"
            >
              {t('footer.tecweb')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

