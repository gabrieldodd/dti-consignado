// src/utils/constants.ts - Versão Corrigida Completa
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

// CORREÇÃO: Mensagens do sistema melhoradas e mais específicas
export const MESSAGES = {
  SUCCESS: {
    // Vendedores
    VENDEDOR_CRIADO: 'Vendedor criado com sucesso!',
    VENDEDOR_ATUALIZADO: 'Vendedor atualizado com sucesso!',
    VENDEDOR_EXCLUIDO: 'Vendedor excluído com sucesso!',
    VENDEDOR_ATIVADO: 'Vendedor ativado com sucesso!',
    VENDEDOR_DESATIVADO: 'Vendedor desativado com sucesso!',
    
    // Produtos
    PRODUTO_CRIADO: 'Produto criado com sucesso!',
    PRODUTO_ATUALIZADO: 'Produto atualizado com sucesso!',
    PRODUTO_EXCLUIDO: 'Produto excluído com sucesso!',
    PRODUTO_ATIVADO: 'Produto ativado com sucesso!',
    PRODUTO_DESATIVADO: 'Produto desativado com sucesso!',
    PRODUTO_ADICIONADO: 'Produto adicionado com sucesso!',
    PRODUTO_REMOVIDO: 'Produto removido com sucesso!',
    
    // Categorias
    CATEGORIA_CRIADA: 'Categoria criada com sucesso!',
    CATEGORIA_ATUALIZADA: 'Categoria atualizada com sucesso!',
    CATEGORIA_EXCLUIDA: 'Categoria excluída com sucesso!',
    
    // Consignações
    CONSIGNACAO_CRIADA: 'Consignação criada com sucesso!',
    CONSIGNACAO_ATUALIZADA: 'Consignação atualizada com sucesso!',
    CONSIGNACAO_FINALIZADA: 'Consignação finalizada com sucesso!',
    CONSIGNACAO_EXCLUIDA: 'Consignação excluída com sucesso!',
    
    // Sistema
    LOGIN_SUCESSO: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    DADOS_SALVOS: 'Dados salvos com sucesso!'
  },
  
  ERROR: {
    // Códigos e produtos
    CODIGO_NAO_ENCONTRADO: 'Produto não encontrado. Verifique o código e tente novamente.',
    CODIGO_VAZIO: 'Digite um código de barras válido',
    CODIGO_DUPLICADO: 'Este código já está cadastrado no sistema',
    PRODUTO_INATIVO: 'Produto está inativo e não pode ser usado',
    PRODUTO_SEM_ESTOQUE: 'Produto sem estoque disponível',
    
    // Validação
    LOGIN_INVALIDO: 'Login ou senha inválidos!',
    EMAIL_INVALIDO: 'Email inválido',
    CPF_INVALIDO: 'CPF inválido',
    CNPJ_INVALIDO: 'CNPJ inválido',
    TELEFONE_INVALIDO: 'Telefone inválido',
    SENHA_FRACA: 'Senha deve ter pelo menos 6 caracteres',
    SENHAS_NAO_COINCIDEM: 'Senhas não coincidem',
    
    // Dados duplicados
    EMAIL_DUPLICADO: 'Este email já está em uso',
    LOGIN_DUPLICADO: 'Este login já está em uso',
    NOME_DUPLICADO: 'Já existe um registro com este nome',
    
    // Operações
    SALVAR_ERRO: 'Erro ao salvar. Tente novamente.',
    EXCLUIR_ERRO: 'Erro ao excluir. Tente novamente.',
    CARREGAR_DADOS: 'Erro ao carregar dados',
    CONEXAO_ERRO: 'Erro de conexão. Verifique sua internet.',
    
    // Categorias
    CATEGORIA_NAO_ENCONTRADA: 'Categoria não encontrada',
    CATEGORIA_EM_USO: 'Categoria está sendo usada e não pode ser excluída',
    
    // Consignações
    CONSIGNACAO_VAZIA: 'Adicione pelo menos um produto à consignação',
    QUANTIDADE_INVALIDA: 'Quantidade deve ser maior que zero',
    VALOR_INVALIDO: 'Valor deve ser maior que zero',
    VENDEDOR_OBRIGATORIO: 'Vendedor é obrigatório',
    CLIENTE_OBRIGATORIO: 'Dados do cliente são obrigatórios'
  },
  
  INFO: {
    // Produtos duplicados  
    PRODUTO_DUPLICADO: 'Produto já adicionado. Quantidade aumentada.',
    PRODUTO_JA_EXISTE: 'Este produto já está na lista.',
    QUANTIDADE_ALTERADA: 'Quantidade do produto alterada.',
    CODIGO_FORMATO_ESPECIAL: 'Use o formato "quantidade*código" (ex: 2*1010) para adicionar múltiplas unidades',
    
    // Sistema
    CARREGANDO: 'Carregando...',
    PROCESSANDO: 'Processando dados...',
    AGUARDE: 'Aguarde um momento...',
    
    // Validação
    CAMPO_OBRIGATORIO: 'Este campo é obrigatório',
    DADOS_SALVOS_AUTOMATICAMENTE: 'Dados salvos automaticamente',
    
    // Dicas
    DICA_CODIGO_BARRAS: 'Digite o código de barras ou escaneie com um leitor',
    DICA_QUANTIDADE_MULTIPLA: 'Para adicionar múltiplas unidades, use: quantidade*código (exemplo: 5*123456)',
    DICA_BUSCA: 'Digite para buscar por nome, código ou descrição'
  },
  
  WARNING: {
    // Estoque
    ESTOQUE_BAIXO: 'Produto com estoque baixo',
    ESTOQUE_ZERADO: 'Produto sem estoque',
    ESTOQUE_NEGATIVO: 'Estoque não pode ser negativo',
    
    // Valores
    VALOR_ALTO: 'Verifique se o valor está correto',
    MARGEM_BAIXA: 'Margem de lucro muito baixa',
    PRECO_MENOR_CUSTO: 'Preço de venda menor que o custo',
    
    // Dados
    DADOS_INCOMPLETOS: 'Alguns dados estão incompletos',
    DADOS_NAO_SALVOS: 'Você tem alterações não salvas',
    
    // Sistema
    SESSAO_EXPIRANDO: 'Sua sessão expirará em breve',
    BACKUP_RECOMENDADO: 'Recomendado fazer backup dos dados'
  },
  
  CONFIRM: {
    // Exclusão
    CONFIRMAR_EXCLUSAO: 'Tem certeza que deseja excluir?',
    EXCLUSAO_PERMANENTE: 'Esta ação não pode ser desfeita',
    
    // Alterações
    DESCARTAR_ALTERACOES: 'Descartar alterações não salvas?',
    SAIR_SEM_SALVAR: 'Sair sem salvar as alterações?',
    
    // Status
    DESATIVAR_ITEM: 'Desativar este item?',
    ATIVAR_ITEM: 'Ativar este item?',
    
    // Finalização
    FINALIZAR_CONSIGNACAO: 'Finalizar esta consignação?',
    OPERACAO_IRREVERSIVEL: 'Esta operação não poderá ser desfeita'
  }
};

// Validação - Regras e limites
export const VALIDATION_RULES = {
  // Regex para validação
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ_REGEX: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CODIGO_BARRAS_REGEX: /^\d{8,14}$/,
  
  // Limites de caracteres
  MIN_NOME_LENGTH: 2,
  MAX_NOME_LENGTH: 100,
  MIN_LOGIN_LENGTH: 3,
  MAX_LOGIN_LENGTH: 50,
  MIN_SENHA_LENGTH: 6,
  MAX_SENHA_LENGTH: 50,
  MIN_CODIGO_BARRAS_LENGTH: 8,
  MAX_CODIGO_BARRAS_LENGTH: 14,
  MAX_DESCRICAO_LENGTH: 500,
  MAX_OBSERVACOES_LENGTH: 1000,
  
  // Limites numéricos
  MIN_VALOR: 0.01,
  MAX_VALOR: 999999.99,
  MIN_ESTOQUE: 0,
  MAX_ESTOQUE: 999999,
  MIN_QUANTIDADE: 1,
  MAX_QUANTIDADE: 1000
};

// Credenciais padrão do administrador
export const ADMIN_CREDENTIALS = {
  LOGIN: 'admin',
  SENHA: 'admin123',
  NOME: 'Administrador',
  EMAIL: 'admin@sistema.com',
  TIPO: 'admin'
};

// Configurações da aplicação
export const APP_CONFIG = {
  NOME: 'Sistema de Consignação',
  VERSAO: '1.0.0',
  AUTOR: 'Sistema de Gestão',
  TIMEOUT_MENSAGEM: 4000, // 4 segundos
  DELAY_API_SIMULADO: 1000, // 1 segundo
  ITENS_POR_PAGINA: 10,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  FORMATOS_IMAGEM_ACEITOS: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};

// Status disponíveis para diferentes entidades
export const STATUS = {
  VENDEDOR: {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo'
  },
  PRODUTO: {
    ATIVO: true,
    INATIVO: false
  },
  CATEGORIA: {
    ATIVA: true,
    INATIVA: false
  },
  CONSIGNACAO: {
    ATIVA: 'ativa',
    FINALIZADA: 'finalizada',
    CANCELADA: 'cancelada'
  }
};

// Tipos de documento
export const TIPOS_DOCUMENTO = {
  CPF: 'cpf',
  CNPJ: 'cnpj'
};

// Formatação de moeda
export const FORMATO_MOEDA = {
  LOCALE: 'pt-BR',
  CURRENCY: 'BRL',
  OPTIONS: {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
};

// Configurações de paginação
export const PAGINACAO = {
  ITENS_POR_PAGINA: 10,
  OPCOES_ITENS: [10, 25, 50, 100],
  MAX_BOTOES_PAGINACAO: 5
};

// Chaves para localStorage
export const STORAGE_KEYS = {
  USUARIO_LOGADO: 'usuarioLogado',
  TIPO_USUARIO: 'tipoUsuario',
  TEMA_ESCURO: 'temaEscuro',
  CONFIGURACOES: 'configuracoesSistema',
  BACKUP_DADOS: 'backupDados'
};

// Configurações de tema
export const TEMA_CONFIG = {
  CLARO: 'claro',
  ESCURO: 'escuro',
  AUTO: 'auto'
};

// Códigos de erro HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Eventos do sistema para logging
export const SYSTEM_EVENTS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  ERROR: 'ERROR'
};

// Configurações de backup
export const BACKUP_CONFIG = {
  INTERVALO_AUTO_BACKUP: 24 * 60 * 60 * 1000, // 24 horas em ms
  MAX_BACKUPS_LOCAIS: 5,
  FORMATO_DATA_BACKUP: 'YYYY-MM-DD_HH-mm-ss'
};

// Regex para validação de entrada de quantidade*código
export const CODIGO_QUANTIDADE_REGEX = /^(\d+)\*(.+)$/;

// Função helper para parsing de código com quantidade
export const parseCodigoComQuantidade = (input: string): { quantidade: number; codigo: string } => {
  const trimmed = input.trim();
  const match = trimmed.match(CODIGO_QUANTIDADE_REGEX);
  
  if (match) {
    const [, quantidadeStr, codigo] = match;
    const quantidade = parseInt(quantidadeStr, 10);
    
    if (!isNaN(quantidade) && quantidade > 0 && codigo.trim()) {
      return { quantidade, codigo: codigo.trim() };
    }
  }
  
  return { quantidade: 1, codigo: trimmed };
};

// Exportar todas as constantes em um objeto principal
export default {
  CORES_DISPONIVEIS,
  COOKIE_CONFIG,
  COOKIE_DURATION,
  MESSAGES,
  VALIDATION_RULES,
  ADMIN_CREDENTIALS,
  APP_CONFIG,
  STATUS,
  TIPOS_DOCUMENTO,
  FORMATO_MOEDA,
  PAGINACAO,
  STORAGE_KEYS,
  TEMA_CONFIG,
  HTTP_STATUS,
  SYSTEM_EVENTS,
  BACKUP_CONFIG,
  CODIGO_QUANTIDADE_REGEX,
  parseCodigoComQuantidade
};