// src/components/screens/Dashboard.tsx
import React, { useMemo } from 'react';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Tags, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Archive
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { Vendedor } from '../../types/Vendedor';
import { Produto } from '../../types/Produto';
import { Categoria } from '../../types/Categoria';
import { Consignacao } from '../../types/Consignacao';

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

  // Calcular Estatísticas
  const estatisticas = useMemo(() => {
    // Vendedores
    const vendedoresAtivos = vendedores.filter((v: Vendedor) => v.status === 'Ativo').length;
    const vendedoresInativos = vendedores.filter((v: Vendedor) => v.status === 'Inativo').length;

    // Produtos
    const produtosAtivos = produtos.filter((p: Produto) => p.ativo).length;
    const produtosInativos = produtos.filter((p: Produto) => !p.ativo).length;
    const produtosEstoqueBaixo = produtos.filter((p: Produto) => 
      p.ativo && p.estoque <= p.estoqueMinimo
    ).length;
    
    // Valores
    const valorTotalEstoque = produtos
      .filter((p: Produto) => p.ativo)
      .reduce((total: number, p: Produto) => total + (p.valorVenda * p.estoque), 0);
    
    const itensEstoque = produtos
      .filter((p: Produto) => p.ativo)
      .reduce((total: number, p: Produto) => total + p.estoque, 0);

    // Categorias
    const categoriasAtivas = categorias.filter((c: Categoria) => c.ativa).length;
    const categoriasInativas = categorias.filter((c: Categoria) => !c.ativa).length;

    // Consignações
    const consignacaoesAtivas = consignacoes.filter((c: Consignacao) => c.status === 'ativa').length;
    const consignacaoesFinalizadas = consignacoes.filter((c: Consignacao) => c.status === 'finalizada').length;
    const consignacoesCanceladas = consignacoes.filter((c: Consignacao) => c.status === 'cancelada').length;
    
    const valorConsignacaoesAtivas = consignacoes
      .filter((c: Consignacao) => c.status === 'ativa')
      .reduce((total: number, c: Consignacao) => total + c.valorTotal, 0);
    
    const quantidadeTotalConsignada = consignacoes
      .filter((c: Consignacao) => c.status === 'ativa')
      .reduce((total: number, c: Consignacao) => total + c.quantidadeTotal, 0);

    // Consignações do usuário (se for vendedor)
    const minhasConsignacoes = tipoUsuario === 'vendedor' 
      ? consignacoes.filter((c: Consignacao) => c.vendedorId === usuarioLogado?.id)
      : [];
    
    const minhasConsignacaoesAtivas = minhasConsignacoes.filter((c: Consignacao) => c.status === 'ativa').length;
    const valorMinhasConsignacoes = minhasConsignacoes
      .filter((c: Consignacao) => c.status === 'ativa')
      .reduce((total: number, c: Consignacao) => total + c.valorTotal, 0);

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
  const cardsAdmin = [
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
  const cardsVendedor = [
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
            {tipoUsuario && (
              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {tipoUsuario === 'admin' ? 'Administrador' : 'Vendedor'}
              </span>
            )}
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => (
            <div key={index} className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda} hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${tema.textoSecundario} mb-1`}>
                    {card.titulo}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${card.urgente ? 'text-red-600' : tema.texto}`}>
                      {formatarValor(card.valor, card.formato)}
                    </p>
                    {card.total && (
                      <span className={`text-sm ${tema.textoSecundario}`}>
                        / {card.total}
                      </span>
                    )}
                    {card.tendencia && (
                      <div className={`flex items-center ${card.tendencia === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {card.tendencia === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                  {card.subtitulo && (
                    <p className={`text-xs ${tema.textoSecundario} mt-1`}>
                      {card.subtitulo}
                    </p>
                  )}
                  {card.alerta && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ {card.alerta} produto(s) com estoque baixo
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${card.cor}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo de Consignações */}
        {tipoUsuario === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status das Consignações */}
            <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
              <h3 className={`text-lg font-semibold ${tema.texto} mb-4 flex items-center`}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Status das Consignações
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium text-green-700">Ativas</span>
                  </div>
                  <span className="font-bold text-green-700">
                    {estatisticas.consignacaoesAtivas}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Archive className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium text-blue-700">Finalizadas</span>
                  </div>
                  <span className="font-bold text-blue-700">
                    {estatisticas.consignacaoesFinalizadas}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-medium text-red-700">Canceladas</span>
                  </div>
                  <span className="font-bold text-red-700">
                    {estatisticas.consignacoesCanceladas}
                  </span>
                </div>
              </div>
            </div>

            {/* Produtos com Estoque Baixo */}
            <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
              <h3 className={`text-lg font-semibold ${tema.texto} mb-4 flex items-center`}>
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Alertas de Estoque
              </h3>
              {estatisticas.produtosEstoqueBaixo > 0 ? (
                <div className="space-y-3">
                  {produtos
                    .filter((p: Produto) => p.ativo && p.estoque <= p.estoqueMinimo)
                    .slice(0, 5)
                    .map((produto: Produto) => (
                      <div key={produto.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-red-700">{produto.nome}</p>
                          <p className="text-sm text-red-600">
                            Estoque: {produto.estoque} / Mínimo: {produto.estoqueMinimo}
                          </p>
                        </div>
                        <div className="text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  {estatisticas.produtosEstoqueBaixo > 5 && (
                    <p className={`text-sm ${tema.textoSecundario} text-center`}>
                      E mais {estatisticas.produtosEstoqueBaixo - 5} produto(s)...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className={`mx-auto h-12 w-12 text-green-500 mb-2`} />
                  <p className="text-green-700 font-medium">Todos os produtos com estoque adequado!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações do Sistema */}
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <h3 className={`text-lg font-semibold ${tema.texto} mb-4`}>
            Sistema de Consignação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-medium ${tema.texto} mb-3`}>Funcionalidades Disponíveis:</h4>
              <ul className={`text-sm ${tema.textoSecundario} space-y-2`}>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Sistema de login e autenticação
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Dashboard com estatísticas em tempo real
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {tipoUsuario === 'admin' ? 'Gestão completa de vendedores' : 'Visualização de vendedores'}
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Gestão de produtos e categorias
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Sistema de consignações
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Alertas de estoque baixo
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Temas claro e escuro
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-medium ${tema.texto} mb-3`}>Ações Rápidas:</h4>
              <div className="space-y-2">
                {tipoUsuario === 'admin' && (
                  <>
                    <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                      → Criar novo vendedor
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors">
                      → Adicionar produto
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors">
                      → Nova categoria
                    </button>
                  </>
                )}
                <button className="w-full text-left px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors">
                  → Nova consignação
                </button>
                {estatisticas.produtosEstoqueBaixo > 0 && (
                  <button className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
                    → Ver produtos com estoque baixo ({estatisticas.produtosEstoqueBaixo})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};