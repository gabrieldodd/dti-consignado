// src/types/Consignacao.ts
import { TipoDocumento, StatusConsignacao } from './Common';
import { Vendedor } from './Vendedor';

export interface ConsignacaoRetorno {
  quantidadeRetornada: number;
  valorRetornado: number;
  quantidadeVendida: number;
  valorDevido: number;
}

export interface Consignacao {
  id: number;
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: TipoDocumento;
  vendedorId: number;
  vendedor: Vendedor;
  quantidadeTotal: number;
  valorTotal: number;
  dataConsignacao: string;
  dataRetorno?: string;
  status: StatusConsignacao;
  observacoes?: string;
  retorno?: ConsignacaoRetorno;
}

export interface ConsignacaoForm {
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: TipoDocumento;
  vendedorId: string;
  quantidadeTotal: string;
  valorTotal: string;
  observacoes: string;
}

export interface ConsignacaoFormErrors {
  clienteNome?: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  vendedorId?: string;
  quantidadeTotal?: string;
  valorTotal?: string;
}

export interface RetornoForm {
  quantidadeRetornada: number;
  valorRetornado: number;
}