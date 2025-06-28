// src/components/common/InputComErro.tsx
import React, { memo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface InputComErroProps {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: string;
  placeholder?: string;
  erro?: string;
  obrigatorio?: boolean;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

export const InputComErro = memo<InputComErroProps>(({ 
  label, 
  valor, 
  onChange, 
  tipo = 'text', 
  placeholder, 
  erro, 
  obrigatorio = false,
  maxLength,
  className = '',
  disabled = false
}) => {
  const { tema } = useAppContext();

  return (
    <div>
      <label className={`block text-sm font-medium ${tema.texto}`}>
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        disabled={disabled}
        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${erro ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        placeholder={placeholder}
      />
      {erro && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {erro}
        </p>
      )}
    </div>
  );
});