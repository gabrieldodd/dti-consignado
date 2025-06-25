// src/components/screens/Dashboard.tsx
import React, { useMemo } from 'react';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Tags, 
  Archive,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';

export const Dashboard: React.FC = () => {
  const { 
    tema, 
    vendedores, 
    produtos, 
    categorias, 
    consignacoes, 
    tipoUsuario 
  } = useAppContext();
  
  const { formatarMoedaBR } = useFormatters();

  const estatisticas = useMemo(() => {
    const vendedoresAtivos = vendedores.filter((v: any) => v.status === 'Ativo').length;
    const produtosAtivos = produtos.filter((p: any) => p.ativo).length;
    const produtosEstoqueBaixo = produtos.filter((p: any) => p.ativo && p.estoque <= p.estoqueMinimo).length;
    const valorTotalEstoque = produtos
      .filter((p: any) => p.ativo)
      .reduce((total: number, p: any) => total + (p.valorVenda * p.estoque), 0);
    const categoriasAtivas = categorias.filter((c: any) => c.ativa).length;
    const itensEstoque = produtos
      .filter((p: any) => p.ativo)
      .reduce((total: number, p: any) => total + p.estoque, 0);
    const consignacaoesAtivas = consignacoes.filter((c: any) => c.status === 'ativa').length;
    const valorConsignacaoesAtivas = consignacoes
      .filter((c: any) => c.status === 'ativa')
      .reduce((total: number, c: any) => total + c.valorTotal, 0);
    const quantidadeTotalConsignada = consignacoes
      .filter((c: any) => c.status === 'ativa')
      .reduce((total: number, c: any) => total + c.quantidadeTotal, 0);

    return {
      vendedoresAtivos,
      produtosAtivos,
      produtosEstoqueBaixo,
      valorTotalEstoque,
      categoriasAtivas,
      itensEstoque,
      consignacaoesAtivas,
      valorConsignacaoesAtivas,
      quantidadeTotalConsignada
    };
  }, [vendedores, produtos, categorias, consignacoes]);

  const cardsAdmin = [
    {
      titulo: 'Vendedores Ativos',
      valor: estatisticas.vendedoresAtivos,
      icon: Users,
      cor: 'bg-blue-500',
      formato: 'numero'
    },
    {
      titulo: 'Produtos Ativos',
      valor: estatisticas.produtosAtivos,
      icon: Package,
      cor: 'bg-green-500',
      formato: 'numero'
    },
    {
      titulo: 'Estoque Baixo',
      valor: estatisticas.produtosEstoqueBaixo,
      icon: AlertTriangle,
      cor: 'bg-yellow-500',
      formato: 'numero'
    },
    {
      titulo: 'Valor Total Estoque',
      valor: estatisticas.valorTotalEstoque,
      icon: DollarSign,
      cor: 'bg-green-600',
      formato: 'moeda'
    },
    {
      titulo: 'Categorias Ativas',
      valor: estatisticas.categoriasAtivas,
      icon: Tags,
      cor: 'bg-purple-500',
      formato: 'numero'
    },
    {
      titulo: 'Itens em Estoque',
      valor: estatisticas.itensEstoque,
      icon: Archive,
      cor: 'bg-indigo-500',
      formato: 'numero'
    },
    {
      titulo: 'Consignações Ativas',
      valor: estatisticas.consignacaoesAtivas,
      icon: ShoppingCart,
      cor: 'bg-orange-500',
      formato: 'numero'
    },
    {
      titulo: 'Valor Consignado',
      valor: estatisticas.valorConsignacaoesAtivas,
      icon: TrendingUp,
      cor: 'bg-red-500',
      formato: 'moeda'
    }
  ];

  const cardsVendedor = [
    {
      titulo: 'Minhas Consignações',
      valor: estatisticas.consignacaoesAtivas,
      icon: ShoppingCart,
      cor: 'bg-blue-500',
      formato: 'numero'
    },
    {
      titulo: 'Valor Consignado',
      valor: estatisticas.valorConsignacaoesAtivas,
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
      titulo: 'Itens Consignados',
      valor: estatisticas.quantidadeTotalConsignada,
      icon: Archive,
      cor: 'bg-indigo-500',
      formato: 'numero'
    }
  ];

  const cards = tipoUsuario === 'admin' ? cardsAdmin : cardsVendedor;

  const formatarValor = (valor: number, formato: string) => {
    if (formato === 'moeda') {
      return formatarMoedaBR(valor);
    }
    return valor.toString();
  };

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${tema.texto}`}>
            Dashboard
          </h1>
          <p className={`mt-2 ${tema.textoSecundario}`}>
            Visão geral do sistema de consignação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${tema.papel} ${tema.borda} border rounded-lg p-6 shadow-sm`}
            >
              <div className="flex items-center">
                <div className={`${card.cor} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${tema.textoSecundario}`}>
                    {card.titulo}
                  </p>
                  <p className={`text-2xl font-bold ${tema.texto}`}>
                    {formatarValor(card.valor, card.formato)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alertas de Estoque Baixo (apenas para admin) */}
        {tipoUsuario === 'admin' && estatisticas.produtosEstoqueBaixo > 0 && (
          <div className={`mt-8 ${tema.papel} ${tema.borda} border rounded-lg p-6`}>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className={`text-lg font-semibold ${tema.texto}`}>
                Produtos com Estoque Baixo
              </h2>
            </div>
            <div className="space-y-2">
              {produtos
                .filter((p: any) => p.ativo && p.estoque <= p.estoqueMinimo)
                .map((produto: any) => (
                  <div
                    key={produto.id}
                    className={`flex justify-between items-center p-3 ${tema.hover} rounded-md`}
                  >
                    <div>
                      <p className={`font-medium ${tema.texto}`}>
                        {produto.nome}
                      </p>
                      <p className={`text-sm ${tema.textoSecundario}`}>
                        Categoria: {produto.categoria}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${tema.texto}`}>
                        Estoque: <span className="font-bold text-red-600">{produto.estoque}</span>
                      </p>
                      <p className={`text-xs ${tema.textoSecundario}`}>
                        Mínimo: {produto.estoqueMinimo}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Consignações Recentes */}
        <div className={`mt-8 ${tema.papel} ${tema.borda} border rounded-lg p-6`}>
          <h2 className={`text-lg font-semibold ${tema.texto} mb-4`}>
            Consignações Ativas Recentes
          </h2>
          <div className="space-y-3">
            {consignacoes
              .filter((c: any) => c.status === 'ativa')
              .slice(0, 5)
              .map((consignacao: any) => (
                <div
                  key={consignacao.id}
                  className={`flex justify-between items-center p-3 ${tema.hover} rounded-md`}
                >
                  <div>
                    <p className={`font-medium ${tema.texto}`}>
                      {consignacao.clienteNome}
                    </p>
                    <p className={`text-sm ${tema.textoSecundario}`}>
                      Vendedor: {consignacao.vendedor.nome}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${tema.texto}`}>
                      {formatarMoedaBR(consignacao.valorTotal)}
                    </p>
                    <p className={`text-xs ${tema.textoSecundario}`}>
                      {consignacao.quantidadeTotal} itens
                    </p>
                  </div>
                </div>
              ))}
            {consignacoes.filter((c: any) => c.status === 'ativa').length === 0 && (
              <p className={`text-center py-4 ${tema.textoSecundario}`}>
                Nenhuma consignação ativa encontrada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};