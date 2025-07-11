// src/hooks/useTema.ts
import { useMemo } from 'react';
import { TemaConfig, Tema } from '../types/Common';

/**
 * Hook customizado para configuração do tema
 */
export const useTema = (temaEscuro: boolean): TemaConfig => {
  return useMemo(() => ({
    escuro: temaEscuro,
    cores: {
      background: temaEscuro ? '#111827' : '#f3f4f6',
      surface: temaEscuro ? '#1f2937' : '#ffffff',
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#10b981',
      text: temaEscuro ? '#ffffff' : '#111827',
      textSecondary: temaEscuro ? '#d1d5db' : '#6b7280',
      border: temaEscuro ? '#374151' : '#e5e7eb',
      hover: temaEscuro ? '#374151' : '#f9fafb',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      menuAtivo: temaEscuro ? '#374151' : '#dbeafe',
      // Compatibilidade com nomes antigos
      fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
      papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
      texto: temaEscuro ? 'text-white' : 'text-gray-900',
      textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
      borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
      input: temaEscuro 
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
        : 'bg-white border-gray-300 text-gray-900'
    }
  }), [temaEscuro]);
};