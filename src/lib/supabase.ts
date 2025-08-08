// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Função para obter variáveis de ambiente com fallback
const getEnvVar = (key: string, fallback: string = ''): string => {
  // Primeiro tenta import.meta.env (Vite)
  if (import.meta?.env?.[key]) {
    return import.meta.env[key];
  }
  
  // Fallback para process.env (caso esteja rodando em Node)
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  
  return fallback;
};

// Configuração das variáveis de ambiente
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://etuswxlyokruxivekxhj.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0dXN3eGx5b2tydXhpdmVreGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTc2MDYsImV4cCI6MjA2NzA3MzYwNn0.m1HuaUxO2FITM2oZQ_25eRBUzjuMobfKRqs7EYn4fIk');

// Debug das variáveis carregadas
console.log('🔍 Debug - Variáveis de ambiente:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Carregada' : '❌ Não encontrada');
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Carregada' : '❌ Não encontrada');

// Validação mais flexível
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'sua_url_aqui' || supabaseAnonKey === 'sua_chave_aqui') {
  console.warn('⚠️ Usando configuração padrão do Supabase!');
  console.warn('Para usar suas próprias credenciais:');
  console.warn('1. Crie um arquivo .env na raiz do projeto');
  console.warn('2. Adicione suas credenciais do Supabase');
  console.warn('3. Reinicie o servidor (npm run dev)');
  
  // Não para a execução, apenas avisa
} else {
  console.log('✅ Supabase configurado com credenciais customizadas!');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log de sucesso
console.log('✅ Cliente Supabase criado com sucesso!');
console.log('📍 URL:', supabaseUrl.substring(0, 30) + '...');

// Função para testar a conexão
export const testConnection = async () => {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    
    const { data, error, count } = await supabase
      .from('categorias')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      
      // Diagnóstico específico do erro
      if (error.message.includes('Invalid API key')) {
        console.error('🔑 Problema: Chave da API inválida');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('🗃️ Problema: Tabela "categorias" não existe');
        console.error('💡 Solução: Execute o script SQL para criar as tabelas');
      }
      
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    console.log('📊 Registros na tabela categorias:', count || 0);
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
    return false;
  }
};

// Testar conexão automaticamente (apenas em desenvolvimento)
if (import.meta.env?.DEV || import.meta.env?.MODE === 'development') {
  setTimeout(() => {
    testConnection();
  }, 1000);
}

// Tipos para as tabelas do Supabase
export interface Database {
  public: {
    Tables: {
      vendedores: {
        Row: {
          id: number;
          nome: string;
          email: string;
          telefone: string;
          status: string;
          login: string;
          senha: string;
          data_cadastro: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          nome: string;
          email: string;
          telefone: string;
          status: string;
          login: string;
          senha: string;
          data_cadastro?: string;
        };
        Update: {
          nome?: string;
          email?: string;
          telefone?: string;
          status?: string;
          login?: string;
          senha?: string;
        };
      };
      produtos: {
        Row: {
          id: number;
          nome: string;
          descricao: string;
          codigo_barras: string;
          categoria: string;
          valor_custo: number;
          valor_venda: number;
          estoque: number;
          estoque_minimo: number;
          ativo: boolean;
          data_cadastro: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          nome: string;
          descricao: string;
          codigo_barras: string;
          categoria: string;
          valor_custo: number;
          valor_venda: number;
          estoque: number;
          estoque_minimo: number;
          ativo?: boolean;
          data_cadastro?: string;
        };
        Update: {
          nome?: string;
          descricao?: string;
          codigo_barras?: string;
          categoria?: string;
          valor_custo?: number;
          valor_venda?: number;
          estoque?: number;
          estoque_minimo?: number;
          ativo?: boolean;
        };
      };
      categorias: {
        Row: {
          id: number;
          nome: string;
          descricao: string;
          cor: string;
          ativa: boolean;
          data_cadastro: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          nome: string;
          descricao?: string;
          cor?: string;
          ativa?: boolean;
          data_cadastro?: string;
        };
        Update: {
          nome?: string;
          descricao?: string;
          cor?: string;
          ativa?: boolean;
        };
      };
      consignacoes: {
        Row: {
          id: number;
          vendedor_id: number;
          cliente_nome: string;
          cliente_telefone: string;
          data_consignacao: string;
          data_vencimento: string;
          valor_total: number;
          status: string;
          observacoes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          vendedor_id: number;
          cliente_nome: string;
          cliente_telefone?: string;
          data_consignacao: string;
          data_vencimento: string;
          valor_total?: number;
          status?: string;
          observacoes?: string;
        };
        Update: {
          vendedor_id?: number;
          cliente_nome?: string;
          cliente_telefone?: string;
          data_consignacao?: string;
          data_vencimento?: string;
          valor_total?: number;
          status?: string;
          observacoes?: string;
        };
      };
    };
  };
}