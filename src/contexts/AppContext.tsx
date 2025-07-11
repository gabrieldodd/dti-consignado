// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { Tema, TipoMensagem } from '../types/Common';
import { Vendedor } from '../types/Vendedor';
import { Produto } from '../types/Produto';
import { Categoria } from '../types/Categoria';
import { Consignacao } from '../types/Consignacao';

interface AppContextType {
  // Tema
  temaEscuro: boolean;
  setTemaEscuro: (tema: boolean) => void;
  tema: Tema;
  
  // Usuário
  usuarioLogado: any;
  setUsuarioLogado: (usuario: any) => void;
  tipoUsuario: string | null;
  setTipoUsuario: (tipo: string | null) => void;
  
  // Dados Supabase
  vendedores: any[];
  produtos: any[];
  categorias: any[];
  consignacoes: any[];
  loading: boolean;
  error: string | null;
  
  // Loadings específicos
  loadingVendedores: boolean;
  loadingProdutos: boolean;
  loadingCategorias: boolean;
  loadingConsignacoes: boolean;
  
  // Ações Supabase
  adicionarVendedor: (vendedor: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  atualizarVendedor: (id: any, updates: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  excluirVendedor: (id: any) => Promise<{ success: boolean; error?: string }>;
  adicionarProduto: (produto: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  atualizarProduto: (id: any, updates: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  excluirProduto: (id: any) => Promise<{ success: boolean; error?: string }>;
  adicionarCategoria: (categoria: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  atualizarCategoria: (id: any, updates: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  excluirCategoria: (id: any) => Promise<{ success: boolean; error?: string }>;
  adicionarConsignacao: (consignacao: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  finalizarConsignacao: (id: any, dadosRetorno: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  excluirConsignacao: (id: any) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
  
  // Funcionalidades
  mostrarMensagem: (tipo: TipoMensagem, texto: string) => void;
  fazerLogin: (login: string, senha: string) => boolean;
  fazerLogout: () => void;
  
  // Utils
  cookies: {
    getCookie: (name: string) => string | null;
    setCookie: (name: string, value: string, days?: number) => void;
    removeCookie: (name: string) => void;
  };
  formatarMoeda: (valor: number) => string;
  formatarData: (data: string) => string;
  formatarDocumento: (documento: string, tipo: 'cpf' | 'cnpj') => string;
  validarCPF: (cpf: string) => boolean;
  validarCNPJ: (cnpj: string) => boolean;
  validarEmail: (email: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  
  // Hook do Supabase
  const supabaseData = useSupabase();

  // Temas
  const temaClaro: Tema = {
    background: 'bg-gray-50',
    surface: 'bg-white',
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    accent: 'bg-blue-500',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    menuAtivo: 'bg-blue-100'
  };

  const temaEscuroObj: Tema = {
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    primary: 'bg-blue-600',
    secondary: 'bg-gray-400',
    accent: 'bg-blue-400',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-700',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
    menuAtivo: 'bg-gray-700'
  };

  const tema = temaEscuro ? temaEscuroObj : temaClaro;

  // Mensagens
  const mostrarMensagem = useCallback((tipo: TipoMensagem, texto: string) => {
    // Implementação simples - pode ser melhorada com toast/notification
    if (tipo === 'error') {
      console.error(texto);
      alert(`Erro: ${texto}`);
    } else if (tipo === 'success') {
      console.log(texto);
      alert(`Sucesso: ${texto}`);
    } else {
      console.log(texto);
      alert(texto);
    }
  }, []);

  // Login/Logout
  const fazerLogin = useCallback((login: string, senha: string) => {
    // Simulação de login simples
    const usuariosValidos = [
      { id: 1, nome: 'Administrador', login: 'admin', senha: 'admin', status: 'ativo' },
      { id: 2, nome: 'Vendedor', login: 'vendedor', senha: '123', status: 'ativo' }
    ];

    const usuario = usuariosValidos.find((u: any) => u.login === login && u.senha === senha && u.status === 'ativo');
    
    if (usuario) {
      setUsuarioLogado(usuario);
      setTipoUsuario(usuario.login === 'admin' ? 'admin' : 'vendedor');
      cookies.setCookie('usuarioLogado', JSON.stringify(usuario), 7);
      cookies.setCookie('tipoUsuario', usuario.login === 'admin' ? 'admin' : 'vendedor', 7);
      return true;
    }
    return false;
  }, []);

  const fazerLogout = useCallback(() => {
    setUsuarioLogado(null);
    setTipoUsuario(null);
    cookies.removeCookie('usuarioLogado');
    cookies.removeCookie('tipoUsuario');
  }, []);

  // Utilitários
  const cookies = {
    getCookie: (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    },
    setCookie: (name: string, value: string, days: number = 7) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    },
    removeCookie: (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  };

  const formatarMoeda = useCallback((valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  const formatarData = useCallback((data: string): string => {
    return new Date(data).toLocaleDateString('pt-BR');
  }, []);

  const formatarDocumento = useCallback((documento: string, tipo: 'cpf' | 'cnpj'): string => {
    const nums = documento.replace(/\D/g, '');
    if (tipo === 'cpf') {
      return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }, []);

  const validarCPF = useCallback((cpf: string): boolean => {
    const nums = cpf.replace(/\D/g, '');
    if (nums.length !== 11) return false;
    if (nums === '00000000000') return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nums.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(nums.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(nums.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(nums.charAt(10))) return false;
    
    return true;
  }, []);

  const validarCNPJ = useCallback((cnpj: string): boolean => {
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length !== 14) return false;
    if (nums === '00000000000000') return false;
    return true; // Simplificado
  }, []);

  const validarEmail = useCallback((email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  const value: AppContextType = {
    // Tema
    temaEscuro,
    setTemaEscuro,
    tema,
    
    // Usuário
    usuarioLogado,
    setUsuarioLogado,
    tipoUsuario,
    setTipoUsuario,
    
    // Dados Supabase
    vendedores: supabaseData.vendedores,
    produtos: supabaseData.produtos,
    categorias: supabaseData.categorias,
    consignacoes: supabaseData.consignacoes,
    loading: supabaseData.loading,
    error: supabaseData.error,
    
    // Loadings específicos
    loadingVendedores: supabaseData.loading,
    loadingProdutos: supabaseData.loading,
    loadingCategorias: supabaseData.loading,
    loadingConsignacoes: supabaseData.loading,
    
    // Ações Supabase
    adicionarVendedor: supabaseData.adicionarVendedor,
    atualizarVendedor: supabaseData.atualizarVendedor,
    excluirVendedor: supabaseData.excluirVendedor,
    adicionarProduto: supabaseData.adicionarProduto,
    atualizarProduto: supabaseData.atualizarProduto,
    excluirProduto: supabaseData.excluirProduto,
    adicionarCategoria: supabaseData.adicionarCategoria,
    atualizarCategoria: supabaseData.atualizarCategoria,
    excluirCategoria: supabaseData.excluirCategoria,
    adicionarConsignacao: supabaseData.adicionarConsignacao,
    finalizarConsignacao: supabaseData.finalizarConsignacao,
    excluirConsignacao: supabaseData.excluirConsignacao,
    refetch: supabaseData.refetch,
    
    // Funcionalidades
    mostrarMensagem,
    fazerLogin,
    fazerLogout,
    
    // Utils
    cookies,
    formatarMoeda,
    formatarData,
    formatarDocumento,
    validarCPF,
    validarCNPJ,
    validarEmail
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};