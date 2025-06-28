// src/App.tsx
import React, { useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';

// Componente temporário simples para Login
const Login: React.FC<{ onLogin: (login: string, senha: string) => void }> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(login, senha);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Sistema de Consignação</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite seu login"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Admin: admin / admin123</p>
          <p>Vendedor: joao123 / 123456</p>
        </div>
      </div>
    </div>
  );
};

// Componente temporário simples para Dashboard
const Dashboard: React.FC = () => {
  const { tema, vendedores, produtos, consignacoes, usuarioLogado, tipoUsuario } = useAppContext();

  return (
    <div className={`p-6 ${tema.fundo} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${tema.texto}`}>
            Dashboard - Bem-vindo, {usuarioLogado?.nome || 'Usuário'}!
          </h1>
          <p className={`mt-2 ${tema.textoSecundario}`}>
            Tipo de usuário: {tipoUsuario}
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
            <h3 className={`text-lg font-semibold ${tema.texto}`}>Vendedores</h3>
            <p className="text-3xl font-bold text-blue-600">{vendedores.length}</p>
            <p className={`text-sm ${tema.textoSecundario}`}>Total cadastrados</p>
          </div>
          
          <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
            <h3 className={`text-lg font-semibold ${tema.texto}`}>Produtos</h3>
            <p className="text-3xl font-bold text-green-600">{produtos.length}</p>
            <p className={`text-sm ${tema.textoSecundario}`}>Total cadastrados</p>
          </div>
          
          <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
            <h3 className={`text-lg font-semibold ${tema.texto}`}>Consignações</h3>
            <p className="text-3xl font-bold text-purple-600">{consignacoes.length}</p>
            <p className={`text-sm ${tema.textoSecundario}`}>Total registradas</p>
          </div>
          
          <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
            <h3 className={`text-lg font-semibold ${tema.texto}`}>Consignações Ativas</h3>
            <p className="text-3xl font-bold text-orange-600">
              {consignacoes.filter(c => c.status === 'ativa').length}
            </p>
            <p className={`text-sm ${tema.textoSecundario}`}>Em andamento</p>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <h2 className={`text-xl font-semibold ${tema.texto} mb-4`}>Sistema de Consignação</h2>
          <p className={`${tema.textoSecundario} mb-4`}>
            Este é um sistema simplificado temporário. As funcionalidades completas serão implementadas gradualmente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className={`font-medium ${tema.texto} mb-2`}>Funcionalidades Disponíveis:</h3>
              <ul className={`text-sm ${tema.textoSecundario} space-y-1`}>
                <li>• Login de usuários</li>
                <li>• Dashboard com estatísticas básicas</li>
                <li>• Visualização de dados</li>
                <li>• Sistema de temas</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-medium ${tema.texto} mb-2`}>Próximas Implementações:</h3>
              <ul className={`text-sm ${tema.textoSecundario} space-y-1`}>
                <li>• Gestão completa de vendedores</li>
                <li>• Gestão completa de produtos</li>
                <li>• Gestão completa de consignações</li>
                <li>• Relatórios e filtros</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const { 
    usuarioLogado, 
    setUsuarioLogado,
    setTipoUsuario,
    vendedores,
    mostrarMensagem 
  } = useAppContext();

  // Função de login
  const fazerLogin = useCallback((login: string, senha: string) => {
    // Verificar admin
    if (login === 'admin' && senha === 'admin123') {
      setUsuarioLogado({ id: 0, nome: 'Administrador', login: 'admin' });
      setTipoUsuario('admin');
      mostrarMensagem('success', 'Login realizado com sucesso!');
      return;
    }

    // Verificar vendedores
    const vendedor = vendedores.find(v => 
      v.login === login && 
      v.senha === senha && 
      v.status === 'Ativo'
    );

    if (vendedor) {
      setUsuarioLogado(vendedor);
      setTipoUsuario('vendedor');
      mostrarMensagem('success', 'Login realizado com sucesso!');
    } else {
      mostrarMensagem('error', 'Login ou senha inválidos!');
    }
  }, [vendedores, setUsuarioLogado, setTipoUsuario, mostrarMensagem]);

  // Se não está logado, mostrar tela de login
  if (!usuarioLogado) {
    return <Login onLogin={fazerLogin} />;
  }

  // Renderizar dashboard
  return <Dashboard />;
};

// Componente App com Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;