// src/types/Produto.ts

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  codigo_barras?: string; // snake_case para Supabase
  codigoBarras?: string; // camelCase para compatibilidade
  categoria: string;
  valor_custo?: number; // snake_case para Supabase
  valorCusto?: number; // camelCase para compatibilidade
  valor_venda: number; // snake_case para Supabase
  valorVenda?: number; // camelCase para compatibilidade
  estoque: number;
  estoque_minimo?: number; // snake_case para Supabase
  estoqueMinimo?: number; // camelCase para compatibilidade
  ativo: boolean;
  data_cadastro?: string; // snake_case para Supabase
  dataCadastro?: string; // camelCase para compatibilidade
  created_at?: string;
  updated_at?: string;
}

export interface ProdutoForm {
  nome: string;
  descricao: string;
  codigoBarras: string;
  categoria: string;
  valorCusto: string;
  valorVenda: string;
  estoque: string;
  estoqueMinimo: string;
}

export interface ProdutoFormErrors {
  nome?: string;
  descricao?: string;
  codigoBarras?: string;
  categoria?: string;
  valorCusto?: string;
  valorVenda?: string;
  estoque?: string;
  estoqueMinimo?: string;
}