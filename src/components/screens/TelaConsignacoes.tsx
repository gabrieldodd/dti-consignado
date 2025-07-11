// src/components/screens/TelaConsignacoes.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Package, Clock, CheckCircle, X, Calculator } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Consignacao } from '../../types/Consignacao';
import { Produto } from '../../types/Produto';

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
    formatarDocumento
  } = useAppContext();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState<'data' | 'valor' | 'cliente'>('data');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalRetorno, setModalRetorno] = useState(false);
  const [consignacaoSelecionada, setConsignacaoSelecionada] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf' as 'cpf' | 'cnpj',
    vendedorId: '',
    observacoes: ''
  });

  const [produtosConsignacao, setProdutosConsignacao] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  // Estados do retorno
  const [dadosRetorno, setDadosRetorno] = useState({
    quantidadeRetornada: 0,
    valorRetornado: 0,
    quantidadeVendida: 0,
    valorDevido: 0,
    observacoes: ''
  });

  // Consignações filtradas e ordenadas
  const consignacoesOrdenadas = useMemo(() => {
    let filtradas = consignacoes.filter((consignacao: any) => {
      const buscaMatch = 
        (consignacao.cliente_nome || consignacao.clienteNome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (consignacao.cliente_documento || consignacao.clienteDocumento || '').includes(busca) ||
        (consignacao.vendedor?.nome || '').toLowerCase().includes(busca.toLowerCase());

      const statusMatch = filtroStatus === 'todos' || consignacao.status === filtroStatus;

      return buscaMatch && statusMatch;
    });

    return [...filtradas].sort((a: any, b: any) => {
      switch (ordenacao) {
        case 'valor':
          const valorA = a.valor_total || a.valorTotal || 0;
          const valorB = b.valor_total || b.valorTotal || 0;
          return valorB - valorA;
        case 'cliente':
          const clienteA = a.cliente_nome || a.clienteNome || '';
          const clienteB = b.cliente_nome || b.clienteNome || '';
          return clienteA.localeCompare(clienteB);
        default:
          const dataA = a.data_consignacao || a.dataConsignacao || a.created_at || '';
          const dataB = b.data_consignacao || b.dataConsignacao || b.created_at || '';
          return new Date(dataB).getTime() - new Date(dataA).getTime();
      }
    });
  }, [consignacoes, busca, filtroStatus, ordenacao]);

  // Validações
  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.clienteNome.trim()) {
      novosErros.clienteNome = 'Nome do cliente é obrigatório';
    }

    if (!formData.clienteDocumento.trim()) {
      novosErros.clienteDocumento = 'Documento do cliente é obrigatório';
    }

    if (!formData.clienteTelefone.trim()) {
      novosErros.clienteTelefone = 'Telefone do cliente é obrigatório';
    }

    if (!formData.vendedorId) {
      novosErros.vendedorId = 'Vendedor é obrigatório';
    }

    if (produtosConsignacao.length === 0) {
      novosErros.produtos = 'Adicione pelo menos um produto';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Funções do modal
  const abrirModalNovo = () => {
    setFormData({
      clienteNome: '',
      clienteDocumento: '',
      clienteTelefone: '',
      tipoDocumento: 'cpf',
      vendedorId: '',
      observacoes: ''
    });
    setProdutosConsignacao([]);
    setProdutoSelecionado('');
    setQuantidadeProduto('');
    setErros({});
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalDetalhes(false);
    setModalRetorno(false);
    setConsignacaoSelecionada(null);
  };

  // Adicionar produto à consignação
  const adicionarProduto = () => {
    if (!produtoSelecionado || !quantidadeProduto) {
      mostrarMensagem('error', 'Selecione um produto e informe a quantidade');
      return;
    }

    const produto = produtos.find((p: any) => p.id === parseInt(produtoSelecionado));
    if (!produto) return;

    const quantidade = parseInt(quantidadeProduto);
    if (quantidade <= 0) {
      mostrarMensagem('error', 'Quantidade deve ser maior que zero');
      return;
    }

    const produtoExistente = produtosConsignacao.find(p => p.produtoId === produto.id);
    if (produtoExistente) {
      mostrarMensagem('error', 'Produto já adicionado à consignação');
      return;
    }

    const valorVenda = produto.valor_venda || produto.valorVenda || 0;
    const novoProduto = {
      produtoId: produto.id,
      produto: produto,
      quantidade: quantidade,
      valorUnitario: valorVenda,
      valorTotal: quantidade * valorVenda
    };

    setProdutosConsignacao([...produtosConsignacao, novoProduto]);
    setProdutoSelecionado('');
    setQuantidadeProduto('');
  };

  // Remover produto da consignação
  const removerProduto = (produtoId: number) => {
    setProdutosConsignacao(produtosConsignacao.filter(p => p.produtoId !== produtoId));
  };

  // Calcular totais
  const calcularTotais = () => {
    const quantidadeTotal = produtosConsignacao.reduce((total, p) => total + p.quantidade, 0);
    const valorTotal = produtosConsignacao.reduce((total, p) => total + p.valorTotal, 0);
    return { quantidadeTotal, valorTotal };
  };

  // Salvar consignação
  const salvarConsignacao = async () => {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      const { quantidadeTotal, valorTotal } = calcularTotais();
      
      const dadosConsignacao = {
        cliente_nome: formData.clienteNome.trim(),
        cliente_documento: formData.clienteDocumento.trim(),
        cliente_telefone: formData.clienteTelefone.trim(),
        tipo_documento: formData.tipoDocumento,
        vendedor_id: parseInt(formData.vendedorId),
        quantidade_total: quantidadeTotal,
        valor_total: valorTotal,
        data_consignacao: new Date().toISOString(),
        status: 'ativa' as const,
        observacoes: formData.observacoes.trim(),
        produtos: produtosConsignacao
      };

      const resultado = await adicionarConsignacao(dadosConsignacao);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação criada com sucesso!');
        fecharModal();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao criar consignação');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao criar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // Abrir modal de detalhes
  const abrirDetalhes = (consignacao: any) => {
    setConsignacaoSelecionada(consignacao);
    setModalDetalhes(true);
  };

  // Abrir modal de retorno
  const abrirRetorno = (consignacao: any) => {
    setConsignacaoSelecionada(consignacao);
    const quantidadeTotal = consignacao.quantidade_total || consignacao.quantidadeTotal || 0;
    const valorTotal = consignacao.valor_total || consignacao.valorTotal || 0;
    
    setDadosRetorno({
      quantidadeRetornada: quantidadeTotal,
      valorRetornado: valorTotal,
      quantidadeVendida: 0,
      valorDevido: 0,
      observacoes: ''
    });
    setModalRetorno(true);
  };

  // Calcular valores do retorno
  const calcularRetorno = () => {
    const quantidadeTotal = consignacaoSelecionada?.quantidade_total || consignacaoSelecionada?.quantidadeTotal || 0;
    const valorTotal = consignacaoSelecionada?.valor_total || consignacaoSelecionada?.valorTotal || 0;
    
    const quantidadeVendida = quantidadeTotal - dadosRetorno.quantidadeRetornada;
    const valorUnitario = quantidadeTotal > 0 ? valorTotal / quantidadeTotal : 0;
    const valorDevido = quantidadeVendida * valorUnitario;
    
    setDadosRetorno(prev => ({
      ...prev,
      quantidadeVendida,
      valorDevido
    }));
  };

  // Finalizar consignação
  const handleFinalizarConsignacao = async () => {
    if (!consignacaoSelecionada) return;

    setCarregando(true);
    try {
      const resultado = await finalizarConsignacao(consignacaoSelecionada.id, dadosRetorno);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação finalizada com sucesso!');
        fecharModal();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao finalizar consignação');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao finalizar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir consignação
  const handleExcluir = async (consignacao: any) => {
    const nomeCliente = consignacao.cliente_nome || consignacao.clienteNome || 'Cliente';
    if (!window.confirm(`Tem certeza que deseja excluir a consignação de "${nomeCliente}"?`)) {
      return;
    }

    try {
      const resultado = await excluirConsignacao(consignacao.id);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação excluída com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir consignação');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao excluir consignação');
    }
  };

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
        return <X size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  return (
    <div className={`min-h-screen ${tema.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${tema.text} mb-2`}>
              Consignações
            </h1>
            <p className={tema.textSecondary}>
              Gerencie todas as consignações
            </p>
          </div>
          
          <button
            onClick={abrirModalNovo}
            className={`
              ${tema.primary} text-white px-6 py-3 rounded-lg 
              hover:opacity-90 transition-opacity
              flex items-center space-x-2 mt-4 md:mt-0
            `}
          >
            <Plus size={20} />
            <span>Nova Consignação</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.surface} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tema.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Buscar por cliente, documento ou vendedor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 border ${tema.border} rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${tema.text}
                `}
              />
            </div>

            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativa">Ativas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>

            {/* Ordenação */}
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as 'data' | 'valor' | 'cliente')}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="data">Ordenar por Data</option>
              <option value="valor">Ordenar por Valor</option>
              <option value="cliente">Ordenar por Cliente</option>
            </select>
          </div>
        </div>

        {/* Lista de consignações */}
        <div className="space-y-4">
          {consignacoesOrdenadas.map((consignacao: any) => (
            <div key={consignacao.id} className={`${tema.surface} rounded-lg shadow-sm p-6`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${tema.text} mb-1`}>
                        {consignacao.cliente_nome || consignacao.clienteNome}
                      </h3>
                      <p className={`${tema.textSecondary} text-sm`}>
                        {formatarDocumento(
                          consignacao.cliente_documento || consignacao.clienteDocumento || '',
                          consignacao.tipo_documento || consignacao.tipoDocumento || 'cpf'
                        )}
                      </p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${obterStatusColor(consignacao.status)}`}>
                      {obterStatusIcone(consignacao.status)}
                      <span className="capitalize">{consignacao.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className={tema.textSecondary}>Vendedor</p>
                      <p className={`font-medium ${tema.text}`}>
                        {consignacao.vendedor?.nome || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Quantidade</p>
                      <p className={`font-medium ${tema.text}`}>
                        {consignacao.quantidade_total || consignacao.quantidadeTotal || 0} itens
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Valor Total</p>
                      <p className={`font-medium ${tema.text}`}>
                        {formatarMoeda(consignacao.valor_total || consignacao.valorTotal || 0)}
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Data</p>
                      <p className={`font-medium ${tema.text}`}>
                        {formatarData(
                          consignacao.data_consignacao || 
                          consignacao.dataConsignacao || 
                          consignacao.created_at || 
                          new Date().toISOString()
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                  <button
                    onClick={() => abrirDetalhes(consignacao)}
                    className={`p-2 ${tema.textSecondary} hover:${tema.text} transition-colors`}
                    title="Ver detalhes"
                  >
                    <Eye size={18} />
                  </button>
                  
                  {consignacao.status === 'ativa' && (
                    <button
                      onClick={() => abrirRetorno(consignacao)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Finalizar consignação"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleExcluir(consignacao)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {consignacoesOrdenadas.length === 0 && (
          <div className={`${tema.surface} rounded-lg shadow-sm p-12 text-center`}>
            <Package size={48} className={`${tema.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${tema.text} mb-2`}>
              Nenhuma consignação encontrada
            </h3>
            <p className={tema.textSecondary}>
              {busca || filtroStatus !== 'todos' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Crie sua primeira consignação para começar'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Nova Consignação */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
                Nova Consignação
              </h2>

              <div className="space-y-6">
                {/* Dados do Cliente */}
                <div>
                  <h3 className={`text-lg font-semibold ${tema.text} mb-4`}>
                    Dados do Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                        Nome do Cliente *
                      </label>
                      <input
                        type="text"
                        value={formData.clienteNome}
                        onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                        className={`
                          w-full px-3 py-2 border rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${erros.clienteNome ? 'border-red-500' : tema.border}
                        `}
                        placeholder="Digite o nome do cliente"
                      />
                      {erros.clienteNome && (
                        <p className="text-red-500 text-sm mt-1">{erros.clienteNome}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                        Tipo de Documento
                      </label>
                      <select
                        value={formData.tipoDocumento}
                        onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as 'cpf' | 'cnpj' })}
                        className={`w-full px-3 py-2 border ${tema.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                        {formData.tipoDocumento.toUpperCase()} *
                      </label>
                      <input
                        type="text"
                        value={formData.clienteDocumento}
                        onChange={(e) => setFormData({ ...formData, clienteDocumento: e.target.value })}
                        className={`
                          w-full px-3 py-2 border rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${erros.clienteDocumento ? 'border-red-500' : tema.border}
                        `}
                        placeholder={`Digite o ${formData.tipoDocumento.toUpperCase()}`}
                      />
                      {erros.clienteDocumento && (
                        <p className="text-red-500 text-sm mt-1">{erros.clienteDocumento}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                        Telefone *
                      </label>
                      <input
                        type="text"
                        value={formData.clienteTelefone}
                        onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                        className={`
                          w-full px-3 py-2 border rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${erros.clienteTelefone ? 'border-red-500' : tema.border}
                        `}
                        placeholder="Digite o telefone"
                      />
                      {erros.clienteTelefone && (
                        <p className="text-red-500 text-sm mt-1">{erros.clienteTelefone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vendedor */}
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Vendedor *
                  </label>
                  <select
                    value={formData.vendedorId}
                    onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value })}
                    className={`
                      w-full px-3 py-2 border rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${erros.vendedorId ? 'border-red-500' : tema.border}
                    `}
                  >
                    <option value="">Selecione um vendedor</option>
                    {vendedores.map((vendedor: any) => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nome}
                      </option>
                    ))}
                  </select>
                  {erros.vendedorId && (
                    <p className="text-red-500 text-sm mt-1">{erros.vendedorId}</p>
                  )}
                </div>

                {/* Produtos */}
                <div>
                  <h3 className={`text-lg font-semibold ${tema.text} mb-4`}>
                    Produtos da Consignação
                  </h3>
                  
                  <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-4">
                    <div className="flex-1">
                      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                        Produto
                      </label>
                      <select
                        value={produtoSelecionado}
                        onChange={(e) => setProdutoSelecionado(e.target.value)}
                        className={`w-full px-3 py-2 border ${tema.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="">Selecione um produto</option>
                        {produtos.map((produto: any) => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome} - {formatarMoeda(produto.valor_venda || produto.valorVenda || 0)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantidadeProduto}
                        onChange={(e) => setQuantidadeProduto(e.target.value)}
                        className={`w-32 px-3 py-2 border ${tema.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="Qtd"
                      />
                    </div>

                    <button
                      onClick={adicionarProduto}
                      className={`${tema.primary} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity`}
                    >
                      Adicionar
                    </button>
                  </div>

                  {erros.produtos && (
                    <p className="text-red-500 text-sm mb-4">{erros.produtos}</p>
                  )}

                  {/* Lista de produtos adicionados */}
                  {produtosConsignacao.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className={`${tema.background}`}>
                          <tr>
                            <th className={`px-4 py-3 text-left text-sm font-medium ${tema.text}`}>
                              Produto
                            </th>
                            <th className={`px-4 py-3 text-center text-sm font-medium ${tema.text}`}>
                              Qtd
                            </th>
                            <th className={`px-4 py-3 text-right text-sm font-medium ${tema.text}`}>
                              Valor Unit.
                            </th>
                            <th className={`px-4 py-3 text-right text-sm font-medium ${tema.text}`}>
                              Total
                            </th>
                            <th className={`px-4 py-3 text-center text-sm font-medium ${tema.text}`}>
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {produtosConsignacao.map((item, index) => (
                            <tr key={index} className={`border-t ${tema.border}`}>
                              <td className={`px-4 py-3 text-sm ${tema.text}`}>
                                {item.produto.nome}
                              </td>
                              <td className={`px-4 py-3 text-center text-sm ${tema.text}`}>
                                {item.quantidade}
                              </td>
                              <td className={`px-4 py-3 text-right text-sm ${tema.text}`}>
                                {formatarMoeda(item.valorUnitario)}
                              </td>
                              <td className={`px-4 py-3 text-right text-sm ${tema.text}`}>
                                {formatarMoeda(item.valorTotal)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => removerProduto(item.produtoId)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className={`${tema.background} border-t ${tema.border}`}>
                          <tr>
                            <td colSpan={2} className={`px-4 py-3 text-sm font-medium ${tema.text}`}>
                              Total: {calcularTotais().quantidadeTotal} itens
                            </td>
                            <td colSpan={3} className={`px-4 py-3 text-right text-sm font-medium ${tema.text}`}>
                              {formatarMoeda(calcularTotais().valorTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={fecharModal}
                  disabled={carregando}
                  className={`
                    px-4 py-2 border ${tema.border} rounded-lg
                    ${tema.text} hover:${tema.hover} transition-colors
                    disabled:opacity-50
                  `}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarConsignacao}
                  disabled={carregando || produtosConsignacao.length === 0}
                  className={`
                    ${tema.primary} text-white px-4 py-2 rounded-lg
                    hover:opacity-90 transition-opacity
                    disabled:opacity-50
                  `}
                >
                  {carregando ? 'Salvando...' : 'Salvar Consignação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalDetalhes && consignacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
                Detalhes da Consignação
              </h2>

              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className={`text-lg font-semibold ${tema.text} mb-4`}>
                    Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={tema.textSecondary}>Nome</p>
                      <p className={`font-medium ${tema.text}`}>
                        {consignacaoSelecionada.cliente_nome || consignacaoSelecionada.clienteNome}
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Documento</p>
                      <p className={`font-medium ${tema.text}`}>
                        {formatarDocumento(
                          consignacaoSelecionada.cliente_documento || consignacaoSelecionada.clienteDocumento || '',
                          consignacaoSelecionada.tipo_documento || consignacaoSelecionada.tipoDocumento || 'cpf'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Telefone</p>
                      <p className={`font-medium ${tema.text}`}>
                        {consignacaoSelecionada.cliente_telefone || consignacaoSelecionada.clienteTelefone}
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Vendedor</p>
                      <p className={`font-medium ${tema.text}`}>
                        {consignacaoSelecionada.vendedor?.nome || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informações da Consignação */}
                <div>
                  <h3 className={`text-lg font-semibold ${tema.text} mb-4`}>
                    Consignação
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className={tema.textSecondary}>Status</p>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${obterStatusColor(consignacaoSelecionada.status)}`}>
                        {obterStatusIcone(consignacaoSelecionada.status)}
                        <span className="ml-1 capitalize">{consignacaoSelecionada.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Quantidade Total</p>
                      <p className={`font-medium ${tema.text}`}>
                        {consignacaoSelecionada.quantidade_total || consignacaoSelecionada.quantidadeTotal || 0} itens
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Valor Total</p>
                      <p className={`font-medium ${tema.text}`}>
                        {formatarMoeda(consignacaoSelecionada.valor_total || consignacaoSelecionada.valorTotal || 0)}
                      </p>
                    </div>
                    <div>
                      <p className={tema.textSecondary}>Data da Consignação</p>
                      <p className={`font-medium ${tema.text}`}>
                        {formatarData(
                          consignacaoSelecionada.data_consignacao || 
                          consignacaoSelecionada.dataConsignacao || 
                          consignacaoSelecionada.created_at ||
                          new Date().toISOString()
                        )}
                      </p>
                    </div>
                    {consignacaoSelecionada.data_retorno && (
                      <div>
                        <p className={tema.textSecondary}>Data do Retorno</p>
                        <p className={`font-medium ${tema.text}`}>
                          {formatarData(consignacaoSelecionada.data_retorno)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados do Retorno (se finalizada) */}
                {consignacaoSelecionada.status === 'finalizada' && consignacaoSelecionada.retorno && (
                  <div>
                    <h3 className={`text-lg font-semibold ${tema.text} mb-4`}>
                      Retorno
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={tema.textSecondary}>Quantidade Retornada</p>
                        <p className={`font-medium ${tema.text}`}>
                          {consignacaoSelecionada.retorno.quantidade_retornada || consignacaoSelecionada.retorno.quantidadeRetornada || 0} itens
                        </p>
                      </div>
                      <div>
                        <p className={tema.textSecondary}>Quantidade Vendida</p>
                        <p className={`font-medium ${tema.text}`}>
                          {consignacaoSelecionada.retorno.quantidade_vendida || consignacaoSelecionada.retorno.quantidadeVendida || 0} itens
                        </p>
                      </div>
                      <div>
                        <p className={tema.textSecondary}>Valor Retornado</p>
                        <p className={`font-medium ${tema.text}`}>
                          {formatarMoeda(consignacaoSelecionada.retorno.valor_retornado || consignacaoSelecionada.retorno.valorRetornado || 0)}
                        </p>
                      </div>
                      <div>
                        <p className={tema.textSecondary}>Valor Devido</p>
                        <p className={`font-medium ${tema.text}`}>
                          {formatarMoeda(consignacaoSelecionada.retorno.valor_devido || consignacaoSelecionada.retorno.valorDevido || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {consignacaoSelecionada.observacoes && (
                  <div>
                    <h3 className={`text-lg font-semibold ${tema.text} mb-4`}>
                      Observações
                    </h3>
                    <p className={`${tema.text} bg-gray-50 p-4 rounded-lg`}>
                      {consignacaoSelecionada.observacoes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={fecharModal}
                  className={`
                    px-4 py-2 border ${tema.border} rounded-lg
                    ${tema.text} hover:${tema.hover} transition-colors
                  `}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Retorno */}
      {modalRetorno && consignacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg shadow-xl w-full max-w-lg`}>
            <div className="p-6">
              <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
                Finalizar Consignação
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className={`font-semibold ${tema.text} mb-2`}>
                    {consignacaoSelecionada.cliente_nome || consignacaoSelecionada.clienteNome}
                  </h3>
                  <p className={tema.textSecondary}>
                    Total: {consignacaoSelecionada.quantidade_total || consignacaoSelecionada.quantidadeTotal || 0} itens - {formatarMoeda(consignacaoSelecionada.valor_total || consignacaoSelecionada.valorTotal || 0)}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Quantidade Retornada
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={consignacaoSelecionada.quantidade_total || consignacaoSelecionada.quantidadeTotal || 0}
                    value={dadosRetorno.quantidadeRetornada}
                    onChange={(e) => setDadosRetorno({ ...dadosRetorno, quantidadeRetornada: parseInt(e.target.value) || 0 })}
                    onBlur={calcularRetorno}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Quantidade Vendida
                    </label>
                    <input
                      type="number"
                      value={dadosRetorno.quantidadeVendida}
                      readOnly
                      className={`w-full px-3 py-2 border ${tema.border} rounded-lg bg-gray-50`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Valor Devido
                    </label>
                    <input
                      type="text"
                      value={formatarMoeda(dadosRetorno.valorDevido)}
                      readOnly
                      className={`w-full px-3 py-2 border ${tema.border} rounded-lg bg-gray-50`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Observações do Retorno
                  </label>
                  <textarea
                    value={dadosRetorno.observacoes}
                    onChange={(e) => setDadosRetorno({ ...dadosRetorno, observacoes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Observações sobre o retorno..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={fecharModal}
                  disabled={carregando}
                  className={`
                    px-4 py-2 border ${tema.border} rounded-lg
                    ${tema.text} hover:${tema.hover} transition-colors
                    disabled:opacity-50
                  `}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinalizarConsignacao}
                  disabled={carregando}
                  className={`
                    bg-green-600 text-white px-4 py-2 rounded-lg
                    hover:bg-green-700 transition-colors
                    disabled:opacity-50
                  `}
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