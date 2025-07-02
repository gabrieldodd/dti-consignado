// src/hooks/useSupabase.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Hook para Vendedores
export const useVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendedores')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setVendedores(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarVendedor = async (vendedor) => {
    try {
      const { data, error } = await supabase
        .from('vendedores')
        .insert([vendedor])
        .select();
      
      if (error) throw error;
      setVendedores(prev => [...prev, ...data]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const atualizarVendedor = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('vendedores')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      setVendedores(prev => prev.map(v => v.id === id ? data[0] : v));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const excluirVendedor = async (id) => {
    try {
      const { error } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setVendedores(prev => prev.filter(v => v.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchVendedores();
  }, []);

  return {
    vendedores,
    loading,
    error,
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    refetch: fetchVendedores
  };
};

// Hook para Produtos
export const useProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarProduto = async (produto) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert([produto])
        .select();
      
      if (error) throw error;
      setProdutos(prev => [...prev, ...data]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const atualizarProduto = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      setProdutos(prev => prev.map(p => p.id === id ? data[0] : p));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const excluirProduto = async (id) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProdutos(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return {
    produtos,
    loading,
    error,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    refetch: fetchProdutos
  };
};

// Hook para Consignações
export const useConsignacoes = () => {
  const [consignacoes, setConsignacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsignacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consignacoes')
        .select(`
          *,
          vendedor:vendedores(*),
          produtos:consignacao_produtos(*),
          retorno:consignacao_retornos(*)
        `)
        .order('data_consignacao', { ascending: false });
      
      if (error) throw error;
      setConsignacoes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarConsignacao = async (consignacao) => {
    try {
      const { data, error } = await supabase
        .from('consignacoes')
        .insert([consignacao])
        .select(`
          *,
          vendedor:vendedores(*),
          produtos:consignacao_produtos(*),
          retorno:consignacao_retornos(*)
        `);
      
      if (error) throw error;
      setConsignacoes(prev => [data[0], ...prev]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const finalizarConsignacao = async (id, dadosRetorno) => {
    try {
      // Atualizar consignação
      const { error: consignacaoError } = await supabase
        .from('consignacoes')
        .update({ 
          status: 'finalizada',
          data_retorno: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (consignacaoError) throw consignacaoError;

      // Inserir dados do retorno
      const { error: retornoError } = await supabase
        .from('consignacao_retornos')
        .insert([{ consignacao_id: id, ...dadosRetorno }]);

      if (retornoError) throw retornoError;

      // Atualizar estado local
      setConsignacoes(prev => prev.map(c => 
        c.id === id 
          ? { ...c, status: 'finalizada', retorno: [dadosRetorno] }
          : c
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchConsignacoes();
  }, []);

  return {
    consignacoes,
    loading,
    error,
    adicionarConsignacao,
    finalizarConsignacao,
    refetch: fetchConsignacoes
  };
};

// Hook para Categorias
export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarCategoria = async (categoria) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoria])
        .select();
      
      if (error) throw error;
      setCategorias(prev => [...prev, ...data]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const atualizarCategoria = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      setCategorias(prev => prev.map(c => c.id === id ? data[0] : c));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const excluirCategoria = async (id) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setCategorias(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return {
    categorias,
    loading,
    error,
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    refetch: fetchCategorias
  };
};