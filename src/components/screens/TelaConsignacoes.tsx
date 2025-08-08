// src/components/screens/TelaConsignacoes.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, FileText, Calendar, User, Phone, DollarSign, Package, Eye, CheckCircle, X, AlertCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

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

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [ordenacao, setOrdenacao] = useState<'data' | 'valor' | 'cliente'>('data');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [consignacaoSelecionada, setConsignacaoSelecionada] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  // Estados do formulário de nova consignação
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf' as 'cpf' | 'cnpj',
    vendedorId: '',
    produtosSelecionados: [] as any[],
    observacoes: ''
  });

  // Estados do formulário de finalização
  const [formRetorno, setFormRetorno] = useState({
    quantidadeRetornada: 0,
    quantidadeVendida: 0,
    valorDevido: 0,
    observacoes: ''
  });

  const [erros, setErros] = useState<Record<string, string>>({});

  // Inicializar vendedor se usuário for vendedor
  useEffect(() => {
    if (tipoUsuario === 'vendedor' && usuarioLogado) {
      setFormData(prev => ({
        ...prev,
        vendedorId: usuarioLogado.id?.toString() || ''
      }));
    }
  }, [tipoUsuario, usuarioLogado]);

  // Consignações filtradas e ordenadas
  const consignacoesFiltradas = useMemo(() => {
    if (!consignacoes || !Array.isArray(consignacoes)) {
      return [];
    }

    let filtradas = consignacoes.filter((consignacao: any) => {
      const buscaMatch = 
        (consignacao.cliente_nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (consignacao.cliente_documento || '').toLowerCase().includes(busca.toLowerCase());

      const statusMatch = filtroStatus === 'todas' || consignacao.status === filtroStatus;

      // Se for vendedor, mostrar apenas suas consignações
      const vendedorMatch = tipoUsuario !== 'vendedor' || 
        consignacao.vendedor_id === usuarioLogado?.id;

      return buscaMatch && statusMatch && vendedorMatch;
    });

    return [...filtradas].sort((a: any, b: any) => {
      switch (ordenacao) {
        case 'valor':
          return (b.valor_total || 0) - (a.valor_total || 0);
        case 'cliente':
          return (a.cliente_nome || '').localeCompare(b.cliente_nome || '');
        default:
          return new Date(b.data_consignacao || 0).getTime() - new Date(a.data_consignacao || 0).getTime();
      }
    });
  }, [consignacoes, busca, filtroStatus, ordenacao, tipoUsuario, usuarioLogado]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = consignacoesFiltradas.length;
    const ativas = consignacoesFiltradas.filter((c: any) => c.status === 'ativa').length;
    const finalizadas = consignacoesFiltradas.filter((c: any) => c.status === 'finalizada').length;
    const valorTotal = consignacoesFiltradas.reduce((sum: number, c: any) => 
      sum + (c.valor_total || 0), 0
    );

    return { total, ativas, finalizadas, valorTotal };
  }, [consignacoesFiltradas]);

  // Validar formulário
  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.clienteNome.trim()) {
      novosErros.clienteNome = 'Nome do cliente é obrigatório';
    }

    if (!formData.clienteDocumento.trim()) {
      novosErros.clienteDocumento = 'Documento é obrigatório';
    } else {
      const documentoLimpo = formData.clienteDocumento.replace(/\D/g, '');
      if (formData.tipoDocumento === 'cpf' && !validarCPF(documentoLimpo)) {
        novosErros.clienteDocumento = 'CPF inválido';
      } else if (formData.tipoDocumento === 'cnpj' && !validarCNPJ(documentoLimpo)) {
        novosErros.clienteDocumento = 'CNPJ inválido';
      }
    }

    if (!formData.clienteTelefone.trim()) {
      novosErros.clienteTelefone = 'Telefone é obrigatório';
    }

    if (!formData.vendedorId) {
      novosErros.vendedorId = 'Selecione um vendedor';
    }

    if (formData.produtosSelecionados.length === 0) {
      novosErros.produtos = 'Adicione pelo menos um produto';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Adicionar produto à consignação
  const adicionarProduto = () => {
    const novoProduto = {
      id: Date.now(),
      produtoId: '',
      quantidade: 1,
      valorUnitario: 0
    };

    setFormData(prev => ({
      ...prev,
      produtosSelecionados: [...prev.produtosSelecionados, novoProduto]
    }));
  };

  // Remover produto da consignação
  const removerProduto = (id: number) => {
    setFormData(prev => ({
      ...prev,
      produtosSelecionados: prev.produtosSelecionados.filter(p => p.id !== id)
    }));
  };

  // Atualizar produto na lista
  const atualizarProduto = (id: number, campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      produtosSelecionados: prev.produtosSelecionados.map(p => 
        p.id === id ? { ...p, [campo]: valor } : p
      )
    }));
  };

  // Calcular totais
  const calcularTotais = () => {
    const quantidade = formData.produtosSelecionados.reduce((sum, p) => 
      sum + (parseInt(p.quantidade) || 0), 0
    );
    const valor = formData.produtosSelecionados.reduce((sum, p) => 
      sum + ((parseInt(p.quantidade) || 0) * (parseFloat(p.valorUnitario) || 0)), 0
    );

    return { quantidade, valor };
  };

  // Salvar consignação
  const handleSalvar = async () => {
    console.log('=== SALVANDO CONSIGNAÇÃO ===');
    console.log('Dados do formulário:', formData);
    
    if (!validarFormulario()) {
      mostrarMensagem('error', 'Preencha todos os campos obrigatórios');
      return;
    }

    setCarregando(true);
    const totais = calcularTotais();

    try {
      // Preparar dados para envio
      const dadosConsignacao = {
        clienteNome: formData.clienteNome,
        clienteDocumento: formData.clienteDocumento.replace(/\D/g, ''),
        clienteTelefone: formData.clienteTelefone,
        tipoDocumento: formData.tipoDocumento,
        vendedorId: parseInt(formData.vendedorId),
        quantidadeTotal: totais.quantidade,
        valorTotal: totais.valor,
        observacoes: formData.observacoes,
        produtos: formData.produtosSelecionados // Opcional: se quiser salvar os produtos também
      };

      console.log('Enviando para o Supabase:', dadosConsignacao);

      const resultado = await adicionarConsignacao(dadosConsignacao);

      console.log('Resultado:', resultado);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação criada com sucesso!');
        setModalAberto(false);
        resetarFormulario();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao criar consignação');
      }
    } catch (error) {
      console.error('Erro ao salvar consignação:', error);
      mostrarMensagem('error', 'Erro ao salvar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // Finalizar consignação
  const handleFinalizar = async () => {
    if (!consignacaoSelecionada) return;

    setCarregando(true);

    try {
      const dadosRetorno = {
        quantidadeRetornada: formRetorno.quantidadeRetornada,
        quantidadeVendida: formRetorno.quantidadeVendida,
        valorRetornado: formRetorno.quantidadeRetornada * (consignacaoSelecionada.valor_total / consignacaoSelecionada.quantidade_total),
        valorDevido: formRetorno.valorDevido,
        observacoes: formRetorno.observacoes
      };

      const resultado = await finalizarConsignacao(consignacaoSelecionada.id, dadosRetorno);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação finalizada com sucesso!');
        setModalFinalizarAberto(false);
        setConsignacaoSelecionada(null);
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

  // Excluir consignação
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

  // Resetar formulários
  const resetarFormulario = () => {
    setFormData({
      clienteNome: '',
      clienteDocumento: '',
      clienteTelefone: '',
      tipoDocumento: 'cpf',
      vendedorId: tipoUsuario === 'vendedor' && usuarioLogado ? usuarioLogado.id?.toString() || '' : '',
      produtosSelecionados: [],
      observacoes: ''
    });
    setErros({});
  };

  const resetarFormRetorno = () => {
    setFormRetorno({
      quantidadeRetornada: 0,
      quantidadeVendida: 0,
      valorDevido: 0,
      observacoes: ''
    });
  };

  // Obter nome do vendedor
  const getNomeVendedor = (vendedorId: number) => {
    if (!vendedores || !Array.isArray(vendedores)) return 'N/A';
    const vendedor = vendedores.find((v: any) => v.id === vendedorId);
    return vendedor?.nome || 'N/A';
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
            <DollarSign className={`w-8 h-8 ${tema.textSecondary}`} />
          </div>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className={`${tema.surface} p-4 rounded-lg border ${tema.border} mb-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.textSecondary}`} />
              <input
                type="text"
                placeholder="Buscar por cliente ou documento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
              />
            </div>
          </div>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
          >
            <option value="todas">Todas</option>
            <option value="ativa">Ativas</option>
            <option value="finalizada">Finalizadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          {/* Ordenação */}
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as any)}
            className={`px-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
          >
            <option value="data">Ordenar por Data</option>
            <option value="valor">Ordenar por Valor</option>
            <option value="cliente">Ordenar por Cliente</option>
          </select>

          {/* Botão Nova Consignação */}
          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Consignação
          </button>
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
                  Documento
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
                <th className={`px-6 py-3 text-center text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`${tema.surface} divide-y ${tema.border}`}>
              {consignacoesFiltradas.map((consignacao: any) => (
                <tr key={consignacao.id} className={`hover:${tema.hover}`}>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    <div>
                      <div className="font-medium">{consignacao.cliente_nome}</div>
                      <div className={`text-sm ${tema.textSecondary}`}>
                        {consignacao.cliente_telefone}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    <div className={`text-sm ${tema.text}`}>
                      {formatarDocumento ? 
                        formatarDocumento(consignacao.cliente_documento, consignacao.tipo_documento) : 
                        consignacao.cliente_documento
                      }
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    {getNomeVendedor(consignacao.vendedor_id)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    {formatarData ? formatarData(consignacao.data_consignacao) : consignacao.data_consignacao}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text} font-medium`}>
                    {formatarMoeda ? formatarMoeda(consignacao.valor_total) : `R$ ${consignacao.valor_total?.toFixed(2) || '0.00'}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${consignacao.status === 'ativa' ? 'bg-blue-100 text-blue-800' : ''}
                      ${consignacao.status === 'finalizada' ? 'bg-green-100 text-green-800' : ''}
                      ${consignacao.status === 'cancelada' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {consignacao.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setConsignacaoSelecionada(consignacao);
                          // Abrir modal de detalhes
                        }}
                        className={`p-1 rounded ${tema.hover} ${tema.textSecondary} hover:${tema.text}`}
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {consignacao.status === 'ativa' && (
                        <button
                          onClick={() => {
                            setConsignacaoSelecionada(consignacao);
                            setModalFinalizarAberto(true);
                          }}
                          className="p-1 rounded hover:bg-green-100 text-green-600"
                          title="Finalizar"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      
                      {tipoUsuario === 'admin' && (
                        <button
                          onClick={() => handleExcluir(consignacao.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-600"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
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

      {/* Modal Nova Consignação - Simplificado */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${tema.surface} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${tema.text}`}>Nova Consignação</h2>
              <button
                onClick={() => {
                  setModalAberto(false);
                  resetarFormulario();
                }}
                className={`p-1 rounded ${tema.hover} ${tema.text}`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dados do Cliente */}
              <div>
                <h3 className={`font-medium ${tema.text} mb-2`}>Dados do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.clienteNome}
                      onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    />
                    {erros.clienteNome && (
                      <p className="text-red-500 text-xs mt-1">{erros.clienteNome}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Tipo de Documento *
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
                </div>
              </div>

              {/* Vendedor Responsável - VERSÃO CORRIGIDA */}
<div>
  <label className={`block text-sm font-medium ${tema.text} mb-1`}>
    Vendedor Responsável *
  </label>
  
  {/* Debug - mostrar informações dos vendedores */}
  {process.env.NODE_ENV === 'development' && (
    <div className="text-xs text-gray-500 mb-2">
      Debug: {vendedores ? `${vendedores.length} vendedores carregados` : 'Vendedores não carregados'}
      {vendedores && vendedores.length > 0 && (
        <div>Status encontrados: {[...new Set(vendedores.map(v => v.status))].join(', ')}</div>
      )}
    </div>
  )}
  
  <select
    value={formData.vendedorId}
    onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value })}
    disabled={tipoUsuario === 'vendedor'}
    className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
  >
    <option value="">Selecione um vendedor</option>
    
    {/* FILTRO CORRIGIDO - aceita tanto 'Ativo' quanto 'ativo' */}
    {vendedores && Array.isArray(vendedores) && 
     vendedores
       .filter((v: any) => {
         // Aceita qualquer variação de capitalização de "ativo"
         const status = String(v.status || '').toLowerCase();
         return status === 'ativo' || status === 'active';
       })
       .map((vendedor: any) => (
         <option key={vendedor.id} value={vendedor.id}>
           {vendedor.nome} {process.env.NODE_ENV === 'development' && `(${vendedor.status})`}
         </option>
       ))
    }
    
    {/* Fallback se não houver vendedores */}
    {(!vendedores || !Array.isArray(vendedores) || vendedores.length === 0) && (
      <option value="" disabled>Nenhum vendedor encontrado</option>
    )}
  </select>
  
  {erros.vendedorId && (
    <p className="text-red-500 text-xs mt-1">{erros.vendedorId}</p>
  )}
</div>


              {/* Produtos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-medium ${tema.text}`}>Produtos *</h3>
                  <button
                    type="button"
                    onClick={adicionarProduto}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Adicionar Produto
                  </button>
                </div>

                {erros.produtos && (
                  <p className="text-red-500 text-xs mb-2">{erros.produtos}</p>
                )}

                <div className="space-y-2">
                  {formData.produtosSelecionados.map((item, index) => (
                    <div key={item.id} className={`p-3 border ${tema.border} rounded-md`}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-2">
                          <select
                            value={item.produtoId}
                            onChange={(e) => {
                              const produtoSelecionado = produtos?.find((p: any) => p.id.toString() === e.target.value);
                              if (produtoSelecionado) {
                                atualizarProduto(item.id, 'produtoId', e.target.value);
                                atualizarProduto(item.id, 'valorUnitario', produtoSelecionado.valor_venda);
                              }
                            }}
                            className={`w-full px-2 py-1 border ${tema.border} rounded ${tema.surface} ${tema.text} text-sm`}
                          >
                            <option value="">Selecione um produto</option>
                            {produtos && Array.isArray(produtos) && produtos.filter((p: any) => p.ativo && p.estoque > 0).map((produto: any) => (
                              <option key={produto.id} value={produto.id}>
                                {produto.nome} - {formatarMoeda ? formatarMoeda(produto.valor_venda) : `R$ ${produto.valor_venda?.toFixed(2)}`} (Estoque: {produto.estoque})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => atualizarProduto(item.id, 'quantidade', e.target.value)}
                            placeholder="Qtd"
                            className={`w-full px-2 py-1 border ${tema.border} rounded ${tema.surface} ${tema.text} text-sm`}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${tema.text}`}>
                            {formatarMoeda ? formatarMoeda(item.quantidade * item.valorUnitario) : `R$ ${(item.quantidade * item.valorUnitario).toFixed(2)}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removerProduto(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.produtosSelecionados.length > 0 && (
                  <div className={`mt-3 p-3 ${tema.surface} border ${tema.border} rounded-md`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${tema.text}`}>Total:</span>
                      <div className="text-right">
                        <div className={`text-sm ${tema.textSecondary}`}>
                          {calcularTotais().quantidade} itens
                        </div>
                        <div className={`text-lg font-bold ${tema.text}`}>
                          {formatarMoeda ? formatarMoeda(calcularTotais().valor) : `R$ ${calcularTotais().valor.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
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

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    resetarFormulario();
                  }}
                  className={`px-4 py-2 border ${tema.border} rounded-md ${tema.text} hover:${tema.hover}`}
                  disabled={carregando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={carregando}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Finalizar Consignação */}
      {modalFinalizarAberto && consignacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${tema.surface} rounded-lg p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${tema.text}`}>Finalizar Consignação</h2>
              <button
                onClick={() => {
                  setModalFinalizarAberto(false);
                  setConsignacaoSelecionada(null);
                  resetarFormRetorno();
                }}
                className={`p-1 rounded ${tema.hover} ${tema.text}`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Resumo da Consignação */}
              <div className={`p-3 ${tema.surface} border ${tema.border} rounded-md`}>
                <h3 className={`font-medium ${tema.text} mb-2`}>Dados da Consignação</h3>
                <div className={`text-sm ${tema.textSecondary} space-y-1`}>
                  <p><strong>Cliente:</strong> {consignacaoSelecionada.cliente_nome}</p>
                  <p><strong>Total:</strong> {consignacaoSelecionada.quantidade_total} itens - {formatarMoeda ? formatarMoeda(consignacaoSelecionada.valor_total) : `R$ ${consignacaoSelecionada.valor_total?.toFixed(2)}`}</p>
                </div>
              </div>

              {/* Dados do Retorno */}
              <div>
                <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                  Quantidade Retornada
                </label>
                <input
                  type="number"
                  min="0"
                  max={consignacaoSelecionada.quantidade_total}
                  value={formRetorno.quantidadeRetornada}
                  onChange={(e) => {
                    const retornada = parseInt(e.target.value) || 0;
                    const vendida = consignacaoSelecionada.quantidade_total - retornada;
                    const valorUnitario = consignacaoSelecionada.valor_total / consignacaoSelecionada.quantidade_total;
                    setFormRetorno({
                      ...formRetorno,
                      quantidadeRetornada: retornada,
                      quantidadeVendida: vendida,
                      valorDevido: vendida * valorUnitario
                    });
                  }}
                  className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                    Quantidade Vendida
                  </label>
                  <input
                    type="number"
                    value={formRetorno.quantidadeVendida}
                    disabled
                    className={`w-full px-3 py-2 border ${tema.border} rounded-md ${tema.surface} ${tema.textSecondary}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                    Valor Devido
                  </label>
                  <input
                    type="text"
                    value={formatarMoeda ? formatarMoeda(formRetorno.valorDevido) : `R$ ${formRetorno.valorDevido.toFixed(2)}`}
                    disabled
                    className={`w-full px-3 py-2 border ${tema.border} rounded-md ${tema.surface} ${tema.textSecondary}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                  Observações do Retorno
                </label>
                <textarea
                  value={formRetorno.observacoes}
                  onChange={(e) => setFormRetorno({ ...formRetorno, observacoes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                  placeholder="Observações sobre o retorno..."
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setModalFinalizarAberto(false);
                    setConsignacaoSelecionada(null);
                    resetarFormRetorno();
                  }}
                  className={`px-4 py-2 border ${tema.border} rounded-md ${tema.text} hover:${tema.hover}`}
                  disabled={carregando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinalizar}
                  disabled={carregando}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando ? 'Finalizando...' : 'Finalizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};