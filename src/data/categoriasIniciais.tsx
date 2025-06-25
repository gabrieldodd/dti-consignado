// src/data/categoriasIniciais.ts
import { Categoria } from '../types/Categoria';

export const CATEGORIAS_INICIAIS: Categoria[] = [
  {
    id: 1,
    nome: 'Eletrônicos',
    descricao: 'Dispositivos eletrônicos e smartphones',
    cor: 'blue',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 2,
    nome: 'Acessórios',
    descricao: 'Acessórios para dispositivos móveis',
    cor: 'green',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 3,
    nome: 'Cabos',
    descricao: 'Cabos e conectores diversos',
    cor: 'yellow',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 4,
    nome: 'Cases',
    descricao: 'Capas e cases protetores',
    cor: 'purple',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 5,
    nome: 'Carregadores',
    descricao: 'Carregadores e fontes de alimentação',
    cor: 'red',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 6,
    nome: 'Outros',
    descricao: 'Produtos diversos',
    cor: 'gray',
    ativa: false,
    dataCadastro: '2024-01-01'
  }
];