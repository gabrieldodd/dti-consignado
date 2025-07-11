// src/data/produtosIniciais.ts
import { Produto } from '../types/Produto';

export const PRODUTOS_INICIAIS: Produto[] = [
  {
    id: 1,
    nome: 'Smartphone Samsung Galaxy A54',
    descricao: 'Smartphone com 128GB, câmera tripla 50MP + 12MP + 5MP, tela 6.4"',
    codigoBarras: '7891234567890',
    categoria: 'Eletrônicos',
    valorCusto: 800.00,
    valor_venda: 1200.00,
    estoque: 25,
    estoqueMinimo: 5,
    ativo: true,
    dataCadastro: '2024-01-10'
  },
  {
    id: 2,
    nome: 'Fone de Ouvido Bluetooth JBL',
    descricao: 'Fone sem fio com cancelamento de ruído, autonomia 30h',
    codigoBarras: '7891234567891',
    categoria: 'Acessórios',
    valorCusto: 150.00,
    valor_venda: 299.00,
    estoque: 12,
    estoqueMinimo: 3,
    ativo: true,
    dataCadastro: '2024-01-12'
  },
  {
    id: 3,
    nome: 'Carregador Portátil 10000mAh',
    descricao: 'Power bank com entrada USB-C e saída rápida',
    codigoBarras: '7891234567892',
    categoria: 'Acessórios',
    valorCusto: 45.00,
    valor_venda: 89.00,
    estoque: 2,
    estoqueMinimo: 5,
    ativo: true,
    dataCadastro: '2024-01-15'
  },
  {
    id: 4,
    nome: 'Cabo USB-C para Lightning',
    descricao: 'Cabo certificado MFi, 1 metro, carregamento rápido',
    codigoBarras: '7891234567893',
    categoria: 'Cabos',
    valorCusto: 25.00,
    valor_venda: 59.00,
    estoque: 50,
    estoqueMinimo: 10,
    ativo: false,
    dataCadastro: '2024-01-20'
  }
];