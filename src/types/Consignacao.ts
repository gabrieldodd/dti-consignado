// src/types/Consignacao.ts
import { TipoDocumento, StatusConsignacao } from './Common';
import { Vendedor } from './Vendedor';

export interface Consignacao {
  id: number;
  cliente_nome?: string; // snake_case para Supabase
  clienteNome?: string; // camelCase para compatibilidade
  cliente_documento?: string; // snake_case para Supabase
  clienteDocumento?: string; // camelCase para compatibilidade
  cliente_telefone?: string; // snake_case para Supabase
  clienteTelefone?: string; // camelCase para compatibilidade
  tipo_documento?: TipoDocumento; // snake_case para Supabase
  tipoDocumento?: TipoDocumento; // camelCase para compatibilidade
  vendedor_id?: number; // snake_case para Supabase
  vendedorId?: number; // camelCase para compatibilidade
  vendedor?: Vendedor;
  quantidade_total?: number; // snake_case para Supabase
  quantidadeTotal?: number; // camelCase para compatibilidade
  valor_total?: number; // snake_case para Supabase
  valorTotal?: number; // camelCase para compatibilidade
  data_consignacao?: string; // snake_case para Supabase
  dataConsignacao?: string; // camelCase para compatibilidade
  data_retorno?: string; // snake_case para Supabase
  dataRetorno?: string; // camelCase para compatibilidade
  status: StatusConsignacao;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  retorno?: {
    quantidade_retornada?: number;
    quantidadeRetornada?: number;
    valor_retornado?: number;
    valorRetornado?: number;
    quantidade_vendida?: number;
    quantidadeVendida?: number;
    valor_devido?: number;
    valorDevido?: number;
  };
}

export interface ConsignacaoForm {
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: TipoDocumento;
  vendedorId: number;
  observacoes: string;
}

export interface ConsignacaoFormErrors {
  clienteNome?: string;
  clienteDocumento?: string;
  clienteTelefone?: string;
  vendedorId?: string;
  produtos?: string;
}