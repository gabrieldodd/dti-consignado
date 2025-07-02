// src/hooks/useFormatters.ts
import { useCallback } from 'react';

export const useFormatters = () => {
  // Formatador de moeda brasileira
  const formatarMoedaBR = useCallback((valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Formatador de CPF
  const formatarCPF = useCallback((cpf: string): string => {
    // Remove tudo que não é número
    const numeros = cpf.replace(/\D/g, '');
    
    // Aplica a máscara: 000.000.000-00
    return numeros
      .slice(0, 11) // Limita a 11 dígitos
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }, []);

  // Formatador de CNPJ
  const formatarCNPJ = useCallback((cnpj: string): string => {
    // Remove tudo que não é número
    const numeros = cnpj.replace(/\D/g, '');
    
    // Aplica a máscara: 00.000.000/0000-00
    return numeros
      .slice(0, 14) // Limita a 14 dígitos
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }, []);

  // Formatador de telefone
  const formatarTelefone = useCallback((telefone: string): string => {
    // Remove tudo que não é número
    const numeros = telefone.replace(/\D/g, '');
    
    // Aplica a máscara: (00) 00000-0000 ou (00) 0000-0000
    if (numeros.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return numeros
        .slice(0, 10)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    } else {
      // Celular: (00) 00000-0000
      return numeros
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
  }, []);

  // Formatador de CEP
  const formatarCEP = useCallback((cep: string): string => {
    // Remove tudo que não é número
    const numeros = cep.replace(/\D/g, '');
    
    // Aplica a máscara: 00000-000
    return numeros
      .slice(0, 8)
      .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  }, []);

  // Formatador de data para exibição
  const formatarData = useCallback((data: string | Date): string => {
    try {
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      return dataObj.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  }, []);

  // Formatador de data e hora para exibição
  const formatarDataHora = useCallback((data: string | Date): string => {
    try {
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      return dataObj.toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  }, []);

  // Formatador de números com separador de milhares
  const formatarNumero = useCallback((numero: number): string => {
    return numero.toLocaleString('pt-BR');
  }, []);

  // Formatador de porcentagem
  const formatarPorcentagem = useCallback((valor: number, casasDecimais: number = 1): string => {
    return `${valor.toFixed(casasDecimais)}%`;
  }, []);

  // Capitalizar primeira letra de cada palavra
  const capitalizarPalavras = useCallback((texto: string): string => {
    return texto
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }, []);

  // Truncar texto com reticências
  const truncarTexto = useCallback((texto: string, limite: number = 50): string => {
    if (texto.length <= limite) return texto;
    return texto.slice(0, limite) + '...';
  }, []);

  // Remover formatação de valores monetários
  const removerFormatacaoMoeda = useCallback((valorFormatado: string): number => {
    const numero = valorFormatado
      .replace(/[R$\s]/g, '') // Remove R$ e espaços
      .replace(/\./g, '') // Remove pontos (separadores de milhares)
      .replace(',', '.'); // Substitui vírgula por ponto (decimal)
    
    return parseFloat(numero) || 0;
  }, []);

  // Remover formatação de documentos (CPF/CNPJ)
  const removerFormatacaoDocumento = useCallback((documento: string): string => {
    return documento.replace(/\D/g, '');
  }, []);

  // Remover formatação de telefone
  const removerFormatacaoTelefone = useCallback((telefone: string): string => {
    return telefone.replace(/\D/g, '');
  }, []);

  // Formatar bytes para tamanho legível
  const formatarTamanhoArquivo = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
  }, []);

  // Formatador de tempo relativo (ex: "há 2 horas")
  const formatarTempoRelativo = useCallback((data: string | Date): string => {
    try {
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      const agora = new Date();
      const diferenca = agora.getTime() - dataObj.getTime();

      const segundos = Math.floor(diferenca / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);
      const meses = Math.floor(dias / 30);
      const anos = Math.floor(dias / 365);

      if (anos > 0) return `há ${anos} ano${anos > 1 ? 's' : ''}`;
      if (meses > 0) return `há ${meses} mês${meses > 1 ? 'es' : ''}`;
      if (dias > 0) return `há ${dias} dia${dias > 1 ? 's' : ''}`;
      if (horas > 0) return `há ${horas} hora${horas > 1 ? 's' : ''}`;
      if (minutos > 0) return `há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
      return 'agora';
    } catch {
      return 'Data inválida';
    }
  }, []);

  // Formatador de código de barras (com espaçamento para legibilidade)
  const formatarCodigoBarras = useCallback((codigo: string): string => {
    // Remove espaços e caracteres especiais
    const limpo = codigo.replace(/\D/g, '');
    
    // Adiciona espaços a cada 4 dígitos para melhor legibilidade
    return limpo.replace(/(\d{4})(?=\d)/g, '$1 ');
  }, []);

  return {
    // Formatadores principais
    formatarMoedaBR,
    formatarCPF,
    formatarCNPJ,
    formatarTelefone,
    formatarCEP,
    formatarData,
    formatarDataHora,
    formatarNumero,
    formatarPorcentagem,
    
    // Formatadores de texto
    capitalizarPalavras,
    truncarTexto,
    
    // Removedores de formatação
    removerFormatacaoMoeda,
    removerFormatacaoDocumento,
    removerFormatacaoTelefone,
    
    // Formatadores especiais
    formatarTamanhoArquivo,
    formatarTempoRelativo,
    formatarCodigoBarras
  };
};