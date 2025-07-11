// src/types/Categoria.ts

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
  data_cadastro?: string; // snake_case para Supabase
  dataCadastro?: string; // camelCase para compatibilidade
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaForm {
  nome: string;
  descricao: string;
  cor: string;
}

export interface CategoriaFormErrors {
  nome?: string;
  descricao?: string;
  cor?: string;
}