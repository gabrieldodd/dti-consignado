import React, { useState } from 'react';
import { Users, Package, FileText, BarChart3, Plus, Edit, Trash2, Eye, Save, X, Menu, Moon, Sun, LogOut } from 'lucide-react';

interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
}

const App = () => {
  // Estados principais
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [formLogin, setFormLogin] = useState({ login: '', senha: '' });
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);

  // Estados de dados
  const [vendedores, setVendedores] = useState<Vendedor[]>([
    { 
      id: 1, 
      nome: 'João Silva', 
      email: 'joao@email.com', 
      telefone: '(11) 99999-9999', 
      status: 'Ativo',
      login: 'joao123',
      senha: '123456'
    },
    { 
      id: 2, 
      nome: 'Maria Santos', 
      email: 'maria@email.com', 
      telefone: '(11) 88888-8888', 
      status: 'Ativo',
      login: 'maria123',
      senha: '654321'
    }
  ]);

  // Estados do modal
  const [modalAberto, setModalAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [formVendedor, setFormVendedor] = useState({
    nome: '',
    email: '',
    telefone: '',
    status: 'Ativo',
    login: '',
    senha: ''
  });

  // Classes de tema
  const tema = {
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: temaEscuro ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    menuAtivo: temaEscuro ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300' : 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
  };

  // Função de login
  const fazerLogin = () => {
    if (formLogin.login === 'admin' && formLogin.senha === 'admin123') {
      setUsuarioLogado({ id: 0, nome: 'Administrador', login: 'admin' });
      setTipoUsuario('admin');
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

  // Funções do vendedor
  const abrirModalVendedor = (vendedor?: Vendedor) => {
    if (vendedor) {
      setVendedorEditando(vendedor);
      setFormVendedor(vendedor);
    } else {
      setVendedorEditando(null);
      setFormVendedor({
        nome: '',
        email: '',
        telefone: '',
        status: 'Ativo',
        login: '',
        senha: ''
      });
    }
    setModalAberto(true);
  };

  const salvarVendedor = () => {
    if (vendedorEditando) {
      // Editar
      setVendedores(vendedores.map(v => 
        v.id === vendedorEditando.id 
          ? { ...formVendedor, id: vendedorEditando.id } 
          : v
      ));
    } else {
      // Novo
      const novoId = Math.max(...vendedores.map(v => v.id)) + 1;
      setVendedores([...vendedores, { ...formVendedor, id: novoId }]);
    }
    setModalAberto(false);
  };

  const excluirVendedor = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este vendedor?')) {
      setVendedores(vendedores.filter(v => v.id !== id));
    }
  };

  // Tela de Login
  if (!usuarioLogado) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tema.fundo}`}>
        <div className={`max-w-md w-full space-y-8 p-8 ${tema.papel} rounded-lg shadow-lg border ${tema.borda}`}>
          <div className="text-center">
            <h2 className={`text-3xl font-extrabold ${tema.texto}`}>
              Sistema Consignação
            </h2>
            <p className={`mt-2 text-sm ${tema.textoSecundario}`}>
              Faça login para acessar o sistema
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${tema.texto}`}>Login</label>
              <input
                type="text"
                value={formLogin.login}
                onChange={(e) => setFormLogin({ ...formLogin, login: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                placeholder="Digite seu login"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${tema.texto}`}>Senha</label>
              <input
                type="password"
                value={formLogin.senha}
                onChange={(e) => setFormLogin({ ...formLogin, senha: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && fazerLogin()}
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
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
                className={`p-2 rounded-full ${tema.hover}`}
              >
                {temaEscuro ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
            </div>
          </div>
          
          <div className={`text-xs ${tema.textoSecundario} text-center space-y-1`}>
            <p><strong>Admin:</strong> login: admin | senha: admin123</p>
            <p><strong>Vendedor:</strong> login: joao123 | senha: 123456</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  const Dashboard = () => (
    <div className="p-6">
      <h2 className={`text-2xl font-bold mb-6 ${tema.texto}`}>Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Vendedores</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>{vendedores.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Produtos</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>25</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Notas Pendentes</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>12</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Status</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>✅</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-8 ${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6`}>
        <h3 className={`text-lg font-medium mb-4 ${tema.texto}`}>Bem-vindo ao Sistema!</h3>
        <p className={tema.textoSecundario}>
          Sistema de consignação funcionando perfeitamente. Use o menu lateral para navegar entre as funcionalidades.
        </p>
      </div>
    </div>
  );

  // Tela de Vendedores
  const TelaVendedores = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Vendedores</h2>
        <button
          onClick={() => abrirModalVendedor()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Vendedor
        </button>
      </div>

      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={temaEscuro ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Nome</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Email</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Telefone</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Ações</th>
            </tr>
          </thead>
          <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
            {vendedores.map(vendedor => (
              <tr key={vendedor.id}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${tema.texto}`}>
                  {vendedor.nome}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                  {vendedor.email}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                  {vendedor.telefone}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => abrirModalVendedor(vendedor)}
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

  // Modal de Vendedor
  const ModalVendedor = () => {
    if (!modalAberto) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalAberto(false)}></div>
          
          <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Nome</label>
                  <input
                    type="text"
                    value={formVendedor.nome}
                    onChange={(e) => setFormVendedor({ ...formVendedor, nome: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Email</label>
                  <input
                    type="email"
                    value={formVendedor.email}
                    onChange={(e) => setFormVendedor({ ...formVendedor, email: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Telefone</label>
                  <input
                    type="text"
                    value={formVendedor.telefone}
                    onChange={(e) => setFormVendedor({ ...formVendedor, telefone: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Login</label>
                  <input
                    type="text"
                    value={formVendedor.login}
                    onChange={(e) => setFormVendedor({ ...formVendedor, login: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Senha</label>
                  <input
                    type="password"
                    value={formVendedor.senha}
                    onChange={(e) => setFormVendedor({ ...formVendedor, senha: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Status</label>
                  <select
                    value={formVendedor.status}
                    onChange={(e) => setFormVendedor({ ...formVendedor, status: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setModalAberto(false)}
                  className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
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
    );
  };

  // Menu Lateral
  const MenuLateral = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 ${tema.papel} shadow-lg transform ${menuAberto ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r ${tema.borda}`}>
      <div className="flex items-center justify-center h-16 bg-blue-600">
        <h1 className="text-white text-xl font-bold">Sistema Consignação</h1>
      </div>
      
      <div className={`flex items-center justify-between p-4 border-b ${tema.borda}`}>
        <div>
          <p className={`text-sm font-medium ${tema.texto}`}>{usuarioLogado.nome}</p>
          <p className={`text-xs ${tema.textoSecundario}`}>
            {tipoUsuario === 'admin' ? 'Administrador' : 'Vendedor'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTemaEscuro(!temaEscuro)}
            className={`p-2 rounded-full ${tema.hover}`}
          >
            {temaEscuro ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
          </button>
          <button
            onClick={fazerLogout}
            className={`p-2 rounded-full ${tema.hover} text-red-600`}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <nav className="mt-5">
        <button
          onClick={() => { setTelaAtiva('dashboard'); setMenuAberto(false); }}
          className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'dashboard' ? tema.menuAtivo : ''}`}
        >
          <BarChart3 className="mr-3 h-5 w-5" />
          Dashboard
        </button>
        
        {tipoUsuario === 'admin' && (
          <button
            onClick={() => { setTelaAtiva('vendedores'); setMenuAberto(false); }}
            className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'vendedores' ? tema.menuAtivo : ''}`}
          >
            <Users className="mr-3 h-5 w-5" />
            Vendedores
          </button>
        )}
      </nav>
    </div>
  );

  const renderTela = () => {
    switch (telaAtiva) {
      case 'vendedores':
        return <TelaVendedores />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${tema.fundo}`}>
      {/* Backdrop para mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Menu Lateral */}
      <MenuLateral />

      {/* Conteúdo Principal */}
      <div className="lg:pl-64">
        {/* Header Mobile */}
        <div className={`${tema.papel} shadow-sm border-b ${tema.borda} lg:hidden`}>
          <div className="px-4 py-3">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className={`${tema.texto}`}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <main className="min-h-screen">
          {renderTela()}
        </main>
      </div>

      {/* Modal */}
      <ModalVendedor />
    </div>
  );
};

export default App;