// src/types/Common.ts

export type TipoDocumento = 'cpf' | 'cnpj';
export type StatusConsignacao = 'ativa' | 'finalizada' | 'cancelada';
export type StatusVendedor = 'ativo' | 'inativo';
export type TipoMensagem = 'success' | 'error' | 'warning' | 'info';

export interface Tema {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  menuAtivo: string;
  // Compatibilidade com nomes antigos
  fundo?: string;
  papel?: string;
  texto?: string;
  textoSecundario?: string;
  borda?: string;
  input?: string;
}

export interface MensagemState {
  tipo: TipoMensagem;
  texto: string;
  visivel: boolean;
}

// Interfaces adicionais que estavam faltando
export interface CookieManager {
  getCookie: (name: string) => string | null;
  setCookie: (name: string, value: string, days?: number) => void;
  removeCookie: (name: string) => void;
}

export interface TemaConfig {
  escuro: boolean;
  cores: Tema;
}

export interface CorCategoria {
  valor: string;
  nome: string;
  hex: string;
  classe: string;
}