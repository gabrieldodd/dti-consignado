// src/components/layout/MenuLateral.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Tags, 
  Moon, 
  Sun, 
  LogOut,
  X
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

type TipoUsuario = 'admin' | 'vendedor' | null;

interface MenuLateralProps {
  telaAtiva: string;
  onMudarTela: (tela: string) => void;
  menuAberto: boolean;
  onFecharMenu: () => void;
  tipoUsuario: TipoUsuario;
  usuarioLogado: any;
  onToggleTema: () => void;
  onLogout: () => void;
  temaEscuro: boolean;
}

export const MenuLateral: React.FC<MenuLateralProps> = ({
  telaAtiva,
  onMudarTela,
  menuAberto,
  onFecharMenu,
  tipoUsuario,
  usuarioLogado,
  onToggleTema,
  onLogout,
  temaEscuro
}) => {
  const { tema } = useAppContext();

  // Itens do menu com permissões
  const itensMenu = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      permissao: ['admin', 'vendedor'] 
    },
    { 
      id: 'consignacoes', 
      label: 'Consignações', 
      icon: ShoppingCart, 
      permissao: ['admin', 'vendedor'] 
    },
    { 
      id: 'vendedores', 
      label: 'Vendedores', 
      icon: Users, 
      permissao: ['admin'] 
    },
    { 
      id: 'produtos', 
      label: 'Produtos', 
      icon: Package, 
      permissao: ['admin'] 
    },
    { 
      id: 'categorias', 
      label: 'Categorias', 
      icon: Tags, 
      permissao: ['admin'] 
    }
  ];

  // Filtrar itens baseado nas permissões do usuário
  const itensPermitidos = itensMenu.filter(item => 
    item.permissao.includes(tipoUsuario || '')
  );

  // Função para lidar com logout com confirmação
  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      onLogout();
    }
  };

  return (
    <>
      {/* Menu Desktop */}
      <aside className={`hidden lg:flex lg:flex-col lg:w-64 ${tema.papel} ${tema.borda} border-r transition-colors duration-300`}>
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Header do Menu */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200 bg-blue-600">
            <h1 className="text-lg font-semibold text-white">
              Sistema de Consignação
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {itensPermitidos.map((item) => {
              const isActive = telaAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onMudarTela(item.id)}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? tema.menuAtivo
                      : `${tema.texto} ${tema.hover}`
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className={`flex-shrink-0 flex ${tema.borda} border-t p-4`}>
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${tema.texto} truncate`}>
                    {usuarioLogado?.nome}
                  </p>
                  <p className={`text-xs ${tema.textoSecundario}`}>
                    {tipoUsuario === 'admin' ? 'Administrador' : 'Vendedor'}
                  </p>
                </div>
                <div className="flex space-x-2 ml-3">
                  <button
                    onClick={onToggleTema}
                    className={`p-2 rounded-md ${tema.hover} ${tema.texto} transition-colors`}
                    title={temaEscuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
                  >
                    {temaEscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-md ${tema.hover} text-red-600 hover:text-red-700 transition-colors`}
                    title="Sair do sistema"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Menu Mobile */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 ${tema.papel} transform ${
        menuAberto ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out shadow-lg`}>
        
        {/* Header Mobile */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-blue-600">
          <h1 className="text-lg font-semibold text-white">
            Sistema de Consignação
          </h1>
          <button
            onClick={onFecharMenu}
            className="p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Mobile */}
        <nav className="px-2 py-4 space-y-1">
          {itensPermitidos.map((item) => {
            const isActive = telaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onMudarTela(item.id);
                  onFecharMenu(); // Fechar menu ao navegar
                }}
                className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? tema.menuAtivo
                    : `${tema.texto} ${tema.hover}`
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Info Mobile */}
        <div className={`absolute bottom-0 left-0 right-0 flex ${tema.borda} border-t p-4`}>
          <div className="flex-shrink-0 w-full">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${tema.texto} truncate`}>
                  {usuarioLogado?.nome}
                </p>
                <p className={`text-xs ${tema.textoSecundario}`}>
                  {tipoUsuario === 'admin' ? 'Administrador' : 'Vendedor'}
                </p>
              </div>
              <div className="flex space-x-2 ml-3">
                <button
                  onClick={onToggleTema}
                  className={`p-2 rounded-md ${tema.hover} ${tema.texto} transition-colors`}
                  title={temaEscuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
                >
                  {temaEscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-md ${tema.hover} text-red-600 hover:text-red-700 transition-colors`}
                  title="Sair do sistema"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};