// TelaCategorias.tsx - Versão Otimizada para Evitar Travamentos
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { 
  Tags, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Save,
  AlertTriangle,
  Package,
  BarChart3,
  Palette,
  Grid,
  List
} from 'lucide-react';

// Hook imports
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

// Interfaces otimizadas
interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
  dataCadastro: string;
}

interface CategoriaForm {
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
}

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  ativo: boolean;
}

// Formulário inicial
const FORM_INICIAL: CategoriaForm = {
  nome: '',
  descricao: '',
  cor: 'blue',
  ativa: true
};

// Cores disponíveis com otimização
const CORES_DISPONIVEIS = [
  { valor: 'blue', nome: 'Azul', classe: 'bg-blue-500', classeTexto: 'bg-blue-100 text-blue-800 border-blue-200' },
  { valor: 'green', nome: 'Verde', classe: 'bg-green-500', classeTexto: 'bg-green-100 text-green-800 border-green-200' },
  { valor: 'red', nome: 'Vermelho', classe: 'bg-red-500', classeTexto: 'bg-red-100 text-red-800 border-red-200' },
  { valor: 'yellow', nome: 'Amarelo', classe: 'bg-yellow-500', classeTexto: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { valor: 'purple', nome: 'Roxo', classe: 'bg-purple-500', classeTexto: 'bg-purple-100 text-purple-800 border-purple-200' },
  { valor: 'pink', nome: 'Rosa', classe: 'bg-pink-500', classeTexto: 'bg-pink-100 text-pink-800 border-pink-200' },
  { valor: 'indigo', nome: 'Índigo', classe: 'bg-indigo-500', classeTexto: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { valor: 'orange', nome: 'Laranja', classe: 'bg-orange-500', classeTexto: 'bg-orange-100 text-orange-800 border-orange-200' },
  { valor: 'teal', nome: 'Verde Água', classe: 'bg-teal-500', classeTexto: 'bg-teal-100 text-teal-800 border-teal-200' },
  { valor: 'gray', nome: 'Cinza', classe: 'bg-gray-500', classeTexto: 'bg-gray-100 text-gray-800 border-gray-200' }
] as const;

// Componente de estatísticas memoizado
const EstatisticasCategorias = memo(({ categorias, produtos, tema }: { 
  categorias: Categoria[], 
  produtos: Produto[],
  tema: any 
}) => {
  const estatisticas = useMemo(() => {
    const total = categorias.length;
    const ativas = categorias.filter(c => c.ativa).length;
    const inativas = categorias.filter(c => !c.ativa).length;
    
    // Contar produtos por categoria de forma otimizada
    const produtosPorCategoria = produtos.reduce((acc, produto) => {
      if (produto.ativo) {
        acc[produto.categoria] = (acc[produto.categoria] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const categoriasComProdutos = Object.keys(produtosPorCategoria).length;
    
    return { total, ativas, inativas, categoriasComProdutos };
  }, [categorias, produtos]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Total</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.total}</p>
          </div>
          <Tags className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Ativas</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.ativas}</p>
          </div>
          <Package className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Inativas</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.inativas}</p>
          </div>
          <X className="h-8 w-8 text-red-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Com Produtos</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.categoriasComProdutos}</p>
          </div>
          <BarChart3 className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
});

// Componente de seletor de cor memoizado
const SeletorCor = memo(({ corSelecionada, onCorChange, tema }: {
  corSelecionada: string;
  onCorChange: (cor: string) => void;
  tema: any;
}) => {
  return (
    <div>
      <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
        Cor *
      </label>
      <div className="grid grid-cols-5 gap-2">
        {CORES_DISPONIVEIS.map((cor) => (
          <button
            key={cor.valor}
            type="button"
            onClick={() => onCorChange(cor.valor)}
            className={`
              relative w-10 h-10 rounded-full ${cor.classe} 
              border-2 ${corSelecionada === cor.valor ? 'border-gray-800' : 'border-gray-300'}
              hover:scale-110 transition-all duration-200
            `}
            title={cor.nome}
          >
            {corSelecionada === cor.valor && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className={`text-xs ${tema.textoSecundario} mt-1`}>
        Cor selecionada: {CORES_DISPONIVEIS.find(c => c.valor === corSelecionada)?.nome}
      </p>
    </div>
  );
});

// Componente principal otimizado
export const TelaCategorias: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    categorias, 
    setCategorias,
    produtos,
    mostrarMensagem,
    cookies 
  } = useAppContext();
  
  const { formatarData, formatarNumero, capitalizarPalavras } = useFormatters();
  const { validarObrigatorio, validarTamanhoMinimo, validarTamanhoMaximo } = useValidation();
  // Estados com inicialização otimizada
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<Categoria | null>(null);
  const [categoriaDetalhes, setCategoriaDetalhes] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<CategoriaForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'lista' | 'grid'>('grid');

  // Filtros com carregamento otimizado dos cookies
  const [filtros, setFiltros] = useState(() => ({
    status: cookies.getCookie('filtroStatusCategorias') || 'todos',
    cor: cookies.getCookie('filtroCorCategorias') || 'todas',
    busca: ''
  }));

  // Função para contar produtos por categoria memoizada
  const contarProdutosPorCategoria = useCallback((nomeCategoria: string) => {
    return produtos.filter(produto => produto.categoria === nomeCategoria && produto.ativo).length;
  }, [produtos]);

  // Salvar filtros nos cookies de forma otimizada
  const salvarFiltros = useCallback((novosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => {
      const filtrosAtualizados = { ...prev, ...novosFiltros };
      
      // Salvar nos cookies apenas se mudaram
      if (novosFiltros.status && novosFiltros.status !== prev.status) {
        cookies.setCookie('filtroStatusCategorias', novosFiltros.status, 30);
      }
      if (novosFiltros.cor && novosFiltros.cor !== prev.cor) {
        cookies.setCookie('filtroCorCategorias', novosFiltros.cor, 30);
      }
      
      return filtrosAtualizados;
    });
  }, [cookies]);

  // Categorias filtradas memoizadas
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter(categoria => {
      const passaStatus = filtros.status === 'todos' || 
        (filtros.status === 'ativas' && categoria.ativa) ||
        (filtros.status === 'inativas' && !categoria.ativa);
      
      const passaCor = filtros.cor === 'todas' || categoria.cor === filtros.cor;
      
      const passaBusca = !filtros.busca || 
        categoria.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        categoria.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
      
      return passaStatus && passaCor && passaBusca;
    });
  }, [categorias, filtros]);

  // Validação memoizada
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome da categoria é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.nome.trim().length > 50) {
      errors.nome = 'Nome deve ter no máximo 50 caracteres';
    }

    // Verificar nome duplicado
    const nomeExiste = categorias.some(categoria => 
      categoria.nome.toLowerCase() === formData.nome.trim().toLowerCase() &&
      categoria.id !== categoriaEditando?.id
    );
    
    if (nomeExiste) {
      errors.nome = 'Já existe uma categoria com este nome';
    }

    if (formData.descricao.length > 200) {
      errors.descricao = 'Descrição deve ter no máximo 200 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, categorias, categoriaEditando]);

  // Handlers otimizados com useCallback
  const abrirModal = useCallback((categoria?: Categoria) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormData({
        nome: categoria.nome,
        descricao: categoria.descricao,
        cor: categoria.cor,
        ativa: categoria.ativa
      });
    } else {
      setCategoriaEditando(null);
      setFormData(FORM_INICIAL);
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setFormData(FORM_INICIAL);
    setFormErrors({});
    setSalvando(false);
  }, []);

  const abrirModalDetalhes = useCallback((categoria: Categoria) => {
    setCategoriaDetalhes(categoria);
    setModalDetalhesAberto(true);
  }, []);

  const fecharModalDetalhes = useCallback(() => {
    setModalDetalhesAberto(false);
    setCategoriaDetalhes(null);
  }, []);

  const confirmarExclusao = useCallback((categoria: Categoria) => {
    const quantidadeProdutos = contarProdutosPorCategoria(categoria.nome);
    if (quantidadeProdutos > 0) {
      mostrarMensagem('error', `Não é possível excluir. Categoria possui ${quantidadeProdutos} produto(s) ativo(s).`);
      return;
    }

    setCategoriaParaExcluir(categoria);
    setModalExclusaoAberto(true);
  }, [contarProdutosPorCategoria, mostrarMensagem]);

  const excluirCategoria = useCallback(() => {
    if (!categoriaParaExcluir) return;

    setCategorias(prev => prev.filter(categoria => categoria.id !== categoriaParaExcluir.id));
    mostrarMensagem('success', 'Categoria excluída com sucesso!');
    setModalExclusaoAberto(false);
    setCategoriaParaExcluir(null);
  }, [categoriaParaExcluir, setCategorias, mostrarMensagem]);

  const alternarStatus = useCallback((categoria: Categoria) => {
    if (categoria.ativa) {
      const quantidadeProdutos = contarProdutosPorCategoria(categoria.nome);
      if (quantidadeProdutos > 0) {
        mostrarMensagem('error', `Não é possível desativar. Categoria possui ${quantidadeProdutos} produto(s) ativo(s).`);
        return;
      }
    }

    setCategorias(prev => prev.map(c => 
      c.id === categoria.id 
        ? { ...c, ativa: !c.ativa }
        : c
    ));
    const novoStatus = categoria.ativa ? 'desativada' : 'ativada';
    mostrarMensagem('success', `Categoria ${novoStatus} com sucesso!`);
  }, [setCategorias, mostrarMensagem, contarProdutosPorCategoria]);

  const salvarCategoria = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay

      const categoriaData = {
        nome: capitalizarPalavras(formData.nome.trim()),
        descricao: formData.descricao.trim(),
        cor: formData.cor,
        ativa: formData.ativa
      };

      if (categoriaEditando) {
        setCategorias(prev => prev.map(categoria =>
          categoria.id === categoriaEditando.id
            ? { ...categoria, ...categoriaData }
            : categoria
        ));
        mostrarMensagem('success', 'Categoria atualizada com sucesso!');
      } else {
        const novaCategoria: Categoria = {
          ...categoriaData,
          id: Math.max(...categorias.map(c => c.id), 0) + 1,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setCategorias(prev => [...prev, novaCategoria]);
        mostrarMensagem('success', 'Categoria criada com sucesso!');
      }

      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      mostrarMensagem('error', 'Erro ao salvar categoria');
    } finally {
      setSalvando(false);
    }
  }, [validarFormulario, formData, categoriaEditando, categorias, setCategorias, mostrarMensagem, fecharModal, capitalizarPalavras]);

  // Atualizar busca com debounce implícito
  const atualizarBusca = useCallback((valor: string) => {
    salvarFiltros({ busca: valor });
  }, [salvarFiltros]);

  // Renderizar categoria no grid
  const renderizarCategoriaGrid = useCallback((categoria: Categoria) => {
    const quantidadeProdutos = contarProdutosPorCategoria(categoria.nome);
    
    return (
      <div key={categoria.id} className={`${tema.papel} rounded-lg border ${tema.borda} p-4 hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-lg font-semibold ${tema.texto}`}>
            {categoria.nome}
          </h3>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            categoria.ativa 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {categoria.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </div>
        
        {categoria.descricao && (
          <div className={`text-sm ${tema.textoSecundario} mb-2`}>
            {categoria.descricao}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${CORES_DISPONIVEIS.find(c => c.valor === categoria.cor)?.classe || 'bg-gray-500'}`}></div>
            <span className={`text-sm ${tema.textoSecundario}`}>
              {CORES_DISPONIVEIS.find(c => c.valor === categoria.cor)?.nome || 'Indefinida'}
            </span>
          </div>
          <span className={`text-sm ${tema.texto}`}>
            {formatarNumero(quantidadeProdutos)} produto(s)
          </span>
        </div>
        
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => abrirModalDetalhes(categoria)}
            className="text-blue-600 hover:text-blue-700"
            title="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => abrirModal(categoria)}
            className="text-indigo-600 hover:text-indigo-700"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => alternarStatus(categoria)}
            className={categoria.ativa ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
            title={categoria.ativa ? "Desativar" : "Ativar"}
          >
            {categoria.ativa ? <X className="h-4 w-4" /> : <Tags className="h-4 w-4" />}
          </button>
          <button
            onClick={() => confirmarExclusao(categoria)}
            className="text-red-600 hover:text-red-700"
            title="Excluir"
            disabled={quantidadeProdutos > 0}
          >
            <Trash2 className={`h-4 w-4 ${quantidadeProdutos > 0 ? 'opacity-50' : ''}`} />
          </button>
        </div>
      </div>
    );
  }, [tema, contarProdutosPorCategoria, formatarNumero, abrirModalDetalhes, abrirModal, alternarStatus, confirmarExclusao]);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h1 className={`text-3xl font-bold ${tema.texto} mb-2`}>Categorias</h1>
          <p className={`${tema.textoSecundario}`}>
            Organize os produtos em categorias para facilitar a gestão
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {/* Estatísticas Memoizadas */}
      <EstatisticasCategorias categorias={categorias} produtos={produtos} tema={tema} />

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="Nome ou descrição..."
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
              onChange={(e) => salvarFiltros({ status: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
              Cor
            </label>
            <select
              value={filtros.cor}
              onChange={(e) => salvarFiltros({ cor: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todas">Todas</option>
              {CORES_DISPONIVEIS.map((cor) => (
                <option key={cor.valor} value={cor.valor}>
                  {cor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
              Visualização
            </label>
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setVisualizacao('grid')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  visualizacao === 'grid'
                    ? 'bg-blue-600 text-white'
                    : `${tema.papel} ${tema.texto} hover:${tema.hover}`
                }`}
              >
                <Grid className="h-4 w-4 mx-auto" />
              </button>
              <button
                onClick={() => setVisualizacao('lista')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  visualizacao === 'lista'
                    ? 'bg-blue-600 text-white'
                    : `${tema.papel} ${tema.texto} hover:${tema.hover}`
                }`}
              >
                <List className="h-4 w-4 mx-auto" />
              </button>
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
        <div className={`${tema.papel} rounded-lg border ${tema.borda} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={tema.fundo}>
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
                  <th className={`px-6 py-3 text-right text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                {categoriasFiltradas.map((categoria) => {
                  const quantidadeProdutos = contarProdutosPorCategoria(categoria.nome);
                  
                  return (
                    <tr key={categoria.id} className={tema.hover}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${tema.texto}`}>
                          {categoria.nome}
                        </div>
                        {categoria.descricao && (
                          <div className={`text-sm ${tema.textoSecundario}`}>
                            {categoria.descricao}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-2 ${CORES_DISPONIVEIS.find(c => c.valor === categoria.cor)?.classe || 'bg-gray-500'}`}></div>
                          <span className={`text-sm ${tema.texto}`}>
                            {CORES_DISPONIVEIS.find(c => c.valor === categoria.cor)?.nome || 'Indefinida'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${tema.texto}`}>
                          {formatarNumero(quantidadeProdutos)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          categoria.ativa 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {categoria.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${tema.textoSecundario}`}>
                          {formatarData(categoria.dataCadastro)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => abrirModalDetalhes(categoria)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => abrirModal(categoria)}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => alternarStatus(categoria)}
                            className={categoria.ativa ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                            title={categoria.ativa ? "Desativar" : "Ativar"}
                          >
                            {categoria.ativa ? <X className="h-4 w-4" /> : <Tags className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => confirmarExclusao(categoria)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir"
                            disabled={quantidadeProdutos > 0}
                          >
                            <Trash2 className={`h-4 w-4 ${quantidadeProdutos > 0 ? 'opacity-50' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {categoriasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <Tags className={`mx-auto h-12 w-12 ${tema.textoSecundario}`} />
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

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl max-w-2xl w-full`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${tema.texto}`}>
                  {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button
                  onClick={fecharModal}
                  className={`${tema.textoSecundario} hover:${tema.texto}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''}`}
                    placeholder="Nome da categoria"
                    maxLength={50}
                  />
                  {formErrors.nome && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.nome}
                    </p>
                  )}
                  <p className={`text-xs ${tema.textoSecundario} mt-1`}>
                    {formData.nome.length}/50 caracteres
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.descricao ? 'border-red-500' : ''}`}
                    placeholder="Descrição da categoria (opcional)"
                    maxLength={200}
                  />
                  {formErrors.descricao && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {formErrors.descricao}
                    </p>
                  )}
                  <p className={`text-xs ${tema.textoSecundario} mt-1`}>
                    {formData.descricao.length}/200 caracteres
                  </p>
                </div>

                <SeletorCor 
                  corSelecionada={formData.cor}
                  onCorChange={(cor) => setFormData(prev => ({ ...prev, cor }))}
                  tema={tema}
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativa"
                    checked={formData.ativa}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ativa" className={`ml-2 text-sm ${tema.texto}`}>
                    Categoria ativa
                  </label>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {salvando ? 'Salvando...' : (categoriaEditando ? 'Atualizar' : 'Salvar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modalExclusaoAberto && categoriaParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl max-w-md w-full`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className={`text-lg leading-6 font-medium ${tema.texto} mb-2`}>
                  Excluir Categoria
                </h3>
                <p className={`text-sm ${tema.textoSecundario} mb-4`}>
                  Tem certeza que deseja excluir a categoria "{categoriaParaExcluir.nome}"?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setModalExclusaoAberto(false)}
                  className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={excluirCategoria}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalDetalhesAberto && categoriaDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${tema.papel} rounded-lg shadow-xl max-w-2xl w-full`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${tema.texto}`}>
                  Detalhes da Categoria
                </h2>
                <button
                  onClick={fecharModalDetalhes}
                  className={`${tema.textoSecundario} hover:${tema.texto}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario} mb-1`}>
                      Nome
                    </label>
                    <p className={`text-lg font-medium ${tema.texto}`}>
                      {categoriaDetalhes.nome}
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario} mb-1`}>
                      Status
                    </label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      categoriaDetalhes.ativa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoriaDetalhes.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario} mb-1`}>
                      Cor
                    </label>
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full mr-3 ${CORES_DISPONIVEIS.find(c => c.valor === categoriaDetalhes.cor)?.classe || 'bg-gray-500'}`}></div>
                      <span className={`text-sm ${tema.texto}`}>
                        {CORES_DISPONIVEIS.find(c => c.valor === categoriaDetalhes.cor)?.nome || 'Indefinida'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario} mb-1`}>
                      Produtos Ativos
                    </label>
                    <p className={`text-lg font-medium ${tema.texto}`}>
                      {formatarNumero(contarProdutosPorCategoria(categoriaDetalhes.nome))}
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario} mb-1`}>
                      Data de Cadastro
                    </label>
                    <p className={`text-sm ${tema.texto}`}>
                      {formatarData(categoriaDetalhes.dataCadastro)}
                    </p>
                  </div>
                </div>

                {categoriaDetalhes.descricao && (
                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario} mb-2`}>
                      Descrição
                    </label>
                    <p className={`text-sm ${tema.texto} ${tema.papel} p-3 rounded-lg border ${tema.borda}`}>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};