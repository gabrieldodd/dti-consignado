// src/components/screens/TelaProdutos.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, Hash, DollarSign, X, Save } from 'lucide-react';
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
  
  const { formatarMoedaBR, formatarNumero } = useFormatters();
  const { validarCodigoBarras } = useValidation();

  // Função para formatar entrada de moeda
  const formatarMoedaInput = useCallback((valor: string) => {
    const numero = valor.replace(/\D/g, '');
    const valorDecimal = (parseInt(numero) || 0) / 100;
    return valorDecimal.toFixed(2).replace('.', ',');
  }, []);

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
      resultado = resultado.filter(p => p.categoria === filtroCategoria);
    }

    // Filtro por status
    if (filtroStatus === 'ativo') {
      resultado = resultado.filter(p => p.ativo);
    } else if (filtroStatus === 'inativo') {
      resultado = resultado.filter(p => !p.ativo);
    } else if (filtroStatus === 'estoque-baixo') {
      resultado = resultado.filter(p => p.ativo && p.estoque <= p.estoqueMinimo);
    }

    // Filtro por busca
    if (buscaTexto.trim()) {
      const busca = buscaTexto.toLowerCase().trim();
      resultado = resultado.filter(p => 
        p.nome.toLowerCase().includes(busca) ||
        p.descricao.toLowerCase().includes(busca) ||
        p.codigoBarras.includes(busca) ||
        p.categoria.toLowerCase().includes(busca)
      );
    }

    return resultado;
  }, [produtos, filtroCategoria, filtroStatus, buscaTexto]);

  // Funções de Modal
  const abrirModal = useCallback((produto: Produto | null = null) => {
    setProdutoEditando(produto);
    if (produto) {
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
      setFormProduto({
        nome: '',
        descricao: '',
        codigoBarras: '',
        categoria: categorias.length > 0 ? categorias[0].nome : '',
        valorCusto: '',
        valorVenda: '',
        estoque: '',
        estoqueMinimo: '',
        ativo: true
      });
    }
    setFormErrors({});
    setModalAberto(true);
  }, [categorias]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
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
    setFormErrors({});
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formProduto.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formProduto.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formProduto.descricao.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    }

    if (!formProduto.codigoBarras.trim()) {
      errors.codigoBarras = 'Código de barras é obrigatório';
    } else if (!validarCodigoBarras(formProduto.codigoBarras)) {
      errors.codigoBarras = 'Código de barras deve ter pelo menos 8 dígitos numéricos';
    } else {
      // Verificar se código já existe
      const codigoExiste = produtos.some(p => 
        p.codigoBarras === formProduto.codigoBarras && 
        (!produtoEditando || p.id !== produtoEditando.id)
      );
      if (codigoExiste) {
        errors.codigoBarras = 'Este código de barras já está em uso';
      }
    }

    if (!formProduto.categoria) {
      errors.categoria = 'Categoria é obrigatória';
    }

    const valorCusto = parseFloat(formProduto.valorCusto.replace(',', '.'));
    if (!formProduto.valorCusto || isNaN(valorCusto) || valorCusto <= 0) {
      errors.valorCusto = 'Valor de custo deve ser maior que zero';
    }

    const valorVenda = parseFloat(formProduto.valorVenda.replace(',', '.'));
    if (!formProduto.valorVenda || isNaN(valorVenda) || valorVenda <= 0) {
      errors.valorVenda = 'Valor de venda deve ser maior que zero';
    } else if (valorVenda <= valorCusto) {
      errors.valorVenda = 'Valor de venda deve ser maior que o valor de custo';
    }

    const estoque = parseInt(formProduto.estoque);
    if (!formProduto.estoque || isNaN(estoque) || estoque < 0) {
      errors.estoque = 'Estoque deve ser um número não negativo';
    }

    const estoqueMinimo = parseInt(formProduto.estoqueMinimo);
    if (!formProduto.estoqueMinimo || isNaN(estoqueMinimo) || estoqueMinimo < 0) {
      errors.estoqueMinimo = 'Estoque mínimo deve ser um número não negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formProduto, produtos, produtoEditando, validarCodigoBarras]);

  // Salvar produto
  const salvarProduto = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dadosProduto = {
        nome: formProduto.nome,
        descricao: formProduto.descricao,
        codigoBarras: formProduto.codigoBarras,
        categoria: formProduto.categoria,
        valorCusto: parseFloat(formProduto.valorCusto.replace(',', '.')),
        valorVenda: parseFloat(formProduto.valorVenda.replace(',', '.')),
        estoque: parseInt(formProduto.estoque),
        estoqueMinimo: parseInt(formProduto.estoqueMinimo),
        ativo: formProduto.ativo
      };

      if (produtoEditando) {
        // Editar produto existente
        setProdutos(prev => prev.map(p => 
          p.id === produtoEditando.id 
            ? { ...p, ...dadosProduto }
            : p
        ));
        mostrarMensagem('success', 'Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        const novoProduto = {
          id: Math.max(...produtos.map(p => p.id), 0) + 1,
          ...dadosProduto,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setProdutos(prev => [...prev, novoProduto]);
        mostrarMensagem('success', 'Produto criado com sucesso!');
      }

      fecharModal();
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar produto');
    } finally {
      setSalvando(false);
    }
  }, [formProduto, produtoEditando, produtos, validarFormulario, setProdutos, mostrarMensagem, fecharModal]);

  // Excluir produto
  const confirmarExclusao = useCallback((produto: Produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusaoAberto(true);
  }, []);

  const excluirProduto = useCallback(async () => {
    if (!produtoParaExcluir) return;

    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProdutos(prev => prev.filter(p => p.id !== produtoParaExcluir.id));
      mostrarMensagem('success', 'Produto excluído com sucesso!');
      setModalExclusaoAberto(false);
      setProdutoParaExcluir(null);
    } catch (error) {
      mostrarMensagem('error', 'Erro ao excluir produto');
    } finally {
      setSalvando(false);
    }
  }, [produtoParaExcluir, setProdutos, mostrarMensagem]);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>Produtos</h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie o catálogo de produtos
            </p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {categorias.filter(c => c.ativa).map(categoria => (
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
              <option value="estoque-baixo">Estoque Baixo</option>
            </select>

            <div className={`flex items-center ${tema.textoSecundario}`}>
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
              <Package className={`mx-auto h-12 w-12 ${tema.textoSecundario} mb-4`} />
              <h3 className={`text-lg font-medium ${tema.texto} mb-2`}>
                Nenhum produto encontrado
              </h3>
              <p className={`${tema.textoSecundario}`}>
                {buscaTexto || filtroCategoria !== 'todas' || filtroStatus !== 'todos'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro produto.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop: Tabela */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${tema.fundo}`}>
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
                    {produtosFiltrados.map((produto) => (
                      <tr key={produto.id} className={`hover:${tema.hover}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${tema.texto}`}>
                              {produto.nome}
                            </div>
                            <div className={`text-sm ${tema.textoSecundario}`}>
                              {produto.codigoBarras}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${tema.texto}`}>{produto.categoria}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm ${tema.texto}`}>
                              Venda: {formatarMoedaBR(produto.valorVenda)}
                            </div>
                            <div className={`text-sm ${tema.textoSecundario}`}>
                              Custo: {formatarMoedaBR(produto.valorCusto)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm ${tema.texto}`}>
                              {formatarNumero(produto.estoque)} unidades
                            </div>
                            <div className={`text-sm ${produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : tema.textoSecundario}`}>
                              Min: {formatarNumero(produto.estoqueMinimo)}
                              {produto.estoque <= produto.estoqueMinimo && ' ⚠️'}
                            </div>
                          </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => abrirModal(produto)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => confirmarExclusao(produto)}
                              className="text-red-600 hover:text-red-900"
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
              <div className="md:hidden">
                {produtosFiltrados.map((produto) => (
                  <div key={produto.id} className={`p-4 border-b ${tema.borda}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`font-medium ${tema.texto}`}>{produto.nome}</h3>
                        <p className={`text-sm ${tema.textoSecundario}`}>{produto.codigoBarras}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        produto.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className={`text-sm ${tema.textoSecundario} mb-3 space-y-1`}>
                      <p>Categoria: {produto.categoria}</p>
                      <p>Venda: {formatarMoedaBR(produto.valorVenda)} | Custo: {formatarMoedaBR(produto.valorCusto)}</p>
                      <p className={produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : ''}>
                        Estoque: {formatarNumero(produto.estoque)} | Min: {formatarNumero(produto.estoqueMinimo)}
                        {produto.estoque <= produto.estoqueMinimo && ' ⚠️'}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => abrirModal(produto)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(produto)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal de Cadastro/Edição */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${tema.papel} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <button
                    onClick={fecharModal}
                    disabled={salvando}
                    className={`p-2 rounded-md ${tema.hover} ${tema.textoSecundario}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formProduto.nome}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, nome: e.target.value }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Nome do produto"
                    />
                    {formErrors.nome && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                    )}
                  </div>

                  {/* Código de Barras */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Código de Barras <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formProduto.codigoBarras}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, codigoBarras: e.target.value.replace(/\D/g, '') }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.codigoBarras ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="1234567890123"
                    />
                    {formErrors.codigoBarras && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.codigoBarras}</p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Descrição <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formProduto.descricao}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, descricao: e.target.value }))}
                      disabled={salvando}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.descricao ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Descrição detalhada do produto"
                    />
                    {formErrors.descricao && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.descricao}</p>
                    )}
                  </div>

                  {/* Categoria */}
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

                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Status
                    </label>
                    <select
                      value={formProduto.ativo ? 'ativo' : 'inativo'}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, ativo: e.target.value === 'ativo' }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>

                  {/* Valor de Custo */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Valor de Custo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formProduto.valorCusto}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, valorCusto: formatarMoedaInput(e.target.value) }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.valorCusto ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="0,00"
                    />
                    {formErrors.valorCusto && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.valorCusto}</p>
                    )}
                  </div>

                  {/* Valor de Venda */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Valor de Venda <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formProduto.valorVenda}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, valorVenda: formatarMoedaInput(e.target.value) }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.valorVenda ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="0,00"
                    />
                    {formErrors.valorVenda && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.valorVenda}</p>
                    )}
                  </div>

                  {/* Estoque */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Estoque <span className="text-red-500">*</span>
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

                  {/* Estoque Mínimo */}
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

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={fecharModal}
                    disabled={salvando}
                    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarProduto}
                    disabled={salvando}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {salvando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${tema.papel} rounded-lg max-w-md w-full`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    Confirmar Exclusão
                  </h2>
                </div>
                
                <p className={`${tema.textoSecundario} mb-6`}>
                  Tem certeza de que deseja excluir o produto <strong>{produtoParaExcluir?.nome}</strong>? 
                  Esta ação não pode ser desfeita.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setModalExclusaoAberto(false)}
                    disabled={salvando}
                    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={excluirProduto}
                    disabled={salvando}
                    className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {salvando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </>
                    )}
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