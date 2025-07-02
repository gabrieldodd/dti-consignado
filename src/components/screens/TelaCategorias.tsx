// src/components/screens/TelaCategorias.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Palette
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

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

const FORM_INICIAL: CategoriaForm = {
  nome: '',
  descricao: '',
  cor: 'blue',
  ativa: true
};

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
];

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

  // Estados Locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<Categoria | null>(null);
  const [categoriaDetalhes, setCategoriaDetalhes] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<CategoriaForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  // Filtros e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusCategorias') || 'todos';
  });
  const [filtroCor, setFiltroCor] = useState(() => {
    return cookies.getCookie('filtroCorCategorias') || 'todas';
  });

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusCategorias', filtroStatus, 30);
    cookies.setCookie('filtroCorCategorias', filtroCor, 30);
  }, [filtroStatus, filtroCor, cookies]);

  // Função para obter classe da cor
  const obterClasseCor = useCallback((cor: string): string => {
    const corEncontrada = CORES_DISPONIVEIS.find(c => c.valor === cor);
    return corEncontrada?.classeTexto || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  // Contar produtos por categoria
  const contarProdutosPorCategoria = useCallback((nomeCategoria: string): number => {
    return produtos.filter(produto => produto.categoria === nomeCategoria && produto.ativo).length;
  }, [produtos]);

  // Dados filtrados e estatísticas
  const { categoriasFiltradas, estatisticas } = useMemo(() => {
    let filtradas = categorias.filter(categoria => {
      // Filtro de busca
      const matchBusca = !buscaTexto || 
        categoria.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        categoria.descricao.toLowerCase().includes(buscaTexto.toLowerCase());
      
      // Filtro de status
      const matchStatus = filtroStatus === 'todos' || 
        (filtroStatus === 'ativa' && categoria.ativa) ||
        (filtroStatus === 'inativa' && !categoria.ativa);
      
      // Filtro de cor
      const matchCor = filtroCor === 'todas' || categoria.cor === filtroCor;
      
      return matchBusca && matchStatus && matchCor;
    });

    // Calcular estatísticas
    const stats = {
      total: categorias.length,
      ativas: categorias.filter(c => c.ativa).length,
      inativas: categorias.filter(c => !c.ativa).length,
      comProdutos: categorias.filter(c => contarProdutosPorCategoria(c.nome) > 0).length,
      totalProdutos: produtos.filter(p => p.ativo).length
    };

    return { categoriasFiltradas: filtradas, estatisticas: stats };
  }, [categorias, buscaTexto, filtroStatus, filtroCor, contarProdutosPorCategoria, produtos]);

  // Validar formulário
  const validarFormulario = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!validarObrigatorio(formData.nome)) {
      errors.nome = 'Nome é obrigatório';
    } else if (!validarTamanhoMinimo(formData.nome, 2)) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else if (!validarTamanhoMaximo(formData.nome, 50)) {
      errors.nome = 'Nome deve ter no máximo 50 caracteres';
    }

    // Verificar se nome já existe (exceto para edição da própria categoria)
    const nomeExiste = categorias.some(cat => 
      cat.nome.toLowerCase() === formData.nome.toLowerCase() && 
      (!categoriaEditando || cat.id !== categoriaEditando.id)
    );
    
    if (nomeExiste) {
      errors.nome = 'Já existe uma categoria com este nome';
    }

    if (formData.descricao && !validarTamanhoMaximo(formData.descricao, 200)) {
      errors.descricao = 'Descrição deve ter no máximo 200 caracteres';
    }

    if (!validarObrigatorio(formData.cor)) {
      errors.cor = 'Cor é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, categorias, categoriaEditando, validarObrigatorio, validarTamanhoMinimo, validarTamanhoMaximo]);

  // Funções de CRUD
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
  }, []);

  const salvarCategoria = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    try {
      const categoriaData: Omit<Categoria, 'id' | 'dataCadastro'> = {
        nome: capitalizarPalavras(formData.nome.trim()),
        descricao: formData.descricao.trim(),
        cor: formData.cor,
        ativa: formData.ativa
      };

      if (categoriaEditando) {
        // Editar categoria existente
        setCategorias(prev => prev.map(categoria => 
          categoria.id === categoriaEditando.id 
            ? { ...categoria, ...categoriaData }
            : categoria
        ));
        mostrarMensagem('success', 'Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
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
  }, [formData, categoriaEditando, categorias, validarFormulario, setCategorias, mostrarMensagem, fecharModal, capitalizarPalavras]);

  const confirmarExclusao = useCallback((categoria: Categoria) => {
    // Verificar se categoria tem produtos
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
    // Se está desativando, verificar se tem produtos
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

  const verDetalhes = useCallback((categoria: Categoria) => {
    setCategoriaDetalhes(categoria);
    setModalDetalhesAberto(true);
  }, []);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h1 className={`text-3xl font-bold ${tema.texto} mb-2`}>
            Categorias
          </h1>
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

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Total</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>
                {formatarNumero(estatisticas.total)}
              </p>
            </div>
            <Tags className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Ativas</p>
              <p className={`text-2xl font-bold text-green-600`}>
                {formatarNumero(estatisticas.ativas)}
              </p>
            </div>
            <Tags className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Inativas</p>
              <p className={`text-2xl font-bold text-red-600`}>
                {formatarNumero(estatisticas.inativas)}
              </p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Com Produtos</p>
              <p className={`text-2xl font-bold text-purple-600`}>
                {formatarNumero(estatisticas.comProdutos)}
              </p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textoSecundario}`}>Total Produtos</p>
              <p className={`text-2xl font-bold text-indigo-600`}>
                {formatarNumero(estatisticas.totalProdutos)}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
              />
            </div>
          </div>

          {/* Filtro Status */}
          <div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos os status</option>
              <option value="ativa">Apenas ativas</option>
              <option value="inativa">Apenas inativas</option>
            </select>
          </div>

          {/* Filtro Cor */}
          <div>
            <select
              value={filtroCor}
              onChange={(e) => setFiltroCor(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todas">Todas as cores</option>
              {CORES_DISPONIVEIS.map(cor => (
                <option key={cor.valor} value={cor.valor}>{cor.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm ${tema.textoSecundario}`}>
            {categoriasFiltradas.length} de {categorias.length} categorias
          </span>
          {(buscaTexto || filtroStatus !== 'todos' || filtroCor !== 'todas') && (
            <button
              onClick={() => {
                setBuscaTexto('');
                setFiltroStatus('todos');
                setFiltroCor('todas');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        {/* Desktop: Tabela */}
        <div className="hidden lg:block">
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
                  Data Cadastro
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
                      <div>
                        <div className={`text-sm font-medium ${tema.texto}`}>
                          {categoria.nome}
                        </div>
                        {categoria.descricao && (
                          <div className={`text-sm ${tema.textoSecundario} truncate max-w-xs`}>
                            {categoria.descricao}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${CORES_DISPONIVEIS.find(c => c.valor === categoria.cor)?.classe || 'bg-gray-500'}`}></div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${obterClasseCor(categoria.cor)}`}>
                          {CORES_DISPONIVEIS.find(c => c.valor === categoria.cor)?.nome || 'Indefinida'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${tema.texto}`}>
                        {formatarNumero(quantidadeProdutos)} produto(s)
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
                          onClick={() => verDetalhes(categoria)}
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

        {/* Mobile: Cards */}
        <div className="lg:hidden">
          {categoriasFiltradas.map((categoria) => {
            const quantidadeProdutos = contarProdutosPorCategoria(categoria.nome);
            return (
              <div key={categoria.id} className={`p-4 border-b ${tema.borda} last:border-b-0`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-medium ${tema.texto}`}>
                    {categoria.nome}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                    onClick={() => verDetalhes(categoria)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => abrirModal(categoria)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alternarStatus(categoria)}
                    className={categoria.ativa ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                  >
                    {categoria.ativa ? <X className="h-4 w-4" /> : <Tags className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => confirmarExclusao(categoria)}
                    className="text-red-600 hover:text-red-700"
                    disabled={quantidadeProdutos > 0}
                  >
                    <Trash2 className={`h-4 w-4 ${quantidadeProdutos > 0 ? 'opacity-50' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

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
            {categorias.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => abrirModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Categoria
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
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${tema.papel} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${tema.texto}`}>
                    {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                  </h3>
                  <button
                    onClick={fecharModal}
                    className={`${tema.textoSecundario} hover:${tema.texto}`}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.nome ? 'border-red-500' : ''
                      } ${tema.input}`}
                      placeholder="Digite o nome da categoria"
                      maxLength={50}
                    />
                    {formErrors.nome && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.descricao ? 'border-red-500' : ''
                      } ${tema.input}`}
                      placeholder="Digite uma descrição para a categoria"
                      maxLength={200}
                    />
                    {formErrors.descricao && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.descricao}</p>
                    )}
                    <p className={`mt-1 text-xs ${tema.textoSecundario}`}>
                      {formData.descricao.length}/200 caracteres
                    </p>
                  </div>

                  {/* Cor */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Cor da Categoria *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {CORES_DISPONIVEIS.map(cor => (
                        <button
                          key={cor.valor}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, cor: cor.valor }))}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                            formData.cor === cor.valor 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={cor.nome}
                        >
                          <div className={`w-6 h-6 rounded-full ${cor.classe} mb-1`}></div>
                          <span className="text-xs text-center">{cor.nome}</span>
                        </button>
                      ))}
                    </div>
                    {formErrors.cor && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cor}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.ativa}
                        onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`ml-2 text-sm ${tema.texto}`}>
                        Categoria ativa
                      </span>
                    </label>
                  </div>
                </form>
              </div>

              <div className={`${tema.fundo} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  onClick={salvarCategoria}
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
                      {categoriaEditando ? 'Atualizar' : 'Criar'}
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
      {modalExclusaoAberto && categoriaParaExcluir && (
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
                      Excluir Categoria
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
              <div className={`${tema.fundo} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  onClick={excluirCategoria}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Excluir
                </button>
                <button
                  onClick={() => {
                    setModalExclusaoAberto(false);
                    setCategoriaParaExcluir(null);
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
      {modalDetalhesAberto && categoriaDetalhes && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalDetalhesAberto(false)}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${tema.papel} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${tema.texto}`}>
                    Detalhes da Categoria
                  </h3>
                  <button
                    onClick={() => setModalDetalhesAberto(false)}
                    className={`${tema.textoSecundario} hover:${tema.texto}`}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                      Nome
                    </label>
                    <p className={`mt-1 text-sm ${tema.texto}`}>
                      {categoriaDetalhes.nome}
                    </p>
                  </div>

                  {categoriaDetalhes.descricao && (
                    <div>
                      <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                        Descrição
                      </label>
                      <p className={`mt-1 text-sm ${tema.texto}`}>
                        {categoriaDetalhes.descricao}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                      Cor
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${CORES_DISPONIVEIS.find(c => c.valor === categoriaDetalhes.cor)?.classe || 'bg-gray-500'}`}></div>
                      <span className={`text-sm ${tema.texto}`}>
                        {CORES_DISPONIVEIS.find(c => c.valor === categoriaDetalhes.cor)?.nome || 'Indefinida'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                      Status
                    </label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      categoriaDetalhes.ativa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoriaDetalhes.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                      Produtos
                    </label>
                    <p className={`mt-1 text-sm ${tema.texto}`}>
                      {formatarNumero(contarProdutosPorCategoria(categoriaDetalhes.nome))} produto(s) ativo(s)
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.textoSecundario}`}>
                      Data de Cadastro
                    </label>
                    <p className={`mt-1 text-sm ${tema.texto}`}>
                      {formatarData(categoriaDetalhes.dataCadastro)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${tema.fundo} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  onClick={() => {
                    setModalDetalhesAberto(false);
                    abrirModal(categoriaDetalhes);
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