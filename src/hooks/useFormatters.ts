// src/hooks/useFormatters.ts
import { useCallback } from 'react';
import * as formatters from '../utils/formatters';

/**
 * Hook para funções de formatação
 */
export const useFormatters = () => {
  const formatarTelefone = useCallback((valor: string) => {
    return formatters.formatarTelefone(valor);
  }, []);

  const formatarCPF = useCallback((valor: string) => {
    return formatters.formatarCPF(valor);
  }, []);

  const formatarCNPJ = useCallback((valor: string) => {
    return formatters.formatarCNPJ(valor);
  }, []);

  const formatarMoedaBR = useCallback((valor: number) => {
    return formatters.formatarMoedaBR(valor);
  }, []);

  const formatarData = useCallback((data: string) => {
    return formatters.formatarData(data);
  }, []);

  const formatarDataHora = useCallback((data: string) => {
    return formatters.formatarDataHora(data);
  }, []);

  const formatarHora = useCallback((data: string) => {
    return formatters.formatarHora(data);
  }, []);

  const formatarDocumento = useCallback((valor: string, tipo: 'cpf' | 'cnpj') => {
    return formatters.formatarDocumento(valor, tipo);
  }, []);

  const formatarPorcentagem = useCallback((valor: number, decimais: number = 1) => {
    return formatters.formatarPorcentagem(valor, decimais);
  }, []);

  const removerFormatacao = useCallback((valor: string) => {
    return formatters.removerFormatacao(valor);
  }, []);

  const capitalizarNome = useCallback((nome: string) => {
    return formatters.capitalizarNome(nome);
  }, []);

  return {
    formatarTelefone,
    formatarCPF,
    formatarCNPJ,
    formatarMoedaBR,
    formatarData,
    formatarDataHora,
    formatarHora,
    formatarDocumento,
    formatarPorcentagem,
    removerFormatacao,
    capitalizarNome
  };
};