// src/components/screens/TelaVendedores.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, AlertTriangle, Eye, EyeOff, X, Save } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
  dataCadastro: string;
}

interface VendedorForm {
  nome: string;
  email: string;
  telefone: string;
  login: string;
  senha: string;
  confirmarSenha: string;
  status: string;
}

export const TelaVendedores: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    vendedores, 
    setVendedores, 
    mostrarMensagem,
    cookies 
  } = useAppContext();
  
  const { formatarTelefone } = useFormatters();
  const { validarEmail, validarTelefone } = useValidation();

  // Estados Locais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [vendedorParaExcluir, setVendedorParaExcluir] = useState<Vendedor | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Filtros e Busca
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusVendedores') || 'todos';
  });

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusVendedores', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Formulário
  const [formVendedor, setFormVendedor] = useState<VendedorForm>({
    nome: '',
    email: '',
    telefone: '',
    login: '',
    senha: '',
    confirmarSenha: '',
    status: 'Ativo'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dados Filtrados
  const vendedoresFiltrados = useMemo(() => {
    let resultado = vendedores;

    // Filtro por status
    if (filtroStatus === 'ativo') {
      resultado = resultado.filter(v => v.status === 'Ativo');
    } else if (filtroStatus === 'inativo') {
      resultado = resultado.filter(v => v.status === 'Inativo');
    }

    // Filtro por busca
    if (buscaTexto.trim()) {
      const busca = buscaTexto.toLowerCase().trim();
      resultado = resultado.filter(v => 
        v.nome.toLowerCase().includes(busca) ||
        v.email.toLowerCase().includes(busca) ||
        v.login.toLowerCase().includes(busca) ||
        v.telefone.includes(busca)
      );
    }

    return resultado;
  }, [vendedores, filtroStatus, buscaTexto]);

  // Funções de Modal
  const abrirModal = useCallback((vendedor: Vendedor | null = null) => {
    setVendedorEditando(vendedor);
    if (vendedor) {
      setFormVendedor({
        nome: vendedor.nome,
        email: vendedor.email,
        telefone: vendedor.telefone,
        login: vendedor.login,
        senha: '',
        confirmarSenha: '',
        status: vendedor.status
      });
    } else {
      setFormVendedor({
        nome: '',
        email: '',
        telefone: '',
        login: '',
        senha: '',
        confirmarSenha: '',
        status: 'Ativo'
      });
    }
    setFormErrors({});
    setMostrarSenha(false);
    setMostrarConfirmarSenha(false);
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setVendedorEditando(null);
    setFormVendedor({
      nome: '',
      email: '',
      telefone: '',
      login: '',
      senha: '',
      confirmarSenha: '',
      status: 'Ativo'
    });
    setFormErrors({});
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formVendedor.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formVendedor.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formVendedor.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validarEmail(formVendedor.email)) {
      errors.email = 'Email inválido';
    }

    if (!formVendedor.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formVendedor.telefone)) {
      errors.telefone = 'Telefone inválido (formato: (11) 99999-9999)';
    }

    if (!formVendedor.login.trim()) {
      errors.login = 'Login é obrigatório';
    } else if (formVendedor.login.length < 3) {
      errors.login = 'Login deve ter pelo menos 3 caracteres';
    } else {
      // Verificar se login já existe
      const loginExiste = vendedores.some(v => 
        v.login === formVendedor.login && 
        (!vendedorEditando || v.id !== vendedorEditando.id)
      );
      if (loginExiste) {
        errors.login = 'Este login já está em uso';
      }
    }

    if (!vendedorEditando) {
      // Para novo vendedor, senha é obrigatória
      if (!formVendedor.senha) {
        errors.senha = 'Senha é obrigatória';
      } else if (formVendedor.senha.length < 6) {
        errors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }
    } else {
      // Para edição, só validar se informou uma nova senha
      if (formVendedor.senha && formVendedor.senha.length < 6) {
        errors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    if (formVendedor.senha && formVendedor.senha !== formVendedor.confirmarSenha) {
      errors.confirmarSenha = 'Senhas não coincidem';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formVendedor, vendedores, vendedorEditando, validarEmail, validarTelefone]);

  // Salvar vendedor
  const salvarVendedor = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (vendedorEditando) {
        // Editar vendedor existente
        setVendedores(prev => prev.map(v => 
          v.id === vendedorEditando.id 
            ? {
                ...v,
                nome: formVendedor.nome,
                email: formVendedor.email,
                telefone: formVendedor.telefone,
                login: formVendedor.login,
                status: formVendedor.status,
                ...(formVendedor.senha ? { senha: formVendedor.senha } : {})
              }
            : v
        ));
        mostrarMensagem('success', 'Vendedor atualizado com sucesso!');
      } else {
        // Criar novo vendedor
        const novoVendedor = {
          id: Math.max(...vendedores.map(v => v.id), 0) + 1,
          nome: formVendedor.nome,
          email: formVendedor.email,
          telefone: formVendedor.telefone,
          login: formVendedor.login,
          senha: formVendedor.senha,
          status: formVendedor.status,
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
  }, [formVendedor, vendedorEditando, vendedores, validarFormulario, setVendedores, mostrarMensagem, fecharModal]);

  // Excluir vendedor
  const confirmarExclusao = useCallback((vendedor: Vendedor) => {
    setVendedorParaExcluir(vendedor);
    setModalExclusaoAberto(true);
  }, []);

  const excluirVendedor = useCallback(async () => {
    if (!vendedorParaExcluir) return;

    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Vendedor
          </button>
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
              <p className={`${tema.textoSecundario}`}>
                {buscaTexto || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro vendedor.'
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
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                    {vendedoresFiltrados.map((vendedor) => (
                      <tr key={vendedor.id} className={`hover:${tema.hover}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${tema.texto}`}>
                              {vendedor.nome}
                            </div>
                            <div className={`text-sm ${tema.textoSecundario}`}>
                              ID: {vendedor.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${tema.texto}`}>{vendedor.email}</div>
                          <div className={`text-sm ${tema.textoSecundario}`}>{vendedor.telefone}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => abrirModal(vendedor)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => confirmarExclusao(vendedor)}
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
                {vendedoresFiltrados.map((vendedor) => (
                  <div key={vendedor.id} className={`p-4 border-b ${tema.borda}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`font-medium ${tema.texto}`}>{vendedor.nome}</h3>
                        <p className={`text-sm ${tema.textoSecundario}`}>ID: {vendedor.id}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vendedor.status === 'Ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vendedor.status}
                      </span>
                    </div>
                    
                    <div className={`text-sm ${tema.textoSecundario} mb-3 space-y-1`}>
                      <p>{vendedor.email}</p>
                      <p>{vendedor.telefone}</p>
                      <p>Login: {vendedor.login}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => abrirModal(vendedor)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(vendedor)}
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
            <div className={`${tema.papel} rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${tema.texto}`}>
                    {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
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
                      value={formVendedor.nome}
                      onChange={(e) => setFormVendedor(prev => ({ ...prev, nome: e.target.value }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Digite o nome"
                    />
                    {formErrors.nome && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formVendedor.email}
                      onChange={(e) => setFormVendedor(prev => ({ ...prev, email: e.target.value }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.email ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Digite o email"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formVendedor.telefone}
                      onChange={(e) => setFormVendedor(prev => ({ ...prev, telefone: formatarTelefone(e.target.value) }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.telefone ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="(11) 99999-9999"
                    />
                    {formErrors.telefone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.telefone}</p>
                    )}
                  </div>

                  {/* Login */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Login <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formVendedor.login}
                      onChange={(e) => setFormVendedor(prev => ({ ...prev, login: e.target.value }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.login ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Digite o login"
                    />
                    {formErrors.login && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.login}</p>
                    )}
                  </div>

                  {/* Senha */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      {vendedorEditando ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha'} 
                      {!vendedorEditando && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        value={formVendedor.senha}
                        onChange={(e) => setFormVendedor(prev => ({ ...prev, senha: e.target.value }))}
                        disabled={salvando}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.senha ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Digite a senha"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        disabled={salvando}
                        className={`absolute inset-y-0 right-0 flex items-center pr-3 ${salvando ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formErrors.senha && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.senha}</p>
                    )}
                  </div>

                  {/* Confirmar Senha */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Confirmar Senha {(!vendedorEditando || formVendedor.senha) && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarConfirmarSenha ? 'text' : 'password'}
                        value={formVendedor.confirmarSenha}
                        onChange={(e) => setFormVendedor(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                        disabled={salvando}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.confirmarSenha ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Confirme a senha"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                        disabled={salvando}
                        className={`absolute inset-y-0 right-0 flex items-center pr-3 ${salvando ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {mostrarConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formErrors.confirmarSenha && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.confirmarSenha}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formVendedor.status}
                      onChange={(e) => setFormVendedor(prev => ({ ...prev, status: e.target.value }))}
                      disabled={salvando}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
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
                      onClick={salvarVendedor}
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
                  Tem certeza de que deseja excluir o vendedor <strong>{vendedorParaExcluir?.nome}</strong>? 
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
                    onClick={excluirVendedor}
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