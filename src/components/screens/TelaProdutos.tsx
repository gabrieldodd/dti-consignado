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
  BarChart3,
  QrCode,
  Tag,
  CheckCircle,
  TrendingUp,
  TrendingDown
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
    tipoUsuario 
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
  
  // Estados de Filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEstoque, setFiltroEstoque] = useState('todos');

  // Verificar permissões
  const podeGerenciar = tipoUsuario === 'admin';

  // Produtos filtrados
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(produto => {
      const matchTexto = buscaTexto === '' || 
        produto.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        produto.codigoBarras.includes(buscaTexto) ||
        produto.categoria.toLowerCase().includes(buscaTexto.toLowerCase());

      const matchCategoria = filtroCategoria === 'todas' || produto.categoria === filtroCategoria;
      const matchStatus = filtroStatus === 'todos' || 
        (filtroStatus === 'ativo' && produto.ativo) ||
        (filtroStatus === 'inativo' && !produto.ativo);

      const matchEstoque = filtroEstoque === 'todos' ||
        (filtroEstoque === 'baixo' && produto.estoque <= produto.estoqueMinimo) ||
        (filtroEstoque === 'normal' && produto.estoque > produto.estoqueMinimo);

      return matchTexto && matchCategoria && matchStatus && matchEstoque;
    });
  }, [produtos, buscaTexto, filtroCategoria, filtroStatus, filtroEstoque]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = produtos.length;
    const ativos = produtos.filter(p => p.ativo).length;
    const inativos = produtos.filter(p => !p.ativo).length;
    const estoqueBaixo = produtos.filter(p => p.ativo && p.estoque <= p.estoqueMinimo).length;
    const valorTotalEstoque = produtos.filter(p => p.ativo).reduce((acc, p) => acc + (p.valorCusto * p.estoque), 0);
    const valorTotalVenda = produtos.filter(p => p.ativo).reduce((acc, p) => acc + (p.valorVenda * p.estoque), 0);
    const itensEstoque = produtos.filter(p => p.ativo).reduce((acc, p) => acc + p.estoque, 0);

    return {
      total,
      ativos,
      inativos,
      estoqueBaixo,
      valorTotalEstoque,
      valorTotalVenda,
      itensEstoque
    };
  }, [produtos]);

  // Categorias disponíveis
  const categoriasDisponiveis = useMemo(() => {
    return categorias.filter(cat => cat.ativa);
  }, [categorias]);

  // Gerenciamento do Modal
  const abrirModal = useCallback((produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto);
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao,
        codigoBarras: produto.codigoBarras,
        categoria: produto.categoria,
        valorCusto: formatarMoeda(produto.valorCusto),
        valorVenda: formatarMoeda(produto.valorVenda),
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
  }, [formatarMoeda]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setProdutoEditando(null);
    setFormData(FORM_INICIAL);
    setFormErrors({});
  }, []);

  // Atualizar campo do formulário
  const atualizarCampo = useCallback((campo: keyof ProdutoForm, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Limpar erro do campo ao digitar
    if (formErrors[campo]) {
      setFormErrors(prev => ({ ...prev, [campo]: '' }));
    }
  }, [formErrors]);

  // Validar formulário
  const validarFormulario = useCallback((): boolean => {
    const novosErros: Record<string, string> = {};

    // Validar campos obrigatórios
    if (!validarObrigatorio(formData.nome)) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!validarObrigatorio(formData.categoria)) {
      novosErros.categoria = 'Categoria é obrigatória';
    }

    if (!validarObrigatorio(formData.codigoBarras)) {
      novosErros.codigoBarras = 'Código de barras é obrigatório';
    } else if (!validarCodigoBarras(formData.codigoBarras)) {
      novosErros.codigoBarras = 'Código de barras deve ter entre 8 e 14 dígitos';
    }

    // Validar valores numéricos
    const valorCusto = parseFloat(limparFormatacao(formData.valorCusto));
    const valorVenda = parseFloat(limparFormatacao(formData.valorVenda));
    const estoque = parseInt(formData.estoque);
    const estoqueMinimo = parseInt(formData.estoqueMinimo);

    if (!validarNumeroPositivo(valorCusto)) {
      novosErros.valorCusto = 'Valor de custo deve ser maior que zero';
    }

    if (!validarNumeroPositivo(valorVenda)) {
      novosErros.valorVenda = 'Valor de venda deve ser maior que zero';
    }

    if (valorVenda <= valorCusto) {
      novosErros.valorVenda = 'Valor de venda deve ser maior que o custo';
    }

    if (isNaN(estoque) || estoque < 0) {
      novosErros.estoque = 'Estoque deve ser um número válido';
    }

    if (isNaN(estoqueMinimo) || estoqueMinimo < 1) {
      novosErros.estoqueMinimo = 'Estoque mínimo deve ser pelo menos 1';
    }

    // Verificar código de barras duplicado
    const codigoExistente = produtos.find(p => 
      p.codigoBarras === formData.codigoBarras && 
      p.id !== produtoEditando?.id
    );

    if (codigoExistente) {
      novosErros.codigoBarras = 'Este código de barras já existe';
    }

    setFormErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [formData, produtos, produtoEditando, validarObrigatorio, validarCodigoBarras, validarNumeroPositivo, limparFormatacao]);

  // Salvar produto
  const salvarProduto = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);

    try {
      const produtoData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        codigoBarras: formData.codigoBarras.trim(),
        categoria: formData.categoria,
        valorCusto: parseFloat(limparFormatacao(formData.valorCusto)),
        valorVenda: parseFloat(limparFormatacao(formData.valorVenda)),
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
  }, [formData, produtoEditando, produtos, validarFormulario, setProdutos, mostrarMensagem, fecharModal, limparFormatacao]);

  // Confirmar exclusão
  const confirmarExclusao = useCallback((produto: Produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusaoAberto(true);
  }, []);

  // Excluir produto
  const excluirProduto = useCallback(() => {
    if (!produtoParaExcluir) return;

    setProdutos(prev => prev.filter(produto => produto.id !== produtoParaExcluir.id));
    mostrarMensagem('success', 'Produto excluído com sucesso!');
    setModalExclusaoAberto(false);
    setProdutoParaExcluir(null);
  }, [produtoParaExcluir, setProdutos, mostrarMensagem]);

  // Alternar status do produto
  const alternarStatus = useCallback((produto: Produto) => {
    setProdutos(prev => prev.map(p => 
      p.id === produto.id 
        ? { ...p, ativo: !p.ativo }
        : p
    ));
    const novoStatus = produto.ativo ? 'desativado' : 'ativado';
    mostrarMensagem('success', `Produto ${novoStatus} com sucesso!`);
  }, [setProdutos, mostrarMensagem]);

  // Ver detalhes do produto
  const verDetalhes = useCallback((produto: Produto) => {
    setProdutoDetalhes(produto);
    setModalDetalhesAberto(true);
  }, []);

  // Calcular margem de lucro
  const calcularMargem = useCallback((custo: number, venda: number): number => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo) * 100;
  }, []);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
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
          {podeGerenciar && (
            <button
              onClick={() => abrirModal()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </button>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
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
                <p className={`text-2xl font-bold text-gray-500`}>
                  {formatarNumero(estatisticas.inativos)}
                </p>
              </div>
              <Package className="h-8 w-8 text-gray-500" />
            </div>
          </div>

          <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tema.textoSecundario}`}>Estoque Baixo</p>
                <p className={`text-2xl font-bold ${estatisticas.estoqueBaixo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatarNumero(estatisticas.estoqueBaixo)}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${estatisticas.estoqueBaixo > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>

          <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tema.textoSecundario}`}>Itens em Estoque</p>
                <p className={`text-xl font-bold ${tema.texto}`}>
                  {formatarNumero(estatisticas.itensEstoque)}
                </p>
              </div>
              <Hash className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tema.textoSecundario}`}>Valor Custo</p>
                <p className={`text-lg font-bold text-orange-600`}>
                  {formatarMoeda(estatisticas.valorTotalEstoque)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tema.textoSecundario}`}>Valor Venda</p>
                <p className={`text-lg font-bold text-green-600`}>
                  {formatarMoeda(estatisticas.valorTotalVenda)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
              />
            </div>
            
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todas">Todas as Categorias</option>
              {categoriasDisponiveis.map(categoria => (
                <option key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>

            <select
              value={filtroEstoque}
              onChange={(e) => setFiltroEstoque(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos os Estoques</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="normal">Estoque Normal</option>
            </select>

            <div className={`flex items-center justify-end ${tema.textoSecundario}`}>
              <span className="text-sm">
                {produtosFiltrados.length} produto(s) encontrado(s)
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
          {produtosFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <Package className={`mx-auto h-16 w-16 ${tema.textoSecundario} mb-4`} />
              <p className={`text-lg font-medium ${tema.texto} mb-2`}>
                Nenhum produto encontrado
              </p>
              <p className={`${tema.textoSecundario} mb-4`}>
                {produtos.length === 0 
                  ? 'Comece criando seu primeiro produto'
                  : 'Tente ajustar os filtros para encontrar produtos'
                }
              </p>
              {podeGerenciar && produtos.length === 0 && (
                <button
                  onClick={() => abrirModal()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="inline mr-2 h-4 w-4" />
                  Criar Primeiro Produto
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${tema.fundo} border-b ${tema.borda}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Produto
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Categoria
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Estoque
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Valores
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Margem
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produtosFiltrados.map((produto) => {
                    const margem = calcularMargem(produto.valorCusto, produto.valorVenda);
                    const estoqueStatus = produto.estoque <= produto.estoqueMinimo ? 'baixo' : 'normal';

                    return (
                      <tr key={produto.id} className={`${tema.hover}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${tema.texto}`}>
                                {produto.nome}
                              </div>
                              <div className={`text-sm ${tema.textoSecundario}`}>
                                {produto.codigoBarras}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                            <Tag className="mr-1 h-3 w-3" />
                            {produto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${estoqueStatus === 'baixo' ? 'text-red-600' : tema.texto}`}>
                                {formatarNumero(produto.estoque)} unidades
                              </div>
                              <div className={`text-xs ${tema.textoSecundario}`}>
                                Mín: {formatarNumero(produto.estoqueMinimo)}
                              </div>
                            </div>
                            {estoqueStatus === 'baixo' && (
                              <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className={`font-medium ${tema.texto}`}>
                              Venda: {formatarMoeda(produto.valorVenda)}
                            </div>
                            <div className={`${tema.textoSecundario}`}>
                              Custo: {formatarMoeda(produto.valorCusto)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${margem >= 50 ? 'text-green-600' : margem >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {margem.toFixed(1)}%
                            </span>
                            {margem >= 50 ? (
                              <TrendingUp className="ml-1 h-4 w-4 text-green-600" />
                            ) : margem >= 20 ? (
                              <BarChart3 className="ml-1 h-4 w-4 text-yellow-600" />
                            ) : (
                              <TrendingDown className="ml-1 h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => alternarStatus(produto)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              produto.ativo 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors`}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => verDetalhes(produto)}
                              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {podeGerenciar && (
                              <>
                                <button
                                  onClick={() => abrirModal(produto)}
                                  className="p-1 text-gray-500 hover:text-yellow-600 transition-colors"
                                  title="Editar produto"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => confirmarExclusao(produto)}
                                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Excluir produto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-lg font-semibold ${tema.texto}`}>
                {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={fecharModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.nome ? 'border-red-500' : ''
                  } ${tema.input}`}
                  placeholder="Digite o nome do produto"
                />
                {formErrors.nome && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => atualizarCampo('descricao', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                  placeholder="Descrição do produto (opcional)"
                />
              </div>

              {/* Código de Barras e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Código de Barras *
                  </label>
                  <input
                    type="text"
                    value={formData.codigoBarras}
                    onChange={(e) => atualizarCampo('codigoBarras', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.codigoBarras ? 'border-red-500' : ''
                    } ${tema.input}`}
                    placeholder="123456789012"
                  />
                  {formErrors.codigoBarras && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.codigoBarras}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Categoria *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => atualizarCampo('categoria', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.categoria ? 'border-red-500' : ''
                    } ${tema.input}`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categoriasDisponiveis.map(categoria => (
                      <option key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoria && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.categoria}</p>
                  )}
                </div>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Valor de Custo *
                  </label>
                  <input
                    type="text"
                    value={formData.valorCusto}
                    onChange={(e) => atualizarCampo('valorCusto', formatarMoeda(parseFloat(limparFormatacao(e.target.value)) || 0))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.valorCusto ? 'border-red-500' : ''
                    } ${tema.input}`}
                    placeholder="R$ 0,00"
                  />
                  {formErrors.valorCusto && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.valorCusto}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Valor de Venda *
                  </label>
                  <input
                    type="text"
                    value={formData.valorVenda}
                    onChange={(e) => atualizarCampo('valorVenda', formatarMoeda(parseFloat(limparFormatacao(e.target.value)) || 0))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.valorVenda ? 'border-red-500' : ''
                    } ${tema.input}`}
                    placeholder="R$ 0,00"
                  />
                  {formErrors.valorVenda && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.valorVenda}</p>
                  )}
                </div>
              </div>

              {/* Estoque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Estoque Atual *
                  </label>
                  <input
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => atualizarCampo('estoque', e.target.value)}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.estoque ? 'border-red-500' : ''
                    } ${tema.input}`}
                    placeholder="0"
                  />
                  {formErrors.estoque && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.estoque}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    value={formData.estoqueMinimo}
                    onChange={(e) => atualizarCampo('estoqueMinimo', e.target.value)}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.estoqueMinimo ? 'border-red-500' : ''
                    } ${tema.input}`}
                    placeholder="1"
                  />
                  {formErrors.estoqueMinimo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.estoqueMinimo}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => atualizarCampo('ativo', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className={`ml-2 text-sm ${tema.texto}`}>
                  Produto ativo
                </label>
              </div>

              {/* Margem de Lucro Preview */}
              {formData.valorCusto && formData.valorVenda && (
                <div className={`p-3 rounded-md bg-blue-50 border border-blue-200`}>
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      Margem de Lucro: {calcularMargem(
                        parseFloat(limparFormatacao(formData.valorCusto)),
                        parseFloat(limparFormatacao(formData.valorVenda))
                      ).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={fecharModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarProduto}
                disabled={salvando}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {salvando ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {produtoEditando ? 'Atualizar' : 'Criar'} Produto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modalExclusaoAberto && produtoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl w-full max-w-md`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className={`text-lg font-semibold ${tema.texto}`}>
                  Confirmar Exclusão
                </h3>
              </div>
              <p className={`${tema.textoSecundario} mb-6`}>
                Tem certeza que deseja excluir o produto "{produtoParaExcluir.nome}"? 
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setModalExclusaoAberto(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={excluirProduto}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalDetalhesAberto && produtoDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl w-full max-w-lg`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-lg font-semibold ${tema.texto}`}>
                Detalhes do Produto
              </h3>
              <button
                onClick={() => setModalDetalhesAberto(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Nome:</span>
                  <p className={`${tema.texto}`}>{produtoDetalhes.nome}</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Categoria:</span>
                  <p className={`${tema.texto}`}>{produtoDetalhes.categoria}</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Código de Barras:</span>
                  <p className={`${tema.texto}`}>{produtoDetalhes.codigoBarras}</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    produtoDetalhes.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {produtoDetalhes.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Valor de Custo:</span>
                  <p className={`${tema.texto} font-medium`}>{formatarMoeda(produtoDetalhes.valorCusto)}</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Valor de Venda:</span>
                  <p className={`${tema.texto} font-medium`}>{formatarMoeda(produtoDetalhes.valorVenda)}</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Estoque Atual:</span>
                  <p className={`${tema.texto} font-medium`}>{formatarNumero(produtoDetalhes.estoque)} unidades</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Estoque Mínimo:</span>
                  <p className={`${tema.texto} font-medium`}>{formatarNumero(produtoDetalhes.estoqueMinimo)} unidades</p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Margem de Lucro:</span>
                  <p className={`font-medium ${calcularMargem(produtoDetalhes.valorCusto, produtoDetalhes.valorVenda) >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {calcularMargem(produtoDetalhes.valorCusto, produtoDetalhes.valorVenda).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Data de Cadastro:</span>
                  <p className={`${tema.texto}`}>
                    {new Date(produtoDetalhes.dataCadastro).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {produtoDetalhes.descricao && (
                <div>
                  <span className={`text-sm font-medium ${tema.textoSecundario}`}>Descrição:</span>
                  <p className={`${tema.texto} mt-1`}>{produtoDetalhes.descricao}</p>
                </div>
              )}

              {/* Alertas */}
              {produtoDetalhes.estoque <= produtoDetalhes.estoqueMinimo && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">
                    Estoque baixo! Considere reabastecer este produto.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setModalDetalhesAberto(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};