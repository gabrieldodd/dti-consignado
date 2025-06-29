// src/components/screens/TelaProdutos.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Save,
  AlertTriangle,
  Hash,
  DollarSign,
  Package2,
  Filter,
  BarChart3
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

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

interface ProdutoForm {
  nome: string;
  descricao: string;
  codigoBarras: string;
  categoria: string;
  valorCusto: string;
  valorVenda: string;
  estoque: string;
  estoqueMinimo: string;
  ativo: boolean;
}

const FORM_INICIAL: ProdutoForm = {
  nome: '',
  descricao: '',
  codigoBarras: '',
  categoria: '',
  valorCusto: '0,00',
  valorVenda: '0,00',
  estoque: '0',
  estoqueMinimo: '1',
  ativo: true
};

export const TelaProdutos: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    produtos, 
    setProdutos,
    categorias,
    mostrarMensagem,
    cookies 
  } = useAppContext();
  
  const { formatarMoeda, formatarNumero, limparFormatacao } = useFormatters();
  const { validarObrigatorio, validarNumeroPositivo, validarCodigoBarras } = useValidation();

  // Estados Locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);
  const [produtoDetalhes, setProdutoDetalhes] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<ProdutoForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  // Filtros e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(() => {
    return cookies.getCookie('filtroCategoriaProdutos') || 'todas';
  });
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusProdutos') || 'todos';
  });
  const [filtroEstoque, setFiltroEstoque] = useState(() => {
    return cookies.getCookie('filtroEstoqueProdutos') || 'todos';
  });

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroCategoriaProdutos', filtroCategoria, 30);
    cookies.setCookie('filtroStatusProdutos', filtroStatus, 30);
    cookies.setCookie('filtroEstoqueProdutos', filtroEstoque, 30);
  }, [filtroCategoria, filtroStatus, filtroEstoque, cookies]);

  // Função para formatar entrada de moeda
  const formatarMoedaInput = useCallback((valor: string): string => {
    const numeros = limparFormatacao(valor);
    const valorNumerico = parseFloat(numeros) / 100 || 0;
    return valorNumerico.toFixed(2).replace('.', ',');
  }, [limparFormatacao]);

  // Dados filtrados e estatísticas
  const { produtosFiltrados, estatisticas } = useMemo(() => {
    let filtrados = produtos.filter(produto => {
      // Filtro de busca
      const matchBusca = !buscaTexto || 
        produto.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        produto.codigoBarras.includes(buscaTexto) ||
        produto.categoria.toLowerCase().includes(buscaTexto.toLowerCase());
      
      // Filtro de categoria
      const matchCategoria = filtroCategoria === 'todas' || 
        produto.categoria === filtroCategoria;
      
      // Filtro de status
      const matchStatus = filtroStatus === 'todos' || 
        (filtroStatus === 'ativo' && produto.ativo) ||
        (filtroStatus === 'inativo' && !produto.ativo);
      
      // Filtro de estoque
      const matchEstoque = filtroEstoque === 'todos' ||
        (filtroEstoque === 'baixo' && produto.estoque <= produto.estoqueMinimo) ||
        (filtroEstoque === 'normal' && produto.estoque > produto.estoqueMinimo);
      
      return matchBusca && matchCategoria && matchStatus && matchEstoque;
    });

    // Calcular estatísticas
    const stats = {
      total: produtos.length,
      ativos: produtos.filter(p => p.ativo).length,
      inativos: produtos.filter(p => !p.ativo).length,
      estoqueBaixo: produtos.filter(p => p.estoque <= p.estoqueMinimo).length,
      valorTotalEstoque: produtos.reduce((acc, p) => acc + (p.valorCusto * p.estoque), 0),
      valorTotalVenda: produtos.reduce((acc, p) => acc + (p.valorVenda * p.estoque), 0)
    };

    return { produtosFiltrados: filtrados, estatisticas: stats };
  }, [produtos, buscaTexto, filtroCategoria, filtroStatus, filtroEstoque]);

  // Validar formulário
  const validarFormulario = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!validarObrigatorio(formData.nome)) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!validarObrigatorio(formData.categoria)) {
      errors.categoria = 'Categoria é obrigatória';
    }

    if (formData.codigoBarras && !validarCodigoBarras(formData.codigoBarras)) {
      errors.codigoBarras = 'Código de barras inválido';
    }

    const valorCusto = parseFloat(formData.valorCusto.replace(',', '.')) || 0;
    if (!validarNumeroPositivo(valorCusto)) {
      errors.valorCusto = 'Valor de custo deve ser maior que zero';
    }

    const valorVenda = parseFloat(formData.valorVenda.replace(',', '.')) || 0;
    if (!validarNumeroPositivo(valorVenda)) {
      errors.valorVenda = 'Valor de venda deve ser maior que zero';
    }

    if (valorVenda <= valorCusto) {
      errors.valorVenda = 'Valor de venda deve ser maior que o custo';
    }

    const estoque = parseInt(formData.estoque) || 0;
    if (estoque < 0) {
      errors.estoque = 'Estoque não pode ser negativo';
    }

    const estoqueMinimo = parseInt(formData.estoqueMinimo) || 0;
    if (estoqueMinimo < 0) {
      errors.estoqueMinimo = 'Estoque mínimo não pode ser negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validarObrigatorio, validarNumeroPositivo, validarCodigoBarras]);

  // Funções de CRUD
  const abrirModal = useCallback((produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto);
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao,
        codigoBarras: produto.codigoBarras,
        categoria: produto.categoria,
        valorCusto: produto.valorCusto.toFixed(2).replace('.', ','),
        valorVenda: produto.valorVenda.toFixed(2).replace('.', ','),
        estoque: produto.estoque.toString(),
        estoqueMinimo: produto.estoqueMinimo.toString(),
        ativo: produto.ativo
      });
    } else {
      setProdutoEditando(null);
      setFormData(FORM_INICIAL);
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setProdutoEditando(null);
    setFormData(FORM_INICIAL);
    setFormErrors({});
  }, []);

  const salvarProduto = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    try {
      const produtoData: Omit<Produto, 'id' | 'dataCadastro'> = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        codigoBarras: formData.codigoBarras.trim(),
        categoria: formData.categoria,
        valorCusto: parseFloat(formData.valorCusto.replace(',', '.')),
        valorVenda: parseFloat(formData.valorVenda.replace(',', '.')),
        estoque: parseInt(formData.estoque),
        estoqueMinimo: parseInt(formData.estoqueMinimo),
        ativo: formData.ativo
      };

      if (produtoEditando) {
        // Editar produto existente
        setProdutos(prev => prev.map(produto => 
          produto.id === produtoEditando.id 
            ? { ...produto, ...produtoData }
            : produto
        ));
        mostrarMensagem('success', 'Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        const novoProduto: Produto = {
          ...produtoData,
          id: Math.max(...produtos.map(p => p.id), 0) + 1,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setProdutos(prev => [...prev, novoProduto]);
        mostrarMensagem('success', 'Produto criado com sucesso!');
      }

      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      mostrarMensagem('error', 'Erro ao salvar produto');
    } finally {
      setSalvando(false);
    }
  }, [formData, produtoEditando, produtos, validarFormulario, setProdutos, mostrarMensagem, fecharModal]);

  const confirmarExclusao = useCallback((produto: Produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusaoAberto(true);
  }, []);

  const excluirProduto = useCallback(() => {
    if (!produtoParaExcluir) return;

    setProdutos(prev => prev.filter(produto => produto.id !== produtoParaExcluir.id));
    mostrarMensagem('success', 'Produto excluído com sucesso!');
    setModalExclusaoAberto(false);
    setProdutoParaExcluir(null);
  }, [produtoParaExcluir, setProdutos, mostrarMensagem]);

  const alternarStatus = useCallback((produto: Produto) => {
    setProdutos(prev => prev.map(p => 
      p.id === produto.id 
        ? { ...p, ativo: !p.ativo }
        : p
    ));
    const novoStatus = produto.ativo ? 'desativado' : 'ativado';
    mostrarMensagem('success', `Produto ${novoStatus} com sucesso!`);
  }, [setProdutos, mostrarMensagem]);

  const verDetalhes = useCallback((produto: Produto) => {
    setProdutoDetalhes(produto);
    setModalDetalhesAberto(true);
  }, []);

  const calcularMargem = useCallback((custo: number, venda: number): number => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo) * 100;
  }, []);

  // Categorias disponíveis
  const categoriasDisponiveis = useMemo(() => {
    return categorias.filter(cat => cat.ativa).map(cat => cat.nome);
  }, [categorias]);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h1 className={`text-3xl font-bold ${tema.texto} mb-2`}>
            Produtos
          </h1>
          <p className={`${tema.textoSecundario}`}>
            Gerencie o catálogo de produtos da loja
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Total</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>
                {formatarNumero(estatisticas.total)}
              </p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Ativos</p>
              <p className={`text-2xl font-bold text-green-600`}>
                {formatarNumero(estatisticas.ativos)}
              </p>
            </div>
            <Package2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Inativos</p>
              <p className={`text-2xl font-bold text-red-600`}>
                {formatarNumero(estatisticas.inativos)}
              </p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Estoque Baixo</p>
              <p className={`text-2xl font-bold text-yellow-600`}>
                {formatarNumero(estatisticas.estoqueBaixo)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Valor Custo</p>
              <p className={`text-xl font-bold ${tema.texto}`}>
                {formatarMoeda(estatisticas.valorTotalEstoque)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Valor Venda</p>
              <p className={`text-xl font-bold text-green-600`}>
                {formatarMoeda(estatisticas.valorTotalVenda)}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, código ou categoria..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
              />
            </div>
          </div>

          {/* Filtro Categoria */}
          <div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todas">Todas as categorias</option>
              {categoriasDisponiveis.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Filtro Status */}
          <div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Apenas ativos</option>
              <option value="inativo">Apenas inativos</option>
            </select>
          </div>

          {/* Filtro Estoque */}
          <div>
            <select
              value={filtroEstoque}
              onChange={(e) => setFiltroEstoque(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todos">Todo estoque</option>
              <option value="baixo">Estoque baixo</option>
              <option value="normal">Estoque normal</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm ${tema.textoSecundario}`}>
            {produtosFiltrados.length} de {produtos.length} produtos
          </span>
          {(buscaTexto || filtroCategoria !== 'todas' || filtroStatus !== 'todos' || filtroEstoque !== 'todos') && (
            <button
              onClick={() => {
                setBuscaTexto('');
                setFiltroCategoria('todas');
                setFiltroStatus('todos');
                setFiltroEstoque('todos');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        {/* Desktop: Tabela */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={tema.fundo}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Produto
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Categoria
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Preços
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                  Estoque
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
              {produtosFiltrados.map((produto) => (
                <tr key={produto.id} className={tema.hover}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${tema.texto}`}>
                          {produto.nome}
                        </div>
                        <div className={`text-sm ${tema.textoSecundario}`}>
                          Código: {produto.codigoBarras || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                      {produto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${tema.texto}`}>
                      Venda: {formatarMoeda(produto.valorVenda)}
                    </div>
                    <div className={`text-sm ${tema.textoSecundario}`}>
                      Custo: {formatarMoeda(produto.valorCusto)}
                    </div>
                    <div className={`text-xs text-green-600`}>
                      Margem: {calcularMargem(produto.valorCusto, produto.valorVenda).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${tema.texto}`}>
                      Atual: {formatarNumero(produto.estoque)}
                    </div>
                    <div className={`text-sm ${tema.textoSecundario}`}>
                      Mínimo: {formatarNumero(produto.estoqueMinimo)}
                    </div>
                    {produto.estoque <= produto.estoqueMinimo && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Baixo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      produto.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => verDetalhes(produto)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => abrirModal(produto)}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => alternarStatus(produto)}
                        className={produto.ativo ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                        title={produto.ativo ? "Desativar" : "Ativar"}
                      >
                        {produto.ativo ? <X className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => confirmarExclusao(produto)}
                        className="text-red-600 hover:text-red-700"
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
        <div className="lg:hidden">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className={`p-4 border-b ${tema.borda} last:border-b-0`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium ${tema.texto}`}>
                  {produto.nome}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  produto.ativo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {produto.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className={`text-sm ${tema.textoSecundario} mb-2`}>
                Código: {produto.codigoBarras || 'N/A'} • {produto.categoria}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className={`text-xs ${tema.textoSecundario}`}>Preços:</span>
                  <div className={`text-sm ${tema.texto}`}>
                    Venda: {formatarMoeda(produto.valorVenda)}
                  </div>
                  <div className={`text-xs ${tema.textoSecundario}`}>
                    Custo: {formatarMoeda(produto.valorCusto)}
                  </div>
                </div>
                <div>
                  <span className={`text-xs ${tema.textoSecundario}`}>Estoque:</span>
                  <div className={`text-sm ${tema.texto}`}>
                    {formatarNumero(produto.estoque)} / {formatarNumero(produto.estoqueMinimo)}
                  </div>
                  {produto.estoque <= produto.estoqueMinimo && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Baixo
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => verDetalhes(produto)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => abrirModal(produto)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => alternarStatus(produto)}
                  className={produto.ativo ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                >
                  {produto.ativo ? <X className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => confirmarExclusao(produto)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vazio */}
        {produtosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Package className={`mx-auto h-12 w-12 ${tema.textoSecundario}`} />
            <h3 className={`mt-2 text-sm font-medium ${tema.texto}`}>
              Nenhum produto encontrado
            </h3>
            <p className={`mt-1 text-sm ${tema.textoSecundario}`}>
              {produtos.length === 0 
                ? 'Comece criando seu primeiro produto.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
            {produtos.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => abrirModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
              <div className={`${tema.papel} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${tema.texto}`}>
                    {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  <button
                    onClick={fecharModal}
                    className={`${tema.textoSecundario} hover:${tema.texto}`}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Nome do Produto *
                      </label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.nome ? 'border-red-500' : ''
                        } ${tema.input}`}
                        placeholder="Digite o nome do produto"
                      />
                      {formErrors.nome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                      )}
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Categoria *
                      </label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.categoria ? 'border-red-500' : ''
                        } ${tema.input}`}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categoriasDisponiveis.map(categoria => (
                          <option key={categoria} value={categoria}>{categoria}</option>
                        ))}
                      </select>
                      {formErrors.categoria && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.categoria}</p>
                      )}
                    </div>

                    {/* Código de Barras */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Código de Barras
                      </label>
                      <input
                        type="text"
                        value={formData.codigoBarras}
                        onChange={(e) => setFormData(prev => ({ ...prev, codigoBarras: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.codigoBarras ? 'border-red-500' : ''
                        } ${tema.input}`}
                        placeholder="Digite o código de barras"
                      />
                      {formErrors.codigoBarras && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.codigoBarras}</p>
                      )}
                    </div>

                    {/* Valor de Custo */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Valor de Custo *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          R$
                        </span>
                        <input
                          type="text"
                          value={formData.valorCusto}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            valorCusto: formatarMoedaInput(e.target.value)
                          }))}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.valorCusto ? 'border-red-500' : ''
                          } ${tema.input}`}
                          placeholder="0,00"
                        />
                      </div>
                      {formErrors.valorCusto && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.valorCusto}</p>
                      )}
                    </div>

                    {/* Valor de Venda */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Valor de Venda *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          R$
                        </span>
                        <input
                          type="text"
                          value={formData.valorVenda}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            valorVenda: formatarMoedaInput(e.target.value)
                          }))}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.valorVenda ? 'border-red-500' : ''
                          } ${tema.input}`}
                          placeholder="0,00"
                        />
                      </div>
                      {formErrors.valorVenda && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.valorVenda}</p>
                      )}
                    </div>

                    {/* Estoque */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Estoque Atual
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.estoque}
                        onChange={(e) => setFormData(prev => ({ ...prev, estoque: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.estoque ? 'border-red-500' : ''
                        } ${tema.input}`}
                        placeholder="0"
                      />
                      {formErrors.estoque && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.estoque}</p>
                      )}
                    </div>

                    {/* Estoque Mínimo */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.estoqueMinimo}
                        onChange={(e) => setFormData(prev => ({ ...prev, estoqueMinimo: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.estoqueMinimo ? 'border-red-500' : ''
                        } ${tema.input}`}
                        placeholder="1"
                      />
                      {formErrors.estoqueMinimo && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.estoqueMinimo}</p>
                      )}
                    </div>

                    {/* Descrição */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Descrição
                      </label>
                      <textarea
                        rows={3}
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                        placeholder="Digite uma descrição detalhada do produto"
                      />
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.ativo}
                          onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 text-sm ${tema.texto}`}>
                          Produto ativo
                        </span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className={`${tema.fundo} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  onClick={salvarProduto}
                  disabled={salvando}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {salvando ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      {produtoEditando ? 'Atualizar' : 'Criar'}
                    </div>
                  )}
                </button>
                <button
                  onClick={fecharModal}
                  disabled={salvando}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {modalExclusaoAberto && produtoParaExcluir && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${tema.papel} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg leading-6 font-medium ${tema.texto}`}>
                      Excluir Produto
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${tema.textoSecundario}`}>
                        Tem certeza que deseja excluir o produto <strong>{produtoParaExcluir.nome}</strong>? 
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${tema.fundo} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  onClick={excluirProduto}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Excluir
                </button>
                <button
                  onClick={() => {
                    setModalExclusaoAberto(false);
                    setProdutoParaExcluir(null);
                  }}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalDetalhesAberto && produtoDetalhes && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalDetalhesAberto(false)}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
              <div className={`${tema.papel} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${tema.texto}`}>
                    Detalhes do Produto
                  </h3>
                  <button
                    onClick={() => setModalDetalhesAberto(false)}
                    className={`${tema.textoSecundario} hover:${tema.texto}`}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Nome
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {produtoDetalhes.nome}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Categoria
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {produtoDetalhes.categoria}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Código de Barras
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {produtoDetalhes.codigoBarras || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Status
                      </label>
                      <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        produtoDetalhes.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {produtoDetalhes.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Valor de Custo
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {formatarMoeda(produtoDetalhes.valorCusto)}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Valor de Venda
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {formatarMoeda(produtoDetalhes.valorVenda)}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Margem de Lucro
                      </label>
                      <p className={`mt-1 text-sm text-green-600`}>
                        {calcularMargem(produtoDetalhes.valorCusto, produtoDetalhes.valorVenda).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Data de Cadastro
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {new Date(produtoDetalhes.dataCadastro).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Estoque Atual
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {formatarNumero(produtoDetalhes.estoque)} unidades
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Estoque Mínimo
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {formatarNumero(produtoDetalhes.estoqueMinimo)} unidades
                      </p>
                    </div>
                  </div>

                  {produtoDetalhes.descricao && (
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Descrição
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {produtoDetalhes.descricao}
                      </p>
                    </div>
                  )}

                  {/* Alertas */}
                  {produtoDetalhes.estoque <= produtoDetalhes.estoqueMinimo && (
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Estoque baixo! Produto precisa de reposição.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${tema.fundo} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  onClick={() => {
                    setModalDetalhesAberto(false);
                    abrirModal(produtoDetalhes);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => setModalDetalhesAberto(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};