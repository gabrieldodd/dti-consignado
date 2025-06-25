// src/components/common/Mensagem.tsx
import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface MensagemProps {
  mensagem: {
    tipo: 'success' | 'error';
    texto: string;
  } | null;
}

export const Mensagem: React.FC<MensagemProps> = ({ mensagem }) => {
  if (!mensagem) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center space-x-2 min-w-72 ${
      mensagem.tipo === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {mensagem.tipo === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}
      <span>{mensagem.texto}</span>
    </div>
  );
};