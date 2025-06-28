// src/components/screens/TelaVendedores.tsx
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Users, Plus, Search, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';
import { Vendedor } from '../../types/Vendedor';
import { InputComErro } from '../common/InputComErro';
import { InputSenha } from '../common/InputSenha';

export const TelaVendedores: React.FC = memo(() => {
  const { 
    vendedores, 
    setVendedores, 
    mostrarMensagem, 
    tema, 
    cookies 
  } = useAppContext();
  
  const { formatarTelefone } = useFormatters();
  const { validarEmail, validarTelefone } = useValidation();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [vendedorParaExcluir, setVendedorParaExcluir] = useState<Vendedor | null>(null);
  const [salvando, setSalvando] = useState(false);
  
  // Carregar filtros salvos dos cookies
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusVendedores') || 'todos';
  });
  
  const [buscaTexto, setBuscaTexto] = useState('');

  // Salvar filtros nos cookies quando mudarem
  useEffect(() => {
    cookies.setCookie('filtroStatusVendedores', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  const [formVendedor, setFormVendedor] = useState({
    nome: '',
    email: '',
    telefone: '',
    login: '',
    senha: '',
    confirmarSenha: '',
    status: 'Ativo'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const vendedoresFiltrados = useMemo(() => {
    let resultado = vendedores;

    if (filtroStatus === 'ativo') {
      resultado = resultado.filter((v: Vendedor) => v.status === 'Ativo');
    } else if (filtroStatus === 'inativo') {
      resultado = resultado.filter((v: Vendedor) => v.status === 'Inativo');
    }

    if (buscaTexto) {
      resultado = resultado.filter((v: Vendedor) => 
        v.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        v.email.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        v.login.toLowerCase().includes(buscaTexto.toLowerCase())
      );
    }

    return resultado;
  }, [vendedores, filtroStatus, buscaTexto]);

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
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setVendedorEditando(null);
  }, []);

  const abrirModalExclusao = useCallback((vendedor: Vendedor) => {
    setVendedorParaExcluir(vendedor);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setVendedorParaExcluir(null);
  }, []);

  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formVendedor.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formVendedor.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formVendedor.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validarEmail(formVendedor.email)) {
      errors.email = 'Email inválido';
    } else {
      // Verificar se email já existe (exceto se estiver editando o mesmo vendedor)
      const vendedorExistente = vendedores.find((v: Vendedor) => 
        v.email === formVendedor.email && v.id !== vendedorEditando?.id
      );
      if (vendedorExistente) {
        errors.email = 'Email já cadastrado';
      }
    }

    if (!formVendedor.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formVendedor.telefone)) {
      errors.telefone = 'Telefone inválido. Use o formato (11) 99999-9999';
    }

    if (!formVendedor.login.trim()) {
      errors.login = 'Login é obrigatório';
    } else if (formVendedor.login.trim().length < 3) {
      errors.login = 'Login deve ter pelo menos 3 caracteres';
    } else {
      // Verificar se login já existe (exceto se estiver editando o mesmo vendedor)
      const vendedorExistente = vendedores.find((v: Vendedor) => 
        v.login === formVendedor.login && v.id !== vendedorEditando?.id
      );
      if (vendedorExistente) {
        errors.login = 'Login já existe';
      }
    }

    // Validar senha apenas se for novo vendedor ou se senha foi preenchida na edição
    if (!vendedorEditando || formVendedor.senha) {
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

  const salvarVendedor = useCallback(async () => {
    if (validarFormulario()) {
      setSalvando(true);
      try {
        if (vendedorEditando) {
          // Atualizar vendedor existente
          const vendedorAtualizado: Vendedor = {
            ...vendedorEditando,
            nome: formVendedor.nome,
            email: formVendedor.email,
            telefone: formVendedor.telefone,
            login: formVendedor.login,
            // Só atualizar senha se foi preenchida
            senha: formVendedor.senha || vendedorEditando.senha,
            status: formVendedor.status
          };
          
          setVendedores(prev => prev.map(v => v.id === vendedorEditando.id ? vendedorAtualizado : v));
          mostrarMensagem('success', 'Vendedor atualizado com sucesso!');
        } else {
          // Criar novo vendedor
          const novoId = Math.max(...vendedores.map((v: Vendedor) => v.id), 0) + 1;
          const novoVendedor: Vendedor = {
            id: novoId,
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
    }
  }, [formVendedor, vendedorEditando, vendedores, setVendedores, mostrarMensagem, validarFormulario, fecharModal]);

  // FUNÇÃO CORRIGIDA: Tipo explícito para o parâmetro vendedor
  const confirmarExclusao = useCallback(() => {
    if (vendedorParaExcluir) {
      setVendedores(prev => prev.filter(v => v.id !== vendedorParaExcluir.id));
      mostrarMensagem('success', `Vendedor "${vendedorParaExcluir.nome}" excluído com sucesso!`);
      fecharModalExclusao();
    }
  }, [vendedorParaExcluir, setVendedores, mostrarMensagem, fecharModalExclusao]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Vendedores</h2>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Vendedor
        </button>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou login..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            />
          </div>
          
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
            Mostrando {vendedoresFiltrados.length} de {vendedores.length} vendedores
          </div>
        </div>
      </div>

      {/* Tabela de Vendedores */}
      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                Nome
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
              <tr key={vendedor.id} className={tema.hover}>
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
                  <button
                    onClick={() => abrirModal(vendedor)}
                    className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded"
                    title="Editar vendedor"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => abrirModalExclusao(vendedor)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Excluir vendedor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {vendedoresFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className={`text-sm ${tema.textoSecundario}`}>
              Nenhum vendedor encontrado com os filtros aplicados.
            </p>
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
            ></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                  {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
                </h3>
                
                <div className="space-y-4">
                  <InputComErro
                    label="Nome Completo"
                    valor={formVendedor.nome}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, nome: valor }))}
                    erro={formErrors.nome}
                    obrigatorio
                    disabled={salvando}
                  />
                  
                  <InputComErro
                    label="Email"
                    valor={formVendedor.email}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, email: valor }))}
                    tipo="email"
                    erro={formErrors.email}
                    obrigatorio
                    disabled={salvando}
                  />
                  
                  <InputComErro
                    label="Telefone"
                    valor={formVendedor.telefone}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, telefone: formatarTelefone(valor) }))}
                    placeholder="(11) 99999-9999"
                    erro={formErrors.telefone}
                    obrigatorio
                    maxLength={15}
                    disabled={salvando}
                  />
                  
                  <InputComErro
                    label="Login"
                    valor={formVendedor.login}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, login: valor }))}
                    erro={formErrors.login}
                    obrigatorio
                    disabled={salvando}
                  />
                  
                  <InputSenha
                    label={vendedorEditando ? "Nova Senha (deixe em branco para não alterar)" : "Senha"}
                    valor={formVendedor.senha}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, senha: valor }))}
                    erro={formErrors.senha}
                    obrigatorio={!vendedorEditando}
                    disabled={salvando}
                  />
                  
                  <InputSenha
                    label="Confirmar Senha"
                    valor={formVendedor.confirmarSenha}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, confirmarSenha: valor }))}
                    erro={formErrors.confirmarSenha}
                    obrigatorio={!vendedorEditando || !!formVendedor.senha}
                    disabled={salvando}
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Status</label>
                    <select
                      value={formVendedor.status}
                      onChange={(e) => setFormVendedor(prev => ({ ...prev, status: e.target.value }))}
                      disabled={salvando}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${salvando ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Modal de Confirmação de Exclusão */}
      {modalExclusaoAberto && vendedorParaExcluir && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalExclusao}></div>
            
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Excluir
                </button>
                <button
                  onClick={fecharModalExclusao}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

TelaVendedores.displayName = 'TelaVendedores';