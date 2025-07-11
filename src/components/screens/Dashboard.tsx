// src/components/screens/Dashboard.tsx
import React, { useMemo } from 'react';
import { 
  Users, 
  Package, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const Dashboard: React.FC = () => {
  const { 
    tema, 
    vendedores, 
    produtos, 
    consignacoes, 
    formatarMoeda 
  } = useAppContext();

  // Cálculos dos indicadores
  const indicadores = useMemo(() => {
    const consignacoesAtivas = consignacoes.filter((c: any) => c.status === 'ativa');
    const consignacoesFinalizadas = consignacoes.filter((c: any) => c.status === 'finalizada');
    const produtosAtivos = produtos.filter((p: any) => p.ativo);
    const vendedoresAtivos = vendedores.filter((v: any) => v.status === 'ativo');

    const valorTotalConsignacoes = consignacoes.reduce((total: number, c: any) => {
      return total + (c.valor_total || c.valorTotal || 0);
    }, 0);

    const valorTotalFinalizadas = consignacoesFinalizadas.reduce((total: number, c: any) => {
      return total + (c.retorno?.valor_devido || c.retorno?.valorDevido || 0);
    }, 0);

    const produtosBaixoEstoque = produtos.filter((p: any) => {
      const estoque = p.estoque || 0;
      const estoqueMinimo = p.estoque_minimo || p.estoqueMinimo || 0;
      return p.ativo && estoque <= estoqueMinimo;
    });

    return {
      totalVendedores: vendedores.length,
      vendedoresAtivos: vendedoresAtivos.length,
      totalProdutos: produtos.length,
      produtosAtivos: produtosAtivos.length,
      produtosBaixoEstoque: produtosBaixoEstoque.length,
      totalConsignacoes: consignacoes.length,
      consignacoesAtivas: consignacoesAtivas.length,
      consignacoesFinalizadas: consignacoesFinalizadas.length,
      valorTotalConsignacoes,
      valorTotalFinalizadas
    };
  }, [vendedores, produtos, consignacoes]);

  // Dados para os cards
  const cards = [
    {
      titulo: 'Vendedores',
      valor: indicadores.totalVendedores,
      subtitulo: `${indicadores.vendedoresAtivos} ativos`,
      icone: <Users size={24} />,
      cor: 'bg-blue-500',
      corFundo: 'bg-blue-50'
    },
    {
      titulo: 'Produtos',
      valor: indicadores.totalProdutos,
      subtitulo: `${indicadores.produtosAtivos} ativos`,
      icone: <Package size={24} />,
      cor: 'bg-green-500',
      corFundo: 'bg-green-50'
    },
    {
      titulo: 'Consignações',
      valor: indicadores.totalConsignacoes,
      subtitulo: `${indicadores.consignacoesAtivas} ativas`,
      icone: <FileText size={24} />,
      cor: 'bg-purple-500',
      corFundo: 'bg-purple-50'
    },
    {
      titulo: 'Valor Total',
      valor: formatarMoeda(indicadores.valorTotalConsignacoes),
      subtitulo: `${formatarMoeda(indicadores.valorTotalFinalizadas)} realizados`,
      icone: <DollarSign size={24} />,
      cor: 'bg-yellow-500',
      corFundo: 'bg-yellow-50',
      isValor: true
    }
  ];

  // Consignações recentes
  const consignacoesRecentes = useMemo(() => {
    return [...consignacoes]
      .sort((a: any, b: any) => {
        const dataA = a.data_consignacao || a.dataConsignacao || a.created_at || '';
        const dataB = b.data_consignacao || b.dataConsignacao || b.created_at || '';
        return new Date(dataB).getTime() - new Date(dataA).getTime();
      })
      .slice(0, 5);
  }, [consignacoes]);

  const obterStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalizada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const obterStatusIcone = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Clock size={16} />;
      case 'finalizada':
        return <CheckCircle size={16} />;
      case 'cancelada':
        return <AlertTriangle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className={`min-h-screen ${tema.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${tema.text} mb-2`}>
            Dashboard
          </h1>
          <p className={tema.textSecondary}>
            Visão geral do sistema de consignação
          </p>
        </div>

        {/* Cards de indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <div key={index} className={`${tema.surface} rounded-lg shadow-sm p-6`}>
              <div className="flex items-center">
                <div className={`${card.corFundo} p-3 rounded-lg`}>
                  <div className={`${card.cor} text-white p-2 rounded-lg`}>
                    {card.icone}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${tema.textSecondary}`}>
                    {card.titulo}
                  </p>
                  <p className={`text-2xl font-bold ${tema.text}`}>
                    {card.isValor ? card.valor : card.valor.toLocaleString()}
                  </p>
                  <p className={`text-sm ${tema.textSecondary}`}>
                    {card.subtitulo}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consignações Recentes */}
          <div className={`${tema.surface} rounded-lg shadow-sm p-6`}>
            <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
              Consignações Recentes
            </h2>
            
            {consignacoesRecentes.length > 0 ? (
              <div className="space-y-4">
                {consignacoesRecentes.map((consignacao: any) => (
                  <div key={consignacao.id} className={`p-4 border ${tema.border} rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${tema.text}`}>
                        {consignacao.cliente_nome || consignacao.clienteNome}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${obterStatusColor(consignacao.status)}`}>
                        {obterStatusIcone(consignacao.status)}
                        <span className="capitalize">{consignacao.status}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={tema.textSecondary}>
                        {consignacao.vendedor?.nome || 'Vendedor N/A'}
                      </span>
                      <span className={`font-medium ${tema.text}`}>
                        {formatarMoeda(consignacao.valor_total || consignacao.valorTotal || 0)}
                      </span>
                    </div>
                    <div className={`text-xs ${tema.textSecondary} mt-1`}>
                      {new Date(
                        consignacao.data_consignacao || 
                        consignacao.dataConsignacao || 
                        consignacao.created_at ||
                        new Date()
                      ).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className={`${tema.textSecondary} mx-auto mb-4`} />
                <p className={tema.textSecondary}>
                  Nenhuma consignação encontrada
                </p>
              </div>
            )}
          </div>

          {/* Alertas e Estatísticas */}
          <div className="space-y-6">
            {/* Produtos com Baixo Estoque */}
            <div className={`${tema.surface} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
                Alertas de Estoque
              </h2>
              
              {indicadores.produtosBaixoEstoque > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle size={20} className="text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">
                        {indicadores.produtosBaixoEstoque} produto(s) com estoque baixo
                      </p>
                      <p className="text-sm text-red-600">
                        Verifique a seção de produtos
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Todos os produtos estão com estoque adequado
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Estatísticas Rápidas */}
            <div className={`${tema.surface} rounded-lg shadow-sm p-6`}>
              <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
                Estatísticas Rápidas
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={tema.textSecondary}>
                    Taxa de Finalização
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${tema.text}`}>
                      {indicadores.totalConsignacoes > 0 
                        ? Math.round((indicadores.consignacoesFinalizadas / indicadores.totalConsignacoes) * 100)
                        : 0}%
                    </span>
                    <TrendingUp size={16} className="text-green-500" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={tema.textSecondary}>
                    Valor Médio por Consignação
                  </span>
                  <span className={`font-medium ${tema.text}`}>
                    {formatarMoeda(
                      indicadores.totalConsignacoes > 0 
                        ? indicadores.valorTotalConsignacoes / indicadores.totalConsignacoes
                        : 0
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={tema.textSecondary}>
                    Produtos por Vendedor
                  </span>
                  <span className={`font-medium ${tema.text}`}>
                    {indicadores.vendedoresAtivos > 0 
                      ? Math.round(indicadores.produtosAtivos / indicadores.vendedoresAtivos)
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};