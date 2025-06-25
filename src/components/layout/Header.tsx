// src/components/layout/Header.tsx
import React from 'react';
import { Menu } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface HeaderProps {
  menuAberto: boolean;
  onToggleMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ menuAberto, onToggleMenu }) => {
  const { tema, usuarioLogado } = useAppContext();

  return (
    <header className={`lg:hidden ${tema.papel} ${tema.borda} border-b px-4 py-3 flex items-center justify-between`}>
      <div className="flex items-center">
        <button
          onClick={onToggleMenu}
          className={`p-2 rounded-md ${tema.hover} ${tema.texto}`}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className={`ml-3 text-lg font-semibold ${tema.texto}`}>
          Sistema de Consignação
        </h1>
      </div>
      
      <div className={`text-sm ${tema.textoSecundario}`}>
        {usuarioLogado?.nome}
      </div>
    </header>
  );
};