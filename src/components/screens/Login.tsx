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
      mostrarMensagem('error', 'Erro inesperado no login');
    } finally {
      setTentandoLogin(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.background} px-4`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto h-12 w-12 flex items-center justify-center rounded-full ${tema.primary}`}>
            <LogIn className="text-white" size={24} />
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${tema.text}`}>
            Sistema de Consignação
          </h2>
          <p className={`mt-2 text-sm ${tema.textSecondary}`}>
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className={`${tema.surface} rounded-lg shadow-sm p-6`}>
            <div className="space-y-4">
              {/* Campo Login */}
              <div>
                <label htmlFor="login" className={`block text-sm font-medium ${tema.text} mb-2`}>
                  Login
                </label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  className={`
                    relative block w-full px-3 py-2 border ${tema.border} rounded-lg
                    placeholder-gray-500 ${tema.text} 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors
                  `}
                  placeholder="Digite seu login"
                />
              </div>

              {/* Campo Senha */}
              <div>
                <label htmlFor="senha" className={`block text-sm font-medium ${tema.text} mb-2`}>
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className={`
                      relative block w-full px-3 py-2 pr-10 border ${tema.border} rounded-lg
                      placeholder-gray-500 ${tema.text}
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors
                    `}
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className={`
                      absolute inset-y-0 right-0 pr-3 flex items-center
                      ${tema.textSecondary} hover:${tema.text} transition-colors
                    `}
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Informações de login */}
            <div className={`mt-6 p-4 ${tema.background} rounded-lg`}>
              <div className="flex items-start space-x-2">
                <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className={`font-medium ${tema.text} mb-1`}>
                    Credenciais de teste:
                  </p>
                  <div className={tema.textSecondary}>
                    <p><strong>Admin:</strong> login: admin, senha: admin</p>
                    <p><strong>Vendedor:</strong> login: vendedor, senha: 123</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Submit */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={tentandoLogin}
                className={`
                  group relative w-full flex justify-center py-3 px-4 border border-transparent 
                  text-sm font-medium rounded-lg text-white ${tema.primary}
                  hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                `}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn size={20} className="text-blue-300 group-hover:text-blue-200" />
                </span>
                {tentandoLogin ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs ${tema.textSecondary}`}>
            Sistema de Gestão de Consignações v2.0
          </p>
        </div>
      </div>
    </div>
  );
};