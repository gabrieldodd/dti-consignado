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
              Aguarde enquanto tentamos fazer login automaticamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.fundo} transition-colors duration-300`}>
      <div className={`${tema.papel} p-8 rounded-lg shadow-lg border ${tema.borda} max-w-md w-full mx-4 transition-colors duration-300`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${tema.texto} mb-2`}>
            Sistema de Consignação
          </h2>
          <p className={`text-sm ${tema.textoSecundario}`}>
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo Login */}
          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
              Login <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formLogin.login}
              onChange={(e) => handleInputChange('login', e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={carregando}
              className={`
                block w-full px-3 py-2 border rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                transition-colors duration-200
                ${tema.input} 
                ${erros.login ? 'border-red-500 focus:ring-red-500' : ''} 
                ${carregando ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              placeholder="Digite seu login"
              autoComplete="username"
              autoFocus
            />
            {erros.login && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {erros.login}
              </p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={formLogin.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={carregando}
                className={`
                  block w-full px-3 py-2 pr-10 border rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition-colors duration-200
                  ${tema.input} 
                  ${erros.senha ? 'border-red-500 focus:ring-red-500' : ''} 
                  ${carregando ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(prev => !prev)}
                disabled={carregando}
                className={`
                  absolute inset-y-0 right-0 flex items-center pr-3 
                  ${carregando ? 'cursor-not-allowed' : 'cursor-pointer'} 
                  ${tema.textoSecundario} hover:${tema.texto} transition-colors
                `}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {erros.senha && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {erros.senha}
              </p>
            )}
          </div>

          {/* Checkbox Lembrar Login */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="lembrar-login"
                name="lembrar-login"
                type="checkbox"
                checked={lembrarLogin}
                onChange={(e) => setLembrarLogin(e.target.checked)}
                disabled={carregando}
                className={`
                  h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
                  ${carregando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              />
              <label htmlFor="lembrar-login" className={`ml-2 block text-sm ${tema.textoSecundario} select-none`}>
                Lembrar meu login
              </label>
            </div>
            
            {/* Link para esquecer credenciais */}
            {(formLogin.login || getCookie('preferencias_login')) && (
              <button
                type="button"
                onClick={esquecerCredenciais}
                disabled={carregando}
                className={`text-xs ${tema.link} transition-colors`}
              >
                Esquecer credenciais
              </button>
            )}
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={carregando}
            className={`
              group relative w-full flex justify-center py-2 px-4 border border-transparent 
              text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 transition-colors duration-200
              ${tema.botao}
              ${carregando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
            `}
          >
            {carregando ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              <div className="flex items-center">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </div>
            )}
          </button>
        </form>

        {/* Botão de Toggle Tema */}
        {onToggleTema && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onToggleTema}
              disabled={carregando}
              className={`
                p-2 rounded-full transition-colors duration-200
                ${tema.hover} ${tema.textoSecundario}
                ${carregando ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={temaEscuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {temaEscuro ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        )}

        {/* Informações de Login para Desenvolvimento */}
        <div className={`mt-6 p-3 rounded-md ${temaEscuro ? 'bg-gray-700' : 'bg-gray-50'} border ${tema.borda}`}>
          <p className={`text-xs ${tema.textoSecundario} text-center mb-2 font-medium`}>
            Credenciais para teste:
          </p>
          <div className={`text-xs ${tema.textoSecundario} space-y-1`}>
            <div className="flex justify-between">
              <span><strong>Admin:</strong></span>
              <span>admin / admin123</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Vendedor:</strong></span>
              <span>joao123 / 123456</span>
            </div>
          </div>
          {lembrarLogin && (
            <div className={`mt-2 pt-2 border-t ${tema.borda} text-center`}>
              <p className={`text-xs ${tema.textoSecundario}`}>
                ⚠️ Credenciais serão salvas para próximo acesso
              </p>
            </div>
          )}
        </div>

        {/* Status das Preferências Salvas */}
        {getCookie('preferencias_login') && (
          <div className={`mt-4 p-2 rounded-md ${temaEscuro ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-200`}>
            <p className={`text-xs text-center ${temaEscuro ? 'text-blue-300' : 'text-blue-700'}`}>
              ✓ Login salvo: {getCookie('preferencias_login')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};