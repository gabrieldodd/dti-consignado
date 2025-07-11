// src/components/screens/TelaCategorias.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Palette } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Categoria } from '../../types/Categoria';

export const TelaCategorias: React.FC = () => {
  const { 
    tema, 
    categorias, 
    adicionarCategoria, 
    atualizarCategoria, 
    excluirCategoria, 
    mostrarMensagem 
  } = useAppContext();

  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'data'>('nome');
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6'
  });

  const [erros, setErros] = useState<Record<string, string>>({});

  // Categorias filtradas e ordenadas
  const categoriasOrdenadas = useMemo(() => {
    const categoriasFiltradas = categorias.filter((categoria: any) =>
      categoria.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      categoria.descricao?.toLowerCase().includes(busca.toLowerCase())
    );

    return [...categoriasFiltradas].sort((a: any, b: any) => {
      if (ordenacao === 'nome') {
        return (a.nome || '').localeCompare(b.nome || '');
      }
      const dataA = a.data_cadastro || a.dataCadastro || a.created_at || '';
      const dataB = b.data_cadastro || b.dataCadastro || b.created_at || '';
      return new Date(dataB).getTime() - new Date(dataA).getTime();
    });
  }, [categorias, busca, ordenacao]);

  // Validação do formulário
  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    }

    if (!formData.cor) {
      novosErros.cor = 'Cor é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Abrir modal para nova categoria
  const abrirModalNovo = () => {
    setFormData({
      nome: '',
      descricao: '',
      cor: '#3B82F6'
    });
    setCategoriaEditando(null);
    setErros({});
    setModalAberto(true);
  };

  // Abrir modal para editar categoria
  const abrirModalEdicao = (categoria: any) => {
    setFormData({
      nome: categoria.nome || '',
      descricao: categoria.descricao || '',
      cor: categoria.cor || '#3B82F6'
    });
    setCategoriaEditando(categoria);
    setErros({});
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setFormData({
      nome: '',
      descricao: '',
      cor: '#3B82F6'
    });
    setErros({});
  };

  // Salvar categoria
  const salvarCategoria = async () => {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      const dadosCategoria = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        cor: formData.cor,
        ativa: true,
        data_cadastro: new Date().toISOString()
      };

      let resultado;
      if (categoriaEditando) {
        resultado = await atualizarCategoria(categoriaEditando.id, dadosCategoria);
      } else {
        resultado = await adicionarCategoria(dadosCategoria);
      }

      if (resultado.success) {
        mostrarMensagem('success', 
          categoriaEditando ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!'
        );
        fecharModal();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao salvar categoria');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao salvar categoria');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir categoria
  const handleExcluir = async (categoria: any) => {
    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    try {
      const resultado = await excluirCategoria(categoria.id);
      if (resultado.success) {
        mostrarMensagem('success', 'Categoria excluída com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir categoria');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao excluir categoria');
    }
  };

  return (
    <div className={`min-h-screen ${tema.background} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${tema.text} mb-2`}>
              Categorias
            </h1>
            <p className={tema.textSecondary}>
              Gerencie as categorias dos produtos
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
            <span>Nova Categoria</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.surface} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tema.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Buscar categorias..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 border ${tema.border} rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${tema.text}
                `}
              />
            </div>

            {/* Ordenação */}
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'data')}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="nome">Ordenar por Nome</option>
              <option value="data">Ordenar por Data</option>
            </select>
          </div>
        </div>

        {/* Lista de categorias */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoriasOrdenadas.map((categoria: any) => (
            <div key={categoria.id} className={`${tema.surface} rounded-lg shadow-sm p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: categoria.cor }}
                  />
                  <h3 className={`font-semibold ${tema.text}`}>
                    {categoria.nome}
                  </h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => abrirModalEdicao(categoria)}
                    className={`p-2 ${tema.textSecondary} hover:${tema.text} transition-colors`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleExcluir(categoria)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className={`${tema.textSecondary} text-sm mb-4`}>
                {categoria.descricao}
              </p>

              <div className="flex items-center justify-between text-xs">
                <span className={`
                  px-2 py-1 rounded-full
                  ${categoria.ativa 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                  }
                `}>
                  {categoria.ativa ? 'Ativa' : 'Inativa'}
                </span>
                
                <span className={tema.textSecondary}>
                  {new Date(
                    categoria.data_cadastro || categoria.dataCadastro || categoria.created_at
                  ).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {categoriasOrdenadas.length === 0 && (
          <div className={`${tema.surface} rounded-lg shadow-sm p-12 text-center`}>
            <Tag size={48} className={`${tema.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${tema.text} mb-2`}>
              Nenhuma categoria encontrada
            </h3>
            <p className={tema.textSecondary}>
              {busca ? 'Tente ajustar sua busca' : 'Crie sua primeira categoria para começar'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${tema.surface} rounded-lg shadow-xl w-full max-w-md`}>
            <div className="p-6">
              <h2 className={`text-xl font-bold ${tema.text} mb-6`}>
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
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
                    placeholder="Digite o nome da categoria"
                  />
                  {erros.nome && (
                    <p className="text-red-500 text-sm mt-1">{erros.nome}</p>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Descrição *
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className={`
                      w-full px-3 py-2 border rounded-lg resize-none
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${erros.descricao ? 'border-red-500' : tema.border}
                    `}
                    placeholder="Digite a descrição da categoria"
                  />
                  {erros.descricao && (
                    <p className="text-red-500 text-sm mt-1">{erros.descricao}</p>
                  )}
                </div>

                {/* Cor */}
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                    Cor *
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      className="w-12 h-10 border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                      className={`
                        flex-1 px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.cor ? 'border-red-500' : tema.border}
                      `}
                      placeholder="#3B82F6"
                    />
                  </div>
                  {erros.cor && (
                    <p className="text-red-500 text-sm mt-1">{erros.cor}</p>
                  )}
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
                  onClick={salvarCategoria}
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