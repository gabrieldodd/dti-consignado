// src/components/screens/TelaConsignacoes.tsx - VERSÃO CORRIGIDA
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Search, FileText, Calendar, User, Phone, DollarSign, Package, Eye, CheckCircle, X, AlertCircle, Trash2, Hash, Minus, QrCode } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface ProdutoConsignacao {
  id: number;
  produtoId: number;
  produto: any;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface ProdutoRetorno {
  produtoId: number;
  produto: any;
  quantidadeDeixada: number;
  quantidadeRetornada: number;
  quantidadeVendida: number;
  valorUnitario: number;
}

export const TelaConsignacoes: React.FC = () => {
  const { 
    tema, 
    consignacoes, 
    vendedores,
    produtos,
    adicionarConsignacao, 
    finalizarConsignacao,
    excluirConsignacao,
    mostrarMensagem,
    formatarMoeda,
    formatarData,
    formatarDocumento,
    validarCPF,
    validarCNPJ,
    usuarioLogado,
    tipoUsuario
  } = useAppContext();

  // Estados gerais
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [ordenacao, setOrdenacao] = useState<'data' | 'valor' | 'cliente'>('data');
  const [carregando, setCarregando] = useState(false);

  // Estados para modal de nova consignação
  const [modalAberto, setModalAberto] = useState(false);
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf' as 'cpf' | 'cnpj',
    vendedorId: '',
    observacoes: ''
  });
  const [produtosConsignacao, setProdutosConsignacao] = useState<ProdutoConsignacao[]>([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  const codigoBarrasRef = useRef<HTMLInputElement>(null);

  // Estados para modal de finalização
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [consignacaoSelecionada, setConsignacaoSelecionada] = useState<any>(null);
  const [produtosRetorno, setProdutosRetorno] = useState<ProdutoRetorno[]>([]);
  const [codigoRetorno, setCodigoRetorno] = useState('');
  const [observacoesRetorno, setObservacoesRetorno] = useState('');
  const codigoRetornoRef = useRef<HTMLInputElement>(null);

  const [erros, setErros] = useState<Record<string, string>>({});

  // Filtrar e ordenar consignações
  const consignacoesFiltradas = useMemo(() => {
    let resultado = consignacoes.filter((c: any) => {
      if (tipoUsuario === 'vendedor' && c.vendedor_id !== usuarioLogado?.id) return false;
      if (filtroStatus !== 'todas' && c.status !== filtroStatus) return false;
      if (busca) {
        const termo = busca.toLowerCase();
        return c.cliente_nome?.toLowerCase().includes(termo) ||
               c.cliente_documento?.includes(busca) ||
               c.vendedores?.nome?.toLowerCase().includes(termo);
      }
      return true;
    });

    return resultado.sort((a: any, b: any) => {
      switch (ordenacao) {
        case 'valor': return (b.valor_total || 0) - (a.valor_total || 0);
        case 'cliente': return (a.cliente_nome || '').localeCompare(b.cliente_nome || '');
        default: return new Date(b.data_consignacao || 0).getTime() - new Date(a.data_consignacao || 0).getTime();
      }
    });
  }, [consignacoes, tipoUsuario, usuarioLogado, filtroStatus, busca, ordenacao]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const total = consignacoesFiltradas.length;
    const ativas = consignacoesFiltradas.filter((c: any) => c.status === 'Aberta').length;
    const finalizadas = consignacoesFiltradas.filter((c: any) => c.status === 'Finalizada').length;
    const valorTotal = consignacoesFiltradas.reduce((acc: number, c: any) => acc + (c.valor_total || 0), 0);
    
    return { total, ativas, finalizadas, valorTotal };
  }, [consignacoesFiltradas]);

  // Inicializar vendedor se for vendedor
  useEffect(() => {
    if (tipoUsuario === 'vendedor' && usuarioLogado) {
      setFormData(prev => ({ ...prev, vendedorId: usuarioLogado.id?.toString() || '' }));
    }
  }, [tipoUsuario, usuarioLogado]);

  // ========================================
  // FUNÇÕES PARA CRIAÇÃO DE CONSIGNAÇÃO
  // ========================================

  const lerCodigoBarras = () => {
    if (!codigoBarras.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    const produto = produtos?.find((p: any) => 
      p.codigo_barras === codigoBarras.trim() && p.ativo
    );

    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado ou inativo');
      setCodigoBarras('');
      return;
    }

    // Verificar se produto já foi adicionado
    const produtoExistente = produtosConsignacao.find(pc => pc.produtoId === produto.id);
    
    if (produtoExistente) {
      // Aumentar quantidade
      setProdutosConsignacao(prev => prev.map(pc =>
        pc.produtoId === produto.id
          ? { 
              ...pc, 
              quantidade: pc.quantidade + 1,
              valorTotal: (pc.quantidade + 1) * pc.valorUnitario
            }
          : pc
      ));
    } else {
      // Adicionar novo produto
      const novoProduto: ProdutoConsignacao = {
        id: Date.now(),
        produtoId: produto.id,
        produto: produto,
        quantidade: 1,
        valorUnitario: produto.valor_venda,
        valorTotal: produto.valor_venda
      };
      setProdutosConsignacao(prev => [...prev, novoProduto]);
    }

    setCodigoBarras('');
    mostrarMensagem('success', `${produto.nome} adicionado! Qtd: ${produtoExistente ? produtoExistente.quantidade + 1 : 1}`);
    
    // Focar novamente no campo
    setTimeout(() => codigoBarrasRef.current?.focus(), 100);
  };

  const alterarQuantidadeProduto = (id: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerProduto(id);
      return;
    }

    setProdutosConsignacao(prev => prev.map(pc =>
      pc.id === id
        ? { 
            ...pc, 
            quantidade: novaQuantidade,
            valorTotal: novaQuantidade * pc.valorUnitario
          }
        : pc
    ));
  };

  const removerProduto = (id: number) => {
    setProdutosConsignacao(prev => prev.filter(pc => pc.id !== id));
  };

  const calcularTotalConsignacao = () => {
    return produtosConsignacao.reduce((total, pc) => total + pc.valorTotal, 0);
  };

  // ========================================
  // FUNÇÕES PARA FINALIZAÇÃO/RETORNO
  // ========================================

  const lerCodigoRetorno = () => {
    if (!codigoRetorno.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    const produto = produtos?.find((p: any) => 
      p.codigo_barras === codigoRetorno.trim() && p.ativo
    );

    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado ou inativo');
      setCodigoRetorno('');
      return;
    }

    // Para demonstração, vamos simular que o produto estava na consignação
    // Na implementação real, você buscaria da consignação original
    const produtoRetornoExistente = produtosRetorno.find(pr => pr.produtoId === produto.id);
    
    if (produtoRetornoExistente) {
      // Verificar se pode aumentar a quantidade
      if (produtoRetornoExistente.quantidadeRetornada >= produtoRetornoExistente.quantidadeDeixada) {
        mostrarMensagem('error', 'Quantidade de retorno não pode ser maior que a deixada');
        setCodigoRetorno('');
        return;
      }

      // Aumentar quantidade de retorno
      setProdutosRetorno(prev => prev.map(pr =>
        pr.produtoId === produto.id
          ? { 
              ...pr, 
              quantidadeRetornada: pr.quantidadeRetornada + 1,
              quantidadeVendida: pr.quantidadeDeixada - (pr.quantidadeRetornada + 1)
            }
          : pr
      ));
    } else {
      // Adicionar produto ao retorno (simulando que estava na consignação)
      const novoProdutoRetorno: ProdutoRetorno = {
        produtoId: produto.id,
        produto: produto,
        quantidadeDeixada: 5, // Simulado - na implementação real viria da consignação
        quantidadeRetornada: 1,
        quantidadeVendida: 4,
        valorUnitario: produto.valor_venda
      };
      setProdutosRetorno(prev => [...prev, novoProdutoRetorno]);
    }

    setCodigoRetorno('');
    mostrarMensagem('success', `${produto.nome} adicionado ao retorno!`);
    
    // Focar novamente no campo
    setTimeout(() => codigoRetornoRef.current?.focus(), 100);
  };

  const alterarQuantidadeRetorno = (produtoId: number, novaQuantidade: number) => {
    setProdutosRetorno(prev => prev.map(pr =>
      pr.produtoId === produtoId
        ? { 
            ...pr, 
            quantidadeRetornada: Math.max(0, Math.min(novaQuantidade, pr.quantidadeDeixada)),
            quantidadeVendida: pr.quantidadeDeixada - Math.max(0, Math.min(novaQuantidade, pr.quantidadeDeixada))
          }
        : pr
    ));
  };

  const removerProdutoRetorno = (produtoId: number) => {
    setProdutosRetorno(prev => prev.filter(pr => pr.produtoId !== produtoId));
  };

  const calcularTotaisRetorno = () => {
    const totalRetornado = produtosRetorno.reduce((total, pr) => total + (pr.quantidadeRetornada * pr.valorUnitario), 0);
    const totalVendido = produtosRetorno.reduce((total, pr) => total + (pr.quantidadeVendida * pr.valorUnitario), 0);
    
    return { totalRetornado, totalVendido };
  };

  // ========================================
  // FUNÇÕES DE VALIDAÇÃO E SALVAMENTO
  // ========================================

  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.clienteNome.trim()) {
      novosErros.clienteNome = 'Nome do cliente é obrigatório';
    }

    if (!formData.clienteDocumento.trim()) {
      novosErros.clienteDocumento = 'Documento é obrigatório';
    }

    if (!formData.clienteTelefone.trim()) {
      novosErros.clienteTelefone = 'Telefone é obrigatório';
    }

    if (!formData.vendedorId) {
      novosErros.vendedorId = 'Selecione um vendedor';
    }

    if (produtosConsignacao.length === 0) {
      novosErros.produtos = 'Adicione pelo menos um produto';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const salvarConsignacao = async () => {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      const dadosConsignacao = {
        ...formData,
        produtos: produtosConsignacao.map(pc => ({
          produto_id: pc.produtoId,
          quantidade: pc.quantidade,
          valor_unitario: pc.valorUnitario,
          valor_total: pc.valorTotal
        })),
        valor_total: calcularTotalConsignacao(),
        data_consignacao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 dias
      };

      const resultado = await adicionarConsignacao(dadosConsignacao);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação criada com sucesso!');
        resetarFormulario();
        setModalAberto(false);
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao criar consignação');
      }
    } catch (error) {
      console.error('Erro ao salvar consignação:', error);
      mostrarMensagem('error', 'Erro ao criar consignação');
    } finally {
      setCarregando(false);
    }
  };

  const salvarFinalizacao = async () => {
    if (produtosRetorno.length === 0) {
      mostrarMensagem('error', 'Adicione pelo menos um produto ao retorno');
      return;
    }

    setCarregando(true);
    try {
      const { totalRetornado, totalVendido } = calcularTotaisRetorno();
      
      const dadosRetorno = {
        produtos_retorno: produtosRetorno.map(pr => ({
          produto_id: pr.produtoId,
          quantidade_deixada: pr.quantidadeDeixada,
          quantidade_retornada: pr.quantidadeRetornada,
          quantidade_vendida: pr.quantidadeVendida,
          valor_unitario: pr.valorUnitario
        })),
        valor_retornado: totalRetornado,
        valor_vendido: totalVendido,
        observacoes: observacoesRetorno
      };

      const resultado = await finalizarConsignacao(consignacaoSelecionada.id, dadosRetorno);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação finalizada com sucesso!');
        setModalFinalizarAberto(false);
        resetarFormRetorno();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao finalizar consignação');
      }
    } catch (error) {
      console.error('Erro ao finalizar consignação:', error);
      mostrarMensagem('error', 'Erro ao finalizar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // ========================================
  // FUNÇÕES DE RESET
  // ========================================

  const resetarFormulario = () => {
    setFormData({
      clienteNome: '',
      clienteDocumento: '',
      clienteTelefone: '',
      tipoDocumento: 'cpf',
      vendedorId: tipoUsuario === 'vendedor' && usuarioLogado ? usuarioLogado.id?.toString() || '' : '',
      observacoes: ''
    });
    setProdutosConsignacao([]);
    setCodigoBarras('');
    setErros({});
  };

  const resetarFormRetorno = () => {
    setConsignacaoSelecionada(null);
    setProdutosRetorno([]);
    setCodigoRetorno('');
    setObservacoesRetorno('');
  };

  // ========================================
  // FUNÇÕES DE ABERTURA DE MODAIS
  // ========================================

  const abrirModalFinalizar = (consignacao: any) => {
    setConsignacaoSelecionada(consignacao);
    setProdutosRetorno([]);
    setModalFinalizarAberto(true);
    setTimeout(() => codigoRetornoRef.current?.focus(), 100);
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta consignação?')) return;

    try {
      const resultado = await excluirConsignacao(id);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação excluída com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir consignação');
      }
    } catch (error) {
      console.error('Erro ao excluir consignação:', error);
      mostrarMensagem('error', 'Erro ao excluir consignação');
    }
  };

  return (
    <div className={`flex-1 p-6 ${tema.background}`}>
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${tema.text} mb-2`}>Consignações</h1>
        <p className={tema.textSecondary}>Gerencie todas as consignações</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Total</p>
              <p className={`text-2xl font-bold ${tema.text}`}>{estatisticas.total}</p>
            </div>
            <FileText className={`w-8 h-8 ${tema.textSecondary}`} />
          </div>
        </div>

        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Ativas</p>
              <p className={`text-2xl font-bold text-blue-600`}>{estatisticas.ativas}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Finalizadas</p>
              <p className={`text-2xl font-bold text-green-600`}>{estatisticas.finalizadas}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Valor Total</p>
              <p className={`text-2xl font-bold ${tema.text}`}>
                {formatarMoeda ? formatarMoeda(estatisticas.valorTotal) : `R$ ${estatisticas.valorTotal.toFixed(2)}`}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className={`${tema.surface} p-4 rounded-lg border ${tema.border} mb-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, documento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`px-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
            >
              <option value="todas">Todas</option>
              <option value="Aberta">Ativas</option>
              <option value="Finalizada">Finalizadas</option>
              <option value="Cancelada">Canceladas</option>
            </select>

            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className={`px-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
            >
              <option value="data">Ordenar por Data</option>
              <option value="valor">Ordenar por Valor</option>
              <option value="cliente">Ordenar por Cliente</option>
            </select>

            <button
              onClick={() => setModalAberto(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Consignação
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Consignações */}
      <div className={`${tema.surface} rounded-lg border ${tema.border} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${tema.surface} border-b ${tema.border}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Cliente
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Vendedor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Data
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Valor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`${tema.surface} divide-y ${tema.border}`}>
              {consignacoesFiltradas.map((consignacao: any) => (
                <tr key={consignacao.id} className={tema.hover}>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    <div>
                      <div className="text-sm font-medium">{consignacao.cliente_nome}</div>
                      <div className={`text-sm ${tema.textSecondary}`}>{consignacao.cliente_documento}</div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.text}`}>
                    {consignacao.vendedores?.nome || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.text}`}>
                    {formatarData ? formatarData(consignacao.data_consignacao) : consignacao.data_consignacao}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.text}`}>
                    {formatarMoeda ? formatarMoeda(consignacao.valor_total) : `R$ ${consignacao.valor_total?.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      consignacao.status === 'Aberta' 
                        ? 'bg-blue-100 text-blue-800' 
                        : consignacao.status === 'Finalizada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {consignacao.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {consignacao.status === 'Aberta' && (
                        <button
                          onClick={() => abrirModalFinalizar(consignacao)}
                          className="text-green-600 hover:text-green-900"
                          title="Finalizar"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleExcluir(consignacao.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {consignacoesFiltradas.length === 0 && (
            <div className={`text-center py-8 ${tema.textSecondary}`}>
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma consignação encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVA CONSIGNAÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${tema.text}`}>Nova Consignação</h2>
                <button
                  onClick={() => {
                    setModalAberto(false);
                    resetarFormulario();
                  }}
                  className={`p-2 rounded-lg ${tema.hover} ${tema.text}`}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna 1: Dados do Cliente */}
                <div className="space-y-4">
                  <h3 className={`font-semibold ${tema.text} mb-4`}>Dados do Cliente</h3>
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.clienteNome}
                      onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder="Nome completo do cliente"
                    />
                    {erros.clienteNome && (
                      <p className="text-red-500 text-xs mt-1">{erros.clienteNome}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                        Tipo de Documento
                      </label>
                      <select
                        value={formData.tipoDocumento}
                        onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as 'cpf' | 'cnpj' })}
                        className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      >
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                        {formData.tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'} *
                      </label>
                      <input
                        type="text"
                        value={formData.clienteDocumento}
                        onChange={(e) => setFormData({ ...formData, clienteDocumento: e.target.value })}
                        placeholder={formData.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                        className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      />
                      {erros.clienteDocumento && (
                        <p className="text-red-500 text-xs mt-1">{erros.clienteDocumento}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Telefone *
                    </label>
                    <input
                      type="text"
                      value={formData.clienteTelefone}
                      onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    />
                    {erros.clienteTelefone && (
                      <p className="text-red-500 text-xs mt-1">{erros.clienteTelefone}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Vendedor Responsável *
                    </label>
                    <select
                      value={formData.vendedorId}
                      onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value })}
                      disabled={tipoUsuario === 'vendedor'}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    >
                      <option value="">Selecione um vendedor</option>
                      {vendedores && Array.isArray(vendedores) && 
                       vendedores
                         .filter((v: any) => {
                           const status = String(v.status || '').toLowerCase();
                           return status === 'ativo' || status === 'active';
                         })
                         .map((vendedor: any) => (
                           <option key={vendedor.id} value={vendedor.id}>
                             {vendedor.nome}
                           </option>
                         ))
                      }
                    </select>
                    {erros.vendedorId && (
                      <p className="text-red-500 text-xs mt-1">{erros.vendedorId}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Observações
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder="Observações adicionais..."
                    />
                  </div>
                </div>

                {/* Coluna 2: Produtos */}
                <div className="space-y-4">
                  <h3 className={`font-semibold ${tema.text} mb-4`}>Produtos da Consignação</h3>
                  
                  {/* Leitor de Código de Barras */}
                  <div className={`p-4 border-2 border-dashed ${tema.border} rounded-lg`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <span className={`font-medium ${tema.text}`}>Adicionar Produto</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={codigoBarrasRef}
                        type="text"
                        value={codigoBarras}
                        onChange={(e) => setCodigoBarras(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && lerCodigoBarras()}
                        placeholder="Digite ou escaneie o código de barras"
                        className={`flex-1 px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      />
                      <button
                        type="button"
                        onClick={lerCodigoBarras}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Adicionar
                      </button>
                    </div>
                    <p className={`text-xs ${tema.textSecondary} mt-1`}>
                      Pressione Enter após digitar o código ou use um leitor de código de barras
                    </p>
                  </div>

                  {erros.produtos && (
                    <p className="text-red-500 text-xs">{erros.produtos}</p>
                  )}

                  {/* Lista de Produtos Adicionados */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {produtosConsignacao.map((pc) => (
                      <div key={pc.id} className={`p-3 border ${tema.border} rounded-lg`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${tema.text}`}>{pc.produto.nome}</h4>
                            <p className={`text-sm ${tema.textSecondary}`}>
                              Código: {pc.produto.codigo_barras} | Valor: {formatarMoeda ? formatarMoeda(pc.valorUnitario) : `R$ ${pc.valorUnitario.toFixed(2)}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => alterarQuantidadeProduto(pc.id, pc.quantidade - 1)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Minus size={16} />
                            </button>
                            <span className={`px-2 py-1 bg-gray-100 rounded text-sm font-medium ${tema.text}`}>
                              {pc.quantidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => alterarQuantidadeProduto(pc.id, pc.quantidade + 1)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removerProduto(pc.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded ml-2"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <div className={`text-right text-sm font-medium ${tema.text} mt-1`}>
                          Total: {formatarMoeda ? formatarMoeda(pc.valorTotal) : `R$ ${pc.valorTotal.toFixed(2)}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total da Consignação */}
                  {produtosConsignacao.length > 0 && (
                    <div className={`p-4 ${tema.surface} border ${tema.border} rounded-lg`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${tema.text}`}>Total da Consignação:</span>
                        <span className={`text-xl font-bold text-green-600`}>
                          {formatarMoeda ? formatarMoeda(calcularTotalConsignacao()) : `R$ ${calcularTotalConsignacao().toFixed(2)}`}
                        </span>
                      </div>
                      <div className={`text-sm ${tema.textSecondary} mt-1`}>
                        {produtosConsignacao.reduce((total, pc) => total + pc.quantidade, 0)} itens
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false);
                    resetarFormulario();
                  }}
                  className={`px-4 py-2 border ${tema.border} rounded-md ${tema.text} hover:bg-gray-50`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={salvarConsignacao}
                  disabled={carregando}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {carregando ? 'Salvando...' : 'Criar Consignação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FINALIZAR CONSIGNAÇÃO */}
      {modalFinalizarAberto && consignacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${tema.text}`}>Finalizar Consignação</h2>
                <button
                  onClick={() => {
                    setModalFinalizarAberto(false);
                    resetarFormRetorno();
                  }}
                  className={`p-2 rounded-lg ${tema.hover} ${tema.text}`}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna 1: Informações da Consignação */}
                <div className="space-y-4">
                  <h3 className={`font-semibold ${tema.text} mb-4`}>Dados da Consignação</h3>
                  
                  <div className={`p-4 ${tema.surface} border ${tema.border} rounded-lg space-y-2`}>
                    <div className="flex justify-between">
                      <span className={tema.textSecondary}>Cliente:</span>
                      <span className={tema.text}>{consignacaoSelecionada.cliente_nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={tema.textSecondary}>Documento:</span>
                      <span className={tema.text}>{consignacaoSelecionada.cliente_documento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={tema.textSecondary}>Data:</span>
                      <span className={tema.text}>
                        {formatarData ? formatarData(consignacaoSelecionada.data_consignacao) : consignacaoSelecionada.data_consignacao}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={tema.textSecondary}>Valor Total:</span>
                      <span className={`font-medium ${tema.text}`}>
                        {formatarMoeda ? formatarMoeda(consignacaoSelecionada.valor_total) : `R$ ${consignacaoSelecionada.valor_total?.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Leitor de Código de Retorno */}
                  <div className={`p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50`}>
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Produtos Retornados</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={codigoRetornoRef}
                        type="text"
                        value={codigoRetorno}
                        onChange={(e) => setCodigoRetorno(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && lerCodigoRetorno()}
                        placeholder="Escaneie produtos que estão retornando"
                        className="flex-1 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={lerCodigoRetorno}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Retornar
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Escaneie apenas os produtos que o cliente está devolvendo
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Observações do Retorno
                    </label>
                    <textarea
                      value={observacoesRetorno}
                      onChange={(e) => setObservacoesRetorno(e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder="Observações sobre o retorno..."
                    />
                  </div>
                </div>

                {/* Coluna 2: Produtos do Retorno */}
                <div className="space-y-4">
                  <h3 className={`font-semibold ${tema.text} mb-4`}>Controle de Retorno</h3>
                  
                  {/* Lista de Produtos Retornados */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {produtosRetorno.map((pr) => (
                      <div key={pr.produtoId} className={`p-3 border ${tema.border} rounded-lg`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h4 className={`font-medium ${tema.text}`}>{pr.produto.nome}</h4>
                            <p className={`text-sm ${tema.textSecondary}`}>
                              Código: {pr.produto.codigo_barras}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removerProdutoRetorno(pr.produtoId)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center">
                            <span className={`text-xs ${tema.textSecondary}`}>Deixado</span>
                            <div className={`font-medium ${tema.text}`}>{pr.quantidadeDeixada}</div>
                          </div>
                          <div className="text-center">
                            <span className={`text-xs ${tema.textSecondary}`}>Retornado</span>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => alterarQuantidadeRetorno(pr.produtoId, pr.quantidadeRetornada - 1)}
                                className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                              >
                                <Minus size={12} />
                              </button>
                              <span className={`font-medium ${tema.text} min-w-[2rem] text-center`}>
                                {pr.quantidadeRetornada}
                              </span>
                              <button
                                type="button"
                                onClick={() => alterarQuantidadeRetorno(pr.produtoId, pr.quantidadeRetornada + 1)}
                                className="p-0.5 text-green-600 hover:bg-green-100 rounded"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="text-center">
                            <span className={`text-xs ${tema.textSecondary}`}>Vendido</span>
                            <div className={`font-medium text-green-600`}>{pr.quantidadeVendida}</div>
                          </div>
                        </div>
                        
                        <div className={`text-right text-sm ${tema.textSecondary} mt-2`}>
                          Valor Vendido: {formatarMoeda ? formatarMoeda(pr.quantidadeVendida * pr.valorUnitario) : `R$ ${(pr.quantidadeVendida * pr.valorUnitario).toFixed(2)}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  {produtosRetorno.length === 0 && (
                    <div className={`text-center py-8 ${tema.textSecondary}`}>
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum produto retornado ainda</p>
                      <p className="text-xs mt-1">Use o leitor acima para adicionar produtos</p>
                    </div>
                  )}

                  {/* Resumo de Totais */}
                  {produtosRetorno.length > 0 && (
                    <div className={`p-4 ${tema.surface} border ${tema.border} rounded-lg space-y-2`}>
                      <h4 className={`font-medium ${tema.text} mb-2`}>Resumo da Finalização</h4>
                      
                      <div className="flex justify-between">
                        <span className={tema.textSecondary}>Total Retornado:</span>
                        <span className={`font-medium text-red-600`}>
                          {formatarMoeda ? formatarMoeda(calcularTotaisRetorno().totalRetornado) : `R$ ${calcularTotaisRetorno().totalRetornado.toFixed(2)}`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className={tema.textSecondary}>Total Vendido:</span>
                        <span className={`font-medium text-green-600`}>
                          {formatarMoeda ? formatarMoeda(calcularTotaisRetorno().totalVendido) : `R$ ${calcularTotaisRetorno().totalVendido.toFixed(2)}`}
                        </span>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className={`font-medium ${tema.text}`}>Valor Devido:</span>
                          <span className={`text-xl font-bold text-blue-600`}>
                            {formatarMoeda ? formatarMoeda(calcularTotaisRetorno().totalVendido) : `R$ ${calcularTotaisRetorno().totalVendido.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setModalFinalizarAberto(false);
                    resetarFormRetorno();
                  }}
                  className={`px-4 py-2 border ${tema.border} rounded-md ${tema.text} hover:bg-gray-50`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={salvarFinalizacao}
                  disabled={carregando || produtosRetorno.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {carregando ? 'Finalizando...' : 'Finalizar Consignação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};