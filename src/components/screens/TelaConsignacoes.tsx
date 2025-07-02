// TelaConsignacoes.tsx - Versão Otimizada para Evitar Travamentos
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
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
  ArrowLeft,
  Edit
} from 'lucide-react';

// Interfaces otimizadas
interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
  dataCadastro: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  codigoBarras: string;
  categoria: string;
  valorCusto: number;
  valorVenda: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataCadastro: string;
}

interface ProdutoConsignacao {
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface Consignacao {
  id: number;
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  vendedorId: number;
  vendedor: Vendedor;
  quantidadeTotal: number;
  valorTotal: number;
  dataConsignacao: string;
  dataRetorno?: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  observacoes?: string;
  produtos?: ProdutoConsignacao[];
  retorno?: {
    quantidadeVendida: number;
    quantidadeRetornada: number;
    valorVendido: number;
    valorRetornado: number;
  };
}

interface ConsignacaoForm {
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  vendedorId: string;
  observacoes: string;
}

// Formulário inicial
const FORM_INICIAL: ConsignacaoForm = {
  clienteNome: '',
  clienteDocumento: '',
  clienteTelefone: '',
  tipoDocumento: 'cpf',
  vendedorId: '',
  observacoes: ''
};

// Hook imports - assumindo que existem no contexto
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

// Componente de estatísticas memoizado
const EstatisticasConsignacoes = memo(({ consignacoes, tema }: { 
  consignacoes: Consignacao[], 
  tema: any 
}) => {
  const estatisticas = useMemo(() => {
    const total = consignacoes.length;
    const ativas = consignacoes.filter(c => c.status === 'ativa').length;
    const finalizadas = consignacoes.filter(c => c.status === 'finalizada').length;
    const valorTotal = consignacoes.reduce((acc, c) => acc + c.valorTotal, 0);
    
    return { total, ativas, finalizadas, valorTotal };
  }, [consignacoes]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Total</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.total}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Ativas</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.ativas}</p>
          </div>
          <Clock className="h-8 w-8 text-orange-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Finalizadas</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.finalizadas}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Valor Total</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>
              R$ {estatisticas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Calculator className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
});

// Componente principal otimizado
export const TelaConsignacoes: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    consignacoes, 
    setConsignacoes,
    produtos,
    vendedores,
    mostrarMensagem,
    cookies 
  } = useAppContext();
  
  const { formatarMoedaBR, formatarCPF, formatarCNPJ, formatarTelefone } = useFormatters();
  const { validarCPF, validarCNPJ } = useValidation();
  // Estados com inicialização otimizada
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRetornoAberto, setModalRetornoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [consignacaoRetorno, setConsignacaoRetorno] = useState<Consignacao | null>(null);
  const [consignacaoDetalhes, setConsignacaoDetalhes] = useState<Consignacao | null>(null);
  
  // Filtros com carregamento otimizado dos cookies
  const [filtros, setFiltros] = useState(() => ({
    status: cookies.getCookie('filtroStatusConsignacoes') || 'todas',
    busca: ''
  }));

  const [formConsignacao, setFormConsignacao] = useState<ConsignacaoForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [produtosConsignacao, setProdutosConsignacao] = useState<ProdutoConsignacao[]>([]);
  const [codigoLeitura, setCodigoLeitura] = useState('');

  // Salvar filtros nos cookies de forma otimizada
  const salvarFiltroStatus = useCallback((status: string) => {
    setFiltros(prev => ({ ...prev, status }));
    cookies.setCookie('filtroStatusConsignacoes', status, 30);
  }, [cookies]);

  // Filtros memoizados para evitar recálculos desnecessários
  const consignacoesFiltradas = useMemo(() => {
    return consignacoes.filter(consignacao => {
      const passaStatus = filtros.status === 'todas' || consignacao.status === filtros.status;
      const passaBusca = !filtros.busca || 
        consignacao.clienteNome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        consignacao.clienteDocumento.includes(filtros.busca) ||
        consignacao.vendedor.nome.toLowerCase().includes(filtros.busca.toLowerCase());
      
      return passaStatus && passaBusca;
    });
  }, [consignacoes, filtros]);

  // Cálculos dos totais memoizados
  const totaisConsignacao = useMemo(() => {
    const quantidadeTotal = produtosConsignacao.reduce((total, produto) => total + produto.quantidade, 0);
    const valorTotal = produtosConsignacao.reduce((total, produto) => total + produto.valorTotal, 0);
    return { quantidadeTotal, valorTotal };
  }, [produtosConsignacao]);

  // Validação memoizada
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
    }

    if (!formConsignacao.vendedorId) {
      errors.vendedorId = 'Vendedor é obrigatório';
    }

    if (produtosConsignacao.length === 0) {
      errors.produtos = 'Adicione pelo menos um produto à consignação';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formConsignacao, produtosConsignacao, validarCPF, validarCNPJ]);

  // Handlers otimizados com useCallback
  const abrirModal = useCallback(() => {
    setFormConsignacao(FORM_INICIAL);
    setFormErrors({});
    setProdutosConsignacao([]);
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setFormConsignacao(FORM_INICIAL);
    setFormErrors({});
    setProdutosConsignacao([]);
  }, []);

  const abrirModalRetorno = useCallback((consignacao: Consignacao) => {
    setConsignacaoRetorno(consignacao);
    setModalRetornoAberto(true);
  }, []);

  const fecharModalRetorno = useCallback(() => {
    setModalRetornoAberto(false);
    setConsignacaoRetorno(null);
    setCodigoLeitura('');
  }, []);

  const abrirModalDetalhes = useCallback((consignacao: Consignacao) => {
    setConsignacaoDetalhes(consignacao);
    setModalDetalhesAberto(true);
  }, []);

  const fecharModalDetalhes = useCallback(() => {
    setModalDetalhesAberto(false);
    setConsignacaoDetalhes(null);
  }, []);

  // Função para adicionar produto via código de barras otimizada
  const adicionarProdutoPorCodigo = useCallback(() => {
    if (!codigoLeitura.trim()) return;

    const produto = produtos.find(p => p.codigoBarras === codigoLeitura.trim() && p.ativo);
    
    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado ou inativo');
      setCodigoLeitura('');
      return;
    }

    setProdutosConsignacao(prev => {
      const produtoExistente = prev.find(p => p.produto.id === produto.id);
      
      if (produtoExistente) {
        return prev.map(p => 
          p.produto.id === produto.id 
            ? { ...p, quantidade: p.quantidade + 1, valorTotal: (p.quantidade + 1) * p.valorUnitario }
            : p
        );
      }
      
      return [...prev, {
        produto,
        quantidade: 1,
        valorUnitario: produto.valorVenda,
        valorTotal: produto.valorVenda
      }];
    });

    setCodigoLeitura('');
    mostrarMensagem('success', `${produto.nome} adicionado à consignação`);
  }, [codigoLeitura, produtos, mostrarMensagem]);

  // Salvar consignação otimizada
  const salvarConsignacao = useCallback(() => {
    if (!validarFormulario()) return;

    const vendedor = vendedores.find(v => v.id === parseInt(formConsignacao.vendedorId));
    if (!vendedor) {
      mostrarMensagem('error', 'Vendedor não encontrado');
      return;
    }

    const novaConsignacao: Consignacao = {
      id: Math.max(...consignacoes.map(c => c.id), 0) + 1,
      ...formConsignacao,
      vendedorId: parseInt(formConsignacao.vendedorId),
      vendedor,
      quantidadeTotal: totaisConsignacao.quantidadeTotal,
      valorTotal: totaisConsignacao.valorTotal,
      dataConsignacao: new Date().toISOString().split('T')[0],
      status: 'ativa',
      produtos: produtosConsignacao
    };

    setConsignacoes(prev => [...prev, novaConsignacao]);
    mostrarMensagem('success', 'Consignação criada com sucesso!');
    fecharModal();
  }, [validarFormulario, formConsignacao, vendedores, consignacoes, totaisConsignacao, produtosConsignacao, setConsignacoes, mostrarMensagem, fecharModal]);

  // Atualizar busca com debounce implícito
  const atualizarBusca = useCallback((valor: string) => {
    setFiltros(prev => ({ ...prev, busca: valor }));
  }, []);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h1 className={`text-3xl font-bold ${tema.texto} mb-2`}>Consignações</h1>
          <p className={`${tema.textoSecundario}`}>
            Gerencie as consignações de produtos para clientes
          </p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Consignação
        </button>
      </div>

      {/* Estatísticas Memoizadas */}
      <EstatisticasConsignacoes consignacoes={consignacoes} tema={tema} />

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => atualizarBusca(e.target.value)}
                placeholder="Cliente, documento ou vendedor..."
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => salvarFiltroStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todas">Todas</option>
              <option value="ativa">Ativas</option>
              <option value="finalizada">Finalizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Consignações */}
      <div className={`${tema.papel} rounded-lg border ${tema.borda} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={tema.fundo}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Cliente
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Vendedor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Data
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Valor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
              {consignacoesFiltradas.map((consignacao) => (
                <tr key={consignacao.id} className={tema.hover}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${tema.texto}`}>
                      {consignacao.clienteNome}
                    </div>
                    <div className={`text-sm ${tema.textoSecundario}`}>
                      {consignacao.tipoDocumento === 'cpf' 
                        ? formatarCPF(consignacao.clienteDocumento)
                        : formatarCNPJ(consignacao.clienteDocumento)
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${tema.texto}`}>
                      {consignacao.vendedor.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${tema.texto}`}>
                      {new Date(consignacao.dataConsignacao).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${tema.texto}`}>
                      {formatarMoedaBR(consignacao.valorTotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      consignacao.status === 'ativa' 
                        ? 'bg-orange-100 text-orange-800'
                        : consignacao.status === 'finalizada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {consignacao.status === 'ativa' && 'Ativa'}
                      {consignacao.status === 'finalizada' && 'Finalizada'}
                      {consignacao.status === 'cancelada' && 'Cancelada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => abrirModalDetalhes(consignacao)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {consignacao.status === 'ativa' && (
                        <button
                          onClick={() => abrirModalRetorno(consignacao)}
                          className="text-green-600 hover:text-green-700"
                          title="Conferir retorno"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {consignacoesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className={`mx-auto h-12 w-12 ${tema.textoSecundario}`} />
            <h3 className={`mt-2 text-sm font-medium ${tema.texto}`}>
              Nenhuma consignação encontrada
            </h3>
            <p className={`mt-1 text-sm ${tema.textoSecundario}`}>
              {consignacoes.length === 0 
                ? 'Comece criando sua primeira consignação.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Nova Consignação */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${tema.texto}`}>
                  Nova Consignação
                </h2>
                <button
                  onClick={fecharModal}
                  className={`${tema.textoSecundario} hover:${tema.texto}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Formulário de Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={formConsignacao.clienteNome}
                    onChange={(e) => setFormConsignacao(prev => ({ ...prev, clienteNome: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.clienteNome ? 'border-red-500' : ''}`}
                    placeholder="Nome completo do cliente"
                  />
                  {formErrors.clienteNome && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.clienteNome}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Vendedor *
                  </label>
                  <select
                    value={formConsignacao.vendedorId}
                    onChange={(e) => setFormConsignacao(prev => ({ ...prev, vendedorId: e.target.value }))}
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
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.vendedorId}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Tipo de Documento
                  </label>
                  <select
                    value={formConsignacao.tipoDocumento}
                    onChange={(e) => setFormConsignacao(prev => ({ 
                      ...prev, 
                      tipoDocumento: e.target.value as 'cpf' | 'cnpj',
                      clienteDocumento: '' 
                    }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    {formConsignacao.tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'} *
                  </label>
                  <input
                    type="text"
                    value={formConsignacao.clienteDocumento}
                    onChange={(e) => setFormConsignacao(prev => ({ ...prev, clienteDocumento: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.clienteDocumento ? 'border-red-500' : ''}`}
                    placeholder={formConsignacao.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                  {formErrors.clienteDocumento && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.clienteDocumento}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={formConsignacao.clienteTelefone}
                    onChange={(e) => setFormConsignacao(prev => ({ ...prev, clienteTelefone: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.clienteTelefone ? 'border-red-500' : ''}`}
                    placeholder="(11) 99999-9999"
                  />
                  {formErrors.clienteTelefone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.clienteTelefone}
                    </p>
                  )}
                </div>
              </div>

              {/* Leitor de Código de Barras */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                  Adicionar Produto por Código de Barras
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={codigoLeitura}
                    onChange={(e) => setCodigoLeitura(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarProdutoPorCodigo()}
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                    placeholder="Escaneie ou digite o código de barras"
                  />
                  <button
                    type="button"
                    onClick={adicionarProdutoPorCodigo}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de Produtos */}
              {produtosConsignacao.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                    Produtos da Consignação
                  </h3>
                  <div className="space-y-3">
                    {produtosConsignacao.map((item, index) => (
                      <div key={item.produto.id} className={`border ${tema.borda} rounded-lg p-4`}>
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className={`font-medium ${tema.texto}`}>
                              {item.produto.nome}
                            </h4>
                            <p className={`text-sm ${tema.textoSecundario}`}>
                              Código: {item.produto.codigoBarras}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div>
                              <label className={`block text-xs ${tema.textoSecundario}`}>
                                Quantidade
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => {
                                  const novaQuantidade = parseInt(e.target.value) || 1;
                                  setProdutosConsignacao(prev => 
                                    prev.map((p, i) => 
                                      i === index 
                                        ? { ...p, quantidade: novaQuantidade, valorTotal: novaQuantidade * p.valorUnitario }
                                        : p
                                    )
                                  );
                                }}
                                className={`w-20 px-2 py-1 border rounded ${tema.input}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs ${tema.textoSecundario}`}>
                                Valor Unit.
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.valorUnitario}
                                onChange={(e) => {
                                  const novoValor = parseFloat(e.target.value) || 0;
                                  setProdutosConsignacao(prev => 
                                    prev.map((p, i) => 
                                      i === index 
                                        ? { ...p, valorUnitario: novoValor, valorTotal: p.quantidade * novoValor }
                                        : p
                                    )
                                  );
                                }}
                                className={`w-24 px-2 py-1 border rounded ${tema.input}`}
                              />
                            </div>
                            <div className={`text-right ${tema.texto} font-medium`}>
                              {formatarMoedaBR(item.valorTotal)}
                            </div>
                            <button
                              onClick={() => {
                                setProdutosConsignacao(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totais */}
                  <div className={`mt-4 pt-4 border-t ${tema.borda}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`text-lg font-medium ${tema.texto}`}>
                          Total: {totaisConsignacao.quantidadeTotal} itens
                        </span>
                      </div>
                      <div>
                        <span className={`text-xl font-bold ${tema.texto}`}>
                          {formatarMoedaBR(totaisConsignacao.valorTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formErrors.produtos && (
                <p className="mb-4 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {formErrors.produtos}
                </p>
              )}

              {/* Observações */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                  Observações
                </label>
                <textarea
                  value={formConsignacao.observacoes}
                  onChange={(e) => setFormConsignacao(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                  placeholder="Observações sobre a consignação (opcional)"
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={fecharModal}
                  className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                >
                  <X className="mr-2 h-4 w-4 inline" />
                  Cancelar
                </button>
                <button
                  onClick={salvarConsignacao}
                  disabled={produtosConsignacao.length === 0}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                    produtosConsignacao.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Consignação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalDetalhesAberto && consignacaoDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${tema.texto}`}>
                  Detalhes da Consignação #{consignacaoDetalhes.id}
                </h2>
                <button
                  onClick={fecharModalDetalhes}
                  className={`${tema.textoSecundario} hover:${tema.texto}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className={`text-lg font-medium ${tema.texto} mb-3 flex items-center`}>
                    <User className="mr-2 h-5 w-5" />
                    Informações do Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Nome
                      </label>
                      <p className={`text-sm ${tema.texto}`}>
                        {consignacaoDetalhes.clienteNome}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Documento
                      </label>
                      <p className={`text-sm ${tema.texto}`}>
                        {consignacaoDetalhes.tipoDocumento === 'cpf' 
                          ? formatarCPF(consignacaoDetalhes.clienteDocumento)
                          : formatarCNPJ(consignacaoDetalhes.clienteDocumento)
                        }
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Telefone
                      </label>
                      <p className={`text-sm ${tema.texto}`}>
                        {formatarTelefone(consignacaoDetalhes.clienteTelefone)}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Vendedor
                      </label>
                      <p className={`text-sm ${tema.texto}`}>
                        {consignacaoDetalhes.vendedor.nome}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Produtos */}
                {consignacaoDetalhes.produtos && consignacaoDetalhes.produtos.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-medium ${tema.texto} mb-3 flex items-center`}>
                      <Package className="mr-2 h-5 w-5" />
                      Produtos Consignados
                    </h3>
                    <div className="space-y-3">
                      {consignacaoDetalhes.produtos.map((item, index) => (
                        <div key={index} className={`border ${tema.borda} rounded-lg p-3`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className={`font-medium ${tema.texto}`}>
                                {item.produto.nome}
                              </h4>
                              <p className={`text-sm ${tema.textoSecundario}`}>
                                Código: {item.produto.codigoBarras}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm ${tema.texto}`}>
                                {item.quantidade}x {formatarMoedaBR(item.valorUnitario)}
                              </p>
                              <p className={`font-medium ${tema.texto}`}>
                                {formatarMoedaBR(item.valorTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totais */}
                <div className={`border-t ${tema.borda} pt-4`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-medium ${tema.texto}`}>
                      Total da Consignação:
                    </span>
                    <span className={`text-xl font-bold ${tema.texto}`}>
                      {formatarMoedaBR(consignacaoDetalhes.valorTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm ${tema.textoSecundario}`}>
                      Quantidade Total:
                    </span>
                    <span className={`text-sm ${tema.texto}`}>
                      {consignacaoDetalhes.quantidadeTotal} itens
                    </span>
                  </div>
                </div>

                {/* Observações */}
                {consignacaoDetalhes.observacoes && (
                  <div>
                    <h3 className={`text-lg font-medium ${tema.texto} mb-3 flex items-center`}>
                      <FileText className="mr-2 h-5 w-5" />
                      Observações
                    </h3>
                    <p className={`text-sm ${tema.texto} ${tema.papel} p-3 rounded-lg border ${tema.borda}`}>
                      {consignacaoDetalhes.observacoes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={fecharModalDetalhes}
                  className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                >
                  <X className="mr-2 h-4 w-4 inline" />
                  Fechar
                </button>
                {consignacaoDetalhes.status === 'ativa' && (
                  <button
                    onClick={() => {
                      fecharModalDetalhes();
                      abrirModalRetorno(consignacaoDetalhes);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Conferir Retorno
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