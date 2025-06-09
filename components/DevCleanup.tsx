'use client';

import { useEffect } from 'react';
import { useCleanExtraAttributes } from '@/utils/suppressWarnings';

/**
 * Componente para limpeza automática de atributos extras durante desenvolvimento
 * Remove atributos como data-gptw que são adicionados por extensões do browser
 */
export default function DevCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const cleanup = useCleanExtraAttributes();
      return cleanup;
    }
  }, []);

  // Este componente não renderiza nada
  return null;
} 