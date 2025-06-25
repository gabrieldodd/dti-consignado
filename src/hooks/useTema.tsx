// src/hooks/useTema.ts
import { useMemo } from 'react';
import { TemaConfig } from '../types/Common';

/**
 * Hook customizado para configuração do tema
 */
export const useTema = (temaEscuro: boolean): TemaConfig => {
  return useMemo(() => ({
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: temaEscuro 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900',
    menuAtivo: temaEscuro 
      ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300' 
      : 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
  }), [temaEscuro]);
};