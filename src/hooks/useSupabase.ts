// src/hooks/useSupabase.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Vendedor } from '../types/Vendedor';
import { Produto } from '../types/Produto';
import { Categoria } from '../types/Categoria';
import { Consignacao } from '../types/Consignacao';
import { StatusConsignacao } from '../types/Common';

export const useSupabase = () => {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [consignacoes, setConsignacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendedores
  const fetchVendedores = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*');
      
      if (err) throw err;
      setVendedores(data || []);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar vendedor
  const adicionarVendedor = async (vendedor: any) => {
    try {
      const { data, error: err } = await supabase
        .from('vendedores')
        .insert([vendedor])
        .select();

      if (err) throw err;
      setVendedores(prev => [...prev, ...(data || [])]);
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
      setVendedores(prev => prev.map((v: any) => v.id === id ? { ...v, ...updates } : v));
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
      setVendedores(prev => prev.filter((v: any) => v.id !== id));
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
        .select('*');
      
      if (err) throw err;
      setProdutos(data || []);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar produto
  const adicionarProduto = async (produto: any) => {
    try {
      const { data, error: err } = await supabase
        .from('produtos')
        .insert([produto])
        .select();

      if (err) throw err;
      setProdutos(prev => [...prev, ...(data || [])]);
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
      setProdutos(prev => prev.map((p: any) => p.id === id ? { ...p, ...updates } : p));
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
      setProdutos(prev => prev.filter((p: any) => p.id !== id));
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
        .select('*');
      
      if (err) throw err;
      setCategorias(data || []);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar categoria
  const adicionarCategoria = async (categoria: any) => {
    try {
      const { data, error: err } = await supabase
        .from('categorias')
        .insert([categoria])
        .select();

      if (err) throw err;
      setCategorias(prev => [...prev, ...(data || [])]);
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
      setCategorias(prev => prev.map((c: any) => c.id === id ? { ...c, ...updates } : c));
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
      setCategorias(prev => prev.filter((c: any) => c.id !== id));
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Fetch consignações
  const fetchConsignacoes = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('consignacoes')
        .select('*, vendedor:vendedores(*)')
        .order('created_at', { ascending: false });
      
      if (err) throw err;
      setConsignacoes(data || []);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar consignação
  const adicionarConsignacao = async (consignacao: any) => {
    try {
      const { data, error: err } = await supabase
        .from('consignacoes')
        .insert([consignacao])
        .select('*, vendedor:vendedores(*)');

      if (err) throw err;
      setConsignacoes(prev => [...prev, ...(data || [])]);
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Finalizar consignação
  const finalizarConsignacao = async (id: any, dadosRetorno: any) => {
    try {
      const updates = {
        status: 'finalizada' as StatusConsignacao,
        data_retorno: new Date().toISOString(),
        retorno: dadosRetorno
      };

      const { data, error: err } = await supabase
        .from('consignacoes')
        .update(updates)
        .eq('id', id)
        .select('*, vendedor:vendedores(*)');

      if (err) throw err;
      
      setConsignacoes(prev => prev.map((c: any) => 
        c.id === id ? { ...c, ...updates } : c
      ));
      
      return { success: true, data: data || [] };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  // Excluir consignação
  const excluirConsignacao = async (id: any) => {
    try {
      const { error: err } = await supabase
        .from('consignacoes')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setConsignacoes(prev => prev.filter((c: any) => c.id !== id));
      return { success: true };
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
      return { success: false, error: err?.message || 'Erro desconhecido' };
    }
  };

  const refetch = async () => {
    await Promise.all([
      fetchVendedores(),
      fetchProdutos(),
      fetchCategorias(),
      fetchConsignacoes()
    ]);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    vendedores,
    produtos,
    categorias,
    consignacoes,
    loading,
    error,
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