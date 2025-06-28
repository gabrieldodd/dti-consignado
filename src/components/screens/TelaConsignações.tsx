// src/components/screens/TelaConsignacoes.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  AlertTriangle, 
  QrCode, 
  Package,
  Calculator,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  FileText,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

interface ConsignacaoForm {
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  vendedorId: string;
  quantidadeTotal: string;
  valorTotal: string;
  observacoes: string;
}

interface ProdutoConsignacao {
  produtoId: number;
  produto: any;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface RetornoForm {
  produtos: {
    produtoId: number;
    quantidadeRetornada: number;
    quantidadeVendida: number;
  }[];
  observacoes: string;
}

export const TelaConsignacoes: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    consignacoes, 
    setConsignacoes,
    vendedores,
    produtos,
    usuarioLogado,
    tipoUsuario,
    mostrarMensagem,
    cookies 
  } = useAppContext();
  
  const { formatarMoedaBR, formatarCPF, formatarCNPJ, formatarTelefone } = useFormatters();
  const { validarCPF, validarCNPJ, validarTelefone } = useValidation();

  // Estados Locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRetornoAberto, setModalRetornoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [consignacaoEditando, setConsignacaoEditando] = useState<any>(null);
  const [consignacaoRetorno, setConsignacaoRetorno] = useState<any>(null);
  const [consignacaoDetalhes, setConsignacaoDetalhes] = useState<any>(null);
  const [consignacaoParaExcluir, setConsignacaoParaExcluir] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);

  // Estados para QR Code
  const [leituraQR, setLeituraQR] = useState(false);
  const [codigoQR, setCodigoQR] = useState('');

  // Filtros e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusConsignacoes') || 'todas';
  });

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusConsignacoes', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Formulário
  const [formConsignacao, setFormConsignacao] = useState<ConsignacaoForm>({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf',
    vendedorId: tipoUsuario === 'vendedor' ? usuarioLogado?.id?.toString() || '' : '',
    quantidadeTotal: '',
    valorTotal: '',
    observacoes: ''
  });

  const [produtosConsignacao, setProdutosConsignacao] = useState<ProdutoConsignacao[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Formulário de Retorno
  const [formRetorno, setFormRetorno] = useState<RetornoForm>({
    produtos: [],
    observacoes: ''
  });

  // Dados Filtrados
  const consignacoesFiltradas = useMemo(() => {
    let resultado = consignacoes;

    // Filtrar por vendedor se for vendedor
    if (tipoUsuario === 'vendedor') {
      resultado = resultado.filter(c => c.vendedorId === usuarioLogado?.id);
    }

    // Filtro por status
    if (filtroStatus !== 'todas') {
      resultado = resultado.filter(c => c.status === filtroStatus);
    }

    // Filtro por busca
    if (buscaTexto.trim()) {
      const busca = buscaTexto.toLowerCase().trim();
      resultado = resultado.filter(c => 
        c.clienteNome.toLowerCase().includes(busca) ||
        c.clienteDocumento.includes(busca) ||
        c.vendedor.nome.toLowerCase().includes(busca) ||
        c.id.toString().includes(busca)
      );
    }

    return resultado;
  }, [consignacoes, tipoUsuario, usuarioLogado, filtroStatus, buscaTexto]);

  // Funções de Modal
  const abrirModal = useCallback((consignacao = null) => {
    setConsignacaoEditando(consignacao);
    if (consignacao) {
      setFormConsignacao({
        clienteNome: consignacao.clienteNome,
        clienteDocumento: consignacao.clienteDocumento,
        clienteTelefone: consignacao.clienteTelefone,
        tipoDocumento: consignacao.tipoDocumento,
        vendedorId: consignacao.vendedorId.toString(),
        quantidadeTotal: consignacao.quantidadeTotal.toString(),
        valorTotal: consignacao.valorTotal.toString(),
        observacoes: consignacao.observacoes || ''
      });
    } else {
      setFormConsignacao({
        clienteNome: '',
        clienteDocumento: '',
        clienteTelefone: '',
        tipoDocumento: 'cpf',
        vendedorId: tipoUsuario === 'vendedor' ? usuarioLogado?.id?.toString() || '' : '',
        quantidadeTotal: '',
        valorTotal: '',
        observacoes: ''
      });
      setProdutosConsignacao([]);
    }
    setFormErrors({});
    setModalAberto(true);
  }, [tipoUsuario, usuarioLogado]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setConsignacaoEditando(null);
    setProdutosConsignacao([]);
    setFormErrors({});
  }, []);

  // Adicionar produto à consignação
  const adicionarProduto = useCallback(() => {
    const novoProduto: ProdutoConsignacao = {
      produtoId: 0,
      produto: null,
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0
    };
    setProdutosConsignacao(prev => [...prev, novoProduto]);
  }, []);

  const removerProduto = useCallback((index: number) => {
    setProdutosConsignacao(prev => prev.filter((_, i) => i !== index));
  }, []);

  const atualizarProduto = useCallback((index: number, campo: string, valor: any) => {
    setProdutosConsignacao(prev => prev.map((produto, i) => {
      if (i === index) {
        const produtoAtualizado = { ...produto, [campo]: valor };
        
        if (campo === 'produtoId') {
          const produtoSelecionado = produtos.find(p => p.id === parseInt(valor));
          produtoAtualizado.produto = produtoSelecionado;
          produtoAtualizado.valorUnitario = produtoSelecionado?.valorVenda || 0;
        }
        
        if (campo === 'quantidade' || campo === 'valorUnitario') {
          produtoAtualizado.valorTotal = produtoAtualizado.quantidade * produtoAtualizado.valorUnitario;
        }
        
        return produtoAtualizado;
      }
      return produto;
    }));
  }, [produtos]);

  // Calcular totais
  const totaisConsignacao = useMemo(() => {
    const quantidadeTotal = produtosConsignacao.reduce((total, produto) => total + produto.quantidade, 0);
    const valorTotal = produtosConsignacao.reduce((total, produto) => total + produto.valorTotal, 0);
    return { quantidadeTotal, valorTotal };
  }, [produtosConsignacao]);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formConsignacao.clienteNome.trim()) {
      errors.clienteNome = 'Nome do cliente é obrigatório';
    }

    if (!formConsignacao.clienteDocumento.trim()) {
      errors.clienteDocumento = 'Documento do cliente é obrigatório';
    } else {
      if (formConsignacao.tipoDocumento === 'cpf' && !validarCPF(formConsignacao.clienteDocumento)) {
        errors.clienteDocumento = 'CPF inválido';
      } else if (formConsignacao.tipoDocumento === 'cnpj' && !validarCNPJ(formConsignacao.clienteDocumento)) {
        errors.clienteDocumento = 'CNPJ inválido';
      }
    }

    if (!formConsignacao.clienteTelefone.trim()) {
      errors.clienteTelefone = 'Telefone do cliente é obrigatório';
    } else if (!validarTelefone(formConsignacao.clienteTelefone)) {
      errors.clienteTelefone = 'Telefone inválido';
    }

    if (!formConsignacao.vendedorId) {
      errors.vendedorId = 'Vendedor é obrigatório';
    }

    if (produtosConsignacao.length === 0) {
      errors.produtos = 'Adicione pelo menos um produto';
    } else {
      const produtosSemDados = produtosConsignacao.some(p => !p.produtoId || p.quantidade <= 0);
      if (produtosSemDados) {
        errors.produtos = 'Todos os produtos devem ter dados válidos';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formConsignacao, produtosConsignacao, validarCPF, validarCNPJ, validarTelefone]);

  // Salvar consignação
  const salvarConsignacao = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const vendedor = vendedores.find(v => v.id === parseInt(formConsignacao.vendedorId));
      const dadosConsignacao = {
        clienteNome: formConsignacao.clienteNome,
        clienteDocumento: formConsignacao.clienteDocumento,
        clienteTelefone: formConsignacao.clienteTelefone,
        tipoDocumento: formConsignacao.tipoDocumento as 'cpf' | 'cnpj',
        vendedorId: parseInt(formConsignacao.vendedorId),
        vendedor: vendedor!,
        quantidadeTotal: totaisConsignacao.quantidadeTotal,
        valorTotal: totaisConsignacao.valorTotal,
        status: 'ativa' as const,
        observacoes: formConsignacao.observacoes,
        produtos: produtosConsignacao
      };

      if (consignacaoEditando) {
        // Editar consignação existente
        setConsignacoes(prev => prev.map(c => 
          c.id === consignacaoEditando.id 
            ? { ...c, ...dadosConsignacao }
            : c
        ));
        mostrarMensagem('success', 'Consignação atualizada com sucesso!');
      } else {
        // Criar nova consignação
        const novaConsignacao = {
          id: Math.max(...consignacoes.map(c => c.id), 0) + 1,
          ...dadosConsignacao,
          dataConsignacao: new Date().toISOString().split('T')[0]
        };
        setConsignacoes(prev => [...prev, novaConsignacao]);
        mostrarMensagem('success', 'Consignação criada com sucesso!');
      }

      fecharModal();
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar consignação');
    } finally {
      setSalvando(false);
    }
  }, [formConsignacao, produtosConsignacao, totaisConsignacao, vendedores, consignacaoEditando, consignacoes, validarFormulario, setConsignacoes, mostrarMensagem, fecharModal]);

  // Abrir modal de retorno
  const abrirModalRetorno = useCallback((consignacao: any) => {
    setConsignacaoRetorno(consignacao);
    setFormRetorno({
      produtos: consignacao.produtos?.map((p: any) => ({
        produtoId: p.produtoId,
        quantidadeRetornada: 0,
        quantidadeVendida: p.quantidade
      })) || [],
      observacoes: ''
    });
    setModalRetornoAberto(true);
  }, []);

  // Processar retorno da consignação
  const processarRetorno = useCallback(async () => {
    if (!consignacaoRetorno) return;

    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const quantidadeRetornada = formRetorno.produtos.reduce((total, p) => total + p.quantidadeRetornada, 0);
      const quantidadeVendida = formRetorno.produtos.reduce((total, p) => total + p.quantidadeVendida, 0);
      const valorRetornado = formRetorno.produtos.reduce((total, p) => {
        const produto = produtos.find(prod => prod.id === p.produtoId);
        return total + (p.quantidadeRetornada * (produto?.valorVenda || 0));
      }, 0);
      const valorDevido = formRetorno.produtos.reduce((total, p) => {
        const produto = produtos.find(prod => prod.id === p.produtoId);
        return total + (p.quantidadeVendida * (produto?.valorVenda || 0));
      }, 0);

      const retorno = {
        quantidadeRetornada,
        valorRetornado,
        quantidadeVendida,
        valorDevido
      };

      setConsignacoes(prev => prev.map(c => 
        c.id === consignacaoRetorno.id 
          ? { 
              ...c, 
              status: 'finalizada' as const,
              dataRetorno: new Date().toISOString().split('T')[0],
              retorno
            }
          : c
      ));

      mostrarMensagem('success', 'Retorno processado com sucesso!');
      setModalRetornoAberto(false);
      setConsignacaoRetorno(null);
    } catch (error) {
      mostrarMensagem('error', 'Erro ao processar retorno');
    } finally {
      setSalvando(false);
    }
  }, [consignacaoRetorno, formRetorno, produtos, setConsignacoes, mostrarMensagem]);

  // Leitura de QR Code simulada
  const lerQRCode = useCallback(() => {
    setLeituraQR(true);
    // Simular leitura de QR Code
    setTimeout(() => {
      const codigoSimulado = '7891234567890'; // Simular código de barras
      setCodigoQR(codigoSimulado);
      
      const produto = produtos.find(p => p.codigoBarras === codigoSimulado);
      if (produto) {
        mostrarMensagem('success', `Produto encontrado: ${produto.nome}`);
        // Adicionar produto ao retorno
      } else {
        mostrarMensagem('error', 'Produto não encontrado');
      }
      
      setLeituraQR(false);
    }, 2000);
  }, [produtos, mostrarMensagem]);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>Consignações</h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie as consignações de produtos
            </p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Consignação
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar consignações..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
              />
            </div>
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todas">Todos os Status</option>
              <option value="ativa">Ativas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>

            <div className={`flex items-center ${tema.textoSecundario}`}>
              <span className="text-sm">
                {consignacoesFiltradas.length} consignação(ões) encontrada(s)
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Consignações */}
        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
          {consignacoesFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className={`mx-auto h-12 w-12 ${tema.textoSecundario} mb-4`} />
              <h3 className={`text-lg font-medium ${tema.texto} mb-2`}>
                Nenhuma consignação encontrada
              </h3>
              <p className={`${tema.textoSecundario}`}>
                {buscaTexto || filtroStatus !== 'todas' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira consignação.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop: Tabela */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${tema.fundo}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Consignação
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Cliente
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Vendedor
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Valor
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                    {consignacoesFiltradas.map((consignacao) => (
                      <tr key={consignacao.id} className={`hover:${tema.hover}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${tema.texto}`}>
                              #{consignacao.id}
                            </div>
                            <div className={`text-sm ${tema.textoSecundario}`}>
                              {new Date(consignacao.dataConsignacao).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${tema.texto}`}>
                              {consignacao.clienteNome}
                            </div>
                            <div className={`text-sm ${tema.textoSecundario}`}>
                              {consignacao.clienteDocumento}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${tema.texto}`}>
                            {consignacao.vendedor.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${tema.texto}`}>
                              {formatarMoedaBR(consignacao.valorTotal)}
                            </div>
                            <div className={`text-sm ${tema.textoSecundario}`}>
                              {consignacao.quantidadeTotal} itens
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            consignacao.status === 'ativa' 
                              ? 'bg-blue-100 text-blue-800'
                              : consignacao.status === 'finalizada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {consignacao.status === 'ativa' ? 'Ativa' :
                             consignacao.status === 'finalizada' ? 'Finalizada' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setConsignacaoDetalhes(consignacao)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {consignacao.status === 'ativa' && (
                              <>
                                <button
                                  onClick={() => abrirModalRetorno(consignacao)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Processar retorno"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => abrirModal(consignacao)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setConsignacaoParaExcluir(consignacao)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden">
                {consignacoesFiltradas.map((consignacao) => (
                  <div key={consignacao.id} className={`p-4 border-b ${tema.borda}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`font-medium ${tema.texto}`}>#{consignacao.id}</h3>
                        <p className={`text-sm ${tema.textoSecundario}`}>
                          {new Date(consignacao.dataConsignacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consignacao.status === 'ativa' 
                          ? 'bg-blue-100 text-blue-800'
                          : consignacao.status === 'finalizada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consignacao.status === 'ativa' ? 'Ativa' :
                         consignacao.status === 'finalizada' ? 'Finalizada' : 'Cancelada'}
                      </span>
                    </div>
                    
                    <div className={`text-sm ${tema.textoSecundario} mb-3 space-y-1`}>
                      <p><strong>Cliente:</strong> {consignacao.clienteNome}</p>
                      <p><strong>Vendedor:</strong> {consignacao.vendedor.nome}</p>
                      <p><strong>Valor:</strong> {formatarMoedaBR(consignacao.valorTotal)} ({consignacao.quantidadeTotal} itens)</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setConsignacaoDetalhes(consignacao)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                      {consignacao.status === 'ativa' && (
                        <button
                          onClick={() => abrirModalRetorno(consignacao)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Retorno
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal de Cadastro/Edição */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${tema.papel} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    {consignacaoEditando ? 'Editar Consignação' : 'Nova Consignação'}
                  </h2>
                  <button
                    onClick={fecharModal}
                    disabled={salvando}
                    className={`p-2 rounded-md ${tema.hover} ${tema.textoSecundario}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Dados do Cliente */}
                  <div>
                    <h3 className={`text-lg font-medium ${tema.texto} mb-3`}>Dados do Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Nome <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formConsignacao.clienteNome}
                          onChange={(e) => setFormConsignacao(prev => ({ ...prev, clienteNome: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.clienteNome ? 'border-red-500' : ''}`}
                          placeholder="Nome do cliente"
                        />
                        {formErrors.clienteNome && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.clienteNome}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Telefone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formConsignacao.clienteTelefone}
                          onChange={(e) => setFormConsignacao(prev => ({ ...prev, clienteTelefone: formatarTelefone(e.target.value) }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.clienteTelefone ? 'border-red-500' : ''}`}
                          placeholder="(11) 99999-9999"
                        />
                        {formErrors.clienteTelefone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.clienteTelefone}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Tipo de Documento
                        </label>
                        <select
                          value={formConsignacao.tipoDocumento}
                          onChange={(e) => setFormConsignacao(prev => ({ ...prev, tipoDocumento: e.target.value as 'cpf' | 'cnpj', clienteDocumento: '' }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                        >
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          {formConsignacao.tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formConsignacao.clienteDocumento}
                          onChange={(e) => setFormConsignacao(prev => ({ 
                            ...prev, 
                            clienteDocumento: prev.tipoDocumento === 'cpf' 
                              ? formatarCPF(e.target.value) 
                              : formatarCNPJ(e.target.value)
                          }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.clienteDocumento ? 'border-red-500' : ''}`}
                          placeholder={formConsignacao.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                        />
                        {formErrors.clienteDocumento && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.clienteDocumento}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vendedor */}
                  {tipoUsuario === 'admin' && (
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Vendedor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formConsignacao.vendedorId}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, vendedorId: e.target.value }))}
                        disabled={salvando}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.vendedorId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Selecione um vendedor</option>
                        {vendedores.filter(v => v.status === 'Ativo').map(vendedor => (
                          <option key={vendedor.id} value={vendedor.id}>
                            {vendedor.nome}
                          </option>
                        ))}
                      </select>
                      {formErrors.vendedorId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.vendedorId}</p>
                      )}
                    </div>
                  )}

                  {/* Produtos */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-lg font-medium ${tema.texto}`}>Produtos</h3>
                      <button
                        type="button"
                        onClick={adicionarProduto}
                        disabled={salvando}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </button>
                    </div>

                    {produtosConsignacao.length === 0 ? (
                      <div className={`p-4 border-2 border-dashed ${tema.borda} rounded-lg text-center`}>
                        <Package className={`mx-auto h-8 w-8 ${tema.textoSecundario} mb-2`} />
                        <p className={`${tema.textoSecundario}`}>
                          Nenhum produto adicionado. Clique em "Adicionar" para incluir produtos.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {produtosConsignacao.map((produto, index) => (
                          <div key={index} className={`p-3 border ${tema.borda} rounded-lg`}>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                              <div className="md:col-span-2">
                                <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                  Produto
                                </label>
                                <select
                                  value={produto.produtoId}
                                  onChange={(e) => atualizarProduto(index, 'produtoId', parseInt(e.target.value))}
                                  disabled={salvando}
                                  className={`w-full px-2 py-1 text-sm border rounded ${tema.input}`}
                                >
                                  <option value={0}>Selecione um produto</option>
                                  {produtos.filter(p => p.ativo).map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.nome} - {formatarMoedaBR(p.valorVenda)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                  Qtd
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={produto.quantidade}
                                  onChange={(e) => atualizarProduto(index, 'quantidade', parseInt(e.target.value) || 1)}
                                  disabled={salvando}
                                  className={`w-full px-2 py-1 text-sm border rounded ${tema.input}`}
                                />
                              </div>
                              
                              <div>
                                <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                  Valor Unit.
                                </label>
                                <input
                                  type="text"
                                  value={formatarMoedaBR(produto.valorUnitario)}
                                  disabled
                                  className={`w-full px-2 py-1 text-sm border rounded bg-gray-100 ${tema.input}`}
                                />
                              </div>
                              
                              <div className="flex items-end space-x-2">
                                <div className="flex-1">
                                  <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                    Total
                                  </label>
                                  <input
                                    type="text"
                                    value={formatarMoedaBR(produto.valorTotal)}
                                    disabled
                                    className={`w-full px-2 py-1 text-sm border rounded bg-gray-100 ${tema.input}`}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removerProduto(index)}
                                  disabled={salvando}
                                  className="text-red-600 hover:text-red-900 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formErrors.produtos && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.produtos}</p>
                    )}
                  </div>

                  {/* Totais */}
                  {produtosConsignacao.length > 0 && (
                    <div className={`p-4 ${tema.fundo} rounded-lg border ${tema.borda}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className={`text-sm ${tema.textoSecundario}`}>
                            Total de itens: <strong>{totaisConsignacao.quantidadeTotal}</strong>
                          </span>
                        </div>
                        <div>
                          <span className={`text-lg font-semibold ${tema.texto}`}>
                            Total: {formatarMoedaBR(totaisConsignacao.valorTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Observações
                    </label>
                    <textarea
                      value={formConsignacao.observacoes}
                      onChange={(e) => setFormConsignacao(prev => ({ ...prev, observacoes: e.target.value }))}
                      disabled={salvando}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                      placeholder="Observações sobre a consignação"
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={fecharModal}
                      disabled={salvando}
                      className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={salvarConsignacao}
                      disabled={salvando}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {salvando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Retorno */}
        {modalRetornoAberto && consignacaoRetorno && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${tema.papel} rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    Processar Retorno - Consignação #{consignacaoRetorno.id}
                  </h2>
                  <button
                    onClick={() => setModalRetornoAberto(false)}
                    disabled={salvando}
                    className={`p-2 rounded-md ${tema.hover} ${tema.textoSecundario}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Leitor QR Code Simulado */}
                  <div className={`p-4 ${tema.fundo} rounded-lg border ${tema.borda}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${tema.texto}`}>Leitura de QR Code</h3>
                      <button
                        onClick={lerQRCode}
                        disabled={leituraQR || salvando}
                        className={`px-3 py-1 bg-purple-600 text-white rounded text-sm flex items-center ${leituraQR ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        {leituraQR ? 'Lendo...' : 'Ler QR'}
                      </button>
                    </div>
                    {leituraQR && (
                      <div className="text-center py-4">
                        <div className="animate-pulse">📱 Simulando leitura de QR Code...</div>
                      </div>
                    )}
                    {codigoQR && (
                      <div className={`text-sm ${tema.textoSecundario}`}>
                        Último código lido: {codigoQR}
                      </div>
                    )}
                  </div>

                  {/* Lista de produtos para retorno */}
                  <div>
                    <h3 className={`font-medium ${tema.texto} mb-3`}>Produtos da Consignação</h3>
                    <div className="space-y-3">
                      {formRetorno.produtos.map((produto, index) => {
                        const produtoInfo = produtos.find(p => p.id === produto.produtoId);
                        return (
                          <div key={index} className={`p-3 border ${tema.borda} rounded-lg`}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                  Produto
                                </label>
                                <div className={`text-sm ${tema.texto}`}>
                                  {produtoInfo?.nome || 'Produto não encontrado'}
                                </div>
                              </div>
                              
                              <div>
                                <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                  Qtd Consignada
                                </label>
                                <div className={`text-sm ${tema.textoSecundario}`}>
                                  {consignacaoRetorno.produtos?.[index]?.quantidade || 0}
                                </div>
                              </div>
                              
                              <div>
                                <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                  Qtd Retornada
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={consignacaoRetorno.produtos?.[index]?.quantidade || 0}
                                  value={produto.quantidadeRetornada}
                                  onChange={(e) => {
                                    const qtdRetornada = parseInt(e.target.value) || 0;
                                    const qtdConsignada = consignacaoRetorno.produtos?.[index]?.quantidade || 0;
                                    const qtdVendida = qtdConsignada - qtdRetornada;
                                    
                                    setFormRetorno(prev => ({
                                      ...prev,
                                      produtos: prev.produtos.map((p, i) => 
                                        i === index 
                                          ? { ...p, quantidadeRetornada: qtdRetornada, quantidadeVendida: qtdVendida }
                                          : p
                                      )
                                    }));
                                  }}
                                  disabled={salvando}
                                  className={`w-full px-2 py-1 text-sm border rounded ${tema.input}`}
                                />
                              </div>
                              
                              <div>
                                <label className={`block text-xs font-medium ${tema.texto} mb-1`}>
                                  Qtd Vendida
                                </label>
                                <div className={`text-sm ${produto.quantidadeVendida > 0 ? 'text-green-600' : tema.textoSecundario}`}>
                                  {produto.quantidadeVendida}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Observações do retorno */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Observações do Retorno
                    </label>
                    <textarea
                      value={formRetorno.observacoes}
                      onChange={(e) => setFormRetorno(prev => ({ ...prev, observacoes: e.target.value }))}
                      disabled={salvando}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                      placeholder="Observações sobre o retorno"
                    />
                  </div>

                  {/* Resumo */}
                  <div className={`p-4 ${tema.fundo} rounded-lg border ${tema.borda}`}>
                    <h4 className={`font-medium ${tema.texto} mb-2`}>Resumo do Retorno</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`${tema.textoSecundario}`}>Itens retornados:</span>
                        <span className={`ml-2 font-medium ${tema.texto}`}>
                          {formRetorno.produtos.reduce((total, p) => total + p.quantidadeRetornada, 0)}
                        </span>
                      </div>
                      <div>
                        <span className={`${tema.textoSecundario}`}>Itens vendidos:</span>
                        <span className={`ml-2 font-medium text-green-600`}>
                          {formRetorno.produtos.reduce((total, p) => total + p.quantidadeVendida, 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setModalRetornoAberto(false)}
                      disabled={salvando}
                      className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={processarRetorno}
                      disabled={salvando}
                      className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {salvando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalizar Retorno
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes */}
        {consignacaoDetalhes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${tema.papel} rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    Detalhes da Consignação #{consignacaoDetalhes.id}
                  </h2>
                  <button
                    onClick={() => setConsignacaoDetalhes(null)}
                    className={`p-2 rounded-md ${tema.hover} ${tema.textoSecundario}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informações gerais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className={`font-medium ${tema.texto} mb-2`}>Dados do Cliente</h3>
                      <div className={`space-y-1 text-sm ${tema.textoSecundario}`}>
                        <p><strong>Nome:</strong> {consignacaoDetalhes.clienteNome}</p>
                        <p><strong>Documento:</strong> {consignacaoDetalhes.clienteDocumento}</p>
                        <p><strong>Telefone:</strong> {consignacaoDetalhes.clienteTelefone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`font-medium ${tema.texto} mb-2`}>Informações da Consignação</h3>
                      <div className={`space-y-1 text-sm ${tema.textoSecundario}`}>
                        <p><strong>Vendedor:</strong> {consignacaoDetalhes.vendedor.nome}</p>
                        <p><strong>Data:</strong> {new Date(consignacaoDetalhes.dataConsignacao).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Status:</strong> {consignacaoDetalhes.status}</p>
                        {consignacaoDetalhes.dataRetorno && (
                          <p><strong>Data Retorno:</strong> {new Date(consignacaoDetalhes.dataRetorno).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Produtos */}
                  <div>
                    <h3 className={`font-medium ${tema.texto} mb-3`}>Produtos</h3>
                    <div className="space-y-2">
                      {consignacaoDetalhes.produtos?.map((produto: any, index: number) => (
                        <div key={index} className={`p-3 border ${tema.borda} rounded-lg`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`font-medium ${tema.texto}`}>
                                {produto.produto?.nome || `Produto ID: ${produto.produtoId}`}
                              </div>
                              <div className={`text-sm ${tema.textoSecundario}`}>
                                Quantidade: {produto.quantidade} | Valor unitário: {formatarMoedaBR(produto.valorUnitario)}
                              </div>
                            </div>
                            <div className={`font-medium ${tema.texto}`}>
                              {formatarMoedaBR(produto.valorTotal)}
                            </div>
                          </div>
                        </div>
                      )) || (
                        <p className={`text-sm ${tema.textoSecundario}`}>Nenhum produto informado</p>
                      )}
                    </div>
                  </div>

                  {/* Totais */}
                  <div className={`p-4 ${tema.fundo} rounded-lg border ${tema.borda}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${tema.texto}`}>
                        Total de itens: {consignacaoDetalhes.quantidadeTotal}
                      </span>
                      <span className={`text-lg font-semibold ${tema.texto}`}>
                        Total: {formatarMoedaBR(consignacaoDetalhes.valorTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Retorno (se houver) */}
                  {consignacaoDetalhes.retorno && (
                    <div>
                      <h3 className={`font-medium ${tema.texto} mb-3`}>Informações do Retorno</h3>
                      <div className={`p-4 ${tema.fundo} rounded-lg border ${tema.borda}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className={`${tema.textoSecundario}`}>Itens retornados:</span>
                            <span className={`ml-2 font-medium ${tema.texto}`}>
                              {consignacaoDetalhes.retorno.quantidadeRetornada}
                            </span>
                          </div>
                          <div>
                            <span className={`${tema.textoSecundario}`}>Valor retornado:</span>
                            <span className={`ml-2 font-medium ${tema.texto}`}>
                              {formatarMoedaBR(consignacaoDetalhes.retorno.valorRetornado)}
                            </span>
                          </div>
                          <div>
                            <span className={`${tema.textoSecundario}`}>Itens vendidos:</span>
                            <span className={`ml-2 font-medium text-green-600`}>
                              {consignacaoDetalhes.retorno.quantidadeVendida}
                            </span>
                          </div>
                          <div>
                            <span className={`${tema.textoSecundario}`}>Valor devido:</span>
                            <span className={`ml-2 font-medium text-green-600`}>
                              {formatarMoedaBR(consignacaoDetalhes.retorno.valorDevido)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {consignacaoDetalhes.observacoes && (
                    <div>
                      <h3 className={`font-medium ${tema.texto} mb-2`}>Observações</h3>
                      <div className={`p-3 ${tema.fundo} rounded-lg border ${tema.borda} text-sm ${tema.textoSecundario}`}>
                        {consignacaoDetalhes.observacoes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${tema.papel} rounded-lg max-w-md w-full`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    Confirmar Exclusão
                  </h2>
                </div>
                
                <p className={`${tema.textoSecundario} mb-6`}>
                  Tem certeza de que deseja excluir a consignação <strong>#{consignacaoParaExcluir?.id}</strong>? 
                  Esta ação não pode ser desfeita.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setModalExclusaoAberto(false)}
                    disabled={salvando}
                    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setConsignacoes(prev => prev.filter(c => c.id !== consignacaoParaExcluir?.id));
                      mostrarMensagem('success', 'Consignação excluída com sucesso!');
                      setModalExclusaoAberto(false);
                      setConsignacaoParaExcluir(null);
                    }}
                    disabled={salvando}
                    className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};