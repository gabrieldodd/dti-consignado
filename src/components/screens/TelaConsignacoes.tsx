// src/components/screens/TelaConsignacoes.tsx - Versão Corrigida Completa
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  Plus, Search, Eye, CheckCircle, Trash2, X, FileText, Package, 
  Printer, Download, Users, DollarSign, Calendar, Filter, Minus
} from 'lucide-react';

interface ConsignacaoItem {
  id: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
}

interface FormData {
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  vendedorId: string;
  produtosSelecionados: ConsignacaoItem[];
  observacoes: string;
}

interface FormRetorno {
  quantidadeRetornada: number;
  quantidadeVendida: number;
  valorDevido: number;
  observacoes: string;
}

export const TelaConsignacoes: React.FC = () => {
  const {
    tema,
    consignacoes,
    vendedores,
    produtos,
    usuarioLogado,
    tipoUsuario,
    adicionarConsignacao,
    finalizarConsignacao,
    excluirConsignacao,
    mostrarMensagem,
    formatarMoeda,
    formatarData,
    formatarDocumento
  } = useAppContext();

  // Estados
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalImpressaoAberto, setModalImpressaoAberto] = useState(false);
  const [consignacaoSelecionada, setConsignacaoSelecionada] = useState<any>(null);
  const [consignacaoDetalhes, setConsignacaoDetalhes] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  
  // Filtros e busca
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('data');

  // Formulários
  const [formData, setFormData] = useState<FormData>({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf',
    vendedorId: '',
    produtosSelecionados: [],
    observacoes: ''
  });

  const [formRetorno, setFormRetorno] = useState<FormRetorno>({
    quantidadeRetornada: 0,
    quantidadeVendida: 0,
    valorDevido: 0,
    observacoes: ''
  });

  const [erros, setErros] = useState<any>({});

  // Código de barras para adicionar produtos
  const [codigoProduto, setCodigoProduto] = useState('');
  
  // Estados para finalização com código de barras
  const [codigoRetorno, setCodigoRetorno] = useState('');
  const [produtosRetornados, setProdutosRetornados] = useState<any[]>([]);

  // Configurar vendedor se for do tipo vendedor
  useEffect(() => {
    if (tipoUsuario === 'vendedor' && usuarioLogado?.id) {
      setFormData(prev => ({
        ...prev,
        vendedorId: usuarioLogado.id.toString()
      }));
    }
  }, [tipoUsuario, usuarioLogado]);

  // CORREÇÃO 4: Função para parsear quantidade*código (ex: 2*1010)
  const parseCodigoComQuantidade = (codigo: string) => {
    const trimmedCodigo = codigo.trim();
    
    // Verifica se tem o formato quantidade*código
    if (trimmedCodigo.includes('*')) {
      const partes = trimmedCodigo.split('*');
      if (partes.length === 2) {
        const quantidade = parseInt(partes[0]);
        const codigoProduto = partes[1].trim();
        
        if (!isNaN(quantidade) && quantidade > 0 && codigoProduto) {
          return { quantidade, codigo: codigoProduto };
        }
      }
    }
    
    // Se não tem o formato especial, retorna quantidade 1
    return { quantidade: 1, codigo: trimmedCodigo };
  };

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
          return (parseFloat(b.valor_total) || 0) - (parseFloat(a.valor_total) || 0);
        case 'cliente':
          return (a.cliente_nome || '').localeCompare(b.cliente_nome || '');
        default:
          const dataA = a.data_consignacao || a.created_at || '';
          const dataB = b.data_consignacao || b.created_at || '';
          return new Date(dataB).getTime() - new Date(dataA).getTime();
      }
    });
  }, [consignacoes, busca, filtroStatus, ordenacao, tipoUsuario, usuarioLogado]);

  // Resetar formulário
  const resetarFormulario = () => {
    setFormData({
      clienteNome: '',
      clienteDocumento: '',
      clienteTelefone: '',
      tipoDocumento: 'cpf',
      vendedorId: tipoUsuario === 'vendedor' ? usuarioLogado?.id?.toString() || '' : '',
      produtosSelecionados: [],
      observacoes: ''
    });
    setCodigoProduto('');
    setErros({});
  };

  const resetarFormRetorno = () => {
    setFormRetorno({
      quantidadeRetornada: 0,
      quantidadeVendida: 0,
      valorDevido: 0,
      observacoes: ''
    });
    setCodigoRetorno('');
    setProdutosRetornados([]);
  };

  // CORREÇÃO 1, 3 e 4: Função adicionarProdutoPorCodigo corrigida
  const adicionarProdutoPorCodigo = useCallback(() => {
    if (!codigoProduto.trim()) return;

    // Parse do código com quantidade
    const { quantidade, codigo } = parseCodigoComQuantidade(codigoProduto);

    const produto = produtos?.find((p: any) => 
      p.codigo_barras === codigo || 
      p.nome.toLowerCase().includes(codigo.toLowerCase())
    );

    if (!produto) {
      // CORREÇÃO 3: Mensagem mais específica para produto não encontrado
      mostrarMensagem('error', `Código "${codigo}" não encontrado. Verifique o código e tente novamente.`);
      return;
    }

    const produtoExistente = formData.produtosSelecionados.find(p => p.produto === produto.nome);

    if (produtoExistente) {
      // CORREÇÃO 1: Verifica duplicação e mostra notificação
      mostrarMensagem('info', `${produto.nome} já está na lista. Quantidade aumentada de ${produtoExistente.quantidade} para ${produtoExistente.quantidade + quantidade}.`);
      
      setFormData(prev => ({
        ...prev,
        produtosSelecionados: prev.produtosSelecionados.map(p =>
          p.produto === produto.nome
            ? { ...p, quantidade: p.quantidade + quantidade }
            : p
        )
      }));
    } else {
      const novoProduto: ConsignacaoItem = {
        id: `${produto.id}_${Date.now()}`,
        produto: produto.nome,
        quantidade: quantidade, // CORREÇÃO 4: Usa a quantidade parseada
        valorUnitario: produto.valor_venda || 0
      };

      setFormData(prev => ({
        ...prev,
        produtosSelecionados: [...prev.produtosSelecionados, novoProduto]
      }));
    }

    setCodigoProduto('');
    mostrarMensagem('success', `${produto.nome} adicionado${quantidade > 1 ? ` (${quantidade} unidades)` : ''}!`);
  }, [codigoProduto, produtos, formData.produtosSelecionados, mostrarMensagem]);

  // Remover produto
  const removerProduto = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      produtosSelecionados: prev.produtosSelecionados.filter(p => p.id !== id)
    }));
  }, []);

  // Atualizar quantidade/valor do produto
  const atualizarProduto = useCallback((id: string, campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      produtosSelecionados: prev.produtosSelecionados.map(p =>
        p.id === id 
          ? { ...p, [campo]: valor }
          : p
      )
    }));
  }, []);

  // Ajustar quantidade do produto no retorno
  const ajustarQuantidadeProdutoRetorno = useCallback((produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      // Se quantidade for 0 ou negativa, remove o produto
      setProdutosRetornados(prev => prev.filter(pr => pr.id !== produtoId));
    } else {
      // Atualiza a quantidade
      setProdutosRetornados(prev => 
        prev.map(pr => 
          pr.id === produtoId 
            ? { ...pr, quantidade: novaQuantidade }
            : pr
        )
      );
    }

    // Recalcular totais
    const produtosAtualizados = produtosRetornados.map(pr =>
      pr.id === produtoId
        ? { ...pr, quantidade: novaQuantidade }
        : pr
    ).filter(pr => pr.quantidade > 0);

    const novaQuantidadeTotal = produtosAtualizados.reduce((sum, pr) => sum + pr.quantidade, 0);
    const novoValorRetornado = produtosAtualizados.reduce((sum, pr) => sum + (pr.quantidade * pr.valor_venda), 0);
    const quantidadeVendida = Math.max(0, consignacaoSelecionada.quantidade_total - novaQuantidadeTotal);
    const valorDevido = Math.max(0, parseFloat(consignacaoSelecionada.valor_total) - novoValorRetornado);

    setFormRetorno({
      ...formRetorno,
      quantidadeRetornada: novaQuantidadeTotal,
      quantidadeVendida: quantidadeVendida,
      valorDevido: valorDevido
    });
  }, [produtosRetornados, consignacaoSelecionada, formRetorno]);

  // CORREÇÃO 1, 3 e 4: Função adicionarProdutoRetorno corrigida
  const adicionarProdutoRetorno = useCallback(() => {
    if (!codigoRetorno.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    // Parse do código com quantidade
    const { quantidade, codigo } = parseCodigoComQuantidade(codigoRetorno);

    const produto = produtos?.find((p: any) => 
      (p.codigo_barras === codigo || p.codigoBarras === codigo) && p.ativo !== false
    );

    if (!produto) {
      // CORREÇÃO 3: Mensagem mais específica para produto não encontrado
      mostrarMensagem('error', `Código "${codigo}" não encontrado ou produto inativo. Verifique o código e tente novamente.`);
      setCodigoRetorno('');
      return;
    }

    const produtoExistente = produtosRetornados.find(pr => pr.id === produto.id);

    if (produtoExistente) {
      // CORREÇÃO 1: Notifica sobre duplicação
      const novaQuantidade = produtoExistente.quantidade + quantidade;
      mostrarMensagem('info', `${produto.nome} já está no retorno. Quantidade aumentada de ${produtoExistente.quantidade} para ${novaQuantidade}.`);
      
      // Se produto já existe, incrementa quantidade usando a função de ajuste
      ajustarQuantidadeProdutoRetorno(produto.id, novaQuantidade);
    } else {
      // Se é novo produto, adiciona à lista com a quantidade parseada
      const novoProdutoRetorno = {
        id: produto.id,
        nome: produto.nome,
        valor_venda: produto.valor_venda || produto.valorVenda || 0,
        quantidade: quantidade // CORREÇÃO 4: Usa a quantidade parseada
      };

      setProdutosRetornados(prev => [...prev, novoProdutoRetorno]);

      // Calcular totais com o novo produto
      const novaQuantidadeTotal = produtosRetornados.reduce((sum, pr) => sum + pr.quantidade, 0) + quantidade;
      const novoValorRetornado = produtosRetornados.reduce((sum, pr) => sum + (pr.quantidade * pr.valor_venda), 0) + (quantidade * (produto.valor_venda || produto.valorVenda || 0));
      const quantidadeVendida = Math.max(0, consignacaoSelecionada.quantidade_total - novaQuantidadeTotal);
      const valorDevido = Math.max(0, parseFloat(consignacaoSelecionada.valor_total) - novoValorRetornado);

      setFormRetorno({
        ...formRetorno,
        quantidadeRetornada: novaQuantidadeTotal,
        quantidadeVendida: quantidadeVendida,
        valorDevido: valorDevido
      });
    }

    setCodigoRetorno('');
    mostrarMensagem('success', `${produto.nome} adicionado ao retorno${quantidade > 1 ? ` (${quantidade} unidades)` : ''}!`);
  }, [codigoRetorno, produtos, produtosRetornados, consignacaoSelecionada, formRetorno, mostrarMensagem, ajustarQuantidadeProdutoRetorno]);

  // Remover produto do retorno (remove completamente)
  const removerProdutoRetorno = useCallback((produtoId: number) => {
    const produto = produtosRetornados.find(pr => pr.id === produtoId);
    if (!produto) return;

    // Remove completamente o produto da lista
    setProdutosRetornados(prev => prev.filter(pr => pr.id !== produtoId));

    // Recalcular totais sem esse produto
    const produtosAtualizados = produtosRetornados.filter(pr => pr.id !== produtoId);

    const novaQuantidade = produtosAtualizados.reduce((sum, pr) => sum + pr.quantidade, 0);
    const novoValorRetornado = produtosAtualizados.reduce((sum, pr) => sum + (pr.quantidade * pr.valor_venda), 0);
    const quantidadeVendida = Math.max(0, consignacaoSelecionada.quantidade_total - novaQuantidade);
    const valorDevido = Math.max(0, parseFloat(consignacaoSelecionada.valor_total) - novoValorRetornado);

    setFormRetorno({
      ...formRetorno,
      quantidadeRetornada: novaQuantidade,
      quantidadeVendida: quantidadeVendida,
      valorDevido: valorDevido
    });

    mostrarMensagem('success', `${produto.nome} removido completamente do retorno!`);
  }, [produtosRetornados, consignacaoSelecionada, formRetorno, mostrarMensagem]);

  // Validar formulário
  const validarFormulario = () => {
    const novosErros: any = {};

    if (!formData.clienteNome.trim()) {
      novosErros.clienteNome = 'Nome do cliente é obrigatório';
    }

    if (!formData.clienteDocumento.trim()) {
      novosErros.clienteDocumento = 'Documento é obrigatório';
    }

    if (!formData.vendedorId) {
      novosErros.vendedorId = 'Vendedor é obrigatório';
    }

    if (formData.produtosSelecionados.length === 0) {
      novosErros.produtos = 'Adicione pelo menos um produto';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Criar consignação
  const criarConsignacao = async () => {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      const dadosConsignacao = {
        cliente_nome: formData.clienteNome.trim(),
        cliente_documento: formData.clienteDocumento.trim(),
        cliente_telefone: formData.clienteTelefone.trim(),
        vendedor_id: parseInt(formData.vendedorId),
        produtos_selecionados: formData.produtosSelecionados,
        observacoes: formData.observacoes.trim(),
        status: 'ativa',
        data_consignacao: new Date().toISOString(),
        quantidade_total: formData.produtosSelecionados.reduce((sum, p) => sum + p.quantidade, 0),
        valor_total: formData.produtosSelecionados.reduce((sum, p) => sum + (p.quantidade * p.valorUnitario), 0)
      };

      const resultado = await adicionarConsignacao(dadosConsignacao);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação criada com sucesso!');
        setModalAberto(false);
        resetarFormulario();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao criar consignação');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao criar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // Finalizar consignação
  const finalizarConsignacaoHandler = async () => {
    if (!consignacaoSelecionada) return;

    setCarregando(true);
    try {
      const dadosFinalizar = {
        id: consignacaoSelecionada.id,
        produtos_retornados: produtosRetornados,
        quantidade_retornada: formRetorno.quantidadeRetornada,
        quantidade_vendida: formRetorno.quantidadeVendida,
        valor_devido: formRetorno.valorDevido,
        observacoes_retorno: formRetorno.observacoes,
        data_finalizacao: new Date().toISOString()
      };

      const resultado = await finalizarConsignacao(dadosFinalizar);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação finalizada com sucesso!');
        setModalFinalizarAberto(false);
        setConsignacaoSelecionada(null);
        resetarFormRetorno();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao finalizar consignação');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao finalizar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // Abrir modal de finalização
  const abrirModalFinalizar = (consignacao: any) => {
    setConsignacaoSelecionada(consignacao);
    setModalFinalizarAberto(true);
    resetarFormRetorno();
  };

  // Abrir modal de detalhes
  const abrirModalDetalhes = (consignacao: any) => {
    setConsignacaoDetalhes(consignacao);
    setModalDetalhesAberto(true);
  };

  // Fechar modal de detalhes
  const fecharModalDetalhes = () => {
    setModalDetalhesAberto(false);
    setConsignacaoDetalhes(null);
  };

  // Excluir consignação
  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta consignação?')) {
      return;
    }

    try {
      const resultado = await excluirConsignacao(id);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação excluída com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir consignação');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao excluir consignação');
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
              Gerencie as consignações de produtos
            </p>
          </div>
          
          <button
            onClick={() => setModalAberto(true)}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tema.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Buscar por cliente..."
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
              <option value="todas">Todas as Consignações</option>
              <option value="ativa">Ativas</option>
              <option value="finalizada">Finalizadas</option>
            </select>

            {/* Ordenação */}
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="data">Mais Recentes</option>
              <option value="valor">Maior Valor</option>
              <option value="cliente">Por Cliente</option>
            </select>

            {/* Estatísticas */}
            <div className="flex items-center justify-center">
              <span className={`text-sm ${tema.textSecondary}`}>
                {consignacoesFiltradas.length} consignações
              </span>
            </div>
          </div>
        </div>

        {/* Lista de consignações */}
        <div className={`${tema.surface} rounded-lg shadow-sm overflow-hidden`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${tema.background} bg-gray-50`}>
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
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Valor Total
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`${tema.surface} divide-y divide-gray-200`}>
              {consignacoesFiltradas.map((consignacao: any) => (
                <tr key={consignacao.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${tema.text}`}>
                        {consignacao.cliente_nome}
                      </div>
                      <div className={`text-sm ${tema.textSecondary}`}>
                        {formatarDocumento ? formatarDocumento(consignacao.cliente_documento) : consignacao.cliente_documento}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${tema.text}`}>
                      {vendedores.find(v => v.id === consignacao.vendedor_id)?.nome || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${tema.text}`}>
                      {formatarData ? formatarData(consignacao.data_consignacao || consignacao.created_at) : 
                        new Date(consignacao.data_consignacao || consignacao.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      consignacao.status === 'ativa' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {consignacao.status === 'ativa' ? 'Ativa' : 'Finalizada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${tema.text}`}>
                      {formatarMoeda ? formatarMoeda(consignacao.valor_total) : 
                        `R$ ${parseFloat(consignacao.valor_total || 0).toFixed(2)}`}
                    </div>
                    <div className={`text-xs ${tema.textSecondary}`}>
                      {consignacao.quantidade_total} itens
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Botão Ver Detalhes */}
                      <button
                        onClick={() => abrirModalDetalhes(consignacao)}
                        className="p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Botão Finalizar */}
                      {consignacao.status === 'ativa' && (
                        <button
                          onClick={() => abrirModalFinalizar(consignacao)}
                          className="p-2 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          title="Finalizar"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}

                      {/* Botão Excluir */}
                      {tipoUsuario === 'admin' && (
                        <button
                          onClick={() => handleExcluir(consignacao.id)}
                          className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
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

          {/* Mensagem se não houver consignações */}
          {consignacoesFiltradas.length === 0 && (
            <div className="text-center py-8">
              <Package className={`w-12 h-12 mx-auto mb-4 ${tema.textSecondary}`} />
              <p className={`text-lg ${tema.text} mb-2`}>Nenhuma consignação encontrada</p>
              <p className={tema.textSecondary}>
                {busca || filtroStatus !== 'todas' 
                  ? 'Tente ajustar os filtros' 
                  : 'Clique em "Nova Consignação" para começar'
                }
              </p>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dados do Cliente */}
                <div className="space-y-4">
                  <h3 className={`font-medium ${tema.text}`}>Dados do Cliente</h3>
                  
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
                      <p className="text-red-500 text-sm mt-1">{erros.clienteNome}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                        Tipo Documento
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

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                        {formData.tipoDocumento.toUpperCase()} *
                      </label>
                      <input
                        type="text"
                        value={formData.clienteDocumento}
                        onChange={(e) => setFormData({ ...formData, clienteDocumento: e.target.value })}
                        className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                        placeholder={formData.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      />
                      {erros.clienteDocumento && (
                        <p className="text-red-500 text-sm mt-1">{erros.clienteDocumento}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={formData.clienteTelefone}
                      onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  {tipoUsuario === 'admin' && (
                    <div>
                      <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                        Vendedor *
                      </label>
                      <select
                        value={formData.vendedorId}
                        onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value })}
                        className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
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
                  )}

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

                {/* Produtos da Consignação */}
                <div className="space-y-4">
                  <h3 className={`font-medium ${tema.text}`}>Produtos da Consignação</h3>
                  
                  {/* Adicionar Produto */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoProduto}
                      onChange={(e) => setCodigoProduto(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && adicionarProdutoPorCodigo()}
                      className={`flex-1 px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder="Digite ou escaneie o código. Use formato 2*1010 para quantidade 2 do código 1010"
                    />
                    <button
                      type="button"
                      onClick={adicionarProdutoPorCodigo}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Adicionar
                    </button>
                  </div>

                  {erros.produtos && (
                    <p className="text-red-500 text-sm">{erros.produtos}</p>
                  )}

                  {/* Lista de produtos selecionados */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.produtosSelecionados.map((item) => (
                      <div key={item.id} className={`p-3 border ${tema.border} rounded-md ${tema.surface} flex items-center justify-between`}>
                        <div className="flex-1">
                          <div className={`font-medium ${tema.text}`}>{item.produto}</div>
                          <div className={`text-sm ${tema.textSecondary}`}>
                            {formatarMoeda ? formatarMoeda(item.valorUnitario) : `R$ ${item.valorUnitario.toFixed(2)}`} cada
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className={`text-sm ${tema.textSecondary}`}>Qtd:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => atualizarProduto(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                              className={`w-16 px-2 py-1 border ${tema.border} rounded text-center text-sm ${tema.surface} ${tema.text}`}
                            />
                          </div>
                          
                          <button
                            onClick={() => removerProduto(item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remover produto"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumo dos totais */}
                  {formData.produtosSelecionados.length > 0 && (
                    <div className={`p-4 bg-blue-50 border ${tema.border} rounded-md`}>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={`font-medium ${tema.textSecondary}`}>Total de Itens:</span>
                          <p className={`font-bold ${tema.text}`}>
                            {formData.produtosSelecionados.reduce((sum, p) => sum + p.quantidade, 0)}
                          </p>
                        </div>
                        <div>
                          <span className={`font-medium ${tema.textSecondary}`}>Valor Total:</span>
                          <p className={`font-bold ${tema.text}`}>
                            {formatarMoeda ? 
                              formatarMoeda(formData.produtosSelecionados.reduce((sum, p) => sum + (p.quantidade * p.valorUnitario), 0)) :
                              `R$ ${formData.produtosSelecionados.reduce((sum, p) => sum + (p.quantidade * p.valorUnitario), 0).toFixed(2)}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões do modal */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    resetarFormulario();
                  }}
                  className={`px-4 py-2 ${tema.text} border ${tema.border} rounded-md ${tema.hover}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={criarConsignacao}
                  disabled={carregando || formData.produtosSelecionados.length === 0}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
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
          <div className={`${tema.surface} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
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
                <div className={`p-3 ${tema.surface} border ${tema.border} rounded-md bg-blue-50`}>
                  <h3 className={`font-medium ${tema.text} mb-2`}>Dados da Consignação</h3>
                  <div className={`text-sm ${tema.textSecondary} space-y-1`}>
                    <p><strong>Cliente:</strong> {consignacaoSelecionada.cliente_nome}</p>
                    <p><strong>Total Original:</strong> {consignacaoSelecionada.quantidade_total} itens - {formatarMoeda ? 
                      formatarMoeda(parseFloat(consignacaoSelecionada.valor_total)) : `R$ ${parseFloat(consignacaoSelecionada.valor_total).toFixed(2)}`}</p>
                  </div>
                </div>

                {/* Leitor de Código de Barras para Retorno */}
                <div className="space-y-3">
                  <h3 className={`font-medium ${tema.text}`}>📦 Produtos Retornados</h3>
                  
                  {/* Campo de leitura */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoRetorno}
                      onChange={(e) => setCodigoRetorno(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && adicionarProdutoRetorno()}
                      className={`flex-1 px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder="Digite ou escaneie o código. Use formato 3*1010 para quantidade 3 do código 1010"
                    />
                    <button
                      type="button"
                      onClick={adicionarProdutoRetorno}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                  
                  <p className={`text-xs ${tema.textSecondary}`}>
                    Pressione Enter após digitar o código ou use um leitor de código de barras
                  </p>

                  {/* Lista de produtos retornados */}
                  {produtosRetornados.length > 0 && (
                    <div className="space-y-2">
                      <h4 className={`text-sm font-medium ${tema.text}`}>Produtos Escaneados:</h4>
                      {produtosRetornados.map((produto) => (
                        <div key={produto.id} className={`p-3 border ${tema.border} rounded-md ${tema.surface} flex items-center justify-between`}>
                          <div className="flex-1">
                            <div className={`font-medium ${tema.text}`}>{produto.nome}</div>
                            <div className="flex items-center gap-4 mt-2">
                              {/* Controles de Quantidade com botões + e - */}
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${tema.textSecondary}`}>Qtd:</span>
                                <button
                                  type="button"
                                  onClick={() => ajustarQuantidadeProdutoRetorno(produto.id, produto.quantidade - 1)}
                                  disabled={produto.quantidade <= 1}
                                  className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-colors ${
                                    produto.quantidade <= 1 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                                  }`}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className={`w-8 text-center font-medium ${tema.text}`}>
                                  {produto.quantidade}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => ajustarQuantidadeProdutoRetorno(produto.id, produto.quantidade + 1)}
                                  className="w-7 h-7 rounded flex items-center justify-center font-bold bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              
                              <div className={`text-sm ${tema.textSecondary}`}>
                                {formatarMoeda ? formatarMoeda(produto.valor_venda) : `R$ ${produto.valor_venda.toFixed(2)}`} cada
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removerProdutoRetorno(produto.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded ml-3"
                            title="Remover produto"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resumo dos cálculos */}
                  {produtosRetornados.length > 0 && (
                    <div className={`p-4 bg-green-50 border ${tema.border} rounded-md`}>
                      <h4 className={`font-medium ${tema.text} mb-3`}>Resumo do Retorno:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className={`font-medium ${tema.textSecondary}`}>Qtd. Retornada:</span>
                          <p className={`font-bold text-blue-600`}>{formRetorno.quantidadeRetornada}</p>
                        </div>
                        <div>
                          <span className={`font-medium ${tema.textSecondary}`}>Qtd. Vendida:</span>
                          <p className={`font-bold text-green-600`}>{formRetorno.quantidadeVendida}</p>
                        </div>
                        <div>
                          <span className={`font-medium ${tema.textSecondary}`}>Valor Devido:</span>
                          <p className={`font-bold text-orange-600`}>
                            {formatarMoeda ? formatarMoeda(formRetorno.valorDevido) : `R$ ${formRetorno.valorDevido.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações do retorno */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Observações do Retorno
                    </label>
                    <textarea
                      value={formRetorno.observacoes}
                      onChange={(e) => setFormRetorno({ ...formRetorno, observacoes: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder="Observações sobre o retorno dos produtos..."
                    />
                  </div>
                </div>
              </div>

              {/* Botões do modal */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setModalFinalizarAberto(false);
                    setConsignacaoSelecionada(null);
                    resetarFormRetorno();
                  }}
                  className={`px-4 py-2 ${tema.text} border ${tema.border} rounded-md ${tema.hover}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={finalizarConsignacaoHandler}
                  disabled={carregando}
                  className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {carregando ? 'Finalizando...' : 'Finalizar Consignação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DA CONSIGNAÇÃO */}
      {modalDetalhesAberto && consignacaoDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${tema.text} flex items-center`}>
                  <FileText size={24} className="mr-2" />
                  Detalhes da Consignação #{consignacaoDetalhes.id}
                </h2>
                <button
                  onClick={fecharModalDetalhes}
                  className={`p-1 rounded ${tema.hover} ${tema.text}`}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna 1: Informações do Cliente e Vendedor */}
                <div className="space-y-4">
                  {/* Dados do Cliente */}
                  <div className={`p-4 border ${tema.border} rounded-lg ${tema.surface}`}>
                    <h3 className={`font-semibold ${tema.text} mb-3 flex items-center`}>
                      <Users size={18} className="mr-2" />
                      Dados do Cliente
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={tema.textSecondary}>Nome:</span>
                        <span className={`font-medium ${tema.text}`}>
                          {consignacaoDetalhes.cliente_nome}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={tema.textSecondary}>Documento:</span>
                        <span className={`font-medium ${tema.text}`}>
                          {formatarDocumento ? 
                            formatarDocumento(consignacaoDetalhes.cliente_documento) : 
                            consignacaoDetalhes.cliente_documento
                          }
                        </span>
                      </div>
                      {consignacaoDetalhes.cliente_telefone && (
                        <div className="flex justify-between">
                          <span className={tema.textSecondary}>Telefone:</span>
                          <span className={`font-medium ${tema.text}`}>
                            {consignacaoDetalhes.cliente_telefone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dados do Vendedor */}
                  <div className={`p-4 border ${tema.border} rounded-lg ${tema.surface}`}>
                    <h3 className={`font-semibold ${tema.text} mb-3 flex items-center`}>
                      <Users size={18} className="mr-2" />
                      Vendedor Responsável
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={tema.textSecondary}>Nome:</span>
                        <span className={`font-medium ${tema.text}`}>
                          {vendedores.find(v => v.id === consignacaoDetalhes.vendedor_id)?.nome || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={tema.textSecondary}>Email:</span>
                        <span className={`font-medium ${tema.text}`}>
                          {vendedores.find(v => v.id === consignacaoDetalhes.vendedor_id)?.email || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  {consignacaoDetalhes.observacoes && (
                    <div className={`p-4 border ${tema.border} rounded-lg ${tema.surface}`}>
                      <h3 className={`font-semibold ${tema.text} mb-3`}>
                        Observações
                      </h3>
                      <p className={`text-sm ${tema.text}`}>
                        {consignacaoDetalhes.observacoes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Coluna 2: Resumo Financeiro e Status */}
                <div className="space-y-4">
                  {/* Resumo Financeiro */}
                  <div className={`p-4 border ${tema.border} rounded-lg bg-blue-50`}>
                    <h3 className={`font-semibold text-blue-900 mb-3 flex items-center`}>
                      <DollarSign size={18} className="mr-2" />
                      Resumo Financeiro
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total de Itens:</span>
                        <span className="font-bold text-blue-900">
                          {consignacaoDetalhes.quantidade_total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Valor Total:</span>
                        <span className="font-bold text-blue-900 text-lg">
                          {formatarMoeda ? 
                            formatarMoeda(parseFloat(consignacaoDetalhes.valor_total)) : 
                            `R$ ${parseFloat(consignacaoDetalhes.valor_total).toFixed(2)}`
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Valor Médio/Item:</span>
                        <span className="font-medium text-blue-900">
                          {formatarMoeda ? 
                            formatarMoeda(parseFloat(consignacaoDetalhes.valor_total) / consignacaoDetalhes.quantidade_total) : 
                            `R$ ${(parseFloat(consignacaoDetalhes.valor_total) / consignacaoDetalhes.quantidade_total).toFixed(2)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status da Consignação */}
                  <div className={`p-4 border ${tema.border} rounded-lg ${tema.surface}`}>
                    <h3 className={`font-semibold ${tema.text} mb-3 flex items-center`}>
                      <Calendar size={18} className="mr-2" />
                      Status da Consignação
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={tema.textSecondary}>Status Atual:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          consignacaoDetalhes.status === 'ativa' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {consignacaoDetalhes.status === 'ativa' ? 'Em Andamento' : 'Finalizada'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={tema.textSecondary}>Data de Criação:</span>
                        <span className={`font-medium ${tema.text}`}>
                          {formatarData ? 
                            formatarData(consignacaoDetalhes.data_consignacao || consignacaoDetalhes.created_at) : 
                            new Date(consignacaoDetalhes.data_consignacao || consignacaoDetalhes.created_at).toLocaleDateString('pt-BR')
                          }
                        </span>
                      </div>
                      {consignacaoDetalhes.data_finalizacao && (
                        <div className="flex justify-between">
                          <span className={tema.textSecondary}>Data de Finalização:</span>
                          <span className={`font-medium ${tema.text}`}>
                            {formatarData ? 
                              formatarData(consignacaoDetalhes.data_finalizacao) : 
                              new Date(consignacaoDetalhes.data_finalizacao).toLocaleDateString('pt-BR')
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resultados (se finalizada) */}
                  {consignacaoDetalhes.status === 'finalizada' && consignacaoDetalhes.quantidade_vendida !== undefined && (
                    <div className={`p-4 border ${tema.border} rounded-lg bg-green-50`}>
                      <h3 className={`font-semibold text-green-900 mb-3 flex items-center`}>
                        <CheckCircle size={18} className="mr-2" />
                        Resultado Final
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Itens Vendidos:</span>
                          <span className="font-bold text-green-900">
                            {consignacaoDetalhes.quantidade_vendida}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Itens Retornados:</span>
                          <span className="font-bold text-green-900">
                            {consignacaoDetalhes.quantidade_retornada || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Valor Devido:</span>
                          <span className="font-bold text-green-900 text-lg">
                            {formatarMoeda ? 
                              formatarMoeda(consignacaoDetalhes.valor_devido || 0) : 
                              `R$ ${(consignacaoDetalhes.valor_devido || 0).toFixed(2)}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Taxa de Venda:</span>
                          <span className={`font-bold text-lg ${
                            ((consignacaoDetalhes.quantidade_vendida / consignacaoDetalhes.quantidade_total) * 100) >= 70 
                              ? 'text-green-600' 
                              : 'text-orange-600'
                          }`}>
                            {((consignacaoDetalhes.quantidade_vendida / consignacaoDetalhes.quantidade_total) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Produtos (se disponível) */}
              {consignacaoDetalhes.produtos_selecionados && consignacaoDetalhes.produtos_selecionados.length > 0 && (
                <div className="mt-6">
                  <h3 className={`font-semibold ${tema.text} mb-4 flex items-center`}>
                    <Package size={18} className="mr-2" />
                    Produtos da Consignação ({consignacaoDetalhes.produtos_selecionados.length} itens)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor Unit.
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {consignacaoDetalhes.produtos_selecionados.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.produto}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantidade}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatarMoeda ? 
                                formatarMoeda(item.valorUnitario || item.valor_unitario || 0) : 
                                `R$ ${(item.valorUnitario || item.valor_unitario || 0).toFixed(2)}`
                              }
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatarMoeda ? 
                                formatarMoeda((item.quantidade * (item.valorUnitario || item.valor_unitario || 0))) : 
                                `R$ ${(item.quantidade * (item.valorUnitario || item.valor_unitario || 0)).toFixed(2)}`
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Botões do modal */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={fecharModalDetalhes}
                  className={`px-4 py-2 ${tema.text} border ${tema.border} rounded-md ${tema.hover}`}
                >
                  <X className="mr-2 h-4 w-4 inline" />
                  Fechar
                </button>
                
                {consignacaoDetalhes.status === 'ativa' && (
                  <button
                    onClick={() => {
                      fecharModalDetalhes();
                      abrirModalFinalizar(consignacaoDetalhes);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar Consignação
                  </button>
                )}
                
                {consignacaoDetalhes.status === 'finalizada' && (
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};