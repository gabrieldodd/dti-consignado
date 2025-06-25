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
import { TipoUsuario } from '../../types/Common';

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

  const itensMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permissao: ['admin', 'vendedor'] },
    { id: 'consignacoes', label: 'Consignações', icon: ShoppingCart, permissao: ['admin', 'vendedor'] },
    { id: 'vendedores', label: 'Vendedores', icon: Users, permissao: ['admin'] },
    { id: 'produtos', label: 'Produtos', icon: Package, permissao: ['admin'] },
    { id: 'categorias', label: 'Categorias', icon: Tags, permissao: ['admin'] }
  ];

  const itensPermitidos = itensMenu.filter(item => 
    item.permissao.includes(tipoUsuario || '')
  );

  return (
    <>
      {/* Menu Desktop */}
      <aside className={`hidden lg:flex lg:flex-col lg:w-64 ${tema.papel} ${tema.borda} border-r`}>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header do Menu */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h1 className={`text-lg font-semibold ${tema.texto}`}>
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
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
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
                <div>
                  <p className={`text-sm font-medium ${tema.texto}`}>
                    {usuarioLogado?.nome}
                  </p>
                  <p className={`text-xs ${tema.textoSecundario}`}>
                    {tipoUsuario === 'admin' ? 'Administrador' : 'Vendedor'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={onToggleTema}
                    className={`p-2 rounded-md ${tema.hover} ${tema.texto}`}
                    title="Alternar tema"
                  >
                    {temaEscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={onLogout}
                    className={`p-2 rounded-md ${tema.hover} text-red-600`}
                    title="Sair"
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
      } transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className={`text-lg font-semibold ${tema.texto}`}>
            Sistema de Consignação
          </h1>
          <button
            onClick={onFecharMenu}
            className={`p-2 rounded-md ${tema.hover} ${tema.texto}`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1">
          {itensPermitidos.map((item) => {
            const isActive = telaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onMudarTela(item.id);
                  onFecharMenu();
                }}
                className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
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

        <div className={`absolute bottom-0 left-0 right-0 flex ${tema.borda} border-t p-4`}>
          <div className="flex-shrink-0 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${tema.texto}`}>
                  {usuarioLogado?.nome}
                </p>
                <p className={`text-xs ${tema.textoSecundario}`}>
                  {tipoUsuario === 'admin' ? 'Administrador' : 'Vendedor'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onToggleTema}
                  className={`p-2 rounded-md ${tema.hover} ${tema.texto}`}
                >
                  {temaEscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={onLogout}
                  className={`p-2 rounded-md ${tema.hover} text-red-600`}
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