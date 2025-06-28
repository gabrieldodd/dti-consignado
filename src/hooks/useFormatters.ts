// src/hooks/useFormatters.ts
import { useCallback } from 'react';

export const useFormatters = () => {
  // Formatar telefone no padrão brasileiro
  const formatarTelefone = useCallback((valor: string): string => {
    const numeros = valor.replace(/\D/g, '');
    
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  }, []);

  // Formatar CPF
  const formatarCPF = useCallback((valor: string): string => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }, []);

  // Formatar CNPJ
  const formatarCNPJ = useCallback((valor: string): string => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }, []);

  // Formatar moeda brasileira
  const formatarMoedaBR = useCallback((valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  // Formatar data brasileira
  const formatarData = useCallback((data: string): string => {
    return new Date(data).toLocaleDateString('pt-BR');
  }, []);

  // Formatar número
  const formatarNumero = useCallback((valor: number): string => {
    return new Intl.NumberFormat('pt-BR').format(valor);
  }, []);

  // Formatar entrada de moeda (para inputs)
  const formatarMoedaInput = useCallback((valor: string): string => {
    const numero = valor.replace(/\D/g, '');
    const valorDecimal = (parseInt(numero) || 0) / 100;
    return valorDecimal.toFixed(2).replace('.', ',');
  }, []);

  return {
    formatarTelefone,
    formatarCPF,
    formatarCNPJ,
    formatarMoedaBR,
    formatarData,
    formatarNumero,
    formatarMoedaInput
  };
};