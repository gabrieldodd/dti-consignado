// src/components/screens/TelaConsignacoes.tsx
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
  Edit,
  Filter,
  Scan,
  Minus
} from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

// Interfaces
interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
  data_cadastro: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  codigo_barras: string;
  categoria: string;
  valor_custo: number;
  valor_venda: number;
  estoque: number;
  estoque_minimo: number;
  ativo: boolean;
  data_cadastro: string;
}

interface Consignacao {
  id: number;
  cliente_nome: string;
  cliente_documento: string;
  cliente_telefone: string;
  tipo_documento: 'cpf' | 'cnpj';
  vendedor_id: number;
  vendedor?: Vendedor;
  quantidade_total: number;
  valor_total: number;
  data_consignacao: string;
  data_retorno?: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  observacoes?: string;
  retorno?: {
    quantidade_retornada: number;
    valor_retornado: number;
    quantidade_vendida: number;
    valor_devido: number;
  }[];
}

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

// Constantes
const FORM_INICIAL: ConsignacaoForm = {
  clienteNome: '',
  clienteDocumento: '',
  clienteTelefone: '',
  tipoDocumento: 'cpf',
  vendedorId: '',
  quantidadeTotal: '',
  valorTotal: '',
  observacoes: ''
};

// Componente de estatísticas
const EstatisticasConsignacoes = memo(() => {
  const { tema, consignacoes } = useAppContext();
  
  const estatisticas = useMemo(() => {
    const ativas = consignacoes.filter(c => c.status === 'ativa').length;
    const finalizadas = consignacoes.filter(c => c.status === 'finalizada').length;
    const valorTotal = consignacoes.reduce((acc, c) => acc + (c.valor_total || 0), 0);
    
    return { ativas, finalizadas, valorTotal };
  }, [consignacoes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

// Componente principal
export const TelaConsignacoes: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    consignacoes, 
    produtos,
    vendedores,
    mostrarMensagem,
    cookies,
    usuarioLogado,
    tipoUsuario,
    adicionarConsignacao,
    finalizarConsignacao: finalizarConsignacaoContext,
    excluirConsignacao: excluirConsignacaoContext,
    loadingConsignacoes,
    errorConsignacoes
  } = useAppContext();
  
  const { formatarMoedaBR, formatarCPF, formatarCNPJ, formatarTelefone } = useFormatters();
  const { validarCPF, validarCNPJ } = useValidation();

  // Loading e Erro
  if (loadingConsignacoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${tema.textoSecundario}`}>Carregando consignações...</p>
        </div>
      </div>
    );
  }

  if (errorConsignacoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className={`h-12 w-12 ${tema.textoSecundario} mx-auto mb-4`} />
          <p className={`${tema.texto} font-medium mb-2`}>Erro ao carregar consignações</p>
          <p className={`${tema.textoSecundario} text-sm mb-4`}>{errorConsignacoes}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Estados
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRetornoAberto, setModalRetornoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [consignacaoRetorno, setConsignacaoRetorno] = useState<Consignacao | null>(null);
  const [consignacaoDetalhes, setConsignacaoDetalhes] = useState<Consignacao | null>(null);
  
  // Estados do modal de retorno
  const [retornoForm, setRetornoForm] = useState({
    quantidadeRetornada: 0,
    valorRetornado: 0
  });
  const [codigoLeitura, setCodigoLeitura] = useState('');
  const [produtosLidos, setProdutosLidos] = useState<{produto: Produto, quantidade: number}[]>([]);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusConsignacoes') || 'todas';
  });
  const [buscaTexto, setBuscaTexto] = useState('');

  // Estados do formulário
  const [formConsignacao, setFormConsignacao] = useState<ConsignacaoForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<any>({});

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusConsignacoes', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Filtrar consignações
  const consignacoesFiltradas = useMemo(() => {
    let resultado = consignacoes;

    if (tipoUsuario === 'vendedor') {
      resultado = resultado.filter(c => c.vendedor_id === usuarioLogado.id);
    }

    if (filtroStatus !== 'todas') {
      resultado = resultado.filter(c => c.status === filtroStatus);
    }

    if (buscaTexto) {
      resultado = resultado.filter(c => 
        c.cliente_nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.cliente_documento.includes(buscaTexto) ||
        (c.vendedor && c.vendedor.nome.toLowerCase().includes(buscaTexto.toLowerCase()))
      );
    }

    return resultado;
  }, [consignacoes, tipoUsuario, usuarioLogado, filtroStatus, buscaTexto]);

  // Handlers modais
  const abrirModal = useCallback(() => {
    setFormConsignacao({
      ...FORM_INICIAL,
      vendedorId: tipoUsuario === 'vendedor' ? usuarioLogado.id.toString() : ''
    });
    setFormErrors({});
    setProdutosConsignacao([]);
    setModalAberto(true);
  }, [tipoUsuario, usuarioLogado]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setFormConsignacao(FORM_INICIAL);
    setFormErrors({});
    setProdutosConsignacao([]);
  }, []);

  const abrirModalRetorno = useCallback((consignacao: Consignacao) => {
    setConsignacaoRetorno(consignacao);
    setRetornoForm({
      quantidadeRetornada: 0,
      valorRetornado: 0
    });
    setProdutosLidos([]);
    setCodigoLeitura('');
    setModalRetornoAberto(true);
  }, []);

  const fecharModalRetorno = useCallback(() => {
    setModalRetornoAberto(false);
    setConsignacaoRetorno(null);
    setCodigoLeitura('');
    setProdutosLidos([]);
    setRetornoForm({
      quantidadeRetornada: 0,
      valorRetornado: 0
    });
  }, []);

  const abrirModalDetalhes = useCallback((consignacao: Consignacao) => {
    setConsignacaoDetalhes(consignacao);
    setModalDetalhesAberto(true);
  }, []);

  const fecharModalDetalhes = useCallback(() => {
    setModalDetalhesAberto(false);
    setConsignacaoDetalhes(null);
  }, []);

  const abrirModalConfirmacao = useCallback(() => {
    setModalConfirmacaoAberto(true);
  }, []);

  const fecharModalConfirmacao = useCallback(() => {
    setModalConfirmacaoAberto(false);
  }, []);

  // Funções do modal de retorno
  const lerCodigoRetorno = useCallback(() => {
    if (!codigoLeitura.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    const produto = produtos.find(p => p.codigo_barras === codigoLeitura.trim() && p.ativo);
    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado ou inativo');
      return;
    }

    const produtoExistente = produtosLidos.find(pl => pl.produto.id === produto.id);
    
    if (produtoExistente) {
      setProdutosLidos(prev => prev.map(pl =>
        pl.produto.id === produto.id
          ? { ...pl, quantidade: pl.quantidade + 1 }
          : pl
      ));
    } else {
      setProdutosLidos(prev => [...prev, { produto, quantidade: 1 }]);
    }

    const novaQuantidade = retornoForm.quantidadeRetornada + 1;
    const novoValor = retornoForm.valorRetornado + produto.valor_venda;

    setRetornoForm({
      quantidadeRetornada: novaQuantidade,
      valorRetornado: novoValor
    });

    setCodigoLeitura('');
    mostrarMensagem('success', `${produto.nome} adicionado! Valor: ${formatarMoedaBR(produto.valor_venda)}`);
  }, [codigoLeitura, produtos, produtosLidos, retornoForm, mostrarMensagem, formatarMoedaBR]);

  const removerProdutoLido = useCallback((produtoId: number) => {
    const produtoRemover = produtosLidos.find(pl => pl.produto.id === produtoId);
    if (!produtoRemover) return;

    if (produtoRemover.quantidade > 1) {
      setProdutosLidos(prev => prev.map(pl =>
        pl.produto.id === produtoId
          ? { ...pl, quantidade: pl.quantidade - 1 }
          : pl
      ));
      setRetornoForm(prev => ({
        quantidadeRetornada: prev.quantidadeRetornada - 1,
        valorRetornado: prev.valorRetornado - produtoRemover.produto.valorVenda
      }));
    } else {
      setProdutosLidos(prev => prev.filter(pl => pl.produto.id !== produtoId));
      setRetornoForm(prev => ({
        quantidadeRetornada: prev.quantidadeRetornada - 1,
        valorRetornado: prev.valorRetornado - produtoRemover.produto.valorVenda
      }));
    }

    mostrarMensagem('success', `${produtoRemover.produto.nome} removido!`);
  }, [produtosLidos, mostrarMensagem]);

  const finalizarConsignacao = useCallback(async () => {
    if (!consignacaoRetorno) return;

    const quantidadeRetornada = retornoForm.quantidadeRetornada;
    const valorRetornado = retornoForm.valorRetornado;
    const quantidadeVendida = consignacaoRetorno.quantidade_total - quantidadeRetornada;
    const valorDevido = consignacaoRetorno.valor_total - valorRetornado;
    
    const dadosRetorno = {
      quantidade_retornada: quantidadeRetornada,
      valor_retornado: valorRetornado,
      quantidade_vendida: quantidadeVendida,
      valor_devido: valorDevido
    };

    const resultado = await finalizarConsignacaoContext(consignacaoRetorno.id, dadosRetorno);
    
    if (resultado.success) {
      fecharModalConfirmacao();
      fecharModalRetorno();
    }
  }, [consignacaoRetorno, retornoForm, finalizarConsignacaoContext, fecharModalConfirmacao, fecharModalRetorno]);

  // Função para excluir consignação
  const excluirConsignacao = useCallback(async (consignacao: Consignacao) => {
    if (confirm(`Confirma a exclusão da consignação de "${consignacao.cliente_nome}"?`)) {
      await excluirConsignacaoContext(consignacao.id);
    }
  }, [excluirConsignacaoContext]);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!formConsignacao.clienteNome.trim()) errors.clienteNome = 'Nome do cliente é obrigatório';
    
    if (!formConsignacao.clienteDocumento.trim()) {
      errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} é obrigatório`;
    } else {
      const validador = formConsignacao.tipoDocumento === 'cpf' ? validarCPF : validarCNPJ;
      if (!validador(formConsignacao.clienteDocumento)) {
        errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} inválido`;
      }
    }

    if (!formConsignacao.clienteTelefone.trim()) {
      errors.clienteTelefone = 'Telefone do cliente é obrigatório';
    }

    if (!formConsignacao.vendedorId) {
      errors.vendedorId = 'Vendedor é obrigatório';
    }

    if (!formConsignacao.quantidadeTotal || parseInt(formConsignacao.quantidadeTotal) <= 0) {
      errors.quantidadeTotal = 'Quantidade deve ser maior que zero';
    }

    if (!formConsignacao.valorTotal || parseFloat(formConsignacao.valorTotal) <= 0) {
      errors.valorTotal = 'Valor deve ser maior que zero';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formConsignacao, validarCPF, validarCNPJ]);

  // Salvar consignação
  const salvarConsignacao = useCallback(async () => {
    if (!validarFormulario()) return;

    const vendedor = vendedores.find(v => v.id === parseInt(formConsignacao.vendedorId));
    if (!vendedor) return;

    const novaConsignacao = {
      cliente_nome: formConsignacao.clienteNome,
      cliente_documento: formConsignacao.clienteDocumento,
      cliente_telefone: formConsignacao.clienteTelefone,
      tipo_documento: formConsignacao.tipoDocumento,
      vendedor_id: parseInt(formConsignacao.vendedorId),
      quantidade_total: parseInt(formConsignacao.quantidadeTotal),
      valor_total: parseFloat(formConsignacao.valorTotal),
      status: 'ativa',
      observacoes: formConsignacao.observacoes || null
    };

    const resultado = await adicionarConsignacao(novaConsignacao);
    
    if (resultado.success) {
      mostrarMensagem('success', 'Consignação criada com sucesso!');
      fecharModal();
    } else {
      mostrarMensagem('error', resultado.error || 'Erro ao criar consignação');
    }
  }, [formConsignacao, vendedores, validarFormulario, adicionarConsignacao, mostrarMensagem, fecharModal]);

  return (
    <div className={`min-h-screen ${tema.fundo} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${tema.texto} flex items-center`}>
              <ShoppingCart className="mr-3 h-6 w-6" />
              Consignações
            </h1>
            <p className={`text-sm ${tema.textoSecundario}`}>
              Gerencie as consignações do sistema
            </p>
          </div>
          
          <button
            onClick={abrirModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Consignação
          </button>
        </div>

        {/* Estatísticas */}
        <EstatisticasConsignacoes />

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                Buscar
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tema.textoSecundario} h-4 w-4`} />
                <input
                  type="text"
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  placeholder="Cliente, documento ou vendedor..."
                  className={`w-full pl-10 pr-3 py-2 border rounded-md ${tema.input} ${tema.borda}`}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${tema.input} ${tema.borda}`}
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
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Cliente
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Vendedor
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Quantidade
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Valor Total
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
                  <tr key={consignacao.id} className={`${tema.hover} table-hover-row`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${tema.texto}`}>
                          {consignacao.cliente_nome}
                        </div>
                        <div className={`text-sm ${tema.textoSecundario}`}>
                          {consignacao.cliente_documento}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${tema.texto}`}>
                        {consignacao.vendedor?.nome || 'Vendedor não encontrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${tema.texto}`}>
                        {consignacao.quantidade_total} itens
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${tema.texto}`}>
                        {formatarMoedaBR(consignacao.valor_total)}
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
                        {tipoUsuario === 'admin' && (
                          <button
                            onClick={() => excluirConsignacao(consignacao)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Modal Nova Consignação */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                    Nova Consignação
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome do Cliente */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Nome do Cliente *
                      </label>
                      <input
                        type="text"
                        value={formConsignacao.clienteNome}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, clienteNome: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.clienteNome ? 'border-red-500' : tema.borda}`}
                        placeholder="Nome completo do cliente"
                      />
                      {formErrors.clienteNome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.clienteNome}</p>
                      )}
                    </div>

                    {/* Tipo de Documento */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Tipo de Documento *
                      </label>
                      <select
                        value={formConsignacao.tipoDocumento}
                        onChange={(e) => setFormConsignacao(prev => ({ 
                          ...prev, 
                          tipoDocumento: e.target.value as 'cpf' | 'cnpj',
                          clienteDocumento: ''
                        }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${tema.borda}`}
                      >
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                      </select>
                    </div>

                    {/* Documento */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        {formConsignacao.tipoDocumento.toUpperCase()} *
                      </label>
                      <input
                        type="text"
                        value={formConsignacao.clienteDocumento}
                        onChange={(e) => {
                          const valor = e.target.value;
                          const formatado = formConsignacao.tipoDocumento === 'cpf' 
                            ? formatarCPF(valor) 
                            : formatarCNPJ(valor);
                          setFormConsignacao(prev => ({ ...prev, clienteDocumento: formatado }));
                        }}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.clienteDocumento ? 'border-red-500' : tema.borda}`}
                        placeholder={formConsignacao.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      />
                      {formErrors.clienteDocumento && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.clienteDocumento}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Telefone *
                      </label>
                      <input
                        type="text"
                        value={formConsignacao.clienteTelefone}
                        onChange={(e) => setFormConsignacao(prev => ({ 
                          ...prev, 
                          clienteTelefone: formatarTelefone(e.target.value)
                        }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.clienteTelefone ? 'border-red-500' : tema.borda}`}
                        placeholder="(00) 00000-0000"
                      />
                      {formErrors.clienteTelefone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.clienteTelefone}</p>
                      )}
                    </div>

                    {/* Vendedor */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Vendedor *
                      </label>
                      <select
                        value={formConsignacao.vendedorId}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, vendedorId: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.vendedorId ? 'border-red-500' : tema.borda}`}
                        disabled={tipoUsuario === 'vendedor'}
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

                    {/* Quantidade Total */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Quantidade Total *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formConsignacao.quantidadeTotal}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, quantidadeTotal: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.quantidadeTotal ? 'border-red-500' : tema.borda}`}
                        placeholder="Quantidade de produtos"
                      />
                      {formErrors.quantidadeTotal && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.quantidadeTotal}</p>
                      )}
                    </div>

                    {/* Valor Total */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Valor Total *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formConsignacao.valorTotal}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, valorTotal: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.valorTotal ? 'border-red-500' : tema.borda}`}
                        placeholder="0,00"
                      />
                      {formErrors.valorTotal && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.valorTotal}</p>
                      )}
                    </div>

                    {/* Observações */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Observações
                      </label>
                      <textarea
                        value={formConsignacao.observacoes}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, observacoes: e.target.value }))}
                        rows={3}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${tema.borda}`}
                        placeholder="Observações adicionais..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={fecharModal}
                      className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                    >
                      <X className="mr-2 h-4 w-4 inline" />
                      Cancelar
                    </button>
                    <button
                      onClick={salvarConsignacao}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Criar Consignação
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Conferência de Retorno */}
        {modalRetornoAberto && consignacaoRetorno && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalRetorno}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                    <QrCode className="inline mr-2 h-5 w-5" />
                    Conferência de Retorno - {consignacaoRetorno.cliente_nome}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Resumo da Consignação Original */}
                    <div className={`p-4 border rounded-md ${tema.borda} ${tema.fundo === 'bg-gray-900' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h4 className={`font-medium ${tema.texto} mb-3 flex items-center`}>
                        <Package className="mr-2 h-4 w-4" />
                        Dados da Consignação
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className={`font-medium ${tema.textoSecundario}`}>Cliente:</span>
                          <p className={tema.texto}>{consignacaoRetorno.cliente_nome}</p>
                        </div>
                        <div>
                          <span className={`font-medium ${tema.textoSecundario}`}>Quantidade Total:</span>
                          <p className={tema.texto}>{consignacaoRetorno.quantidade_total} produtos</p>
                        </div>
                        <div>
                          <span className={`font-medium ${tema.textoSecundario}`}>Valor Total:</span>
                          <p className={tema.texto}>{formatarMoedaBR(consignacaoRetorno.valor_total)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Campo de Leitura de Código */}
                    <div className={`p-4 border rounded-md ${tema.borda}`}>
                      <h4 className={`font-medium ${tema.texto} mb-3 flex items-center`}>
                        <Scan className="mr-2 h-4 w-4" />
                        Leitura de Código de Barras
                      </h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={codigoLeitura}
                          onChange={(e) => setCodigoLeitura(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && lerCodigoRetorno()}
                          placeholder="Digite ou escaneie o código de barras"
                          className={`flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                          autoFocus
                        />
                        <button
                          onClick={lerCodigoRetorno}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </button>
                      </div>
                    </div>

                    {/* Produtos Lidos */}
                    {produtosLidos.length > 0 && (
                      <div className={`p-4 border rounded-md ${tema.borda}`}>
                        <h4 className={`font-medium ${tema.texto} mb-3 flex items-center`}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Produtos Retornados ({produtosLidos.reduce((acc, pl) => acc + pl.quantidade, 0)})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {produtosLidos.map((produtoLido, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 ${tema.fundo === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-50'} rounded`}>
                              <div className="flex-1">
                                <p className={`font-medium ${tema.texto}`}>{produtoLido.produto.nome}</p>
                                <p className={`text-sm ${tema.textoSecundario}`}>
                                  Qtd: {produtoLido.quantidade} × {formatarMoedaBR(produtoLido.produto.valorVenda)} = {formatarMoedaBR(produtoLido.quantidade * produtoLido.produto.valorVenda)}
                                </p>
                              </div>
                              <button
                                onClick={() => removerProdutoLido(produtoLido.produto.id)}
                                className="ml-2 text-red-600 hover:text-red-700 p-1"
                                title="Remover produto"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resumo do Retorno */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 border rounded-md ${tema.borda}`}>
                        <h4 className={`font-medium ${tema.texto} mb-2`}>Produtos Retornados</h4>
                        <p className={`text-2xl font-bold ${tema.texto}`}>{retornoForm.quantidadeRetornada}</p>
                        <p className={`text-sm ${tema.textoSecundario}`}>
                          Valor: {formatarMoedaBR(retornoForm.valorRetornado)}
                        </p>
                      </div>
                      
                      <div className={`p-4 border rounded-md ${tema.borda} ${
                        (consignacaoRetorno.valorTotal - retornoForm.valorRetornado) >= 0 
                          ? tema.fundo === 'bg-gray-900' ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'
                          : tema.fundo === 'bg-gray-900' ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="text-center">
                          <p className={`text-sm ${tema.textoSecundario} mb-1`}>Cliente deve pagar:</p>
                          <p className={`text-2xl font-bold ${
                            (consignacaoRetorno.valorTotal - retornoForm.valorRetornado) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formatarMoedaBR(consignacaoRetorno.valorTotal - retornoForm.valorRetornado)}
                          </p>
                          {(consignacaoRetorno.valorTotal - retornoForm.valorRetornado) < 0 && (
                            <p className="text-xs text-red-600 mt-1">Valor negativo - verificar retorno</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={fecharModalRetorno}
                      className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                    >
                      <X className="mr-2 h-4 w-4 inline" />
                      Cancelar
                    </button>
                    <button
                      onClick={abrirModalConfirmacao}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finalizar Consignação
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalhes */}
        {modalDetalhesAberto && consignacaoDetalhes && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalDetalhes}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4 flex items-center`}>
                    <Eye className="mr-2 h-5 w-5" />
                    Detalhes da Consignação
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Informações do Cliente */}
                    <div>
                      <h3 className={`text-lg font-medium ${tema.texto} mb-3 flex items-center`}>
                        <User className="mr-2 h-5 w-5" />
                        Cliente
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Nome:</span>
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.cliente_nome}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>
                            {consignacaoDetalhes.tipo_documento.toUpperCase()}:
                          </span>
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.cliente_documento}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Telefone:</span>
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.cliente_telefone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações da Consignação */}
                    <div>
                      <h3 className={`text-lg font-medium ${tema.texto} mb-3 flex items-center`}>
                        <Package className="mr-2 h-5 w-5" />
                        Consignação
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Vendedor:</span>
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.vendedor?.nome || 'Vendedor não encontrado'}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Data:</span>
                          <p className={`text-sm ${tema.texto}`}>
                            {new Date(consignacaoDetalhes.data_consignacao || consignacaoDetalhes.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Status:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            consignacaoDetalhes.status === 'ativa'
                              ? 'bg-orange-100 text-orange-800'
                              : consignacaoDetalhes.status === 'finalizada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {consignacaoDetalhes.status}
                          </span>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Valor Total:</span>
                          <p className={`text-sm font-bold ${tema.texto}`}>
                            {formatarMoedaBR(consignacaoDetalhes.valor_total)}
                          </p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Quantidade:</span>
                          <p className={`text-sm ${tema.texto}`}>
                            {consignacaoDetalhes.quantidade_total} itens
                          </p>
                        </div>
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

                    {/* Resultado da Consignação */}
                    {consignacaoDetalhes.retorno && consignacaoDetalhes.retorno.length > 0 && (
                      <div>
                        <h3 className={`text-lg font-medium ${tema.texto} mb-3 flex items-center`}>
                          <Calculator className="mr-2 h-5 w-5" />
                          Resultado
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Retornados</p>
                            <p className={`text-xl font-bold ${tema.texto}`}>
                              {consignacaoDetalhes.retorno[0].quantidade_retornada}
                            </p>
                          </div>
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Vendidos</p>
                            <p className={`text-xl font-bold text-green-600`}>
                              {consignacaoDetalhes.retorno[0].quantidade_vendida}
                            </p>
                          </div>
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Valor Retornado</p>
                            <p className={`text-lg font-bold ${tema.texto}`}>
                              {formatarMoedaBR(consignacaoDetalhes.retorno[0].valor_retornado)}
                            </p>
                          </div>
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Valor Devido</p>
                            <p className={`text-lg font-bold ${consignacaoDetalhes.retorno[0].valor_devido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatarMoedaBR(consignacaoDetalhes.retorno[0].valor_devido)}
                            </p>
                          </div>
                        </div>
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
          </div>
        )}

        {/* Modal de Confirmação de Finalização */}
        {modalConfirmacaoAberto && consignacaoRetorno && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalConfirmacao}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                      retornoForm.quantidadeRetornada === 0 
                        ? 'bg-yellow-100' 
                        : 'bg-green-100'
                    } sm:mx-0 sm:h-10 sm:w-10`}>
                      {retornoForm.quantidadeRetornada === 0 ? (
                        <AlertTriangle className={`h-6 w-6 ${
                          retornoForm.quantidadeRetornada === 0 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                        }`} />
                      ) : (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className={`text-lg leading-6 font-medium ${tema.texto}`}>
                        Confirmar Finalização da Consignação
                      </h3>
                      <div className="mt-4">
                        <div className={`${tema.papel} border ${tema.borda} rounded-lg p-4 mb-4`}>
                          <h4 className={`font-medium ${tema.texto} mb-3`}>Resumo da Operação</h4>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className={`font-medium ${tema.textoSecundario}`}>Cliente:</span>
                              <p className={tema.texto}>{consignacaoRetorno.cliente_nome}</p>
                            </div>
                            <div>
                              <span className={`font-medium ${tema.textoSecundario}`}>Vendedor:</span>
                              <p className={tema.texto}>{consignacaoRetorno.vendedor?.nome || 'Vendedor não encontrado'}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className={`text-sm ${tema.textoSecundario}`}>Produtos Consignados</p>
                                <p className={`text-xl font-bold ${tema.texto}`}>
                                  {consignacaoRetorno.quantidade_total}
                                </p>
                                <p className={`text-sm ${tema.textoSecundario}`}>
                                  {formatarMoedaBR(consignacaoRetorno.valor_total)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className={`text-sm ${tema.textoSecundario}`}>Produtos Retornados</p>
                                <p className={`text-xl font-bold ${retornoForm.quantidadeRetornada > 0 ? 'text-blue-600' : tema.texto}`}>
                                  {retornoForm.quantidadeRetornada}
                                </p>
                                <p className={`text-sm ${tema.textoSecundario}`}>
                                  {formatarMoedaBR(retornoForm.valorRetornado)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className={`mt-4 pt-4 border-t border-gray-200 ${
                            (consignacaoRetorno.quantidadeTotal - retornoForm.quantidadeRetornada) > 0 
                              ? 'bg-green-50 border-green-200 p-3 rounded-lg' 
                              : ''
                          }`}>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className={`text-sm ${tema.textoSecundario}`}>Produtos Vendidos</p>
                                <p className={`text-2xl font-bold ${
                                  (consignacaoRetorno.quantidade_total - retornoForm.quantidadeRetornada) > 0 
                                    ? 'text-green-600' 
                                    : tema.texto
                                }`}>
                                  {consignacaoRetorno.quantidade_total - retornoForm.quantidadeRetornada}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className={`text-sm ${tema.textoSecundario}`}>Valor a Receber</p>
                                <p className={`text-2xl font-bold ${
                                  (consignacaoRetorno.valor_total - retornoForm.valorRetornado) > 0 
                                    ? 'text-green-600' 
                                    : (consignacaoRetorno.valor_total - retornoForm.valorRetornado) === 0
                                    ? tema.texto
                                    : 'text-red-600'
                                }`}>
                                  {formatarMoedaBR(consignacaoRetorno.valor_total - retornoForm.valorRetornado)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mensagens baseadas no cenário */}
                        {retornoForm.quantidadeRetornada === 0 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <div className="flex">
                              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-medium text-yellow-800">
                                  Nenhum produto retornado
                                </h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                  Você está finalizando esta consignação sem produtos retornados. 
                                  Isso significa que o cliente vendeu todos os {consignacaoRetorno.quantidade_total} produtos 
                                  e deve pagar {formatarMoedaBR(consignacaoRetorno.valor_total)}.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="flex">
                              <CheckCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-800">
                                  Retorno processado
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  {retornoForm.quantidadeRetornada} produto(s) retornado(s) no valor de {formatarMoedaBR(retornoForm.valorRetornado)}. 
                                  O cliente vendeu {consignacaoRetorno.quantidade_total - retornoForm.quantidadeRetornada} produto(s) 
                                  e deve pagar {formatarMoedaBR(consignacaoRetorno.valor_total - retornoForm.valorRetornado)}.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <p className={`text-sm ${tema.textoSecundario}`}>
                          Ao confirmar, esta consignação será marcada como finalizada e não poderá ser alterada.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={finalizarConsignacao}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Finalização
                    </button>
                    <button
                      onClick={fecharModalConfirmacao}
                      className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm`}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};