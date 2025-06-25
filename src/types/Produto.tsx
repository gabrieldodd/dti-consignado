// src/types/Produto.ts

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  codigoBarras: string;
  categoria: string;
  valorCusto: number;
  valorVenda: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataCadastro: string;
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
  ativo: boolean;
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

export interface ProdutoLido {
  produto: Produto;
  quantidade: number;
}