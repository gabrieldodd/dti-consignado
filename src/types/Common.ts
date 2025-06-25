// src/types/Common.ts

// Tipos comuns utilizados em todo o sistema
export type Status = 'Ativo' | 'Inativo';

export type TipoDocumento = 'cpf' | 'cnpj';

export type StatusConsignacao = 'ativa' | 'finalizada' | 'cancelada';

export type TipoMensagem = 'success' | 'error';

// Interface para mensagens do sistema
export interface Mensagem {
  tipo: TipoMensagem;
  texto: string;
}

// Interface para cores das categorias
export interface CorCategoria {
  valor: string;
  nome: string;
  classe: string;
}

// Interface para erros de formulário
export interface FormErrors {
  [key: string]: string;
}

// Interface para contexto de tema
export interface TemaContextType {
  temaEscuro: boolean;
  setTemaEscuro: (tema: boolean) => void;
  tema: TemaConfig;
}

// Configuração do tema
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
  deleteCookie: (name: string) => void;
}

// Interface para validadores
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Interface para filtros de busca
export interface FiltrosBusca {
  texto: string;
  status: string;
  categoria?: string;
}

// Interface para estatísticas do dashboard
export interface EstatisticasDashboard {
  vendedoresAtivos: number;
  produtosAtivos: number;
  produtosEstoqueBaixo: number;
  valorTotalEstoque: number;
  categoriasAtivas: number;
  itensEstoque: number;
  consignacaoesAtivas: number;
  valorConsignacaoesAtivas: number;
  quantidadeTotalConsignada: number;
}

// Interface para preferências do usuário
export interface PreferenciasUsuario {
  tema: string;
  ultimoLogin?: string;
  filtroConsignacoes: string;
  filtroProdutos: string;
  filtroVendedores: string;
}

// Tipo para identificação de usuário
export type TipoUsuario = 'admin' | 'vendedor' | null;