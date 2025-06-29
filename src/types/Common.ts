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
  deleteCookie: (name: string) => void;
}

// Interface para cores das categorias
export interface CorCategoria {
  valor: string;
  nome: string;
  classe: string;
}

// Interface para preferências do usuário
export interface PreferenciasUsuario {
  tema: 'claro' | 'escuro';
  idioma: string;
  notificacoes: boolean;
  autoSave: boolean;
  ultimoLogin?: string;
  ultimaAtividade?: string;
}

// Interface para dados de sessão
export interface DadosSessao {
  usuarioId: number;
  tipoUsuario: TipoUsuario;
  timestampLogin: string;
  ultimaAtividade: string;
  expiresAt: string;
}

// Constantes para cookies
export const COOKIE_NAMES = {
  TEMA: 'sistema_tema',
  USUARIO_ID: 'sistema_usuario_id',
  TIPO_USUARIO: 'sistema_tipo_usuario',
  TIMESTAMP_LOGIN: 'sistema_timestamp_login',
  ULTIMA_ATIVIDADE: 'sistema_ultima_atividade',
  PREFERENCIAS_LOGIN: 'preferencias_login',
  PREFERENCIAS_SENHA: 'preferencias_senha',
  PREFERENCIAS_LEMBRAR: 'preferencias_lembrar',
  PREFERENCIAS_AUTO_LOGIN: 'preferencias_auto_login',
  PREFERENCIAS_ULTIMO_LOGIN: 'preferencias_ultimo_login'
} as const;

// Constantes para durações de cookies (em dias)
export const COOKIE_DURATIONS = {
  TEMA: 365,           // 1 ano
  SESSAO: 7,           // 1 semana
  LEMBRAR_LOGIN: 30,   // 1 mês
  TEMPORARIO: 1        // 1 dia
} as const;

// Interface para estatísticas do sistema
export interface EstatisticasSistema {
  totalVendedores: number;
  vendedoresAtivos: number;
  totalProdutos: number;
  produtosAtivos: number;
  totalConsignacoes: number;
  consignacoesAtivas: number;
  valorTotalEstoque: number;
  valorConsignacoesAtivas: number;
}

// Interface para filtros genéricos
export interface FiltrosGenericos {
  busca?: string;
  status?: string;
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
  ordenacao?: 'asc' | 'desc';
  ordenarPor?: string;
  limite?: number;
  pagina?: number;
}

// Interface para resposta de API (futuro)
export interface RespostaAPI<T = any> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  mensagem?: string;
  timestamp: string;
  versao: string;
}

// Enum para níveis de log
export enum NivelLog {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface para logs do sistema
export interface LogSistema {
  id: string;
  nivel: NivelLog;
  mensagem: string;
  contexto?: Record<string, any>;
  timestamp: string;
  usuarioId?: number;
  ip?: string;
  userAgent?: string;
}

// Interface para configurações do sistema
export interface ConfiguracoesSistema {
  nome: string;
  versao: string;
  ambiente: 'desenvolvimento' | 'homologacao' | 'producao';
  debug: boolean;
  apiUrl?: string;
  timeoutSessao: number; // em minutos
  maxTentativasLogin: number;
  habilitarLogs: boolean;
  habilitarCookies: boolean;
}

// Constantes de validação
export const VALIDACAO = {
  MIN_CARACTERES_SENHA: 6,
  MAX_CARACTERES_NOME: 100,
  MAX_CARACTERES_EMAIL: 255,
  MAX_CARACTERES_TELEFONE: 20,
  MAX_CARACTERES_LOGIN: 50,
  REGEX_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  REGEX_TELEFONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  REGEX_CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  REGEX_CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
} as const;

// Cores padrão para categorias
export const CORES_CATEGORIAS: CorCategoria[] = [
  { valor: 'blue', nome: 'Azul', classe: 'bg-blue-100 text-blue-800 border-blue-200' },
  { valor: 'green', nome: 'Verde', classe: 'bg-green-100 text-green-800 border-green-200' },
  { valor: 'yellow', nome: 'Amarelo', classe: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { valor: 'red', nome: 'Vermelho', classe: 'bg-red-100 text-red-800 border-red-200' },
  { valor: 'purple', nome: 'Roxo', classe: 'bg-purple-100 text-purple-800 border-purple-200' },
  { valor: 'indigo', nome: 'Índigo', classe: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { valor: 'pink', nome: 'Rosa', classe: 'bg-pink-100 text-pink-800 border-pink-200' },
  { valor: 'gray', nome: 'Cinza', classe: 'bg-gray-100 text-gray-800 border-gray-200' }
];

// Mensagens padrão do sistema
export const MENSAGENS_SISTEMA = {
  LOGIN_SUCESSO: 'Login realizado com sucesso!',
  LOGIN_ERRO: 'Login ou senha inválidos!',
  LOGOUT_SUCESSO: 'Logout realizado com sucesso!',
  SALVAR_SUCESSO: 'Dados salvos com sucesso!',
  SALVAR_ERRO: 'Erro ao salvar dados!',
  EXCLUIR_SUCESSO: 'Item excluído com sucesso!',
  EXCLUIR_ERRO: 'Erro ao excluir item!',
  CARREGAR_ERRO: 'Erro ao carregar dados!',
  SESSAO_EXPIRADA: 'Sessão expirada. Faça login novamente.',
  ACESSO_NEGADO: 'Acesso negado. Você não tem permissão para esta ação.',
  DADOS_INVALIDOS: 'Dados inválidos. Verifique os campos e tente novamente.',
  CONEXAO_ERRO: 'Erro de conexão. Verifique sua internet e tente novamente.'
} as const;