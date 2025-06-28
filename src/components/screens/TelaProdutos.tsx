// src/components/screens/TelaProdutos.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, Barcode, DollarSign } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';
import { Produto } from '../../types/Produto';
import { Categoria } from '../../types/Categoria';

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
  
  const { formatarMoedaBR } = useFormatters();
  const { validarCodigoBarras } = useValidation();

  // Estados Locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Filtros e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(() => {
    return cookies.getCookie('filtroCategoriasProdutos') || 'todas';
  });
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusProdutos') || 'todos';
  });

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroCategoriasProdutos', filtroCategoria, 30);
    cookies.setCookie('filtroStatusProdutos', filtroStatus, 30);
  }, [filtroCategoria, filtroStatus, cookies]);

  // Formulário
  const [formProduto, setFormProduto] = useState<ProdutoForm>({
    nome: '',
    descricao: '',
    codigoBarras: '',
    categoria: '',
    valorCusto: '',
    valorVenda: '',
    estoque: '',
    estoqueMinimo: '',
    ativo: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dados Filtrados
  const produtosFiltrados = useMemo(() => {
    let resultado = produtos;

    // Filtro por categoria
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter((p: Produto) => p.categoria === filtroCategoria);
    }

    // Filtro por status
    if (filtroStatus === 'ativo') {
      resultado = resultado.filter((p: Produto) => p.ativo);
    } else if (filtroStatus === 'inativo') {
      resultado = resultado.filter((p: Produto) => !p.ativo);
    } else if (filtroStatus === 'estoque-baixo') {
      resultado = resultado.filter((p: Produto) => p.ativo && p.estoque <= p.estoqueMinimo);
    }

    // Filtro por busca
    if (buscaTexto.trim()) {
      const busca = buscaTexto.toLowerCase().trim();
      resultado = resultado.filter((p: Produto) => 
        p.nome.toLowerCase().includes(busca) ||
        p.descricao.toLowerCase().includes(busca) ||
        p.codigoBarras.includes(busca) ||
        p.categoria.toLowerCase().includes(busca)
      );
    }

    return resultado;
  }, [produtos, filtroCategoria, filtroStatus, buscaTexto]);

  // Funções de Modal
  const abrirModal = useCallback((produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto);
      setFormProduto({
        nome: produto.nome,
        descricao: produto.descricao,
        codigoBarras: produto.codigoBarras,
        categoria: produto.categoria,
        valorCusto: produto.valorCusto.toString(),
        valorVenda: produto.valorVenda.toString(),
        estoque: produto.estoque.toString(),
        estoqueMinimo: produto.estoqueMinimo.toString(),
        ativo: produto.ativo
      });
    } else {
      setProdutoEditando(null);
      setFormProduto({
        nome: '',
        descricao: '',
        codigoBarras: '',
        categoria: '',
        valorCusto: '',
        valorVenda: '',
        estoque: '',
        estoqueMinimo: '',
        ativo: true
      });
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setProdutoEditando(null);
    setSalvando(false);
  }, []);

  const abrirModalExclusao = useCallback((produto: Produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setProdutoParaExcluir(null);
  }, []);

  // Validação do Formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    // Nome
    if (!formProduto.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formProduto.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Descrição
    if (!formProduto.descricao.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    }

    // Código de Barras
    if (!formProduto.codigoBarras.trim()) {
      errors.codigoBarras = 'Código de barras é obrigatório';
    } else if (!validarCodigoBarras(formProduto.codigoBarras)) {
      errors.codigoBarras = 'Código de barras deve ter pelo menos 8 dígitos';
    } else {
      // Verificar se código já existe
      const codigoExiste = produtos.find((p: Produto) => 
        p.codigoBarras === formProduto.codigoBarras && p.id !== produtoEditando?.id
      );
      if (codigoExiste) {
        errors.codigoBarras = 'Este código de barras já está em uso';
      }
    }

    // Categoria
    if (!formProduto.categoria) {
      errors.categoria = 'Categoria é obrigatória';
    }

    // Valor de Custo
    const valorCusto = parseFloat(formProduto.valorCusto);
    if (!formProduto.valorCusto || isNaN(valorCusto) || valorCusto <= 0) {
      errors.valorCusto = 'Valor de custo deve ser maior que zero';
    }

    // Valor de Venda
    const valorVenda = parseFloat(formProduto.valorVenda);
    if (!formProduto.valorVenda || isNaN(valorVenda) || valorVenda <= 0) {
      errors.valorVenda = 'Valor de venda deve ser maior que zero';
    } else if (valorVenda <= valorCusto) {
      errors.valorVenda = 'Valor de venda deve ser maior que o custo';
    }

    // Estoque
    const estoque = parseInt(formProduto.estoque);
    if (!formProduto.estoque || isNaN(estoque) || estoque < 0) {
      errors.estoque = 'Estoque não pode ser negativo';
    }

    // Estoque Mínimo
    const estoqueMinimo = parseInt(formProduto.estoqueMinimo);
    if (!formProduto.estoqueMinimo || isNaN(estoqueMinimo) || estoqueMinimo < 0) {
      errors.estoqueMinimo = 'Estoque mínimo não pode ser negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formProduto, produtos, produtoEditando, validarCodigoBarras]);

  // Salvar Produto
  const salvarProduto = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    try {
      if (produtoEditando) {
        // Atualizar produto existente
        const produtoAtualizado: Produto = {
          ...produtoEditando,
          nome: formProduto.nome.trim(),
          descricao: formProduto.descricao.trim(),
          codigoBarras: formProduto.codigoBarras.trim(),
          categoria: formProduto.categoria,
          valorCusto: parseFloat(formProduto.valorCusto),
          valorVenda: parseFloat(formProduto.valorVenda),
          estoque: parseInt(formProduto.estoque),
          estoqueMinimo: parseInt(formProduto.estoqueMinimo),
          ativo: formProduto.ativo
        };
        
        setProdutos((prev: Produto[]) => 
          prev.map(p => p.id === produtoEditando.id ? produtoAtualizado : p)
        );
        mostrarMensagem('success', 'Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        const novoId = Math.max(...produtos.map((p: Produto) => p.id), 0) + 1;
        const novoProduto: Produto = {
          id: novoId,
          nome: formProduto.nome.trim(),
          descricao: formProduto.descricao.trim(),
          codigoBarras: formProduto.codigoBarras.trim(),
          categoria: formProduto.categoria,
          valorCusto: parseFloat(formProduto.valorCusto),
          valorVenda: parseFloat(formProduto.valorVenda),
          estoque: parseInt(formProduto.estoque),
          estoqueMinimo: parseInt(formProduto.estoqueMinimo),
          ativo: formProduto.ativo,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        
        setProdutos((prev: Produto[]) => [...prev, novoProduto]);
        mostrarMensagem('success', 'Produto criado com sucesso!');
      }

      fecharModal();
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar produto');
    } finally {
      setSalvando(false);
    }
  }, [formProduto, produtoEditando, produtos, setProdutos, mostrarMensagem, validarFormulario, fecharModal]);

  // Excluir Produto
  const confirmarExclusao = useCallback(() => {
    if (!produtoParaExcluir) return;

    setProdutos((prev: Produto[]) => 
      prev.filter(p => p.id !== produtoParaExcluir.id)
    );
    mostrarMensagem('success', `Produto "${produtoParaExcluir.nome}" excluído com sucesso!`);
    fecharModalExclusao();
  }, [produtoParaExcluir, setProdutos, mostrarMensagem, fecharModalExclusao]);

  // Calcular margem de lucro
  const calcularMargem = useCallback((custo: number, venda: number) => {
    if (custo <= 0) return 0;
    return ((venda - custo) / custo) * 100;
  }, []);

  // Render
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>Produtos</h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie o catálogo de produtos
            </p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
              />
            </div>
            
            {/* Filtro Categoria */}
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todas">Todas as categorias</option>
              {categorias.filter((c: Categoria) => c.ativa).map((categoria: Categoria) => (
                <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
              ))}
            </select>
            
            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Apenas Ativos</option>
              <option value="inativo">Apenas Inativos</option>
              <option value="estoque-baixo">Estoque Baixo</option>
            </select>
            
            {/* Contador */}
            <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
              <span className="font-semibold">{produtosFiltrados.length}</span>
              <span className="mx-1">de</span>
              <span className="font-semibold">{produtos.length}</span>
            </div>
          </div>
        </div>

        {/* Tabela Desktop */}
        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-50'}>
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                {produtosFiltrados.map((produto: Produto) => (
                  <tr key={produto.id} className={`${tema.hover} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center`}>
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${tema.texto}`}>
                            {produto.nome}
                          </div>
                          <div className={`text-sm ${tema.textoSecundario} flex items-center`}>
                            <Barcode className="h-3 w-3 mr-1" />
                            {produto.codigoBarras}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                      {produto.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${tema.texto}`}>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatarMoedaBR(produto.valorVenda)}
                        </div>
                        <div className={`text-xs ${tema.textoSecundario}`}>
                          Custo: {formatarMoedaBR(produto.valorCusto)}
                        </div>
                        <div className="text-xs text-green-600">
                          +{calcularMargem(produto.valorCusto, produto.valorVenda).toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : tema.texto}`}>
                        <div className="font-medium">{produto.estoque}</div>
                        <div className="text-xs">Mín: {produto.estoqueMinimo}</div>
                        {produto.estoque <= produto.estoqueMinimo && (
                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Baixo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        produto.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => abrirModal(produto)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Editar produto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => abrirModalExclusao(produto)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Excluir produto"
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

          {/* Cards Mobile/Tablet */}
          <div className="lg:hidden space-y-4 p-4">
            {produtosFiltrados.map((produto: Produto) => (
              <div key={produto.id} className={`${tema.papel} border ${tema.borda} rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${tema.texto}`}>{produto.nome}</h3>
                    <p className={`text-sm ${tema.textoSecundario} flex items-center mt-1`}>
                      <Barcode className="h-3 w-3 mr-1" />
                      {produto.codigoBarras}
                    </p>
                    <p className={`text-sm ${tema.textoSecundario} mt-1`}>
                      Categoria: {produto.categoria}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      produto.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    {produto.estoque <= produto.estoqueMinimo && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Estoque Baixo
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className={`text-xs ${tema.textoSecundario}`}>Preço de Venda</p>
                    <p className={`font-semibold ${tema.texto}`}>{formatarMoedaBR(produto.valorVenda)}</p>
                    <p className={`text-xs ${tema.textoSecundario}`}>
                      Custo: {formatarMoedaBR(produto.valorCusto)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${tema.textoSecundario}`}>Estoque</p>
                    <p className={`font-semibold ${produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : tema.texto}`}>
                      {produto.estoque} / {produto.estoqueMinimo}
                    </p>
                    <p className="text-xs text-green-600">
                      Margem: +{calcularMargem(produto.valorCusto, produto.valorVenda).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => abrirModal(produto)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => abrirModalExclusao(produto)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Estado Vazio */}
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className={`mx-auto h-12 w-12 ${tema.textoSecundario} mb-4`} />
              <h3 className={`text-lg font-medium ${tema.texto} mb-2`}>
                Nenhum produto encontrado
              </h3>
              <p className={`text-sm ${tema.textoSecundario} mb-4`}>
                {buscaTexto || filtroCategoria !== 'todas' || filtroStatus !== 'todos'
                  ? 'Tente ajustar os filtros para encontrar produtos.'
                  : 'Comece criando seu primeiro produto.'
                }
              </p>
              {(!buscaTexto && filtroCategoria === 'todas' && filtroStatus === 'todos') && (
                <button
                  onClick={() => abrirModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Criar Primeiro Produto
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de Produto */}
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
                    {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Nome do Produto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formProduto.nome}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, nome: e.target.value }))}
                        disabled={salvando}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Digite o nome do produto"
                      />
                      {formErrors.nome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                      )}
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Descrição <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formProduto.descricao}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, descricao: e.target.value }))}
                        disabled={salvando}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.descricao ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Descreva o produto"
                      />
                      {formErrors.descricao && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.descricao}</p>
                      )}
                    </div>

                    {/* Código de Barras e Categoria */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Código de Barras <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formProduto.codigoBarras}
                          onChange={(e) => setFormProduto(prev => ({ ...prev, codigoBarras: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.codigoBarras ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="123456789"
                        />
                        {formErrors.codigoBarras && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.codigoBarras}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Categoria <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formProduto.categoria}
                          onChange={(e) => setFormProduto(prev => ({ ...prev, categoria: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.categoria ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categorias.filter((c: Categoria) => c.ativa).map((categoria: Categoria) => (
                            <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
                          ))}
                        </select>
                        {formErrors.categoria && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.categoria}</p>
                        )}
                      </div>
                    </div>

                    {/* Preços */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Valor de Custo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formProduto.valorCusto}
                          onChange={(e) => setFormProduto(prev => ({ ...prev, valorCusto: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.valorCusto ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="0.00"
                        />
                        {formErrors.valorCusto && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.valorCusto}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Valor de Venda <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formProduto.valorVenda}
                          onChange={(e) => setFormProduto(prev => ({ ...prev, valorVenda: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.valorVenda ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="0.00"
                        />
                        {formErrors.valorVenda && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.valorVenda}</p>
                        )}
                        {formProduto.valorCusto && formProduto.valorVenda && (
                          <p className="mt-1 text-xs text-green-600">
                            Margem: +{calcularMargem(parseFloat(formProduto.valorCusto), parseFloat(formProduto.valorVenda)).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estoques */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Estoque Atual <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formProduto.estoque}
                          onChange={(e) => setFormProduto(prev => ({ ...prev, estoque: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.estoque ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="0"
                        />
                        {formErrors.estoque && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.estoque}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Estoque Mínimo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formProduto.estoqueMinimo}
                          onChange={(e) => setFormProduto(prev => ({ ...prev, estoqueMinimo: e.target.value }))}
                          disabled={salvando}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.estoqueMinimo ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="0"
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
                        checked={formProduto.ativo}
                        onChange={(e) => setFormProduto(prev => ({ ...prev, ativo: e.target.checked }))}
                        disabled={salvando}
                        className="mr-2"
                      />
                      <label className={`text-sm ${tema.texto}`}>Produto ativo</label>
                    </div>
                  </div>
                </div>
                
                <div className={`${tema.papel} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                  <button
                    onClick={salvarProduto}
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

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && produtoParaExcluir && (
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
                          Tem certeza que deseja excluir o produto <strong>"{produtoParaExcluir.nome}"</strong>? 
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