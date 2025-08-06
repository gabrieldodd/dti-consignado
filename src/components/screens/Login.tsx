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
      // fazerLogin agora é assíncrono
      const sucesso = await fazerLogin(formData.login, formData.senha);
      
      if (sucesso) {
        mostrarMensagem('success', 'Login realizado com sucesso!');
        onLoginSuccess();
      } else {
        mostrarMensagem('error', 'Login ou senha inválidos!');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      mostrarMensagem('error', 'Erro ao fazer login. Tente novamente.');
    } finally {
      setTentandoLogin(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.background}`}>
      <div className={`w-full max-w-md ${tema.surface} rounded-lg shadow-xl p-8`}>
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${tema.text}`}>
            Sistema de Consignação
          </h2>
          <p className={`mt-2 ${tema.textSecondary}`}>
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Login */}
          <div>
            <label className={`block text-sm font-medium ${tema.text} mb-2`}>
              Login
            </label>
            <input
              type="text"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
              placeholder="Digite seu login"
              disabled={tentandoLogin}
              autoFocus
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className={`block text-sm font-medium ${tema.text} mb-2`}>
              Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className={`w-full px-3 py-2 pr-10 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                placeholder="Digite sua senha"
                disabled={tentandoLogin}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${tema.textSecondary} hover:${tema.text}`}
                disabled={tentandoLogin}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Credenciais de teste */}
          <div className={`p-3 rounded-md bg-blue-50 border border-blue-200`}>
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Credenciais de teste:</p>
                <p><strong>Admin:</strong> login: admin, senha: 123456</p>
                <p><strong>Vendedor:</strong> login: vendedor, senha: 123</p>
              </div>
            </div>
          </div>

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={tentandoLogin}
            className={`w-full py-2 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
          >
            {tentandoLogin ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Entrando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={`mt-8 text-center text-sm ${tema.textSecondary}`}>
          Sistema de Gestão de Consignações v2.0
        </div>
      </div>
    </div>
  );
};