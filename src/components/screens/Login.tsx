// src/components/screens/Login.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { LogIn, Sun, Moon, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (login: string, senha: string) => void;
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

  // Funções de cookies (simplificadas)
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

  // Carregar login salvo ao montar o componente
  useEffect(() => {
    const loginSalvo = getCookie('ultimoLogin');
    if (loginSalvo) {
      setFormLogin(prev => ({ ...prev, login: loginSalvo }));
      setLembrarLogin(true);
    }
  }, [getCookie]);

  // Validação do formulário
  const validarFormulario = useCallback((): boolean => {
    const novosErros: {login?: string, senha?: string} = {};

    if (!formLogin.login.trim()) {
      novosErros.login = 'Login é obrigatório';
    } else if (formLogin.login.length < 3) {
      novosErros.login = 'Login deve ter pelo menos 3 caracteres';
    }

    if (!formLogin.senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (formLogin.senha.length < 6) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [formLogin]);

  // Submissão do formulário
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);
    
    try {
      // Salvar login se marcado para lembrar
      if (lembrarLogin && formLogin.login) {
        setCookie('ultimoLogin', formLogin.login, 30); // 30 dias
      } else {
        setCookie('ultimoLogin', '', -1); // Remove cookie
      }

      // Chamar função de login
      await onLogin(formLogin.login, formLogin.senha);
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setCarregando(false);
    }
  }, [formLogin, lembrarLogin, onLogin, setCookie, validarFormulario]);

  // Pressionar Enter para submeter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !carregando) {
      handleSubmit();
    }
  }, [handleSubmit, carregando]);

  // Alteração dos campos
  const handleInputChange = useCallback((campo: 'login' | 'senha', valor: string) => {
    setFormLogin(prev => ({ ...prev, [campo]: valor }));
    // Limpar erro quando o usuário começar a digitar
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: undefined }));
    }
  }, [erros]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.fundo} p-4`}>
      <div className={`max-w-md w-full space-y-8 p-8 ${tema.papel} rounded-lg shadow-lg border ${tema.borda}`}>
        
        {/* Cabeçalho */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className={`text-3xl font-extrabold ${tema.texto}`}>
            Sistema de Consignação
          </h2>
          <p className={`mt-2 text-sm ${tema.textoSecundario}`}>
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
                mt-1 block w-full px-3 py-2 border rounded-md 
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
              <p className="mt-1 text-sm text-red-600">{erros.login}</p>
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
                  ${tema.textoSecundario} hover:${tema.texto}
                `}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {erros.senha && (
              <p className="mt-1 text-sm text-red-600">{erros.senha}</p>
            )}
          </div>

          {/* Checkbox Lembrar Login */}
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
                ${carregando ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            <label htmlFor="lembrar-login" className={`ml-2 block text-sm ${tema.textoSecundario}`}>
              Lembrar meu login
            </label>
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
          <div className="flex justify-center">
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
        <div className={`mt-4 p-3 rounded-md ${temaEscuro ? 'bg-gray-700' : 'bg-gray-50'} border ${tema.borda}`}>
          <p className={`text-xs ${tema.textoSecundario} text-center mb-2`}>
            Credenciais para teste:
          </p>
          <div className={`text-xs ${tema.textoSecundario} space-y-1`}>
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Vendedor:</strong> joao123 / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};