// src/types/Common.ts

// Tipos básicos
export type TipoMensagem = 'success' | 'error';
export type TipoUsuario = 'admin' | 'vendedor' | null;
export type TipoDocumento = 'cpf' | 'cnpj';
export type StatusConsignacao = 'ativa' | 'finalizada' | 'cancelada';

// Interface para configuração do tema
export interface TemaConfig {
  fundo: string;
  papel: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  hover: string;
  input: string;
  menuAtivo: string;
}

// Interface para gerenciamento de cookies
export interface CookieManager {
  getCookie: (name: string) => string | null;
  setCookie: (name: string, value: string, days?: number) => void;
  deleteCookie: (name: string) => void;  // ← ADICIONAR ESTA LINHA
}

// Interface para cores das categorias
export interface CorCategoria {
  valor: string;
  nome: string;
  classe: string;
}