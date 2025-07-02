// src/components/common/Mensagem.tsx
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Mensagem: React.FC = () => {
  const { mensagemAtual } = useAppContext();
  const [visivel, setVisivel] = useState(false);
  const [mensagemLocal, setMensagemLocal] = useState<typeof mensagemAtual>(null);

  useEffect(() => {
    if (mensagemAtual) {
      setMensagemLocal(mensagemAtual);
      setVisivel(true);
      
      // Auto-hide após o timeout
      const timer = setTimeout(() => {
        setVisivel(false);
        setTimeout(() => setMensagemLocal(null), 300); // Aguarda animação
      }, mensagemAtual.timeout);

      return () => clearTimeout(timer);
    }
  }, [mensagemAtual]);

  const fecharMensagem = () => {
    setVisivel(false);
    setTimeout(() => setMensagemLocal(null), 300);
  };

  if (!mensagemLocal) return null;

  const getIconeETema = () => {
    switch (mensagemLocal.tipo) {
      case 'success':
        return {
          icone: CheckCircle,
          cores: 'bg-green-50 border-green-200 text-green-800',
          iconeColor: 'text-green-400'
        };
      case 'error':
        return {
          icone: AlertCircle,
          cores: 'bg-red-50 border-red-200 text-red-800',
          iconeColor: 'text-red-400'
        };
      case 'warning':
        return {
          icone: AlertTriangle,
          cores: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          iconeColor: 'text-yellow-400'
        };
      case 'info':
        return {
          icone: Info,
          cores: 'bg-blue-50 border-blue-200 text-blue-800',
          iconeColor: 'text-blue-400'
        };
      default:
        return {
          icone: Info,
          cores: 'bg-gray-50 border-gray-200 text-gray-800',
          iconeColor: 'text-gray-400'
        };
    }
  };

  const { icone: Icone, cores, iconeColor } = getIconeETema();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${visivel ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className={`
          rounded-lg border shadow-lg p-4 ${cores}
          backdrop-blur-sm bg-opacity-95
        `}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icone className={`h-5 w-5 ${iconeColor}`} />
            </div>
            
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">
                {mensagemLocal.texto}
              </p>
            </div>
            
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={fecharMensagem}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${mensagemLocal.tipo === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' :
                    mensagemLocal.tipo === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' :
                    mensagemLocal.tipo === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' :
                    'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                  }
                `}
              >
                <span className="sr-only">Fechar</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-2 bg-white bg-opacity-20 rounded-full h-1 overflow-hidden">
            <div 
              className={`
                h-full transition-all ease-linear
                ${mensagemLocal.tipo === 'success' ? 'bg-green-500' :
                  mensagemLocal.tipo === 'error' ? 'bg-red-500' :
                  mensagemLocal.tipo === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }
              `}
              style={{
                animation: `progress ${mensagemLocal.timeout}ms linear`,
                animationFillMode: 'forwards'
              }}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};