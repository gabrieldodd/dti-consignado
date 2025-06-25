// src/components/screens/TelaConsignacoes.tsx
import React from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';

export const TelaConsignacoes: React.FC = () => {
  const { tema, consignacoes } = useAppContext();
  const { formatarMoedaBR, formatarData } = useFormatters();

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>
              Consignações
            </h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie as consignações de produtos
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nova Consignação
          </button>
        </div>

        <div className={`${tema.papel} ${tema.borda} border rounded-lg shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${tema.fundo}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Cliente
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Vendedor
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Quantidade
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Valor Total
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Data
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                {consignacoes.map((consignacao) => (
                  <tr key={consignacao.id} className={tema.hover}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {consignacao.clienteNome}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {consignacao.vendedor.nome}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {consignacao.quantidadeTotal}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {formatarMoedaBR(consignacao.valorTotal)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {formatarData(consignacao.dataConsignacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consignacao.status === 'ativa' 
                          ? 'bg-green-100 text-green-800'
                          : consignacao.status === 'finalizada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consignacao.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};