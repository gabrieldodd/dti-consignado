import React, { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Login } from './components/screens/Login';
import { Dashboard } from './components/screens/Dashboard';
import { TelaVendedores } from './components/screens/TelaVendedores';
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

  // Verificar se há login salvo válido na inicialização
  useEffect(() => {
    const verificarLoginSalvo = async () => {
      try {
        const preferencias = {
          login: cookies.getCookie('preferencias_login'),
          senha: cookies.getCookie('preferencias_senha'),
          autoLogin: cookies.getCookie('preferencias_auto_login') === 'true',
          ultimoLogin: cookies.getCookie('preferencias_ultimo_login')
        };

        // Se tem credenciais salvas e auto-login habilitado
        if (preferencias.autoLogin && preferencias.login && preferencias.senha) {
          // Verificar se as credenciais ainda são válidas
          const loginValido = await validarCredenciais(preferencias.login, preferencias.senha);
          
          if (loginValido) {
            console.log('Login automático realizado com sucesso');
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
  }, [cookies, mostrarMensagem]);

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

  // Função de login com persistência
  const fazerLogin = useCallback(async (login: string, senha: string, lembrar: boolean = false) => {
    try {
      const loginValido = await validarCredenciais(login, senha);

      if (loginValido) {
        // Salvar timestamp do login
        cookies.setCookie('sistema_timestamp_login', new Date().toISOString(), 7);
        
        // Registrar atividade
        salvarPreferencias();
        
        mostrarMensagem('success', 'Login realizado com sucesso!');
        
        // Log para debug
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
  }, [validarCredenciais, mostrarMensagem, cookies, salvarPreferencias]);

  // Função de logout com limpeza de preferências
  const fazerLogout = useCallback(() => {
    try {
      // Salvar preferências antes do logout (exceto dados do usuário)
      const manterPreferencias = {
        tema: temaEscuro ? 'escuro' : 'claro'
      };
      
      // Limpar dados do usuário
      setUsuarioLogado(null);
      setTipoUsuario(null);
      setTelaAtiva('dashboard');
      
      // Manter apenas o tema, limpar dados de sessão
      cookies.deleteCookie('sistema_usuario_id');
      cookies.deleteCookie('sistema_tipo_usuario');
      cookies.deleteCookie('sistema_usuario_nome');
      cookies.deleteCookie('sistema_timestamp_login');
      
      // Verificar se deve manter login salvo
      const manterLogin = cookies.getCookie('preferencias_lembrar') === 'true';
      if (!manterLogin) {
        cookies.deleteCookie('preferencias_login');
        cookies.deleteCookie('preferencias_senha');
        cookies.deleteCookie('preferencias_auto_login');
        cookies.deleteCookie('preferencias_ultimo_login');
      }
      
      mostrarMensagem('success', 'Logout realizado com sucesso!');
      
      console.log('Logout realizado:', { 
        manterLogin,
        manterPreferencias,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }, [setUsuarioLogado, setTipoUsuario, temaEscuro, cookies, mostrarMensagem]);

  // Função para mudar tela
  const mudarTela = useCallback((tela: string) => {
    setTelaAtiva(tela);
    setMenuAberto(false); // Fecha menu mobile ao navegar
    
    // Registrar navegação para analytics (futuro)
    cookies.setCookie('sistema_ultima_tela', tela, 1);
  }, [cookies]);

  // Função para alternar tema com persistência
  const toggleTema = useCallback(() => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);
    
    // Salvar preferência imediatamente
    cookies.setCookie('sistema_tema', novoTema ? 'escuro' : 'claro', 365);
    
    mostrarMensagem('success', `Tema ${novoTema ? 'escuro' : 'claro'} ativado!`);
    
    console.log('Tema alterado:', { 
      anterior: temaEscuro ? 'escuro' : 'claro',
      novo: novoTema ? 'escuro' : 'claro',
      timestamp: new Date().toISOString()
    });
  }, [temaEscuro, setTemaEscuro, cookies, mostrarMensagem]);

  // Função para controlar menu mobile
  const toggleMenu = useCallback(() => {
    setMenuAberto((prev: boolean) => !prev);
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
    <div className={`min-h-screen ${tema.fundo} flex transition-colors duration-300`}>
      {/* Backdrop para mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
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
        <div className={`${tema.papel} shadow-sm border-b ${tema.borda} lg:hidden transition-colors duration-300`}>
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-md ${tema.hover} ${tema.texto} transition-colors duration-200`}
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
        <main className="min-h-screen transition-colors duration-300">
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