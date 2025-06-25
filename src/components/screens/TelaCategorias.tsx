// src/components/screens/TelaCategorias.tsx
import React from 'react';
import { Tags, Plus } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';

export const TelaCategorias: React.FC = () => {
  const { tema, categorias } = useAppContext();
  const { formatarData } = useFormatters();

  const getCorClasse = (cor: string) => {
    const coresMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
      pink: 'bg-pink-100 text-pink-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return coresMap[cor] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>
              Categorias
            </h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie as categorias de produtos
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
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
                    Descrição
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Cor
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
                {categorias.map((categoria) => (
                  <tr key={categoria.id} className={tema.hover}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${tema.texto}`}>
                      {categoria.nome}
                    </td>
                    <td className={`px-6 py-4 text-sm ${tema.texto}`}>
                      {categoria.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCorClasse(categoria.cor)}`}>
                        {categoria.cor}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        categoria.ativa 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {categoria.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {formatarData(categoria.dataCadastro)}
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