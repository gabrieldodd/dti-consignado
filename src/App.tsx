// src/App.tsx
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { TelaConsignacoes } from './components/screens/TelaConsignacoes';
import { TelaVendedores } from './components/screens/TelaVendedores';
import { TelaProdutos } from './components/screens/TelaProdutos';
import { TelaCategorias } from './components/screens/TelaCategorias';
import { Login } from './components/screens/Login';
import { Dashboard } from './components/screens/Dashboard';
import { Mensagem } from './components/common/Mensagem';
import { LoadingGlobal } from './components/common/LoadingGlobal';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Tag, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  Settings,
  RefreshCw
} from 'lucide-react';

type TelaAtiva = 'login' | 'dashboard' | 'consignacoes' | 'produtos' | 'vendedores' | 'categorias';

// Componente de Loading Global
const LoadingOverlay: React.FC = () => {
  const { 
    loadingVendedores, 
    loadingProdutos, 
    loadingCategorias, 
    loadingConsignacoes,
    tema 
  } = useAppContext();

  const isLoading = loadingVendedores || loadingProdutos || loadingCategorias || loadingConsignacoes;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${tema.papel} p-6 rounded-lg shadow-xl flex items-center space-x-3`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className={`${tema.texto} font-medium`}>Carregando dados...</span>
      </div>
    </div>
  );
};

// Componente de Menu Lateral
const MenuLateral: React.FC<{
  telaAtiva: TelaAtiva;
  setTelaAtiva: (tela: TelaAtiva) => void;
  menuAberto: boolean;
  setMenuAberto: (aberto: boolean) => void;
}> = ({ telaAtiva, setTelaAtiva, menuAberto, setMenuAberto }) => {
  const { tema, tipoUsuario, fazerLogout, alternarTema, temaEscuro, refetchTodos } = useAppContext();

  const menuItems = [
    { 
      id: 'dashboard' as TelaAtiva, 
      label: 'Dashboard', 
      icon: BarChart3, 
      permitido: ['admin', 'vendedor'] 
    },
    { 
      id: 'consignacoes' as TelaAtiva, 
      label: 'Consignações', 
      icon: ShoppingCart, 
      permitido: ['admin', 'vendedor'] 
    },
    { 
      id: 'produtos' as TelaAtiva, 
      label: 'Produtos', 
      icon: Package, 
      permitido: ['admin'] 
    },
    { 
      id: 'vendedores' as TelaAtiva, 
      label: 'Vendedores', 
      icon: Users, 
      permitido: ['admin'] 
    },
    { 
      id: 'categorias' as TelaAtiva, 
      label: 'Categorias', 
      icon: Tag, 
      permitido: ['admin'] 
    }
  ];

  const itensPermitidos = menuItems.filter(item => item.permitido.includes(tipoUsuario));

  return (
    <>
      {/* Overlay */}
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}
      
      {/* Menu */}
      <div className={`
        fixed left-0 top-0 h-full w-64 ${tema.papel} border-r ${tema.borda} z-50
        transform ${menuAberto ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-xl font-bold ${tema.texto}`}>Sistema</h1>
            <button
              onClick={() => setMenuAberto(false)}
              className={`lg:hidden ${tema.texto} hover:${tema.hover} p-1 rounded`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {itensPermitidos.map(item => {
              const Icon = item.icon;
              const ativo = telaAtiva === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTelaAtiva(item.id);
                    setMenuAberto(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left
                    ${ativo 
                      ? 'bg-blue-600 text-white' 
                      : `${tema.texto} ${tema.hover}`
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Configurações */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={alternarTema}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${tema.texto} ${tema.hover}`}
            >
              {temaEscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>{temaEscuro ? 'Tema Claro' : 'Tema Escuro'}</span>
            </button>
            
            <button
              onClick={refetchTodos}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${tema.texto} ${tema.hover}`}
            >
              <RefreshCw className="h-5 w-5" />
              <span>Atualizar Dados</span>
            </button>
            
            <button
              onClick={fazerLogout}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${tema.texto} ${tema.hover}`}
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const { tema, usuarioLogado } = useAppContext();
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>(() => {
    return usuarioLogado ? 'dashboard' : 'login';
  });
  const [menuAberto, setMenuAberto] = useState(false);

  // Verificar se está logado
  useEffect(() => {
    if (!usuarioLogado) {
      setTelaAtiva('login');
    }
  }, [usuarioLogado]);

  // Se não estiver logado, mostrar tela de login
  if (telaAtiva === 'login') {
    return (
      <div className={`min-h-screen ${tema.fundo}`}>
        <Login onLoginSuccess={() => setTelaAtiva('dashboard')} />
      </div>
    );
  }

  const renderizarTela = () => {
    switch (telaAtiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'consignacoes':
        return <TelaConsignacoes />;
      case 'produtos':
        return <TelaProdutos />;
      case 'vendedores':
        return <TelaVendedores />;
      case 'categorias':
        return <TelaCategorias />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${tema.fundo}`}>
      {/* Loading Overlay */}
      <LoadingOverlay />
      
      {/* Menu Lateral */}
      <MenuLateral 
        telaAtiva={telaAtiva}
        setTelaAtiva={setTelaAtiva}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      {/* Conteúdo Principal */}
      <div className="lg:ml-64">
        {/* Header Mobile */}
        <div className={`lg:hidden ${tema.papel} border-b ${tema.borda} p-4`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMenuAberto(true)}
              className={`${tema.texto} hover:${tema.hover} p-1 rounded`}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className={`text-lg font-semibold ${tema.texto}`}>
              Sistema de Consignação
            </h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Conteúdo da Tela */}
        <main className="p-6">
          {renderizarTela()}
        </main>
      </div>

      {/* Mensagens */}
      <Mensagem />
    </div>
  );
};

// App Principal com Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;