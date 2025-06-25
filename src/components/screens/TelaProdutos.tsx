// src/components/screens/TelaProdutos.tsx
import React from 'react';
import { Package, Plus } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useFormatters } from '../../hooks/useFormatters';

export const TelaProdutos: React.FC = () => {
  const { tema, produtos } = useAppContext();
  const { formatarMoedaBR, formatarData } = useFormatters();

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${tema.texto}`}>
              Produtos
            </h1>
            <p className={`mt-2 ${tema.textoSecundario}`}>
              Gerencie o catálogo de produtos
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
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
                    Categoria
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Valor Venda
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>
                    Estoque
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
                {produtos.map((produto) => (
                  <tr key={produto.id} className={tema.hover}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      <div>
                        <div className="font-medium">{produto.nome}</div>
                        <div className={`text-xs ${tema.textoSecundario}`}>
                          {produto.codigoBarras}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {produto.categoria}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {formatarMoedaBR(produto.valorVenda)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      <div className="flex items-center">
                        <span className={produto.estoque <= produto.estoqueMinimo ? 'text-red-600 font-semibold' : ''}>
                          {produto.estoque}
                        </span>
                        <span className={`ml-2 text-xs ${tema.textoSecundario}`}>
                          (min: {produto.estoqueMinimo})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        produto.ativo 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                      {formatarData(produto.dataCadastro)}
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