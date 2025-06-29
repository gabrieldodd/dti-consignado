// src/components/screens/Login.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { LogIn, Sun, Moon, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (login: string, senha: string, lembrar?: boolean) => void;
  temaEscuro?: boolean;
  onToggleTema?: () => void;
}

export const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  temaEscuro = false, 
  onToggleTema 
}) => {
  // Estados do formulário
  const [formLogin, setFormLogin] = useState({
    login: '',
    senha: ''
  });
  
  const [erros, setErros] = useState<{login?: string, senha?: string}>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarLogin, setLembrarLogin] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [tentativaAutoLogin, setTentativaAutoLogin] = useState(true);

  // Configuração do tema
  const tema = {
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    input: temaEscuro 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    botao: 'bg-blue-600 hover:bg-blue-700 text-white',
    link: temaEscuro ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
  };

  // Funções de cookies
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }, []);

  const setCookie = useCallback((name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }, []);

  const deleteCookie = useCallback((name: string) => {
    setCookie(name, '', -1);
  }, [setCookie]);

  // Carregar preferências salvas ao montar o componente
  useEffect(() => {
    const preferencias = {
      login: getCookie('preferencias_login'),
      senha: getCookie('preferencias_senha'),
      lembrar: getCookie('preferencias_lembrar') === 'true',
      autoLogin: getCookie('preferencias_auto_login') === 'true'
    };

    if (preferencias.login) {
      setFormLogin(prev => ({ 
        ...prev, 
        login: preferencias.login || '',
        senha: preferencias.senha || ''
      }));
      setLembrarLogin(preferencias.lembrar);

      // Se tem auto-login habilitado e credenciais salvas, tentar login automático
      if (preferencias.autoLogin && preferencias.login && preferencias.senha) {
        setTimeout(() => {
          onLogin(preferencias.login!, preferencias.senha!, true);
          setTentativaAutoLogin(false);
        }, 500); // Pequeno delay para mostrar a tela de loading
      } else {
        setTentativaAutoLogin(false);
      }
    } else {
      setTentativaAutoLogin(false);
    }
  }, [getCookie, onLogin]);

  // Validação do formulário
  const validarFormulario = useCallback((): boolean => {
    const novosErros: {login?: string, senha?: string} = {};

    if (!formLogin.login.trim()) {
      novosErros.login = 'Login é obrigatório';
    }

    if (!formLogin.senha.trim()) {
      novosErros.senha = 'Senha é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [formLogin]);

  // Salvar preferências
  const salvarPreferencias = useCallback(() => {
    if (lembrarLogin) {
      // Salvar login e opção de lembrar
      setCookie('preferencias_login', formLogin.login, 30); // 30 dias
      setCookie('preferencias_lembrar', 'true', 30);
      
      // Salvar senha de forma segura (apenas para demo - em produção usar token)
      setCookie('preferencias_senha', formLogin.senha, 7); // 7 dias para senha
      setCookie('preferencias_auto_login', 'true', 7);
      
      // Registrar horário do login
      setCookie('preferencias_ultimo_login', new Date().toISOString(), 30);
    } else {
      // Limpar preferências se não quer lembrar
      deleteCookie('preferencias_login');
      deleteCookie('preferencias_senha');
      deleteCookie('preferencias_lembrar');
      deleteCookie('preferencias_auto_login');
      deleteCookie('preferencias_ultimo_login');
    }
  }, [formLogin.login, formLogin.senha, lembrarLogin, setCookie, deleteCookie]);

  // Handle de mudança de input
  const handleInputChange = useCallback((campo: 'login' | 'senha', valor: string) => {
    setFormLogin(prev => ({ ...prev, [campo]: valor }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: undefined }));
    }
  }, [erros]);

  // Submit do formulário
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);
    
    try {
      // Salvar preferências antes do login
      salvarPreferencias();
      
      // Chamar função de login
      onLogin(formLogin.login, formLogin.senha, lembrarLogin);
      
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setCarregando(false);
    }
  }, [formLogin, lembrarLogin, onLogin, validarFormulario, salvarPreferencias]);

  // Handle Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !carregando) {
      handleSubmit();
    }
  }, [handleSubmit, carregando]);

  // Esqueceu as credenciais
  const esquecerCredenciais = useCallback(() => {
    deleteCookie('preferencias_login');
    deleteCookie('preferencias_senha');
    deleteCookie('preferencias_lembrar');
    deleteCookie('preferencias_auto_login');
    setFormLogin({ login: '', senha: '' });
    setLembrarLogin(false);
  }, [deleteCookie]);

  // Se está tentando auto-login, mostrar loading
  if (tentativaAutoLogin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tema.fundo}`}>
        <div className={`${tema.papel} p-8 rounded-lg shadow-lg border ${tema.borda} max-w-md w-full mx-4`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className={`text-lg font-medium ${tema.texto} mb-2`}>
              Verificando credenciais salvas...
            </h2>
            <p className={`text-sm ${tema.textoSecundario}`}>
              Aguarde um momento
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.fundo}`}>
      <div className={`max-w-md w-full space-y-8 p-8 ${tema.papel} rounded-lg shadow-lg border ${tema.borda} mx-4`}>
        
        {/* Header do formulário */}
        <div className="text-center">
          <h2 className={`text-3xl font-extrabold ${tema.texto}`}>
            Sistema de Consignação
          </h2>
          <p className={`mt-2 text-sm ${tema.textoSecundario}`}>
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Botão de tema */}
        {onToggleTema && (
          <div className="flex justify-end">
            <button
              onClick={onToggleTema}
              className={`p-2 rounded-md ${tema.hover} ${tema.texto} transition-colors`}
              title={temaEscuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {temaEscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        )}
        
        {/* Formulário */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Campo Login */}
          <div>
            <label htmlFor="login" className={`block text-sm font-medium ${tema.texto}`}>
              Login
            </label>
            <div className="mt-1 relative">
              <input
                id="login"
                type="text"
                value={formLogin.login}
                onChange={(e) => handleInputChange('login', e.target.value)}
                onKeyPress={handleKeyPress}
                className={`
                  block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                  focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                  ${erros.login ? 'border-red-500' : ''} ${tema.input}
                `}
                placeholder="Digite seu login"
                autoComplete="username"
                disabled={carregando}
              />
              {erros.login && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {erros.login && (
              <p className="mt-1 text-sm text-red-600">{erros.login}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label htmlFor="senha" className={`block text-sm font-medium ${tema.texto}`}>
              Senha
            </label>
            <div className="mt-1 relative">
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                value={formLogin.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                onKeyPress={handleKeyPress}
                className={`
                  block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 
                  focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                  ${erros.senha ? 'border-red-500' : ''} ${tema.input}
                `}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={carregando}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                disabled={carregando}
              >
                {mostrarSenha ? (
                  <EyeOff className={`h-5 w-5 ${tema.textoSecundario}`} />
                ) : (
                  <Eye className={`h-5 w-5 ${tema.textoSecundario}`} />
                )}
              </button>
            </div>
            {erros.senha && (
              <p className="mt-1 text-sm text-red-600">{erros.senha}</p>
            )}
          </div>

          {/* Checkbox Lembrar */}
          <div className="flex items-center">
            <input
              id="lembrar"
              type="checkbox"
              checked={lembrarLogin}
              onChange={(e) => setLembrarLogin(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={carregando}
            />
            <label htmlFor="lembrar" className={`ml-2 block text-sm ${tema.texto}`}>
              Lembrar meus dados
            </label>
          </div>

          {/* Botão de Login */}
          <div>
            <button
              type="submit"
              disabled={carregando}
              className={`
                group relative w-full flex justify-center py-2 px-4 border border-transparent 
                text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors
              `}
            >
              {carregando ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </div>
              )}
            </button>
          </div>

          {/* Link para esquecer credenciais salvas */}
          {(getCookie('preferencias_login') || getCookie('preferencias_lembrar')) && (
            <div className="text-center">
              <button
                type="button"
                onClick={esquecerCredenciais}
                className={`text-sm ${tema.link} hover:underline`}
                disabled={carregando}
              >
                Esquecer dados salvos
              </button>
            </div>
          )}
        </form>

        {/* Credenciais de demonstração */}
        <div className={`mt-6 p-4 ${tema.fundo} rounded-lg border ${tema.borda}`}>
          <h3 className={`text-sm font-medium ${tema.texto} mb-2`}>
            Credenciais para teste:
          </h3>
          <div className={`text-xs ${tema.textoSecundario} space-y-1`}>
            <div><strong>Admin:</strong> admin / admin123</div>
            <div><strong>Vendedor:</strong> joao123 / 123456</div>
          </div>
        </div>
      </div>
    </div>
  );
};