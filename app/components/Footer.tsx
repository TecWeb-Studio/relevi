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
          </div>
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

