// src/components/screens/Login.tsx
import React, { useState } from 'react';
import { LogIn, Sun, Moon } from 'lucide-react';

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
    input: temaEscuro 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300