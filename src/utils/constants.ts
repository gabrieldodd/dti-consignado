// src/utils/constants.ts
import { CorCategoria } from '../types/Common';

// Cores disponíveis para categorias
export const CORES_DISPONIVEIS: CorCategoria[] = [
  { valor: 'blue', nome: 'Azul', classe: 'bg-blue-100 text-blue-800', hex: '#3b82f6' },
  { valor: 'green', nome: 'Verde', classe: 'bg-green-100 text-green-800', hex: '#10b981' },
  { valor: 'yellow', nome: 'Amarelo', classe: 'bg-yellow-100 text-yellow-800', hex: '#f59e0b' },
  { valor: 'purple', nome: 'Roxo', classe: 'bg-purple-100 text-purple-800', hex: '#8b5cf6' },
  { valor: 'red', nome: 'Vermelho', classe: 'bg-red-100 text-red-800', hex: '#ef4444' },
  { valor: 'pink', nome: 'Rosa', classe: 'bg-pink-100 text-pink-800', hex: '#ec4899' },
  { valor: 'indigo', nome: 'Índigo', classe: 'bg-indigo-100 text-indigo-800', hex: '#6366f1' },
  { valor: 'gray', nome: 'Cinza', classe: 'bg-gray-100 text-gray-800', hex: '#6b7280' }
];

// Configurações de cookies
export const COOKIE_CONFIG = {
  TEMA: 'tema',
  ULTIMO_LOGIN: 'ultimoLogin',
  ULTIMO_LOGIN_TEMPO: 'ultimoLoginTempo',
  ULTIMA_TELA_ATIVA: 'ultimaTelaAtiva',
  ULTIMO_TIPO_USUARIO: 'ultimoTipoUsuario',
  FILTRO_STATUS_CONSIGNACOES: 'filtroStatusConsignacoes',
  FILTRO_CATEGORIA_PRODUTOS: 'filtroCategoriasProdutos',
  FILTRO_STATUS_PRODUTOS: 'filtroStatusProdutos',
  FILTRO_STATUS_VENDEDORES: 'filtroStatusVendedores'
};

// Durações dos cookies (em dias)
export const COOKIE_DURATION = {
  TEMA: 365,        // 1 ano
  LOGIN: 30,        // 30 dias
  SESSION: 7,       // 7 dias
  FILTROS: 30       // 30 dias
};

// Mensagens do sistema
export const MESSAGES = {
  SUCCESS: {
    VENDEDOR_CRIADO: 'Vendedor criado com sucesso!',
    VENDEDOR_ATUALIZADO: 'Vendedor atualizado com sucesso!',
    VENDEDOR_EXCLUIDO: 'Vendedor excluído com sucesso!',
    PRODUTO_CRIADO: 'Produto criado com sucesso!',
    PRODUTO_ATUALIZADO: 'Produto atualizado com sucesso!',
    PRODUTO_EXCLUIDO: 'Produto excluído com sucesso!',
    CATEGORIA_CRIADA: 'Categoria criada com sucesso!',
    CATEGORIA_ATUALIZADA: 'Categoria atualizada com sucesso!',
    CATEGORIA_EXCLUIDA: 'Categoria excluída com sucesso!',
    CONSIGNACAO_CRIADA: 'Consignação criada com sucesso!',
    CONSIGNACAO_FINALIZADA: 'Consignação finalizada com sucesso!',
    PRODUTO_ADICIONADO: 'Produto adicionado ao retorno!',
    PRODUTO_REMOVIDO: 'Produto removido do retorno!',
    LOGOUT: 'Logout realizado com sucesso!'
  },
  ERROR: {
    CODIGO_NAO_ENCONTRADO: 'Produto não encontrado ou inativo',
    CODIGO_VAZIO: 'Digite um código de barras',
    LOGIN_INVALIDO: 'Login ou senha inválidos!',
    SALVAR_ERRO: 'Erro ao salvar'
  }
};

// Validação
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ_REGEX: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  MIN_NOME_LENGTH: 2,
  MIN_LOGIN_LENGTH: 3,
  MIN_SENHA_LENGTH: 6,
  MIN_CODIGO_BARRAS_LENGTH: 8
};

// Credenciais padrão do administrador
export const ADMIN_CREDENTIALS = {
  LOGIN: 'admin',
  SENHA: 'admin123',
  NOME: 'Administrador'
};

// Configurações da aplicação
export const APP_CONFIG = {
  NOME: 'Sistema de Consignação',
  VERSAO: '1.0.0',
  TIMEOUT_MENSAGEM: 4000, // 4 segundos
  DELAY_API_SIMULADO: 1000 // 1 segundo
};