import React, { useState } from 'react';
import { Users, Package, FileText, BarChart3, Plus, Edit, Trash2, Eye, Save, X, Menu, Moon, Sun, LogOut, ScanLine, Hash } from 'lucide-react';

interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  valorCusto: number;
  codigoBarras: string;
}

interface NotaConsignacao {
  id: number;
  numeroVenda: string;
  vendedorId: number;
  quantidadeTotal: number;
  valorTotal: number;
  data: string;
  status: string;
}

const SistemaConsignacao = () => {
  // Estados para tema
  const [temaEscuro, setTemaEscuro] = useState(false);
  
  // Estados de autenticação
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [formLogin, setFormLogin] = useState({ login: '', senha: '' });

  // Estados para armazenar dados
  const [vendedores, setVendedores] = useState<Vendedor[]>([
    { 
      id: 1, 
      nome: 'João Silva', 
      email: 'joao@email.com', 
      telefone: '(11) 99999-9999', 
      status: 'Ativo',
      login: 'joao123',
      senha: '123456'
    }
  ]);
  
  const [produtos, setProdutos] = useState<Produto[]>([
    { 
      id: 1, 
      nome: 'Produto Exemplo', 
      descricao: 'Descrição do produto exemplo', 
      valorCusto: 50.00,
      codigoBarras: '7891234567890'
    }
  ]);
  
  const [notasConsignacao, setNotasConsignacao] = useState<NotaConsignacao[]>([
    { 
      id: 1, 
      numeroVenda: 'V001', 
      vendedorId: 1, 
      quantidadeTotal: 5,
      valorTotal: 250.00, 
      data: '2025-06-10',
      status: 'Pendente'
    }
  ]);

  // Estados de controle
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState('');
  const [itemEditando, setItemEditando] = useState<any>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  // Estados dos formulários
  const [formVendedor, setFormVendedor] = useState({ 
    nome: '', 
    email: '', 
    telefone: '', 
    status: 'Ativo',
    login: '',
    senha: ''
  });

  // Funções auxiliares
  const gerarId = (array: any[]) => Math.max(...array.map(item => item.id), 0) + 1;

  // Classes de tema
  const temaClasses = {
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: temaEscuro ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    menuAtivo: temaEscuro ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300' : 'bg-blue-50 border-r-2 border-blue-600 text-blue-700',
    tabela: temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
  };

  const getNomeVendedor = (id: number) => {
    const vendedor = vendedores.find(v => v.id === parseInt(id.toString()));
    return vendedor ? vendedor.nome : 'N/A';
  };

  // Função de login
  const fazerLogin = () => {
    if (formLogin.login === 'admin' && formLogin.senha === 'admin123') {
      setUsuarioLogado({ id: 0, nome: 'Administrador', login: 'admin' });
      setTipoUsuario('admin');
      setTelaAtiva('dashboard');
      return;
    }

    const vendedor = vendedores.find(v => 
      v.login === formLogin.login && 
      v.senha === formLogin.senha && 
      v.status === 'Ativo'
    );

    if (vendedor) {
      setUsuarioLogado(vendedor);
      setTipoUsuario('vendedor');
      setTelaAtiva('conferencia');
    } else {
      alert('Login ou senha inválidos!');
    }
  };

  const fazerLogout = () => {
    setUsuarioLogado(null);
    setTipoUsuario(null);
    setFormLogin({ login: '', senha: '' });
    setTelaAtiva('dashboard');
  };

  // Funções CRUD para Vendedores
  const salvarVendedor = () => {
    if (itemEditando) {
      setVendedores(vendedores.map(v => v.id === itemEditando.id ? { ...formVendedor, id: itemEditando.id } as Vendedor : v));
    } else {
      setVendedores([...vendedores, { ...formVendedor, id: gerarId(vendedores) } as Vendedor]);
    }
    fecharModal();
  };

  const editarVendedor = (vendedor: Vendedor) => {
    setFormVendedor(vendedor);
    setItemEditando(vendedor);
    setTipoModal('vendedor');
    setModalAberto(true);
  };

  const excluirVendedor = (id: number) => {
    setVendedores(vendedores.filter(v => v.id !== id));
  };

  // Funções de Modal
  const abrirModal = (tipo: string) => {
    setTipoModal(tipo);
    setItemEditando(null);
    if (tipo === 'vendedor') setFormVendedor({ 
      nome: '', 
      email: '', 
      telefone: '', 
      status: 'Ativo',
      login: '',
      senha: ''
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoModal('');
    setItemEditando(null);
  };

  // Tela de Login
  if (!usuarioLogado) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${temaClasses.fundo}`}>
        <div className={`max-w-md w-full space-y-8 p-8 ${temaClasses.papel} rounded-lg shadow-lg`}>
          <div>
            <h2 className={`text-center text-3xl font-extrabold ${temaClasses.texto}`}>
              Sistema Consignação
            </h2>
            <p className={`mt-2 text-center text-sm ${temaClasses.textoSecundario}`}>
              Faça login para acessar o sistema
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${temaClasses.texto}`}>
                Login
              </label>
              <input
                type="text"
                value={formLogin.login}
                onChange={(e) => setFormLogin({ ...formLogin, login: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${temaClasses.input}`}
                placeholder="Digite seu login"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${temaClasses.texto}`}>
                Senha
              </label>
              <input
                type="password"
                value={formLogin.senha}
                onChange={(e) => setFormLogin({ ...formLogin, senha: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fazerLogin()}
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${temaClasses.input}`}
                placeholder="Digite sua senha"
              />
            </div>
            <button
              onClick={fazerLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Entrar
            </button>
            <div className="flex justify-center">
              <button
                onClick={() => setTemaEscuro(!temaEscuro)}
                className={`p-2 rounded-full ${temaClasses.hover}`}
              >
                {temaEscuro ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
            </div>
          </div>
          <div className={`text-xs ${temaClasses.textoSecundario} text-center space-y-1`}>
            <p><strong>Admin:</strong> login: admin | senha: admin123</p>
            <p><strong>Vendedor:</strong> login: joao123 | senha: 123456</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Simples
  const Dashboard = () => (
    <div className="p-6">
      <h2 className={`text-2xl font-bold mb-6 ${temaClasses.texto}`}>Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${temaClasses.papel} p-6 rounded-lg shadow-sm border ${temaClasses.borda}`}>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${temaClasses.textoSecundario}`}>Vendedores</p>
              <p className={`text-2xl font-bold ${temaClasses.texto}`}>{vendedores.length}</p>
            </div>
          </div>
        </div>
        <div className={`${temaClasses.papel} p-6 rounded-lg shadow-sm border ${temaClasses.borda}`}>
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${temaClasses.textoSecundario}`}>Produtos</p>
              <p className={`text-2xl font-bold ${temaClasses.texto}`}>{produtos.length}</p>
            </div>
          </div>
        </div>
        <div className={`${temaClasses.papel} p-6 rounded-lg shadow-sm border ${temaClasses.borda}`}>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${temaClasses.textoSecundario}`}>Notas Pendentes</p>
              <p className={`text-2xl font-bold ${temaClasses.texto}`}>{notasConsignacao.filter(n => n.status === 'Pendente').length}</p>
            </div>
          </div>
        </div>
        <div className={`${temaClasses.papel} p-6 rounded-lg shadow-sm border ${temaClasses.borda}`}>
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${temaClasses.textoSecundario}`}>Sistema Online</p>
              <p className={`text-2xl font-bold ${temaClasses.texto}`}>✅</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Tela de Vendedores
  const TelaVendedores = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${temaClasses.texto}`}>Vendedores</h2>
        <button
          onClick={() => abrirModal('vendedor')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Vendedor
        </button>
      </div>

      <div className={`${temaClasses.papel} rounded-lg shadow-sm border ${temaClasses.borda} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={temaClasses.tabela}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${temaClasses.textoSecundario} uppercase tracking-wider`}>Nome</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${temaClasses.textoSecundario} uppercase tracking-wider`}>Email</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${temaClasses.textoSecundario} uppercase tracking-wider`}>Telefone</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${temaClasses.textoSecundario} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${temaClasses.textoSecundario} uppercase tracking-wider`}>Ações</th>
            </tr>
          </thead>
          <tbody className={`${temaClasses.papel} divide-y ${temaClasses.borda}`}>
            {vendedores.map(vendedor => (
              <tr key={vendedor.id}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${temaClasses.texto}`}>{vendedor.nome}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${temaClasses.textoSecundario}`}>{vendedor.email}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${temaClasses.textoSecundario}`}>{vendedor.telefone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    vendedor.status === 'Ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vendedor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => editarVendedor(vendedor)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirVendedor(vendedor.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Modal Component
  const Modal = () => {
    if (!modalAberto) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
          <div className={`inline-block align-bottom ${temaEscuro ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className={`text-lg font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'} mb-4`}>
                {itemEditando ? 'Editar' : 'Novo'} Vendedor
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>Nome</label>
                  <input
                    type="text"
                    value={formVendedor.nome}
                    onChange={(e) => setFormVendedor({ ...formVendedor, nome: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${temaClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>Email</label>
                  <input
                    type="email"
                    value={formVendedor.email}
                    onChange={(e) => setFormVendedor({ ...formVendedor, email: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${temaClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>Telefone</label>
                  <input
                    type="text"
                    value={formVendedor.telefone}
                    onChange={(e) => setFormVendedor({ ...formVendedor, telefone: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${temaClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>Login</label>
                  <input
                    type="text"
                    value={formVendedor.login}
                    onChange={(e) => setFormVendedor({ ...formVendedor, login: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${temaClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>Senha</label>
                  <input
                    type="password"
                    value={formVendedor.senha}
                    onChange={(e) => setFormVendedor({ ...formVendedor, senha: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${temaClasses.input}`}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={fecharModal}
                    className={`px-4 py-2 ${temaEscuro ? 'text-white' : 'text-gray-900'} border ${temaEscuro ? 'border-gray-700' : 'border-gray-200'} rounded-md ${temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="mr-2 h-4 w-4 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={salvarVendedor}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="mr-2 h-4 w-4 inline" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Menu Lateral
  const MenuLateral = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 ${temaClasses.papel} shadow-lg transform ${menuAberto ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-center h-16 bg-blue-600">
        <h1 className="text-white text-xl font-bold">Sistema Consignação</h1>
      </div>
      <div className={`flex items-center justify-between p-4 border-b ${temaClasses.borda}`}>
        <div>
          <p className={`text-sm font-medium ${temaClasses.texto}`}>{usuarioLogado.nome}</p>
          <p className={`text-xs ${temaClasses.textoSecundario}`}>
            {tipoUsuario === 'admin' ? 'Administrador' : 'Vendedor'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTemaEscuro(!temaEscuro)}
            className={`p-2 rounded-full ${temaClasses.hover}`}
          >
            {temaEscuro ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
          </button>
          <button
            onClick={fazerLogout}
            className={`p-2 rounded-full ${temaClasses.hover} text-red-600`}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      <nav className="mt-5">
        <button
          onClick={() => { setTelaAtiva('dashboard'); setMenuAberto(false); }}
          className={`w-full flex items-center px-4 py-2 ${temaClasses.texto} ${temaClasses.hover} ${telaAtiva === 'dashboard' ? temaClasses.menuAtivo : ''}`}
        >
          <BarChart3 className="mr-3 h-5 w-5" />
          Dashboard
        </button>
        <button
          onClick={() => { setTelaAtiva('vendedores'); setMenuAberto(false); }}
          className={`w-full flex items-center px-4 py-2 ${temaClasses.texto} ${temaClasses.hover} ${telaAtiva === 'vendedores' ? temaClasses.menuAtivo : ''}`}
        >
          <Users className="mr-3 h-5 w-5" />
          Vendedores
        </button>
      </nav>
    </div>
  );

  const renderTela = () => {
    switch (telaAtiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'vendedores':
        return <TelaVendedores />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${temaClasses.fundo}`}>
      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <MenuLateral />

      <div className="lg:pl-64">
        <div className={`${temaClasses.papel} shadow-sm border-b ${temaClasses.borda} lg:hidden`}>
          <div className="px-4 py-3">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className={`${temaClasses.texto} hover:text-gray-900`}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <main className="min-h-screen">
          {renderTela()}
        </main>
      </div>

      <Modal />
    </div>
  );
};

export default SistemaConsignacao;