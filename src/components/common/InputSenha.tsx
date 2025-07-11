// src/components/common/InputSenha.tsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface InputSenhaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  erro?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const InputSenha: React.FC<InputSenhaProps> = ({
  label,
  value,
  onChange,
  erro,
  placeholder,
  disabled = false,
  className = '',
  required = false
}) => {
  const { tema } = useAppContext();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className="w-full">
      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={mostrarSenha ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            mt-1 block w-full border rounded-md px-3 py-2 pr-10 
            focus:outline-none focus:ring-blue-500 focus:border-blue-500 
            ${tema.text} ${tema.surface}
            ${erro ? 'border-red-500' : tema.border} 
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
            ${className}
          `}
        />
        <button
          type="button"
          onClick={() => setMostrarSenha(!mostrarSenha)}
          className={`absolute inset-y-0 right-0 pr-3 flex items-center ${tema.textSecondary} hover:${tema.text}`}
          disabled={disabled}
        >
          {mostrarSenha ? (
            <EyeOff className={`h-4 w-4 ${tema.textSecondary} hover:${tema.text}`} />
          ) : (
            <Eye className={`h-4 w-4 ${tema.textSecondary} hover:${tema.text}`} />
          )}
        </button>
      </div>
      {erro && (
        <p className="text-red-500 text-sm mt-1">{erro}</p>
      )}
    </div>
  );
};