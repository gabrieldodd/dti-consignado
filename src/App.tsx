// src/App.tsx
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Login } from './components/screens/Login';
import { Dashboard } from './components/screens/Dashboard';
import { TelaConsignacoes } from './components/screens/TelaConsignacoes';
import { TelaVendedores } from './components/screens/TelaVendedores';
import { TelaProdutos } from './components/screens/TelaProdutos';
import { TelaCategorias } from './components/screens/TelaCategorias';
import { MenuLateral } from './components/layout/MenuLateral';
import { Menu, Sun, Moon, User } from 'lucide-react';
import { verificarSupabaseAoIniciar } from './utils/testSupabase';

const AppContent: React.FC = () => {
  const { 
    tema, 
    temaEscuro, 
    setTemaEscuro, 
    usuarioLogado, 
    setUsuarioLogado,
    tipoUsuario,
    setTipoUsuario,
    cookies
  } = useAppContext();

  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);
  const [sistemaInicializado, setSistemaInicializado] = useState(false);

  // Verificar login salvo ao inicializar
  useEffect(() => {
	verificarSupabaseAoIniciar();
    const usuarioSalvo = cookies.getCookie('usuarioLogado');
    const tipoSalvo = cookies.getCookie('tipoUsuario');
    
    if (usuarioSalvo && tipoSalvo) {
      try {
        const usuario = JSON.parse(usuarioSalvo);
        setUsuarioLogado(usuario);
        setTipoUsuario(tipoSalvo);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        cookies.removeCookie('usuarioLogado');
        cookies.removeCookie('tipoUsuario');
      }
    }
    
    setSistemaInicializado(true);
  }, []);

  // Handler para login bem-sucedido
  const handleLoginSuccess = () => {
    setTelaAtiva('dashboard');
  };

  // Renderizar componente da tela ativa
  const renderizarTelaAtiva = () => {
    switch (telaAtiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'consignacoes':
        return <TelaConsignacoes />;
      case 'vendedores':
        return <TelaVendedores />;
      case 'produtos':
        return <TelaProdutos />;
      case 'categorias':
        return <TelaCategorias />;
      default:
        return <Dashboard />;
    }
  };

  // Mostrar loading enquanto inicializa
  if (!sistemaInicializado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de login se usuário não estiver logado
  if (!usuarioLogado) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen ${tema.background}`}>
      {/* Header */}
      <header className={`${tema.surface} shadow-sm border-b ${tema.border} sticky top-0 z-30`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Menu Mobile */}
            <div className="flex items-center">
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className={`p-2 rounded-md ${tema.text} hover:${tema.hover} md:hidden`}
              >
                <Menu size={24} />
              </button>
              
              {/* Logo/Título */}
              <h1 className={`ml-2 md:ml-0 text-xl font-bold ${tema.text}`}>
                Sistema Consignação
              </h1>
            </div>

            {/* Ações do Header */}
            <div className="flex items-center space-x-4">
              {/* Toggle Tema */}
              <button
                onClick={() => setTemaEscuro(!temaEscuro)}
                className={`p-2 rounded-md ${tema.textSecondary} hover:${tema.text} transition-colors`}
                title={temaEscuro ? 'Modo Claro' : 'Modo Escuro'}
              >
                {temaEscuro ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Informações do Usuário */}
              <div className="flex items-center space-x-2">
                <div className={`hidden sm:block text-right text-sm ${tema.text}`}>
                  <p className="font-medium">{usuarioLogado.nome}</p>
                  <p className={`${tema.textSecondary} text-xs capitalize`}>
                    {tipoUsuario}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${tema.primary}`}>
                  <User size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout Principal */}
      <div className="flex">
        {/* Menu Lateral */}
        <MenuLateral
          telaAtiva={telaAtiva}
          setTelaAtiva={setTelaAtiva}
          menuAberto={menuAberto}
          setMenuAberto={setMenuAberto}
        />

        {/* Conteúdo Principal */}
        <main className="flex-1 md:ml-0">
          {renderizarTelaAtiva()}
        </main>
      </div>

      {/* Overlay para fechar menu em mobile */}
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;