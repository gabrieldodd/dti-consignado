// src/components/common/LoadingGlobal.tsx
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

export const LoadingGlobal: React.FC = () => {
  const { 
    loadingVendedores, 
    loadingProdutos, 
    loadingCategorias, 
    loadingConsignacoes,
    tema 
  } = useAppContext();

  const isLoading = loadingVendedores || loadingProdutos || loadingCategorias || loadingConsignacoes;

  if (!isLoading) return null;

  const getLoadingMessage = () => {
    if (loadingConsignacoes) return 'Carregando consignações...';
    if (loadingProdutos) return 'Carregando produtos...';
    if (loadingVendedores) return 'Carregando vendedores...';
    if (loadingCategorias) return 'Carregando categorias...';
    return 'Carregando dados...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${tema.papel} p-6 rounded-lg shadow-xl flex flex-col items-center space-y-4 max-w-sm mx-4`}>
        {/* Spinner */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        
        {/* Mensagem */}
        <div className="text-center">
          <p className={`${tema.texto} font-medium text-lg`}>
            {getLoadingMessage()}
          </p>
          <p className={`${tema.textoSecundario} text-sm mt-1`}>
            Aguarde alguns instantes...
          </p>
        </div>
        
        {/* Pontos animados */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};