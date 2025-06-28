// src/components/screens/TelaVendedores.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';
import { Vendedor } from '../../types/Vendedor';

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
      resultado = resultado.filter((v: Vendedor) => v.status === 'Ativo');
    } else if (filtroStatus === 'inativo') {
      resultado = resultado.filter((v: Vendedor) => v.status === 'Inativo');
    }

    // Filtro por busca
    if (buscaTexto.trim()) {
      const busca = buscaTexto.toLowerCase().trim();
      resultado = resultado.filter((v: Vendedor) => 
        v.nome.toLowerCase().includes(busca) ||
        v.email.toLowerCase().includes(busca) ||
        v.login.toLowerCase().includes(busca) ||
        v.telefone.includes(busca)
      );
    }

    return resultado;
  }, [vendedores, filtroStatus, buscaTexto]);

  // Funções de Modal
  const abrirModal = useCallback((vendedor?: Vendedor) => {
    if (vendedor) {
      setVendedorEditando(vendedor);
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
    }
    setFormErrors({});
    setMostrarSenha(false);
    setMostrarConfirmarSenha(false);
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setVendedorEditando(null);
    setSalvando(false);
  }, []);

  const abrirModalExclusao = useCallback((vendedor: Vendedor) => {
    setVendedorParaExcluir(vendedor);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setVendedorParaExcluir(null);
  }, []);

  // Validação do Formulário
  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    // Nome
    if (!formVendedor.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formVendedor.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Email
    if (!formVendedor.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validarEmail(formVendedor.email)) {
      errors.email = 'Email inválido';
    } else {
      // Verificar se email já existe
      const emailExiste = vendedores.find((v: Vendedor) => 
        v.email === formVendedor.email && v.id !== vendedorEditando?.id
      );
      if (emailExiste) {
        errors.email = 'Este email já está cadastrado';
      }
    }

    // Telefone
    if (!formVendedor.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formVendedor.telefone)) {
      errors.telefone = 'Telefone inválido. Use (11) 99999-9999';
    }

    // Login
    if (!formVendedor.login.trim()) {
      errors.login = 'Login é obrigatório';
    } else if (formVendedor.login.trim().length < 3) {
      errors.login = 'Login deve ter pelo menos 3 caracteres';
    } else {
      // Verificar se login já existe
      const loginExiste = vendedores.find((v: Vendedor) => 
        v.login === formVendedor.login && v.id !== vendedorEditando?.id
      );
      if (loginExiste) {
        errors.login = 'Este login já está em uso';
      }
    }

    // Senha (obrigatória apenas para novos vendedores ou se preenchida na edição)
    const senhaObrigatoria = !vendedorEditando || formVendedor.senha.trim();
    if (senhaObrigatoria) {
      if (!formVendedor.senha) {
        errors.senha = 'Senha é obrigatória';
      } else if (formVendedor.senha.length < 6) {
        errors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (!formVendedor.confirmarSenha) {
        errors.confirmarSenha = 'Confirmação de senha é obrigatória';
      } else if (formVendedor.senha !== formVendedor.confirmarSenha) {
        errors.confirmarSenha = 'Senhas não coincidem';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formVendedor, vendedores, vendedorEditando, validarEmail, validarTelefone]);

  // Salvar Vendedor
  const salvarVendedor = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    try {
      if (vendedorEditando) {
        // Atualizar vendedor existente
        const vendedorAtualizado: Vendedor = {
          ...vendedorEditando,
          nome: formVendedor.nome.trim(),
          email: formVendedor.email.trim(),
          telefone: formVendedor.telefone,
          login: formVendedor.login.trim(),
          senha: formVendedor.senha || vendedorEditando.senha,
          status: formVendedor.status
        };
        
        setVendedores((prev: Vendedor[]) => 
          prev.map(v => v.id === vendedorEditando.id ? vendedorAtualizado : v)
        );
        mostrarMensagem('success', 'Vendedor atualizado com sucesso!');
      } else {
        // Criar novo vendedor
        const novoId = Math.max(...vendedores.map((v: Vendedor) => v.id), 0) + 1;
        const novoVendedor: Vendedor = {
          id: novoId,
          nome: formVendedor.nome.trim(),
          email: formVendedor.email.trim(),
          telefone: formVendedor.telefone,
          login: formVendedor.login.trim(),
          senha: formVendedor.senha,
          status: formVendedor.status,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        
        setVendedores((prev: Vendedor[]) => [...prev, novoVendedor]);
        mostrarMensagem('success', 'Vendedor criado com sucesso!');
      }

      fecharModal();
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar vendedor');
    } finally {
      setSalvando(false);
    }
  }, [formVendedor, vendedorEditando, vendedores, setVendedores, mostrarMensagem, validarFormulario, fecharModal]);

  // Excluir Vendedor
  const confirmarExclusao = useCallback(() => {
    if (!vendedorParaExcluir) return;

    setVendedores((prev: Vendedor[]) => 
      prev.filter(v => v.id !== vendedorParaExcluir.id)
    );
    mostrarMensagem('success', `Vendedor "${vendedorParaExcluir.nome}" excluído com sucesso!`);
    fecharModalExclusao();
  }, [vendedorParaExcluir, setVendedores, mostrarMensagem, fecharModalExclusao]);

  // Render
  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>Vendedores</h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie os vendedores do sistema
            </p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Vendedor
          </button>
        </div>

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vendedores..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
              />
            </div>
            
            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Apenas Ativos</option>
              <option value="inativo">Apenas Inativos</option>
            </select>
            
            {/* Contador */}
            <div className={`flex items-center text-sm ${tema.textoSecundario} md:col-span-2`}>
              Mostrando <span className="font-semibold mx-1">{vendedoresFiltrados.length}</span> 
              de <span className="font-semibold mx-1">{vendedores.length}</span> vendedores
            </div>
          </div>
        </div>

        {/* Tabela Desktop */}
        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Vendedor
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Telefone
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
                {vendedoresFiltrados.map((vendedor: Vendedor) => (
                  <tr key={vendedor.id} className={`${tema.hover} transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${tema.texto}`}>
                      {vendedor.nome}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                      {vendedor.email}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                      {vendedor.telefone}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario} font-mono`}>
                      {vendedor.login}
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
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Editar vendedor"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => abrirModalExclusao(vendedor)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Excluir vendedor"
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

          {/* Cards Mobile */}
          <div className="md:hidden space-y-4 p-4">
            {vendedoresFiltrados.map((vendedor: Vendedor) => (
              <div key={vendedor.id} className={`${tema.papel} border ${tema.borda} rounded-lg p-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-semibold ${tema.texto}`}>{vendedor.nome}</h3>
                    <p className={`text-sm ${tema.textoSecundario}`}>{vendedor.email}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    vendedor.status === 'Ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vendedor.status}
                  </span>
                </div>
                
                <div className="space-y-1 mb-4">
                  <p className={`text-sm ${tema.textoSecundario}`}>
                    <span className="font-medium">Telefone:</span> {vendedor.telefone}
                  </p>
                  <p className={`text-sm ${tema.textoSecundario}`}>
                    <span className="font-medium">Login:</span> {vendedor.login}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => abrirModal(vendedor)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => abrirModalExclusao(vendedor)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Estado Vazio */}
          {vendedoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className={`mx-auto h-12 w-12 ${tema.textoSecundario} mb-4`} />
              <h3 className={`text-lg font-medium ${tema.texto} mb-2`}>
                Nenhum vendedor encontrado
              </h3>
              <p className={`text-sm ${tema.textoSecundario} mb-4`}>
                {buscaTexto || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros para encontrar vendedores.'
                  : 'Comece criando seu primeiro vendedor.'
                }
              </p>
              {(!buscaTexto && filtroStatus === 'todos') && (
                <button
                  onClick={() => abrirModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Criar Primeiro Vendedor
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de Vendedor */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                onClick={() => !salvando && fecharModal()}
              />
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-6`}>
                    {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Nome Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formVendedor.nome}
                        onChange={(e) => setFormVendedor(prev => ({ ...prev, nome: e.target.value }))}
                        disabled={salvando}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Digite o nome completo"
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
                        placeholder="exemplo@email.com"
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
                        type="tel"
                        value={formVendedor.telefone}
                        onChange={(e) => setFormVendedor(prev => ({ 
                          ...prev, 
                          telefone: formatarTelefone(e.target.value) 
                        }))}
                        disabled={salvando}
                        maxLength={15}
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
                          {mostrarSenha ? (
                            <EyeOff className={`h-4 w-4 ${tema.textoSecundario}`} />
                          ) : (
                            <Eye className={`h-4 w-4 ${tema.textoSecundario}`} />
                          )}
                        </button>
                      </div>
                      {formErrors.senha && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.senha}</p>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Confirmar Senha 
                        {(!vendedorEditando || formVendedor.senha) && <span className="text-red-500">*</span>}
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
                          {mostrarConfirmarSenha ? (
                            <EyeOff className={`h-4 w-4 ${tema.textoSecundario}`} />
                          ) : (
                            <Eye className={`h-4 w-4 ${tema.textoSecundario}`} />
                          )}
                        </button>
                      </div>
                      {formErrors.confirmarSenha && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmarSenha}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                        Status
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
                  </div>
                </div>
                
                <div className={`${tema.papel} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                  <button
                    onClick={salvarVendedor}
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
        {modalExclusaoAberto && vendedorParaExcluir && (
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
                          Tem certeza que deseja excluir o vendedor <strong>"{vendedorParaExcluir.nome}"</strong>? 
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
