// src/components/screens/Login.tsx
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { tema, fazerLogin, mostrarMensagem } = useAppContext();
  const [formData, setFormData] = useState({
    login: '',
    senha: ''
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tentandoLogin, setTentandoLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.login.trim() || !formData.senha.trim()) {
      mostrarMensagem('error', 'Preencha todos os campos');
      return;
    }

    setTentandoLogin(true);
    
    try {
      const sucesso = fazerLogin(formData.login, formData.senha);
      
      if (sucesso) {
        mostrarMensagem('success', 'Login realizado com sucesso!');
        onLoginSuccess();
      } else {
        mostrarMensagem('error', 'Login ou senha inválidos!');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro ao fazer login');
    } finally {
      setTentandoLogin(false);
    }
  };

  const handleInputChange = (campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.fundo} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className={`mt-6 text-3xl font-extrabold ${tema.texto}`}>
            Sistema de Consignação
          </h2>
          <p className={`mt-2 text-sm ${tema.textoSecundario}`}>
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className={`${tema.papel} p-6 rounded-lg shadow-lg border ${tema.borda}`}>
            <div className="space-y-4">
              {/* Login */}
              <div>
                <label htmlFor="login" className={`block text-sm font-medium ${tema.texto} mb-1`}>
                  Login
                </label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  value={formData.login}
                  onChange={(e) => handleInputChange('login', e.target.value)}
                  className={`
                    appearance-none relative block w-full px-3 py-2 border rounded-md
                    placeholder-gray-500 ${tema.input} ${tema.borda}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10
                  `}
                  placeholder="Digite seu login"
                  disabled={tentandoLogin}
                />
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha" className={`block text-sm font-medium ${tema.texto} mb-1`}>
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={`
                      appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md
                      placeholder-gray-500 ${tema.input} ${tema.borda}
                      focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10
                    `}
                    placeholder="Digite sua senha"
                    disabled={tentandoLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className={`
                      absolute inset-y-0 right-0 pr-3 flex items-center
                      ${tema.textoSecundario} hover:${tema.texto}
                    `}
                    disabled={tentandoLogin}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Botão de Login */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={tentandoLogin}
                className={`
                  group relative w-full flex justify-center py-3 px-4 border border-transparent
                  text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                `}
              >
                {tentandoLogin ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Informações de Login */}
        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className={`text-sm font-medium ${tema.texto} mb-2`}>
                Credenciais de Acesso
              </h3>
              <div className={`text-xs ${tema.textoSecundario} space-y-1`}>
                <p><strong>Administrador:</strong> admin / admin123</p>
                <p><strong>Vendedores:</strong> Use login/senha cadastrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};