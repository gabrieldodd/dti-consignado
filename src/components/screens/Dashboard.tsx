// src/components/screens/Dashboard.tsx
import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Tag, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    tema, 
    vendedores, 
    produtos, 
    categorias, 
    consignacoes,
    usuarioLogado,
    tipoUsuario,
    loadingConsignacoes,
    loadingProdutos,
    loadingVendedores
  } = useAppContext();

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const consignacoesAtivas = consignacoes.filter(c => c.status === 'ativa');
    const consignacoesFinalizadas = consignacoes.filter(c => c.status === 'finalizada');
    const produtosAtivos = produtos.filter(p => p.ativo);
    const vendedoresAtivos = vendedores.filter(v => v.status === 'Ativo');
    
    const valorTotalConsignacoes = consignacoes.reduce((acc, c) => acc + (c.valor_total || 0), 0);
    const valorTotalFinalizadas = consignacoesFinalizadas.reduce((acc, c) => acc + (c.valor_total || 0), 0);
    
    // Consignações do mês atual
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const consignacoesMes = consignacoes.filter(c => 
      new Date(c.data_consignacao || c.created_at) >= inicioMes
    );

    // Produtos com estoque baixo
    const produtosEstoqueBaixo = produtos.filter(p => 
      p.ativo && p.estoque <= p.estoque_minimo
    );

    return {
      totalConsignacoes: consignacoes.length,
      consignacoesAtivas: consignacoesAtivas.length,
      consignacoesFinalizadas: consignacoesFinalizadas.length,
      totalProdutos: produtos.length,
      produtosAtivos: produtosAtivos.length,
      totalVendedores: vendedores.length,
      vendedoresAtivos: vendedoresAtivos.length,
      totalCategorias: categorias.length,
      valorTotalConsignacoes,
      valorTotalFinalizadas,
      consignacoesMes: consignacoesMes.length,
      produtosEstoqueBaixo: produtosEstoqueBaixo.length
    };
  }, [consignacoes, produtos, vendedores, categorias]);

  // Cards de estatísticas principais
  const cardsEstatisticas = [
    {
      titulo: 'Consignações Ativas',
      valor: estatisticas.consignacoesAtivas,
      icon: Clock,
      cor: 'orange',
      descricao: 'Em andamento'
    },
    {
      titulo: 'Consignações Finalizadas',
      valor: estatisticas.consignacoesFinalizadas,
      icon: CheckCircle,
      cor: 'green',
      descricao: 'Concluídas'
    },
    {
      titulo: 'Produtos Ativos',
      valor: estatisticas.produtosAtivos,
      icon: Package,
      cor: 'blue',
      descricao: 'Disponíveis'
    },
    {
      titulo: 'Valor Total',
      valor: `R$ ${estatisticas.valorTotalConsignacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      cor: 'purple',
      descricao: 'Em consignações'
    }
  ];

  // Filtrar cards baseado no tipo de usuário
  const cardsVisiveis = tipoUsuario === 'admin' 
    ? cardsEstatisticas 
    : cardsEstatisticas.filter((_, index) => index < 2 || index === 3);

  // Cores dos cards
  const getCoresCardo = (cor: string) => {
    const cores = {
      orange: 'bg-orange-500 text-white',
      green: 'bg-green-500 text-white',
      blue: 'bg-blue-500 text-white',
      purple: 'bg-purple-500 text-white'
    };
    return cores[cor as keyof typeof cores] || cores.blue;
  };

  // Loading
  if (loadingConsignacoes || loadingProdutos || loadingVendedores) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${tema.textoSecundario}`}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${tema.fundo}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${tema.texto} mb-2`}>
            Dashboard
          </h1>
          <p className={`${tema.textoSecundario}`}>
            Bem-vindo, {usuarioLogado.nome}! Aqui está um resumo do sistema.
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cardsVisiveis.map((card, index) => {
            const Icon = card.icon;
            return (
              <div 
                key={index}
                className={`${tema.papel} p-6 rounded-lg border ${tema.borda} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${tema.textoSecundario}`}>
                      {card.titulo}
                    </p>
                    <p className={`text-2xl font-bold ${tema.texto} mt-1`}>
                      {card.valor}
                    </p>
                    <p className={`text-xs ${tema.textoSecundario} mt-1`}>
                      {card.descricao}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${getCoresCardo(card.cor)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo do Mês */}
          <div className={`${tema.papel} p-6 rounded-lg border ${tema.borda} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${tema.texto}`}>
                Resumo do Mês
              </h3>
              <Calendar className={`h-5 w-5 ${tema.textoSecundario}`} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${tema.textoSecundario}`}>Novas Consignações</span>
                <span className={`font-semibold ${tema.texto}`}>
                  {estatisticas.consignacoesMes}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`${tema.textoSecundario}`}>Taxa de Finalização</span>
                <span className={`font-semibold ${tema.texto}`}>
                  {estatisticas.totalConsignacoes > 0 
                    ? `${((estatisticas.consignacoesFinalizadas / estatisticas.totalConsignacoes) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`${tema.textoSecundario}`}>Valor Médio</span>
                <span className={`font-semibold ${tema.texto}`}>
                  R$ {estatisticas.totalConsignacoes > 0 
                    ? (estatisticas.valorTotalConsignacoes / estatisticas.totalConsignacoes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    : '0,00'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Alertas e Avisos */}
          <div className={`${tema.papel} p-6 rounded-lg border ${tema.borda} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${tema.texto}`}>
                Alertas
              </h3>
              <AlertTriangle className={`h-5 w-5 ${tema.textoSecundario}`} />
            </div>
            
            <div className="space-y-3">
              {/* Produtos com estoque baixo */}
              {estatisticas.produtosEstoqueBaixo > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Estoque Baixo
                    </p>
                    <p className="text-xs text-yellow-600">
                      {estatisticas.produtosEstoqueBaixo} produto(s) com estoque baixo
                    </p>
                  </div>
                </div>
              )}

              {/* Consignações ativas */}
              {estatisticas.consignacoesAtivas > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Consignações Pendentes
                    </p>
                    <p className="text-xs text-blue-600">
                      {estatisticas.consignacoesAtivas} consignação(ões) aguardando retorno
                    </p>
                  </div>
                </div>
              )}

              {/* Tudo em ordem */}
              {estatisticas.produtosEstoqueBaixo === 0 && estatisticas.consignacoesAtivas === 0 && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Tudo em Ordem
                    </p>
                    <p className="text-xs text-green-600">
                      Não há alertas no momento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações do Sistema (apenas para admin) */}
        {tipoUsuario === 'admin' && (
          <div className={`${tema.papel} p-6 rounded-lg border ${tema.borda} shadow-sm mt-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${tema.texto}`}>
                Informações do Sistema
              </h3>
              <BarChart3 className={`h-5 w-5 ${tema.textoSecundario}`} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${tema.texto}`}>
                  {estatisticas.totalVendedores}
                </p>
                <p className={`text-sm ${tema.textoSecundario}`}>
                  Total Vendedores
                </p>
              </div>
              
              <div className="text-center">
                <p className={`text-2xl font-bold ${tema.texto}`}>
                  {estatisticas.vendedoresAtivos}
                </p>
                <p className={`text-sm ${tema.textoSecundario}`}>
                  Vendedores Ativos
                </p>
              </div>
              
              <div className="text-center">
                <p className={`text-2xl font-bold ${tema.texto}`}>
                  {estatisticas.totalCategorias}
                </p>
                <p className={`text-sm ${tema.textoSecundario}`}>
                  Categorias
                </p>
              </div>
              
              <div className="text-center">
                <p className={`text-2xl font-bold ${tema.texto}`}>
                  {estatisticas.totalProdutos}
                </p>
                <p className={`text-sm ${tema.textoSecundario}`}>
                  Total Produtos
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};