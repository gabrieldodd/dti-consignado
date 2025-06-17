import React, { useState, useCallback, useMemo, createContext, useContext, memo, useEffect } from 'react';
import { Users, Package, FileText, BarChart3, Plus, Edit, Trash2, Eye, Save, X, Menu, Moon, Sun, LogOut, Search, AlertCircle, CheckCircle, Package2, DollarSign, Hash, Tag, QrCode, ShoppingCart, ClipboardList, Calculator, Clock, TrendingUp, TrendingDown } from 'lucide-react';

// Interfaces
interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  login: string;
  senha: string;
  dataCadastro: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  codigoBarras: string;
  categoria: string;
  valorCusto: number;
  valorVenda: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  dataCadastro: string;
}

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativa: boolean;
  dataCadastro: string;
}

interface Consignacao {
  id: number;
  clienteNome: string;
  clienteDocumento: string;
  clienteTelefone: string;
  tipoDocumento: 'cpf' | 'cnpj';
  vendedorId: number;
  vendedor: Vendedor;
  quantidadeTotal: number;
  valorTotal: number;
  dataConsignacao: string;
  dataRetorno?: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  observacoes?: string;
  retorno?: {
    quantidadeRetornada: number;
    valorRetornado: number;
    quantidadeVendida: number;
    valorDevido: number;
  };
}

interface AppContextType {
  temaEscuro: boolean;
  setTemaEscuro: (tema: boolean) => void;
  usuarioLogado: any;
  tipoUsuario: string | null;
  tema: any;
  vendedores: Vendedor[];
  produtos: Produto[];
  categorias: Categoria[];
  consignacoes: Consignacao[];
  setVendedores: React.Dispatch<React.SetStateAction<Vendedor[]>>;
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
  setConsignacoes: React.Dispatch<React.SetStateAction<Consignacao[]>>;
  mostrarMensagem: (tipo: 'success' | 'error', texto: string) => void;
}

// Context
const AppContext = createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext deve ser usado dentro do AppProvider');
  return context;
};

// Dados iniciais
const VENDEDORES_INICIAIS: Vendedor[] = [
  { 
    id: 1, 
    nome: 'João Silva', 
    email: 'joao@email.com', 
    telefone: '(11) 99999-9999', 
    status: 'Ativo',
    login: 'joao123',
    senha: '123456',
    dataCadastro: '2024-01-15'
  },
  { 
    id: 2, 
    nome: 'Maria Santos', 
    email: 'maria@email.com', 
    telefone: '(11) 88888-8888', 
    status: 'Ativo',
    login: 'maria123',
    senha: '654321',
    dataCadastro: '2024-02-20'
  },
  { 
    id: 3, 
    nome: 'Pedro Costa', 
    email: 'pedro@email.com', 
    telefone: '(11) 77777-7777', 
    status: 'Inativo',
    login: 'pedro123',
    senha: '789456',
    dataCadastro: '2024-03-10'
  }
];

const PRODUTOS_INICIAIS: Produto[] = [
  {
    id: 1,
    nome: 'Smartphone Samsung Galaxy A54',
    descricao: 'Smartphone com 128GB, câmera tripla 50MP + 12MP + 5MP, tela 6.4"',
    codigoBarras: '7891234567890',
    categoria: 'Eletrônicos',
    valorCusto: 800.00,
    valorVenda: 1200.00,
    estoque: 25,
    estoqueMinimo: 5,
    ativo: true,
    dataCadastro: '2024-01-10'
  },
  {
    id: 2,
    nome: 'Fone de Ouvido Bluetooth JBL',
    descricao: 'Fone sem fio com cancelamento de ruído, autonomia 30h',
    codigoBarras: '7891234567891',
    categoria: 'Acessórios',
    valorCusto: 150.00,
    valorVenda: 299.00,
    estoque: 12,
    estoqueMinimo: 3,
    ativo: true,
    dataCadastro: '2024-01-12'
  },
  {
    id: 3,
    nome: 'Carregador Portátil 10000mAh',
    descricao: 'Power bank com entrada USB-C e saída rápida',
    codigoBarras: '7891234567892',
    categoria: 'Acessórios',
    valorCusto: 45.00,
    valorVenda: 89.00,
    estoque: 2,
    estoqueMinimo: 5,
    ativo: true,
    dataCadastro: '2024-01-15'
  },
  {
    id: 4,
    nome: 'Cabo USB-C para Lightning',
    descricao: 'Cabo certificado MFi, 1 metro, carregamento rápido',
    codigoBarras: '7891234567893',
    categoria: 'Cabos',
    valorCusto: 25.00,
    valorVenda: 59.00,
    estoque: 50,
    estoqueMinimo: 10,
    ativo: false,
    dataCadastro: '2024-01-20'
  }
];

const CATEGORIAS_INICIAIS: Categoria[] = [
  {
    id: 1,
    nome: 'Eletrônicos',
    descricao: 'Dispositivos eletrônicos e smartphones',
    cor: 'blue',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 2,
    nome: 'Acessórios',
    descricao: 'Acessórios para dispositivos móveis',
    cor: 'green',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 3,
    nome: 'Cabos',
    descricao: 'Cabos e conectores diversos',
    cor: 'yellow',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 4,
    nome: 'Cases',
    descricao: 'Capas e cases protetores',
    cor: 'purple',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 5,
    nome: 'Carregadores',
    descricao: 'Carregadores e fontes de alimentação',
    cor: 'red',
    ativa: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 6,
    nome: 'Outros',
    descricao: 'Produtos diversos',
    cor: 'gray',
    ativa: false,
    dataCadastro: '2024-01-01'
  }
];

const CONSIGNACOES_INICIAIS: Consignacao[] = [
  {
    id: 1,
    clienteNome: 'João da Silva',
    clienteDocumento: '123.456.789-10',
    clienteTelefone: '(11) 98765-4321',
    tipoDocumento: 'cpf',
    vendedorId: 1,
    vendedor: VENDEDORES_INICIAIS[0],
    quantidadeTotal: 15,
    valorTotal: 2699.00,
    dataConsignacao: '2024-06-15',
    status: 'ativa',
    observacoes: 'Cliente preferencial, prazo estendido'
  },
  {
    id: 2,
    clienteNome: 'Maria Oliveira Comércio LTDA',
    clienteDocumento: '12.345.678/0001-90',
    clienteTelefone: '(11) 91234-5678',
    tipoDocumento: 'cnpj',
    vendedorId: 2,
    vendedor: VENDEDORES_INICIAIS[1],
    quantidadeTotal: 8,
    valorTotal: 1567.00,
    dataConsignacao: '2024-06-10',
    dataRetorno: '2024-06-16',
    status: 'finalizada',
    retorno: {
      quantidadeRetornada: 3,
      valorRetornado: 890.00,
      quantidadeVendida: 5,
      valorDevido: 677.00
    }
  },
  {
    id: 3,
    clienteNome: 'Comércio ABC EIRELI',
    clienteDocumento: '98.765.432/0001-11',
    clienteTelefone: '(11) 97777-8888',
    tipoDocumento: 'cnpj',
    vendedorId: 1,
    vendedor: VENDEDORES_INICIAIS[0],
    quantidadeTotal: 25,
    valorTotal: 4850.00,
    dataConsignacao: '2024-06-12',
    status: 'ativa',
    observacoes: 'Loja no centro da cidade'
  }
];

const CORES_DISPONIVEIS = [
  { valor: 'blue', nome: 'Azul', classe: 'bg-blue-100 text-blue-800' },
  { valor: 'green', nome: 'Verde', classe: 'bg-green-100 text-green-800' },
  { valor: 'yellow', nome: 'Amarelo', classe: 'bg-yellow-100 text-yellow-800' },
  { valor: 'purple', nome: 'Roxo', classe: 'bg-purple-100 text-purple-800' },
  { valor: 'red', nome: 'Vermelho', classe: 'bg-red-100 text-red-800' },
  { valor: 'pink', nome: 'Rosa', classe: 'bg-pink-100 text-pink-800' },
  { valor: 'indigo', nome: 'Índigo', classe: 'bg-indigo-100 text-indigo-800' },
  { valor: 'gray', nome: 'Cinza', classe: 'bg-gray-100 text-gray-800' }
];

// Hook customizado para tema
const useTema = (temaEscuro: boolean) => {
  return useMemo(() => ({
    fundo: temaEscuro ? 'bg-gray-900' : 'bg-gray-100',
    papel: temaEscuro ? 'bg-gray-800' : 'bg-white',
    texto: temaEscuro ? 'text-white' : 'text-gray-900',
    textoSecundario: temaEscuro ? 'text-gray-300' : 'text-gray-500',
    borda: temaEscuro ? 'border-gray-700' : 'border-gray-200',
    hover: temaEscuro ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: temaEscuro ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    menuAtivo: temaEscuro ? 'bg-gray-700 border-r-2 border-blue-400 text-blue-300' : 'bg-blue-50 border-r-2 border-blue-600 text-blue-700'
  }), [temaEscuro]);
};

// Hook para validações
const useValidation = () => {
  const validarEmail = useCallback((email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  const validarTelefone = useCallback((telefone: string) => {
    const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return regex.test(telefone);
  }, []);

  const validarCPF = useCallback((cpf: string) => {
    const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return regex.test(cpf);
  }, []);

  const validarCNPJ = useCallback((cnpj: string) => {
    const regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return regex.test(cnpj);
  }, []);

  const validarCodigoBarras = useCallback((codigo: string) => {
    return codigo.length >= 8 && /^\d+$/.test(codigo);
  }, []);

  return { validarEmail, validarTelefone, validarCPF, validarCNPJ, validarCodigoBarras };
};

// Hook para formatação
const useFormatters = () => {
  const formatarTelefone = useCallback((valor: string) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  }, []);

  const formatarCPF = useCallback((valor: string) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9, 11)}`;
  }, []);

  const formatarCNPJ = useCallback((valor: string) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
    if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
    if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
    return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12, 14)}`;
  }, []);

  const formatarMoedaBR = useCallback((valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, []);

  return { formatarTelefone, formatarCPF, formatarCNPJ, formatarMoedaBR };
};

// Componente de Login
const Login = memo(({ onLogin, temaEscuro, onToggleTema }: {
  onLogin: (login: string, senha: string) => void;
  temaEscuro: boolean;
  onToggleTema: () => void;
}) => {
  const [formLogin, setFormLogin] = useState({ login: '', senha: '' });
  const tema = useTema(temaEscuro);

  const handleSubmit = useCallback(() => {
    onLogin(formLogin.login, formLogin.senha);
  }, [formLogin.login, formLogin.senha, onLogin]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

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
              onChange={(e) => setFormLogin(prev => ({ ...prev, login: e.target.value }))}
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
              placeholder="Digite seu login"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${tema.texto}`}>Senha</label>
            <input
              type="password"
              value={formLogin.senha}
              onChange={(e) => setFormLogin(prev => ({ ...prev, senha: e.target.value }))}
              onKeyPress={handleKeyPress}
              className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
              placeholder="Digite sua senha"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Entrar
          </button>
          
          <div className="flex justify-center">
            <button
              onClick={onToggleTema}
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
});

// Dashboard
const Dashboard = memo(() => {
  const { vendedores, produtos, categorias, consignacoes, tema } = useAppContext();

  const estatisticas = useMemo(() => {
    const vendedoresAtivos = vendedores.filter(v => v.status === 'Ativo').length;
    const produtosAtivos = produtos.filter(p => p.ativo).length;
    const produtosEstoqueBaixo = produtos.filter(p => p.estoque <= p.estoqueMinimo).length;
    const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.valorCusto * p.estoque), 0);
    const categoriasAtivas = categorias.filter(c => c.ativa).length;
    const itensEstoque = produtos.reduce((acc, p) => acc + p.estoque, 0);
    
    const consignacaoesAtivas = consignacoes.filter(c => c.status === 'ativa').length;
    const valorConsignacaoesAtivas = consignacoes
      .filter(c => c.status === 'ativa')
      .reduce((acc, c) => acc + c.valorTotal, 0);
    
    const quantidadeTotalConsignada = consignacoes
      .filter(c => c.status === 'ativa')
      .reduce((acc, c) => acc + c.quantidadeTotal, 0);

    return {
      vendedoresAtivos,
      produtosAtivos,
      produtosEstoqueBaixo,
      valorTotalEstoque,
      categoriasAtivas,
      itensEstoque,
      consignacaoesAtivas,
      valorConsignacaoesAtivas,
      quantidadeTotalConsignada
    };
  }, [vendedores, produtos, categorias, consignacoes]);

  const formatarMoedaBR = useCallback((valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, []);

  return (
    <div className="px-6 py-6">
      <h2 className={`text-2xl font-bold mb-6 ${tema.texto}`}>Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Vendedores Ativos</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.vendedoresAtivos}</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Produtos Ativos</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.produtosAtivos}</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Consignações Ativas</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>{estatisticas.consignacaoesAtivas}</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Valor em Consignação</p>
              <p className={`text-lg font-bold ${tema.texto}`}>{formatarMoedaBR(estatisticas.valorConsignacaoesAtivas)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6`}>
          <h3 className={`text-lg font-medium mb-4 ${tema.texto}`}>Resumo do Sistema</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className={tema.textoSecundario}>Total de Vendedores:</span>
              <span className={tema.texto}>{vendedores.length}</span>
            </div>
            <div className="flex justify-between">
              <span className={tema.textoSecundario}>Total de Produtos:</span>
              <span className={tema.texto}>{produtos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className={tema.textoSecundario}>Categorias Ativas:</span>
              <span className={tema.texto}>{estatisticas.categoriasAtivas}</span>
            </div>
            <div className="flex justify-between">
              <span className={tema.textoSecundario}>Valor Total Estoque:</span>
              <span className={tema.texto}>{formatarMoedaBR(estatisticas.valorTotalEstoque)}</span>
            </div>
            <div className="flex justify-between">
              <span className={tema.textoSecundario}>Produtos Consignados:</span>
              <span className={tema.texto}>{estatisticas.quantidadeTotalConsignada}</span>
            </div>
          </div>
        </div>

        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6`}>
          <h3 className={`text-lg font-medium mb-4 ${tema.texto}`}>Consignações Recentes</h3>
          <div className="space-y-2">
            {consignacoes.slice(0, 5).map(consignacao => (
              <div key={consignacao.id} className={`flex items-center justify-between p-2 rounded ${tema.hover}`}>
                <div>
                  <p className={`text-sm font-medium ${tema.texto}`}>{consignacao.clienteNome}</p>
                  <p className={`text-xs ${tema.textoSecundario}`}>
                    {consignacao.dataConsignacao} • {consignacao.quantidadeTotal} produtos
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tema.texto}`}>{formatarMoedaBR(consignacao.valorTotal)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    consignacao.status === 'ativa' 
                      ? 'bg-green-100 text-green-800' 
                      : consignacao.status === 'finalizada'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {consignacao.status}
                  </span>
                </div>
              </div>
            ))}
            {consignacoes.length === 0 && (
              <p className={`text-sm ${tema.textoSecundario}`}>Nenhuma consignação cadastrada ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Componente de Mensagem
const Mensagem = memo(({ mensagem }: { mensagem: {tipo: 'success' | 'error', texto: string} | null }) => {
  if (!mensagem) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center space-x-2 ${
      mensagem.tipo === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {mensagem.tipo === 'success' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <span>{mensagem.texto}</span>
    </div>
  );
});

// Menu Lateral
const MenuLateral = memo(({ 
  telaAtiva, 
  onMudarTela, 
  menuAberto, 
  onFecharMenu,
  tipoUsuario,
  usuarioLogado,
  onToggleTema,
  onLogout,
  temaEscuro
}: {
  telaAtiva: string;
  onMudarTela: (tela: string) => void;
  menuAberto: boolean;
  onFecharMenu: () => void;
  tipoUsuario: string | null;
  usuarioLogado: any;
  onToggleTema: () => void;
  onLogout: () => void;
  temaEscuro: boolean;
}) => {
  const tema = useTema(temaEscuro);

  const handleMenuClick = useCallback((tela: string) => {
    onMudarTela(tela);
    onFecharMenu();
  }, [onMudarTela, onFecharMenu]);

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 ${tema.papel} shadow-lg transform ${menuAberto ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0 border-r ${tema.borda}`}>
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
            onClick={onToggleTema}
            className={`p-2 rounded-full ${tema.hover}`}
          >
            {temaEscuro ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
          </button>
          <button
            onClick={onLogout}
            className={`p-2 rounded-full ${tema.hover} text-red-600`}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <nav className="mt-5">
        <button
          onClick={() => handleMenuClick('dashboard')}
          className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'dashboard' ? tema.menuAtivo : ''}`}
        >
          <BarChart3 className="mr-3 h-5 w-5" />
          Dashboard
        </button>
        
        <button
          onClick={() => handleMenuClick('consignacoes')}
          className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'consignacoes' ? tema.menuAtivo : ''}`}
        >
          <ClipboardList className="mr-3 h-5 w-5" />
          Consignações
        </button>
        
        {tipoUsuario === 'admin' && (
          <>
            <button
              onClick={() => handleMenuClick('vendedores')}
              className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'vendedores' ? tema.menuAtivo : ''}`}
            >
              <Users className="mr-3 h-5 w-5" />
              Vendedores
            </button>
            
            <button
              onClick={() => handleMenuClick('produtos')}
              className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'produtos' ? tema.menuAtivo : ''}`}
            >
              <Package className="mr-3 h-5 w-5" />
              Produtos
            </button>
            
            <button
              onClick={() => handleMenuClick('categorias')}
              className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'categorias' ? tema.menuAtivo : ''}`}
            >
              <Tag className="mr-3 h-5 w-5" />
              Categorias
            </button>
          </>
        )}
      </nav>
    </div>
  );
});

// Componente Input com Erro
const InputComErro = memo(({ 
  label, 
  valor, 
  onChange, 
  tipo = 'text', 
  placeholder, 
  erro, 
  obrigatorio = false,
  maxLength,
  className = '',
  disabled = false
}: {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: string;
  placeholder?: string;
  erro?: string;
  obrigatorio?: boolean;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}) => {
  const { tema } = useAppContext();

  return (
    <div>
      <label className={`block text-sm font-medium ${tema.texto}`}>
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        disabled={disabled}
        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${erro ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        placeholder={placeholder}
      />
      {erro && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {erro}
        </p>
      )}
    </div>
  );
});

// Tela de Consignações (VERSÃO MELHORADA DO V4)
const TelaConsignacoes = memo(() => {
  const { consignacoes, setConsignacoes, produtos, vendedores, mostrarMensagem, tema, usuarioLogado, tipoUsuario } = useAppContext();
  const { formatarMoedaBR, formatarCPF, formatarCNPJ, formatarTelefone } = useFormatters();
  const { validarCPF, validarCNPJ } = useValidation();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [modalRetornoAberto, setModalRetornoAberto] = useState(false);
  const [consignacaoRetorno, setConsignacaoRetorno] = useState<Consignacao | null>(null);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [buscaTexto, setBuscaTexto] = useState('');

  const [formConsignacao, setFormConsignacao] = useState({
    clienteNome: '',
    clienteDocumento: '',
    clienteTelefone: '',
    tipoDocumento: 'cpf' as 'cpf' | 'cnpj',
    vendedorId: '',
    quantidadeTotal: '',
    valorTotal: '',
    observacoes: ''
  });

  const [formErrors, setFormErrors] = useState<any>({});

  // Estados para retorno (VERSÃO MELHORADA DO V4)
  const [retornoForm, setRetornoForm] = useState({
    quantidadeRetornada: 0,
    valorRetornado: 0
  });
  const [codigoLeitura, setCodigoLeitura] = useState('');
  const [produtosLidos, setProdutosLidos] = useState<{produto: Produto, quantidade: number}[]>([]);

  const consignacoesFiltradas = useMemo(() => {
    let resultado = consignacoes;

    if (tipoUsuario === 'vendedor') {
      resultado = resultado.filter(c => c.vendedorId === usuarioLogado.id);
    }

    if (filtroStatus !== 'todas') {
      resultado = resultado.filter(c => c.status === filtroStatus);
    }

    if (buscaTexto) {
      resultado = resultado.filter(c => 
        c.clienteNome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        c.clienteDocumento.includes(buscaTexto) ||
        c.vendedor.nome.toLowerCase().includes(buscaTexto.toLowerCase())
      );
    }

    return resultado;
  }, [consignacoes, tipoUsuario, usuarioLogado, filtroStatus, buscaTexto]);

  const abrirModal = useCallback(() => {
    setFormConsignacao({
      clienteNome: '',
      clienteDocumento: '',
      clienteTelefone: '',
      tipoDocumento: 'cpf',
      vendedorId: tipoUsuario === 'vendedor' ? usuarioLogado.id.toString() : '',
      quantidadeTotal: '',
      valorTotal: '',
      observacoes: ''
    });
    setFormErrors({});
    setModalAberto(true);
  }, [tipoUsuario, usuarioLogado]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
  }, []);

  const abrirModalRetorno = useCallback((consignacao: Consignacao) => {
    setConsignacaoRetorno(consignacao);
    setRetornoForm({
      quantidadeRetornada: 0,
      valorRetornado: 0
    });
    setProdutosLidos([]);
    setCodigoLeitura('');
    setModalRetornoAberto(true);
  }, []);

  const fecharModalRetorno = useCallback(() => {
    setModalRetornoAberto(false);
    setConsignacaoRetorno(null);
  }, []);

  const formatarDocumento = useCallback((valor: string, tipo: 'cpf' | 'cnpj') => {
    return tipo === 'cpf' ? formatarCPF(valor) : formatarCNPJ(valor);
  }, [formatarCPF, formatarCNPJ]);

  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!formConsignacao.clienteNome.trim()) errors.clienteNome = 'Nome do cliente é obrigatório';
    
    if (!formConsignacao.clienteDocumento.trim()) {
      errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} é obrigatório`;
    } else {
      const validador = formConsignacao.tipoDocumento === 'cpf' ? validarCPF : validarCNPJ;
      if (!validador(formConsignacao.clienteDocumento)) {
        errors.clienteDocumento = `${formConsignacao.tipoDocumento.toUpperCase()} inválido`;
      }
    }
    
    if (!formConsignacao.clienteTelefone.trim()) errors.clienteTelefone = 'Telefone é obrigatório';
    if (!formConsignacao.vendedorId) errors.vendedorId = 'Vendedor é obrigatório';
    
    const quantidade = parseInt(formConsignacao.quantidadeTotal);
    if (!formConsignacao.quantidadeTotal || isNaN(quantidade) || quantidade <= 0) {
      errors.quantidadeTotal = 'Quantidade deve ser maior que zero';
    }
    
    const valor = parseFloat(formConsignacao.valorTotal);
    if (!formConsignacao.valorTotal || isNaN(valor) || valor <= 0) {
      errors.valorTotal = 'Valor deve ser maior que zero';
    }

    return errors;
  }, [formConsignacao, validarCPF, validarCNPJ]);

  const salvarConsignacao = useCallback(() => {
    const errors = validarFormulario();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      const vendedor = vendedores.find(v => v.id === parseInt(formConsignacao.vendedorId));

      const novaConsignacao: Consignacao = {
        id: Math.max(...consignacoes.map(c => c.id), 0) + 1,
        clienteNome: formConsignacao.clienteNome.trim(),
        clienteDocumento: formConsignacao.clienteDocumento,
        clienteTelefone: formConsignacao.clienteTelefone,
        tipoDocumento: formConsignacao.tipoDocumento,
        vendedorId: parseInt(formConsignacao.vendedorId),
        vendedor: vendedor!,
        quantidadeTotal: parseInt(formConsignacao.quantidadeTotal),
        valorTotal: parseFloat(formConsignacao.valorTotal),
        dataConsignacao: new Date().toISOString().split('T')[0],
        status: 'ativa',
        observacoes: formConsignacao.observacoes.trim()
      };

      setConsignacoes(prev => [...prev, novaConsignacao]);
      mostrarMensagem('success', 'Consignação criada com sucesso!');
      fecharModal();
    }
  }, [formConsignacao, vendedores, consignacoes, setConsignacoes, mostrarMensagem, validarFormulario, fecharModal]);

  // FUNÇÕES MELHORADAS DO V4 PARA LEITURA DE CÓDIGOS
  const lerCodigoRetorno = useCallback(() => {
    if (!codigoLeitura.trim()) {
      mostrarMensagem('error', 'Digite um código de barras');
      return;
    }

    const produto = produtos.find(p => p.codigoBarras === codigoLeitura.trim() && p.ativo);
    if (!produto) {
      mostrarMensagem('error', 'Produto não encontrado ou inativo');
      return;
    }

    const produtoExistente = produtosLidos.find(pl => pl.produto.id === produto.id);
    
    if (produtoExistente) {
      setProdutosLidos(prev => prev.map(pl =>
        pl.produto.id === produto.id
          ? { ...pl, quantidade: pl.quantidade + 1 }
          : pl
      ));
    } else {
      setProdutosLidos(prev => [...prev, { produto, quantidade: 1 }]);
    }

    const novaQuantidade = retornoForm.quantidadeRetornada + 1;
    const novoValor = retornoForm.valorRetornado + produto.valorVenda;

    setRetornoForm({
      quantidadeRetornada: novaQuantidade,
      valorRetornado: novoValor
    });

    setCodigoLeitura('');
    mostrarMensagem('success', `${produto.nome} adicionado! Valor: ${formatarMoedaBR(produto.valorVenda)}`);
  }, [codigoLeitura, produtos, produtosLidos, retornoForm, mostrarMensagem, formatarMoedaBR]);

  const removerProdutoLido = useCallback((produtoId: number) => {
    const produtoRemover = produtosLidos.find(pl => pl.produto.id === produtoId);
    if (!produtoRemover) return;

    if (produtoRemover.quantidade > 1) {
      setProdutosLidos(prev => prev.map(pl =>
        pl.produto.id === produtoId
          ? { ...pl, quantidade: pl.quantidade - 1 }
          : pl
      ));
      setRetornoForm(prev => ({
        quantidadeRetornada: prev.quantidadeRetornada - 1,
        valorRetornado: prev.valorRetornado - produtoRemover.produto.valorVenda
      }));
    } else {
      setProdutosLidos(prev => prev.filter(pl => pl.produto.id !== produtoId));
      setRetornoForm(prev => ({
        quantidadeRetornada: prev.quantidadeRetornada - 1,
        valorRetornado: prev.valorRetornado - produtoRemover.produto.valorVenda
      }));
    }

    mostrarMensagem('success', `${produtoRemover.produto.nome} removido!`);
  }, [produtosLidos, mostrarMensagem]);

  const finalizarConsignacao = useCallback(() => {
    if (!consignacaoRetorno) return;

    const quantidadeRetornada = retornoForm.quantidadeRetornada;
    const valorRetornado = retornoForm.valorRetornado;
    const quantidadeVendida = consignacaoRetorno.quantidadeTotal - quantidadeRetornada;
    const valorDevido = consignacaoRetorno.valorTotal - valorRetornado;
    
    const consignacaoAtualizada: Consignacao = {
      ...consignacaoRetorno,
      status: 'finalizada',
      dataRetorno: new Date().toISOString().split('T')[0],
      retorno: {
        quantidadeRetornada,
        valorRetornado,
        quantidadeVendida,
        valorDevido
      }
    };

    setConsignacoes(prev => prev.map(c => 
      c.id === consignacaoRetorno.id ? consignacaoAtualizada : c
    ));

    mostrarMensagem('success', 
      `Consignação finalizada! Quantidade vendida: ${quantidadeVendida} | Valor devido: ${formatarMoedaBR(valorDevido)}`
    );
    fecharModalRetorno();
  }, [consignacaoRetorno, retornoForm, setConsignacoes, mostrarMensagem, formatarMoedaBR, fecharModalRetorno]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Consignações</h2>
        <button
          onClick={abrirModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Consignação
        </button>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, documento ou vendedor..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            />
          </div>
          
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todas">Todas as consignações</option>
            <option value="ativa">Ativas</option>
            <option value="finalizada">Finalizadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          
          <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
            {consignacoesFiltradas.length} de {consignacoes.length} consignações
          </div>
        </div>
      </div>

      {/* Lista de Consignações */}
      <div className="space-y-4">
        {consignacoesFiltradas.map(consignacao => (
          <div key={consignacao.id} className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className={`text-lg font-medium ${tema.texto}`}>{consignacao.clienteNome}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    consignacao.status === 'ativa' 
                      ? 'bg-green-100 text-green-800' 
                      : consignacao.status === 'finalizada'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {consignacao.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    consignacao.tipoDocumento === 'cpf' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {consignacao.tipoDocumento.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>
                      {consignacao.tipoDocumento.toUpperCase()}:
                    </span>
                    <p className={tema.texto}>{consignacao.clienteDocumento}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Telefone:</span>
                    <p className={tema.texto}>{consignacao.clienteTelefone}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Vendedor:</span>
                    <p className={tema.texto}>{consignacao.vendedor.nome}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Data Consignação:</span>
                    <p className={tema.texto}>{new Date(consignacao.dataConsignacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Quantidade:</span>
                    <p className={`font-bold ${tema.texto}`}>{consignacao.quantidadeTotal} produtos</p>
                  </div>
                  <div>
                    <span className={`font-medium ${tema.textoSecundario}`}>Valor Total:</span>
                    <p className={`font-bold ${tema.texto}`}>{formatarMoedaBR(consignacao.valorTotal)}</p>
                  </div>
                </div>

                {consignacao.retorno && (
                  <div className={`mt-4 p-3 rounded-md bg-blue-50 border ${tema.borda}`}>
                    <h4 className={`font-medium ${tema.texto} mb-2`}>Resultado da Consignação:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Retornado:</span>
                        <p className={tema.texto}>{consignacao.retorno.quantidadeRetornada} produtos</p>
                      </div>
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Vendido:</span>
                        <p className={`font-bold text-green-600`}>{consignacao.retorno.quantidadeVendida} produtos</p>
                      </div>
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Valor Retornado:</span>
                        <p className={tema.texto}>{formatarMoedaBR(consignacao.retorno.valorRetornado)}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Valor Devido:</span>
                        <p className={`font-bold ${consignacao.retorno.valorDevido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatarMoedaBR(consignacao.retorno.valorDevido)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {consignacao.observacoes && (
                  <div className="mt-2">
                    <span className={`font-medium ${tema.textoSecundario}`}>Observações:</span>
                    <p className={`text-sm ${tema.texto}`}>{consignacao.observacoes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                {consignacao.status === 'ativa' && (
                  <button
                    onClick={() => abrirModalRetorno(consignacao)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Conferir Retorno
                  </button>
                )}
                
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}

        {consignacoesFiltradas.length === 0 && (
          <div className="text-center py-8">
            <p className={`text-sm ${tema.textoSecundario}`}>
              Nenhuma consignação encontrada com os filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Modal Nova Consignação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>Nova Consignação</h3>
                
                <div className="space-y-4">
                  <h4 className={`font-medium ${tema.texto} border-b pb-2`}>Dados do Cliente</h4>
                  
                  <InputComErro
                    label="Nome do Cliente"
                    valor={formConsignacao.clienteNome}
                    onChange={(valor) => setFormConsignacao(prev => ({ ...prev, clienteNome: valor }))}
                    placeholder="Nome completo do cliente"
                    erro={formErrors.clienteNome}
                    obrigatorio
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="cpf"
                          checked={formConsignacao.tipoDocumento === 'cpf'}
                          onChange={() => {
                            setFormConsignacao(prev => ({ 
                              ...prev, 
                              tipoDocumento: 'cpf',
                              clienteDocumento: ''
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className={tema.texto}>CPF</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="cnpj"
                          checked={formConsignacao.tipoDocumento === 'cnpj'}
                          onChange={() => {
                            setFormConsignacao(prev => ({ 
                              ...prev, 
                              tipoDocumento: 'cnpj',
                              clienteDocumento: ''
                            }));
                          }}
                          className="mr-2"
                        />
                        <span className={tema.texto}>CNPJ</span>
                      </label>
                    </div>
                  </div>
                  
                  <InputComErro
                    label={formConsignacao.tipoDocumento.toUpperCase()}
                    valor={formConsignacao.clienteDocumento}
                    onChange={(valor) => setFormConsignacao(prev => ({ 
                      ...prev, 
                      clienteDocumento: formatarDocumento(valor, formConsignacao.tipoDocumento) 
                    }))}
                    placeholder={formConsignacao.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    erro={formErrors.clienteDocumento}
                    obrigatorio
                    maxLength={formConsignacao.tipoDocumento === 'cpf' ? 14 : 18}
                  />
                  
                  <InputComErro
                    label="Telefone"
                    valor={formConsignacao.clienteTelefone}
                    onChange={(valor) => setFormConsignacao(prev => ({ ...prev, clienteTelefone: formatarTelefone(valor) }))}
                    placeholder="(11) 99999-9999"
                    erro={formErrors.clienteTelefone}
                    obrigatorio
                    maxLength={15}
                  />
                  
                  {tipoUsuario === 'admin' && (
                    <div>
                      <label className={`block text-sm font-medium ${tema.texto}`}>
                        Vendedor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formConsignacao.vendedorId}
                        onChange={(e) => setFormConsignacao(prev => ({ ...prev, vendedorId: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.vendedorId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Selecione um vendedor</option>
                        {vendedores.filter(v => v.status === 'Ativo').map(vendedor => (
                          <option key={vendedor.id} value={vendedor.id}>{vendedor.nome}</option>
                        ))}
                      </select>
                      {formErrors.vendedorId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {formErrors.vendedorId}
                        </p>
                      )}
                    </div>
                  )}

                  <h4 className={`font-medium ${tema.texto} border-b pb-2 mt-6`}>Dados da Consignação</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputComErro
                      label="Quantidade Total"
                      valor={formConsignacao.quantidadeTotal}
                      onChange={(valor) => setFormConsignacao(prev => ({ ...prev, quantidadeTotal: valor }))}
                      tipo="number"
                      placeholder="Ex: 50"
                      erro={formErrors.quantidadeTotal}
                      obrigatorio
                    />
                    
                    <InputComErro
                      label="Valor Total"
                      valor={formConsignacao.valorTotal}
                      onChange={(valor) => setFormConsignacao(prev => ({ ...prev, valorTotal: valor }))}
                      tipo="number"
                      placeholder="Ex: 5000.00"
                      erro={formErrors.valorTotal}
                      obrigatorio
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Observações</label>
                    <textarea
                      value={formConsignacao.observacoes}
                      onChange={(e) => setFormConsignacao(prev => ({ ...prev, observacoes: e.target.value }))}
                      rows={3}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                      placeholder="Observações sobre a consignação (opcional)"
                    />
                  </div>

                  {formConsignacao.quantidadeTotal && formConsignacao.valorTotal && (
                    <div className={`p-4 border rounded-md ${tema.borda} bg-blue-50`}>
                      <h5 className={`font-medium ${tema.texto} mb-2`}>Resumo:</h5>
                      <div className="text-sm space-y-1">
                        <p className={tema.texto}>
                          <strong>Quantidade:</strong> {formConsignacao.quantidadeTotal} produtos
                        </p>
                        <p className={tema.texto}>
                          <strong>Valor Total:</strong> {formatarMoedaBR(parseFloat(formConsignacao.valorTotal) || 0)}
                        </p>
                        <p className={tema.texto}>
                          <strong>Valor Médio por Item:</strong> {
                            formatarMoedaBR(
                              (parseFloat(formConsignacao.valorTotal) || 0) / (parseInt(formConsignacao.quantidadeTotal) || 1)
                            )
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={fecharModal}
                    className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                  >
                    <X className="mr-2 h-4 w-4 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={salvarConsignacao}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Criar Consignação
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conferência de Retorno - VERSÃO MELHORADA DO V4 */}
      {modalRetornoAberto && consignacaoRetorno && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalRetorno}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[90vh] overflow-y-auto">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                  <QrCode className="inline mr-2 h-5 w-5" />
                  Conferência de Retorno - {consignacaoRetorno.clienteNome}
                </h3>
                
                <div className="space-y-6">
                  {/* Resumo da Consignação Original */}
                  <div className={`p-4 border rounded-md ${tema.borda} bg-gray-50`}>
                    <h4 className={`font-medium ${tema.texto} mb-3`}>Consignação Original</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Data:</span>
                        <p className={tema.texto}>{new Date(consignacaoRetorno.dataConsignacao).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Quantidade:</span>
                        <p className={`font-bold ${tema.texto}`}>{consignacaoRetorno.quantidadeTotal} produtos</p>
                      </div>
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Valor Total:</span>
                        <p className={`font-bold ${tema.texto}`}>{formatarMoedaBR(consignacaoRetorno.valorTotal)}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${tema.textoSecundario}`}>Valor Médio:</span>
                        <p className={tema.texto}>{formatarMoedaBR(consignacaoRetorno.valorTotal / consignacaoRetorno.quantidadeTotal)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Leitura de Códigos */}
                    <div className="space-y-4">
                      <h4 className={`font-medium ${tema.texto} flex items-center`}>
                        <QrCode className="mr-2 h-5 w-5" />
                        Leitura de Produtos Retornados
                      </h4>
                      
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={codigoLeitura}
                          onChange={(e) => setCodigoLeitura(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && lerCodigoRetorno()}
                          placeholder="Escaneie o código de barras"
                          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                        />
                        <button
                          onClick={lerCodigoRetorno}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className={`p-4 border rounded-md ${tema.borda} bg-blue-50`}>
                        <h5 className={`font-medium ${tema.texto} mb-2`}>Instruções:</h5>
                        <ul className={`text-sm ${tema.textoSecundario} space-y-1`}>
                          <li>• Escaneie ou digite o código de cada produto que retornou</li>
                          <li>• O sistema soma automaticamente as quantidades e valores</li>
                          <li>• Clique no X para remover produtos lidos incorretamente</li>
                          <li>• Pressione Enter após digitar o código</li>
                        </ul>
                      </div>

                      {/* Lista de Produtos Lidos */}
                      {produtosLidos.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          <h5 className={`font-medium ${tema.texto}`}>Produtos Lidos ({produtosLidos.length} tipos):</h5>
                          {produtosLidos.map(item => (
                            <div key={item.produto.id} className={`flex items-center justify-between p-3 border rounded-md ${tema.borda} bg-green-50`}>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium ${tema.texto} truncate`}>{item.produto.nome}</p>
                                <p className={`text-sm ${tema.textoSecundario}`}>
                                  {item.quantidade}x {formatarMoedaBR(item.produto.valorVenda)} = {formatarMoedaBR(item.quantidade * item.produto.valorVenda)}
                                </p>
                                <p className={`text-xs ${tema.textoSecundario}`}>Código: {item.produto.codigoBarras}</p>
                              </div>
                              <button
                                onClick={() => removerProdutoLido(item.produto.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded ml-2"
                                title="Remover uma unidade"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Totais e Cálculos */}
                    <div className="space-y-4">
                      <h4 className={`font-medium ${tema.texto} flex items-center`}>
                        <Calculator className="mr-2 h-5 w-5" />
                        Resumo da Conferência
                      </h4>
                      
                      <div className={`p-4 border rounded-md ${tema.borda}`}>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className={`font-medium ${tema.textoSecundario}`}>Produtos Retornados:</span>
                            <span className={`font-bold ${tema.texto}`}>{retornoForm.quantidadeRetornada}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-medium ${tema.textoSecundario}`}>Valor Retornado:</span>
                            <span className={`font-bold ${tema.texto}`}>{formatarMoedaBR(retornoForm.valorRetornado)}</span>
                          </div>
                          <hr className={tema.borda} />
                          <div className="flex justify-between">
                            <span className={`font-medium ${tema.textoSecundario}`}>Produtos Vendidos:</span>
                            <span className={`font-bold text-green-600`}>
                              {Math.max(0, consignacaoRetorno.quantidadeTotal - retornoForm.quantidadeRetornada)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`font-medium ${tema.textoSecundario}`}>Valor Vendido:</span>
                            <span className={`font-bold text-green-600`}>
                              {formatarMoedaBR(Math.max(0, consignacaoRetorno.valorTotal - retornoForm.valorRetornado))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Taxa de Venda */}
                      {retornoForm.quantidadeRetornada > 0 && (
                        <div className={`p-4 border rounded-md ${tema.borda} bg-yellow-50`}>
                          <h5 className={`font-medium ${tema.texto} mb-2 flex items-center`}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Estatísticas:
                          </h5>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className={tema.textoSecundario}>Taxa de Venda:</span>
                              <span className={`font-bold ${tema.texto}`}>
                                {(((consignacaoRetorno.quantidadeTotal - retornoForm.quantidadeRetornada) / consignacaoRetorno.quantidadeTotal) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={tema.textoSecundario}>Taxa de Retorno:</span>
                              <span className={`font-bold ${tema.texto}`}>
                                {((retornoForm.quantidadeRetornada / consignacaoRetorno.quantidadeTotal) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Valor Final */}
                      <div className={`p-4 border-2 rounded-md ${tema.borda} ${
                        (consignacaoRetorno.valorTotal - retornoForm.valorRetornado) >= 0 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="text-center">
                          <p className={`text-sm ${tema.textoSecundario} mb-1`}>Cliente deve pagar:</p>
                          <p className={`text-2xl font-bold ${
                            (consignacaoRetorno.valorTotal - retornoForm.valorRetornado) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formatarMoedaBR(consignacaoRetorno.valorTotal - retornoForm.valorRetornado)}
                          </p>
                          {(consignacaoRetorno.valorTotal - retornoForm.valorRetornado) < 0 && (
                            <p className="text-xs text-red-600 mt-1">Valor negativo - verificar retorno</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={fecharModalRetorno}
                    className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                  >
                    <X className="mr-2 h-4 w-4 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={finalizarConsignacao}
                    disabled={retornoForm.quantidadeRetornada === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar Consignação
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Tela de Produtos (mantendo a implementação original do v3)
const TelaProdutos = memo(() => {
  const { produtos, setProdutos, categorias, mostrarMensagem, tema } = useAppContext();
  const { validarCodigoBarras } = useValidation();
  const { formatarMoedaBR } = useFormatters();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    codigoBarras: '',
    categoria: '',
    valorCusto: '',
    valorVenda: '',
    estoque: '',
    estoqueMinimo: '',
    ativo: true
  });

  const [formErrors, setFormErrors] = useState<any>({});

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(produto => {
      const passaBusca = !buscaTexto || 
        produto.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        produto.codigoBarras.includes(buscaTexto);
      
      const passaCategoria = filtroCategoria === 'todas' || produto.categoria === filtroCategoria;
      const passaStatus = filtroStatus === 'todos' || 
        (filtroStatus === 'ativo' && produto.ativo) ||
        (filtroStatus === 'inativo' && !produto.ativo);
      
      return passaBusca && passaCategoria && passaStatus;
    });
  }, [produtos, buscaTexto, filtroCategoria, filtroStatus]);

  const abrirModal = useCallback((produto?: Produto) => {
    if (produto) {
      setProdutoEditando(produto);
      setFormProduto({
        nome: produto.nome,
        descricao: produto.descricao,
        codigoBarras: produto.codigoBarras,
        categoria: produto.categoria,
        valorCusto: produto.valorCusto.toString(),
        valorVenda: produto.valorVenda.toString(),
        estoque: produto.estoque.toString(),
        estoqueMinimo: produto.estoqueMinimo.toString(),
        ativo: produto.ativo
      });
    } else {
      setProdutoEditando(null);
      setFormProduto({
        nome: '',
        descricao: '',
        codigoBarras: '',
        categoria: '',
        valorCusto: '',
        valorVenda: '',
        estoque: '',
        estoqueMinimo: '',
        ativo: true
      });
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setProdutoEditando(null);
  }, []);

  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!formProduto.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!formProduto.categoria) errors.categoria = 'Categoria é obrigatória';
    if (!formProduto.codigoBarras.trim()) {
      errors.codigoBarras = 'Código de barras é obrigatório';
    } else if (!validarCodigoBarras(formProduto.codigoBarras)) {
      errors.codigoBarras = 'Código de barras inválido';
    } else {
      const codigoExiste = produtos.some(p => 
        p.codigoBarras === formProduto.codigoBarras && 
        p.id !== produtoEditando?.id
      );
      if (codigoExiste) {
        errors.codigoBarras = 'Este código de barras já está em uso';
      }
    }

    const valorCusto = parseFloat(formProduto.valorCusto);
    const valorVenda = parseFloat(formProduto.valorVenda);
    
    if (!formProduto.valorCusto || isNaN(valorCusto) || valorCusto < 0) {
      errors.valorCusto = 'Valor de custo inválido';
    }
    if (!formProduto.valorVenda || isNaN(valorVenda) || valorVenda < 0) {
      errors.valorVenda = 'Valor de venda inválido';
    }
    if (valorCusto >= valorVenda) {
      errors.valorVenda = 'Valor de venda deve ser maior que o custo';
    }

    const estoque = parseInt(formProduto.estoque);
    const estoqueMinimo = parseInt(formProduto.estoqueMinimo);
    
    if (!formProduto.estoque || isNaN(estoque) || estoque < 0) {
      errors.estoque = 'Estoque inválido';
    }
    if (!formProduto.estoqueMinimo || isNaN(estoqueMinimo) || estoqueMinimo < 0) {
      errors.estoqueMinimo = 'Estoque mínimo inválido';
    }

    return errors;
  }, [formProduto, produtos, produtoEditando, validarCodigoBarras]);

  const salvarProduto = useCallback(() => {
    const errors = validarFormulario();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      const dadosProduto = {
        nome: formProduto.nome.trim(),
        descricao: formProduto.descricao.trim(),
        codigoBarras: formProduto.codigoBarras.trim(),
        categoria: formProduto.categoria,
        valorCusto: parseFloat(formProduto.valorCusto),
        valorVenda: parseFloat(formProduto.valorVenda),
        estoque: parseInt(formProduto.estoque),
        estoqueMinimo: parseInt(formProduto.estoqueMinimo),
        ativo: formProduto.ativo
      };

      if (produtoEditando) {
        setProdutos(prev => prev.map(p => 
          p.id === produtoEditando.id 
            ? { ...dadosProduto, id: produtoEditando.id, dataCadastro: produtoEditando.dataCadastro }
            : p
        ));
        mostrarMensagem('success', 'Produto atualizado com sucesso!');
      } else {
        const novoId = Math.max(...produtos.map(p => p.id), 0) + 1;
        const novoProduto = {
          ...dadosProduto,
          id: novoId,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setProdutos(prev => [...prev, novoProduto]);
        mostrarMensagem('success', 'Produto criado com sucesso!');
      }

      fecharModal();
    }
  }, [formProduto, produtoEditando, produtos, setProdutos, mostrarMensagem, validarFormulario, fecharModal]);

  const excluirProduto = useCallback((produto: Produto) => {
    if (confirm(`Confirma a exclusão do produto "${produto.nome}"?`)) {
      setProdutos(prev => prev.filter(p => p.id !== produto.id));
      mostrarMensagem('success', 'Produto excluído com sucesso!');
    }
  }, [setProdutos, mostrarMensagem]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Produtos</h2>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            />
          </div>
          
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todas">Todas as categorias</option>
            {categorias.filter(c => c.ativa).map(categoria => (
              <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
            ))}
          </select>
          
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Apenas Ativos</option>
            <option value="inativo">Apenas Inativos</option>
          </select>
          
          <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
            {produtosFiltrados.length} de {produtos.length} produtos
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Produto</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Categoria</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Código</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Preços</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Estoque</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Ações</th>
            </tr>
          </thead>
          <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
            {produtosFiltrados.map(produto => (
              <tr key={produto.id} className={tema.hover}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                  <div>
                    <div className="font-medium">{produto.nome}</div>
                    <div className={`text-xs ${tema.textoSecundario}`}>{produto.descricao}</div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                  {produto.categoria}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${tema.textoSecundario}`}>
                  {produto.codigoBarras}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                  <div>Custo: {formatarMoedaBR(produto.valorCusto)}</div>
                  <div>Venda: {formatarMoedaBR(produto.valorVenda)}</div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                  <div className={produto.estoque <= produto.estoqueMinimo ? 'text-red-600' : ''}>
                    {produto.estoque} / {produto.estoqueMinimo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    produto.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => abrirModal(produto)}
                    className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirProduto(produto)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {produtosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className={`text-sm ${tema.textoSecundario}`}>
              Nenhum produto encontrado com os filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Produto */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                  {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputComErro
                    label="Nome"
                    valor={formProduto.nome}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, nome: valor }))}
                    placeholder="Nome do produto"
                    erro={formErrors.nome}
                    obrigatorio
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formProduto.categoria}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, categoria: e.target.value }))}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.categoria ? 'border-red-500' : ''}`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.filter(c => c.ativa).map(categoria => (
                        <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
                      ))}
                    </select>
                    {formErrors.categoria && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {formErrors.categoria}
                      </p>
                    )}
                  </div>
                  
                  <InputComErro
                    label="Código de Barras"
                    valor={formProduto.codigoBarras}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, codigoBarras: valor }))}
                    placeholder="Código de barras"
                    erro={formErrors.codigoBarras}
                    obrigatorio
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Status</label>
                    <select
                      value={formProduto.ativo ? 'ativo' : 'inativo'}
                      onChange={(e) => setFormProduto(prev => ({ ...prev, ativo: e.target.value === 'ativo' }))}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                  
                  <InputComErro
                    label="Valor de Custo"
                    valor={formProduto.valorCusto}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, valorCusto: valor }))}
                    tipo="number"
                    placeholder="0.00"
                    erro={formErrors.valorCusto}
                    obrigatorio
                  />
                  
                  <InputComErro
                    label="Valor de Venda"
                    valor={formProduto.valorVenda}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, valorVenda: valor }))}
                    tipo="number"
                    placeholder="0.00"
                    erro={formErrors.valorVenda}
                    obrigatorio
                  />
                  
                  <InputComErro
                    label="Estoque Atual"
                    valor={formProduto.estoque}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, estoque: valor }))}
                    tipo="number"
                    placeholder="0"
                    erro={formErrors.estoque}
                    obrigatorio
                  />
                  
                  <InputComErro
                    label="Estoque Mínimo"
                    valor={formProduto.estoqueMinimo}
                    onChange={(valor) => setFormProduto(prev => ({ ...prev, estoqueMinimo: valor }))}
                    tipo="number"
                    placeholder="0"
                    erro={formErrors.estoqueMinimo}
                    obrigatorio
                  />
                </div>
                
                <div className="mt-4">
                  <label className={`block text-sm font-medium ${tema.texto}`}>Descrição</label>
                  <textarea
                    value={formProduto.descricao}
                    onChange={(e) => setFormProduto(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                    placeholder="Descrição do produto"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={fecharModal}
                    className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                  >
                    <X className="mr-2 h-4 w-4 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={salvarProduto}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Tela de Categorias
const TelaCategorias = memo(() => {
  const { categorias, setCategorias, mostrarMensagem, tema } = useAppContext();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [formCategoria, setFormCategoria] = useState({
    nome: '',
    descricao: '',
    cor: 'blue',
    ativa: true
  });
  const [formErrors, setFormErrors] = useState<any>({});

  const obterClasseCor = useCallback((cor: string) => {
    const corEncontrada = CORES_DISPONIVEIS.find(c => c.valor === cor);
    return corEncontrada ? corEncontrada.classe : 'bg-gray-100 text-gray-800';
  }, []);

  const abrirModal = useCallback((categoria?: Categoria) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormCategoria({
        nome: categoria.nome,
        descricao: categoria.descricao,
        cor: categoria.cor,
        ativa: categoria.ativa
      });
    } else {
      setCategoriaEditando(null);
      setFormCategoria({
        nome: '',
        descricao: '',
        cor: 'blue',
        ativa: true
      });
    }
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setCategoriaEditando(null);
  }, []);

  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!formCategoria.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else {
      const nomeExiste = categorias.some(c => 
        c.nome.toLowerCase() === formCategoria.nome.toLowerCase() && 
        c.id !== categoriaEditando?.id
      );
      if (nomeExiste) {
        errors.nome = 'Já existe uma categoria com este nome';
      }
    }

    return errors;
  }, [formCategoria, categorias, categoriaEditando]);

  const salvarCategoria = useCallback(() => {
    const errors = validarFormulario();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      const dadosCategoria = {
        nome: formCategoria.nome.trim(),
        descricao: formCategoria.descricao.trim(),
        cor: formCategoria.cor,
        ativa: formCategoria.ativa
      };

      if (categoriaEditando) {
        setCategorias(prev => prev.map(c => 
          c.id === categoriaEditando.id 
            ? { ...dadosCategoria, id: categoriaEditando.id, dataCadastro: categoriaEditando.dataCadastro }
            : c
        ));
        mostrarMensagem('success', 'Categoria atualizada com sucesso!');
      } else {
        const novoId = Math.max(...categorias.map(c => c.id), 0) + 1;
        const novaCategoria = {
          ...dadosCategoria,
          id: novoId,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setCategorias(prev => [...prev, novaCategoria]);
        mostrarMensagem('success', 'Categoria criada com sucesso!');
      }

      fecharModal();
    }
  }, [formCategoria, categoriaEditando, categorias, setCategorias, mostrarMensagem, validarFormulario, fecharModal]);

  const excluirCategoria = useCallback((categoria: Categoria) => {
    if (confirm(`Confirma a exclusão da categoria "${categoria.nome}"?`)) {
      setCategorias(prev => prev.filter(c => c.id !== categoria.id));
      mostrarMensagem('success', 'Categoria excluída com sucesso!');
    }
  }, [setCategorias, mostrarMensagem]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Categorias</h2>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map(categoria => (
          <div key={categoria.id} className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${obterClasseCor(categoria.cor)}`}>
                {categoria.nome}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => abrirModal(categoria)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => excluirCategoria(categoria)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className={`text-sm ${tema.textoSecundario}`}>{categoria.descricao}</p>
              <div className="flex justify-between items-center text-xs">
                <span className={`inline-flex px-2 py-1 rounded-full ${
                  categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {categoria.ativa ? 'Ativa' : 'Inativa'}
                </span>
                <span className={tema.textoSecundario}>
                  Criada em {new Date(categoria.dataCadastro).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Categoria */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModal}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                  {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                
                <div className="space-y-4">
                  <InputComErro
                    label="Nome"
                    valor={formCategoria.nome}
                    onChange={(valor) => setFormCategoria(prev => ({ ...prev, nome: valor }))}
                    placeholder="Nome da categoria"
                    erro={formErrors.nome}
                    obrigatorio
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Descrição</label>
                    <textarea
                      value={formCategoria.descricao}
                      onChange={(e) => setFormCategoria(prev => ({ ...prev, descricao: e.target.value }))}
                      rows={3}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                      placeholder="Descrição da categoria"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Cor</label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {CORES_DISPONIVEIS.map(cor => (
                        <button
                          key={cor.valor}
                          onClick={() => setFormCategoria(prev => ({ ...prev, cor: cor.valor }))}
                          className={`p-3 rounded-lg border-2 ${formCategoria.cor === cor.valor ? 'border-blue-500' : 'border-gray-300'} ${cor.classe}`}
                        >
                          {cor.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Status</label>
                    <select
                      value={formCategoria.ativa ? 'ativa' : 'inativa'}
                      onChange={(e) => setFormCategoria(prev => ({ ...prev, ativa: e.target.value === 'ativa' }))}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                    >
                      <option value="ativa">Ativa</option>
                      <option value="inativa">Inativa</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={fecharModal}
                    className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover}`}
                  >
                    <X className="mr-2 h-4 w-4 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={salvarCategoria}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Tela de Vendedores
const TelaVendedores = memo(() => {
  const { vendedores, setVendedores, mostrarMensagem, tema } = useAppContext();
  const { validarEmail, validarTelefone } = useValidation();
  const { formatarTelefone } = useFormatters();
  
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [vendedorParaExcluir, setVendedorParaExcluir] = useState<Vendedor | null>(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [buscaTexto, setBuscaTexto] = useState('');

  const [formVendedor, setFormVendedor] = useState({
    nome: '',
    email: '',
    telefone: '',
    status: 'Ativo',
    login: '',
    senha: ''
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [salvando, setSalvando] = useState(false);

  const vendedoresFiltrados = useMemo(() => {
    return vendedores.filter(vendedor => {
      const passaFiltroStatus = filtroStatus === 'todos' || vendedor.status.toLowerCase() === filtroStatus;
      const passaBusca = !buscaTexto || 
        vendedor.nome.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        vendedor.email.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        vendedor.login.toLowerCase().includes(buscaTexto.toLowerCase());
      
      return passaFiltroStatus && passaBusca;
    });
  }, [vendedores, filtroStatus, buscaTexto]);

  const abrirModal = useCallback((vendedor?: Vendedor) => {
    if (vendedor) {
      setVendedorEditando(vendedor);
      setFormVendedor({
        nome: vendedor.nome,
        email: vendedor.email,
        telefone: vendedor.telefone,
        status: vendedor.status,
        login: vendedor.login,
        senha: vendedor.senha
      });
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
    setFormErrors({});
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setVendedorEditando(null);
  }, []);

  const abrirModalExclusao = useCallback((vendedor: Vendedor) => {
    setVendedorParaExcluir(vendedor);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setVendedorParaExcluir(null);
  }, []);

  const validarFormulario = useCallback(() => {
    const errors: any = {};

    if (!formVendedor.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formVendedor.nome.length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formVendedor.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!validarEmail(formVendedor.email)) {
      errors.email = 'Email inválido';
    } else {
      const emailExiste = vendedores.some(v => 
        v.email === formVendedor.email && 
        v.id !== vendedorEditando?.id
      );
      if (emailExiste) {
        errors.email = 'Este email já está em uso';
      }
    }

    if (!formVendedor.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formVendedor.telefone)) {
      errors.telefone = 'Formato: (XX) XXXXX-XXXX';
    }

    if (!formVendedor.login.trim()) {
      errors.login = 'Login é obrigatório';
    } else if (formVendedor.login.length < 3) {
      errors.login = 'Login deve ter pelo menos 3 caracteres';
    } else {
      const loginExiste = vendedores.some(v => 
        v.login === formVendedor.login && 
        v.id !== vendedorEditando?.id
      );
      if (loginExiste) {
        errors.login = 'Este login já está em uso';
      }
    }

    if (!formVendedor.senha.trim()) {
      errors.senha = 'Senha é obrigatória';
    } else if (formVendedor.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    return errors;
  }, [formVendedor, vendedores, vendedorEditando, validarEmail, validarTelefone]);

  const salvarVendedor = useCallback(async () => {
    const errors = validarFormulario();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setSalvando(true);
      try {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (vendedorEditando) {
          // Editar vendedor existente
          setVendedores(prev => prev.map(v => 
            v.id === vendedorEditando.id 
              ? { ...formVendedor, id: vendedorEditando.id, dataCadastro: vendedorEditando.dataCadastro } 
              : v
          ));
          mostrarMensagem('success', 'Vendedor atualizado com sucesso!');
        } else {
          // Criar novo vendedor
          const novoId = Math.max(...vendedores.map(v => v.id), 0) + 1;
          const novoVendedor = { 
            ...formVendedor, 
            id: novoId,
            dataCadastro: new Date().toISOString().split('T')[0]
          };
          setVendedores(prev => [...prev, novoVendedor]);
          mostrarMensagem('success', 'Vendedor criado com sucesso!');
        }
        fecharModal();
      } catch (error) {
        mostrarMensagem('error', 'Erro ao salvar vendedor');
      } finally {
        setSalvando(false);
      }
    }
  }, [formVendedor, vendedorEditando, vendedores, setVendedores, mostrarMensagem, validarFormulario, fecharModal]);

  const confirmarExclusao = useCallback(() => {
    if (vendedorParaExcluir) {
      setVendedores(prev => prev.filter(v => v.id !== vendedorParaExcluir.id));
      mostrarMensagem('success', `Vendedor "${vendedorParaExcluir.nome}" excluído com sucesso!`);
      fecharModalExclusao();
    }
  }, [vendedorParaExcluir, setVendedores, mostrarMensagem, fecharModalExclusao]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Vendedores</h2>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Vendedor
        </button>
      </div>

      {/* Filtros */}
      <div className={`${tema.papel} p-4 rounded-lg shadow-sm border ${tema.borda} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou login..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            />
          </div>
          
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Apenas Ativos</option>
            <option value="inativo">Apenas Inativos</option>
          </select>
          
          <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
            Mostrando {vendedoresFiltrados.length} de {vendedores.length} vendedores
          </div>
        </div>
      </div>

      {/* Tabela de Vendedores */}
      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={tema.fundo === 'bg-gray-900' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Nome</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Email</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Telefone</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Login</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Ações</th>
            </tr>
          </thead>
          <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
            {vendedoresFiltrados.map(vendedor => (
              <tr key={vendedor.id} className={tema.hover}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${tema.texto}`}>
                  {vendedor.nome}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                  {vendedor.email}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario}`}>
                  {vendedor.telefone}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario} font-mono`}>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => abrirModal(vendedor)}
                    className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded"
                    title="Editar vendedor"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => abrirModalExclusao(vendedor)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Excluir vendedor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {vendedoresFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className={`text-sm ${tema.textoSecundario}`}>
              Nenhum vendedor encontrado com os filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Vendedor */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && fecharModal()}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                  {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
                </h3>
                
                <div className="space-y-4">
                  <InputComErro
                    label="Nome"
                    valor={formVendedor.nome}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, nome: valor }))}
                    placeholder="Nome completo"
                    erro={formErrors.nome}
                    obrigatorio
                  />
                  
                  <InputComErro
                    label="Email"
                    valor={formVendedor.email}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, email: valor }))}
                    tipo="email"
                    placeholder="exemplo@email.com"
                    erro={formErrors.email}
                    obrigatorio
                  />
                  
                  <InputComErro
                    label="Telefone"
                    valor={formVendedor.telefone}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, telefone: formatarTelefone(valor) }))}
                    placeholder="(11) 99999-9999"
                    erro={formErrors.telefone}
                    obrigatorio
                    maxLength={15}
                  />
                  
                  <InputComErro
                    label="Login"
                    valor={formVendedor.login}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, login: valor }))}
                    placeholder="usuario123"
                    erro={formErrors.login}
                    obrigatorio
                  />
                  
                  <InputComErro
                    label="Senha"
                    valor={formVendedor.senha}
                    onChange={(valor) => setFormVendedor(prev => ({ ...prev, senha: valor }))}
                    tipo="password"
                    placeholder="Mínimo 6 caracteres"
                    erro={formErrors.senha}
                    obrigatorio
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${tema.texto}`}>Status</label>
                    <select
                      value={formVendedor.status}
                      onChange={(e) => setFormVendedor(prev => ({ ...prev, status: e.target.value }))}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={fecharModal}
                    disabled={salvando}
                    className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover} disabled:opacity-50`}
                  >
                    <X className="mr-2 h-4 w-4 inline" />
                    Cancelar
                  </button>
                  <button
                    onClick={salvarVendedor}
                    disabled={salvando}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {salvando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modalExclusaoAberto && vendedorParaExcluir && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={fecharModalExclusao}></div>
            
            <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg leading-6 font-medium ${tema.texto}`}>
                      Confirmar Exclusão
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${tema.textoSecundario}`}>
                        Tem certeza que deseja excluir o vendedor <strong>"{vendedorParaExcluir.nome}"</strong>?
                      </p>
                      <p className={`text-sm ${tema.textoSecundario} mt-1`}>
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  type="button"
                  onClick={confirmarExclusao}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={fecharModalExclusao}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${tema.borda} shadow-sm px-4 py-2 ${tema.papel} text-base font-medium ${tema.texto} ${tema.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Componente principal
const App = () => {
  // Estados principais
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [telaAtiva, setTelaAtiva] = useState('dashboard');
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Estados de dados
  const [vendedores, setVendedores] = useState<Vendedor[]>(VENDEDORES_INICIAIS);
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_INICIAIS);
  const [consignacoes, setConsignacoes] = useState<Consignacao[]>(CONSIGNACOES_INICIAIS);
  
  // Estado de mensagem
  const [mensagem, setMensagem] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);

  const tema = useTema(temaEscuro);

  // Funções memoizadas
  const toggleTema = useCallback(() => {
    setTemaEscuro(prev => !prev);
  }, []);

  const mostrarMensagem = useCallback((tipo: 'success' | 'error', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 4000);
  }, []);

  const fazerLogin = useCallback((login: string, senha: string) => {
    if (login === 'admin' && senha === 'admin123') {
      setUsuarioLogado({ id: 0, nome: 'Administrador', login: 'admin' });
      setTipoUsuario('admin');
      return;
    }

    const vendedor = vendedores.find(v => 
      v.login === login && 
      v.senha === senha && 
      v.status === 'Ativo'
    );

    if (vendedor) {
      setUsuarioLogado(vendedor);
      setTipoUsuario('vendedor');
    } else {
      alert('Login ou senha inválidos!');
    }
  }, [vendedores]);

  const fazerLogout = useCallback(() => {
    setUsuarioLogado(null);
    setTipoUsuario(null);
    setTelaAtiva('dashboard');
  }, []);

  const mudarTela = useCallback((tela: string) => {
    setTelaAtiva(tela);
  }, []);

  const fecharMenu = useCallback(() => {
    setMenuAberto(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuAberto(prev => !prev);
  }, []);

  // Context value memoizado
  const contextValue = useMemo(() => ({
    temaEscuro,
    setTemaEscuro,
    usuarioLogado,
    tipoUsuario,
    tema,
    vendedores,
    produtos,
    categorias,
    consignacoes,
    setVendedores,
    setProdutos,
    setCategorias,
    setConsignacoes,
    mostrarMensagem
  }), [
    temaEscuro,
    usuarioLogado,
    tipoUsuario,
    tema,
    vendedores,
    produtos,
    categorias,
    consignacoes,
    mostrarMensagem
  ]);

  // Componente de conteúdo memoizado
  const renderConteudo = useCallback(() => {
    switch (telaAtiva) {
      case 'consignacoes':
        return <TelaConsignacoes />;
      case 'vendedores':
        return <TelaVendedores />;
      case 'produtos':
        return <TelaProdutos />;
      case 'categorias':
        return <TelaCategorias />;
      default:
        return <Dashboard />;
    }
  }, [telaAtiva]);

  // Tela de Login
  if (!usuarioLogado) {
    return (
      <Login 
        onLogin={fazerLogin}
        temaEscuro={temaEscuro}
        onToggleTema={toggleTema}
      />
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen ${tema.fundo} flex`}>
        {/* Backdrop para mobile */}
        {menuAberto && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={fecharMenu}
          />
        )}

        {/* Menu Lateral */}
        <MenuLateral 
          telaAtiva={telaAtiva}
          onMudarTela={mudarTela}
          menuAberto={menuAberto}
          onFecharMenu={fecharMenu}
          tipoUsuario={tipoUsuario}
          usuarioLogado={usuarioLogado}
          onToggleTema={toggleTema}
          onLogout={fazerLogout}
          temaEscuro={temaEscuro}
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:ml-0">
          {/* Header Mobile */}
          <div className={`${tema.papel} shadow-sm border-b ${tema.borda} lg:hidden`}>
            <div className="px-4 py-3 flex items-center">
              <button
                onClick={toggleMenu}
                className={`${tema.texto}`}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Área de Conteúdo */}
          <main className="min-h-screen">
            {renderConteudo()}
          </main>
        </div>

        {/* Mensagens */}
        <Mensagem mensagem={mensagem} />
      </div>
    </AppContext.Provider>
  );
};

export default App;