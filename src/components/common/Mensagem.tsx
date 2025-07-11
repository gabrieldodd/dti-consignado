// src/components/common/Mensagem.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, AlertTriangle, Info } from 'lucide-react';
import { TipoMensagem } from '../../types/Common';

interface MensagemProps {
  tipo: TipoMensagem;
  texto: string;
  visivel: boolean;
  onFechar: () => void;
  autoFechar?: boolean;
  tempoAutoFechar?: number;
}

export const Mensagem: React.FC<MensagemProps> = ({
  tipo,
  texto,
  visivel,
  onFechar,
  autoFechar = true,
  tempoAutoFechar = 5000
}) => {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (visivel) {
      setMostrar(true);
      
      if (autoFechar) {
        const timer = setTimeout(() => {
          setMostrar(false);
          setTimeout(onFechar, 300); // Aguarda animação
        }, tempoAutoFechar);
        
        return () => clearTimeout(timer);
      }
    } else {
      setMostrar(false);
    }
  }, [visivel, autoFechar, tempoAutoFechar, onFechar]);

  const obterIcone = () => {
    switch (tipo) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const obterCores = () => {
    switch (tipo) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600',
          button: 'text-green-600 hover:text-green-800'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          button: 'text-red-600 hover:text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          button: 'text-yellow-600 hover:text-yellow-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          button: 'text-blue-600 hover:text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          button: 'text-gray-600 hover:text-gray-800'
        };
    }
  };

  const cores = obterCores();

  if (!visivel && !mostrar) return null;

  return (
    <>
      <style>{`
        .mensagem-enter {
          opacity: 0;
          transform: translateY(-10px);
        }
        .mensagem-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms, transform 300ms;
        }
        .mensagem-exit {
          opacity: 1;
          transform: translateY(0);
        }
        .mensagem-exit-active {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 300ms, transform 300ms;
        }
      `}</style>
      
      <div className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        ${mostrar ? 'mensagem-enter-active' : 'mensagem-exit-active'}
      `}>
        <div className={`
          ${cores.bg} border ${cores.text} px-4 py-3 rounded-lg shadow-lg
          flex items-center space-x-3
        `}>
          <div className={cores.icon}>
            {obterIcone()}
          </div>
          
          <div className="flex-1 text-sm font-medium">
            {texto}
          </div>
          
          <button
            onClick={() => {
              setMostrar(false);
              setTimeout(onFechar, 300);
            }}
            className={`
              ${cores.button} p-1 rounded-md transition-colors
              hover:bg-white hover:bg-opacity-20
            `}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

// Hook para usar mensagens
export const useMensagem = () => {
  const [mensagem, setMensagem] = useState<{
    tipo: TipoMensagem;
    texto: string;
    visivel: boolean;
  }>({
    tipo: 'info',
    texto: '',
    visivel: false
  });

  const mostrarMensagem = (tipo: TipoMensagem, texto: string) => {
    setMensagem({ tipo, texto, visivel: true });
  };

  const fecharMensagem = () => {
    setMensagem(prev => ({ ...prev, visivel: false }));
  };

  const componenteMensagem = (
    <Mensagem
      tipo={mensagem.tipo}
      texto={mensagem.texto}
      visivel={mensagem.visivel}
      onFechar={fecharMensagem}
    />
  );

  return {
    mostrarMensagem,
    componenteMensagem
  };
};