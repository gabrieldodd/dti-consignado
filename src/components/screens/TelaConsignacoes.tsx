// src/components/screens/TelaConsignacoes.tsx
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { ShoppingCart, Plus, Search, Eye, Trash2, QrCode } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';
import { useValidation } from '../../hooks/useValidation';
import { Consignacao } from '../../types/Consignacao';
import { Produto } from '../../types/Produto';
import { InputComErro } from '../common/InputComErro';

export const TelaConsignacoes: React.FC = memo(() => {
  const { 
    consignacoes, 
    setConsignacoes, 
    produtos, 
    vendedores, 
    mostrarMensagem, 
    tema, 
    usuarioLogado, 
    tipoUsuario, 
    cookies 
  } = useAppContext();
  
  const { formatarMoedaBR, formatarCPF, formatarCNPJ, formatarTelefone } = useFormatters();
  const { validarCPF, validarCNPJ } = useValidation();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRetornoAberto, setModalRetornoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [consignacaoRetorno, setConsignacaoRetorno] = useState<Consignacao | null>(null);
  const [consignacaoDetalhes, setConsignacaoDetalhes] = useState<Consignacao | null>(null);
  
  // Carregar filtros salvos dos cookies
  const [filtroStatus, setFiltroStatus] = useState(() => {
    return cookies.getCookie('filtroStatusConsignacoes') || 'todas';
  });
  const [buscaTexto, setBuscaTexto] = useState('');

  // Salvar filtros nos cookies quando mudarem
  useEffect(() => {
    cookies.setCookie('filtroStatusConsignacoes', filtroStatus, 30);
  }, [filtroStatus, cookies]);

  const [formConsignacao, setFormConsignacao] = useState({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf' as 'cpf' | 'cnpj',
    vendedorId: '',
    quantidadeTotal: '',
    valorTotal: '',
    observacoes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estados para retorno
  const [retornoForm, setRetornoForm] = useState({
    quantidadeRetornada: 0,
    valorRetornado: 0
  });
  const [codigoLeitura, setCodigoLeitura] = useState('');
  const [produtosLidos, setProdutosLidos] = useState<{produto: Produto, quantidade: number}[]>([]);

  const consignacoesFiltradas = useMemo(() => {
    let resultado = consignacoes;

    if (tipoUsuario === 'vendedor') {
      resultado = resultado.filter((c: Consignacao) => c.vendedorId === usuarioLogado.id);
    }

    if (filtroStatus !== 'todas') {
      resultado = resultado.filter((c: Consignacao) => c.status === filtroStatus);
    }

    if (buscaTexto) {
      resultado = resultado.filter((c: Consignacao) => 
        c.clienteNome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.clienteDocumento.includes(buscaTexto) ||
        c.vendedor.nome.toLowerCase().includes(buscaTexto.toLowerCase())
      );
    }

    return resultado;
  }, [consignacoes, tipoUsuario, usuarioLogado, filtroStatus, buscaTexto]);

  const abrirModal = useCallback(() => {
    setFormConsignacao({
      clienteNome: '',
      clienteDocumento: '',
      clienteTelefone: '',
      tipoDocumento: 'cpf',
      vendedorId: tipoUsuario === 'vendedor' ? usuarioLogado.id.toString() : '',
      quantidadeTotal: '',
      valorTotal: '',
      observacoes: ''
    });
    setFormErrors({});
    setModalAberto(true);
  }, [tipoUsuario, usuarioLogado]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
  }, []);

  const abrirModalRetorno = useCallback((consignacao: Consignacao) => {
    setConsignacaoRetorno(consignacao);
    setRetornoForm({
      quantidadeRetornada: 0,
      valorRetornado: 0
    });
    setProdutosLidos([]);
    setCodigoLeitura('');
    setModalRetornoAberto(true);
  }, []);

  const fecharModalRetorno = useCallback(() => {
    setModalRetornoAberto(false);
    setConsignacaoRetorno(null);
  }, []);

  const abrirModalDetalhes = useCallback((consignacao: Consignacao) => {
    setConsignacaoDetalhes(consignacao);
    setModalDetalhesAberto(true);
  }, []);

  const fecharModalDetalhes = useCallback(() => {
    setModalDetalhesAberto(false);
    setConsignacaoDetalhes(null);
  }, []);

  // FUNÇÃO CORRIGIDA: Tipo explícito para o parâmetro consignacao
  const excluirConsignacao = useCallback((consignacao: Consignacao) => {
    if (confirm(`Confirma a exclusão da consignação de "${consignacao.clienteNome}"?`)) {
      setConsignacoes(prev => prev.filter(c => c.id !== consignacao.id));
      mostrarMensagem('success', 'Consignação excluída com sucesso!');
    }
  }, [setConsignacoes, mostrarMensagem]);

  const formatarDocumento = useCallback((valor: string, tipo: 'cpf' | 'cnpj') => {
    return tipo === 'cpf' ? formatarCPF(valor) : formatarCNPJ(valor);
  }, [formatarCPF, formatarCNPJ]);

  const validarFormulario = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formConsignacao.clienteNome.trim()) {
      errors.clienteNome = 'Nome do cliente é obrigatório';
    }
    
    if (!formConsignacao.clienteDocumento.trim()) {
      errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} é obrigatório`;
    } else {
      const validador = formConsignacao.tipoDocumento === 'cpf' ? validarCPF : validarCNPJ;
      if (!validador(formConsignacao.clienteDocumento)) {
        errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} inválido`;
      }
    }

    if (!formConsignacao.clienteTelefone.trim()) {
      errors.clienteTelefone = 'Telefone é obrigatório';
    }

    if (!formConsignacao.vendedorId) {
      errors.vendedorId = 'Vendedor é obrigatório';
    }

    if (!formConsignacao.quantidadeTotal || parseInt(formConsignacao.quantidadeTotal) <= 0) {
      errors.quantidadeTotal = 'Quantidade deve ser maior que zero';
    }

    if (!formConsignacao.valorTotal || parseFloat(formConsignacao.valorTotal) <= 0) {
      errors.valorTotal = 'Valor deve ser maior que zero';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formConsignacao, validarCPF, validarCNPJ]);

  const salvarConsignacao = useCallback(() => {
    if (validarFormulario()) {
      try {
        const vendedor = vendedores.find(v => v.id === parseInt(formConsignacao.vendedorId));
        if (!vendedor) {
          mostrarMensagem('error', 'Vendedor não encontrado');
          return;
        }

        const novaConsignacao: Consignacao = {
          id: Math.max(...consignacoes.map(c => c.id), 0) + 1,
          clienteNome: formConsignacao.clienteNome,
          clienteDocumento: formConsignacao.clienteDocumento,
          clienteTelefone: formConsignacao.clienteTelefone,
          tipoDocumento: formConsignacao.tipoDocumento,
          vendedorId: parseInt(formConsignacao.vendedorId),
          vendedor: vendedor,
          quantidadeTotal: parseInt(formConsignacao.quantidadeTotal),
          valorTotal: parseFloat(formConsignacao.valorTotal),
          dataConsignacao: new Date().toISOString().split('T')[0],
          status: 'ativa',
          observacoes: formConsignacao.observacoes
        };

        setConsignacoes(prev => [...prev, novaConsignacao]);
        mostrarMensagem('success', 'Consignação criada com sucesso!');
        fecharModal();
      } catch (error) {
        mostrarMensagem('error', 'Erro ao salvar consignação');
      }
    }
  }, [formConsignacao, validarFormulario, vendedores, consignacoes, setConsignacoes, mostrarMensagem, fecharModal]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Consignações</h2>
        <button
          onClick={abrirModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Consignação
        </button>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar consignações..."
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
            <option value="todas">Todas as consignações</option>
            <option value="ativa">Apenas Ativas</option>
            <option value="finalizada">Apenas Finalizadas</option>
            <option value="cancelada">Apenas Canceladas</option>
          </select>
          
          <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
            {consignacoesFiltradas.length} de {consignacoes.length} consignações
          </div>
        </div>
      </div>

      {/* Lista de Consignações */}
      <div className="space-y-4">
        {consignacoesFiltradas.map((consignacao: Consignacao) => (
          <div key={consignacao.id} className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className={`text-lg font-semibold ${tema.texto}`}>
                    {consignacao.clienteNome}
                  </h3>
                  <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    consignacao.status === 'ativa' 
                      ? 'bg-green-100 text-green-800' 
                      : consignacao.status === 'finalizada'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {consignacao.status.charAt(0).toUpperCase() + consignacao.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Documento:</span>
                    <p className={tema.texto}>{consignacao.clienteDocumento}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Telefone:</span>
                    <p className={tema.texto}>{consignacao.clienteTelefone}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Vendedor:</span>
                    <p className={tema.texto}>{consignacao.vendedor.nome}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Quantidade:</span>
                    <p className={tema.texto}>{consignacao.quantidadeTotal} itens</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Valor Total:</span>
                    <p className={tema.texto}>{formatarMoedaBR(consignacao.valorTotal)}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Data:</span>
                    <p className={tema.texto}>{new Date(consignacao.dataConsignacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {consignacao.retorno && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Informações do Retorno</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Devolvidos:</span>
                        <p>{consignacao.retorno.quantidadeRetornada} itens</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Vendidos:</span>
                        <p>{consignacao.retorno.quantidadeVendida} itens</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Valor Devolvido:</span>
                        <p>{formatarMoedaBR(consignacao.retorno.valorRetornado)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Valor Devido:</span>
                        <p className={`font-medium ${consignacao.retorno.valorDevido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatarMoedaBR(consignacao.retorno.valorDevido)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {consignacao.observacoes && (
                  <div className="mt-2">
                    <span className={`font-medium ${tema.textoSecundario}`}>Observações:</span>
                    <p className={`text-sm ${tema.texto}`}>{consignacao.observacoes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                {consignacao.status === 'ativa' && (
                  <button
                    onClick={() => abrirModalRetorno(consignacao)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Conferir Retorno
                  </button>
                )}
                
                <button
                  onClick={() => abrirModalDetalhes(consignacao)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </button>

                {tipoUsuario === 'admin' && (
                  <button
                    onClick={() => excluirConsignacao(consignacao)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {consignacoesFiltradas.length === 0 && (
          <div className="text-center py-8">
            <p className={`text-sm ${tema.textoSecundario}`}>
              Nenhuma consignação encontrada com os filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Nova Consignação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>Nova Consignação</h3>
                
                <div className="space-y-4">
                  <InputComErro
                    label="Nome do Cliente"
                    valor={formConsignacao.clienteNome}
                    onChange={(valor) => setFormConsignacao(prev => ({ ...prev, clienteNome: valor }))}
                    erro={formErrors.clienteNome}
                    obrigatorio
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto} mb-2`}>
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="cpf"
                          checked={formConsignacao.tipoDocumento === 'cpf'}
                          onChange={() => {
                            setFormConsignacao(prev => ({ 
                              ...prev, 
                              tipoDocumento: 'cpf',
                              clienteDocumento: ''
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className={tema.texto}>CPF</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="cnpj"
                          checked={formConsignacao.tipoDocumento === 'cnpj'}
                          onChange={() => {
                            setFormConsignacao(prev => ({ 
                              ...prev, 
                              tipoDocumento: 'cnpj',
                              clienteDocumento: ''
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className={tema.texto}>CNPJ</span>
                      </label>
                    </div>
                  </div>
                  
                  <InputComErro
                    label={formConsignacao.tipoDocumento.toUpperCase()}
                    valor={formConsignacao.clienteDocumento}
                    onChange={(valor) => setFormConsignacao(prev => ({ 
                      ...prev, 
                      clienteDocumento: formatarDocumento(valor, formConsignacao.tipoDocumento) 
                    }))}
                    placeholder={formConsignacao.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    erro={formErrors.clienteDocumento}
                    obrigatorio
                    maxLength={formConsignacao.tipoDocumento === 'cpf' ? 14 : 18}
                  />
                  
                  <InputComErro
                    label="Telefone"
                    valor={formConsignacao.clienteTelefone}
                    onChange={(valor) => setFormConsignacao(prev => ({ ...prev, clienteTelefone: formatarTelefone(valor) }))}
                    placeholder="(11) 99999-9999"
                    erro={formErrors.clienteTelefone}
                    obrigatorio
                    maxLength={15}
                  />
                  
                  {tipoUsuario === 'admin' && (
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Vendedor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formConsignacao.vendedorId}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, vendedorId: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.vendedorId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Selecione um vendedor</option>
                        {vendedores.filter(v => v.status === 'Ativo').map(vendedor => (
                          <option key={vendedor.id} value={vendedor.id}>{vendedor.nome}</option>
                        ))}
                      </select>
                      {formErrors.vendedorId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.vendedorId}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InputComErro
                      label="Quantidade Total"
                      valor={formConsignacao.quantidadeTotal}
                      onChange={(valor) => setFormConsignacao(prev => ({ ...prev, quantidadeTotal: valor }))}
                      tipo="number"
                      erro={formErrors.quantidadeTotal}
                      obrigatorio
                    />
                    
                    <InputComErro
                      label="Valor Total"
                      valor={formConsignacao.valorTotal}
                      onChange={(valor) => setFormConsignacao(prev => ({ ...prev, valorTotal: valor }))}
                      tipo="number"
                      placeholder="0.00"
                      erro={formErrors.valorTotal}
                      obrigatorio
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Observações</label>
                    <textarea
                      value={formConsignacao.observacoes}
                      onChange={(e) => setFormConsignacao(prev => ({ ...prev, observacoes: e.target.value }))}
                      rows={3}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                      placeholder="Observações adicionais..."
                    />
                  </div>
                </div>
              </div>
              
              <div className={`${tema.papel} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  onClick={salvarConsignacao}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Salvar
                </button>
                <button
                  onClick={fecharModal}
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

TelaConsignacoes.displayName = 'TelaConsignacoes';