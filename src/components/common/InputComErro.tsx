// src/components/common/InputComErro.tsx
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface InputComErroProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  erro?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const InputComErro: React.FC<InputComErroProps> = ({
  label,
  value,
  onChange,
  erro,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  required = false
}) => {
  const { tema } = useAppContext();

  return (
    <div className="w-full">
      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          mt-1 block w-full border rounded-md px-3 py-2 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500 
          ${tema.text} ${tema.surface}
          ${erro ? 'border-red-500' : tema.border} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
          ${className}
        `}
      />
      {erro && (
        <p className="text-red-500 text-sm mt-1">{erro}</p>
      )}
    </div>
  );
};