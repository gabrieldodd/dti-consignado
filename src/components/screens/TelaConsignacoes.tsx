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
    quantidadeRetornada: number;
    valorRetornado: number;
    quantidadeVendida: number;
    valorDevido: number;
  };
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
    const valorTotal = consignacoes.reduce((acc, c) => acc + c.valorTotal, 0);
    
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
    setConsignacoes,
    produtos,
    vendedores,
    mostrarMensagem,
    cookies,
    usuarioLogado,
    tipoUsuario
  } = useAppContext();
  
  const { formatarMoedaBR, formatarCPF, formatarCNPJ, formatarTelefone } = useFormatters();
  const { validarCPF, validarCNPJ } = useValidation();

  // Estados
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRetornoAberto, setModalRetornoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
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
  const [produtosConsignacao, setProdutosConsignacao] = useState<ProdutoConsignacao[]>([]);

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusConsignacoes', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Filtrar consignações
  const consignacoesFiltradas = useMemo(() => {
    let resultado = consignacoes;

    if (tipoUsuario === 'vendedor') {
      resultado = resultado.filter(c => c.vendedorId === usuarioLogado.id);
    }

    if (filtroStatus !== 'todas') {
      resultado = resultado.filter(c => c.status === filtroStatus);
    }

    if (buscaTexto) {
      resultado = resultado.filter(c => 
        c.clienteNome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.clienteDocumento.includes(buscaTexto) ||
        c.vendedor.nome.toLowerCase().includes(buscaTexto.toLowerCase())
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

  // Funções do modal de retorno
  const lerCodigoRetorno = useCallback(() => {
    if (!codigoLeitura.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    const produto = produtos.find(p => p.codigoBarras === codigoLeitura.trim() && p.ativo);
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
    const novoValor = retornoForm.valorRetornado + produto.valorVenda;

    setRetornoForm({
      quantidadeRetornada: novaQuantidade,
      valorRetornado: novoValor
    });

    setCodigoLeitura('');
    mostrarMensagem('success', `${produto.nome} adicionado! Valor: ${formatarMoedaBR(produto.valorVenda)}`);
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

  const finalizarConsignacao = useCallback(() => {
    if (!consignacaoRetorno) return;

    const quantidadeRetornada = retornoForm.quantidadeRetornada;
    const valorRetornado = retornoForm.valorRetornado;
    const quantidadeVendida = consignacaoRetorno.quantidadeTotal - quantidadeRetornada;
    const valorDevido = consignacaoRetorno.valorTotal - valorRetornado;
    
    const consignacaoAtualizada: Consignacao = {
      ...consignacaoRetorno,
      status: 'finalizada',
      dataRetorno: new Date().toISOString().split('T')[0],
      retorno: {
        quantidadeRetornada,
        valorRetornado,
        quantidadeVendida,
        valorDevido
      }
    };

    setConsignacoes(prev => prev.map(c => 
      c.id === consignacaoRetorno.id ? consignacaoAtualizada : c
    ));

    mostrarMensagem('success', 'Consignação finalizada com sucesso!');
    fecharModalRetorno();
  }, [consignacaoRetorno, retornoForm, setConsignacoes, mostrarMensagem, fecharModalRetorno]);

  // Função para excluir consignação
  const excluirConsignacao = useCallback((consignacao: Consignacao) => {
    if (confirm(`Confirma a exclusão da consignação de "${consignacao.clienteNome}"?`)) {
      setConsignacoes(prev => prev.filter(c => c.id !== consignacao.id));
      mostrarMensagem('success', 'Consignação excluída com sucesso!');
    }
  }, [setConsignacoes, mostrarMensagem]);

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
  const salvarConsignacao = useCallback(() => {
    if (!validarFormulario()) return;

    const vendedor = vendedores.find(v => v.id === parseInt(formConsignacao.vendedorId));
    if (!vendedor) return;

    const novaConsignacao: Consignacao = {
      id: Date.now(),
      clienteNome: formConsignacao.clienteNome,
      clienteDocumento: formConsignacao.clienteDocumento,
      clienteTelefone: formConsignacao.clienteTelefone,
      tipoDocumento: formConsignacao.tipoDocumento,
      vendedorId: parseInt(formConsignacao.vendedorId),
      vendedor,
      quantidadeTotal: parseInt(formConsignacao.quantidadeTotal),
      valorTotal: parseFloat(formConsignacao.valorTotal),
      dataConsignacao: new Date().toISOString().split('T')[0],
      status: 'ativa',
      observacoes: formConsignacao.observacoes || undefined,
      produtos: produtosConsignacao
    };

    setConsignacoes(prev => [...prev, novaConsignacao]);
    mostrarMensagem('success', 'Consignação criada com sucesso!');
    fecharModal();
  }, [formConsignacao, vendedores, produtosConsignacao, validarFormulario, setConsignacoes, mostrarMensagem, fecharModal]);

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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                  <tr key={consignacao.id} className={tema.hover}>
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
                      <div className={`text-sm ${tema.texto}`}>
                        {consignacao.quantidadeTotal} itens
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
                    Conferência de Retorno - {consignacaoRetorno.clienteNome}
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
                          <p className={tema.texto}>{consignacaoRetorno.clienteNome}</p>
                        </div>
                        <div>
                          <span className={`font-medium ${tema.textoSecundario}`}>Quantidade Total:</span>
                          <p className={tema.texto}>{consignacaoRetorno.quantidadeTotal} produtos</p>
                        </div>
                        <div>
                          <span className={`font-medium ${tema.textoSecundario}`}>Valor Total:</span>
                          <p className={tema.texto}>{formatarMoedaBR(consignacaoRetorno.valorTotal)}</p>
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
                      onClick={finalizarConsignacao}
                      disabled={retornoForm.quantidadeRetornada === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.clienteNome}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>
                            {consignacaoDetalhes.tipoDocumento.toUpperCase()}:
                          </span>
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.clienteDocumento}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Telefone:</span>
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.clienteTelefone}</p>
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
                          <p className={`text-sm ${tema.texto}`}>{consignacaoDetalhes.vendedor.nome}</p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Data:</span>
                          <p className={`text-sm ${tema.texto}`}>
                            {new Date(consignacaoDetalhes.dataConsignacao).toLocaleDateString('pt-BR')}
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
                            {formatarMoedaBR(consignacaoDetalhes.valorTotal)}
                          </p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${tema.textoSecundario}`}>Quantidade:</span>
                          <p className={`text-sm ${tema.texto}`}>
                            {consignacaoDetalhes.quantidadeTotal} itens
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
                    {consignacaoDetalhes.retorno && (
                      <div>
                        <h3 className={`text-lg font-medium ${tema.texto} mb-3 flex items-center`}>
                          <Calculator className="mr-2 h-5 w-5" />
                          Resultado
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Retornados</p>
                            <p className={`text-xl font-bold ${tema.texto}`}>
                              {consignacaoDetalhes.retorno.quantidadeRetornada}
                            </p>
                          </div>
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Vendidos</p>
                            <p className={`text-xl font-bold text-green-600`}>
                              {consignacaoDetalhes.retorno.quantidadeVendida}
                            </p>
                          </div>
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Valor Retornado</p>
                            <p className={`text-lg font-bold ${tema.texto}`}>
                              {formatarMoedaBR(consignacaoDetalhes.retorno.valorRetornado)}
                            </p>
                          </div>
                          <div className={`${tema.papel} p-3 rounded-lg border ${tema.borda} text-center`}>
                            <p className={`text-sm ${tema.textoSecundario}`}>Valor Devido</p>
                            <p className={`text-lg font-bold ${consignacaoDetalhes.retorno.valorDevido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatarMoedaBR(consignacaoDetalhes.retorno.valorDevido)}
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
      </div>
    </div>
  );
};