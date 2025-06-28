// src/components/screens/TelaProdutos.tsx
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';
import { Produto } from '../../types/Produto';
import { InputComErro } from '../common/InputComErro';

export const TelaProdutos: React.FC = memo(() => {
  const { 
    produtos, 
    setProdutos, 
    categorias, 
    mostrarMensagem, 
    tema, 
    cookies 
  } = useAppContext();
  
  const { formatarMoedaBR } = useFormatters();
  const { validarCodigoBarras } = useValidation();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);
  
  // Carregar filtros salvos dos cookies
  const [filtroCategoria, setFiltroCategoria] = useState(() => {
    return cookies.getCookie('filtroCategoriasProdutos') || 'todas';
  });
  
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusProdutos') || 'todos';
  });
  
  const [buscaTexto, setBuscaTexto] = useState('');

  // Salvar filtros nos cookies quando mudarem
  useEffect(() => {
    cookies.setCookie('filtroCategoriasProdutos', filtroCategoria, 30);
    cookies.setCookie('filtroStatusProdutos', filtroStatus, 30);
  }, [filtroCategoria, filtroStatus, cookies]);

  const [formProduto, setFormProduto] = useState({
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

  const produtosFiltrados = useMemo(() => {
    let resultado = produtos;

    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter((p: Produto) => p.categoria === filtroCategoria);
    }

    if (filtroStatus === 'ativo') {
      resultado = resultado.filter((p: Produto) => p.ativo);
    } else if (filtroStatus === 'inativo') {
      resultado = resultado.filter((p: Produto) => !p.ativo);
    }

    if (buscaTexto) {
      resultado = resultado.filter((p: Produto) => 
        p.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        p.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        p.codigoBarras.includes(buscaTexto) ||
        p.categoria.toLowerCase().includes(buscaTexto.toLowerCase())
      );
    }

    return resultado;
  }, [produtos, filtroCategoria, filtroStatus, buscaTexto]);

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
  }, []);

  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formProduto.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formProduto.descricao.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    }

    if (!formProduto.codigoBarras.trim()) {
      errors.codigoBarras = 'Código de barras é obrigatório';
    } else if (!validarCodigoBarras(formProduto.codigoBarras)) {
      errors.codigoBarras = 'Código de barras deve ter pelo menos 8 dígitos';
    } else {
      // Verificar se código de barras já existe (exceto se estiver editando o mesmo produto)
      const produtoExistente = produtos.find((p: Produto) => 
        p.codigoBarras === formProduto.codigoBarras && p.id !== produtoEditando?.id
      );
      if (produtoExistente) {
        errors.codigoBarras = 'Código de barras já existe';
      }
    }

    if (!formProduto.categoria) {
      errors.categoria = 'Categoria é obrigatória';
    }

    if (!formProduto.valorCusto || parseFloat(formProduto.valorCusto) <= 0) {
      errors.valorCusto = 'Valor de custo deve ser maior que zero';
    }

    if (!formProduto.valorVenda || parseFloat(formProduto.valorVenda) <= 0) {
      errors.valorVenda = 'Valor de venda deve ser maior que zero';
    }

    if (parseFloat(formProduto.valorVenda) <= parseFloat(formProduto.valorCusto)) {
      errors.valorVenda = 'Valor de venda deve ser maior que o custo';
    }

    if (!formProduto.estoque || parseInt(formProduto.estoque) < 0) {
      errors.estoque = 'Estoque não pode ser negativo';
    }

    if (!formProduto.estoqueMinimo || parseInt(formProduto.estoqueMinimo) < 0) {
      errors.estoqueMinimo = 'Estoque mínimo não pode ser negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formProduto, produtos, produtoEditando, validarCodigoBarras]);

  const salvarProduto = useCallback(async () => {
    if (validarFormulario()) {
      setSalvando(true);
      try {
        if (produtoEditando) {
          // Atualizar produto existente
          const produtoAtualizado: Produto = {
            ...produtoEditando,
            nome: formProduto.nome,
            descricao: formProduto.descricao,
            codigoBarras: formProduto.codigoBarras,
            categoria: formProduto.categoria,
            valorCusto: parseFloat(formProduto.valorCusto),
            valorVenda: parseFloat(formProduto.valorVenda),
            estoque: parseInt(formProduto.estoque),
            estoqueMinimo: parseInt(formProduto.estoqueMinimo),
            ativo: formProduto.ativo
          };
          
          setProdutos(prev => prev.map(p => p.id === produtoEditando.id ? produtoAtualizado : p));
          mostrarMensagem('success', 'Produto atualizado com sucesso!');
        } else {
          // Criar novo produto
          const novoId = Math.max(...produtos.map((p: Produto) => p.id), 0) + 1;
          const novoProduto: Produto = {
            id: novoId,
            nome: formProduto.nome,
            descricao: formProduto.descricao,
            codigoBarras: formProduto.codigoBarras,
            categoria: formProduto.categoria,
            valorCusto: parseFloat(formProduto.valorCusto),
            valorVenda: parseFloat(formProduto.valorVenda),
            estoque: parseInt(formProduto.estoque),
            estoqueMinimo: parseInt(formProduto.estoqueMinimo),
            ativo: formProduto.ativo,
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
    }
  }, [formProduto, produtoEditando, produtos, setProdutos, mostrarMensagem, validarFormulario, fecharModal]);

  // FUNÇÃO CORRIGIDA: Tipo explícito para o parâmetro produto
  const excluirProduto = useCallback((produto: Produto) => {
    if (confirm(`Confirma a exclusão do produto "${produto.nome}"?`)) {
      setProdutos(prev => prev.filter(p => p.id !== produto.id));
      mostrarMensagem('success', 'Produto excluído com sucesso!');
    }
  }, [setProdutos, mostrarMensagem]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Produtos</h2>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            />
          </div>
          
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todas">Todas as categorias</option>
            {categorias.filter(c => c.ativa).map(categoria => (
              <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
            ))}
          </select>
          
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Apenas Ativos</option>
            <option value="inativo">Apenas Inativos</option>
          </select>
          
          <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
            {produtosFiltrados.length} de {produtos.length} produtos
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
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
              <tr key={produto.id} className={tema.hover}>
                <td className="px-6 py-4">
                  <div>
                    <div className={`text-sm font-medium ${tema.texto}`}>
                      {produto.nome}
                    </div>
                    <div className={`text-sm ${tema.textoSecundario}`}>
                      {produto.codigoBarras}
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                  {produto.categoria}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${tema.texto}`}>
                    <div>Venda: {formatarMoedaBR(produto.valorVenda)}</div>
                    <div className={`text-xs ${tema.textoSecundario}`}>
                      Custo: {formatarMoedaBR(produto.valorCusto)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : tema.texto}`}>
                    {produto.estoque} / {produto.estoqueMinimo}
                    {produto.estoque <= produto.estoqueMinimo && (
                      <AlertTriangle className="inline h-4 w-4 ml-1" />
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
                  <button
                    onClick={() => abrirModal(produto)}
                    className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirProduto(produto)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {produtosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className={`text-sm ${tema.textoSecundario}`}>
              Nenhum produto encontrado com os filtros aplicados.
            </p>
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
            ></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                  {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                
                <div className="space-y-4">
                  <InputComErro
                    label="Nome do Produto"
                    valor={formProduto.nome}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, nome: valor }))}
                    erro={formErrors.nome}
                    obrigatorio
                    disabled={salvando}
                  />
                  
                  <InputComErro
                    label="Descrição"
                    valor={formProduto.descricao}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, descricao: valor }))}
                    erro={formErrors.descricao}
                    obrigatorio
                    disabled={salvando}
                  />
                  
                  <InputComErro
                    label="Código de Barras"
                    valor={formProduto.codigoBarras}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, codigoBarras: valor }))}
                    erro={formErrors.codigoBarras}
                    obrigatorio
                    disabled={salvando}
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formProduto.categoria}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, categoria: e.target.value }))}
                      disabled={salvando}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.categoria ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.filter(c => c.ativa).map(categoria => (
                        <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
                      ))}
                    </select>
                    {formErrors.categoria && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.categoria}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputComErro
                      label="Valor de Custo"
                      valor={formProduto.valorCusto}
                      onChange={(valor) => setFormProduto(prev => ({ ...prev, valorCusto: valor }))}
                      tipo="number"
                      placeholder="0.00"
                      erro={formErrors.valorCusto}
                      obrigatorio
                      disabled={salvando}
                    />
                    
                    <InputComErro
                      label="Valor de Venda"
                      valor={formProduto.valorVenda}
                      onChange={(valor) => setFormProduto(prev => ({ ...prev, valorVenda: valor }))}
                      tipo="number"
                      placeholder="0.00"
                      erro={formErrors.valorVenda}
                      obrigatorio
                      disabled={salvando}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputComErro
                      label="Estoque Atual"
                      valor={formProduto.estoque}
                      onChange={(valor) => setFormProduto(prev => ({ ...prev, estoque: valor }))}
                      tipo="number"
                      erro={formErrors.estoque}
                      obrigatorio
                      disabled={salvando}
                    />
                    
                    <InputComErro
                      label="Estoque Mínimo"
                      valor={formProduto.estoqueMinimo}
                      onChange={(valor) => setFormProduto(prev => ({ ...prev, estoqueMinimo: valor }))}
                      tipo="number"
                      erro={formErrors.estoqueMinimo}
                      obrigatorio
                      disabled={salvando}
                    />
                  </div>
                  
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
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={fecharModal}
                  disabled={salvando}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TelaProdutos.displayName = 'TelaProdutos';