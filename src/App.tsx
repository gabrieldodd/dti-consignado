// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Login } from './components/screens/Login';
import { Dashboard } from './components/screens/Dashboard';
import { TelaVendedores } from './components/screens/TelaVendedores';
import { TelaProdutos } from './components/screens/TelaProdutos';
import { TelaCategorias } from './components/screens/TelaCategorias';
import { TelaConsignacoes } from './components/screens/TelaConsignacoes';
import { MenuLateral } from './components/layout/MenuLateral';


// Componentes de tela temporários (serão criados depois)
/*const TelaConsignacoes = () => {
  const { tema } = useAppContext();
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <h1 className={`text-3xl font-bold ${tema.texto} mb-6`}>Consignações</h1>
      <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
        <p className={tema.textoSecundario}>Tela de Consignações em desenvolvimento...</p>
      </div>
    </div>
  );
};*/

/*const TelaCategorias = () => {
  const { tema } = useAppContext();
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <h1 className={`text-3xl font-bold ${tema.texto} mb-6`}>Categorias</h1>
      <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
        <p className={tema.textoSecundario}>Tela de Categorias em desenvolvimento...</p>
      </div>
    </div>
  );
};*/

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
    cookies,
    salvarPreferencias
  } = useAppContext();

  // Estados locais
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);
  const [verificandoLogin, setVerificandoLogin] = useState(true);
  const [logoutManual, setLogoutManual] = useState(false);

  // Função para validar credenciais
  const validarCredenciais = useCallback(async (login: string, senha: string): Promise<boolean> => {
    // Verificar admin
    if (login === 'admin' && senha === 'admin123') {
      setUsuarioLogado({ id: 0, nome: 'Administrador', login: 'admin' });
      setTipoUsuario('admin');
      return true;
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
      return true;
    }

    return false;
  }, [vendedores, setUsuarioLogado, setTipoUsuario]);

  // Verificar se há login salvo válido na inicialização
  useEffect(() => {
    const verificarLoginSalvo = async () => {
      try {
        // Não fazer auto-login se foi logout manual recente
        if (logoutManual) {
          console.log('Logout manual detectado, pulando auto-login');
          setLogoutManual(false);
          setVerificandoLogin(false);
          return;
        }

        const preferencias = {
          login: cookies.getCookie('preferencias_login'),
          senha: cookies.getCookie('preferencias_senha'),
          autoLogin: cookies.getCookie('preferencias_auto_login') === 'true',
          ultimoLogin: cookies.getCookie('preferencias_ultimo_login')
        };

        // Se tem credenciais salvas e auto-login habilitado
        if (preferencias.autoLogin && preferencias.login && preferencias.senha) {
          console.log('Tentando login automático...');
          
          // Verificar se as credenciais ainda são válidas
          const loginValido = await validarCredenciais(preferencias.login, preferencias.senha);
          
          if (loginValido) {
            console.log('Login automático realizado com sucesso');
            mostrarMensagem('success', 'Login automático realizado!');
            
            // Atualizar timestamp de último login
            cookies.setCookie('sistema_timestamp_login', new Date().toISOString(), 7);
          } else {
            // Credenciais inválidas, limpar cookies
            cookies.deleteCookie('preferencias_login');
            cookies.deleteCookie('preferencias_senha');
            cookies.deleteCookie('preferencias_auto_login');
            mostrarMensagem('error', 'Credenciais salvas expiraram. Faça login novamente.');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar login salvo:', error);
      } finally {
        setVerificandoLogin(false);
      }
    };

    verificarLoginSalvo();
  }, [cookies, mostrarMensagem, logoutManual, validarCredenciais]);

  // Função de login com persistência
  const fazerLogin = useCallback(async (login: string, senha: string, lembrar: boolean = false) => {
    try {
      // Reset do flag de logout manual quando faz login intencional
      setLogoutManual(false);
      
      const loginValido = await validarCredenciais(login, senha);

      if (loginValido) {
        // Salvar timestamp do login
        cookies.setCookie('sistema_timestamp_login', new Date().toISOString(), 7);
        
        // Salvar preferências se solicitado
        if (lembrar) {
          cookies.setCookie('preferencias_login', login, 30);
          cookies.setCookie('preferencias_senha', senha, 7);
          cookies.setCookie('preferencias_lembrar', 'true', 30);
          cookies.setCookie('preferencias_auto_login', 'true', 7);
          cookies.setCookie('preferencias_ultimo_login', new Date().toISOString(), 30);
        }
        
        // Registrar atividade
        salvarPreferencias();
        
        mostrarMensagem('success', 'Login realizado com sucesso!');
        
        console.log('Login realizado:', { 
          login, 
          lembrar, 
          timestamp: new Date().toISOString() 
        });
      } else {
        mostrarMensagem('error', 'Login ou senha inválidos!');
        
        // Se tentou lembrar mas falhou, limpar credenciais salvas
        if (lembrar) {
          cookies.deleteCookie('preferencias_login');
          cookies.deleteCookie('preferencias_senha');
          cookies.deleteCookie('preferencias_auto_login');
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      mostrarMensagem('error', 'Erro interno. Tente novamente.');
    }
  }, [validarCredenciais, mostrarMensagem, cookies, salvarPreferencias, setLogoutManual]);

  // Função de logout com limpeza de preferências
  const fazerLogout = useCallback(() => {
    try {
      console.log('Iniciando logout...');
      
      // Marcar que foi logout manual para evitar auto-login
      setLogoutManual(true);
      
      // Limpar dados do usuário
      setUsuarioLogado(null);
      setTipoUsuario(null);
      setTelaAtiva('dashboard');
      
      // Limpar cookies de sessão
      cookies.deleteCookie('sistema_usuario_id');
      cookies.deleteCookie('sistema_tipo_usuario');
      cookies.deleteCookie('sistema_usuario_nome');
      cookies.deleteCookie('sistema_timestamp_login');
      
      // Sempre desabilitar auto-login no logout
      cookies.deleteCookie('preferencias_auto_login');
      
      // Verificar se deve manter credenciais salvas para próximo login manual
      const manterLogin = cookies.getCookie('preferencias_lembrar') === 'true';
      
      if (!manterLogin) {
        // Se não quer manter, limpar tudo
        cookies.deleteCookie('preferencias_login');
        cookies.deleteCookie('preferencias_senha');
        cookies.deleteCookie('preferencias_ultimo_login');
        cookies.deleteCookie('preferencias_lembrar');
      }
      
      mostrarMensagem('success', 'Logout realizado com sucesso!');
      
      console.log('Logout realizado:', { 
        manterCredenciais: manterLogin,
        timestamp: new Date().toISOString() 
      });
      
    } catch (error) {
      console.error('Erro no logout:', error);
      mostrarMensagem('error', 'Erro durante logout, mas você foi desconectado.');
    }
  }, [setUsuarioLogado, setTipoUsuario, setTelaAtiva, cookies, mostrarMensagem, setLogoutManual]);

  // Verificar permissões da tela
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

  // Função para navegar entre telas
  const navegarPara = useCallback((tela: string) => {
    if (podeAcessarTela(tela) || tela === 'dashboard') {
      setTelaAtiva(tela);
      setMenuAberto(false);
      
      // Salvar última tela acessada
      cookies.setCookie('sistema_ultima_tela', tela, 1);
    } else {
      mostrarMensagem('error', 'Você não tem permissão para acessar esta funcionalidade');
    }
  }, [podeAcessarTela, mostrarMensagem, cookies]);

  // Função para alternar tema
  const toggleTema = useCallback(() => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);
    
    // Salvar preferência imediatamente
    cookies.setCookie('sistema_tema', novoTema ? 'escuro' : 'claro', 365);
    
    mostrarMensagem('success', `Tema ${novoTema ? 'escuro' : 'claro'} ativado!`);
  }, [temaEscuro, setTemaEscuro, cookies, mostrarMensagem]);

  // Renderizar tela ativa
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

  // Loading durante verificação de login
  if (verificandoLogin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tema.fundo}`}>
        <div className={`${tema.papel} p-8 rounded-lg shadow-lg border ${tema.borda} max-w-md w-full mx-4`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className={`text-lg font-medium ${tema.texto} mb-2`}>
              Iniciando Sistema...
            </h2>
            <p className={`text-sm ${tema.textoSecundario}`}>
              Carregando preferências e verificando credenciais
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar apenas a tela de login
  if (!usuarioLogado) {
    return (
      <Login 
        onLogin={fazerLogin}
        temaEscuro={temaEscuro}
        onToggleTema={toggleTema}
      />
    );
  }

  return (
    <div className={`flex h-screen ${tema.fundo}`}>
      {/* Menu Lateral */}
      <MenuLateral
        telaAtiva={telaAtiva}
        onMudarTela={navegarPara}
        menuAberto={menuAberto}
        onFecharMenu={() => setMenuAberto(false)}
        tipoUsuario={tipoUsuario}
        usuarioLogado={usuarioLogado}
        onToggleTema={toggleTema}
        onLogout={fazerLogout}
        temaEscuro={temaEscuro}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <div className={`lg:hidden ${tema.papel} border-b ${tema.borda} px-4 py-3 flex items-center justify-between`}>
          <button
            onClick={() => setMenuAberto(true)}
            className={`p-2 rounded-md ${tema.hover}`}
          >
            <Menu className={`h-6 w-6 ${tema.texto}`} />
          </button>
          <h1 className={`text-lg font-semibold ${tema.texto}`}>
            Sistema de Consignação
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-auto">
          {renderizarTela()}
        </main>
      </div>

      {/* Overlay para mobile */}
      {menuAberto && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMenuAberto(false)}
        />
      )}
    </div>
  );
};

// Componente principal com Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;