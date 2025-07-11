// src/components/screens/TelaProdutos.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const TelaProdutos: React.FC = () => {
  const { 
    tema, 
    produtos, 
    categorias,
    adicionarProduto, 
    atualizarProduto, 
    excluirProduto, 
    mostrarMensagem,
    formatarMoeda
  } = useAppContext();

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'categoria' | 'estoque' | 'valor'>('nome');
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    codigoBarras: '',
    categoria: '',
    valorCusto: '',
    valorVenda: '',
    estoque: '',
    estoqueMinimo: ''
  });

  const [erros, setErros] = useState<Record<string, string>>({});

  // Produtos filtrados e ordenados
  const produtosOrdenados = useMemo(() => {
    let filtrados = produtos.filter((produto: any) => {
      const buscaMatch = 
        (produto.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (produto.descricao || '').toLowerCase().includes(busca.toLowerCase()) ||
        (produto.codigo_barras || produto.codigoBarras || '').includes(busca);

      const categoriaMatch = filtroCategoria === 'todas' || produto.categoria === filtroCategoria;
      
      let statusMatch = true;
      if (filtroStatus === 'ativo') {
        statusMatch = produto.ativo === true;
      } else if (filtroStatus === 'inativo') {
        statusMatch = produto.ativo === false;
      } else if (filtroStatus === 'baixoEstoque') {
        const estoque = produto.estoque || 0;
        const estoqueMinimo = produto.estoque_minimo || produto.estoqueMinimo || 0;
        statusMatch = estoque <= estoqueMinimo;
      }

      return buscaMatch && categoriaMatch && statusMatch;
    });

    return [...filtrados].sort((a: any, b: any) => {
      switch (ordenacao) {
        case 'categoria':
          return (a.categoria || '').localeCompare(b.categoria || '');
        case 'estoque':
          return (b.estoque || 0) - (a.estoque || 0);
        case 'valor':
          const valorA = a.valor_venda || a.valorVenda || 0;
          const valorB = b.valor_venda || b.valorVenda || 0;
          return valorB - valorA;
        default:
          return (a.nome || '').localeCompare(b.nome || '');
      }
    });
  }, [produtos, busca, filtroCategoria, filtroStatus, ordenacao]);

  // Validação do formulário
  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.categoria) {
      novosErros.categoria = 'Categoria é obrigatória';
    }

    if (!formData.valorVenda || parseFloat(formData.valorVenda) <= 0) {
      novosErros.valorVenda = 'Valor de venda deve ser maior que zero';
    }

    if (!formData.estoque || parseInt(formData.estoque) < 0) {
      novosErros.estoque = 'Estoque deve ser um número válido';
    }

    if (!formData.estoqueMinimo || parseInt(formData.estoqueMinimo) < 0) {
      novosErros.estoqueMinimo = 'Estoque mínimo deve ser um número válido';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Abrir modal para novo produto
  const abrirModalNovo = () => {
    setFormData({
      nome: '',
      descricao: '',
      codigoBarras: '',
      categoria: '',
      valorCusto: '',
      valorVenda: '',
      estoque: '',
      estoqueMinimo: ''
    });
    setProdutoEditando(null);
    setErros({});
    setModalAberto(true);
  };

  // Abrir modal para editar produto
  const abrirModalEdicao = (produto: any) => {
    setFormData({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      codigoBarras: produto.codigo_barras || produto.codigoBarras || '',
      categoria: produto.categoria || '',
      valorCusto: (produto.valor_custo || produto.valorCusto || 0).toString(),
      valorVenda: (produto.valor_venda || produto.valorVenda || 0).toString(),
      estoque: (produto.estoque || 0).toString(),
      estoqueMinimo: (produto.estoque_minimo || produto.estoqueMinimo || 0).toString()
    });
    setProdutoEditando(produto);
    setErros({});
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setProdutoEditando(null);
    setFormData({
      nome: '',
      descricao: '',
      codigoBarras: '',
      categoria: '',
      valorCusto: '',
      valorVenda: '',
      estoque: '',
      estoqueMinimo: ''
    });
    setErros({});
  };

  // Salvar produto
  const salvarProduto = async () => {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      const dadosProduto = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        codigo_barras: formData.codigoBarras.trim(),
        categoria: formData.categoria,
        valor_custo: parseFloat(formData.valorCusto) || 0,
        valor_venda: parseFloat(formData.valorVenda),
        estoque: parseInt(formData.estoque),
        estoque_minimo: parseInt(formData.estoqueMinimo),
        ativo: true,
        data_cadastro: new Date().toISOString()
      };

      let resultado;
      if (produtoEditando) {
        resultado = await atualizarProduto(produtoEditando.id, dadosProduto);
      } else {
        resultado = await adicionarProduto(dadosProduto);
      }

      if (resultado.success) {
        mostrarMensagem('success', 
          produtoEditando ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!'
        );
        fecharModal();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao salvar produto');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao salvar produto');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir produto
  const handleExcluir = async (produto: any) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      return;
    }

    try {
      const resultado = await excluirProduto(produto.id);
      if (resultado.success) {
        mostrarMensagem('success', 'Produto excluído com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir produto');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao excluir produto');
    }
  };

  // Alternar status ativo/inativo
  const alternarStatus = async (produto: any) => {
    try {
      const resultado = await atualizarProduto(produto.id, { ativo: !produto.ativo });
      if (resultado.success) {
        mostrarMensagem('success', 
          `Produto ${produto.ativo ? 'desativado' : 'ativado'} com sucesso!`
        );
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao alterar status');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao alterar status');
    }
  };

  const verificarBaixoEstoque = (produto: any) => {
    const estoque = produto.estoque || 0;
    const estoqueMinimo = produto.estoque_minimo || produto.estoqueMinimo || 0;
    return estoque <= estoqueMinimo;
  };

  return (
    <div className={`min-h-screen ${tema.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${tema.text} mb-2`}>
              Produtos
            </h1>
            <p className={tema.textSecondary}>
              Gerencie o catálogo de produtos
            </p>
          </div>
          
          <button
            onClick={abrirModalNovo}
            className={`
              ${tema.primary} text-white px-6 py-3 rounded-lg 
              hover:opacity-90 transition-opacity
              flex items-center space-x-2 mt-4 md:mt-0
            `}
          >
            <Plus size={20} />
            <span>Novo Produto</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.surface} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tema.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 border ${tema.border} rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${tema.text}
                `}
              />
            </div>

            {/* Filtro Categoria */}
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="todas">Todas as Categorias</option>
              {categorias.map((categoria: any) => (
                <option key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </option>
              ))}
            </select>

            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="baixoEstoque">Baixo Estoque</option>
            </select>

            {/* Ordenação */}
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'categoria' | 'estoque' | 'valor')}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="nome">Ordenar por Nome</option>
              <option value="categoria">Ordenar por Categoria</option>
              <option value="estoque">Ordenar por Estoque</option>
              <option value="valor">Ordenar por Valor</option>
            </select>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {produtosOrdenados.map((produto: any) => (
            <div key={produto.id} className={`${tema.surface} rounded-lg shadow-sm p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`font-semibold ${tema.text} mb-1`}>
                    {produto.nome}
                  </h3>
                  <p className={`text-sm ${tema.textSecondary} mb-2`}>
                    {produto.categoria}
                  </p>
                  {produto.descricao && (
                    <p className={`text-sm ${tema.textSecondary} mb-2`}>
                      {produto.descricao}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => abrirModalEdicao(produto)}
                    className={`p-2 ${tema.textSecondary} hover:${tema.text} transition-colors`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleExcluir(produto)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Informações do produto */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={tema.textSecondary}>Valor de Venda:</span>
                  <span className={`font-medium ${tema.text}`}>
                    {formatarMoeda(produto.valor_venda || produto.valorVenda || 0)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={tema.textSecondary}>Estoque:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${tema.text}`}>
                      {produto.estoque || 0}
                    </span>
                    {verificarBaixoEstoque(produto) && (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                  </div>
                </div>

                {produto.codigo_barras && (
                  <div className="flex justify-between">
                    <span className={tema.textSecondary}>Código:</span>
                    <span className={`font-medium ${tema.text} text-sm`}>
                      {produto.codigo_barras || produto.codigoBarras}
                    </span>
                  </div>
                )}
              </div>

              {/* Status e ações */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => alternarStatus(produto)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1
                    ${produto.ativo 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } transition-colors
                  `}
                >
                  {produto.ativo ? <CheckCircle size={14} /> : <Package size={14} />}
                  <span>{produto.ativo ? 'Ativo' : 'Inativo'}</span>
                </button>

                {verificarBaixoEstoque(produto) && (
                  <span className="text-xs text-red-600 font-medium">
                    Estoque Baixo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {produtosOrdenados.length === 0 && (
          <div className={`${tema.surface} rounded-lg shadow-sm p-12 text-center`}>
            <Package size={48} className={`${tema.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${tema.text} mb-2`}>
              Nenhum produto encontrado
            </h3>
            <p className={tema.textSecondary}>
              {busca || filtroCategoria !== 'todas' || filtroStatus !== 'todos' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Crie seu primeiro produto para começar'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
                {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
              </h2>

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className={`
                      w-full px-3 py-2 border rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${erros.nome ? 'border-red-500' : tema.border}
                    `}
                    placeholder="Digite o nome do produto"
                  />
                  {erros.nome && (
                    <p className="text-red-500 text-sm mt-1">{erros.nome}</p>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Digite a descrição do produto"
                  />
                </div>

                {/* Código de Barras e Categoria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Código de Barras
                    </label>
                    <input
                      type="text"
                      value={formData.codigoBarras}
                      onChange={(e) => setFormData({ ...formData, codigoBarras: e.target.value })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Código de barras"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Categoria *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.categoria ? 'border-red-500' : tema.border}
                      `}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((categoria: any) => (
                        <option key={categoria.id} value={categoria.nome}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                    {erros.categoria && (
                      <p className="text-red-500 text-sm mt-1">{erros.categoria}</p>
                    )}
                  </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Valor de Custo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorCusto}
                      onChange={(e) => setFormData({ ...formData, valorCusto: e.target.value })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Valor de Venda *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorVenda}
                      onChange={(e) => setFormData({ ...formData, valorVenda: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.valorVenda ? 'border-red-500' : tema.border}
                      `}
                      placeholder="0,00"
                    />
                    {erros.valorVenda && (
                      <p className="text-red-500 text-sm mt-1">{erros.valorVenda}</p>
                    )}
                  </div>
                </div>

                {/* Estoque */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Estoque Atual *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estoque}
                      onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.estoque ? 'border-red-500' : tema.border}
                      `}
                      placeholder="0"
                    />
                    {erros.estoque && (
                      <p className="text-red-500 text-sm mt-1">{erros.estoque}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Estoque Mínimo *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estoqueMinimo}
                      onChange={(e) => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.estoqueMinimo ? 'border-red-500' : tema.border}
                      `}
                      placeholder="0"
                    />
                    {erros.estoqueMinimo && (
                      <p className="text-red-500 text-sm mt-1">{erros.estoqueMinimo}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={fecharModal}
                  disabled={carregando}
                  className={`
                    px-4 py-2 border ${tema.border} rounded-lg
                    ${tema.text} hover:${tema.hover} transition-colors
                    disabled:opacity-50
                  `}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarProduto}
                  disabled={carregando}
                  className={`
                    ${tema.primary} text-white px-4 py-2 rounded-lg
                    hover:opacity-90 transition-opacity
                    disabled:opacity-50
                  `}
                >
                  {carregando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};