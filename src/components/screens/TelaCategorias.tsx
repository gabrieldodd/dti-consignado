// src/components/screens/TelaCategorias.tsx
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  Eye,
  EyeOff,
  Palette,
  Archive,
  ArchiveRestore,
  Grid,
  List
} from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

// Interfaces
interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
  data_cadastro: string;
}

interface CategoriaForm {
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
}

// Cores disponíveis para categorias
const CORES_DISPONIVEIS = [
  { valor: 'blue', nome: 'Azul', classe: 'bg-blue-100 text-blue-800', corFundo: 'bg-blue-500' },
  { valor: 'green', nome: 'Verde', classe: 'bg-green-100 text-green-800', corFundo: 'bg-green-500' },
  { valor: 'yellow', nome: 'Amarelo', classe: 'bg-yellow-100 text-yellow-800', corFundo: 'bg-yellow-500' },
  { valor: 'purple', nome: 'Roxo', classe: 'bg-purple-100 text-purple-800', corFundo: 'bg-purple-500' },
  { valor: 'red', nome: 'Vermelho', classe: 'bg-red-100 text-red-800', corFundo: 'bg-red-500' },
  { valor: 'pink', nome: 'Rosa', classe: 'bg-pink-100 text-pink-800', corFundo: 'bg-pink-500' },
  { valor: 'indigo', nome: 'Índigo', classe: 'bg-indigo-100 text-indigo-800', corFundo: 'bg-indigo-500' },
  { valor: 'gray', nome: 'Cinza', classe: 'bg-gray-100 text-gray-800', corFundo: 'bg-gray-500' }
];

// Form inicial
const FORM_INICIAL: CategoriaForm = {
  nome: '',
  descricao: '',
  cor: 'blue',
  ativa: true
};

// Componente de estatísticas
const EstatisticasCategorias = memo(() => {
  const { tema, categorias, produtos } = useAppContext();
  
  const estatisticas = useMemo(() => {
    const ativas = categorias.filter(c => c.ativa).length;
    const inativas = categorias.filter(c => !c.ativa).length;
    const total = categorias.length;
    
    // Contagem de produtos por categoria
    const produtosPorCategoria = produtos.reduce((acc, produto) => {
      acc[produto.categoria] = (acc[produto.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoriaMaisUsada = Object.entries(produtosPorCategoria)
      .sort(([,a], [,b]) => b - a)[0];
    
    return { 
      ativas, 
      inativas, 
      total, 
      categoriaMaisUsada: categoriaMaisUsada ? {
        nome: categoriaMaisUsada[0],
        quantidade: categoriaMaisUsada[1]
      } : null
    };
  }, [categorias, produtos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Total</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.total}</p>
          </div>
          <Tag className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Ativas</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.ativas}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Inativas</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.inativas}</p>
          </div>
          <Archive className="h-8 w-8 text-gray-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Mais Usada</p>
            <p className={`text-lg font-bold ${tema.texto}`}>
              {estatisticas.categoriaMaisUsada?.nome || 'N/A'}
            </p>
            {estatisticas.categoriaMaisUsada && (
              <p className={`text-xs ${tema.textoSecundario}`}>
                {estatisticas.categoriaMaisUsada.quantidade} produtos
              </p>
            )}
          </div>
          <Palette className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
});

// Componente principal
export const TelaCategorias: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    categorias,
    produtos,
    mostrarMensagem,
    cookies,
    tipoUsuario,
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    loadingCategorias,
    errorCategorias
  } = useAppContext();
  
  const { formatarData, capitalizarPalavras } = useFormatters();
  const { validarObrigatorio } = useValidation();

  // Loading e Erro
  if (loadingCategorias) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${tema.textoSecundario}`}>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  if (errorCategorias) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className={`h-12 w-12 ${tema.textoSecundario} mx-auto mb-4`} />
          <p className={`${tema.texto} font-medium mb-2`}>Erro ao carregar categorias</p>
          <p className={`${tema.textoSecundario} text-sm mb-4`}>{errorCategorias}</p>
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
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<Categoria | null>(null);
  const [categoriaDetalhes, setCategoriaDetalhes] = useState<Categoria | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');
  
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusCategorias') || 'todas';
  });
  const [buscaTexto, setBuscaTexto] = useState('');

  // Estados do formulário
  const [formCategoria, setFormCategoria] = useState<CategoriaForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<any>({});

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusCategorias', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Contar produtos por categoria
  const contarProdutosPorCategoria = useCallback((nomeCategoria: string): number => {
    return produtos.filter(p => p.categoria === nomeCategoria && p.ativo).length;
  }, [produtos]);

  // Filtrar categorias
  const categoriasFiltradas = useMemo(() => {
    let resultado = categorias;

    if (filtroStatus !== 'todas') {
      const statusFiltro = filtroStatus === 'ativa';
      resultado = resultado.filter(c => c.ativa === statusFiltro);
    }

    if (buscaTexto) {
      resultado = resultado.filter(c => 
        c.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        (c.descricao && c.descricao.toLowerCase().includes(buscaTexto.toLowerCase()))
      );
    }

    return resultado;
  }, [categorias, filtroStatus, buscaTexto]);

  // Handlers modais
  const abrirModal = useCallback((categoria?: Categoria) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormCategoria({
        nome: categoria.nome,
        descricao: categoria.descricao || '',
        cor: categoria.cor,
        ativa: categoria.ativa
      });
    } else {
      setCategoriaEditando(null);
      setFormCategoria(FORM_INICIAL);
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setFormCategoria(FORM_INICIAL);
    setFormErrors({});
  }, []);

  const abrirModalExclusao = useCallback((categoria: Categoria) => {
    const produtosVinculados = contarProdutosPorCategoria(categoria.nome);
    if (produtosVinculados > 0) {
      mostrarMensagem('error', 
        `Não é possível excluir a categoria "${categoria.nome}" pois há ${produtosVinculados} produto(s) vinculado(s) a ela.`
      );
      return;
    }
    setCategoriaParaExcluir(categoria);
    setModalExclusaoAberto(true);
  }, [contarProdutosPorCategoria, mostrarMensagem]);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setCategoriaParaExcluir(null);
  }, []);

  const abrirModalDetalhes = useCallback((categoria: Categoria) => {
    setCategoriaDetalhes(categoria);
    setModalDetalhesAberto(true);
  }, []);

  const fecharModalDetalhes = useCallback(() => {
    setModalDetalhesAberto(false);
    setCategoriaDetalhes(null);
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!validarObrigatorio(formCategoria.nome)) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!validarObrigatorio(formCategoria.cor)) {
      errors.cor = 'Cor é obrigatória';
    }

    // Verificar nome duplicado
    if (!categoriaEditando || formCategoria.nome !== categoriaEditando.nome) {
      const nomeExiste = categorias.some(c => 
        c.nome.toLowerCase() === formCategoria.nome.toLowerCase() && c.id !== categoriaEditando?.id
      );
      if (nomeExiste) {
        errors.nome = 'Já existe uma categoria com este nome';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formCategoria, categoriaEditando, categorias, validarObrigatorio]);

  // Salvar categoria
  const salvarCategoria = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      const dadosCategoria = {
        nome: capitalizarPalavras(formCategoria.nome),
        descricao: formCategoria.descricao || null,
        cor: formCategoria.cor,
        ativa: formCategoria.ativa
      };

      if (categoriaEditando) {
        // Atualizar categoria existente
        const resultado = await atualizarCategoria(categoriaEditando.id, dadosCategoria);
        if (resultado.success) {
          mostrarMensagem('success', 'Categoria atualizada com sucesso!');
          fecharModal();
        } else {
          mostrarMensagem('error', resultado.error || 'Erro ao atualizar categoria');
        }
      } else {
        // Criar nova categoria
        const resultado = await adicionarCategoria(dadosCategoria);
        if (resultado.success) {
          mostrarMensagem('success', 'Categoria criada com sucesso!');
          fecharModal();
        } else {
          mostrarMensagem('error', resultado.error || 'Erro ao criar categoria');
        }
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar categoria');
    } finally {
      setSalvando(false);
    }
  }, [formCategoria, categoriaEditando, capitalizarPalavras, validarFormulario, adicionarCategoria, atualizarCategoria, mostrarMensagem, fecharModal]);

  // Confirmar exclusão
  const confirmarExclusao = useCallback(async () => {
    if (!categoriaParaExcluir) return;

    setSalvando(true);
    
    try {
      const resultado = await excluirCategoria(categoriaParaExcluir.id);
      if (resultado.success) {
        mostrarMensagem('success', `Categoria "${categoriaParaExcluir.nome}" excluída com sucesso!`);
        fecharModalExclusao();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir categoria');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro ao excluir categoria');
    } finally {
      setSalvando(false);
    }
  }, [categoriaParaExcluir, excluirCategoria, mostrarMensagem, fecharModalExclusao]);

  // Obter classe da cor
  const obterClasseCor = useCallback((cor: string): string => {
    const corInfo = CORES_DISPONIVEIS.find(c => c.valor === cor);
    return corInfo?.classe || 'bg-gray-100 text-gray-800';
  }, []);

  // Renderizar categoria em grid
  const renderizarCategoriaGrid = useCallback((categoria: Categoria) => {
    const quantidadeProdutos = contarProdutosPorCategoria(categoria.nome);
    const corInfo = CORES_DISPONIVEIS.find(c => c.valor === categoria.cor);
    
    return (
      <div
        key={categoria.id}
        className={`${tema.papel} rounded-lg border ${tema.borda} p-4 hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => abrirModalDetalhes(categoria)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-8 h-8 rounded-full ${corInfo?.corFundo || 'bg-gray-500'}`}></div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {categoria.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </div>
        
        <h3 className={`text-lg font-semibold ${tema.texto} mb-2`}>
          {categoria.nome}
        </h3>
        
        {categoria.descricao && (
          <p className={`text-sm ${tema.textoSecundario} mb-3`}>
            {categoria.descricao.length > 100 
              ? `${categoria.descricao.substring(0, 100)}...`
              : categoria.descricao
            }
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className={`text-sm ${tema.textoSecundario}`}>
            {quantidadeProdutos} produto(s)
          </span>
          
          {tipoUsuario === 'admin' && (
            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => abrirModal(categoria)}
                className="text-blue-600 hover:text-blue-700"
                title="Editar categoria"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => abrirModalExclusao(categoria)}
                className="text-red-600 hover:text-red-700"
                title="Excluir categoria"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }, [tema, contarProdutosPorCategoria, tipoUsuario, abrirModalDetalhes, abrirModal, abrirModalExclusao]);

  // Verificar permissões
  const podeGerenciar = tipoUsuario === 'admin';

  return (
    <div className={`min-h-screen ${tema.fundo} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${tema.texto} flex items-center`}>
              <Tag className="mr-3 h-6 w-6" />
              Categorias
            </h1>
            <p className={`text-sm ${tema.textoSecundario}`}>
              Gerencie as categorias de produtos
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Alternar visualização */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVisualizacao('grid')}
                className={`p-2 rounded ${
                  visualizacao === 'grid'
                    ? 'bg-blue-600 text-white'
                    : `${tema.papel} ${tema.texto} hover:${tema.hover}`
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setVisualizacao('lista')}
                className={`p-2 rounded ${
                  visualizacao === 'lista'
                    ? 'bg-blue-600 text-white'
                    : `${tema.papel} ${tema.texto} hover:${tema.hover}`
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {podeGerenciar && (
              <button
                onClick={() => abrirModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </button>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <EstatisticasCategorias />

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
                  placeholder="Nome ou descrição..."
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
                <option value="ativa">Apenas Ativas</option>
                <option value="inativa">Apenas Inativas</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className={`text-sm ${tema.textoSecundario}`}>
                {categoriasFiltradas.length} de {categorias.length} categorias
              </div>
            </div>
          </div>
        </div>

        {/* Lista/Grid de Categorias */}
        {visualizacao === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoriasFiltradas.map(renderizarCategoriaGrid)}
          </div>
        ) : (
          <div className={`${tema.papel} rounded-lg border ${tema.borda} overflow-hidden table-responsive`}>
            <div className="custom-scrollbar overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Categoria
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Cor
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Produtos
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                      Data
                    </th>
                    {podeGerenciar && (
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                  {categoriasFiltradas.map((categoria) => {
                    const quantidadeProdutos = contarProdutosPorCategoria(categoria.nome);
                    const corInfo = CORES_DISPONIVEIS.find(c => c.valor === categoria.cor);
                    
                    return (
                      <tr key={categoria.id} className={`${tema.hover} table-hover-row`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${tema.texto}`}>
                              {categoria.nome}
                            </div>
                            {categoria.descricao && (
                              <div className={`text-sm ${tema.textoSecundario}`}>
                                {categoria.descricao.length > 50 
                                  ? `${categoria.descricao.substring(0, 50)}...`
                                  : categoria.descricao
                                }
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full ${corInfo?.corFundo || 'bg-gray-500'} mr-2`}></div>
                            <span className={`text-sm ${tema.texto}`}>
                              {corInfo?.nome || 'Desconhecida'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${tema.texto}`}>
                            {quantidadeProdutos} produto(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {categoria.ativa ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${tema.textoSecundario}`}>
                            {formatarData(categoria.data_cadastro)}
                          </div>
                        </td>
                        {podeGerenciar && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => abrirModalDetalhes(categoria)}
                                className="text-gray-600 hover:text-gray-700"
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => abrirModal(categoria)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Editar categoria"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => abrirModalExclusao(categoria)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir categoria"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {categoriasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <Tag className={`mx-auto h-12 w-12 ${tema.textoSecundario}`} />
                <h3 className={`mt-2 text-sm font-medium ${tema.texto}`}>
                  Nenhuma categoria encontrada
                </h3>
                <p className={`mt-1 text-sm ${tema.textoSecundario}`}>
                  {categorias.length === 0 
                    ? 'Comece criando sua primeira categoria.'
                    : 'Tente ajustar os filtros de busca.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Categoria */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && fecharModal()}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                    {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formCategoria.nome}
                        onChange={(e) => setFormCategoria(prev => ({ ...prev, nome: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.nome ? 'border-red-500' : tema.borda}`}
                        placeholder="Nome da categoria"
                        disabled={salvando}
                      />
                      {formErrors.nome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                      )}
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Descrição
                      </label>
                      <textarea
                        value={formCategoria.descricao}
                        onChange={(e) => setFormCategoria(prev => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${tema.borda}`}
                        placeholder="Descrição da categoria..."
                        disabled={salvando}
                      />
                    </div>

                    {/* Cor */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                        Cor *
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {CORES_DISPONIVEIS.map(cor => (
                          <button
                            key={cor.valor}
                            type="button"
                            onClick={() => setFormCategoria(prev => ({ ...prev, cor: cor.valor }))}
                            className={`
                              relative w-12 h-12 rounded-lg ${cor.corFundo}
                              border-2 ${formCategoria.cor === cor.valor 
                                ? tema.fundo === 'bg-gray-900' 
                                  ? 'border-white' 
                                  : 'border-gray-800'
                                : tema.fundo === 'bg-gray-900'
                                ? 'border-gray-800' 
                                : 'border-gray-300'}
                              hover:scale-110 transition-all duration-200
                            `}
                            title={cor.nome}
                            disabled={salvando}
                          >
                            {formCategoria.cor === cor.valor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className={`text-xs ${tema.textoSecundario} mt-1`}>
                        Cor selecionada: {CORES_DISPONIVEIS.find(c => c.valor === formCategoria.cor)?.nome}
                      </p>
                      {formErrors.cor && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.cor}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Status
                      </label>
                      <select
                        value={formCategoria.ativa ? 'ativa' : 'inativa'}
                        onChange={(e) => setFormCategoria(prev => ({ ...prev, ativa: e.target.value === 'ativa' }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${tema.borda}`}
                        disabled={salvando}
                      >
                        <option value="ativa">Ativa</option>
                        <option value="inativa">Inativa</option>
                      </select>
                    </div>
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
                      onClick={salvarCategoria}
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
                          {categoriaEditando ? 'Atualizar' : 'Criar'}
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
        {modalDetalhesAberto && categoriaDetalhes && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalDetalhes}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4 flex items-center`}>
                    <Eye className="mr-2 h-5 w-5" />
                    Detalhes da Categoria
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className={`text-sm font-medium ${tema.textoSecundario}`}>Nome:</span>
                        <p className={`text-lg font-medium ${tema.texto}`}>{categoriaDetalhes.nome}</p>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${tema.textoSecundario}`}>Status:</span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          categoriaDetalhes.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {categoriaDetalhes.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${tema.textoSecundario}`}>Cor:</span>
                        <div className="flex items-center mt-1">
                          <div className={`w-6 h-6 rounded-full ${CORES_DISPONIVEIS.find(c => c.valor === categoriaDetalhes.cor)?.corFundo || 'bg-gray-500'} mr-2`}></div>
                          <span className={`text-sm ${tema.texto}`}>
                            {CORES_DISPONIVEIS.find(c => c.valor === categoriaDetalhes.cor)?.nome || 'Desconhecida'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${tema.textoSecundario}`}>Produtos:</span>
                        <p className={`text-lg font-medium ${tema.texto}`}>
                          {contarProdutosPorCategoria(categoriaDetalhes.nome)} produto(s)
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${tema.textoSecundario}`}>Criada em:</span>
                        <p className={`text-sm ${tema.texto}`}>
                          {formatarData(categoriaDetalhes.data_cadastro)}
                        </p>
                      </div>
                    </div>

                    {categoriaDetalhes.descricao && (
                      <div>
                        <span className={`text-sm font-medium ${tema.textoSecundario}`}>Descrição:</span>
                        <p className={`text-sm ${tema.texto} mt-1 p-3 ${tema.papel} rounded-lg border ${tema.borda}`}>
                          {categoriaDetalhes.descricao}
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
                    {podeGerenciar && (
                      <button
                        onClick={() => {
                          fecharModalDetalhes();
                          abrirModal(categoriaDetalhes);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && categoriaParaExcluir && (
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
                          Tem certeza que deseja excluir a categoria <strong>{categoriaParaExcluir.nome}</strong>? 
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