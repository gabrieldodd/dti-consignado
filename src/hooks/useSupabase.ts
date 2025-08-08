// src/hooks/useSupabase.ts
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
      
      // Buscar vendedor pelo login e senha
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*')
        .eq('login', login)
        .eq('senha', senha)
        .eq('status', 'Ativo')
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
      
      // Mapear campos do frontend (camelCase) para o banco (snake_case)
      const produtoFormatado = {
        nome: produto.nome,
        descricao: produto.descricao || '',
        codigo_barras: produto.codigoBarras || produto.codigo_barras || '',
        categoria: produto.categoria,
        valor_custo: parseFloat(produto.valorCusto || produto.valor_custo || 0),
        valor_venda: parseFloat(produto.valorVenda || produto.valor_venda || 0),
        estoque: parseInt(produto.estoque || 0),
        estoque_minimo: parseInt(produto.estoqueMinimo || produto.estoque_minimo || 0),
        ativo: produto.ativo !== false,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      console.log('Produto formatado:', produtoFormatado);

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
      
      // Mapear campos se necessário
      const produtoFormatado = {
        nome: updates.nome,
        descricao: updates.descricao,
        codigo_barras: updates.codigoBarras || updates.codigo_barras,
        categoria: updates.categoria,
        valor_custo: parseFloat(updates.valorCusto || updates.valor_custo || 0),
        valor_venda: parseFloat(updates.valorVenda || updates.valor_venda || 0),
        estoque: parseInt(updates.estoque || 0),
        estoque_minimo: parseInt(updates.estoqueMinimo || updates.estoque_minimo || 0),
        ativo: updates.ativo !== false
      };

      const { data, error: err } = await supabase
        .from('produtos')
        .update(produtoFormatado)
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
  // CONSIGNAÇÕES
  // ========================================
  const fetchConsignacoes = async () => {
    try {
      setLoading(true);
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
      setConsignacoes(data || []);
      console.log('✅ Consignações carregadas:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar consignações');
      console.error('❌ Erro ao buscar consignações:', err);
    } finally {
      setLoading(false);
    }
  };

  const adicionarConsignacao = async (consignacao: any) => {
    try {
      console.log('Adicionando consignação:', consignacao);
      
      // Preparar dados com todos os campos corretos
      const consignacaoFormatada = {
        cliente_nome: String(consignacao.clienteNome || '').trim(),
        cliente_documento: String(consignacao.clienteDocumento || '').replace(/\D/g, ''),
        cliente_telefone: String(consignacao.clienteTelefone || '').trim(),
        tipo_documento: consignacao.tipoDocumento || 'cpf',
        vendedor_id: parseInt(consignacao.vendedorId) || null,
        quantidade_total: parseInt(consignacao.quantidadeTotal) || 0,
        valor_total: parseFloat(consignacao.valorTotal) || 0,
        data_consignacao: new Date().toISOString().split('T')[0],
        data_retorno: null, // Inicialmente null
        status: 'ativa',
        observacoes: consignacao.observacoes || null,
        retorno: null // JSONB - inicialmente null
      };

      // Validação
      if (!consignacaoFormatada.cliente_nome) {
        throw new Error('Nome do cliente é obrigatório');
      }
      if (!consignacaoFormatada.cliente_documento) {
        throw new Error('Documento do cliente é obrigatório');
      }
      if (!consignacaoFormatada.vendedor_id) {
        throw new Error('Vendedor é obrigatório');
      }

      console.log('Dados formatados para envio:', JSON.stringify(consignacaoFormatada, null, 2));

      const { data, error: err } = await supabase
        .from('consignacoes')
        .insert([consignacaoFormatada])
        .select();

      if (err) {
        console.error('❌ Erro do Supabase:', err);
        throw err;
      }
      
      console.log('✅ Consignação adicionada com sucesso:', data);
      await fetchConsignacoes();
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('❌ Erro ao adicionar consignação:', err);
      const mensagemErro = err?.message || 'Erro ao adicionar consignação';
      setError(mensagemErro);
      return { success: false, error: mensagemErro };
    }
  };

  const finalizarConsignacao = async (id: any, dadosRetorno: any) => {
    try {
      console.log('Finalizando consignação ID:', id);
      console.log('Dados do retorno:', dadosRetorno);
      
      // Preparar o objeto JSON para a coluna retorno
      const retornoJson = {
        quantidadeRetornada: parseInt(dadosRetorno.quantidadeRetornada) || 0,
        quantidadeVendida: parseInt(dadosRetorno.quantidadeVendida) || 0,
        valorRetornado: parseFloat(dadosRetorno.valorRetornado) || 0,
        valorDevido: parseFloat(dadosRetorno.valorDevido) || 0,
        observacoes: dadosRetorno.observacoes || '',
        dataFinalizacao: new Date().toISOString()
      };

      const updates = {
        status: 'finalizada',
        data_retorno: new Date().toISOString().split('T')[0],
        retorno: retornoJson // JSONB
      };

      console.log('Updates para envio:', JSON.stringify(updates, null, 2));

      const { data, error: err } = await supabase
        .from('consignacoes')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) {
        console.error('❌ Erro ao finalizar:', err);
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
      console.log('Excluindo consignação:', id);
      
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
    
    // Funções
    fazerLogin,
    
    // Vendedores
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    
    // Produtos
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    
    // Categorias
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    
    // Consignações
    adicionarConsignacao,
    finalizarConsignacao,
    excluirConsignacao,
    
    // Utilitários
    refetch
  };
};