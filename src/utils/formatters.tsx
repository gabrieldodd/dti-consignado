// src/utils/formatters.ts

/**
 * Formata um número de telefone no padrão brasileiro
 */
export const formatarTelefone = (valor: string): string => {
  const nums = valor.replace(/\D/g, '');
  if (nums.length <= 2) return nums;
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
};

/**
 * Formata um CPF no padrão XXX.XXX.XXX-XX
 */
export const formatarCPF = (valor: string): string => {
  const nums = valor.replace(/\D/g, '');
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9, 11)}`;
};

/**
 * Formata um CNPJ no padrão XX.XXX.XXX/XXXX-XX
 */
export const formatarCNPJ = (valor: string): string => {
  const nums = valor.replace(/\D/g, '');
  if (nums.length <= 2) return nums;
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
  if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12, 14)}`;
};

/**
 * Formata um valor monetário no padrão brasileiro
 */
export const formatarMoedaBR = (valor: number): string => {
  return valor.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};

/**
 * Formata uma data no padrão brasileiro
 */
export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

/**
 * Formata uma data e hora no padrão brasileiro
 */
export const formatarDataHora = (data: string): string => {
  return new Date(data).toLocaleString('pt-BR');
};

/**
 * Formata apenas a hora no padrão brasileiro
 */
export const formatarHora = (data: string): string => {
  return new Date(data).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Formata um documento (CPF ou CNPJ) baseado no tipo
 */
export const formatarDocumento = (valor: string, tipo: 'cpf' | 'cnpj'): string => {
  return tipo === 'cpf' ? formatarCPF(valor) : formatarCNPJ(valor);
};

/**
 * Formata um número como porcentagem
 */
export const formatarPorcentagem = (valor: number, decimais: number = 1): string => {
  return `${valor.toFixed(decimais)}%`;
};

/**
 * Remove formatação de um valor deixando apenas números
 */
export const removerFormatacao = (valor: string): string => {
  return valor.replace(/\D/g, '');
};

/**
 * Capitaliza a primeira letra de cada palavra
 */
export const capitalizarNome = (nome: string): string => {
  return nome
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
};