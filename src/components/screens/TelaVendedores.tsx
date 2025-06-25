// src/components/screens/TelaVendedores.tsx
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';

export const TelaVendedores: React.FC = () => {
  const { tema, vendedores } = useAppContext();
  const { formatarData } = useFormatters();

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>
              Vendedores
            </h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie os vendedores do sistema
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Novo Vendedor
          </button>
        </div>

        <div className={`${tema.papel} ${tema.borda} border rounded-lg shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${tema.fundo}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Nome
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Telefone
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Login
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Data Cadastro
                  </th>
                </tr>
              </thead>
              <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
                {vendedores.map((vendedor) => (
                  <tr key={vendedor.id} className={tema.hover}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {vendedor.nome}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {vendedor.email}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {vendedor.telefone}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {vendedor.login}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vendedor.status === 'Ativo' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vendedor.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {formatarData(vendedor.dataCadastro)}
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