// src/components/screens/TelaConsignacoes.tsx - Versão Melhorada
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { 
  Plus, Search, Eye, CheckCircle, Trash2, X, FileText, Package, 
  Printer, Download, Users, DollarSign, Calendar, Filter
} from 'lucide-react';

interface ConsignacaoItem {
  id: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
}

interface FormData {
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  vendedorId: string;
  produtosSelecionados: ConsignacaoItem[];
  observacoes: string;
}

interface FormRetorno {
  quantidadeRetornada: number;
  quantidadeVendida: number;
  valorDevido: number;
  observacoes: string;
}

export const TelaConsignacoes: React.FC = () => {
  const {
    tema,
    consignacoes,
    vendedores,
    produtos,
    usuarioLogado,
    tipoUsuario,
    adicionarConsignacao,
    finalizarConsignacao,
    excluirConsignacao,
    mostrarMensagem,
    formatarMoeda,
    formatarData,
    formatarDocumento
  } = useAppContext();

  // Estados
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [modalImpressaoAberto, setModalImpressaoAberto] = useState(false);
  const [consignacaoSelecionada, setConsignacaoSelecionada] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  
  // Filtros e busca
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('data');

  // Formulários
  const [formData, setFormData] = useState<FormData>({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf',
    vendedorId: '',
    produtosSelecionados: [],
    observacoes: ''
  });

  const [formRetorno, setFormRetorno] = useState<FormRetorno>({
    quantidadeRetornada: 0,
    quantidadeVendida: 0,
    valorDevido: 0,
    observacoes: ''
  });

  const [erros, setErros] = useState<any>({});

  // Código de barras para adicionar produtos
  const [codigoProduto, setCodigoProduto] = useState('');
  
  // Estados para finalização com código de barras
  const [codigoRetorno, setCodigoRetorno] = useState('');
  const [produtosRetornados, setProdutosRetornados] = useState<any[]>([]);

  // Configurar vendedor se for do tipo vendedor
  useEffect(() => {
    if (tipoUsuario === 'vendedor' && usuarioLogado?.id) {
      setFormData(prev => ({
        ...prev,
        vendedorId: usuarioLogado.id.toString()
      }));
    }
  }, [tipoUsuario, usuarioLogado]);

  // Consignações filtradas e ordenadas
  const consignacoesFiltradas = useMemo(() => {
    if (!consignacoes || !Array.isArray(consignacoes)) {
      return [];
    }

    let filtradas = consignacoes.filter((consignacao: any) => {
      const buscaMatch = 
        (consignacao.cliente_nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (consignacao.cliente_documento || '').toLowerCase().includes(busca.toLowerCase());

      const statusMatch = filtroStatus === 'todas' || consignacao.status === filtroStatus;

      // Se for vendedor, mostrar apenas suas consignações
      const vendedorMatch = tipoUsuario !== 'vendedor' || 
        consignacao.vendedor_id === usuarioLogado?.id;

      return buscaMatch && statusMatch && vendedorMatch;
    });

    return [...filtradas].sort((a: any, b: any) => {
      switch (ordenacao) {
        case 'valor':
          return (parseFloat(b.valor_total) || 0) - (parseFloat(a.valor_total) || 0);
        case 'cliente':
          return (a.cliente_nome || '').localeCompare(b.cliente_nome || '');
        default:
          return new Date(b.data_consignacao || 0).getTime() - new Date(a.data_consignacao || 0).getTime();
      }
    });
  }, [consignacoes, busca, filtroStatus, ordenacao, tipoUsuario, usuarioLogado]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = consignacoesFiltradas.length;
    const ativas = consignacoesFiltradas.filter((c: any) => c.status === 'ativa').length;
    const finalizadas = consignacoesFiltradas.filter((c: any) => c.status === 'finalizada').length;
    const valorTotal = consignacoesFiltradas.reduce((sum: number, c: any) => 
      sum + (parseFloat(c.valor_total) || 0), 0
    );

    return { total, ativas, finalizadas, valorTotal };
  }, [consignacoesFiltradas]);

  // Ajustar quantidade de produto retornado manualmente
  const ajustarQuantidadeProdutoRetorno = useCallback((produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      // Se quantidade for 0 ou menor, remove o produto
      setProdutosRetornados(prev => prev.filter(pr => pr.id !== produtoId));
    } else {
      // Verificar se a nova quantidade total não excede o total da consignação
      const outrosProdutos = produtosRetornados.filter(pr => pr.id !== produtoId);
      const quantidadeOutros = outrosProdutos.reduce((sum, pr) => sum + pr.quantidade, 0);
      const novaQuantidadeTotal = quantidadeOutros + novaQuantidade;
      
      if (novaQuantidadeTotal > consignacaoSelecionada.quantidade_total) {
        mostrarMensagem('error', 'Quantidade retornada não pode exceder o total da consignação');
        return;
      }

      // Atualiza a quantidade
      setProdutosRetornados(prev => prev.map(pr =>
        pr.id === produtoId
          ? { ...pr, quantidade: novaQuantidade }
          : pr
      ));
    }

    // Recalcular totais
    const produtosAtualizados = produtosRetornados.map(pr =>
      pr.id === produtoId
        ? { ...pr, quantidade: novaQuantidade }
        : pr
    ).filter(pr => pr.quantidade > 0);

    const novaQuantidadeTotal = produtosAtualizados.reduce((sum, pr) => sum + pr.quantidade, 0);
    const novoValorRetornado = produtosAtualizados.reduce((sum, pr) => sum + (pr.quantidade * pr.valor_venda), 0);
    const quantidadeVendida = Math.max(0, consignacaoSelecionada.quantidade_total - novaQuantidadeTotal);
    const valorDevido = Math.max(0, parseFloat(consignacaoSelecionada.valor_total) - novoValorRetornado);

    setFormRetorno({
      ...formRetorno,
      quantidadeRetornada: novaQuantidadeTotal,
      quantidadeVendida: quantidadeVendida,
      valorDevido: valorDevido
    });
  }, [produtosRetornados, consignacaoSelecionada, formRetorno, mostrarMensagem]);

  // Adicionar produto de retorno por código de barras
  const adicionarProdutoRetorno = useCallback(() => {
    if (!codigoRetorno.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    const produto = produtos?.find((p: any) => 
      (p.codigo_barras === codigoRetorno.trim() || p.codigoBarras === codigoRetorno.trim()) && p.ativo !== false
    );

    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado');
      setCodigoRetorno('');
      return;
    }

    const produtoExistente = produtosRetornados.find(pr => pr.id === produto.id);

    if (produtoExistente) {
      // Se produto já existe, incrementa quantidade usando a função de ajuste
      ajustarQuantidadeProdutoRetorno(produto.id, produtoExistente.quantidade + 1);
    } else {
      // Se é novo produto, adiciona à lista
      const novoProdutoRetorno = {
        id: produto.id,
        nome: produto.nome,
        valor_venda: produto.valor_venda || produto.valorVenda || 0,
        quantidade: 1
      };

      setProdutosRetornados(prev => [...prev, novoProdutoRetorno]);

      // Calcular totais com o novo produto
      const novaQuantidade = produtosRetornados.reduce((sum, pr) => sum + pr.quantidade, 0) + 1;
      const novoValorRetornado = produtosRetornados.reduce((sum, pr) => sum + (pr.quantidade * pr.valor_venda), 0) + (produto.valor_venda || produto.valorVenda || 0);
      const quantidadeVendida = Math.max(0, consignacaoSelecionada.quantidade_total - novaQuantidade);
      const valorDevido = Math.max(0, parseFloat(consignacaoSelecionada.valor_total) - novoValorRetornado);

      setFormRetorno({
        ...formRetorno,
        quantidadeRetornada: novaQuantidade,
        quantidadeVendida: quantidadeVendida,
        valorDevido: valorDevido
      });
    }

    setCodigoRetorno('');
    mostrarMensagem('success', `${produto.nome} adicionado ao retorno!`);
  }, [codigoRetorno, produtos, produtosRetornados, consignacaoSelecionada, formRetorno, mostrarMensagem, ajustarQuantidadeProdutoRetorno]);

  // Remover produto do retorno (remove completamente)
  const removerProdutoRetorno = useCallback((produtoId: number) => {
    const produto = produtosRetornados.find(pr => pr.id === produtoId);
    if (!produto) return;

    // Remove completamente o produto da lista
    setProdutosRetornados(prev => prev.filter(pr => pr.id !== produtoId));

    // Recalcular totais sem esse produto
    const produtosAtualizados = produtosRetornados.filter(pr => pr.id !== produtoId);

    const novaQuantidade = produtosAtualizados.reduce((sum, pr) => sum + pr.quantidade, 0);
    const novoValorRetornado = produtosAtualizados.reduce((sum, pr) => sum + (pr.quantidade * pr.valor_venda), 0);
    const quantidadeVendida = Math.max(0, consignacaoSelecionada.quantidade_total - novaQuantidade);
    const valorDevido = Math.max(0, parseFloat(consignacaoSelecionada.valor_total) - novoValorRetornado);

    setFormRetorno({
      ...formRetorno,
      quantidadeRetornada: novaQuantidade,
      quantidadeVendida: quantidadeVendida,
      valorDevido: valorDevido
    });

    mostrarMensagem('success', `${produto.nome} removido completamente do retorno!`);
  }, [produtosRetornados, consignacaoSelecionada, formRetorno, mostrarMensagem]);
  const adicionarProdutoPorCodigo = useCallback(() => {
    if (!codigoProduto.trim()) return;

    const produto = produtos?.find((p: any) => 
      p.codigo_barras === codigoProduto.trim() || 
      p.nome.toLowerCase().includes(codigoProduto.toLowerCase())
    );

    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado');
      return;
    }

    const produtoExistente = formData.produtosSelecionados.find(p => p.produto === produto.nome);

    if (produtoExistente) {
      setFormData(prev => ({
        ...prev,
        produtosSelecionados: prev.produtosSelecionados.map(p =>
          p.produto === produto.nome
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      }));
    } else {
      const novoProduto: ConsignacaoItem = {
        id: `${produto.id}_${Date.now()}`,
        produto: produto.nome,
        quantidade: 1,
        valorUnitario: produto.valor_venda || 0
      };

      setFormData(prev => ({
        ...prev,
        produtosSelecionados: [...prev.produtosSelecionados, novoProduto]
      }));
    }

    setCodigoProduto('');
    mostrarMensagem('success', `${produto.nome} adicionado!`);
  }, [codigoProduto, produtos, formData.produtosSelecionados, mostrarMensagem]);

  // Remover produto
  const removerProduto = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      produtosSelecionados: prev.produtosSelecionados.filter(p => p.id !== id)
    }));
  }, []);

  // Atualizar quantidade/valor do produto
  const atualizarProduto = useCallback((id: string, campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      produtosSelecionados: prev.produtosSelecionados.map(p =>
        p.id === id ? { ...p, [campo]: valor } : p
      )
    }));
  }, []);

  // Calcular totais
  const calcularTotais = useCallback(() => {
    const quantidade = formData.produtosSelecionados.reduce((sum, p) => 
      sum + (parseInt(p.quantidade.toString()) || 0), 0
    );
    const valor = formData.produtosSelecionados.reduce((sum, p) => 
      sum + ((parseInt(p.quantidade.toString()) || 0) * (parseFloat(p.valorUnitario.toString()) || 0)), 0
    );

    return { quantidade, valor };
  }, [formData.produtosSelecionados]);

  // Validar formulário
  const validarFormulario = useCallback(() => {
    const novosErros: any = {};

    if (!formData.clienteNome.trim()) {
      novosErros.clienteNome = 'Nome do cliente é obrigatório';
    }

    if (!formData.clienteDocumento.trim()) {
      novosErros.clienteDocumento = 'Documento é obrigatório';
    }

    if (!formData.vendedorId) {
      novosErros.vendedorId = 'Vendedor é obrigatório';
    }

    if (formData.produtosSelecionados.length === 0) {
      novosErros.produtos = 'Adicione pelo menos um produto';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }, [formData]);

  // Salvar consignação
  const handleSalvar = async () => {
    if (!validarFormulario()) {
      mostrarMensagem('error', 'Preencha todos os campos obrigatórios');
      return;
    }

    setCarregando(true);
    const totais = calcularTotais();

    try {
      const dadosConsignacao = {
        clienteNome: formData.clienteNome,
        clienteDocumento: formData.clienteDocumento.replace(/\D/g, ''),
        clienteTelefone: formData.clienteTelefone,
        tipoDocumento: formData.tipoDocumento,
        vendedorId: parseInt(formData.vendedorId),
        quantidadeTotal: totais.quantidade,
        valorTotal: totais.valor,
        observacoes: formData.observacoes
      };

      console.log('📤 Enviando consignação:', dadosConsignacao);

      const resultado = await adicionarConsignacao(dadosConsignacao);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação criada com sucesso!');
        setModalAberto(false);
        resetarFormulario();
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao criar consignação');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      mostrarMensagem('error', 'Erro ao salvar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // Finalizar consignação
  const handleFinalizar = async () => {
    if (!consignacaoSelecionada) return;

    if (produtosRetornados.length === 0) {
      mostrarMensagem('error', 'Escaneie pelo menos um produto retornado');
      return;
    }

    setCarregando(true);

    try {
      const valorRetornado = produtosRetornados.reduce((sum, pr) => sum + (pr.quantidade * pr.valor_venda), 0);
      
      const dadosRetorno = {
        quantidadeRetornada: formRetorno.quantidadeRetornada,
        quantidadeVendida: formRetorno.quantidadeVendida,
        valorRetornado: valorRetornado,
        valorDevido: formRetorno.valorDevido,
        observacoes: formRetorno.observacoes,
        produtosRetornados: produtosRetornados // Incluir lista de produtos para referência
      };

      const resultado = await finalizarConsignacao(consignacaoSelecionada.id, dadosRetorno);

      if (resultado.success) {
        mostrarMensagem('success', 'Consignação finalizada com sucesso!');
        setModalFinalizarAberto(false);
        setConsignacaoSelecionada(null);
        resetarFormRetorno();
        
        // Perguntar se quer imprimir o cupom
        if (window.confirm('Deseja imprimir o cupom de finalização?')) {
          imprimirCupom(consignacaoSelecionada, dadosRetorno);
        }
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao finalizar');
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar:', error);
      mostrarMensagem('error', 'Erro ao finalizar consignação');
    } finally {
      setCarregando(false);
    }
  };

  // Excluir consignação
  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta consignação?')) return;

    try {
      const resultado = await excluirConsignacao(id);
      if (resultado.success) {
        mostrarMensagem('success', 'Consignação excluída com sucesso!');
      } else {
        mostrarMensagem('error', resultado.error || 'Erro ao excluir');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      mostrarMensagem('error', 'Erro ao excluir consignação');
    }
  };

  // Resetar formulários
  const resetarFormulario = () => {
    setFormData({
      clienteNome: '',
      clienteDocumento: '',
      clienteTelefone: '',
      tipoDocumento: 'cpf',
      vendedorId: tipoUsuario === 'vendedor' && usuarioLogado ? usuarioLogado.id.toString() : '',
      produtosSelecionados: [],
      observacoes: ''
    });
    setErros({});
  };

  const resetarFormRetorno = () => {
    setFormRetorno({
      quantidadeRetornada: 0,
      quantidadeVendida: 0,
      valorDevido: 0,
      observacoes: ''
    });
    setProdutosRetornados([]);
    setCodigoRetorno('');
  };

  // Obter nome do vendedor
  const getNomeVendedor = (vendedorId: number) => {
    if (!vendedores || !Array.isArray(vendedores)) return 'N/A';
    const vendedor = vendedores.find((v: any) => v.id === vendedorId);
    return vendedor?.nome || 'N/A';
  };

  // 🖨️ FUNÇÃO DE IMPRESSÃO DE CUPOM - MELHORADA
  const imprimirCupom = (consignacao: any, dadosRetorno: any) => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    
    const valorVendido = parseFloat(consignacao.valor_total) - (dadosRetorno.valorRetornado || 0);
    
    let listaProdutosRetornados = '';
    if (dadosRetorno.produtosRetornados && dadosRetorno.produtosRetornados.length > 0) {
      listaProdutosRetornados = `
        <div class="linha"></div>
        <div>
          <div class="negrito">PRODUTOS RETORNADOS</div>
          ${dadosRetorno.produtosRetornados.map((pr: any) => `
            <div class="item">
              <span>${pr.nome.substring(0, 15)}${pr.nome.length > 15 ? '...' : ''}</span>
              <span>${pr.quantidade}x</span>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    const cupomHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cupom de Finalização</title>
        <style>
          @page {
            size: 48mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 8pt;
            line-height: 1.2;
            width: 48mm;
            padding: 2mm;
            background: white;
          }
          .centro {
            text-align: center;
          }
          .negrito {
            font-weight: bold;
          }
          .linha {
            border-top: 1px dashed #000;
            margin: 2mm 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
          }
          .cabecalho {
            margin-bottom: 3mm;
          }
          .rodape {
            margin-top: 3mm;
            font-size: 7pt;
          }
        </style>
      </head>
      <body>
        <div class="cabecalho centro">
          <div class="negrito">SISTEMA CONSIGNAÇÃO</div>
          <div>Cupom de Finalização</div>
          <div>Nº: ${consignacao.id}</div>
        </div>
        
        <div class="linha"></div>
        
        <div>
          <div class="negrito">DADOS DO CLIENTE</div>
          <div>Nome: ${consignacao.cliente_nome}</div>
          <div>Doc: ${formatarDocumento ? formatarDocumento(consignacao.cliente_documento, consignacao.tipo_documento) : consignacao.cliente_documento}</div>
          <div>Tel: ${consignacao.cliente_telefone}</div>
        </div>
        
        <div class="linha"></div>
        
        <div>
          <div class="negrito">VENDEDOR</div>
          <div>${getNomeVendedor(consignacao.vendedor_id)}</div>
        </div>
        
        <div class="linha"></div>
        
        <div>
          <div class="negrito">RESUMO DA CONSIGNAÇÃO</div>
          <div class="item">
            <span>Data Inicial:</span>
            <span>${formatarData ? formatarData(consignacao.data_consignacao) : consignacao.data_consignacao}</span>
          </div>
          <div class="item">
            <span>Qtd Total:</span>
            <span>${consignacao.quantidade_total} itens</span>
          </div>
          <div class="item">
            <span>Valor Total:</span>
            <span>${formatarMoeda ? formatarMoeda(parseFloat(consignacao.valor_total)) : `R$ ${parseFloat(consignacao.valor_total).toFixed(2)}`}</span>
          </div>
        </div>
        
        ${listaProdutosRetornados}
        
        <div class="linha"></div>
        
        <div>
          <div class="negrito">RESULTADO FINAL</div>
          <div class="item">
            <span>Qtd Retornada:</span>
            <span>${dadosRetorno.quantidadeRetornada} itens</span>
          </div>
          <div class="item">
            <span>Qtd Vendida:</span>
            <span>${dadosRetorno.quantidadeVendida} itens</span>
          </div>
          <div class="item">
            <span>Valor Vendido:</span>
            <span>${formatarMoeda ? formatarMoeda(valorVendido) : `R$ ${valorVendido.toFixed(2)}`}</span>
          </div>
          <div class="item negrito">
            <span>VALOR DEVIDO:</span>
            <span>${formatarMoeda ? formatarMoeda(dadosRetorno.valorDevido) : `R$ ${dadosRetorno.valorDevido.toFixed(2)}`}</span>
          </div>
        </div>
        
        ${dadosRetorno.observacoes ? `
        <div class="linha"></div>
        <div>
          <div class="negrito">OBSERVAÇÕES</div>
          <div>${dadosRetorno.observacoes}</div>
        </div>
        ` : ''}
        
        <div class="linha"></div>
        
        <div class="rodape centro">
          <div>Finalizado em: ${dataAtual}</div>
          <div>Às: ${horaAtual}</div>
          <div>-</div>
          <div>Sistema Consignação v1.0</div>
        </div>
      </body>
      </html>
    `;

    // Abrir janela de impressão
    const janelaImpressao = window.open('', '_blank');
    if (janelaImpressao) {
      janelaImpressao.document.write(cupomHTML);
      janelaImpressao.document.close();
      janelaImpressao.focus();
      
      // Aguardar carregamento e imprimir
      setTimeout(() => {
        janelaImpressao.print();
        janelaImpressao.close();
      }, 250);
    }
  };

  return (
    <div className={`flex-1 p-6 ${tema.background}`}>
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${tema.text} mb-2`}>Consignações</h1>
        <p className={tema.textSecondary}>Gerencie todas as consignações</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Total</p>
              <p className={`text-2xl font-bold ${tema.text}`}>{estatisticas.total}</p>
            </div>
            <FileText className={`w-8 h-8 ${tema.textSecondary}`} />
          </div>
        </div>

        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Ativas</p>
              <p className={`text-2xl font-bold text-blue-600`}>{estatisticas.ativas}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Finalizadas</p>
              <p className={`text-2xl font-bold text-green-600`}>{estatisticas.finalizadas}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`${tema.surface} p-4 rounded-lg border ${tema.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${tema.textSecondary}`}>Valor Total</p>
              <p className={`text-2xl font-bold ${tema.text}`}>
                {formatarMoeda ? formatarMoeda(estatisticas.valorTotal) : `R$ ${estatisticas.valorTotal.toFixed(2)}`}
              </p>
            </div>
            <DollarSign className={`w-8 h-8 ${tema.textSecondary}`} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${tema.surface} p-4 rounded-lg border ${tema.border} mb-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou documento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={`pl-10 w-full px-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
          >
            <option value="todas">Todas</option>
            <option value="ativa">Ativas</option>
            <option value="finalizada">Finalizadas</option>
          </select>

          {/* Ordenação */}
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className={`px-4 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
          >
            <option value="data">Ordenar por Data</option>
            <option value="valor">Ordenar por Valor</option>
            <option value="cliente">Ordenar por Cliente</option>
          </select>

          {/* Botão Nova Consignação */}
          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Consignação
          </button>
        </div>
      </div>

      {/* Lista de Consignações */}
      <div className={`${tema.surface} rounded-lg border ${tema.border} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${tema.surface} border-b ${tema.border}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Cliente
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Vendedor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Data
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Valor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium ${tema.textSecondary} uppercase tracking-wider`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className={`${tema.surface} divide-y ${tema.border}`}>
              {consignacoesFiltradas.map((consignacao: any) => (
                <tr key={consignacao.id} className={`hover:${tema.hover}`}>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    <div>
                      <div className="font-medium">{consignacao.cliente_nome}</div>
                      <div className={`text-sm ${tema.textSecondary}`}>
                        {formatarDocumento ? 
                          formatarDocumento(consignacao.cliente_documento, consignacao.tipo_documento) : 
                          consignacao.cliente_documento
                        }
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    {getNomeVendedor(consignacao.vendedor_id)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text}`}>
                    {formatarData ? formatarData(consignacao.data_consignacao) : consignacao.data_consignacao}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${tema.text} font-medium`}>
                    {formatarMoeda ? 
                      formatarMoeda(parseFloat(consignacao.valor_total) || 0) : 
                      `R$ ${(parseFloat(consignacao.valor_total) || 0).toFixed(2)}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${consignacao.status === 'ativa' ? 'bg-blue-100 text-blue-800' : ''}
                      ${consignacao.status === 'finalizada' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {consignacao.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Botão Ver Detalhes */}
                      <button
                        onClick={() => {
                          setConsignacaoSelecionada(consignacao);
                          // Implementar modal de detalhes se necessário
                        }}
                        className={`p-2 rounded ${tema.hover} ${tema.textSecondary} hover:${tema.text}`}
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {/* Botão Finalizar - MELHORADO */}
                      {consignacao.status === 'ativa' && (
                        <button
                          onClick={() => {
                            setConsignacaoSelecionada(consignacao);
                            setModalFinalizarAberto(true);
                          }}
                          className="p-2 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          title="Finalizar Consignação"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      
                      {/* Botão Imprimir - NOVO */}
                      {consignacao.status === 'finalizada' && consignacao.retorno && (
                        <button
                          onClick={() => imprimirCupom(consignacao, consignacao.retorno)}
                          className="p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          title="Imprimir Cupom"
                        >
                          <Printer size={18} />
                        </button>
                      )}
                      
                      {/* Botão Excluir */}
                      {tipoUsuario === 'admin' && (
                        <button
                          onClick={() => handleExcluir(consignacao.id)}
                          className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mensagem se não houver consignações */}
          {consignacoesFiltradas.length === 0 && (
            <div className="text-center py-8">
              <Package className={`w-12 h-12 mx-auto mb-4 ${tema.textSecondary}`} />
              <p className={`text-lg ${tema.text} mb-2`}>Nenhuma consignação encontrada</p>
              <p className={tema.textSecondary}>
                {busca || filtroStatus !== 'todas' 
                  ? 'Tente ajustar os filtros' 
                  : 'Clique em "Nova Consignação" para começar'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVA CONSIGNAÇÃO - Simplificado para teste */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${tema.surface} rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${tema.text}`}>Nova Consignação</h2>
              <button
                onClick={() => {
                  setModalAberto(false);
                  resetarFormulario();
                }}
                className={`p-1 rounded ${tema.hover} ${tema.text}`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className={`font-medium ${tema.text}`}>Dados do Cliente</h3>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.clienteNome}
                    onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    placeholder="Nome completo"
                  />
                  {erros.clienteNome && (
                    <p className="text-red-500 text-sm mt-1">{erros.clienteNome}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      Tipo de Documento
                    </label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as 'cpf' | 'cnpj' })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                      {formData.tipoDocumento.toUpperCase()} *
                    </label>
                    <input
                      type="text"
                      value={formData.clienteDocumento}
                      onChange={(e) => setFormData({ ...formData, clienteDocumento: e.target.value })}
                      className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                      placeholder={formData.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    />
                    {erros.clienteDocumento && (
                      <p className="text-red-500 text-sm mt-1">{erros.clienteDocumento}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.clienteTelefone}
                    onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                    Vendedor Responsável *
                  </label>
                  <select
                    value={formData.vendedorId}
                    onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value })}
                    disabled={tipoUsuario === 'vendedor'}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                  >
                    <option value="">Selecione um vendedor</option>
                    {vendedores?.map((vendedor: any) => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nome}
                      </option>
                    ))}
                  </select>
                  {erros.vendedorId && (
                    <p className="text-red-500 text-sm mt-1">{erros.vendedorId}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              {/* Produtos da Consignação */}
              <div className="space-y-4">
                <h3 className={`font-medium ${tema.text}`}>Produtos da Consignação</h3>
                
                {/* Adicionar Produto */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codigoProduto}
                    onChange={(e) => setCodigoProduto(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarProdutoPorCodigo()}
                    className={`flex-1 px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    placeholder="Digite ou escaneie o código de barras"
                  />
                  <button
                    type="button"
                    onClick={adicionarProdutoPorCodigo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>

                {erros.produtos && (
                  <p className="text-red-500 text-sm">{erros.produtos}</p>
                )}

                {/* Lista de Produtos */}
                <div className="space-y-2">
                  {formData.produtosSelecionados.map((item) => (
                    <div key={item.id} className={`p-3 border ${tema.border} rounded-md ${tema.surface}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className={`font-medium ${tema.text}`}>{item.produto}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${tema.textSecondary}`}>Qtd:</span>
                              <button
                                type="button"
                                onClick={() => atualizarProduto(item.id, 'quantidade', Math.max(1, item.quantidade - 1))}
                                className="w-6 h-6 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className={`w-8 text-center ${tema.text}`}>{item.quantidade}</span>
                              <button
                                type="button"
                                onClick={() => atualizarProduto(item.id, 'quantidade', item.quantidade + 1)}
                                className="w-6 h-6 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                            <div className={`text-sm ${tema.textSecondary}`}>
                              Valor: {formatarMoeda ? formatarMoeda(item.valorUnitario) : `R$ ${item.valorUnitario.toFixed(2)}`}
                            </div>
                            <div className={`font-medium ${tema.text}`}>
                              Total: {formatarMoeda ? formatarMoeda(item.quantidade * item.valorUnitario) : `R$ ${(item.quantidade * item.valorUnitario).toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerProduto(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total da Consignação */}
                {formData.produtosSelecionados.length > 0 && (
                  <div className={`p-4 ${tema.surface} border ${tema.border} rounded-md bg-blue-50`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${tema.text}`}>Total da Consignação:</span>
                      <div className="text-right">
                        <div className={`text-sm ${tema.textSecondary}`}>
                          {calcularTotais().quantidade} itens
                        </div>
                        <div className={`text-xl font-bold ${tema.text}`}>
                          {formatarMoeda ? formatarMoeda(calcularTotais().valor) : `R$ ${calcularTotais().valor.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setModalAberto(false);
                  resetarFormulario();
                }}
                className={`px-4 py-2 border ${tema.border} rounded-md ${tema.text} hover:${tema.hover}`}
                disabled={carregando}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={carregando}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? 'Salvando...' : 'Criar Consignação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FINALIZAR CONSIGNAÇÃO - MELHORADO COM LEITOR */}
      {modalFinalizarAberto && consignacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${tema.surface} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${tema.text}`}>Finalizar Consignação</h2>
              <button
                onClick={() => {
                  setModalFinalizarAberto(false);
                  setConsignacaoSelecionada(null);
                  resetarFormRetorno();
                }}
                className={`p-1 rounded ${tema.hover} ${tema.text}`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Resumo da Consignação */}
              <div className={`p-3 ${tema.surface} border ${tema.border} rounded-md bg-blue-50`}>
                <h3 className={`font-medium ${tema.text} mb-2`}>Dados da Consignação</h3>
                <div className={`text-sm ${tema.textSecondary} space-y-1`}>
                  <p><strong>Cliente:</strong> {consignacaoSelecionada.cliente_nome}</p>
                  <p><strong>Total Original:</strong> {consignacaoSelecionada.quantidade_total} itens - {formatarMoeda ? formatarMoeda(parseFloat(consignacaoSelecionada.valor_total)) : `R$ ${parseFloat(consignacaoSelecionada.valor_total).toFixed(2)}`}</p>
                </div>
              </div>

              {/* Leitor de Código de Barras para Retorno */}
              <div className="space-y-3">
                <h3 className={`font-medium ${tema.text}`}>📦 Produtos Retornados</h3>
                
                {/* Campo de leitura */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codigoRetorno}
                    onChange={(e) => setCodigoRetorno(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarProdutoRetorno()}
                    className={`flex-1 px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                    placeholder="Digite ou escaneie o código de barras dos produtos que retornaram"
                  />
                  <button
                    type="button"
                    onClick={adicionarProdutoRetorno}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
                
                <p className={`text-xs ${tema.textSecondary}`}>
                  Pressione Enter após digitar o código ou use um leitor de código de barras
                </p>

                {/* Lista de produtos retornados */}
                {produtosRetornados.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`text-sm font-medium ${tema.text}`}>Produtos Escaneados:</h4>
                    {produtosRetornados.map((produto) => (
                      <div key={produto.id} className={`p-3 border ${tema.border} rounded-md ${tema.surface} flex items-center justify-between`}>
                        <div className="flex-1">
                          <div className={`font-medium ${tema.text}`}>{produto.nome}</div>
                          <div className="flex items-center gap-4 mt-2">
                            {/* Controles de Quantidade com botões + e - */}
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${tema.textSecondary}`}>Qtd:</span>
                              <button
                                type="button"
                                onClick={() => ajustarQuantidadeProdutoRetorno(produto.id, produto.quantidade - 1)}
                                disabled={produto.quantidade <= 1}
                                className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-colors ${
                                  produto.quantidade <= 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                title={produto.quantidade <= 1 ? "Use o botão X para remover" : "Diminuir quantidade"}
                              >
                                -
                              </button>
                              <span className={`w-8 text-center font-medium ${tema.text}`}>{produto.quantidade}</span>
                              <button
                                type="button"
                                onClick={() => ajustarQuantidadeProdutoRetorno(produto.id, produto.quantidade + 1)}
                                disabled={formRetorno.quantidadeRetornada >= consignacaoSelecionada.quantidade_total}
                                className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-colors ${
                                  formRetorno.quantidadeRetornada >= consignacaoSelecionada.quantidade_total
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                title={formRetorno.quantidadeRetornada >= consignacaoSelecionada.quantidade_total ? "Quantidade máxima atingida" : "Aumentar quantidade"}
                              >
                                +
                              </button>
                            </div>
                            <div className={`text-sm ${tema.textSecondary}`}>
                              Valor: {formatarMoeda ? formatarMoeda(produto.valor_venda) : `R$ ${produto.valor_venda.toFixed(2)}`}
                            </div>
                            <div className={`text-sm font-medium ${tema.text}`}>
                              Total: {formatarMoeda ? formatarMoeda(produto.quantidade * produto.valor_venda) : `R$ ${(produto.quantidade * produto.valor_venda).toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            type="button"
                            onClick={() => removerProdutoRetorno(produto.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            title="Remover produto completamente"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumo dos Cálculos */}
              <div className={`p-4 ${tema.surface} border ${tema.border} rounded-md bg-green-50`}>
                <h3 className={`font-medium ${tema.text} mb-3`}>📊 Resumo Final</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={tema.textSecondary}>Qtd Retornada:</span>
                    <div className={`text-lg font-bold ${tema.text}`}>{formRetorno.quantidadeRetornada} itens</div>
                  </div>
                  <div>
                    <span className={tema.textSecondary}>Qtd Vendida:</span>
                    <div className={`text-lg font-bold text-blue-600`}>{formRetorno.quantidadeVendida} itens</div>
                  </div>
                  <div>
                    <span className={tema.textSecondary}>Valor Retornado:</span>
                    <div className={`text-lg font-bold ${tema.text}`}>
                      {formatarMoeda ? formatarMoeda(parseFloat(consignacaoSelecionada.valor_total) - formRetorno.valorDevido) : `R$ ${(parseFloat(consignacaoSelecionada.valor_total) - formRetorno.valorDevido).toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <span className={tema.textSecondary}>VALOR DEVIDO:</span>
                    <div className={`text-xl font-bold text-green-600`}>
                      {formatarMoeda ? formatarMoeda(formRetorno.valorDevido) : `R$ ${formRetorno.valorDevido.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className={`block text-sm font-medium ${tema.text} mb-1`}>
                  Observações do Retorno
                </label>
                <textarea
                  value={formRetorno.observacoes}
                  onChange={(e) => setFormRetorno({ ...formRetorno, observacoes: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border ${tema.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${tema.surface} ${tema.text}`}
                  placeholder="Observações sobre o retorno..."
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setModalFinalizarAberto(false);
                    setConsignacaoSelecionada(null);
                    resetarFormRetorno();
                  }}
                  className={`px-4 py-2 border ${tema.border} rounded-md ${tema.text} hover:${tema.hover}`}
                  disabled={carregando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinalizar}
                  disabled={carregando || formRetorno.quantidadeRetornada === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {carregando ? 'Finalizando...' : (
                    <>
                      <CheckCircle size={18} />
                      Finalizar e Imprimir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};