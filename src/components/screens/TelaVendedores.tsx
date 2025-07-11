// src/components/screens/TelaVendedores.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Users, Eye, EyeOff, CheckCircle, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const TelaVendedores: React.FC = () => {
  const { 
    tema, 
    vendedores, 
    adicionarVendedor, 
    atualizarVendedor, 
    excluirVendedor, 
    mostrarMensagem,
    validarEmail
  } = useAppContext();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'email' | 'data'>('nome');
  const [modalAberto, setModalAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    login: '',
    senha: '',
    confirmarSenha: '',
    status: 'ativo'
  });

  const [erros, setErros] = useState<Record<string, string>>({});

  // Vendedores filtrados e ordenados
  const vendedoresOrdenados = useMemo(() => {
    let filtrados = vendedores.filter((vendedor: any) => {
      const buscaMatch = 
        (vendedor.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (vendedor.email || '').toLowerCase().includes(busca.toLowerCase()) ||
        (vendedor.login || '').toLowerCase().includes(busca.toLowerCase());

      const statusMatch = filtroStatus === 'todos' || vendedor.status === filtroStatus;

      return buscaMatch && statusMatch;
    });

    return [...filtrados].sort((a: any, b: any) => {
      switch (ordenacao) {
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'data':
          const dataA = a.data_cadastro || a.dataCadastro || a.created_at || '';
          const dataB = b.data_cadastro || b.dataCadastro || b.created_at || '';
          return new Date(dataB).getTime() - new Date(dataA).getTime();
        default:
          return (a.nome || '').localeCompare(b.nome || '');
      }
    });
  }, [vendedores, busca, filtroStatus, ordenacao]);

  // Validação do formulário
  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!validarEmail(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    }

    if (!formData.login.trim()) {
      novosErros.login = 'Login é obrigatório';
    } else if (formData.login.length < 3) {
      novosErros.login = 'Login deve ter pelo menos 3 caracteres';
    }

    // Verificar se login já existe (apenas para novos vendedores)
    if (!vendedorEditando) {
      const loginExiste = vendedores.some((v: any) => v.login === formData.login);
      if (loginExiste) {
        novosErros.login = 'Login já está em uso';
      }
    }

    if (!vendedorEditando || formData.senha) {
      if (!formData.senha) {
        novosErros.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 3) {
        novosErros.senha = 'Senha deve ter pelo menos 3 caracteres';
      }

      if (formData.senha !== formData.confirmarSenha) {
        novosErros.confirmarSenha = 'Senhas não conferem';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Abrir modal para novo vendedor
  const abrirModalNovo = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      login: '',
      senha: '',
      confirmarSenha: '',
      status: 'ativo'
    });
    setVendedorEditando(null);
    setErros({});
    setMostrarSenha(false);
    setModalAberto(true);
  };

  // Abrir modal para editar vendedor
  const abrirModalEdicao = (vendedor: any) => {
    setFormData({
      nome: vendedor.nome || '',
      email: vendedor.email || '',
      telefone: vendedor.telefone || '',
      login: vendedor.login || '',
      senha: '',
      confirmarSenha: '',
      status: vendedor.status || 'ativo'
    });
    setVendedorEditando(vendedor);
    setErros({});
    setMostrarSenha(false);
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
    setVendedorEditando(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      login: '',
      senha: '',
      confirmarSenha: '',
      status: 'ativo'
    });
    setErros({});
    setMostrarSenha(false);
  };

  // Salvar vendedor
  const salvarVendedor = async () => {
    if (!validarFormulario()) return;

    setCarregando(true);
    try {
      const dadosVendedor: any = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.trim(),
        login: formData.login.trim(),
        status: formData.status,
        data_cadastro: new Date().toISOString()
      };

      // Incluir senha apenas se fornecida
      if (formData.senha) {
        dadosVendedor.senha = formData.senha;
      }

      let resultado;
      if (vendedorEditando) {
        resultado = await atualizarVendedor(vendedorEditando.id, dadosVendedor);
      } else {
        resultado = await adicionarVendedor(dadosVendedor);
      }

      if (resultado.success) {
        mostrarMensagem('success', 
          vendedorEditando ? 'Vendedor atualizado com sucesso!' : 'Vendedor criado com sucesso!'
        );
        fecharModal();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao salvar vendedor');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao salvar vendedor');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir vendedor
  const handleExcluir = async (vendedor: any) => {
    if (!window.confirm(`Tem certeza que deseja excluir o vendedor "${vendedor.nome}"?`)) {
      return;
    }

    try {
      const resultado = await excluirVendedor(vendedor.id);
      if (resultado.success) {
        mostrarMensagem('success', 'Vendedor excluído com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir vendedor');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao excluir vendedor');
    }
  };

  // Alternar status ativo/inativo
  const alternarStatus = async (vendedor: any) => {
    const novoStatus = vendedor.status === 'ativo' ? 'inativo' : 'ativo';
    
    try {
      const resultado = await atualizarVendedor(vendedor.id, { status: novoStatus });
      if (resultado.success) {
        mostrarMensagem('success', 
          `Vendedor ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`
        );
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao alterar status');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro inesperado ao alterar status');
    }
  };

  return (
    <div className={`min-h-screen ${tema.background} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${tema.text} mb-2`}>
              Vendedores
            </h1>
            <p className={tema.textSecondary}>
              Gerencie a equipe de vendedores
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
            <span>Novo Vendedor</span>
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.surface} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tema.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder="Buscar vendedores..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 border ${tema.border} rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${tema.text}
                `}
              />
            </div>

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
            </select>

            {/* Ordenação */}
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'email' | 'data')}
              className={`
                px-4 py-2 border ${tema.border} rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${tema.text}
              `}
            >
              <option value="nome">Ordenar por Nome</option>
              <option value="email">Ordenar por Email</option>
              <option value="data">Ordenar por Data</option>
            </select>
          </div>
        </div>

        {/* Lista de vendedores */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vendedoresOrdenados.map((vendedor: any) => (
            <div key={vendedor.id} className={`${tema.surface} rounded-lg shadow-sm p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`font-semibold ${tema.text} mb-1`}>
                    {vendedor.nome}
                  </h3>
                  <p className={`text-sm ${tema.textSecondary} mb-1`}>
                    {vendedor.email}
                  </p>
                  <p className={`text-sm ${tema.textSecondary}`}>
                    {vendedor.telefone}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => abrirModalEdicao(vendedor)}
                    className={`p-2 ${tema.textSecondary} hover:${tema.text} transition-colors`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleExcluir(vendedor)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className={tema.textSecondary}>Login:</span>
                  <span className={`font-medium ${tema.text}`}>
                    {vendedor.login}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className={tema.textSecondary}>Cadastro:</span>
                  <span className={tema.text}>
                    {new Date(
                      vendedor.data_cadastro || 
                      vendedor.dataCadastro || 
                      vendedor.created_at ||
                      new Date()
                    ).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => alternarStatus(vendedor)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1
                    ${vendedor.status === 'ativo' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } transition-colors
                  `}
                >
                  {vendedor.status === 'ativo' ? <CheckCircle size={14} /> : <X size={14} />}
                  <span className="capitalize">{vendedor.status}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {vendedoresOrdenados.length === 0 && (
          <div className={`${tema.surface} rounded-lg shadow-sm p-12 text-center`}>
            <Users size={48} className={`${tema.textSecondary} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${tema.text} mb-2`}>
              Nenhum vendedor encontrado
            </h3>
            <p className={tema.textSecondary}>
              {busca || filtroStatus !== 'todos' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Crie seu primeiro vendedor para começar'}
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
                {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
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
                    placeholder="Digite o nome completo"
                  />
                  {erros.nome && (
                    <p className="text-red-500 text-sm mt-1">{erros.nome}</p>
                  )}
                </div>

                {/* Email e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.email ? 'border-red-500' : tema.border}
                      `}
                      placeholder="email@exemplo.com"
                    />
                    {erros.email && (
                      <p className="text-red-500 text-sm mt-1">{erros.email}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Telefone *
                    </label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.telefone ? 'border-red-500' : tema.border}
                      `}
                      placeholder="(11) 99999-9999"
                    />
                    {erros.telefone && (
                      <p className="text-red-500 text-sm mt-1">{erros.telefone}</p>
                    )}
                  </div>
                </div>

                {/* Login e Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Login *
                    </label>
                    <input
                      type="text"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.login ? 'border-red-500' : tema.border}
                      `}
                      placeholder="usuario123"
                      disabled={vendedorEditando !== null}
                    />
                    {erros.login && (
                      <p className="text-red-500 text-sm mt-1">{erros.login}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Senha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Senha {!vendedorEditando && '*'}
                      {vendedorEditando && (
                        <span className="text-xs text-gray-500 ml-1">(deixe vazio para manter atual)</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        className={`
                          w-full px-3 py-2 pr-10 border rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${erros.senha ? 'border-red-500' : tema.border}
                        `}
                        placeholder="Digite a senha"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${tema.textSecondary}`}
                      >
                        {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {erros.senha && (
                      <p className="text-red-500 text-sm mt-1">{erros.senha}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-2`}>
                      Confirmar Senha {!vendedorEditando && '*'}
                    </label>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                      className={`
                        w-full px-3 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${erros.confirmarSenha ? 'border-red-500' : tema.border}
                      `}
                      placeholder="Confirme a senha"
                    />
                    {erros.confirmarSenha && (
                      <p className="text-red-500 text-sm mt-1">{erros.confirmarSenha}</p>
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
                  onClick={salvarVendedor}
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