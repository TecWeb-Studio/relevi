'use client';

import { useEffect, useState } from 'react';
import { initI18n } from '../lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    initI18n()
      .then(() => {
        if (mounted) {
          setIsReady(true);
        }
      })
      .catch((error) => {
        console.error('i18n initialization failed', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (typeof window === 'undefined' || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}