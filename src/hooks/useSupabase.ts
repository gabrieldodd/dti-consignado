// src/hooks/useSupabase.ts - Versão Completa Melhorada
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
  // FUNÇÕES UTILITÁRIAS DE ERRO E VALIDAÇÃO
  // ========================================
  const tratarErro = (erro: any, operacao: string) => {
    console.error(`❌ Erro na operação: ${operacao}`, erro);
    
    let mensagem = `Erro ao ${operacao}`;
    
    if (erro?.message) {
      if (erro.message.includes('column') && erro.message.includes('does not exist')) {
        mensagem = `Erro de schema: Coluna não existe no banco. Execute o SQL de correção.`;
      } else if (erro.message.includes('JWT') || erro.message.includes('Invalid API key')) {
        mensagem = 'Erro de autenticação. Verifique as credenciais do Supabase no arquivo .env';
      } else if (erro.message.includes('violates')) {
        mensagem = 'Dados inválidos ou duplicados.';
      } else if (erro.message.includes('relation') && erro.message.includes('does not exist')) {
        mensagem = 'Tabela não existe no banco. Verifique o schema do Supabase.';
      } else {
        mensagem = erro.message;
      }
    }
    
    setError(mensagem);
    return { success: false, error: mensagem };
  };

  const validarDados = (dados: any, tipo: string) => {
    const erros: string[] = [];
    
    switch (tipo) {
      case 'vendedor':
        if (!dados.nome?.trim()) erros.push('Nome do vendedor é obrigatório');
        if (!dados.email?.trim()) erros.push('Email é obrigatório');
        if (!dados.login?.trim()) erros.push('Login é obrigatório');
        if (!dados.senha?.trim()) erros.push('Senha é obrigatória');
        break;
        
      case 'produto':
        if (!dados.nome?.trim()) erros.push('Nome do produto é obrigatório');
        if (!dados.categoria?.trim()) erros.push('Categoria é obrigatória');
        if (!dados.valor_venda && !dados.valorVenda) erros.push('Valor de venda é obrigatório');
        break;
        
      case 'categoria':
        if (!dados.nome?.trim()) erros.push('Nome da categoria é obrigatório');
        break;
        
      case 'consignacao':
        if (!dados.clienteNome?.trim() && !dados.cliente_nome?.trim()) erros.push('Nome do cliente é obrigatório');
        if (!dados.clienteDocumento?.trim() && !dados.cliente_documento?.trim()) erros.push('Documento do cliente é obrigatório');
        if (!dados.vendedorId && !dados.vendedor_id) erros.push('Vendedor é obrigatório');
        break;
    }
    
    if (erros.length > 0) {
      throw new Error(erros.join(', '));
    }
  };

  // ========================================
  // FUNÇÃO DE LOGIN
  // ========================================
  const fazerLogin = async (login: string, senha: string) => {
    try {
      setLoading(true);
      console.log('🔐 Tentando login com:', login);
      
      if (!login?.trim() || !senha?.trim()) {
        console.error('❌ Login ou senha vazios');
        return null;
      }
      
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*')
        .eq('login', login.trim())
        .eq('senha', senha.trim())
        .eq('status', 'Ativo')
        .single();

      if (err || !data) {
        console.error('❌ Erro no login:', err?.message || 'Credenciais inválidas');
        return null;
      }

      console.log('✅ Login bem-sucedido:', data.nome);
      return data;
    } catch (error: any) {
      console.error('❌ Erro crítico no login:', error);
      tratarErro(error, 'fazer login');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VENDEDORES - CRUD COMPLETO
  // ========================================
  const fetchVendedores = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando vendedores...');
      
      const { data, error: err } = await supabase
        .from('vendedores')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      
      setVendedores(data || []);
      console.log('✅ Vendedores carregados:', data?.length);
    } catch (err: any) {
      tratarErro(err, 'carregar vendedores');
    } finally {
      setLoading(false);
    }
  };

  const adicionarVendedor = async (vendedor: any) => {
    try {
      console.log('➕ Adicionando vendedor:', vendedor);
      
      // Validar dados
      validarDados(vendedor, 'vendedor');
      
      const vendedorFormatado = {
        nome: String(vendedor.nome || '').trim(),
        email: String(vendedor.email || '').trim().toLowerCase(),
        telefone: String(vendedor.telefone || '').trim(),
        status: vendedor.status || 'Ativo',
        login: String(vendedor.login || '').trim(),
        senha: String(vendedor.senha || '').trim(),
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      console.log('📤 Dados formatados:', vendedorFormatado);

      const { data, error: err } = await supabase
        .from('vendedores')
        .insert([vendedorFormatado])
        .select();

      if (err) throw err;
      
      console.log('✅ Vendedor adicionado:', data);
      await fetchVendedores();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'adicionar vendedor');
    }
  };

  const atualizarVendedor = async (id: any, updates: any) => {
    try {
      console.log('✏️ Atualizando vendedor:', id, updates);
      
      if (!id) throw new Error('ID do vendedor é obrigatório');
      
      // Preparar dados para atualização
      const dadosFormatados = {
        nome: updates.nome ? String(updates.nome).trim() : undefined,
        email: updates.email ? String(updates.email).trim().toLowerCase() : undefined,
        telefone: updates.telefone ? String(updates.telefone).trim() : undefined,
        status: updates.status || undefined,
        login: updates.login ? String(updates.login).trim() : undefined,
        senha: updates.senha ? String(updates.senha).trim() : undefined
      };

      // Remover propriedades undefined
      const dadosLimpos = Object.fromEntries(
        Object.entries(dadosFormatados).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(dadosLimpos).length === 0) {
        throw new Error('Nenhum dado válido para atualizar');
      }

      const { data, error: err } = await supabase
        .from('vendedores')
        .update(dadosLimpos)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      console.log('✅ Vendedor atualizado:', data);
      await fetchVendedores();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'atualizar vendedor');
    }
  };

  const excluirVendedor = async (id: any) => {
    try {
      console.log('🗑️ Excluindo vendedor:', id);
      
      if (!id) throw new Error('ID do vendedor é obrigatório');
      
      const { error: err } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Vendedor excluído');
      await fetchVendedores();
      return { success: true };
    } catch (err: any) {
      return tratarErro(err, 'excluir vendedor');
    }
  };

  // ========================================
  // PRODUTOS - CRUD COMPLETO
  // ========================================
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando produtos...');
      
      const { data, error: err } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      
      setProdutos(data || []);
      console.log('✅ Produtos carregados:', data?.length);
    } catch (err: any) {
      tratarErro(err, 'carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const adicionarProduto = async (produto: any) => {
    try {
      console.log('➕ Adicionando produto:', produto);
      
      // Validar dados
      validarDados(produto, 'produto');
      
      // Mapear campos do frontend (camelCase) para o banco (snake_case)
      const produtoFormatado = {
        nome: String(produto.nome || '').trim(),
        descricao: String(produto.descricao || '').trim(),
        codigo_barras: String(produto.codigoBarras || produto.codigo_barras || '').trim(),
        categoria: String(produto.categoria || '').trim(),
        valor_custo: parseFloat(produto.valorCusto || produto.valor_custo || 0),
        valor_venda: parseFloat(produto.valorVenda || produto.valor_venda || 0),
        estoque: parseInt(produto.estoque || 0),
        estoque_minimo: parseInt(produto.estoqueMinimo || produto.estoque_minimo || 0),
        ativo: produto.ativo !== false,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      console.log('📤 Produto formatado:', produtoFormatado);

      const { data, error: err } = await supabase
        .from('produtos')
        .insert([produtoFormatado])
        .select();

      if (err) throw err;
      
      console.log('✅ Produto adicionado:', data);
      await fetchProdutos();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'adicionar produto');
    }
  };

  const atualizarProduto = async (id: any, updates: any) => {
    try {
      console.log('✏️ Atualizando produto:', id, updates);
      
      if (!id) throw new Error('ID do produto é obrigatório');
      
      // Mapear campos se necessário
      const produtoFormatado = {
        nome: updates.nome ? String(updates.nome).trim() : undefined,
        descricao: updates.descricao ? String(updates.descricao).trim() : undefined,
        codigo_barras: updates.codigoBarras || updates.codigo_barras || undefined,
        categoria: updates.categoria ? String(updates.categoria).trim() : undefined,
        valor_custo: updates.valorCusto || updates.valor_custo ? parseFloat(updates.valorCusto || updates.valor_custo) : undefined,
        valor_venda: updates.valorVenda || updates.valor_venda ? parseFloat(updates.valorVenda || updates.valor_venda) : undefined,
        estoque: updates.estoque !== undefined ? parseInt(updates.estoque) : undefined,
        estoque_minimo: updates.estoqueMinimo || updates.estoque_minimo !== undefined ? parseInt(updates.estoqueMinimo || updates.estoque_minimo) : undefined,
        ativo: updates.ativo !== undefined ? updates.ativo : undefined
      };

      // Remover propriedades undefined
      const dadosLimpos = Object.fromEntries(
        Object.entries(produtoFormatado).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(dadosLimpos).length === 0) {
        throw new Error('Nenhum dado válido para atualizar');
      }

      const { data, error: err } = await supabase
        .from('produtos')
        .update(dadosLimpos)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      console.log('✅ Produto atualizado:', data);
      await fetchProdutos();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'atualizar produto');
    }
  };

  const excluirProduto = async (id: any) => {
    try {
      console.log('🗑️ Excluindo produto:', id);
      
      if (!id) throw new Error('ID do produto é obrigatório');
      
      const { error: err } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Produto excluído');
      await fetchProdutos();
      return { success: true };
    } catch (err: any) {
      return tratarErro(err, 'excluir produto');
    }
  };

  // ========================================
  // CATEGORIAS - CRUD COMPLETO
  // ========================================
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando categorias...');
      
      const { data, error: err } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (err) throw err;
      
      setCategorias(data || []);
      console.log('✅ Categorias carregadas:', data?.length);
    } catch (err: any) {
      tratarErro(err, 'carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const adicionarCategoria = async (categoria: any) => {
    try {
      console.log('➕ Adicionando categoria:', categoria);
      
      // Validar dados
      validarDados(categoria, 'categoria');
      
      const categoriaFormatada = {
        nome: String(categoria.nome || '').trim(),
        descricao: String(categoria.descricao || '').trim(),
        cor: categoria.cor || '#3B82F6',
        ativa: categoria.ativa !== false,
        data_cadastro: new Date().toISOString().split('T')[0]
      };

      console.log('📤 Categoria formatada:', categoriaFormatada);

      const { data, error: err } = await supabase
        .from('categorias')
        .insert([categoriaFormatada])
        .select();

      if (err) throw err;
      
      console.log('✅ Categoria adicionada:', data);
      await fetchCategorias();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'adicionar categoria');
    }
  };

  const atualizarCategoria = async (id: any, updates: any) => {
    try {
      console.log('✏️ Atualizando categoria:', id, updates);
      
      if (!id) throw new Error('ID da categoria é obrigatório');
      
      // Preparar dados para atualização
      const dadosFormatados = {
        nome: updates.nome ? String(updates.nome).trim() : undefined,
        descricao: updates.descricao ? String(updates.descricao).trim() : undefined,
        cor: updates.cor || undefined,
        ativa: updates.ativa !== undefined ? updates.ativa : undefined
      };

      // Remover propriedades undefined
      const dadosLimpos = Object.fromEntries(
        Object.entries(dadosFormatados).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(dadosLimpos).length === 0) {
        throw new Error('Nenhum dado válido para atualizar');
      }

      const { data, error: err } = await supabase
        .from('categorias')
        .update(dadosLimpos)
        .eq('id', id)
        .select();

      if (err) throw err;
      
      console.log('✅ Categoria atualizada:', data);
      await fetchCategorias();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'atualizar categoria');
    }
  };

  const excluirCategoria = async (id: any) => {
    try {
      console.log('🗑️ Excluindo categoria:', id);
      
      if (!id) throw new Error('ID da categoria é obrigatório');
      
      const { error: err } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Categoria excluída');
      await fetchCategorias();
      return { success: true };
    } catch (err: any) {
      return tratarErro(err, 'excluir categoria');
    }
  };

  // ========================================
  // CONSIGNAÇÕES - CRUD COMPLETO
  // ========================================
  const fetchConsignacoes = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando consignações...');
      
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
      tratarErro(err, 'carregar consignações');
    } finally {
      setLoading(false);
    }
  };

  const adicionarConsignacao = async (consignacao: any) => {
    try {
      console.log('➕ Adicionando consignação:', consignacao);
      
      // Validar dados
      validarDados(consignacao, 'consignacao');
      
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
        data_retorno: null,
        status: 'ativa',
        observacoes: consignacao.observacoes || null,
        retorno: null
      };

      console.log('📤 Dados formatados para envio:', JSON.stringify(consignacaoFormatada, null, 2));

      const { data, error: err } = await supabase
        .from('consignacoes')
        .insert([consignacaoFormatada])
        .select(`
          *,
          vendedores (
            id,
            nome,
            email
          )
        `);

      if (err) throw err;
      
      console.log('✅ Consignação adicionada com sucesso:', data);
      await fetchConsignacoes();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'adicionar consignação');
    }
  };

  const finalizarConsignacao = async (id: any, dadosRetorno: any) => {
    try {
      console.log('🏁 Finalizando consignação ID:', id);
      console.log('📊 Dados do retorno:', dadosRetorno);
      
      if (!id) throw new Error('ID da consignação é obrigatório');
      
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
        retorno: retornoJson
      };

      console.log('📤 Updates para envio:', JSON.stringify(updates, null, 2));

      const { data, error: err } = await supabase
        .from('consignacoes')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          vendedores (
            id,
            nome,
            email
          )
        `);

      if (err) throw err;
      
      console.log('✅ Consignação finalizada:', data);
      await fetchConsignacoes();
      return { success: true, data: data || [] };
    } catch (err: any) {
      return tratarErro(err, 'finalizar consignação');
    }
  };

  const excluirConsignacao = async (id: any) => {
    try {
      console.log('🗑️ Excluindo consignação:', id);
      
      if (!id) throw new Error('ID da consignação é obrigatório');
      
      const { error: err } = await supabase
        .from('consignacoes')
        .delete()
        .eq('id', id);

      if (err) throw err;
      
      console.log('✅ Consignação excluída');
      await fetchConsignacoes();
      return { success: true };
    } catch (err: any) {
      return tratarErro(err, 'excluir consignação');
    }
  };

  // ========================================
  // FUNÇÃO PARA RECARREGAR TODOS OS DADOS
  // ========================================
  const refetch = async () => {
    console.log('🔄 Recarregando todos os dados...');
    setError(null); // Limpar erros anteriores
    
    try {
      await Promise.all([
        fetchVendedores(),
        fetchProdutos(),
        fetchCategorias(),
        fetchConsignacoes()
      ]);
      console.log('✅ Todos os dados recarregados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao recarregar dados:', error);
      tratarErro(error, 'recarregar dados');
    }
  };

  // ========================================
  // TESTE DE CONEXÃO
  // ========================================
  const testarConexao = async () => {
    try {
      console.log('🔍 Testando conexão com Supabase...');
      
      const { data, error } = await supabase
        .from('vendedores')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      console.log('✅ Conexão OK!');
      return true;
    } catch (err: any) {
      console.error('❌ Falha na conexão:', err);
      tratarErro(err, 'testar conexão');
      return false;
    }
  };

  // ========================================
  // INICIALIZAÇÃO AUTOMÁTICA
  // ========================================
  useEffect(() => {
    const inicializar = async () => {
      console.log('🚀 Inicializando useSupabase...');
      
      // Testar conexão primeiro
      const conexaoOk = await testarConexao();
      
      if (conexaoOk) {
        // Carregar todos os dados
        await refetch();
      } else {
        console.error('❌ Falha na inicialização - problemas de conexão');
      }
    };
    
    inicializar();
  }, []);

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  return {
    // Estados
    vendedores,
    produtos,
    categorias,
    consignacoes,
    loading,
    error,
    
    // Função de Login
    fazerLogin,
    
    // CRUD Vendedores
    fetchVendedores,
    adicionarVendedor,
    atualizarVendedor,
    excluirVendedor,
    
    // CRUD Produtos
    fetchProdutos,
    adicionarProduto,
    atualizarProduto,
    excluirProduto,
    
    // CRUD Categorias
    fetchCategorias,
    adicionarCategoria,
    atualizarCategoria,
    excluirCategoria,
    
    // CRUD Consignações
    fetchConsignacoes,
    adicionarConsignacao,
    finalizarConsignacao,
    excluirConsignacao,
    
    // Utilitários
    refetch,
    testarConexao,
    clearError: () => setError(null)
  };
};