// src/components/common/InputSenha.tsx
import React, { memo, useState, useCallback } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface InputSenhaProps {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  erro?: string;
  obrigatorio?: boolean;
  disabled?: boolean;
}

export const InputSenha = memo<InputSenhaProps>(({ 
  label, 
  valor, 
  onChange, 
  placeholder, 
  erro, 
  obrigatorio = false,
  disabled = false
}) => {
  const { tema } = useAppContext();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const toggleMostrarSenha = useCallback(() => {
    setMostrarSenha(prev => !prev);
  }, []);

  return (
    <div>
      <label className={`block text-sm font-medium ${tema.texto}`}>
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={mostrarSenha ? 'text' : 'password'}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`mt-1 block w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${erro ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={toggleMostrarSenha}
          disabled={disabled}
          className={`absolute inset-y-0 right-0 flex items-center pr-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {mostrarSenha ? (
            <EyeOff className={`h-4 w-4 ${tema.textoSecundario} hover:${tema.texto}`} />
          ) : (
            <Eye className={`h-4 w-4 ${tema.textoSecundario} hover:${tema.texto}`} />
          )}
        </button>
      </div>
      {erro && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {erro}
        </p>
      )}
    </div>
  );
});