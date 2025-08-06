// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Configuração para Vite (usa import.meta.env ao invés de process.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!');
  console.error('Crie um arquivo .env com:');
  console.error('VITE_SUPABASE_URL=sua_url_aqui');
  console.error('VITE_SUPABASE_ANON_KEY=sua_chave_aqui');
  
  throw new Error('Supabase não configurado. Verifique o arquivo .env');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log de sucesso
console.log('✅ Supabase configurado com sucesso!');
console.log('📍 URL:', supabaseUrl);

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
    return false;
  }
};

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
          descricao: string;
          cor: string;
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
          cliente_nome: string;
          cliente_documento: string;
          cliente_telefone: string;
          tipo_documento: 'cpf' | 'cnpj';
          vendedor_id: number;
          quantidade_total: number;
          valor_total: number;
          data_consignacao: string;
          data_retorno: string | null;
          status: 'ativa' | 'finalizada' | 'cancelada';
          observacoes: string | null;
          retorno: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          cliente_nome: string;
          cliente_documento: string;
          cliente_telefone: string;
          tipo_documento: 'cpf' | 'cnpj';
          vendedor_id: number;
          quantidade_total: number;
          valor_total: number;
          data_consignacao?: string;
          status?: 'ativa' | 'finalizada' | 'cancelada';
          observacoes?: string;
        };
        Update: {
          cliente_nome?: string;
          cliente_documento?: string;
          cliente_telefone?: string;
          tipo_documento?: 'cpf' | 'cnpj';
          vendedor_id?: number;
          quantidade_total?: number;
          valor_total?: number;
          data_retorno?: string;
          status?: 'ativa' | 'finalizada' | 'cancelada';
          observacoes?: string;
          retorno?: any;
        };
      };
    };
  };
}