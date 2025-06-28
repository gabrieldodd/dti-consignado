// src/hooks/useFormatters.ts
import { useCallback } from 'react';

export const useFormatters = () => {
  const formatarTelefone = useCallback((valor: string) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  }, []);

  const formatarCPF = useCallback((valor: string) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9, 11)}`;
  }, []);

  const formatarCNPJ = useCallback((valor: string) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
    if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
    if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
    return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12, 14)}`;
  }, []);

  const formatarMoedaBR = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  const formatarData = useCallback((data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  }, []);

  const formatarNumero = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR').format(valor);
  }, []);

  return {
    formatarTelefone,
    formatarCPF,
    formatarCNPJ,
    formatarMoedaBR,
    formatarData,
    formatarNumero
  };
};