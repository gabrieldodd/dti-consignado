// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Vendedor } from '../types/Vendedor';
import { Produto } from '../types/Produto';
import { Categoria } from '../types/Categoria';
import { Consignacao } from '../types/Consignacao';
import { TipoMensagem, TipoUsuario, TemaConfig, CookieManager } from '../types/Common';
import { useTema } from '../hooks/useTema';
import { useCookies } from '../hooks/useCookies';
import { VENDEDORES_INICIAIS } from '../data/vendedoresIniciais';
import { PRODUTOS_INICIAIS } from '../data/produtosIniciais';
import { CATEGORIAS_INICIAIS } from '../data/categoriasIniciais';
import { CONSIGNACOES_INICIAIS } from '../data/consignacoesIniciais';
import { COOKIE_CONFIG, COOKIE_DURATION, APP_CONFIG } from '../utils/constants';

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
  const cookies = useCookies();
  
  // Estados do tema
  const [temaEscuro, setTemaEscuro] = useState(() => {
    const temaSalvo = cookies.getCookie(COOKIE_CONFIG.TEMA);
    return temaSalvo === 'escuro';
  });
  
  // Estados do usuário
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(null);
  
  // Estados dos dados
  const [vendedores, setVendedores] = useState<Vendedor[]>(VENDEDORES_INICIAIS);
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_INICIAIS);
  const [consignacoes, setConsignacoes] = useState<Consignacao[]>(CONSIGNACOES_INICIAIS);
  
  // Estado para mensagens
  const [mensagem, setMensagem] = useState<{tipo: TipoMensagem, texto: string} | null>(null);
  
  const tema = useTema(temaEscuro);
  
  // Salvar tema nos cookies sempre que mudar
  useEffect(() => {
    cookies.setCookie(
      COOKIE_CONFIG.TEMA, 
      temaEscuro ? 'escuro' : 'claro', 
      COOKIE_DURATION.TEMA
    );
  }, [temaEscuro, cookies]);
  
  // Função para mostrar mensagens
  const mostrarMensagem = useCallback((tipo: TipoMensagem, texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), APP_CONFIG.TIMEOUT_MENSAGEM);
  }, []);
  
  // Função para alterar tema
  const handleSetTemaEscuro = useCallback((tema: boolean) => {
    setTemaEscuro(tema);
  }, []);
  
  // Valor do contexto memoizado
  const contextValue = useMemo(() => ({
    // Tema
    temaEscuro,
    setTemaEscuro: handleSetTemaEscuro,
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
    
    // Utilitários
    mostrarMensagem,
    cookies
  }), [
    temaEscuro,
    handleSetTemaEscuro,
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
    <AppContext.Provider value={contextValue}>
      {children}
      {/* Componente de Mensagem */}
      {mensagem && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center space-x-2 ${
          mensagem.tipo === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span>{mensagem.texto}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};