// src/types/Consignacao.ts
import { TipoDocumento, StatusConsignacao } from './Common';
import { Vendedor } from './Vendedor';

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
  retorno?: {
    quantidadeRetornada: number;
    valorRetornado: number;
    quantidadeVendida: number;
    valorDevido: number;
  };
}