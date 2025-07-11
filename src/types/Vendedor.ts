// src/types/Vendedor.ts
import { StatusVendedor } from './Common';

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: StatusVendedor | string; // Permitir string para compatibilidade
  login: string;
  senha: string;
  data_cadastro?: string; // snake_case para Supabase
  dataCadastro?: string; // camelCase para compatibilidade
  created_at?: string;
  updated_at?: string;
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