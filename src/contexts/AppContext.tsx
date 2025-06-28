// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Tipos básicos (temporário - depois migraremos para arquivos separados)
interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
  dataCadastro: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  codigoBarras: string;
  categoria: string;
  valorCusto: number;
  valorVenda: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataCadastro: string;
}

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
  dataCadastro: string;
}

interface Consignacao {
  id: number;
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  vendedorId: number;
  vendedor: Vendedor;
  quantidadeTotal: number;
  valorTotal: number;
  dataConsignacao: string;
  dataRetorno?: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  observacoes?: string;
  retorno?: {
    quantidadeRetornada: number;
    valorRetornado: number;
    quantidadeVendida: number;
    valorDevido: number;
  };
}

interface TemaConfig {
  fundo: string;
  papel: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  hover: string;
  input: string;
  menuAtivo: string;
}

interface CookieManager {
  getCookie: (name: string) => string | null;
  setCookie: (name: string, value: string, days?: number) => void;
}

type TipoMensagem = 'success' | 'error';
type TipoUsuario = 'admin' | 'vendedor' | null;

// Dados iniciais (temporário - depois migraremos para arquivos separados)
const VENDEDORES_INICIAIS: Vendedor[] = [
  { 
    id: 1, 
    nome: 'João Silva', 
    email: 'joao@email.com', 
    telefone: '(11) 99999-9999', 
    status: 'Ativo',
    login: 'joao123',
    senha: '123456',
    dataCadastro: '2024-01-15'
  },
  { 
    id: 2, 
    nome: 'Maria Santos', 
    email: 'maria@email.com', 
    telefone: '(11) 88888-8888', 
    status: 'Ativo',
    login: 'maria123',
    senha: '654321',
    dataCadastro: '2024-02-20'
  },
  { 
    id: 3, 
    nome: 'Pedro Costa', 
    email: 'pedro@email.com', 
    telefone: '(11) 77777-7777', 
    status: 'Inativo',
    login: 'pedro123',
    senha: '789456',
    dataCadastro: '2024-03-10'
  }
];

const PRODUTOS_INICIAIS: Produto[] = [
  {
    id: 1,
    nome: 'Smartphone Samsung Galaxy A54',
    descricao: 'Smartphone com 128GB, câmera tripla 50MP + 12MP + 5MP, tela 6.4"',
    codigoBarras: '7891234567890',
    categoria: 'Eletrônicos',
    valorCusto: 800.00,
    valorVenda: 1200.00,
    estoque: 25,
    estoqueMinimo: 5,
    ativo: true,
    dataCadastro: '2024-01-10'
  },
  {
    id: 2,
    nome: 'Fone de Ouvido Bluetooth JBL',
    descricao: 'Fone sem fio com cancelamento de ruído, autonomia 30h',
    codigoBarras: '7891234567891',
    categoria: 'Acessórios',
    valorCusto: 150.00,
    valorVenda: 299.00,
    estoque: 12,
    estoqueMinimo: 3,
    ativo: true,
    dataCadastro: '2024-01-12'
  },
  {
    id: 3,
    nome: 'Carregador Portátil 10000mAh',
    descricao: 'Power bank com entrada USB-C e saída rápida',
    codigoBarras: '7891234567892',
    categoria: 'Acessórios',
    valorCusto: 45.00,
    valorVenda: 89.00,
    estoque: 2,
    estoqueMinimo: 5,
    ativo: true,
    dataCadastro: '2024-01-15'
  },
  {
    id: 4,
    nome: 'Cabo USB-C para Lightning',
    descricao: 'Cabo certificado MFi, 1 metro, carregamento rápido',
    codigoBarras: '7891234567893',
    categoria: 'Cabos',
    valorCusto: 25.00,
    valorVenda: 59.00,
    estoque: 50,
    estoqueMinimo: 10,
    ativo: false,
    dataCadastro: '2024-01-20'
  }
];

const CATEGORIAS_INICIAIS: Categoria[] = [
  {
    id: 1,
    nome: 'Eletrônicos',
    descricao: 'Dispositivos eletrônicos e smartphones',
    cor: 'blue',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 2,
    nome: 'Acessórios',
    descricao: 'Acessórios para dispositivos móveis',
    cor: 'green',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 3,
    nome: 'Cabos',
    descricao: 'Cabos e conectores diversos',
    cor: 'yellow',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 4,
    nome: 'Cases',
    descricao: 'Capas e cases protetores',
    cor: 'purple',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 5,
    nome: 'Carregadores',
    descricao: 'Carregadores e fontes de alimentação',
    cor: 'red',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 6,
    nome: 'Outros',
    descricao: 'Produtos diversos',
    cor: 'gray',
    ativa: false,
    dataCadastro: '2024-01-01'
  }
];

const CONSIGNACOES_INICIAIS: Consignacao[] = [
  {
    id: 1,
    clienteNome: 'João da Silva',
    clienteDocumento: '123.456.789-10',
    clienteTelefone: '(11) 98765-4321',
    tipoDocumento: 'cpf',
    vendedorId: 1,
    vendedor: VENDEDORES_INICIAIS[0],
    quantidadeTotal: 15,
    valorTotal: 2699.00,
    dataConsignacao: '2024-06-15',
    status: 'ativa',
    observacoes: 'Cliente preferencial, prazo estendido'
  },
  {
    id: 2,
    clienteNome: 'Maria Oliveira Comércio LTDA',
    clienteDocumento: '12.345.678/0001-90',
    clienteTelefone: '(11) 91234-5678',
    tipoDocumento: 'cnpj',
    vendedorId: 2,
    vendedor: VENDEDORES_INICIAIS[1],
    quantidadeTotal: 8,
    valorTotal: 1567.00,
    dataConsignacao: '2024-06-10',
    dataRetorno: '2024-06-16',
    status: 'finalizada',
    retorno: {
      quantidadeRetornada: 3,
      valorRetornado: 890.00,
      quantidadeVendida: 5,
      valorDevido: 677.00
    }
  }
];

// Hook para tema
const useTema = (temaEscuro: boolean): TemaConfig => {
  return useMemo(() => ({
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: temaEscuro ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    menuAtivo: temaEscuro ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300' : 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
  }), [temaEscuro]);
};

// Hook para cookies
const useCookies = (): CookieManager => {
  const getCookie = useCallback((name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }, []);

  const setCookie = useCallback((name: string, value: string, days: number = 7): void => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
  }, []);

  return { getCookie, setCookie };
};

// Interface do Context
interface AppContextType {
  // Tema
  temaEscuro: boolean;
  setTemaEscuro: (tema: boolean) => void;
  tema: TemaConfig;
  
  // Usuário
  usuarioLogado: any;
  setUsuarioLogado: React.Dispatch<React.SetStateAction<any>>;
  tipoUsuario: TipoUsuario;
  setTipoUsuario: React.Dispatch<React.SetStateAction<TipoUsuario>>;
  
  // Dados
  vendedores: Vendedor[];
  produtos: Produto[];
  categorias: Categoria[];
  consignacoes: Consignacao[];
  setVendedores: React.Dispatch<React.SetStateAction<Vendedor[]>>;
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
  setConsignacoes: React.Dispatch<React.SetStateAction<Consignacao[]>>;
  
  // Utilitários
  mostrarMensagem: (tipo: TipoMensagem, texto: string) => void;
  cookies: CookieManager;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro do AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Estados
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>(VENDEDORES_INICIAIS);
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_INICIAIS);
  const [consignacoes, setConsignacoes] = useState<Consignacao[]>(CONSIGNACOES_INICIAIS);

  // Hooks
  const tema = useTema(temaEscuro);
  const cookies = useCookies();

  // Função para mostrar mensagens (temporária - implementação simples)
  const mostrarMensagem = useCallback((tipo: TipoMensagem, texto: string) => {
    console.log(`[${tipo.toUpperCase()}] ${texto}`);
    // Implementação simples - depois podemos melhorar com toast/notificação
  }, []);

  const value = useMemo(() => ({
    temaEscuro,
    setTemaEscuro,
    tema,
    usuarioLogado,
    setUsuarioLogado,
    tipoUsuario,
    setTipoUsuario,
    vendedores,
    produtos,
    categorias,
    consignacoes,
    setVendedores,
    setProdutos,
    setCategorias,
    setConsignacoes,
    mostrarMensagem,
    cookies
  }), [
    temaEscuro,
    tema,
    usuarioLogado,
    tipoUsuario,
    vendedores,
    produtos,
    categorias,
    consignacoes,
    mostrarMensagem,
    cookies
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};