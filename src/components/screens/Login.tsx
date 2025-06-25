// src/components/screens/Login.tsx
import React, { useState } from 'react';
import { LogIn, Sun, Moon } from 'lucide-react';
import { InputComErro } from '../common/inputComErro';
import { InputSenha } from '../common/inputSenha';

interface LoginProps {
  onLogin: (login: string, senha: string) => void;
  temaEscuro: boolean;
  onToggleTema: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, temaEscuro, onToggleTema }) => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{login?: string, senha?: string}>({});

  const tema = {
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: temaEscuro 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900',
    menuAtivo: temaEscuro 
      ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300' 
      : 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novosErros: {login?: string, senha?: string} = {};
    
    if (!login.trim()) {
      novosErros.login = 'Login é obrigatório';
    }
    
    if (!senha.trim()) {
      novosErros.senha = 'Senha é obrigatória';
    }
    
    setErros(novosErros);
    
    if (Object.keys(novosErros).length === 0) {
      onLogin(login, senha);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${tema.fundo} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className={`w-12 h-12 ${tema.papel} rounded-full flex items-center justify-center`}>
              <LogIn className={`w-6 h-6 ${tema.texto}`} />
            </div>
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${tema.texto}`}>
            Sistema de Consignação
          </h2>
          <p className={`mt-2 text-center text-sm ${tema.textoSecundario}`}>
            Faça login para continuar
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className={`rounded-md shadow-sm ${tema.papel} p-6 space-y-4`}>
            <InputComErro
              label="Login"
              valor={login}
              onChange={setLogin}
              placeholder="Digite seu login"
              erro={erros.login}
              obrigatorio
            />
            
            <InputSenha
              label="Senha"
              valor={senha}
              onChange={setSenha}
              placeholder="Digite sua senha"
              erro={erros.senha}
              obrigatorio
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onToggleTema}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {temaEscuro ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Tema Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Tema Escuro
                </>
              )}
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </button>
          </div>
          
          <div className={`text-center text-xs ${tema.textoSecundario}`}>
            <p>Admin: <span className="font-mono">admin / admin123</span></p>
            <p>Vendedor: <span className="font-mono">joao123 / 123456</span></p>
          </div>
        </form>
      </div>
    </div>
  );
};