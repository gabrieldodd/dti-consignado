// src/App.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Menu } from 'lucide-react';

// Contexts
import { AppProvider, useAppContext } from './contexts/AppContext';

// Hooks
import { useCookies } from './hooks/useCookies';

// Components - Layout
import { MenuLateral } from './components/layout/MenuLateral';
import { Header } from './components/layout/Header';

// Components - Screens
import { Login } from './components/screens/Login';
import { Dashboard } from './components/screens/Dashboard';
import { TelaConsignacoes } from './components/screens/TelaConsignacoes';
import { TelaProdutos } from './components/screens/TelaProdutos';
import { TelaVendedores } from './components/screens/TelaVendedores';
import { TelaCategorias } from './components/screens/TelaCategorias';

// Components - Common
import { Mensagem } from './components/common/Mensagem';

// Utils
import { COOKIE_CONFIG, ADMIN_CREDENTIALS, MESSAGES } from './utils/constants';

// Types
import { TipoUsuario } from './types/Common';
import { Vendedor } from './types/Vendedor';

/**
 * Componente principal da aplicação
 */
const AppContent: React.FC = () => {
  const { 
    usuarioLogado, 
    setUsuarioLogado,
    tipoUsuario, 
    setTipoUsuario,
    temaEscuro,
    setTemaEscuro,
    tema,
    vendedores,
    mostrarMensagem,
    cookies
  } = useAppContext();

  // Estados locais do App
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);
  const [mensagem, setMensagem] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);

  // Hook de cookies para funcionalidades específicas do App
  const { setCookie, getCookie } = useCookies();

  // Carrega preferências salvas
  useEffect(() => {
    if (usuarioLogado) {
      // Restaurar última tela ativa
      const ultimaTela = getCookie(COOKIE_CONFIG.ULTIMA_TELA_ATIVA);
      
      if (tipoUsuario === 'admin') {
        if (ultimaTela && ['dashboard', 'consignacoes', 'vendedores', 'produtos', 'categorias'].includes(ultimaTela)) {
          setTelaAtiva(ultimaTela);
        }
      } else if (tipoUsuario === 'vendedor') {
        if (ultimaTela && ['dashboard', 'consignacoes'].includes(ultimaTela)) {
          setTelaAtiva(ultimaTela);
        } else {
          setTelaAtiva('consignacoes'); // Vendedores iniciam nas consignações
        }
      }
    }
  }, [usuarioLogado, tipoUsuario, getCookie]);

  // Salva preferências quando mudam
  useEffect(() => {
    if (usuarioLogado) {
      setCookie(COOKIE_CONFIG.ULTIMA_TELA_ATIVA, telaAtiva, 7);
      setCookie(COOKIE_CONFIG.ULTIMO_TIPO_USUARIO, tipoUsuario || '', 7);
    }
  }, [telaAtiva, tipoUsuario, usuarioLogado, setCookie]);

  // Função de login
  const fazerLogin = useCallback((login: string, senha: string) => {
    // Verificar credenciais do admin
    if (login === ADMIN_CREDENTIALS.LOGIN && senha === ADMIN_CREDENTIALS.SENHA) {
      const usuario = { 
        id: 0, 
        nome: ADMIN_CREDENTIALS.NOME, 
        login: ADMIN_CREDENTIALS.LOGIN 
      };
      setUsuarioLogado(usuario);
      setTipoUsuario('admin');
      
      // Salvar informações do login
      setCookie(COOKIE_CONFIG.ULTIMO_LOGIN, login, 30);
      setCookie(COOKIE_CONFIG.ULTIMO_LOGIN_TEMPO, new Date().toISOString(), 7);
      
      return;
    }

    // Verificar credenciais dos vendedores
    const vendedor = vendedores.find((v: Vendedor) => 
      v.login === login && 
      v.senha === senha && 
      v.status === 'Ativo'
    );

    if (vendedor) {
      setUsuarioLogado(vendedor);
      setTipoUsuario('vendedor');
      
      // Salvar informações do login
      setCookie(COOKIE_CONFIG.ULTIMO_LOGIN, login, 30);
      setCookie(COOKIE_CONFIG.ULTIMO_LOGIN_TEMPO, new Date().toISOString(), 7);
    } else {
      mostrarMensagem('error', MESSAGES.ERROR.LOGIN_INVALIDO);
    }
  }, [vendedores, setUsuarioLogado, setTipoUsuario, setCookie, mostrarMensagem]);

  // Função de logout
  const fazerLogout = useCallback(() => {
    setUsuarioLogado(null);
    setTipoUsuario(null);
    setTelaAtiva('dashboard');
    
    // Limpar cookies da sessão
    setCookie(COOKIE_CONFIG.ULTIMA_TELA_ATIVA, '', -1);
    setCookie(COOKIE_CONFIG.ULTIMO_TIPO_USUARIO, '', -1);
    setCookie(COOKIE_CONFIG.ULTIMO_LOGIN_TEMPO, '', -1);
    
    mostrarMensagem('success', MESSAGES.SUCCESS.LOGOUT);
  }, [setUsuarioLogado, setTipoUsuario, setCookie, mostrarMensagem]);

  // Função para mudar tela
  const mudarTela = useCallback((tela: string) => {
    setTelaAtiva(tela);
  }, []);

  // Funções do menu
  const fecharMenu = useCallback(() => {
    setMenuAberto(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuAberto((prev: boolean) => !prev);
  }, []);

  // Função para alternar tema
  const toggleTema = useCallback(() => {
    setTemaEscuro((prev: boolean) => !prev);
  }, [setTemaEscuro]);

  // Renderizar conteúdo baseado na tela ativa
  const renderConteudo = useCallback(() => {
    switch (telaAtiva) {
      case 'consignacoes':
        return <TelaConsignacoes />;
      case 'vendedores':
        return tipoUsuario === 'admin' ? <TelaVendedores /> : <Dashboard />;
      case 'produtos':
        return tipoUsuario === 'admin' ? <TelaProdutos /> : <Dashboard />;
      case 'categorias':
        return tipoUsuario === 'admin' ? <TelaCategorias /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  }, [telaAtiva, tipoUsuario]);

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

  // Renderizar aplicação principal
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
        tipoUsuario={tipoUsuario}
        usuarioLogado={usuarioLogado}
        onToggleTema={toggleTema}
        onLogout={fazerLogout}
        temaEscuro={temaEscuro}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 lg:ml-0">
        {/* Header Mobile */}
        <Header 
          menuAberto={menuAberto}
          onToggleMenu={toggleMenu}
        />

        {/* Área de Conteúdo */}
        <main className="min-h-screen">
          {renderConteudo()}
        </main>
      </div>

      {/* Componente de Mensagens */}
      <Mensagem mensagem={mensagem} />
    </div>
  );
};

/**
 * Componente App com Provider
 */
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;