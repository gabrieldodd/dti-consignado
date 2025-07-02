// src/components/screens/TelaProdutos.tsx
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  BarChart3,
  DollarSign,
  Eye,
  EyeOff,
  Archive,
  ArchiveRestore,
  Tag
} from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

// Interfaces
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

// Form inicial
const FORM_INICIAL: ProdutoForm = {
  nome: '',
  descricao: '',
  codigoBarras: '',
  categoria: '',
  valorCusto: '',
  valorVenda: '',
  estoque: '',
  estoqueMinimo: '',
  ativo: true
};

// Componente de estatísticas
const EstatisticasProdutos = memo(() => {
  const { tema, produtos, controleEstoqueHabilitado } = useAppContext();
  
  const estatisticas = useMemo(() => {
    const ativos = produtos.filter(p => p.ativo).length;
    const inativos = produtos.filter(p => !p.ativo).length;
    const total = produtos.length;
    const estoqueBaixo = produtos.filter(p => p.ativo && p.estoque <= p.estoque_minimo).length;
    const valorTotalEstoque = produtos
      .filter(p => p.ativo)
      .reduce((acc, p) => acc + (p.valor_custo * p.estoque), 0);
    
    return { ativos, inativos, total, estoqueBaixo, valorTotalEstoque };
  }, [produtos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Total</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.total}</p>
          </div>
          <Package className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Ativos</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.ativos}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {controleEstoqueHabilitado && (
        <>
          <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tema.textoSecundario}`}>Estoque Baixo</p>
                <p className={`text-2xl font-bold ${estatisticas.estoqueBaixo > 0 ? 'text-red-600' : tema.texto}`}>
                  {estatisticas.estoqueBaixo}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${estatisticas.estoqueBaixo > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </div>

          <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${tema.textoSecundario}`}>Valor Estoque</p>
                <p className={`text-lg font-bold ${tema.texto}`}>
                  R$ {estatisticas.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// Componente principal
export const TelaProdutos: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    produtos,
    categorias,
    mostrarMensagem,
    cookies,
    tipoUsuario,
    controleEstoqueHabilitado,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    loadingProdutos,
    errorProdutos
  } = useAppContext();
  
  const { formatarMoedaBR } = useFormatters();
  const { validarObrigatorio, validarNumeroPositivo, validarCodigoBarras } = useValidation();

  // Loading e Erro
  if (loadingProdutos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${tema.textoSecundario}`}>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (errorProdutos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className={`h-12 w-12 ${tema.textoSecundario} mx-auto mb-4`} />
          <p className={`${tema.texto} font-medium mb-2`}>Erro ao carregar produtos</p>
          <p className={`${tema.textoSecundario} text-sm mb-4`}>{errorProdutos}</p>
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
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState(() => {
    return cookies.getCookie('filtroCategoriasProdutos') || 'todas';
  });
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusProdutos') || 'todos';
  });
  const [buscaTexto, setBuscaTexto] = useState('');

  // Estados do formulário
  const [formProduto, setFormProduto] = useState<ProdutoForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<any>({});

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroCategoriasProdutos', filtroCategoria, 30);
  }, [filtroCategoria, cookies]);

  useEffect(() => {
    cookies.setCookie('filtroStatusProdutos', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Filtrar produtos
  const produtosFiltrados = useMemo(() => {
    let resultado = produtos;

    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(p => p.categoria === filtroCategoria);
    }

    if (filtroStatus !== 'todos') {
      const statusFiltro = filtroStatus === 'ativo';
      resultado = resultado.filter(p => p.ativo === statusFiltro);
    }

    if (buscaTexto) {
      resultado = resultado.filter(p => 
        p.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        p.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        p.codigo_barras.includes(buscaTexto)
      );
    }

    return resultado;
  }, [produtos, filtroCategoria, filtroStatus, buscaTexto]);

  // Calcular margem
  const calcularMargem = useCallback((valorCusto: number, valorVenda: number): number => {
    if (valorCusto === 0) return 0;
    return ((valorVenda - valorCusto) / valorCusto) * 100;
  }, []);

  // Handlers modais
  const abrirModal = useCallback((produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto);
      setFormProduto({
        nome: produto.nome,
        descricao: produto.descricao,
        codigoBarras: produto.codigo_barras,
        categoria: produto.categoria,
        valorCusto: produto.valor_custo.toString(),
        valorVenda: produto.valor_venda.toString(),
        estoque: produto.estoque.toString(),
        estoqueMinimo: produto.estoque_minimo.toString(),
        ativo: produto.ativo
      });
    } else {
      setProdutoEditando(null);
      setFormProduto(FORM_INICIAL);
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setProdutoEditando(null);
    setFormProduto(FORM_INICIAL);
    setFormErrors({});
  }, []);

  const abrirModalExclusao = useCallback((produto: Produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setProdutoParaExcluir(null);
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!validarObrigatorio(formProduto.nome)) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!validarObrigatorio(formProduto.codigoBarras)) {
      errors.codigoBarras = 'Código de barras é obrigatório';
    } else if (!validarCodigoBarras(formProduto.codigoBarras)) {
      errors.codigoBarras = 'Código de barras inválido';
    }

    if (!validarObrigatorio(formProduto.categoria)) {
      errors.categoria = 'Categoria é obrigatória';
    }

    if (!validarObrigatorio(formProduto.valorCusto)) {
      errors.valorCusto = 'Valor de custo é obrigatório';
    } else if (!validarNumeroPositivo(formProduto.valorCusto)) {
      errors.valorCusto = 'Valor de custo deve ser positivo';
    }

    if (!validarObrigatorio(formProduto.valorVenda)) {
      errors.valorVenda = 'Valor de venda é obrigatório';
    } else if (!validarNumeroPositivo(formProduto.valorVenda)) {
      errors.valorVenda = 'Valor de venda deve ser positivo';
    }

    if (controleEstoqueHabilitado) {
      if (!validarObrigatorio(formProduto.estoque)) {
        errors.estoque = 'Estoque é obrigatório';
      }

      if (!validarObrigatorio(formProduto.estoqueMinimo)) {
        errors.estoqueMinimo = 'Estoque mínimo é obrigatório';
      }
    }

    // Verificar código de barras duplicado
    if (!produtoEditando || formProduto.codigoBarras !== produtoEditando.codigo_barras) {
      const codigoExiste = produtos.some(p => 
        p.codigo_barras === formProduto.codigoBarras && p.id !== produtoEditando?.id
      );
      if (codigoExiste) {
        errors.codigoBarras = 'Este código de barras já está em uso';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formProduto, produtoEditando, produtos, controleEstoqueHabilitado, validarObrigatorio, validarNumeroPositivo, validarCodigoBarras]);

  // Salvar produto
  const salvarProduto = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      const dadosProduto = {
        nome: formProduto.nome,
        descricao: formProduto.descricao,
        codigo_barras: formProduto.codigoBarras,
        categoria: formProduto.categoria,
        valor_custo: parseFloat(formProduto.valorCusto),
        valor_venda: parseFloat(formProduto.valorVenda),
        estoque: controleEstoqueHabilitado ? parseInt(formProduto.estoque) : 0,
        estoque_minimo: controleEstoqueHabilitado ? parseInt(formProduto.estoqueMinimo) : 0,
        ativo: formProduto.ativo
      };

      if (produtoEditando) {
        // Atualizar produto existente
        const resultado = await atualizarProduto(produtoEditando.id, dadosProduto);
        if (resultado.success) {
          mostrarMensagem('success', 'Produto atualizado com sucesso!');
          fecharModal();
        } else {
          mostrarMensagem('error', resultado.error || 'Erro ao atualizar produto');
        }
      } else {
        // Criar novo produto
        const resultado = await adicionarProduto(dadosProduto);
        if (resultado.success) {
          mostrarMensagem('success', 'Produto criado com sucesso!');
          fecharModal();
        } else {
          mostrarMensagem('error', resultado.error || 'Erro ao criar produto');
        }
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar produto');
    } finally {
      setSalvando(false);
    }
  }, [formProduto, produtoEditando, controleEstoqueHabilitado, validarFormulario, adicionarProduto, atualizarProduto, mostrarMensagem, fecharModal]);

  // Confirmar exclusão
  const confirmarExclusao = useCallback(async () => {
    if (!produtoParaExcluir) return;

    setSalvando(true);
    
    try {
      const resultado = await excluirProduto(produtoParaExcluir.id);
      if (resultado.success) {
        mostrarMensagem('success', `Produto "${produtoParaExcluir.nome}" excluído com sucesso!`);
        fecharModalExclusao();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir produto');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro ao excluir produto');
    } finally {
      setSalvando(false);
    }
  }, [produtoParaExcluir, excluirProduto, mostrarMensagem, fecharModalExclusao]);

  // Verificar permissões
  const podeGerenciar = tipoUsuario === 'admin';

  if (!podeGerenciar) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className={`h-12 w-12 ${tema.textoSecundario} mx-auto mb-4`} />
          <p className={`${tema.texto} font-medium`}>Acesso Negado</p>
          <p className={`${tema.textoSecundario} text-sm`}>
            Apenas administradores podem gerenciar produtos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${tema.fundo} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${tema.texto} flex items-center`}>
              <Package className="mr-3 h-6 w-6" />
              Produtos
            </h1>
            <p className={`text-sm ${tema.textoSecundario}`}>
              Gerencie o catálogo de produtos
            </p>
          </div>
          
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </button>
        </div>

        {/* Estatísticas */}
        <EstatisticasProdutos />

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="Nome, descrição ou código..."
                  className={`w-full pl-10 pr-3 py-2 border rounded-md ${tema.input} ${tema.borda}`}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                Categoria
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${tema.input} ${tema.borda}`}
              >
                <option value="todas">Todas as categorias</option>
                {categorias.filter(c => c.ativa).map(categoria => (
                  <option key={categoria.id} value={categoria.nome}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
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
                <option value="todos">Todos</option>
                <option value="ativo">Apenas Ativos</option>
                <option value="inativo">Apenas Inativos</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className={`text-sm ${tema.textoSecundario}`}>
                {produtosFiltrados.length} de {produtos.length} produtos
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className={`${tema.papel} rounded-lg border ${tema.borda} overflow-hidden table-responsive`}>
          <div className="custom-scrollbar overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Produto
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Categoria
                  </th>
                  {controleEstoqueHabilitado && (
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Estoque
                    </th>
                  )}
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
              <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                {produtosFiltrados.map((produto) => {
                  const margem = calcularMargem(produto.valor_custo, produto.valor_venda);
                  const estoqueStatus = controleEstoqueHabilitado ? 
                    (produto.estoque <= produto.estoque_minimo ? 'baixo' : 'normal') : 'disabled';
                  
                  return (
                    <tr key={produto.id} className={`${tema.hover} table-hover-row`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${tema.texto}`}>
                            {produto.nome}
                          </div>
                          <div className={`text-sm ${tema.textoSecundario}`}>
                            {produto.codigo_barras}
                          </div>
                          {produto.descricao && (
                            <div className={`text-xs ${tema.textoSecundario} mt-1`}>
                              {produto.descricao.substring(0, 50)}
                              {produto.descricao.length > 50 && '...'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                          {produto.categoria}
                        </span>
                      </td>
                      {controleEstoqueHabilitado && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${estoqueStatus === 'baixo' ? 'text-red-600 font-medium' : tema.texto}`}>
                            {produto.estoque}
                            {estoqueStatus === 'baixo' && (
                              <AlertTriangle className="inline h-4 w-4 ml-1" />
                            )}
                          </div>
                          <div className={`text-xs ${tema.textoSecundario}`}>
                            Mín: {produto.estoque_minimo}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${tema.texto}`}>
                          <div>Custo: {formatarMoedaBR(produto.valor_custo)}</div>
                          <div className="font-medium">Venda: {formatarMoedaBR(produto.valor_venda)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          margem > 30 ? 'text-green-600' : 
                          margem > 10 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {margem.toFixed(1)}%
                        </span>
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
                            onClick={() => abrirModal(produto)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Editar produto"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => abrirModalExclusao(produto)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir produto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
            </div>
          )}
        </div>

        {/* Modal Produto */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && fecharModal()}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                    {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formProduto.nome}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, nome: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.nome ? 'border-red-500' : tema.borda}`}
                        placeholder="Nome do produto"
                        disabled={salvando}
                      />
                      {formErrors.nome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                      )}
                    </div>

                    {/* Código de Barras */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Código de Barras *
                      </label>
                      <input
                        type="text"
                        value={formProduto.codigoBarras}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, codigoBarras: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.codigoBarras ? 'border-red-500' : tema.borda}`}
                        placeholder="000000000000"
                        disabled={salvando}
                      />
                      {formErrors.codigoBarras && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.codigoBarras}</p>
                      )}
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Categoria *
                      </label>
                      <select
                        value={formProduto.categoria}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, categoria: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.categoria ? 'border-red-500' : tema.borda}`}
                        disabled={salvando}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias.filter(c => c.ativa).map(categoria => (
                          <option key={categoria.id} value={categoria.nome}>
                            {categoria.nome}
                          </option>
                        ))}
                      </select>
                      {formErrors.categoria && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.categoria}</p>
                      )}
                    </div>

                    {/* Valor de Custo */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Valor de Custo *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formProduto.valorCusto}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, valorCusto: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.valorCusto ? 'border-red-500' : tema.borda}`}
                        placeholder="0,00"
                        disabled={salvando}
                      />
                      {formErrors.valorCusto && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.valorCusto}</p>
                      )}
                    </div>

                    {/* Valor de Venda */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Valor de Venda *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formProduto.valorVenda}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, valorVenda: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.valorVenda ? 'border-red-500' : tema.borda}`}
                        placeholder="0,00"
                        disabled={salvando}
                      />
                      {formErrors.valorVenda && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.valorVenda}</p>
                      )}
                    </div>

                    {/* Campos de Estoque (apenas se habilitado) */}
                    {controleEstoqueHabilitado && (
                      <>
                        <div>
                          <label className={`block text-sm font-medium ${tema.texto}`}>
                            Estoque Atual *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formProduto.estoque}
                            onChange={(e) => setFormProduto(prev => ({ ...prev, estoque: e.target.value }))}
                            className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.estoque ? 'border-red-500' : tema.borda}`}
                            placeholder="0"
                            disabled={salvando}
                          />
                          {formErrors.estoque && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.estoque}</p>
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${tema.texto}`}>
                            Estoque Mínimo *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formProduto.estoqueMinimo}
                            onChange={(e) => setFormProduto(prev => ({ ...prev, estoqueMinimo: e.target.value }))}
                            className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.estoqueMinimo ? 'border-red-500' : tema.borda}`}
                            placeholder="0"
                            disabled={salvando}
                          />
                          {formErrors.estoqueMinimo && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.estoqueMinimo}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Descrição */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Descrição
                      </label>
                      <textarea
                        value={formProduto.descricao}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${tema.borda}`}
                        placeholder="Descrição detalhada do produto..."
                        disabled={salvando}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Status
                      </label>
                      <select
                        value={formProduto.ativo ? 'ativo' : 'inativo'}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, ativo: e.target.value === 'ativo' }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${tema.borda}`}
                        disabled={salvando}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>

                    {/* Margem (apenas visualização) */}
                    {formProduto.valorCusto && formProduto.valorVenda && (
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto}`}>
                          Margem de Lucro
                        </label>
                        <div className={`mt-1 px-3 py-2 border rounded-md ${tema.input} ${tema.borda} bg-gray-50`}>
                          <span className={`text-sm font-medium ${
                            calcularMargem(parseFloat(formProduto.valorCusto), parseFloat(formProduto.valorVenda)) > 30 
                              ? 'text-green-600' 
                              : calcularMargem(parseFloat(formProduto.valorCusto), parseFloat(formProduto.valorVenda)) > 10
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            {calcularMargem(parseFloat(formProduto.valorCusto), parseFloat(formProduto.valorVenda)).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={fecharModal}
                      disabled={salvando}
                      className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover} disabled:opacity-50`}
                    >
                      <X className="mr-2 h-4 w-4 inline" />
                      Cancelar
                    </button>
                    <button
                      onClick={salvarProduto}
                      disabled={salvando}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {salvando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {produtoEditando ? 'Atualizar' : 'Criar'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && produtoParaExcluir && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && fecharModalExclusao()}></div>
              
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
                          Tem certeza que deseja excluir o produto <strong>{produtoParaExcluir.nome}</strong>? 
                          Esta ação não pode ser desfeita.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={confirmarExclusao}
                    disabled={salvando}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {salvando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Excluindo...
                      </>
                    ) : (
                      'Excluir'
                    )}
                  </button>
                  <button
                    onClick={fecharModalExclusao}
                    disabled={salvando}
                    className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50`}
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