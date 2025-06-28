// src/components/screens/index.ts

/**
 * Exportações centralizadas de todas as telas do sistema
 * 
 * Este arquivo permite importar todas as telas de forma organizada:
 * import { Login, Dashboard, TelaVendedores } from '../screens';
 */

// Tela de Login
export { Login } from './Login';

// Dashboard principal
export { Dashboard } from './Dashboard';

// Telas de CRUD
export { TelaVendedores } from './TelaVendedores';
export { TelaProdutos } from './TelaProdutos';
export { TelaCategorias } from './TelaCategorias';
export { TelaConsignacoes } from './TelaConsignacoes';

// Tipos das telas (se necessário para tipagem)
export type TelaType = 
  | 'login'
  | 'dashboard' 
  | 'vendedores'
  | 'produtos'
  | 'categorias'
  | 'consignacoes';

// Constantes das telas
export const TELAS = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  VENDEDORES: 'vendedores',
  PRODUTOS: 'produtos',
  CATEGORIAS: 'categorias',
  CONSIGNACOES: 'consignacoes'
} as const;

// Configuração das telas para roteamento
export const TELAS_CONFIG = {
  [TELAS.LOGIN]: {
    component: 'Login',
    title: 'Login',
    description: 'Acesso ao sistema',
    requiresAuth: false
  },
  [TELAS.DASHBOARD]: {
    component: 'Dashboard',
    title: 'Dashboard',
    description: 'Visão geral do sistema',
    requiresAuth: true,
    allowedRoles: ['admin', 'vendedor']
  },
  [TELAS.VENDEDORES]: {
    component: 'TelaVendedores',
    title: 'Vendedores',
    description: 'Gestão de vendedores',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  [TELAS.PRODUTOS]: {
    component: 'TelaProdutos',
    title: 'Produtos',
    description: 'Catálogo de produtos',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  [TELAS.CATEGORIAS]: {
    component: 'TelaCategorias',
    title: 'Categorias',
    description: 'Categorias de produtos',
    requiresAuth: true,
    allowedRoles: ['admin']
  },
  [TELAS.CONSIGNACOES]: {
    component: 'TelaConsignacoes',
    title: 'Consignações',
    description: 'Gestão de consignações',
    requiresAuth: true,
    allowedRoles: ['admin', 'vendedor']
  }
} as const;