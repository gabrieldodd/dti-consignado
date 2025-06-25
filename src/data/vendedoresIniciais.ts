// src/data/vendedoresIniciais.ts
import { Vendedor } from '../types/Vendedor';

export const VENDEDORES_INICIAIS: Vendedor[] = [
  { 
    id: 1, 
    nome: 'João Silva', 
    email: 'joao@email.com', 
    telefone: '(11) 99999-9999', 
    status: 'Ativo',
    login: 'joao123',
    senha: '123456',
    dataCadastro: '2024-01-15'
  },
  { 
    id: 2, 
    nome: 'Maria Santos', 
    email: 'maria@email.com', 
    telefone: '(11) 88888-8888', 
    status: 'Ativo',
    login: 'maria123',
    senha: '654321',
    dataCadastro: '2024-02-20'
  },
  { 
    id: 3, 
    nome: 'Pedro Costa', 
    email: 'pedro@email.com', 
    telefone: '(11) 77777-7777', 
    status: 'Inativo',
    login: 'pedro123',
    senha: '789456',
    dataCadastro: '2024-03-10'
  }
];