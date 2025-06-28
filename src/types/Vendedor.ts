// src/types/Vendedor.ts

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string; // Mudando de Status para string para compatibilidade
  login: string;
  senha: string;
  dataCadastro: string;
}

export interface VendedorForm {
  nome: string;
  email: string;
  telefone: string;
  login: string;
  senha: string;
  confirmarSenha: string;
  status: string;
}

export interface VendedorFormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  login?: string;
  senha?: string;
  confirmarSenha?: string;
}