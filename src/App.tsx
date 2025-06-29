import React, { useState, useCallback, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Login } from './components/screens/Login';
import { Dashboard } from './components/screens/Dashboard';
import { MenuLateral } from './components/layout/MenuLateral';

// Componentes de tela (temporários - serão criados depois)
const TelaConsignacoes = () => {
  const { tema } = useAppContext();
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <h1 className={`text-3xl font-bold ${tema.texto} mb-6`}>Consignações</h1>
      <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
        <p className={tema.textoSecundario}>Tela de Consignações em desenvolvimento...</p>
      </div>
    </div>
  );
};

const TelaVendedores = () => {
  const { tema } = useAppContext();
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <h1 className={`text-3xl font-bold ${tema.texto} mb-6`}>Vendedores</h1>
      <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
        <p className={tema.textoSecundario}>Tela de Vendedores em desenvolvimento...</p>
      </div>
    </div>
  );
};

const TelaProdutos = () => {
  const { tema } = useAppContext();
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <h1 className={`text-3xl font-bold ${tema.texto} mb-6`}>Produtos</h1>
      <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
        <p className={tema.textoSecundario}>Tela de Produtos em desenvolvimento...</p>
      </div>
    </div>
  );
};

const TelaCategorias = () => {
  const { tema } = useAppContext();
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <h1 className={`text-3xl font-bold ${tema.texto} mb-6`}>Categorias</h1>
      <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
        <p className={tema.textoSecundario}>Tela de Categorias em desenvolvimento...</p>
      </div>
    </div>
  );
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const { 
    usuarioLogado, 
    setUsuarioLogado,
    setTipoUsuario,
    vendedores,
    mostrarMensagem,
    tema,
    temaEscuro,
    setTemaEscuro
  } = useAppContext();

  // Estados locais
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);

  // Função de login
  const fazerLogin = useCallback((login: string, senha: string) => {
    // Verificar admin
    if (login === 'admin' && senha === 'admin123') {
      setUsuarioLogado({ id: 0, nome: 'Administrador', login: 'admin' });
      setTipoUsuario('admin');
      mostrarMensagem('success', 'Login realizado com sucesso!');
      return;
    }

    // Verificar vendedores
    const vendedor = vendedores.find(v => 
      v.login === login && 
      v.senha === senha && 
      v.status === 'Ativo'
    );

    if (vendedor) {
      setUsuarioLogado(vendedor);
      setTipoUsuario('vendedor');
      mostrarMensagem('success', 'Login realizado com sucesso!');
    } else {
      mostrarMensagem('error', 'Login ou senha inválidos!');
    }
  }, [vendedores, setUsuarioLogado, setTipoUsuario, mostrarMensagem]);

  // Função de logout
  const fazerLogout = useCallback(() => {
    setUsuarioLogado(null);
    setTipoUsuario(null);
    setTelaAtiva('dashboard');
    mostrarMensagem('success', 'Logout realizado com sucesso!');
  }, [setUsuarioLogado, setTipoUsuario, mostrarMensagem]);

  // Função para mudar tela
  const mudarTela = useCallback((tela: string) => {
    setTelaAtiva(tela);
    setMenuAberto(false); // Fecha menu mobile ao navegar
  }, []);

  // Função para alternar tema
  const toggleTema = useCallback(() => {
    setTemaEscuro(prev => !prev);
  }, [setTemaEscuro]);

  // Função para controlar menu mobile
  const toggleMenu = useCallback(() => {
    setMenuAberto(prev => !prev);
  }, []);

  const fecharMenu = useCallback(() => {
    setMenuAberto(false);
  }, []);

  // Renderizar conteúdo baseado na tela ativa
  const renderConteudo = useCallback(() => {
    switch (telaAtiva) {
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
  }, [telaAtiva]);

  // Se não está logado, mostrar tela de login
  if (!usuarioLogado) {
    return (
      <Login 
        onLogin={fazerLogin}
        temaEscuro={temaEscuro}
        onToggleTema={toggleTema}
      />
    );
  }

  // Interface principal com menu lateral
  return (
    <div className={`min-h-screen ${tema.fundo} flex`}>
      {/* Backdrop para mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={fecharMenu}
        />
      )}

      {/* Menu Lateral */}
      <MenuLateral 
        telaAtiva={telaAtiva}
        onMudarTela={mudarTela}
        menuAberto={menuAberto}
        onFecharMenu={fecharMenu}
        usuarioLogado={usuarioLogado}
        onToggleTema={toggleTema}
        onLogout={fazerLogout}
        temaEscuro={temaEscuro}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 lg:ml-0">
        {/* Header Mobile */}
        <div className={`${tema.papel} shadow-sm border-b ${tema.borda} lg:hidden`}>
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-md ${tema.hover} ${tema.texto}`}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className={`text-lg font-semibold ${tema.texto}`}>
              Sistema de Consignação
            </h1>
            <div className={`text-sm ${tema.textoSecundario}`}>
              {usuarioLogado?.nome}
            </div>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <main className="min-h-screen">
          {renderConteudo()}
        </main>
      </div>
    </div>
  );
};

// Componente App com Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;