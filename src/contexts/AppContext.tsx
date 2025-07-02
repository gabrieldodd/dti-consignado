// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';

// Tipos básicos
type TipoMensagem = 'success' | 'error';
type TipoUsuario = 'admin' | 'vendedor' | null;

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
  deleteCookie: (name: string) => void;
}

// Hook para tema
const useTema = (temaEscuro: boolean): TemaConfig => {
  return useMemo(() => ({
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: temaEscuro 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900',
    menuAtivo: temaEscuro 
      ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300' 
      : 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
  }), [temaEscuro]);
};

// Hook para cookies
const useCookies = (): CookieManager => {
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }, []);

  const setCookie = useCallback((name: string, value: string, days: number = 7): void => {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }, []);

  const deleteCookie = useCallback((name: string): void => {
    setCookie(name, '', -1);
  }, [setCookie]);

  return { getCookie, setCookie, deleteCookie };
};

// Dados iniciais
const VENDEDORES_INICIAIS = [
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

const PRODUTOS_INICIAIS = [
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
  }
];

const CATEGORIAS_INICIAIS = [
  {
    id: 1,
    nome: 'Eletrônicos',
    descricao: 'Dispositivos eletrônicos e gadgets',
    cor: 'blue',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 2,
    nome: 'Acessórios',
    descricao: 'Acessórios diversos',
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
  }
];

const CONSIGNACOES_INICIAIS: any[] = [];

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
  vendedores: any[];
  produtos: any[];
  categorias: any[];
  consignacoes: any[];
  setVendedores: React.Dispatch<React.SetStateAction<any[]>>;
  setProdutos: React.Dispatch<React.SetStateAction<any[]>>;
  setCategorias: React.Dispatch<React.SetStateAction<any[]>>;
  setConsignacoes: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Configurações do Sistema
  controleEstoqueHabilitado: boolean;
  setControleEstoqueHabilitado: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Utilitários
  mostrarMensagem: (tipo: TipoMensagem, texto: string) => void;
  cookies: CookieManager;
  salvarPreferencias: () => void;
  carregarPreferencias: () => void;
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
  // Hook de cookies
  const cookies = useCookies();
  const { getCookie, setCookie } = cookies;

  // Estados com carregamento de preferências salvas
  const [temaEscuro, setTemaEscuro] = useState(() => {
    // Carregar tema salvo dos cookies na inicialização
    const temaSalvo = getCookie('sistema_tema');
    return temaSalvo === 'escuro';
  });

  // Estado para controle de estoque
  const [controleEstoqueHabilitado, setControleEstoqueHabilitado] = useState(() => {
    // Carregar configuração de estoque salva dos cookies
    const controleEstoqueSalvo = getCookie('sistema_controle_estoque');
    return controleEstoqueSalvo !== 'false'; // Default: habilitado
  });

  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(null);
  const [vendedores, setVendedores] = useState<any[]>(VENDEDORES_INICIAIS);
  const [produtos, setProdutos] = useState<any[]>(PRODUTOS_INICIAIS);
  const [categorias, setCategorias] = useState<any[]>(CATEGORIAS_INICIAIS);
  const [consignacoes, setConsignacoes] = useState<any[]>(CONSIGNACOES_INICIAIS);

  // Hooks
  const tema = useTema(temaEscuro);

  // Estado para controle de mensagens
  const [mensagemAtual, setMensagemAtual] = useState<{
    tipo: TipoMensagem;
    texto: string;
    timeout?: number;
  } | null>(null);

  // Função para mostrar mensagens com auto-hide
  const mostrarMensagem = useCallback((tipo: TipoMensagem, texto: string) => {
    // Limpar timeout anterior se existir
    if (mensagemAtual?.timeout) {
      clearTimeout(mensagemAtual.timeout);
    }

    // Criar novo timeout
    const timeout = setTimeout(() => {
      setMensagemAtual(null);
    }, tipo === 'success' ? 3000 : 5000); // Success: 3s, Error: 5s

    setMensagemAtual({ tipo, texto, timeout });

    // Log para debug
    console.log(`[${tipo.toUpperCase()}] ${texto}`);
  }, [mensagemAtual]);

  // Salvar tema sempre que mudar
  useEffect(() => {
    setCookie('sistema_tema', temaEscuro ? 'escuro' : 'claro', 365); // Salva por 1 ano
  }, [temaEscuro, setCookie]);

  // Salvar configuração de controle de estoque sempre que mudar
  useEffect(() => {
    setCookie('sistema_controle_estoque', controleEstoqueHabilitado.toString(), 365); // Salva por 1 ano
  }, [controleEstoqueHabilitado, setCookie]);

  // Função para salvar todas as preferências do usuário
  const salvarPreferencias = useCallback(() => {
    const preferencias = {
      tema: temaEscuro ? 'escuro' : 'claro',
      controleEstoque: controleEstoqueHabilitado,
      timestamp: new Date().toISOString()
    };
    
    setCookie('sistema_preferencias', JSON.stringify(preferencias), 365);
    mostrarMensagem('success', 'Preferências salvas com sucesso!');
  }, [temaEscuro, controleEstoqueHabilitado, setCookie, mostrarMensagem]);

  // Função para carregar preferências salvas
  const carregarPreferencias = useCallback(() => {
    try {
      const preferenciasSalvas = getCookie('sistema_preferencias');
      if (preferenciasSalvas) {
        const preferencias = JSON.parse(preferenciasSalvas);
        
        if (preferencias.tema) {
          setTemaEscuro(preferencias.tema === 'escuro');
        }
        
        if (typeof preferencias.controleEstoque === 'boolean') {
          setControleEstoqueHabilitado(preferencias.controleEstoque);
        }
        
        mostrarMensagem('success', 'Preferências carregadas!');
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      mostrarMensagem('error', 'Erro ao carregar preferências salvas');
    }
  }, [getCookie, mostrarMensagem]);

  // Limpar timeout das mensagens ao desmontar
  useEffect(() => {
    return () => {
      if (mensagemAtual?.timeout) {
        clearTimeout(mensagemAtual.timeout);
      }
    };
  }, [mensagemAtual]);

  const contextValue: AppContextType = {
    // Tema
    temaEscuro,
    setTemaEscuro,
    tema,
    
    // Usuário
    usuarioLogado,
    setUsuarioLogado,
    tipoUsuario,
    setTipoUsuario,
    
    // Dados
    vendedores,
    produtos,
    categorias,
    consignacoes,
    setVendedores,
    setProdutos,
    setCategorias,
    setConsignacoes,
    
    // Configurações do Sistema
    controleEstoqueHabilitado,
    setControleEstoqueHabilitado,
    
    // Utilitários
    mostrarMensagem,
    cookies,
    salvarPreferencias,
    carregarPreferencias
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      
      {/* Renderizar mensagens */}
      {mensagemAtual && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${
            mensagemAtual.tipo === 'success' 
              ? 'bg-green-100 border border-green-500 text-green-700' 
              : 'bg-red-100 border border-red-500 text-red-700'
          }`}>
            <div className="flex items-center">
              {mensagemAtual.tipo === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{mensagemAtual.texto}</span>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};