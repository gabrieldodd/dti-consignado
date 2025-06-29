// src/components/screens/TelaVendedores.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  X, 
  Save,
  AlertTriangle,
  Mail,
  Phone,
  User,
  Lock,
  Calendar
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

interface VendedorForm {
  nome: string;
  email: string;
  telefone: string;
  login: string;
  senha: string;
  confirmarSenha: string;
  status: string;
}

const FORM_INICIAL: VendedorForm = {
  nome: '',
  email: '',
  telefone: '',
  login: '',
  senha: '',
  confirmarSenha: '',
  status: 'Ativo'
};

export const TelaVendedores: React.FC = () => {
  // Context
  const { 
    tema, 
    vendedores, 
    setVendedores, 
    mostrarMensagem,
    tipoUsuario 
  } = useAppContext();

  // Estados Locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<any>(null);
  const [vendedorParaExcluir, setVendedorParaExcluir] = useState<any>(null);
  const [formData, setFormData] = useState<VendedorForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Filtros e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Funções de formatação
  const formatarTelefone = useCallback((telefone: string) => {
    const limpo = telefone.replace(/\D/g, '');
    if (limpo.length <= 10) {
      return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }, []);

  const formatarData = useCallback((data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  }, []);

  // Funções de validação
  const validarEmail = useCallback((email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  const validarTelefone = useCallback((telefone: string) => {
    const limpo = telefone.replace(/\D/g, '');
    return limpo.length >= 10;
  }, []);

  // Dados filtrados
  const vendedoresFiltrados = useMemo(() => {
    return vendedores.filter(vendedor => {
      const matchBusca = !buscaTexto || 
        vendedor.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        vendedor.email.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        vendedor.login.toLowerCase().includes(buscaTexto.toLowerCase());
      
      const matchStatus = filtroStatus === 'todos' || 
        vendedor.status.toLowerCase() === filtroStatus.toLowerCase();
      
      return matchBusca && matchStatus;
    });
  }, [vendedores, buscaTexto, filtroStatus]);

  // Validar formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validarEmail(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formData.telefone)) {
      errors.telefone = 'Telefone inválido';
    }

    if (!formData.login.trim()) {
      errors.login = 'Login é obrigatório';
    } else if (formData.login.length < 3) {
      errors.login = 'Login deve ter pelo menos 3 caracteres';
    }

    if (!vendedorEditando) {
      if (!formData.senha.trim()) {
        errors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        errors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.senha !== formData.confirmarSenha) {
        errors.confirmarSenha = 'Senhas não conferem';
      }
    }

    // Verificar se login já existe
    const loginExiste = vendedores.some(v => 
      v.login === formData.login && 
      (!vendedorEditando || v.id !== vendedorEditando.id)
    );
    if (loginExiste) {
      errors.login = 'Login já existe';
    }

    // Verificar se email já existe
    const emailExiste = vendedores.some(v => 
      v.email === formData.email && 
      (!vendedorEditando || v.id !== vendedorEditando.id)
    );
    if (emailExiste) {
      errors.email = 'Email já cadastrado';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, vendedores, vendedorEditando, validarEmail, validarTelefone]);

  // Abrir modal
  const abrirModal = useCallback((vendedor?: any) => {
    setVendedorEditando(vendedor || null);
    setFormData(vendedor ? {
      nome: vendedor.nome,
      email: vendedor.email,
      telefone: vendedor.telefone,
      login: vendedor.login,
      senha: '',
      confirmarSenha: '',
      status: vendedor.status
    } : FORM_INICIAL);
    setFormErrors({});
    setMostrarSenha(false);
    setMostrarConfirmarSenha(false);
    setModalAberto(true);
  }, []);

  // Fechar modal
  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setVendedorEditando(null);
    setFormData(FORM_INICIAL);
    setFormErrors({});
  }, []);

  // Salvar vendedor
  const salvarVendedor = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    try {
      if (vendedorEditando) {
        // Editar
        const vendedorAtualizado = {
          ...vendedorEditando,
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          telefone: formData.telefone.trim(),
          login: formData.login.trim(),
          status: formData.status,
          ...(formData.senha && { senha: formData.senha })
        };

        setVendedores(prev => prev.map(v => 
          v.id === vendedorEditando.id ? vendedorAtualizado : v
        ));
        mostrarMensagem('success', 'Vendedor atualizado com sucesso!');
      } else {
        // Criar
        const novoVendedor = {
          id: Math.max(...vendedores.map(v => v.id), 0) + 1,
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          telefone: formData.telefone.trim(),
          login: formData.login.trim(),
          senha: formData.senha,
          status: formData.status,
          dataCadastro: new Date().toISOString().split('T')[0]
        };

        setVendedores(prev => [...prev, novoVendedor]);
        mostrarMensagem('success', 'Vendedor criado com sucesso!');
      }

      fecharModal();
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar vendedor');
    } finally {
      setSalvando(false);
    }
  }, [formData, vendedorEditando, vendedores, setVendedores, mostrarMensagem, validarFormulario, fecharModal]);

  // Confirmar exclusão
  const confirmarExclusao = useCallback((vendedor: any) => {
    setVendedorParaExcluir(vendedor);
    setModalExclusaoAberto(true);
  }, []);

  // Excluir vendedor
  const excluirVendedor = useCallback(async () => {
    if (!vendedorParaExcluir) return;

    setSalvando(true);
    try {
      setVendedores(prev => prev.filter(v => v.id !== vendedorParaExcluir.id));
      mostrarMensagem('success', 'Vendedor excluído com sucesso!');
      setModalExclusaoAberto(false);
      setVendedorParaExcluir(null);
    } catch (error) {
      mostrarMensagem('error', 'Erro ao excluir vendedor');
    } finally {
      setSalvando(false);
    }
  }, [vendedorParaExcluir, setVendedores, mostrarMensagem]);

  // Verificar permissões
  const podeGerenciar = tipoUsuario === 'admin';

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>Vendedores</h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie os vendedores do sistema
            </p>
          </div>
          {podeGerenciar && (
            <button
              onClick={() => abrirModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Vendedor
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar vendedores..."
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
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>

            <div className={`flex items-center ${tema.textoSecundario}`}>
              <span className="text-sm">
                {vendedoresFiltrados.length} vendedor(es) encontrado(s)
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Vendedores */}
        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
          {vendedoresFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <Users className={`mx-auto h-12 w-12 ${tema.textoSecundario} mb-4`} />
              <h3 className={`text-lg font-medium ${tema.texto} mb-2`}>
                Nenhum vendedor encontrado
              </h3>
              <p className={tema.textoSecundario}>
                {buscaTexto || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando um novo vendedor'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop - Tabela */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={tema.fundo}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Vendedor
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Contato
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Login
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                        Cadastro
                      </th>
                      {podeGerenciar && (
                        <th className={`px-6 py-3 text-right text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                    {vendedoresFiltrados.map((vendedor) => (
                      <tr key={vendedor.id} className={`${tema.hover}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className={`h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center`}>
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${tema.texto}`}>
                                {vendedor.nome}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${tema.texto}`}>{vendedor.email}</div>
                          <div className={`text-sm ${tema.textoSecundario}`}>
                            {formatarTelefone(vendedor.telefone)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${tema.texto}`}>{vendedor.login}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            vendedor.status === 'Ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vendedor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${tema.textoSecundario}`}>
                            {formatarData(vendedor.dataCadastro)}
                          </div>
                        </td>
                        {podeGerenciar && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => abrirModal(vendedor)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => confirmarExclusao(vendedor)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile - Cards */}
              <div className="md:hidden p-4 space-y-4">
                {vendedoresFiltrados.map((vendedor) => (
                  <div key={vendedor.id} className={`border ${tema.borda} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3`}>
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className={`font-medium ${tema.texto}`}>{vendedor.nome}</h3>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vendedor.status === 'Ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vendedor.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center">
                        <Mail className={`h-4 w-4 ${tema.textoSecundario} mr-2`} />
                        <span className={`text-sm ${tema.texto}`}>{vendedor.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className={`h-4 w-4 ${tema.textoSecundario} mr-2`} />
                        <span className={`text-sm ${tema.texto}`}>
                          {formatarTelefone(vendedor.telefone)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className={`h-4 w-4 ${tema.textoSecundario} mr-2`} />
                        <span className={`text-sm ${tema.texto}`}>{vendedor.login}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className={`h-4 w-4 ${tema.textoSecundario} mr-2`} />
                        <span className={`text-sm ${tema.textoSecundario}`}>
                          Cadastrado em {formatarData(vendedor.dataCadastro)}
                        </span>
                      </div>
                    </div>

                    {podeGerenciar && (
                      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => abrirModal(vendedor)}
                          className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => confirmarExclusao(vendedor)}
                          className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal de Formulário */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-medium ${tema.texto}`}>
                    {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
                  </h3>
                  <button
                    onClick={fecharModal}
                    className={`p-2 rounded-md ${tema.hover} ${tema.texto}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); salvarVendedor(); }}>
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''}`}
                        placeholder="Digite o nome completo"
                      />
                      {formErrors.nome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.email ? 'border-red-500' : ''}`}
                        placeholder="email@exemplo.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.telefone ? 'border-red-500' : ''}`}
                        placeholder="(11) 99999-9999"
                      />
                      {formErrors.telefone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.telefone}</p>
                      )}
                    </div>

                    {/* Login */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Login *
                      </label>
                      <input
                        type="text"
                        value={formData.login}
                        onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.login ? 'border-red-500' : ''}`}
                        placeholder="login_usuario"
                      />
                      {formErrors.login && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.login}</p>
                      )}
                    </div>

                    {/* Senha */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        {vendedorEditando ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarSenha ? 'text' : 'password'}
                          value={formData.senha}
                          onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.senha ? 'border-red-500' : ''}`}
                          placeholder="Digite a senha"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {mostrarSenha ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {formErrors.senha && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.senha}</p>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    {!vendedorEditando && (
                      <div>
                        <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                          Confirmar Senha *
                        </label>
                        <div className="relative">
                          <input
                            type={mostrarConfirmarSenha ? 'text' : 'password'}
                            value={formData.confirmarSenha}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input} ${formErrors.confirmarSenha ? 'border-red-500' : ''}`}
                            placeholder="Confirme a senha"
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {mostrarConfirmarSenha ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {formErrors.confirmarSenha && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.confirmarSenha}</p>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.input}`}
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={fecharModal}
                      className={`px-4 py-2 border ${tema.borda} rounded-md text-sm font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {salvando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {vendedorEditando ? 'Atualizar' : 'Criar'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6`}>
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
                        Tem certeza que deseja excluir o vendedor{' '}
                        <span className="font-semibold">{vendedorParaExcluir?.nome}</span>?
                      </p>
                      <p className={`text-sm ${tema.textoSecundario} mt-1`}>
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={excluirVendedor}
                    disabled={salvando}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvando ? 'Excluindo...' : 'Excluir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalExclusaoAberto(false);
                      setVendedorParaExcluir(null);
                    }}
                    className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm`}
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