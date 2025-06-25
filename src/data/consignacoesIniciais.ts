// src/data/consignacoesIniciais.ts
import { Consignacao } from '../types/Consignacao';
import { VENDEDORES_INICIAIS } from './vendedoresIniciais';

export const CONSIGNACOES_INICIAIS: Consignacao[] = [
  {
    id: 1,
    clienteNome: 'João da Silva',
    clienteDocumento: '123.456.789-10',
    clienteTelefone: '(11) 98765-4321',
    tipoDocumento: 'cpf',
    vendedorId: 1,
    vendedor: VENDEDORES_INICIAIS[0],
    quantidadeTotal: 15,
    valorTotal: 2699.00,
    dataConsignacao: '2024-06-15',
    status: 'ativa',
    observacoes: 'Cliente preferencial, prazo estendido'
  },
  {
    id: 2,
    clienteNome: 'Maria Oliveira Comércio LTDA',
    clienteDocumento: '12.345.678/0001-90',
    clienteTelefone: '(11) 91234-5678',
    tipoDocumento: 'cnpj',
    vendedorId: 2,
    vendedor: VENDEDORES_INICIAIS[1],
    quantidadeTotal: 8,
    valorTotal: 1567.00,
    dataConsignacao: '2024-06-10',
    dataRetorno: '2024-06-16',
    status: 'finalizada',
    retorno: {
      quantidadeRetornada: 3,
      valorRetornado: 890.00,
      quantidadeVendida: 5,
      valorDevido: 677.00
    }
  },
  {
    id: 3,
    clienteNome: 'Comércio ABC EIRELI',
    clienteDocumento: '98.765.432/0001-11',
    clienteTelefone: '(11) 97777-8888',
    tipoDocumento: 'cnpj',
    vendedorId: 1,
    vendedor: VENDEDORES_INICIAIS[0],
    quantidadeTotal: 25,
    valorTotal: 4850.00,
    dataConsignacao: '2024-06-12',
    status: 'ativa',
    observacoes: 'Loja no centro da cidade'
  }
];