'use client';

import { useEffect, useState } from 'react';

/**
 * Hook para detectar se o componente está sendo renderizado no cliente
 * Útil para evitar problemas de hidratação
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook para detectar se estamos no browser
 */
export function useIsBrowser() {
  return typeof window !== 'undefined';
} 