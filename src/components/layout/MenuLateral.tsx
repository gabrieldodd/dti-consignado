// src/components/layout/MenuLateral.tsx
import React from 'react';
import { Users, Package, FileText, BarChart3, LogOut, Settings, Tag } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface MenuLateralProps {
  telaAtiva: string;
  setTelaAtiva: (tela: string) => void;
  menuAberto: boolean;
  setMenuAberto: (aberto: boolean) => void;
}

interface ItemMenu {
  id: string;
  nome: string;
  icone: React.ReactNode;
  permissao?: string[];
}

export const MenuLateral: React.FC<MenuLateralProps> = ({
  telaAtiva,
  setTelaAtiva,
  menuAberto,
  setMenuAberto
}) => {
  const { tema, tipoUsuario, fazerLogout } = useAppContext();

  // Garantir que o tema tenha menuAtivo
  const temaComMenuAtivo = {
    ...tema,
    menuAtivo: tema.menuAtivo || tema.primary || 'bg-blue-100'
  };

  const itensMenu: ItemMenu[] = [
    {
      id: 'dashboard',
      nome: 'Dashboard',
      icone: <BarChart3 size={20} />,
    },
    {
      id: 'consignacoes',
      nome: 'Consignações',
      icone: <FileText size={20} />,
    },
    {
      id: 'vendedores',
      nome: 'Vendedores',
      icone: <Users size={20} />,
      permissao: ['admin']
    },
    {
      id: 'produtos',
      nome: 'Produtos',
      icone: <Package size={20} />,
      permissao: ['admin']
    },
    {
      id: 'categorias',
      nome: 'Categorias',
      icone: <Tag size={20} />,
      permissao: ['admin']
    }
  ];

  const itensMenuFiltrados = itensMenu.filter(item => {
    if (!item.permissao) return true;
    return item.permissao.includes(tipoUsuario || '');
  });

  const handleItemClick = (itemId: string) => {
    setTelaAtiva(itemId);
    if (window.innerWidth < 768) {
      setMenuAberto(false);
    }
  };

  const handleLogout = () => {
    fazerLogout();
    setTelaAtiva('login');
  };

  return (
    <>
      {/* Overlay para mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Menu lateral */}
      <div className={`
        fixed left-0 top-0 h-full ${temaComMenuAtivo.surface} shadow-lg z-50
        transform transition-transform duration-300 ease-in-out
        ${menuAberto ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
        w-64 flex flex-col
      `}>
        {/* Header do menu */}
        <div className={`${temaComMenuAtivo.primary} p-6`}>
          <h1 className="text-white text-xl font-bold">
            Sistema Consignação
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Gestão Completa
          </p>
        </div>

        {/* Lista de itens */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {itensMenuFiltrados.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 text-left
                    ${telaAtiva === item.id
                      ? `${temaComMenuAtivo.menuAtivo} ${temaComMenuAtivo.primary.replace('bg-', 'text-')} font-medium shadow-sm`
                      : `${temaComMenuAtivo.text} hover:${temaComMenuAtivo.hover}`
                    }
                  `}
                >
                  <span className={telaAtiva === item.id ? temaComMenuAtivo.primary.replace('bg-', 'text-') : temaComMenuAtivo.textSecondary}>
                    {item.icone}
                  </span>
                  <span>{item.nome}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer do menu */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg
              ${temaComMenuAtivo.text} hover:${temaComMenuAtivo.error} hover:text-white
              transition-all duration-200
            `}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};