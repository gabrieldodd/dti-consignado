// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// URLs e chaves do Supabase (substitua pelos seus valores reais)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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