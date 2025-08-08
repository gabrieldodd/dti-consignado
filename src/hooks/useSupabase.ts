// src/hooks/useSupabase.ts - VERSÃO COMPLETA COM CÓDIGO DE BARRAS
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [consignacoes, setConsignacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FUNÇÃO DE LOGIN
  // ========================================
  const fazerLogin = async (login: string, senha: string) => {
    try {
      setLoading(true);
      console.log('Tentando login com:', login);
      
      // Buscar vendedor pelo login e senha - ACEITA QUALQUER CAPITALIZAÇÃO DE STATUS
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*')
        .eq('login', login)
        .eq('senha', senha)
        .or('status.eq.Ativo,status.eq.ativo,status.eq.ATIVO')
        .single();

      if (err || !data) {
        console.error('Erro no login:', err);
        return null;
      }

      console.log('Login bem-sucedido:', data);
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FETCH INICIAL DE DADOS
  // ========================================
  useEffect(() => {
    const carregarDados = async () => {
      await Promise.all([
        fetchVendedores(),
        fetchProdutos(),
        fetchCategorias(),
        fetchConsignacoes()
      ]);
    };
    carregarDados();
  }, []);

  // ========================================
  // VENDEDORES
  // ========================================
  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      setVendedores(data || []);
      console.log('✅ Vendedores carregados:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar vendedores');
      console.error('❌ Erro ao buscar vendedores:', err);
    } finally {
      setLoading(false);
    }
  };

  const adicionarVendedor = async (vendedor: any) => {
    try {
      console.log('Adicionando vendedor:', vendedor);
      
      const vendedorFormatado = {
        nome: vendedor.nome,
        email: vendedor.email,
        telefone: vendedor.telefone,
        status: vendedor.status || 'Ativo',
        login: vendedor.login,
        senha: vendedor.senha,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      const { data, error: err } = await supabase
        .from('vendedores')
        .insert([vendedorFormatado])
        .select();

      if (err) throw err;
      
      console.log('✅ Vendedor adicionado:', data);
      await fetchVendedores();
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('❌ Erro ao adicionar vendedor:', err);
      setError(err?.message || 'Erro ao adicionar vendedor');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  const atualizarVendedor = async (id: any, updates: any) => {
    try {
      console.log('Atualizando vendedor:', id, updates);
      
      const { data, error: err } = await supabase
        .from('vendedores')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      console.log('✅ Vendedor atualizado:', data);
      await fetchVendedores();
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('❌ Erro ao atualizar vendedor:', err);
      setError(err?.message || 'Erro ao atualizar vendedor');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  const excluirVendedor = async (id: any) => {
    try {
      console.log('Excluindo vendedor:', id);
      
      const { error: err } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Vendedor excluído');
      await fetchVendedores();
      return { success: true };
    } catch (err: any) {
      console.error('❌ Erro ao excluir vendedor:', err);
      setError(err?.message || 'Erro ao excluir vendedor');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // ========================================
  // PRODUTOS
  // ========================================
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      setProdutos(data || []);
      console.log('✅ Produtos carregados:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar produtos');
      console.error('❌ Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const adicionarProduto = async (produto: any) => {
    try {
      console.log('Adicionando produto:', produto);
      
      const produtoFormatado = {
        nome: produto.nome,
        descricao: produto.descricao || '',
        codigo_barras: produto.codigo_barras,
        categoria: produto.categoria,
        valor_custo: parseFloat(produto.valor_custo),
        valor_venda: parseFloat(produto.valor_venda),
        estoque: parseInt(produto.estoque),
        estoque_minimo: parseInt(produto.estoque_minimo) || 0,
        ativo: produto.ativo !== false,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      const { data, error: err } = await supabase
        .from('produtos')
        .insert([produtoFormatado])
        .select();

      if (err) throw err;
      
      console.log('✅ Produto adicionado:', data);
      await fetchProdutos();
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('❌ Erro ao adicionar produto:', err);
      setError(err?.message || 'Erro ao adicionar produto');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  const atualizarProduto = async (id: any, updates: any) => {
    try {
      console.log('Atualizando produto:', id, updates);
      
      const { data, error: err } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      console.log('✅ Produto atualizado:', data);
      await fetchProdutos();
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('❌ Erro ao atualizar produto:', err);
      setError(err?.message || 'Erro ao atualizar produto');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  const excluirProduto = async (id: any) => {
    try {
      console.log('Excluindo produto:', id);
      
      const { error: err } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Produto excluído');
      await fetchProdutos();
      return { success: true };
    } catch (err: any) {
      console.error('❌ Erro ao excluir produto:', err);
      setError(err?.message || 'Erro ao excluir produto');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // ========================================
  // NOVA FUNÇÃO: BUSCAR PRODUTO POR CÓDIGO DE BARRAS
  // ========================================
  const buscarProdutoPorCodigo = async (codigoBarras: string) => {
    try {
      console.log('🔍 Buscando produto por código:', codigoBarras);
      
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('codigo_barras', codigoBarras.trim())
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (!data) {
        console.log('❌ Produto não encontrado:', codigoBarras);
        return { success: false, error: 'Produto não encontrado ou inativo' };
      }

      console.log('✅ Produto encontrado:', data);
      return { success: true, data: data };
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar produto:', err);
      return { success: false, error: err?.message || 'Erro ao buscar produto' };
    }
  };

  // ========================================
  // CATEGORIAS
  // ========================================
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      setCategorias(data || []);
      console.log('✅ Categorias carregadas:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar categorias');
      console.error('❌ Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const adicionarCategoria = async (categoria: any) => {
    try {
      console.log('Adicionando categoria:', categoria);
      
      const categoriaFormatada = {
        nome: categoria.nome,
        descricao: categoria.descricao || '',
        cor: categoria.cor || '#3B82F6',
        ativa: categoria.ativa !== false,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      const { data, error: err } = await supabase
        .from('categorias')
        .insert([categoriaFormatada])
        .select();

      if (err) throw err;
      
      console.log('✅ Categoria adicionada:', data);
      await fetchCategorias();
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('❌ Erro ao adicionar categoria:', err);
      setError(err?.message || 'Erro ao adicionar categoria');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  const atualizarCategoria = async (id: any, updates: any) => {
    try {
      console.log('Atualizando categoria:', id, updates);
      
      const { data, error: err } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      console.log('✅ Categoria atualizada:', data);
      await fetchCategorias();
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('❌ Erro ao atualizar categoria:', err);
      setError(err?.message || 'Erro ao atualizar categoria');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  const excluirCategoria = async (id: any) => {
    try {
      console.log('Excluindo categoria:', id);
      
      const { error: err } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Categoria excluída');
      await fetchCategorias();
      return { success: true };
    } catch (err: any) {
      console.error('❌ Erro ao excluir categoria:', err);
      setError(err?.message || 'Erro ao excluir categoria');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // ========================================
  // CONSIGNAÇÕES - VERSÃO MELHORADA COM CÓDIGO DE BARRAS
  // ========================================
  const fetchConsignacoes = async () => {
    try {
      setLoading(true);
      
      // Buscar consignações com dados do vendedor
      const { data, error: err } = await supabase
        .from('consignacoes')
        .select(`
          *,
          vendedores (
            id,
            nome,
            email
          )
        `)
        .order('data_consignacao', { ascending: false });
      
      if (err) throw err;

      // Para cada consignação, buscar os itens se existirem
      const consignacaoComItens = await Promise.all(
        (data || []).map(async (consignacao) => {
          try {
            const resultadoItens = await buscarItensConsignacao(consignacao.id);
            return {
              ...consignacao,
              itens: resultadoItens.success ? resultadoItens.data : [],
              produtos: consignacao.produtos ? JSON.parse(consignacao.produtos) : []
            };
          } catch (error) {
            console.error('Erro ao buscar itens da consignação:', consignacao.id, error);
            return {
              ...consignacao,
              itens: [],
              produtos: consignacao.produtos ? JSON.parse(consignacao.produtos) : []
            };
          }
        })
      );

      setConsignacoes(consignacaoComItens);
      console.log('✅ Consignações carregadas:', consignacaoComItens.length);
      
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar consignações');
      console.error('❌ Erro ao buscar consignações:', err);
    } finally {
      setLoading(false);
    }
  };

  const adicionarConsignacao = async (consignacao: any) => {
    try {
      console.log('📦 Adicionando consignação com produtos:', consignacao);
      
      // Preparar dados da consignação principal
      const consignacaoFormatada = {
        cliente_nome: String(consignacao.clienteNome || '').trim(),
        cliente_documento: String(consignacao.clienteDocumento || '').trim(),
        cliente_telefone: String(consignacao.clienteTelefone || '').trim(),
        tipo_documento: consignacao.tipoDocumento || 'cpf',
        vendedor_id: parseInt(consignacao.vendedorId),
        data_consignacao: consignacao.data_consignacao || new Date().toISOString().split('T')[0],
        data_vencimento: consignacao.data_vencimento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        valor_total: consignacao.valor_total || 0,
        quantidade_total: consignacao.produtos?.reduce((total: number, p: any) => total + p.quantidade, 0) || 0,
        status: 'Aberta',
        observacoes: consignacao.observacoes || '',
        produtos: JSON.stringify(consignacao.produtos || []) // Backup dos produtos em JSON
      };

      console.log('📋 Dados formatados para envio:', consignacaoFormatada);

      // 1. Inserir consignação principal
      const { data: consignacaoData, error: consignacaoError } = await supabase
        .from('consignacoes')
        .insert([consignacaoFormatada])
        .select()
        .single();

      if (consignacaoError) throw consignacaoError;

      console.log('✅ Consignação principal criada:', consignacaoData);

      // 2. Inserir itens da consignação na tabela de itens (se a tabela existir)
      if (consignacao.produtos && consignacao.produtos.length > 0) {
        try {
          const itensConsignacao = consignacao.produtos.map((produto: any) => ({
            consignacao_id: consignacaoData.id,
            produto_id: produto.produto_id,
            quantidade_deixada: produto.quantidade,
            quantidade_retornada: 0,
            quantidade_vendida: 0,
            valor_unitario: produto.valor_unitario,
            valor_total_deixado: produto.valor_total,
            valor_total_vendido: 0
          }));

          const { error: itensError } = await supabase
            .from('consignacao_itens')
            .insert(itensConsignacao);

          if (itensError) {
            console.warn('⚠️ Não foi possível inserir itens detalhados (tabela pode não existir):', itensError);
            // Não falha a operação, apenas não insere na tabela de detalhes
          } else {
            console.log('✅ Itens da consignação inseridos na tabela de detalhes');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao inserir itens detalhados:', error);
          // Continua sem falhar
        }
      }

      await fetchConsignacoes();
      return { success: true, data: [consignacaoData] };
      
    } catch (err: any) {
      console.error('❌ Erro ao adicionar consignação:', err);
      const mensagemErro = err?.message || 'Erro ao adicionar consignação';
      setError(mensagemErro);
      return { success: false, error: mensagemErro };
    }
  };

  const finalizarConsignacao = async (id: any, dadosRetorno: any) => {
    try {
      console.log('🏁 Finalizando consignação:', id, dadosRetorno);

      // 1. Tentar atualizar itens com dados de retorno (se a tabela existir)
      if (dadosRetorno.produtos_retorno && dadosRetorno.produtos_retorno.length > 0) {
        try {
          for (const produtoRetorno of dadosRetorno.produtos_retorno) {
            const { error: itemError } = await supabase
              .from('consignacao_itens')
              .update({
                quantidade_retornada: produtoRetorno.quantidade_retornada,
                quantidade_vendida: produtoRetorno.quantidade_vendida,
                valor_total_vendido: produtoRetorno.quantidade_vendida * produtoRetorno.valor_unitario,
                updated_at: new Date().toISOString()
              })
              .eq('consignacao_id', id)
              .eq('produto_id', produtoRetorno.produto_id);

            if (itemError) {
              console.warn('⚠️ Erro ao atualizar item detalhado:', itemError);
              // Continua sem falhar
            }
          }
          console.log('✅ Itens detalhados atualizados');
        } catch (error) {
          console.warn('⚠️ Não foi possível atualizar itens detalhados:', error);
          // Continua sem falhar
        }
      }

      // 2. Atualizar consignação principal
      const updates = {
        status: 'Finalizada',
        data_finalizacao: new Date().toISOString().split('T')[0],
        valor_retornado: dadosRetorno.valor_retornado || 0,
        valor_vendido: dadosRetorno.valor_vendido || 0,
        produtos_retorno: JSON.stringify(dadosRetorno.produtos_retorno || []),
        observacoes_retorno: dadosRetorno.observacoes || '',
        updated_at: new Date().toISOString()
      };

      const { data, error: err } = await supabase
        .from('consignacoes')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) {
        console.error('❌ Erro ao finalizar consignação:', err);
        throw err;
      }
      
      console.log('✅ Consignação finalizada:', data);
      await fetchConsignacoes();
      return { success: true, data: data || [] };
      
    } catch (err: any) {
      console.error('❌ Erro ao finalizar consignação:', err);
      const mensagemErro = err?.message || 'Erro ao finalizar consignação';
      setError(mensagemErro);
      return { success: false, error: mensagemErro };
    }
  };

  const excluirConsignacao = async (id: any) => {
    try {
      console.log('🗑️ Excluindo consignação:', id);
      
      // Tentar excluir itens primeiro (se a tabela existir)
      try {
        await supabase
          .from('consignacao_itens')
          .delete()
          .eq('consignacao_id', id);
        console.log('✅ Itens da consignação excluídos');
      } catch (error) {
        console.warn('⚠️ Não foi possível excluir itens (tabela pode não existir):', error);
        // Continua sem falhar
      }
      
      // Excluir consignação principal
      const { error: err } = await supabase
        .from('consignacoes')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Consignação excluída');
      await fetchConsignacoes();
      return { success: true };
    } catch (err: any) {
      console.error('❌ Erro ao excluir consignação:', err);
      setError(err?.message || 'Erro ao excluir consignação');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // ========================================
  // NOVA FUNÇÃO: BUSCAR ITENS DA CONSIGNAÇÃO
  // ========================================
  const buscarItensConsignacao = async (consignacaoId: number) => {
    try {
      console.log('🔍 Buscando itens da consignação:', consignacaoId);
      
      const { data, error } = await supabase
        .from('consignacao_itens')
        .select(`
          *,
          produtos (
            id,
            nome,
            descricao,
            codigo_barras,
            categoria,
            valor_venda
          )
        `)
        .eq('consignacao_id', consignacaoId)
        .order('id');

      if (error) {
        // Se a tabela não existir, não é um erro crítico
        if (error.code === '42P01') { // relation does not exist
          console.log('ℹ️ Tabela consignacao_itens não existe ainda');
          return { success: true, data: [] };
        }
        throw error;
      }

      console.log('✅ Itens encontrados:', data?.length || 0);
      return { success: true, data: data || [] };
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar itens:', err);
      return { success: false, error: err?.message || 'Erro ao buscar itens' };
    }
  };

  // ========================================
  // FUNÇÃO PARA VALIDAR QUANTIDADE DE RETORNO
  // ========================================
  const validarQuantidadeRetorno = (
    quantidadeDeixada: number, 
    quantidadeRetornada: number
  ): { valido: boolean; erro?: string } => {
    if (quantidadeRetornada < 0) {
      return { valido: false, erro: 'Quantidade não pode ser negativa' };
    }
    
    if (quantidadeRetornada > quantidadeDeixada) {
      return { 
        valido: false, 
        erro: `Quantidade de retorno (${quantidadeRetornada}) não pode ser maior que a deixada (${quantidadeDeixada})` 
      };
    }
    
    return { valido: true };
  };

  // ========================================
  // FUNÇÃO PARA RECARREGAR TODOS OS DADOS
  // ========================================
  const refetch = async () => {
    console.log('🔄 Recarregando todos os dados...');
    await Promise.all([
      fetchVendedores(),
      fetchProdutos(),
      fetchCategorias(),
      fetchConsignacoes()
    ]);
    console.log('✅ Dados recarregados');
  };

  // ========================================
  // FUNÇÃO PARA OBTER ESTATÍSTICAS
  // ========================================
  const obterEstatisticas = () => {
    const estatisticas = {
      vendedores: {
        total: vendedores.length,
        ativos: vendedores.filter(v => String(v.status).toLowerCase() === 'ativo').length
      },
      produtos: {
        total: produtos.length,
        ativos: produtos.filter(p => p.ativo).length,
        categorias: [...new Set(produtos.map(p => p.categoria))].length
      },
      consignacoes: {
        total: consignacoes.length,
        abertas: consignacoes.filter(c => c.status === 'Aberta').length,
        finalizadas: consignacoes.filter(c => c.status === 'Finalizada').length,
        valorTotal: consignacoes.reduce((total, c) => total + (c.valor_total || 0), 0),
        valorVendido: consignacoes.reduce((total, c) => total + (c.valor_vendido || 0), 0)
      }
    };

    return estatisticas;
  };

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    // Dados
    vendedores,
    produtos,
    categorias,
    consignacoes,
    loading,
    error,
    
    // Função de Login
    fazerLogin,
    
    // CRUD Vendedores
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    
    // CRUD Produtos
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    buscarProdutoPorCodigo, // ← NOVA
    
    // CRUD Categorias
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    
    // CRUD Consignações (MELHORADAS)
    adicionarConsignacao,
    finalizarConsignacao,
    excluirConsignacao,
    buscarItensConsignacao, // ← NOVA
    
    // Funções Auxiliares
    validarQuantidadeRetorno, // ← NOVA
    obterEstatisticas, // ← NOVA
    refetch
  };
};