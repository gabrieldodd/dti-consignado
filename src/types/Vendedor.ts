// src/types/Vendedor.ts
import { Status } from './Common';

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: Status;
  login: string;
  senha: string;
  dataCadastro: string;
}

export interface VendedorForm {
  nome: string;
  email: string;
  telefone: string;
  status: Status;
  login: string;
  senha: string;
}

export interface VendedorFormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  login?: string;
  senha?: string;
}