// src/components/screens/Dashboard.tsx
import React, { useMemo } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Tags,
  Eye,
  Plus
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';

interface EstatisticasCard {
  titulo: string;
  valor: number;
  total?: number;
  icon: React.ElementType;
  cor: string;
  formato: 'numero' | 'moeda';
  subtitulo?: string;
  tendencia?: 'up' | 'down';
  alerta?: number | null;
  urgente?: boolean;
}

export const Dashboard: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    vendedores, 
    produtos, 
    categorias, 
    consignacoes, 
    usuarioLogado, 
    tipoUsuario 
  } = useAppContext();
  
  const { formatarMoedaBR, formatarNumero } = useFormatters();

  // Cálculo das Estatísticas
  const estatisticas = useMemo(() => {
    // Vendedores
    const vendedoresAtivos = vendedores.filter(v => v.status === 'Ativo').length;
    const vendedoresInativos = vendedores.filter(v => v.status === 'Inativo').length;
    
    // Produtos
    const produtosAtivos = produtos.filter(p => p.ativo).length;
    const produtosInativos = produtos.filter(p => !p.ativo).length;
    const produtosEstoqueBaixo = produtos.filter(p => p.ativo && p.estoque <= p.estoqueMinimo).length;
    
    const valorTotalEstoque = produtos
      .filter(p => p.ativo)
      .reduce((total, p) => total + (p.valorCusto * p.estoque), 0);
    
    const itensEstoque = produtos
      .filter(p => p.ativo)
      .reduce((total, p) => total + p.estoque, 0);
    
    // Categorias
    const categoriasAtivas = categorias.filter(c => c.ativa).length;
    const categoriasInativas = categorias.filter(c => !c.ativa).length;
    
    // Consignações
    const consignacaoesAtivas = consignacoes.filter(c => c.status === 'ativa').length;
    const consignacaoesFinalizadas = consignacoes.filter(c => c.status === 'finalizada').length;
    const consignacoesCanceladas = consignacoes.filter(c => c.status === 'cancelada').length;
    
    const valorConsignacaoesAtivas = consignacoes
      .filter(c => c.status === 'ativa')
      .reduce((total, c) => total + c.valorTotal, 0);
    
    const quantidadeTotalConsignada = consignacoes
      .filter(c => c.status === 'ativa')
      .reduce((total, c) => total + c.quantidadeTotal, 0);
    
    // Para vendedores específicos
    const minhasConsignacoes = tipoUsuario === 'vendedor' 
      ? consignacoes.filter(c => c.vendedorId === usuarioLogado?.id)
      : [];
    
    const minhasConsignacaoesAtivas = minhasConsignacoes.filter(c => c.status === 'ativa').length;
    const valorMinhasConsignacoes = minhasConsignacoes
      .filter(c => c.status === 'ativa')
      .reduce((total, c) => total + c.valorTotal, 0);

    return {
      // Vendedores
      vendedoresAtivos,
      vendedoresInativos,
      totalVendedores: vendedores.length,
      
      // Produtos
      produtosAtivos,
      produtosInativos,
      produtosEstoqueBaixo,
      totalProdutos: produtos.length,
      valorTotalEstoque,
      itensEstoque,
      
      // Categorias
      categoriasAtivas,
      categoriasInativas,
      totalCategorias: categorias.length,
      
      // Consignações
      consignacaoesAtivas,
      consignacaoesFinalizadas,
      consignacoesCanceladas,
      totalConsignacoes: consignacoes.length,
      valorConsignacaoesAtivas,
      quantidadeTotalConsignada,
      
      // Vendedor específico
      minhasConsignacaoesAtivas,
      valorMinhasConsignacoes
    };
  }, [vendedores, produtos, categorias, consignacoes, tipoUsuario, usuarioLogado]);

  // Cards de Estatísticas para Admin
  const cardsAdmin: EstatisticasCard[] = [
    {
      titulo: 'Vendedores Ativos',
      valor: estatisticas.vendedoresAtivos,
      total: estatisticas.totalVendedores,
      icon: Users,
      cor: 'bg-blue-500',
      formato: 'numero',
      tendencia: estatisticas.vendedoresAtivos > estatisticas.vendedoresInativos ? 'up' : 'down'
    },
    {
      titulo: 'Produtos Ativos',
      valor: estatisticas.produtosAtivos,
      total: estatisticas.totalProdutos,
      icon: Package,
      cor: 'bg-green-500',
      formato: 'numero',
      alerta: estatisticas.produtosEstoqueBaixo > 0 ? estatisticas.produtosEstoqueBaixo : null
    },
    {
      titulo: 'Valor Total Estoque',
      valor: estatisticas.valorTotalEstoque,
      icon: DollarSign,
      cor: 'bg-purple-500',
      formato: 'moeda',
      subtitulo: `${formatarNumero(estatisticas.itensEstoque)} itens`
    },
    {
      titulo: 'Consignações Ativas',
      valor: estatisticas.consignacaoesAtivas,
      total: estatisticas.totalConsignacoes,
      icon: ShoppingCart,
      cor: 'bg-orange-500',
      formato: 'numero',
      subtitulo: formatarMoedaBR(estatisticas.valorConsignacaoesAtivas)
    },
    {
      titulo: 'Categorias Ativas',
      valor: estatisticas.categoriasAtivas,
      total: estatisticas.totalCategorias,
      icon: Tags,
      cor: 'bg-pink-500',
      formato: 'numero'
    },
    {
      titulo: 'Produtos Estoque Baixo',
      valor: estatisticas.produtosEstoqueBaixo,
      icon: AlertTriangle,
      cor: 'bg-red-500',
      formato: 'numero',
      urgente: estatisticas.produtosEstoqueBaixo > 0
    }
  ];

  // Cards de Estatísticas para Vendedor
  const cardsVendedor: EstatisticasCard[] = [
    {
      titulo: 'Minhas Consignações Ativas',
      valor: estatisticas.minhasConsignacaoesAtivas,
      icon: ShoppingCart,
      cor: 'bg-blue-500',
      formato: 'numero'
    },
    {
      titulo: 'Valor Total Consignado',
      valor: estatisticas.valorMinhasConsignacoes,
      icon: DollarSign,
      cor: 'bg-green-500',
      formato: 'moeda'
    },
    {
      titulo: 'Produtos Disponíveis',
      valor: estatisticas.produtosAtivos,
      icon: Package,
      cor: 'bg-purple-500',
      formato: 'numero'
    },
    {
      titulo: 'Estoque Baixo',
      valor: estatisticas.produtosEstoqueBaixo,
      icon: AlertTriangle,
      cor: 'bg-red-500',
      formato: 'numero',
      urgente: estatisticas.produtosEstoqueBaixo > 0
    }
  ];

  const cards = tipoUsuario === 'admin' ? cardsAdmin : cardsVendedor;

  const formatarValor = (valor: number, formato: string) => {
    switch (formato) {
      case 'moeda':
        return formatarMoedaBR(valor);
      case 'numero':
        return formatarNumero(valor);
      default:
        return valor.toString();
    }
  };

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${tema.texto}`}>
            Dashboard
          </h1>
          <p className={`mt-2 ${tema.textoSecundario}`}>
            Bem-vindo, {usuarioLogado?.nome || 'Usuário'}! 
            Aqui está um resumo do sistema.
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`
                ${tema.papel} rounded-lg border ${tema.borda} p-6 shadow-sm
                ${card.urgente ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
                transition-all duration-200 hover:shadow-md
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-medium ${tema.textoSecundario}`}>
                      {card.titulo}
                    </h3>
                    {card.urgente && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-baseline space-x-2">
                    <p className={`text-2xl font-bold ${tema.texto}`}>
                      {formatarValor(card.valor, card.formato)}
                    </p>
                    
                    {card.total && (
                      <span className={`text-sm ${tema.textoSecundario}`}>
                        / {formatarNumero(card.total)}
                      </span>
                    )}
                    
                    {card.tendencia && (
                      <div className="flex items-center">
                        {card.tendencia === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {card.subtitulo && (
                    <p className={`text-sm ${tema.textoSecundario} mt-1`}>
                      {card.subtitulo}
                    </p>
                  )}

                  {card.alerta && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ {card.alerta} produtos com estoque baixo
                    </p>
                  )}
                </div>

                <div className={`${card.cor} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div className={`${tema.papel} rounded-lg border ${tema.borda} p-6 shadow-sm`}>
          <h2 className={`text-xl font-semibold ${tema.texto} mb-4`}>
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200">
              <Plus className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">Nova Consignação</span>
            </button>
            
            {tipoUsuario === 'admin' && (
              <>
                <button className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200">
                  <Plus className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-700 font-medium">Novo Produto</span>
                </button>
                
                <button className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 border border-purple-200">
                  <Plus className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-purple-700 font-medium">Novo Vendedor</span>
                </button>
              </>
            )}
            
            <button className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 border border-orange-200">
              <Eye className="h-5 w-5 text-orange-600 mr-3" />
              <span className="text-orange-700 font-medium">Ver Relatórios</span>
            </button>
          </div>
        </div>

        {/* Alertas se houver produtos com estoque baixo */}
        {estatisticas.produtosEstoqueBaixo > 0 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-orange-800 font-medium">
                Atenção: Produtos com Estoque Baixo
              </h3>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              {estatisticas.produtosEstoqueBaixo} produto(s) estão com estoque baixo. 
              Verifique a seção de produtos para mais detalhes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};