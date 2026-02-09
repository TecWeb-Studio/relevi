'use client';

import { useSyncExternalStore } from 'react';
import i18n from '../lib/i18n';

function useI18nReady() {
  return useSyncExternalStore(
    (callback) => {
      if (i18n.isInitialized) {
        return () => {};
      }
      i18n.on('initialized', callback);
      return () => {
        i18n.off('initialized', callback);
      };
    },
    () => i18n.isInitialized,
    () => false
  );
}

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const isReady = useI18nReady();

  // Use a simpler approach - check if we're on the client
  if (typeof window === 'undefined' || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}