// App.tsx - VERSÃO SIMPLIFICADA SEM TRAVAMENTOS
import React, { useState, useCallback, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts/AppContext';

// Importar apenas as telas que funcionam
import { Dashboard } from './components/screens/Dashboard';
import { TelaVendedores } from './components/screens/TelaVendedores';
import { TelaProdutos } from './components/screens/TelaProdutos';
import { TelaCategorias } from './components/screens/TelaCategorias';
import { TelaConsignacoes } from './components/screens/TelaConsignacoes';

// Componente de Login SIMPLES
const Login: React.FC<{ onLogin: (login: string, senha: string) => void }> = ({ onLogin }) => {
  const [formData, setFormData] = useState({ login: '', senha: '' });
  const [carregando, setCarregando] = useState(false);
  const { tema, temaEscuro, setTemaEscuro } = useAppContext();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.login || !formData.senha) return;
    
    setCarregando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      onLogin(formData.login, formData.senha);
    } finally {
      setCarregando(false);
    }
  }, [formData, onLogin]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.fundo}`}>
      <div className={`w-full max-w-md ${tema.papel} rounded-lg shadow-lg p-8 border ${tema.borda}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${tema.texto}`}>Login</h1>
          <button
            onClick={() => setTemaEscuro(!temaEscuro)}
            className={`p-2 rounded-lg ${tema.hover}`}
          >
            {temaEscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
              Login
            </label>
            <input
              type="text"
              value={formData.login}
              onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
              placeholder="Digite seu login"
              disabled={carregando}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
              Senha
            </label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
              placeholder="Digite sua senha"
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            disabled={carregando || !formData.login || !formData.senha}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={`mt-6 p-4 ${tema.fundo} rounded-lg`}>
          <p className={`text-sm ${tema.textoSecundario} mb-2`}>Contas de teste:</p>
          <p className={`text-xs ${tema.textoSecundario}`}>Admin: admin / admin123</p>
          <p className={`text-xs ${tema.textoSecundario}`}>Vendedor: joao123 / 123456</p>
        </div>
      </div>
    </div>
  );
};

// Menu Lateral SIMPLES
const MenuLateral: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tela: string) => void;
  telaAtiva: string;
  tipoUsuario: string | null;
}> = ({ isOpen, onClose, onNavigate, telaAtiva, tipoUsuario }) => {
  const { tema } = useAppContext();

  const menuItems = [
    { id: 'dashboard', nome: 'Dashboard', permissao: ['admin', 'vendedor'] },
    { id: 'consignacoes', nome: 'Consignações', permissao: ['admin', 'vendedor'] },
    { id: 'produtos', nome: 'Produtos', permissao: ['admin'] },
    { id: 'categorias', nome: 'Categorias', permissao: ['admin'] },
    { id: 'vendedores', nome: 'Vendedores', permissao: ['admin'] }
  ];

  const itensPermitidos = menuItems.filter(item => 
    item.permissao.includes(tipoUsuario || '')
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className={`fixed left-0 top-0 h-full w-64 ${tema.papel} shadow-lg z-50 transform transition-transform duration-300 border-r ${tema.borda}`}>
        <div className="p-4">
          <h2 className={`text-lg font-semibold ${tema.texto} mb-4`}>
            Sistema Consignação
          </h2>
          
          <nav className="space-y-1">
            {itensPermitidos.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  telaAtiva === item.id 
                    ? tema.menuAtivo
                    : `${tema.texto} ${tema.hover}`
                }`}
              >
                {item.nome}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const { 
    usuarioLogado, 
    setUsuarioLogado,
    setTipoUsuario,
    tipoUsuario,
    vendedores,
    mostrarMensagem,
    tema,
    temaEscuro,
    setTemaEscuro,
    cookies
  } = useAppContext();

  // Estados locais SIMPLES
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);

  // Função para fazer login SIMPLIFICADA
  const fazerLogin = useCallback((login: string, senha: string) => {
    // Admin
    if (login === 'admin' && senha === 'admin123') {
      setUsuarioLogado({ id: 0, nome: 'Administrador', login: 'admin' });
      setTipoUsuario('admin');
      mostrarMensagem('success', 'Login realizado com sucesso!');
      return;
    }

    // Vendedores
    const vendedor = vendedores.find(v => 
      v.login === login && 
      v.senha === senha && 
      v.status === 'Ativo'
    );

    if (vendedor) {
      setUsuarioLogado(vendedor);
      setTipoUsuario('vendedor');
      mostrarMensagem('success', `Bem-vindo, ${vendedor.nome}!`);
      return;
    }

    mostrarMensagem('error', 'Login ou senha inválidos!');
  }, [vendedores, setUsuarioLogado, setTipoUsuario, mostrarMensagem]);

  // Função para logout SIMPLIFICADA
  const fazerLogout = useCallback(() => {
    setUsuarioLogado(null);
    setTipoUsuario(null);
    setTelaAtiva('dashboard');
    mostrarMensagem('success', 'Logout realizado com sucesso!');
  }, [setUsuarioLogado, setTipoUsuario, mostrarMensagem]);

  // Verificar permissões
  const podeAcessarTela = useCallback((tela: string): boolean => {
    if (!usuarioLogado) return false;
    
    switch (tela) {
      case 'vendedores':
      case 'produtos':
      case 'categorias':
        return tipoUsuario === 'admin';
      case 'consignacoes':
      case 'dashboard':
        return tipoUsuario === 'admin' || tipoUsuario === 'vendedor';
      default:
        return false;
    }
  }, [usuarioLogado, tipoUsuario]);

  // Navegar entre telas
  const navegarPara = useCallback((tela: string) => {
    if (podeAcessarTela(tela) || tela === 'dashboard') {
      setTelaAtiva(tela);
      setMenuAberto(false);
    } else {
      mostrarMensagem('error', 'Você não tem permissão para acessar esta funcionalidade');
    }
  }, [podeAcessarTela, mostrarMensagem]);

  // Renderizar tela ativa SIMPLIFICADO
  const renderizarTela = useCallback(() => {
    if (!usuarioLogado) return <Login onLogin={fazerLogin} />;

    switch (telaAtiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'vendedores':
        return podeAcessarTela('vendedores') ? <TelaVendedores /> : <Dashboard />;
      case 'produtos':
        return podeAcessarTela('produtos') ? <TelaProdutos /> : <Dashboard />;
      case 'categorias':
        return podeAcessarTela('categorias') ? <TelaCategorias /> : <Dashboard />;
      case 'consignacoes':
        return podeAcessarTela('consignacoes') ? <TelaConsignacoes /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  }, [usuarioLogado, telaAtiva, podeAcessarTela, fazerLogin]);

  // Se não estiver logado, mostrar apenas login
  if (!usuarioLogado) {
    return renderizarTela();
  }

  return (
    <div className={`min-h-screen ${tema.fundo}`}>
      {/* Header */}
      <header className={`${tema.papel} border-b ${tema.borda} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMenuAberto(true)}
              className={`p-2 rounded-md ${tema.hover}`}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className={`text-lg font-semibold ${tema.texto}`}>
              Sistema de Consignação
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`text-sm ${tema.textoSecundario}`}>
              {usuarioLogado.nome}
            </span>
            
            <button
              onClick={() => setTemaEscuro(!temaEscuro)}
              className={`p-2 rounded-md ${tema.hover}`}
              title="Alternar tema"
            >
              {temaEscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={fazerLogout}
              className={`p-2 rounded-md ${tema.hover} text-red-600`}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Lateral */}
      <MenuLateral
        isOpen={menuAberto}
        onClose={() => setMenuAberto(false)}
        onNavigate={navegarPara}
        telaAtiva={telaAtiva}
        tipoUsuario={tipoUsuario}
      />

      {/* Conteúdo Principal */}
      <main>
        {renderizarTela()}
      </main>
    </div>
  );
};

// App principal
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;