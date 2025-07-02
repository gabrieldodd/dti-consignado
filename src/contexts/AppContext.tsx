// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useVendedores, useProdutos, useCategorias, useConsignacoes } from '../hooks/useSupabase';

// Interfaces
interface Tema {
  fundo: string;
  papel: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  input: string;
  hover: string;
}

interface Usuario {
  id: number;
  nome: string;
  login: string;
  tipo: 'admin' | 'vendedor';
}

interface Mensagem {
  tipo: 'success' | 'error' | 'warning' | 'info';
  texto: string;
  timeout: number;
}

interface AppContextType {
  // Tema
  tema: Tema;
  temaEscuro: boolean;
  alternarTema: () => void;
  
  // Dados do Supabase
  vendedores: any[];
  produtos: any[];
  categorias: any[];
  consignacoes: any[];
  
  // Operações CRUD
  adicionarVendedor: (vendedor: any) => Promise<any>;
  atualizarVendedor: (id: number, dados: any) => Promise<any>;
  excluirVendedor: (id: number) => Promise<any>;
  
  adicionarProduto: (produto: any) => Promise<any>;
  atualizarProduto: (id: number, dados: any) => Promise<any>;
  excluirProduto: (id: number) => Promise<any>;
  
  adicionarCategoria: (categoria: any) => Promise<any>;
  atualizarCategoria: (id: number, dados: any) => Promise<any>;
  excluirCategoria: (id: number) => Promise<any>;
  
  adicionarConsignacao: (consignacao: any) => Promise<any>;
  finalizarConsignacao: (id: number, dadosRetorno: any) => Promise<any>;
  excluirConsignacao: (id: number) => Promise<any>;
  
  // Estados de loading
  loadingVendedores: boolean;
  loadingProdutos: boolean;
  loadingCategorias: boolean;
  loadingConsignacoes: boolean;
  
  // Erros
  errorVendedores: string | null;
  errorProdutos: string | null;
  errorCategorias: string | null;
  errorConsignacoes: string | null;
  
  // Usuário logado
  usuarioLogado: Usuario;
  tipoUsuario: 'admin' | 'vendedor';
  fazerLogin: (login: string, senha: string) => boolean;
  fazerLogout: () => void;
  
  // Mensagens
  mostrarMensagem: (tipo: 'success' | 'error' | 'warning' | 'info', texto: string) => void;
  mensagemAtual: Mensagem | null;
  
  // Cookies/Preferências
  cookies: {
    setCookie: (nome: string, valor: string, dias: number) => void;
    getCookie: (nome: string) => string | null;
    removeCookie: (nome: string) => void;
  };
  
  // Configurações
  controleEstoqueHabilitado: boolean;
  setControleEstoqueHabilitado: (valor: boolean) => void;
  
  // Refresh
  refetchTodos: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};

// Temas
const temaClaroPaleta: Tema = {
  fundo: 'bg-gray-100',
  papel: 'bg-white',
  texto: 'text-gray-900',
  textoSecundario: 'text-gray-600',
  borda: 'border-gray-200',
  input: 'bg-white border-gray-300 text-gray-900',
  hover: 'hover:bg-gray-50'
};

const temaEscuroPaleta: Tema = {
  fundo: 'bg-gray-900',
  papel: 'bg-gray-800',
  texto: 'text-white',
  textoSecundario: 'text-gray-300',
  borda: 'border-gray-700',
  input: 'bg-gray-800 border-gray-600 text-white',
  hover: 'hover:bg-gray-700'
};

// Usuário admin padrão
const ADMIN_PADRAO: Usuario = {
  id: 1,
  nome: 'Administrador',
  login: 'admin',
  tipo: 'admin'
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Hooks do Supabase
  const {
    vendedores,
    loading: loadingVendedores,
    error: errorVendedores,
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    refetch: refetchVendedores
  } = useVendedores();

  const {
    produtos,
    loading: loadingProdutos,
    error: errorProdutos,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    refetch: refetchProdutos
  } = useProdutos();

  const {
    categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    refetch: refetchCategorias
  } = useCategorias();

  const {
    consignacoes,
    loading: loadingConsignacoes,
    error: errorConsignacoes,
    adicionarConsignacao,
    finalizarConsignacao: finalizarConsignacaoSupabase,
    excluirConsignacao: excluirConsignacaoSupabase,
    refetch: refetchConsignacoes
  } = useConsignacoes();

  // Estados locais
  const [temaEscuro, setTemaEscuro] = useState(() => {
    const temaSalvo = localStorage.getItem('tema');
    return temaSalvo === 'escuro';
  });

  const [usuarioLogado, setUsuarioLogado] = useState<Usuario>(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : ADMIN_PADRAO;
  });

  const [tipoUsuario, setTipoUsuario] = useState<'admin' | 'vendedor'>(() => {
    return usuarioLogado.tipo;
  });

  const [mensagemAtual, setMensagemAtual] = useState<Mensagem | null>(null);
  
  const [controleEstoqueHabilitado, setControleEstoqueHabilitado] = useState(() => {
    const controleSalvo = localStorage.getItem('controleEstoqueHabilitado');
    return controleSalvo ? JSON.parse(controleSalvo) : true;
  });

  // Tema atual
  const tema = temaEscuro ? temaEscuroPaleta : temaClaroPaleta;

  // Funções do tema
  const alternarTema = useCallback(() => {
    setTemaEscuro(prev => {
      const novoTema = !prev;
      localStorage.setItem('tema', novoTema ? 'escuro' : 'claro');
      return novoTema;
    });
  }, []);

  // Funções de autenticação
  const fazerLogin = useCallback((login: string, senha: string): boolean => {
    // Login admin
    if (login === 'admin' && senha === 'admin123') {
      const adminUser = ADMIN_PADRAO;
      setUsuarioLogado(adminUser);
      setTipoUsuario('admin');
      localStorage.setItem('usuarioLogado', JSON.stringify(adminUser));
      return true;
    }

    // Login vendedor
    const vendedor = vendedores.find(v => v.login === login && v.senha === senha && v.status === 'Ativo');
    if (vendedor) {
      const vendedorUser: Usuario = {
        id: vendedor.id,
        nome: vendedor.nome,
        login: vendedor.login,
        tipo: 'vendedor'
      };
      setUsuarioLogado(vendedorUser);
      setTipoUsuario('vendedor');
      localStorage.setItem('usuarioLogado', JSON.stringify(vendedorUser));
      return true;
    }

    return false;
  }, [vendedores]);

  const fazerLogout = useCallback(() => {
    setUsuarioLogado(ADMIN_PADRAO);
    setTipoUsuario('admin');
    localStorage.removeItem('usuarioLogado');
  }, []);

  // Função de mensagens
  const mostrarMensagem = useCallback((tipo: 'success' | 'error' | 'warning' | 'info', texto: string) => {
    const timeout = tipo === 'success' ? 3000 : 5000;
    setMensagemAtual({ tipo, texto, timeout });

    setTimeout(() => {
      setMensagemAtual(null);
    }, timeout);
  }, []);

  // Funções de cookies
  const cookies = {
    setCookie: (nome: string, valor: string, dias: number) => {
      const dataExpiracao = new Date();
      dataExpiracao.setTime(dataExpiracao.getTime() + (dias * 24 * 60 * 60 * 1000));
      document.cookie = `${nome}=${valor};expires=${dataExpiracao.toUTCString()};path=/`;
    },
    
    getCookie: (nome: string): string | null => {
      const nomeEQ = nome + "=";
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nomeEQ) === 0) return cookie.substring(nomeEQ.length, cookie.length);
      }
      return null;
    },
    
    removeCookie: (nome: string) => {
      document.cookie = `${nome}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  };

  // Wrapper para finalizar consignação
  const finalizarConsignacao = useCallback(async (id: number, dadosRetorno: any) => {
    try {
      const resultado = await finalizarConsignacaoSupabase(id, dadosRetorno);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação finalizada com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error);
      }
      return resultado;
    } catch (error) {
      mostrarMensagem('error', 'Erro ao finalizar consignação');
      return { success: false, error: 'Erro ao finalizar consignação' };
    }
  }, [finalizarConsignacaoSupabase, mostrarMensagem]);

  // Wrapper para excluir consignação
  const excluirConsignacao = useCallback(async (id: number) => {
    try {
      const resultado = await excluirConsignacaoSupabase(id);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação excluída com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error);
      }
      return resultado;
    } catch (error) {
      mostrarMensagem('error', 'Erro ao excluir consignação');
      return { success: false, error: 'Erro ao excluir consignação' };
    }
  }, [excluirConsignacaoSupabase, mostrarMensagem]);

  // Função para atualizar todos os dados
  const refetchTodos = useCallback(() => {
    refetchVendedores();
    refetchProdutos();
    refetchCategorias();
    refetchConsignacoes();
  }, [refetchVendedores, refetchProdutos, refetchCategorias, refetchConsignacoes]);

  // Salvar configurações
  useEffect(() => {
    localStorage.setItem('controleEstoqueHabilitado', JSON.stringify(controleEstoqueHabilitado));
  }, [controleEstoqueHabilitado]);

  const contextValue: AppContextType = {
    // Tema
    tema,
    temaEscuro,
    alternarTema,
    
    // Dados
    vendedores,
    produtos,
    categorias,
    consignacoes,
    
    // Operações CRUD
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    adicionarConsignacao,
    finalizarConsignacao,
    excluirConsignacao,
    
    // Loading states
    loadingVendedores,
    loadingProdutos,
    loadingCategorias,
    loadingConsignacoes,
    
    // Errors
    errorVendedores,
    errorProdutos,
    errorCategorias,
    errorConsignacoes,
    
    // Usuário
    usuarioLogado,
    tipoUsuario,
    fazerLogin,
    fazerLogout,
    
    // Mensagens
    mostrarMensagem,
    mensagemAtual,
    
    // Cookies
    cookies,
    
    // Configurações
    controleEstoqueHabilitado,
    setControleEstoqueHabilitado,
    
    // Refresh
    refetchTodos
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};