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
  FileText
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';
import { Consignacao } from '../../types/Consignacao';
import { Vendedor } from '../../types/Vendedor';
import { Produto } from '../../types/Produto';

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

interface RetornoForm {
  quantidadeRetornada: number;
  valorRetornado: number;
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
  const [consignacaoEditando, setConsignacaoEditando] = useState<Consignacao | null>(null);
  const [consignacaoRetorno, setConsignacaoRetorno] = useState<Consignacao | null>(null);
  const [consignacaoDetalhes, setConsignacaoDetalhes] = useState<Consignacao | null>(null);
  const [consignacaoParaExcluir, setConsignacaoParaExcluir] = useState<Consignacao | null>(null);
  const [salvando, setSalvando] = useState(false);

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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estados para retorno
  const [retornoForm, setRetornoForm] = useState<RetornoForm>({
    quantidadeRetornada: 0,
    valorRetornado: 0
  });
  const [codigoLeitura, setCodigoLeitura] = useState('');
  const [produtosLidos, setProdutosLidos] = useState<{produto: Produto, quantidade: number}[]>([]);

  // Dados Filtrados
  const consignacoesFiltradas = useMemo(() => {
    let resultado = consignacoes;

    // Filtro por vendedor (se for vendedor)
    if (tipoUsuario === 'vendedor') {
      resultado = resultado.filter((c: Consignacao) => c.vendedorId === usuarioLogado?.id);
    }

    // Filtro por status
    if (filtroStatus !== 'todas') {
      resultado = resultado.filter((c: Consignacao) => c.status === filtroStatus);
    }

    // Filtro por busca
    if (buscaTexto.trim()) {
      const busca = buscaTexto.toLowerCase().trim();
      resultado = resultado.filter((c: Consignacao) => 
        c.clienteNome.toLowerCase().includes(busca) ||
        c.clienteDocumento.includes(busca) ||
        c.vendedor.nome.toLowerCase().includes(busca)
      );
    }

    return resultado;
  }, [consignacoes, tipoUsuario, usuarioLogado, filtroStatus, buscaTexto]);

  // Funções de Modal
  const abrirModal = useCallback((consignacao?: Consignacao) => {
    if (consignacao) {
      setConsignacaoEditando(consignacao);
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
      setConsignacaoEditando(null);
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
    }
    setFormErrors({});
    setModalAberto(true);
  }, [tipoUsuario, usuarioLogado]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setConsignacaoEditando(null);
    setSalvando(false);
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
  }, []);

  const abrirModalDetalhes = useCallback((consignacao: Consignacao) => {
    setConsignacaoDetalhes(consignacao);
    setModalDetalhesAberto(true);
  }, []);

  const fecharModalDetalhes = useCallback(() => {
    setModalDetalhesAberto(false);
    setConsignacaoDetalhes(null);
  }, []);

  const abrirModalExclusao = useCallback((consignacao: Consignacao) => {
    setConsignacaoParaExcluir(consignacao);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setConsignacaoParaExcluir(null);
  }, []);

  // Validação do Formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    // Nome do cliente
    if (!formConsignacao.clienteNome.trim()) {
      errors.clienteNome = 'Nome do cliente é obrigatório';
    }

    // Documento
    if (!formConsignacao.clienteDocumento.trim()) {
      errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} é obrigatório`;
    } else {
      const validador = formConsignacao.tipoDocumento === 'cpf' ? validarCPF : validarCNPJ;
      if (!validador(formConsignacao.clienteDocumento)) {
        errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} inválido`;
      }
    }

    // Telefone
    if (!formConsignacao.clienteTelefone.trim()) {
      errors.clienteTelefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formConsignacao.clienteTelefone)) {
      errors.clienteTelefone = 'Telefone inválido';
    }

    // Vendedor
    if (!formConsignacao.vendedorId) {
      errors.vendedorId = 'Vendedor é obrigatório';
    }

    // Quantidade
    const quantidade = parseInt(formConsignacao.quantidadeTotal);
    if (!formConsignacao.quantidadeTotal || isNaN(quantidade) || quantidade <= 0) {
      errors.quantidadeTotal = 'Quantidade deve ser maior que zero';
    }

    // Valor
    const valor = parseFloat(formConsignacao.valorTotal);
    if (!formConsignacao.valorTotal || isNaN(valor) || valor <= 0) {
      errors.valorTotal = 'Valor deve ser maior que zero';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formConsignacao, validarCPF, validarCNPJ, validarTelefone]);

  // Salvar Consignação
  const salvarConsignacao = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    try {
      const vendedor = vendedores.find((v: Vendedor) => v.id === parseInt(formConsignacao.vendedorId));
      if (!vendedor) {
        mostrarMensagem('error', 'Vendedor não encontrado');
        return;
      }

      if (consignacaoEditando) {
        // Atualizar consignação existente
        const consignacaoAtualizada: Consignacao = {
          ...consignacaoEditando,
          clienteNome: formConsignacao.clienteNome.trim(),
          clienteDocumento: formConsignacao.clienteDocumento,
          clienteTelefone: formConsignacao.clienteTelefone,
          tipoDocumento: formConsignacao.tipoDocumento,
          vendedorId: parseInt(formConsignacao.vendedorId),
          vendedor: vendedor,
          quantidadeTotal: parseInt(formConsignacao.quantidadeTotal),
          valorTotal: parseFloat(formConsignacao.valorTotal),
          observacoes: formConsignacao.observacoes.trim() || undefined
        };
        
        setConsignacoes((prev: Consignacao[]) => 
          prev.map(c => c.id === consignacaoEditando.id ? consignacaoAtualizada : c)
        );
        mostrarMensagem('success', 'Consignação atualizada com sucesso!');
      } else {
        // Criar nova consignação
        const novoId = Math.max(...consignacoes.map((c: Consignacao) => c.id), 0) + 1;
        const novaConsignacao: Consignacao = {
          id: novoId,
          clienteNome: formConsignacao.clienteNome.trim(),
          clienteDocumento: formConsignacao.clienteDocumento,
          clienteTelefone: formConsignacao.clienteTelefone,
          tipoDocumento: formConsignacao.tipoDocumento,
          vendedorId: parseInt(formConsignacao.vendedorId),
          vendedor: vendedor,
          quantidadeTotal: parseInt(formConsignacao.quantidadeTotal),
          valorTotal: parseFloat(formConsignacao.valorTotal),
          dataConsignacao: new Date().toISOString().split('T')[0],
          status: 'ativa',
          observacoes: formConsignacao.observacoes.trim() || undefined
        };
        
        setConsignacoes((prev: Consignacao[]) => [...prev, novaConsignacao]);
        mostrarMensagem('success', 'Consignação criada com sucesso!');
      }

      fecharModal();
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar consignação');
    } finally {
      setSalvando(false);
    }
  }, [formConsignacao, consignacaoEditando, vendedores, consignacoes, setConsignacoes, mostrarMensagem, validarFormulario, fecharModal]);

  // Excluir Consignação
  const confirmarExclusao = useCallback(() => {
    if (!consignacaoParaExcluir) return;

    setConsignacoes((prev: Consignacao[]) => 
      prev.filter(c => c.id !== consignacaoParaExcluir.id)
    );
    mostrarMensagem('success', `Consignação de "${consignacaoParaExcluir.clienteNome}" excluída com sucesso!`);
    fecharModalExclusao();
  }, [consignacaoParaExcluir, setConsignacoes, mostrarMensagem, fecharModalExclusao]);

  // Finalizar Consignação com Retorno
  const finalizarConsignacao = useCallback(() => {
    if (!consignacaoRetorno) return;

    const quantidadeVendida = consignacaoRetorno.quantidadeTotal - retornoForm.quantidadeRetornada;
    const valorDevido = consignacaoRetorno.valorTotal - retornoForm.valorRetornado;

    const consignacaoFinalizada: Consignacao = {
      ...consignacaoRetorno,
      status: 'finalizada',
      dataRetorno: new Date().toISOString().split('T')[0],
      retorno: {
        quantidadeRetornada: retornoForm.quantidadeRetornada,
        valorRetornado: retornoForm.valorRetornado,
        quantidadeVendida: quantidadeVendida,
        valorDevido: valorDevido
      }
    };

    setConsignacoes((prev: Consignacao[]) => 
      prev.map(c => c.id === consignacaoRetorno.id ? consignacaoFinalizada : c)
    );
    
    mostrarMensagem('success', 'Consignação finalizada com sucesso!');
    fecharModalRetorno();
  }, [consignacaoRetorno, retornoForm, setConsignacoes, mostrarMensagem, fecharModalRetorno]);

  // Formatação de documento
  const formatarDocumento = useCallback((valor: string, tipo: 'cpf' | 'cnpj') => {
    return tipo === 'cpf' ? formatarCPF(valor) : formatarCNPJ(valor);
  }, [formatarCPF, formatarCNPJ]);

  // Ler código de barras
  const lerCodigoBarras = useCallback(() => {
    if (!codigoLeitura.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    const produto = produtos.find((p: Produto) => p.codigoBarras === codigoLeitura.trim() && p.ativo);
    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado ou inativo');
      setCodigoLeitura('');
      return;
    }

    // Verificar se produto já foi lido
    const produtoJaLido = produtosLidos.find(pl => pl.produto.id === produto.id);
    if (produtoJaLido) {
      // Incrementar quantidade
      setProdutosLidos(prev => 
        prev.map(pl => 
          pl.produto.id === produto.id 
            ? { ...pl, quantidade: pl.quantidade + 1 }
            : pl
        )
      );
    } else {
      // Adicionar novo produto
      setProdutosLidos(prev => [...prev, { produto, quantidade: 1 }]);
    }

    setCodigoLeitura('');
    mostrarMensagem('success', `Produto "${produto.nome}" adicionado!`);
  }, [codigoLeitura, produtos, produtosLidos, mostrarMensagem]);

  // Remover produto lido
  const removerProdutoLido = useCallback((produtoId: number) => {
    setProdutosLidos(prev => prev.filter(pl => pl.produto.id !== produtoId));
    mostrarMensagem('success', 'Produto removido do retorno!');
  }, [mostrarMensagem]);

  // Calcular totais do retorno
  const totaisRetorno = useMemo(() => {
    const quantidadeRetornada = produtosLidos.reduce((total, pl) => total + pl.quantidade, 0);
    const valorRetornado = produtosLidos.reduce((total, pl) => total + (pl.produto.valorVenda * pl.quantidade), 0);
    
    return { quantidadeRetornada, valorRetornado };
  }, [produtosLidos]);

  // Atualizar form de retorno quando produtos lidos mudarem
  useEffect(() => {
    setRetornoForm(totaisRetorno);
  }, [totaisRetorno]);

  // Render
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>Consignações</h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie as consignações de produtos
            </p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Consignação
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar consignações..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
              />
            </div>
            
            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todas">Todas as consignações</option>
              <option value="ativa">Apenas Ativas</option>
              <option value="finalizada">Apenas Finalizadas</option>
              <option value="cancelada">Apenas Canceladas</option>
            </select>
            
            {/* Contador */}
            <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
              <span className="font-semibold">{consignacoesFiltradas.length}</span>
              <span className="mx-1">de</span>
              <span className="font-semibold">{consignacoes.length}</span>
            </div>
          </div>
        </div>

        {/* Lista de Consignações */}
        <div className="space-y-4">
          {consignacoesFiltradas.map((consignacao: Consignacao) => (
            <div key={consignacao.id} className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda} hover:shadow-md transition-shadow`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg mr-3 ${
                      consignacao.status === 'ativa' 
                        ? 'bg-green-100' 
                        : consignacao.status === 'finalizada'
                        ? 'bg-blue-100'
                        : 'bg-red-100'
                    }`}>
                      {consignacao.status === 'ativa' ? (
                        <Clock className={`h-5 w-5 ${
                          consignacao.status === 'ativa' 
                            ? 'text-green-600' 
                            : consignacao.status === 'finalizada'
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`} />
                      ) : consignacao.status === 'finalizada' ? (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${tema.texto}`}>
                        {consignacao.clienteNome}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consignacao.status === 'ativa' 
                          ? 'bg-green-100 text-green-800' 
                          : consignacao.status === 'finalizada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consignacao.status.charAt(0).toUpperCase() + consignacao.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Informações do Cliente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <User className={`h-4 w-4 mr-2 ${tema.textoSecundario}`} />
                      <div>
                        <p className={`font-medium ${tema.textoSecundario}`}>Documento</p>
                        <p className={tema.texto}>{consignacao.clienteDocumento}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className={`h-4 w-4 mr-2 ${tema.textoSecundario}`} />
                      <div>
                        <p className={`font-medium ${tema.textoSecundario}`}>Telefone</p>
                        <p className={tema.texto}>{consignacao.clienteTelefone}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className={`h-4 w-4 mr-2 ${tema.textoSecundario}`} />
                      <div>
                        <p className={`font-medium ${tema.textoSecundario}`}>Vendedor</p>
                        <p className={tema.texto}>{consignacao.vendedor.nome}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className={`h-4 w-4 mr-2 ${tema.textoSecundario}`} />
                      <div>
                        <p className={`font-medium ${tema.textoSecundario}`}>Data</p>
                        <p className={tema.texto}>
                          {new Date(consignacao.dataConsignacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Package className={`h-5 w-5 mr-2 ${tema.textoSecundario}`} />
                      <div>
                        <p className={`text-sm font-medium ${tema.textoSecundario}`}>Quantidade</p>
                        <p className={`font-semibold ${tema.texto}`}>{consignacao.quantidadeTotal} itens</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calculator className={`h-5 w-5 mr-2 ${tema.textoSecundario}`} />
                      <div>
                        <p className={`text-sm font-medium ${tema.textoSecundario}`}>Valor Total</p>
                        <p className={`font-semibold ${tema.texto}`}>{formatarMoedaBR(consignacao.valorTotal)}</p>
                      </div>
                    </div>
                    {consignacao.retorno && (
                      <div className="flex items-center">
                        <Calculator className={`h-5 w-5 mr-2 ${tema.textoSecundario}`} />
                        <div>
                          <p className={`text-sm font-medium ${tema.textoSecundario}`}>Valor Devido</p>
                          <p className={`font-semibold ${consignacao.retorno.valorDevido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatarMoedaBR(consignacao.retorno.valorDevido)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Retorno (se finalizada) */}
                  {consignacao.retorno && (
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Informações do Retorno</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Devolvidos:</span>
                          <p>{consignacao.retorno.quantidadeRetornada} itens</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Vendidos:</span>
                          <p>{consignacao.retorno.quantidadeVendida} itens</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Valor Devolvido:</span>
                          <p>{formatarMoedaBR(consignacao.retorno.valorRetornado)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Valor Devido:</span>
                          <p className={`font-medium ${consignacao.retorno.valorDevido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatarMoedaBR(consignacao.retorno.valorDevido)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {consignacao.observacoes && (
                    <div className="flex items-start">
                      <FileText className={`h-4 w-4 mr-2 mt-1 ${tema.textoSecundario}`} />
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Observações:</span>
                        <p className={`text-sm ${tema.texto}`}>{consignacao.observacoes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Ações */}
                <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                  {consignacao.status === 'ativa' && (
                    <button
                      onClick={() => abrirModalRetorno(consignacao)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Conferir Retorno
                    </button>
                  )}
                  
                  <button
                    onClick={() => abrirModalDetalhes(consignacao)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </button>

                  {tipoUsuario === 'admin' && (
                    <button
                      onClick={() => abrirModalExclusao(consignacao)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado Vazio */}
        {consignacoesFiltradas.length === 0 && (
          <div className={`${tema.papel} border ${tema.borda} rounded-lg p-12 text-center`}>
            <ShoppingCart className={`mx-auto h-12 w-12 ${tema.textoSecundario} mb-4`} />
            <h3 className={`text-lg font-medium ${tema.texto} mb-2`}>
              Nenhuma consignação encontrada
            </h3>
            <p className={`text-sm ${tema.textoSecundario} mb-4`}>
              {buscaTexto || filtroStatus !== 'todas'
                ? 'Tente ajustar os filtros para encontrar consignações.'
                : 'Comece criando sua primeira consignação.'
              }
            </p>
            {(!buscaTexto && filtroStatus === 'todas') && (
              <button
                onClick={() => abrirModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Criar Primeira Consignação
              </button>
            )}
          </div>
        )}

        {/* Modal de Nova Consignação */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                onClick={() => !salvando && fecharModal()}
              />
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-6`}>
                    {consignacaoEditando ? 'Editar Consignação' : 'Nova Consignação'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome do Cliente */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Nome do Cliente <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formConsignacao.clienteNome}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, clienteNome: e.target.value }))}
                        disabled={salvando}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.clienteNome ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Digite o nome do cliente"
                      />
                      {formErrors.clienteNome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.clienteNome}</p>
                      )}
                    </div>

                    {/* Tipo de Documento */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                        Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="cpf"
                            checked={formConsignacao.tipoDocumento === 'cpf'}
                            onChange={() => {
                              setFormConsignacao(prev => ({ 
                                ...prev, 
                                tipoDocumento: 'cpf',
                                clienteDocumento: ''
                              }));
                            }}
                            disabled={salvando}
                            className="mr-2"
                          />
                          <span className={tema.texto}>CPF</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="cnpj"
                            checked={formConsignacao.tipoDocumento === 'cnpj'}
                            onChange={() => {
                              setFormConsignacao(prev => ({ 
                                ...prev, 
                                tipoDocumento: 'cnpj',
                                clienteDocumento: ''
                              }));
                            }}
                            disabled={salvando}
                            className="mr-2"
                          />
                          <span className={tema.texto}>CNPJ</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Documento e Telefone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          {formConsignacao.tipoDocumento.toUpperCase()} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formConsignacao.clienteDocumento}
                          onChange={(e) => setFormConsignacao(prev => ({ 
                            ...prev, 
                            clienteDocumento: formatarDocumento(e.target.value, formConsignacao.tipoDocumento) 
                          }))}
                          disabled={salvando}
                          maxLength={formConsignacao.tipoDocumento === 'cpf' ? 14 : 18}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.clienteDocumento ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder={formConsignacao.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                        />
                        {formErrors.clienteDocumento && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.clienteDocumento}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Telefone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formConsignacao.clienteTelefone}
                          onChange={(e) => setFormConsignacao(prev => ({ 
                            ...prev, 
                            clienteTelefone: formatarTelefone(e.target.value) 
                          }))}
                          disabled={salvando}
                          maxLength={15}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.clienteTelefone ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="(11) 99999-9999"
                        />
                        {formErrors.clienteTelefone && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.clienteTelefone}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Vendedor (apenas para admin) */}
                    {tipoUsuario === 'admin' && (
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Vendedor <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formConsignacao.vendedorId}
                          onChange={(e) => setFormConsignacao(prev => ({ ...prev, vendedorId: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.vendedorId ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Selecione um vendedor</option>
                          {vendedores.filter((v: Vendedor) => v.status === 'Ativo').map((vendedor: Vendedor) => (
                            <option key={vendedor.id} value={vendedor.id}>{vendedor.nome}</option>
                          ))}
                        </select>
                        {formErrors.vendedorId && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.vendedorId}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Quantidade e Valor */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Quantidade Total <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formConsignacao.quantidadeTotal}
                          onChange={(e) => setFormConsignacao(prev => ({ ...prev, quantidadeTotal: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.quantidadeTotal ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="0"
                        />
                        {formErrors.quantidadeTotal && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.quantidadeTotal}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Valor Total <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formConsignacao.valorTotal}
                          onChange={(e) => setFormConsignacao(prev => ({ ...prev, valorTotal: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.valorTotal ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="0.00"
                        />
                        {formErrors.valorTotal && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.valorTotal}</p>
                        )}
                      </div>
                    </div>
                    
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Observações adicionais..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className={`${tema.papel} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                  <button
                    onClick={salvarConsignacao}
                    disabled={salvando}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={fecharModal}
                    disabled={salvando}
                    className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Retorno */}
        {modalRetornoAberto && consignacaoRetorno && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalRetorno} />
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-6`}>
                    Conferir Retorno - {consignacaoRetorno.clienteNome}
                  </h3>
                  
                  {/* Leitor de Código de Barras */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-3">Leitura de Código de Barras</h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={codigoLeitura}
                        onChange={(e) => setCodigoLeitura(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && lerCodigoBarras()}
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite ou escaneie o código de barras"
                      />
                      <button
                        onClick={lerCodigoBarras}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Ler
                      </button>
                    </div>
                  </div>

                  {/* Produtos Lidos */}
                  {produtosLidos.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">Produtos Retornados</h4>
                      <div className="space-y-2">
                        {produtosLidos.map((pl, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{pl.produto.nome}</p>
                              <p className="text-sm text-gray-600">
                                {pl.quantidade}x {formatarMoedaBR(pl.produto.valorVenda)} = {formatarMoedaBR(pl.produto.valorVenda * pl.quantidade)}
                              </p>
                            </div>
                            <button
                              onClick={() => removerProdutoLido(pl.produto.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resumo */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Consignação Original</h4>
                      <p>Quantidade: {consignacaoRetorno.quantidadeTotal} itens</p>
                      <p>Valor: {formatarMoedaBR(consignacaoRetorno.valorTotal)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-700 mb-2">Retorno Atual</h4>
                      <p>Devolvidos: {totaisRetorno.quantidadeRetornada} itens</p>
                      <p>Vendidos: {consignacaoRetorno.quantidadeTotal - totaisRetorno.quantidadeRetornada} itens</p>
                      <p>Valor Devido: <span className="font-semibold">{formatarMoedaBR(consignacaoRetorno.valorTotal - totaisRetorno.valorRetornado)}</span></p>
                    </div>
                  </div>
                </div>
                
                <div className={`${tema.papel} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                  <button
                    onClick={finalizarConsignacao}
                    disabled={produtosLidos.length === 0}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors ${produtosLidos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Finalizar Consignação
                  </button>
                  <button
                    onClick={fecharModalRetorno}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes */}
        {modalDetalhesAberto && consignacaoDetalhes && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalDetalhes} />
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-6`}>
                    Detalhes da Consignação
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Cliente</label>
                        <p className={tema.texto}>{consignacaoDetalhes.clienteNome}</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          consignacaoDetalhes.status === 'ativa' 
                            ? 'bg-green-100 text-green-800' 
                            : consignacaoDetalhes.status === 'finalizada'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {consignacaoDetalhes.status.charAt(0).toUpperCase() + consignacaoDetalhes.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Documento</label>
                        <p className={tema.texto}>{consignacaoDetalhes.clienteDocumento}</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Telefone</label>
                        <p className={tema.texto}>{consignacaoDetalhes.clienteTelefone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Vendedor</label>
                        <p className={tema.texto}>{consignacaoDetalhes.vendedor.nome}</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Data</label>
                        <p className={tema.texto}>
                          {new Date(consignacaoDetalhes.dataConsignacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Quantidade</label>
                        <p className={tema.texto}>{consignacaoDetalhes.quantidadeTotal} itens</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Valor Total</label>
                        <p className={tema.texto}>{formatarMoedaBR(consignacaoDetalhes.valorTotal)}</p>
                      </div>
                    </div>

                    {consignacaoDetalhes.retorno && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-3">Informações do Retorno</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium text-gray-600`}>Quantidade Devolvida</label>
                            <p>{consignacaoDetalhes.retorno.quantidadeRetornada} itens</p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium text-gray-600`}>Quantidade Vendida</label>
                            <p>{consignacaoDetalhes.retorno.quantidadeVendida} itens</p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium text-gray-600`}>Valor Devolvido</label>
                            <p>{formatarMoedaBR(consignacaoDetalhes.retorno.valorRetornado)}</p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium text-gray-600`}>Valor Devido</label>
                            <p className={`font-medium ${consignacaoDetalhes.retorno.valorDevido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatarMoedaBR(consignacaoDetalhes.retorno.valorDevido)}
                            </p>
                          </div>
                        </div>
                        {consignacaoDetalhes.dataRetorno && (
                          <div className="mt-3">
                            <label className={`block text-sm font-medium text-gray-600`}>Data do Retorno</label>
                            <p>{new Date(consignacaoDetalhes.dataRetorno).toLocaleDateString('pt-BR')}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {consignacaoDetalhes.observacoes && (
                      <div>
                        <label className={`block text-sm font-medium ${tema.textoSecundario}`}>Observações</label>
                        <p className={tema.texto}>{consignacaoDetalhes.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`${tema.papel} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                  <button
                    onClick={fecharModalDetalhes}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && consignacaoParaExcluir && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalExclusao} />
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className={`text-lg leading-6 font-medium ${tema.texto}`}>
                        Confirmar Exclusão
                      </h3>
                      <div className="mt-2">
                        <p className={`text-sm ${tema.textoSecundario}`}>
                          Tem certeza que deseja excluir a consignação de <strong>"{consignacaoParaExcluir.clienteNome}"</strong>? 
                          Esta ação não pode ser desfeita.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`${tema.papel} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                  <button
                    onClick={confirmarExclusao}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={fecharModalExclusao}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancelar
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