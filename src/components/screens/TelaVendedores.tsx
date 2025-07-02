// src/components/screens/TelaVendedores.tsx
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';

// Interfaces
interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
  data_cadastro: string;
}

interface VendedorForm {
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
}

// Form inicial
const FORM_INICIAL: VendedorForm = {
  nome: '',
  email: '',
  telefone: '',
  status: 'Ativo',
  login: '',
  senha: ''
};

// Componente de estatísticas
const EstatisticasVendedores = memo(() => {
  const { tema, vendedores } = useAppContext();
  
  const estatisticas = useMemo(() => {
    const ativos = vendedores.filter(v => v.status === 'Ativo').length;
    const inativos = vendedores.filter(v => v.status === 'Inativo').length;
    const total = vendedores.length;
    
    return { ativos, inativos, total };
  }, [vendedores]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Total</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.total}</p>
          </div>
          <Users className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Ativos</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.ativos}</p>
          </div>
          <UserCheck className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${tema.textoSecundario}`}>Inativos</p>
            <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.inativos}</p>
          </div>
          <UserX className="h-8 w-8 text-red-600" />
        </div>
      </div>
    </div>
  );
});

// Componente principal
export const TelaVendedores: React.FC = () => {
  // Context e Hooks
  const { 
    tema, 
    vendedores,
    mostrarMensagem,
    cookies,
    tipoUsuario,
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    loadingVendedores,
    errorVendedores
  } = useAppContext();
  
  const { formatarTelefone } = useFormatters();
  const { validarEmail, validarTelefone } = useValidation();

  // Loading e Erro
  if (loadingVendedores) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${tema.textoSecundario}`}>Carregando vendedores...</p>
        </div>
      </div>
    );
  }

  if (errorVendedores) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className={`h-12 w-12 ${tema.textoSecundario} mx-auto mb-4`} />
          <p className={`${tema.texto} font-medium mb-2`}>Erro ao carregar vendedores</p>
          <p className={`${tema.textoSecundario} text-sm mb-4`}>{errorVendedores}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Estados
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [vendedorParaExcluir, setVendedorParaExcluir] = useState<Vendedor | null>(null);
  const [salvando, setSalvando] = useState(false);
  
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusVendedores') || 'todos';
  });
  const [buscaTexto, setBuscaTexto] = useState('');

  // Estados do formulário
  const [formVendedor, setFormVendedor] = useState<VendedorForm>(FORM_INICIAL);
  const [formErrors, setFormErrors] = useState<any>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Salvar filtros nos cookies
  useEffect(() => {
    cookies.setCookie('filtroStatusVendedores', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  // Filtrar vendedores
  const vendedoresFiltrados = useMemo(() => {
    let resultado = vendedores;

    if (filtroStatus !== 'todos') {
      const statusFiltro = filtroStatus === 'ativo' ? 'Ativo' : 'Inativo';
      resultado = resultado.filter(v => v.status === statusFiltro);
    }

    if (buscaTexto) {
      resultado = resultado.filter(v => 
        v.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        v.email.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        v.login.toLowerCase().includes(buscaTexto.toLowerCase())
      );
    }

    return resultado;
  }, [vendedores, filtroStatus, buscaTexto]);

  // Handlers modais
  const abrirModal = useCallback((vendedor?: Vendedor) => {
    if (vendedor) {
      setVendedorEditando(vendedor);
      setFormVendedor({
        nome: vendedor.nome,
        email: vendedor.email,
        telefone: vendedor.telefone,
        status: vendedor.status,
        login: vendedor.login,
        senha: vendedor.senha
      });
    } else {
      setVendedorEditando(null);
      setFormVendedor(FORM_INICIAL);
    }
    setFormErrors({});
    setMostrarSenha(false);
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setVendedorEditando(null);
    setFormVendedor(FORM_INICIAL);
    setFormErrors({});
    setMostrarSenha(false);
  }, []);

  const abrirModalExclusao = useCallback((vendedor: Vendedor) => {
    setVendedorParaExcluir(vendedor);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setVendedorParaExcluir(null);
  }, []);

  // Validação do formulário
  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!formVendedor.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formVendedor.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validarEmail(formVendedor.email)) {
      errors.email = 'Email inválido';
    }

    if (!formVendedor.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    }

    if (!formVendedor.login.trim()) {
      errors.login = 'Login é obrigatório';
    } else if (formVendedor.login.length < 3) {
      errors.login = 'Login deve ter pelo menos 3 caracteres';
    }

    if (!formVendedor.senha.trim()) {
      errors.senha = 'Senha é obrigatória';
    } else if (formVendedor.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Verificar duplicatas (apenas para novos vendedores ou mudança de email/login)
    if (!vendedorEditando || formVendedor.email !== vendedorEditando.email) {
      const emailExiste = vendedores.some(v => 
        v.email === formVendedor.email && v.id !== vendedorEditando?.id
      );
      if (emailExiste) {
        errors.email = 'Este email já está em uso';
      }
    }

    if (!vendedorEditando || formVendedor.login !== vendedorEditando.login) {
      const loginExiste = vendedores.some(v => 
        v.login === formVendedor.login && v.id !== vendedorEditando?.id
      );
      if (loginExiste) {
        errors.login = 'Este login já está em uso';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formVendedor, vendedorEditando, vendedores, validarEmail]);

  // Salvar vendedor
  const salvarVendedor = useCallback(async () => {
    if (!validarFormulario()) return;

    setSalvando(true);
    
    try {
      if (vendedorEditando) {
        // Atualizar vendedor existente
        const resultado = await atualizarVendedor(vendedorEditando.id, formVendedor);
        if (resultado.success) {
          mostrarMensagem('success', 'Vendedor atualizado com sucesso!');
          fecharModal();
        } else {
          mostrarMensagem('error', resultado.error || 'Erro ao atualizar vendedor');
        }
      } else {
        // Criar novo vendedor
        const resultado = await adicionarVendedor(formVendedor);
        if (resultado.success) {
          mostrarMensagem('success', 'Vendedor criado com sucesso!');
          fecharModal();
        } else {
          mostrarMensagem('error', resultado.error || 'Erro ao criar vendedor');
        }
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar vendedor');
    } finally {
      setSalvando(false);
    }
  }, [formVendedor, vendedorEditando, validarFormulario, adicionarVendedor, atualizarVendedor, mostrarMensagem, fecharModal]);

  // Confirmar exclusão
  const confirmarExclusao = useCallback(async () => {
    if (!vendedorParaExcluir) return;

    setSalvando(true);
    
    try {
      const resultado = await excluirVendedor(vendedorParaExcluir.id);
      if (resultado.success) {
        mostrarMensagem('success', `Vendedor "${vendedorParaExcluir.nome}" excluído com sucesso!`);
        fecharModalExclusao();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir vendedor');
      }
    } catch (error) {
      mostrarMensagem('error', 'Erro ao excluir vendedor');
    } finally {
      setSalvando(false);
    }
  }, [vendedorParaExcluir, excluirVendedor, mostrarMensagem, fecharModalExclusao]);

  // Verificar permissões
  const podeGerenciar = tipoUsuario === 'admin';

  if (!podeGerenciar) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className={`h-12 w-12 ${tema.textoSecundario} mx-auto mb-4`} />
          <p className={`${tema.texto} font-medium`}>Acesso Negado</p>
          <p className={`${tema.textoSecundario} text-sm`}>
            Apenas administradores podem gerenciar vendedores
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${tema.fundo} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${tema.texto} flex items-center`}>
              <Users className="mr-3 h-6 w-6" />
              Vendedores
            </h1>
            <p className={`text-sm ${tema.textoSecundario}`}>
              Gerencie os vendedores do sistema
            </p>
          </div>
          
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Vendedor
          </button>
        </div>

        {/* Estatísticas */}
        <EstatisticasVendedores />

        {/* Filtros */}
        <div className={`${tema.papel} p-4 rounded-lg border ${tema.borda} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                Buscar
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${tema.textoSecundario} h-4 w-4`} />
                <input
                  type="text"
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  placeholder="Nome, email ou login..."
                  className={`w-full pl-10 pr-3 py-2 border rounded-md ${tema.input} ${tema.borda}`}
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${tema.texto} mb-1`}>
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${tema.input} ${tema.borda}`}
              >
                <option value="todos">Todos</option>
                <option value="ativo">Apenas Ativos</option>
                <option value="inativo">Apenas Inativos</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className={`text-sm ${tema.textoSecundario}`}>
                {vendedoresFiltrados.length} de {vendedores.length} vendedores
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Vendedores */}
        <div className={`${tema.papel} rounded-lg border ${tema.borda} overflow-hidden table-responsive`}>
          <div className="custom-scrollbar overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-800' : 'bg-gray-50'}>
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                {vendedoresFiltrados.map((vendedor) => (
                  <tr key={vendedor.id} className={`${tema.hover} table-hover-row`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full ${vendedor.status === 'Ativo' ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                            <span className={`text-sm font-medium ${vendedor.status === 'Ativo' ? 'text-green-600' : 'text-gray-600'}`}>
                              {vendedor.nome.charAt(0).toUpperCase()}
                            </span>
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
                      <div className={`text-sm ${tema.texto}`}>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {vendedor.email}
                        </div>
                        <div className={`flex items-center mt-1 ${tema.textoSecundario}`}>
                          <Phone className="h-4 w-4 mr-1" />
                          {vendedor.telefone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-mono ${tema.texto}`}>
                        {vendedor.login}
                      </div>
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
                      <div className={`text-sm ${tema.textoSecundario} flex items-center`}>
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(vendedor.data_cadastro).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => abrirModal(vendedor)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar vendedor"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => abrirModalExclusao(vendedor)}
                          className="text-red-600 hover:text-red-700"
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

          {vendedoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className={`mx-auto h-12 w-12 ${tema.textoSecundario}`} />
              <h3 className={`mt-2 text-sm font-medium ${tema.texto}`}>
                Nenhum vendedor encontrado
              </h3>
              <p className={`mt-1 text-sm ${tema.textoSecundario}`}>
                {vendedores.length === 0 
                  ? 'Comece criando seu primeiro vendedor.'
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modal Vendedor */}
        {modalAberto && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && fecharModal()}></div>
              
              <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                    {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formVendedor.nome}
                        onChange={(e) => setFormVendedor(prev => ({ ...prev, nome: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.nome ? 'border-red-500' : tema.borda}`}
                        placeholder="Nome completo"
                        disabled={salvando}
                      />
                      {formErrors.nome && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formVendedor.email}
                        onChange={(e) => setFormVendedor(prev => ({ ...prev, email: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.email ? 'border-red-500' : tema.borda}`}
                        placeholder="email@exemplo.com"
                        disabled={salvando}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Telefone *
                      </label>
                      <input
                        type="text"
                        value={formVendedor.telefone}
                        onChange={(e) => setFormVendedor(prev => ({ 
                          ...prev, 
                          telefone: formatarTelefone(e.target.value)
                        }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.telefone ? 'border-red-500' : tema.borda}`}
                        placeholder="(00) 00000-0000"
                        disabled={salvando}
                      />
                      {formErrors.telefone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.telefone}</p>
                      )}
                    </div>

                    {/* Login */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Login *
                      </label>
                      <input
                        type="text"
                        value={formVendedor.login}
                        onChange={(e) => setFormVendedor(prev => ({ ...prev, login: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${formErrors.login ? 'border-red-500' : tema.borda}`}
                        placeholder="login_usuario"
                        disabled={salvando}
                      />
                      {formErrors.login && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.login}</p>
                      )}
                    </div>

                    {/* Senha */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Senha *
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarSenha ? 'text' : 'password'}
                          value={formVendedor.senha}
                          onChange={(e) => setFormVendedor(prev => ({ ...prev, senha: e.target.value }))}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 pr-10 ${tema.input} ${formErrors.senha ? 'border-red-500' : tema.borda}`}
                          placeholder="••••••••"
                          disabled={salvando}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className={`absolute inset-y-0 right-0 pr-3 flex items-center ${tema.textoSecundario} hover:${tema.texto}`}
                          disabled={salvando}
                        >
                          {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formErrors.senha && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.senha}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Status
                      </label>
                      <select
                        value={formVendedor.status}
                        onChange={(e) => setFormVendedor(prev => ({ ...prev, status: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${tema.input} ${tema.borda}`}
                        disabled={salvando}
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={fecharModal}
                      disabled={salvando}
                      className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover} disabled:opacity-50`}
                    >
                      <X className="mr-2 h-4 w-4 inline" />
                      Cancelar
                    </button>
                    <button
                      onClick={salvarVendedor}
                      disabled={salvando}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {modalExclusaoAberto && vendedorParaExcluir && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && fecharModalExclusao()}></div>
              
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
                          Tem certeza que deseja excluir o vendedor <strong>{vendedorParaExcluir.nome}</strong>? 
                          Esta ação não pode ser desfeita.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={confirmarExclusao}
                    disabled={salvando}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {salvando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Excluindo...
                      </>
                    ) : (
                      'Excluir'
                    )}
                  </button>
                  <button
                    onClick={fecharModalExclusao}
                    disabled={salvando}
                    className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50`}
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