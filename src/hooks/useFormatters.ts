// src/hooks/useFormatters.ts
import { useCallback } from 'react';

/**
 * Hook customizado para formatação de dados
 */
export const useFormatters = () => {
  // Formatar telefone brasileiro
  const formatarTelefone = useCallback((telefone: string) => {
    if (!telefone) return '';
    
    const limpo = telefone.replace(/\D/g, '');
    
    if (limpo.length <= 10) {
      return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }, []);

  // Formatar data brasileira
  const formatarData = useCallback((data: string | Date) => {
    if (!data) return '';
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR');
  }, []);

  // Formatar data e hora
  const formatarDataHora = useCallback((data: string | Date) => {
    if (!data) return '';
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleString('pt-BR');
  }, []);

  // Formatar moeda brasileira
  const formatarMoeda = useCallback((valor: number) => {
    if (typeof valor !== 'number') return 'R$ 0,00';
    
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, []);

  // Formatar porcentagem
  const formatarPorcentagem = useCallback((valor: number, casasDecimais: number = 2) => {
    if (typeof valor !== 'number') return '0%';
    
    return `${valor.toFixed(casasDecimais)}%`;
  }, []);

  // Formatar CPF
  const formatarCPF = useCallback((cpf: string) => {
    if (!cpf) return '';
    
    const limpo = cpf.replace(/\D/g, '');
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }, []);

  // Formatar CNPJ
  const formatarCNPJ = useCallback((cnpj: string) => {
    if (!cnpj) return '';
    
    const limpo = cnpj.replace(/\D/g, '');
    return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }, []);

  // Formatar documento (CPF ou CNPJ)
  const formatarDocumento = useCallback((documento: string) => {
    if (!documento) return '';
    
    const limpo = documento.replace(/\D/g, '');
    
    if (limpo.length <= 11) {
      return formatarCPF(documento);
    } else {
      return formatarCNPJ(documento);
    }
  }, [formatarCPF, formatarCNPJ]);

  // Formatar número com separadores de milhares
  const formatarNumero = useCallback((numero: number) => {
    if (typeof numero !== 'number') return '0';
    
    return numero.toLocaleString('pt-BR');
  }, []);

  // Formatar CEP
  const formatarCEP = useCallback((cep: string) => {
    if (!cep) return '';
    
    const limpo = cep.replace(/\D/g, '');
    return limpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }, []);

  // Limpar formatação (manter apenas números)
  const limparFormatacao = useCallback((texto: string) => {
    if (!texto) return '';
    return texto.replace(/\D/g, '');
  }, []);

  // Capitalizar primeira letra
  const capitalizarPrimeira = useCallback((texto: string) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }, []);

  // Capitalizar todas as palavras
  const capitalizarPalavras = useCallback((texto: string) => {
    if (!texto) return '';
    
    return texto
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }, []);

  // Truncar texto
  const truncarTexto = useCallback((texto: string, limite: number = 50) => {
    if (!texto) return '';
    
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  }, []);

  return {
    formatarTelefone,
    formatarData,
    formatarDataHora,
    formatarMoeda,
    formatarPorcentagem,
    formatarCPF,
    formatarCNPJ,
    formatarDocumento,
    formatarNumero,
    formatarCEP,
    limparFormatacao,
    capitalizarPrimeira,
    capitalizarPalavras,
    truncarTexto
  };
};