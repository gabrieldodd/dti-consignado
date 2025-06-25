// src/types/Categoria.ts

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
  dataCadastro: string;
}

export interface CategoriaForm {
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
}

export interface CategoriaFormErrors {
  nome?: string;
  descricao?: string;
  cor?: string;
}