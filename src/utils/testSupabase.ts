// src/utils/testSupabase.ts
import { supabase } from '../lib/supabase';

export const testarConexaoSupabase = async () => {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar se as variáveis de ambiente estão corretas
    console.log('📋 Variáveis de ambiente:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida');
    
    // Teste 2: Ping básico ao Supabase (CORRIGIDO)
    const { data: pingData, error: pingError, count: pingCount } = await supabase
      .from('vendedores')
      .select('*', { count: 'exact', head: true });
    
    if (pingError) {
      console.error('❌ Erro no ping:', pingError);
      throw pingError;
    }
    
    console.log('✅ Ping bem-sucedido. Registros encontrados:', pingCount);
    
    // Teste 3: Verificar se as tabelas existem
    const tabelas = ['vendedores', 'produtos', 'categorias', 'consignacoes'];
    
    for (const tabela of tabelas) {
      try {
        const { data, error, count } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        console.log(`✅ Tabela '${tabela}' existe e tem ${count || 0} registros`);
      } catch (err) {
        console.error(`❌ Erro na tabela '${tabela}':`, err);
      }
    }
    
    // Teste 4: Teste de inserção básica (se não houver vendedores) (CORRIGIDO)
    const { data: vendedores, error: vendedoresError, count: vendedoresCount } = await supabase
      .from('vendedores')
      .select('*', { count: 'exact', head: true });
    
    if (vendedoresError) throw vendedoresError;
    
    if (vendedoresCount === 0) {
      console.log('📝 Inserindo vendedor de teste...');
      const { data: novoVendedor, error: insertError } = await supabase
        .from('vendedores')
        .insert([{
          nome: 'João Silva',
          email: 'joao@teste.com',
          telefone: '(11) 99999-9999',
          status: 'ativo',
          login: 'joao123',
          senha: '123456'
        }])
        .select();
        
      if (insertError) {
        console.error('❌ Erro ao inserir vendedor de teste:', insertError);
      } else {
        console.log('✅ Vendedor de teste criado:', novoVendedor);
      }
    }
    
    console.log('🎉 Todas as verificações passaram! Supabase está funcionando.');
    return { success: true };
    
  } catch (error) {
    console.error('💥 Erro na verificação do Supabase:', error);
    
    // Diagnósticos adicionais
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        console.error('🔑 Problema: Chave da API inválida. Verifique VITE_SUPABASE_ANON_KEY');
      } else if (error.message.includes('Invalid URL')) {
        console.error('🌐 Problema: URL inválida. Verifique VITE_SUPABASE_URL');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('🗃️ Problema: Tabela não existe. Execute o SQL de criação das tabelas');
      }
    }
    
    return { success: false, error };
  }
};

// Função para executar na inicialização (desenvolvimento)
export const verificarSupabaseAoIniciar = () => {
  if (import.meta.env.DEV) {
    // Só executa em desenvolvimento
    setTimeout(() => {
      testarConexaoSupabase();
    }, 2000); // Aguarda 2 segundos para executar
  }
};