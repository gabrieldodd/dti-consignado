// src/components/screens/TelaCategorias.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Tags, Plus, Search, Edit, Trash2, AlertTriangle, X, Save, Package } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

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

const CORES_DISPONIVEIS = [
  { valor: 'bg-blue-500', nome: 'Azul' },
  { valor: 'bg-green-500', nome: 'Verde' },
  { valor: 'bg-red-500', nome: 'Vermelho' },
  { valor: 'bg-yellow-500', nome: 'Amarelo' },
  { valor: 'bg-purple-500', nome: 'Roxo' },
  { valor: 'bg-pink-500', nome: 'Rosa' },
  { valor: 'bg-indigo-500', nome: 'Índigo' },
  { valor: 'bg-orange-500', nome: 'Laranja' },
  { valor: 'bg-teal-500', nome: 'Verde Água' },
  { valor: 'bg-gray-500', nome: 'Cinza' }
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

  // Estados Locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<Categoria | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Filtros e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusCategorias') || 'todos';
  });

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusCategorias', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Formulário
  const [formCategoria, setFormCategoria] = useState<CategoriaForm>({
    nome: '',
    descricao: '',
    cor: 'bg-blue-500',
    ativa: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calcular contagem de produtos por categoria
  const contagemProdutos = useMemo(() => {
    const contagem: Record<string, number> = {};
    produtos.forEach(produto => {
      if (produto.ativo) {
        contagem[produto.categoria] = (contagem[produto.categoria] || 0) + 1;
      }
    });
    return contagem;
  }, [produtos]);

  // Dados Filtrados
  const categoriasFiltradas = useMemo(() => {
    let resultado = categorias;

    // Filtro por status
    if (filtroStatus === 'ativa') {
      resultado = resultado.filter(c => c.ativa);
    } else if (filtroStatus === 'inativa') {
      resultado = resultado.filter(c => !c.ativa);
    }

    // Filtro por busca
    if (buscaTexto.trim()) {
      const busca = buscaTexto.toLowerCase().trim();
      resultado = resultado.filter(c => 
        c.nome.toLowerCase().includes(busca) ||
        c.descricao.toLowerCase().includes(busca)
      );
    }

    return resultado;
  }, [categorias, filtroStatus, buscaTexto]);

  // Funções de Modal
  const abrirModal = useCallback((categoria: Categoria | null = null) => {
    setCategoriaEditando(categoria);
    if (categoria) {
      setFormCategoria({
        nome: categoria.nome,
        descricao: categoria.descricao,
        cor: categoria.cor,
        ativa: categoria.ativa
      });
    } else {
      setFormCategoria({
        nome: '',
        descricao: '',
        cor: 'bg-blue-500',
        ativa: true
      });
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setFormCategoria({
      nome: '',
      descricao: '',
      cor: 'bg-blue-500',
      ativa: true
    });
    setFormErrors({});
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formCategoria.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formCategoria.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else {
      // Verificar se nome já existe
      const nomeExiste = categorias.some(c => 
        c.nome.toLowerCase() === formCategoria.nome.toLowerCase() && 
        (!categoriaEditando || c.id !== categoriaEditando.id)
      );
      if (nomeExiste) {
        errors.nome = 'Já existe uma categoria com este nome';
      }
    }

    if (!formCategoria.descricao.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    }

    if (!formCategoria.cor) {
      errors.cor = 'Cor é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formCategoria, categorias, categoriaEditando]);

  // Salvar categoria
  const salvarCategoria = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dadosCategoria = {
        nome: formCategoria.nome,
        descricao: formCategoria.descricao,
        cor: formCategoria.cor,
        ativa: formCategoria.ativa
      };

      if (categoriaEditando) {
        // Editar categoria existente
        setCategorias(prev => prev.map(c => 
          c.id === categoriaEditando.id 
            ? { ...c, ...dadosCategoria }
            : c
        ));
        mostrarMensagem('success', 'Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        const novaCategoria = {
          id: Math.max(...categorias.map(c => c.id), 0) + 1,
          ...dadosCategoria,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setCategorias(prev => [...prev, novaCategoria]);
        mostrarMensagem('success', 'Categoria criada com sucesso!');
      }

      fecharModal();
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar categoria');
    } finally {
      setSalvando(false);
    }
  }, [formCategoria, categoriaEditando, categorias, validarFormulario, setCategorias, mostrarMensagem, fecharModal]);

  // Excluir categoria
  const confirmarExclusao = useCallback((categoria: Categoria) => {
    const produtosNaCategoria = contagemProdutos[categoria.nome] || 0;
    if (produtosNaCategoria > 0) {
      mostrarMensagem('error', `Não é possível excluir esta categoria pois há ${produtosNaCategoria} produto(s) vinculado(s).`);
      return;
    }
    setCategoriaParaExcluir(categoria);
    setModalExclusaoAberto(true);
  }, [contagemProdutos, mostrarMensagem]);

  const excluirCategoria = useCallback(async () => {
    if (!categoriaParaExcluir) return;

    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategorias(prev => prev.filter(c => c.id !== categoriaParaExcluir.id));
      mostrarMensagem('success', 'Categoria excluída com sucesso!');
      setModalExclusaoAberto(false);
      setCategoriaParaExcluir(null);
    } catch (error) {
      mostrarMensagem('error', 'Erro ao excluir categoria');
    } finally {
      setSalvando(false);
    }
  }, [categoriaParaExcluir, setCategorias, mostrarMensagem]);

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>Categorias</h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Organize seus produtos por categorias
            </p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
              />
            </div>
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos os Status</option>
              <option value="ativa">Ativas</option>
              <option value="inativa">Inativas</option>
            </select>

            <div className={`flex items-center ${tema.textoSecundario}`}>
              <span className="text-sm">
                {categoriasFiltradas.length} categoria(s) encontrada(s)
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Categorias */}
        {categoriasFiltradas.length === 0 ? (
          <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-8 text-center`}>
            <Tags className={`mx-auto h-12 w-12 ${tema.textoSecundario} mb-4`} />
            <h3 className={`text-lg font-medium ${tema.texto} mb-2`}>
              Nenhuma categoria encontrada
            </h3>
            <p className={`${tema.textoSecundario}`}>
              {buscaTexto || filtroStatus !== 'todos' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira categoria.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasFiltradas.map((categoria) => (
              <div
                key={categoria.id}
                className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${categoria.cor} mr-3`}></div>
                    <div>
                      <h3 className={`text-lg font-semibold ${tema.texto}`}>
                        {categoria.nome}
                      </h3>
                      <p className={`text-sm ${tema.textoSecundario}`}>
                        ID: {categoria.id}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    categoria.ativa 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {categoria.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <p className={`text-sm ${tema.textoSecundario} mb-4`}>
                  {categoria.descricao}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className={`h-4 w-4 ${tema.textoSecundario} mr-1`} />
                    <span className={`text-sm ${tema.textoSecundario}`}>
                      {contagemProdutos[categoria.nome] || 0} produto(s)
                    </span>
                  </div>
                  <span className={`text-xs ${tema.textoSecundario}`}>
                    Criada em {new Date(categoria.dataCadastro).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => abrirModal(categoria)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => confirmarExclusao(categoria)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Cadastro/Edição */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${tema.papel} rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                  </h2>
                  <button
                    onClick={fecharModal}
                    disabled={salvando}
                    className={`p-2 rounded-md ${tema.hover} ${tema.textoSecundario}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formCategoria.nome}
                      onChange={(e) => setFormCategoria(prev => ({ ...prev, nome: e.target.value }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Nome da categoria"
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
                      value={formCategoria.descricao}
                      onChange={(e) => setFormCategoria(prev => ({ ...prev, descricao: e.target.value }))}
                      disabled={salvando}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.descricao ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Descrição da categoria"
                    />
                    {formErrors.descricao && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.descricao}</p>
                    )}
                  </div>

                  {/* Cor */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                      Cor <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {CORES_DISPONIVEIS.map((cor) => (
                        <button
                          key={cor.valor}
                          type="button"
                          onClick={() => setFormCategoria(prev => ({ ...prev, cor: cor.valor }))}
                          disabled={salvando}
                          className={`
                            w-full h-10 rounded-md border-2 transition-all duration-200
                            ${cor.valor}
                            ${formCategoria.cor === cor.valor 
                              ? 'border-gray-800 ring-2 ring-gray-300' 
                              : 'border-gray-300 hover:border-gray-400'
                            }
                            ${salvando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          title={cor.nome}
                        />
                      ))}
                    </div>
                    {formErrors.cor && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cor}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Status
                    </label>
                    <select
                      value={formCategoria.ativa ? 'ativa' : 'inativa'}
                      onChange={(e) => setFormCategoria(prev => ({ ...prev, ativa: e.target.value === 'ativa' }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="ativa">Ativa</option>
                      <option value="inativa">Inativa</option>
                    </select>
                  </div>

                  {/* Preview */}
                  <div className={`p-3 rounded-md ${tema.fundo} border ${tema.borda}`}>
                    <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                      Preview:
                    </label>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${formCategoria.cor} mr-3`}></div>
                      <span className={`${tema.texto} font-medium`}>
                        {formCategoria.nome || 'Nome da categoria'}
                      </span>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={fecharModal}
                      disabled={salvando}
                      className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={salvarCategoria}
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
                  Tem certeza de que deseja excluir a categoria <strong>{categoriaParaExcluir?.nome}</strong>? 
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
                    onClick={excluirCategoria}
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