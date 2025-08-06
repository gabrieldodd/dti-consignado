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

  // Função de login
  const fazerLogin = async (login: string, senha: string) => {
    try {
      setLoading(true);
      
      // Buscar vendedor pelo login
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*')
        .eq('login', login)
        .eq('senha', senha)
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

  // Fetch inicial de dados
  useEffect(() => {
    fetchVendedores();
    fetchProdutos();
    fetchCategorias();
    fetchConsignacoes();
  }, []);

  // Fetch vendedores
  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      setVendedores(data || []);
      console.log('Vendedores carregados:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      console.error('Erro ao buscar vendedores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar vendedor
  const adicionarVendedor = async (vendedor: any) => {
    try {
      // Formatar dados para o Supabase
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
      
      await fetchVendedores(); // Recarregar lista
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Atualizar vendedor
  const atualizarVendedor = async (id: any, updates: any) => {
    try {
      const { data, error: err } = await supabase
        .from('vendedores')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      await fetchVendedores();
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Excluir vendedor
  const excluirVendedor = async (id: any) => {
    try {
      const { error: err } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      await fetchVendedores();
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Fetch produtos
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      setProdutos(data || []);
      console.log('Produtos carregados:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar produto
  const adicionarProduto = async (produto: any) => {
    try {
      const produtoFormatado = {
        nome: produto.nome,
        descricao: produto.descricao,
        codigo_barras: produto.codigoBarras,
        categoria: produto.categoria,
        valor_custo: produto.valorCusto,
        valor_venda: produto.valorVenda,
        estoque: produto.estoque,
        estoque_minimo: produto.estoqueMinimo,
        ativo: produto.ativo !== false,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      const { data, error: err } = await supabase
        .from('produtos')
        .insert([produtoFormatado])
        .select();

      if (err) throw err;
      
      await fetchProdutos();
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Atualizar produto
  const atualizarProduto = async (id: any, updates: any) => {
    try {
      const { data, error: err } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      await fetchProdutos();
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Excluir produto
  const excluirProduto = async (id: any) => {
    try {
      const { error: err } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      await fetchProdutos();
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Fetch categorias
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      setCategorias(data || []);
      console.log('Categorias carregadas:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar categoria
  const adicionarCategoria = async (categoria: any) => {
    try {
      const categoriaFormatada = {
        nome: categoria.nome,
        descricao: categoria.descricao,
        cor: categoria.cor,
        ativa: categoria.ativa !== false,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      const { data, error: err } = await supabase
        .from('categorias')
        .insert([categoriaFormatada])
        .select();

      if (err) throw err;
      
      await fetchCategorias();
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Atualizar categoria
  const atualizarCategoria = async (id: any, updates: any) => {
    try {
      const { data, error: err } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      await fetchCategorias();
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Excluir categoria
  const excluirCategoria = async (id: any) => {
    try {
      const { error: err } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      await fetchCategorias();
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Fetch consignacoes
  const fetchConsignacoes = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('consignacoes')
        .select('*')
        .order('data_consignacao', { ascending: false });
      
      if (err) throw err;
      setConsignacoes(data || []);
      console.log('Consignações carregadas:', data?.length);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      console.error('Erro ao buscar consignações:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar consignacao
  const adicionarConsignacao = async (consignacao: any) => {
    try {
      const consignacaoFormatada = {
        cliente_nome: consignacao.clienteNome,
        cliente_documento: consignacao.clienteDocumento,
        cliente_telefone: consignacao.clienteTelefone,
        tipo_documento: consignacao.tipoDocumento,
        vendedor_id: consignacao.vendedorId,
        quantidade_total: consignacao.quantidadeTotal,
        valor_total: consignacao.valorTotal,
        data_consignacao: new Date().toISOString().split('T')[0],
        status: 'ativa',
        observacoes: consignacao.observacoes
      };

      const { data, error: err } = await supabase
        .from('consignacoes')
        .insert([consignacaoFormatada])
        .select();

      if (err) throw err;
      
      await fetchConsignacoes();
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Finalizar consignacao
  const finalizarConsignacao = async (id: any, dadosRetorno: any) => {
    try {
      const updates = {
        status: 'finalizada',
        data_retorno: new Date().toISOString().split('T')[0],
        retorno: dadosRetorno
      };

      const { data, error: err } = await supabase
        .from('consignacoes')
        .update(updates)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      await fetchConsignacoes();
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Excluir consignacao
  const excluirConsignacao = async (id: any) => {
    try {
      const { error: err } = await supabase
        .from('consignacoes')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      await fetchConsignacoes();
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Refetch all data
  const refetch = async () => {
    await Promise.all([
      fetchVendedores(),
      fetchProdutos(),
      fetchCategorias(),
      fetchConsignacoes()
    ]);
  };

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
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    adicionarConsignacao,
    finalizarConsignacao,
    excluirConsignacao,
    refetch
  };
};