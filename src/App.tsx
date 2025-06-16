import { useState } from 'react';
import { Users, Package, FileText, BarChart3, Plus, Edit, Trash2, Eye, Save, X, Menu, Moon, Sun, LogOut, Search, AlertCircle, CheckCircle, Package2, DollarSign, Hash, Tag } from 'lucide-react';

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

interface FormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  login?: string;
  senha?: string;
  // Produtos
  nomeProduto?: string;
  codigoBarras?: string;
  valorCusto?: string;
  valorVenda?: string;
  estoque?: string;
  estoqueMinimo?: string;
  // Categorias
  nomeCategoria?: string;
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
  ]);

  const [produtos, setProdutos] = useState<Produto[]>([
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
  ]);

  const [categorias, setCategorias] = useState<Categoria[]>([
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
  ]);

  // Cores disponíveis para categorias
  const coresDisponiveis = [
    { valor: 'blue', nome: 'Azul', classe: 'bg-blue-100 text-blue-800' },
    { valor: 'green', nome: 'Verde', classe: 'bg-green-100 text-green-800' },
    { valor: 'yellow', nome: 'Amarelo', classe: 'bg-yellow-100 text-yellow-800' },
    { valor: 'purple', nome: 'Roxo', classe: 'bg-purple-100 text-purple-800' },
    { valor: 'red', nome: 'Vermelho', classe: 'bg-red-100 text-red-800' },
    { valor: 'pink', nome: 'Rosa', classe: 'bg-pink-100 text-pink-800' },
    { valor: 'indigo', nome: 'Índigo', classe: 'bg-indigo-100 text-indigo-800' },
    { valor: 'gray', nome: 'Cinza', classe: 'bg-gray-100 text-gray-800' }
  ];

  // Estados do modal e validação - Vendedores
  const [modalVendedorAberto, setModalVendedorAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [formVendedor, setFormVendedor] = useState({
    nome: '',
    email: '',
    telefone: '',
    status: 'Ativo',
    login: '',
    senha: ''
  });

  // Estados do modal e validação - Produtos
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    codigoBarras: '',
    categoria: 'Eletrônicos',
    valorCusto: '',
    valorVenda: '',
    estoque: '',
    estoqueMinimo: '',
    ativo: true
  });

  // Estados do modal e validação - Categorias
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [formCategoria, setFormCategoria] = useState({
    nome: '',
    descricao: '',
    cor: 'blue',
    ativa: true
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [salvando, setSalvando] = useState(false);

  // Estados de filtro e busca - Vendedores
  const [filtroStatusVendedor, setFiltroStatusVendedor] = useState('todos');
  const [buscaTextoVendedor, setBuscaTextoVendedor] = useState('');

  // Estados de filtro e busca - Produtos
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatusProduto, setFiltroStatusProduto] = useState('todos');
  const [buscaTextoProduto, setBuscaTextoProduto] = useState('');

  // Estados de feedback
  const [mensagem, setMensagem] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);

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

  // Função para mostrar mensagens
  const mostrarMensagem = (tipo: 'success' | 'error', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 4000);
  };

  // Validações - Vendedores
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarTelefone = (telefone: string) => {
    const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return regex.test(telefone);
  };

  // Validações - Produtos
  const validarCodigoBarras = (codigo: string) => {
    // Aceita códigos de 8, 12, 13 ou 14 dígitos
    const regex = /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/;
    return regex.test(codigo);
  };

  const formatarMoeda = (valor: string) => {
    const nums = valor.replace(/\D/g, '');
    const valorFloat = parseFloat(nums) / 100;
    return valorFloat.toFixed(2);
  };

  const validarFormularioVendedor = () => {
    const errors: FormErrors = {};

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validarFormularioProduto = () => {
    const errors: FormErrors = {};

    if (!formProduto.nome.trim()) {
      errors.nomeProduto = 'Nome é obrigatório';
    } else if (formProduto.nome.length < 2) {
      errors.nomeProduto = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formProduto.codigoBarras.trim()) {
      errors.codigoBarras = 'Código de barras é obrigatório';
    } else if (!validarCodigoBarras(formProduto.codigoBarras)) {
      errors.codigoBarras = 'Código deve ter 8, 12, 13 ou 14 dígitos';
    } else {
      const codigoExiste = produtos.some(p => 
        p.codigoBarras === formProduto.codigoBarras && 
        p.id !== produtoEditando?.id
      );
      if (codigoExiste) {
        errors.codigoBarras = 'Este código já está em uso';
      }
    }

    const valorCusto = parseFloat(formProduto.valorCusto);
    if (!formProduto.valorCusto.trim()) {
      errors.valorCusto = 'Valor de custo é obrigatório';
    } else if (isNaN(valorCusto) || valorCusto <= 0) {
      errors.valorCusto = 'Valor deve ser maior que zero';
    }

    const valorVenda = parseFloat(formProduto.valorVenda);
    if (!formProduto.valorVenda.trim()) {
      errors.valorVenda = 'Valor de venda é obrigatório';
    } else if (isNaN(valorVenda) || valorVenda <= 0) {
      errors.valorVenda = 'Valor deve ser maior que zero';
    } else if (valorVenda <= valorCusto) {
      errors.valorVenda = 'Valor de venda deve ser maior que o custo';
    }

    const estoque = parseInt(formProduto.estoque);
    if (!formProduto.estoque.trim()) {
      errors.estoque = 'Estoque é obrigatório';
    } else if (isNaN(estoque) || estoque < 0) {
      errors.estoque = 'Estoque deve ser maior ou igual a zero';
    }

    const estoqueMinimo = parseInt(formProduto.estoqueMinimo);
    if (!formProduto.estoqueMinimo.trim()) {
      errors.estoqueMinimo = 'Estoque mínimo é obrigatório';
    } else if (isNaN(estoqueMinimo) || estoqueMinimo < 0) {
      errors.estoqueMinimo = 'Estoque mínimo deve ser maior ou igual a zero';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validarFormularioCategoria = () => {
    const errors: FormErrors = {};

    if (!formCategoria.nome.trim()) {
      errors.nomeCategoria = 'Nome é obrigatório';
    } else if (formCategoria.nome.length < 2) {
      errors.nomeCategoria = 'Nome deve ter pelo menos 2 caracteres';
    } else {
      // Verificar se nome já existe
      const nomeExiste = categorias.some(c => 
        c.nome.toLowerCase() === formCategoria.nome.toLowerCase() && 
        c.id !== categoriaEditando?.id
      );
      if (nomeExiste) {
        errors.nomeCategoria = 'Esta categoria já existe';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    setModalVendedorAberto(true);
  };

  const salvarVendedor = async () => {
    if (!validarFormularioVendedor()) {
      mostrarMensagem('error', 'Corrija os erros no formulário');
      return;
    }

    setSalvando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (vendedorEditando) {
        setVendedores(vendedores.map(v => 
          v.id === vendedorEditando.id 
            ? { ...formVendedor, id: vendedorEditando.id, dataCadastro: vendedorEditando.dataCadastro } 
            : v
        ));
        mostrarMensagem('success', 'Vendedor atualizado com sucesso!');
      } else {
        const novoId = Math.max(...vendedores.map(v => v.id)) + 1;
        const novoVendedor = { 
          ...formVendedor, 
          id: novoId,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setVendedores([...vendedores, novoVendedor]);
        mostrarMensagem('success', 'Vendedor criado com sucesso!');
      }
      setModalVendedorAberto(false);
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar vendedor');
    } finally {
      setSalvando(false);
    }
  };

  const excluirVendedor = (vendedor: Vendedor) => {
    if (confirm(`Tem certeza que deseja excluir o vendedor "${vendedor.nome}"?`)) {
      setVendedores(vendedores.filter(v => v.id !== vendedor.id));
      mostrarMensagem('success', 'Vendedor excluído com sucesso!');
    }
  };

  // Funções do produto
  const abrirModalProduto = (produto?: Produto) => {
    const primeiraCategoria = categoriasAtivas.length > 0 ? categoriasAtivas[0].nome : 'Eletrônicos';
    
    if (produto) {
      setProdutoEditando(produto);
      setFormProduto({
        nome: produto.nome,
        descricao: produto.descricao,
        codigoBarras: produto.codigoBarras,
        categoria: produto.categoria,
        valorCusto: produto.valorCusto.toFixed(2),
        valorVenda: produto.valorVenda.toFixed(2),
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
        categoria: primeiraCategoria,
        valorCusto: '',
        valorVenda: '',
        estoque: '',
        estoqueMinimo: '',
        ativo: true
      });
    }
    setFormErrors({});
    setModalProdutoAberto(true);
  };

  const salvarProduto = async () => {
    if (!validarFormularioProduto()) {
      mostrarMensagem('error', 'Corrija os erros no formulário');
      return;
    }

    setSalvando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const produtoData = {
        ...formProduto,
        valorCusto: parseFloat(formProduto.valorCusto),
        valorVenda: parseFloat(formProduto.valorVenda),
        estoque: parseInt(formProduto.estoque),
        estoqueMinimo: parseInt(formProduto.estoqueMinimo)
      };

      if (produtoEditando) {
        setProdutos(produtos.map(p => 
          p.id === produtoEditando.id 
            ? { ...produtoData, id: produtoEditando.id, dataCadastro: produtoEditando.dataCadastro } 
            : p
        ));
        mostrarMensagem('success', 'Produto atualizado com sucesso!');
      } else {
        const novoId = Math.max(...produtos.map(p => p.id)) + 1;
        const novoProduto = { 
          ...produtoData, 
          id: novoId,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setProdutos([...produtos, novoProduto]);
        mostrarMensagem('success', 'Produto criado com sucesso!');
      }
      setModalProdutoAberto(false);
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar produto');
    } finally {
      setSalvando(false);
    }
  };

  const excluirProduto = (produto: Produto) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      setProdutos(produtos.filter(p => p.id !== produto.id));
      mostrarMensagem('success', 'Produto excluído com sucesso!');
    }
  };

  // Funções da categoria
  const obterClasseCor = (cor: string) => {
    const corEncontrada = coresDisponiveis.find(c => c.valor === cor);
    return corEncontrada ? corEncontrada.classe : 'bg-gray-100 text-gray-800';
  };

  const contarProdutosPorCategoria = (nomeCategoria: string) => {
    return produtos.filter(p => p.categoria === nomeCategoria).length;
  };

  const abrirModalCategoria = (categoria?: Categoria) => {
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
    setModalCategoriaAberto(true);
  };

  const salvarCategoria = async () => {
    if (!validarFormularioCategoria()) {
      mostrarMensagem('error', 'Corrija os erros no formulário');
      return;
    }

    setSalvando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (categoriaEditando) {
        // Editar categoria
        const categoriaAtualizada = {
          ...formCategoria,
          id: categoriaEditando.id,
          dataCadastro: categoriaEditando.dataCadastro
        };
        
        setCategorias(categorias.map(c => 
          c.id === categoriaEditando.id ? categoriaAtualizada : c
        ));

        // Atualizar produtos que usam esta categoria
        if (categoriaEditando.nome !== formCategoria.nome) {
          setProdutos(produtos.map(p => 
            p.categoria === categoriaEditando.nome 
              ? { ...p, categoria: formCategoria.nome }
              : p
          ));
        }

        mostrarMensagem('success', 'Categoria atualizada com sucesso!');
      } else {
        // Nova categoria
        const novoId = Math.max(...categorias.map(c => c.id)) + 1;
        const novaCategoria = { 
          ...formCategoria, 
          id: novoId,
          dataCadastro: new Date().toISOString().split('T')[0]
        };
        setCategorias([...categorias, novaCategoria]);
        mostrarMensagem('success', 'Categoria criada com sucesso!');
      }
      setModalCategoriaAberto(false);
    } catch (error) {
      mostrarMensagem('error', 'Erro ao salvar categoria');
    } finally {
      setSalvando(false);
    }
  };

  const excluirCategoria = (categoria: Categoria) => {
    const produtosUsando = contarProdutosPorCategoria(categoria.nome);
    
    if (produtosUsando > 0) {
      mostrarMensagem('error', `Não é possível excluir. Existe ${produtosUsando} produto(s) usando esta categoria.`);
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      setCategorias(categorias.filter(c => c.id !== categoria.id));
      mostrarMensagem('success', 'Categoria excluída com sucesso!');
    }
  };

  // Filtrar dados
  const vendedoresFiltrados = vendedores.filter(vendedor => {
    const passaFiltroStatus = filtroStatusVendedor === 'todos' || vendedor.status.toLowerCase() === filtroStatusVendedor;
    const passaBusca = !buscaTextoVendedor || 
      vendedor.nome.toLowerCase().includes(buscaTextoVendedor.toLowerCase()) ||
      vendedor.email.toLowerCase().includes(buscaTextoVendedor.toLowerCase()) ||
      vendedor.login.toLowerCase().includes(buscaTextoVendedor.toLowerCase());
    
    return passaFiltroStatus && passaBusca;
  });

  const produtosFiltrados = produtos.filter(produto => {
    const passaFiltroCategoria = filtroCategoria === 'todas' || produto.categoria === filtroCategoria;
    const passaFiltroStatus = filtroStatusProduto === 'todos' || 
      (filtroStatusProduto === 'ativo' && produto.ativo) ||
      (filtroStatusProduto === 'inativo' && !produto.ativo) ||
      (filtroStatusProduto === 'estoque_baixo' && produto.estoque <= produto.estoqueMinimo);
    
    const passaBusca = !buscaTextoProduto || 
      produto.nome.toLowerCase().includes(buscaTextoProduto.toLowerCase()) ||
      produto.codigoBarras.includes(buscaTextoProduto) ||
      produto.categoria.toLowerCase().includes(buscaTextoProduto.toLowerCase());
    
    return passaFiltroCategoria && passaFiltroStatus && passaBusca;
  });

  // Filtrar categorias ativas para uso nos selects
  const categoriasAtivas = categorias.filter(c => c.ativa);
  const categoriasParaFiltro = categorias; // Mostrar todas no filtro

  // Formatação
  const formatarTelefone = (valor: string) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  };

  const formatarMoedaBR = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calcular estatísticas
  const produtosAtivos = produtos.filter(p => p.ativo);
  const produtosEstoqueBaixo = produtos.filter(p => p.estoque <= p.estoqueMinimo);
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.valorCusto * p.estoque), 0);

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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
    <div className="px-6 pt-2 pb-4">
      <h2 className={`text-2xl font-bold mb-6 ${tema.texto}`}>Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Vendedores Ativos</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>
                {vendedores.filter(v => v.status === 'Ativo').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Produtos Ativos</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>{produtosAtivos.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Estoque Baixo</p>
              <p className={`text-2xl font-bold ${tema.texto}`}>{produtosEstoqueBaixo.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`${tema.papel} p-6 rounded-lg shadow-sm border ${tema.borda}`}>
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${tema.textoSecundario}`}>Valor Estoque</p>
              <p className={`text-lg font-bold ${tema.texto}`}>{formatarMoedaBR(valorTotalEstoque)}</p>
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
              <span className={tema.texto}>{categoriasAtivas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className={tema.textoSecundario}>Itens em Estoque:</span>
              <span className={tema.texto}>{produtos.reduce((acc, p) => acc + p.estoque, 0)}</span>
            </div>
          </div>
        </div>

        <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6`}>
          <h3 className={`text-lg font-medium mb-4 ${tema.texto}`}>Categorias Populares</h3>
          <div className="space-y-2">
            {categoriasAtivas
              .map(categoria => ({
                ...categoria,
                count: contarProdutosPorCategoria(categoria.nome)
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(categoria => (
                <div key={categoria.id} className={`flex items-center justify-between p-2 rounded ${tema.hover}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obterClasseCor(categoria.cor)}`}>
                      {categoria.nome}
                    </span>
                  </div>
                  <span className={`text-sm ${tema.texto}`}>{categoria.count} produtos</span>
                </div>
              ))
            }
            {categoriasAtivas.length === 0 && (
              <p className={`text-sm ${tema.textoSecundario}`}>Nenhuma categoria ativa encontrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Tela de Vendedores
  const TelaVendedores = () => (
    <div className="px-6 pt-2 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Vendedores</h2>
        <button
          onClick={() => abrirModalVendedor()}
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
              value={buscaTextoVendedor}
              onChange={(e) => setBuscaTextoVendedor(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            />
          </div>
          
          <select
            value={filtroStatusVendedor}
            onChange={(e) => setFiltroStatusVendedor(e.target.value)}
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

      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={temaEscuro ? 'bg-gray-700' : 'bg-gray-50'}>
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
                    onClick={() => abrirModalVendedor(vendedor)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirVendedor(vendedor)}
                    className="text-red-600 hover:text-red-900"
                    title="Excluir"
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
    </div>
  );

  // Tela de Categorias
  const TelaCategorias = () => (
    <div className="px-6 pt-2 pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${tema.texto}`}>Categorias</h2>
          <p className={`text-sm ${tema.textoSecundario} mt-1`}>
            Gerencie as categorias dos produtos
          </p>
        </div>
        <button
          onClick={() => abrirModalCategoria()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map(categoria => {
          const qtdProdutos = contarProdutosPorCategoria(categoria.nome);
          return (
            <div key={categoria.id} className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${obterClasseCor(categoria.cor)}`}>
                    <Tag className="h-4 w-4 mr-1" />
                    {categoria.nome}
                  </span>
                  {!categoria.ativa && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inativa
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => abrirModalCategoria(categoria)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirCategoria(categoria)}
                    className="text-red-600 hover:text-red-900"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className={`text-sm ${tema.textoSecundario}`}>
                  {categoria.descricao || 'Sem descrição'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package2 className="h-4 w-4 text-gray-500" />
                    <span className={`text-sm ${tema.textoSecundario}`}>
                      {qtdProdutos} produto{qtdProdutos !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <span className={`text-xs ${tema.textoSecundario}`}>
                    Criada em {new Date(categoria.dataCadastro).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {qtdProdutos > 0 && (
                  <div className={`mt-3 p-2 rounded ${tema.hover}`}>
                    <p className={`text-xs ${tema.textoSecundario} mb-1`}>Produtos nesta categoria:</p>
                    <div className="flex flex-wrap gap-1">
                      {produtos
                        .filter(p => p.categoria === categoria.nome)
                        .slice(0, 3)
                        .map(produto => (
                          <span key={produto.id} className={`text-xs px-2 py-1 rounded ${tema.hover} ${tema.textoSecundario}`}>
                            {produto.nome.length > 15 ? produto.nome.substring(0, 15) + '...' : produto.nome}
                          </span>
                        ))
                      }
                      {qtdProdutos > 3 && (
                        <span className={`text-xs px-2 py-1 rounded ${tema.hover} ${tema.textoSecundario}`}>
                          +{qtdProdutos - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {categorias.length === 0 && (
        <div className="text-center py-12">
          <Tag className={`mx-auto h-12 w-12 ${tema.textoSecundario}`} />
          <h3 className={`mt-2 text-sm font-medium ${tema.texto}`}>Nenhuma categoria</h3>
          <p className={`mt-1 text-sm ${tema.textoSecundario}`}>
            Comece criando uma nova categoria para seus produtos.
          </p>
          <div className="mt-6">
            <button
              onClick={() => abrirModalCategoria()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 mx-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </button>
          </div>
        </div>
      )}
    </div>
  );
  const TelaProdutos = () => (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${tema.texto}`}>Produtos</h2>
        <button
          onClick={() => {
            if (categoriasAtivas.length === 0) {
              mostrarMensagem('error', 'Crie pelo menos uma categoria ativa antes de adicionar produtos.');
              return;
            }
            abrirModalProduto();
          }}
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
              placeholder="Buscar produto ou código..."
              value={buscaTextoProduto}
              onChange={(e) => setBuscaTextoProduto(e.target.value)}
              className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
            />
          </div>
          
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todas">Todas as categorias</option>
            {categoriasParaFiltro.map(cat => (
              <option key={cat.id} value={cat.nome}>
                {cat.nome} ({contarProdutosPorCategoria(cat.nome)})
              </option>
            ))}
          </select>
          
          <select
            value={filtroStatusProduto}
            onChange={(e) => setFiltroStatusProduto(e.target.value)}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Apenas Ativos</option>
            <option value="inativo">Apenas Inativos</option>
            <option value="estoque_baixo">Estoque Baixo</option>
          </select>
          
          <div className={`flex items-center text-sm ${tema.textoSecundario}`}>
            Mostrando {produtosFiltrados.length} de {produtos.length} produtos
          </div>
        </div>
      </div>

      <div className={`${tema.papel} rounded-lg shadow-sm border ${tema.borda} overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={temaEscuro ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Produto</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Código</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Categoria</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Preços</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Estoque</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${tema.textoSecundario} uppercase tracking-wider`}>Ações</th>
            </tr>
          </thead>
          <tbody className={`${tema.papel} divide-y ${tema.borda}`}>
            {produtosFiltrados.map(produto => (
              <tr key={produto.id} className={tema.hover}>
                <td className={`px-6 py-4 whitespace-nowrap`}>
                  <div>
                    <div className={`text-sm font-medium ${tema.texto}`}>{produto.nome}</div>
                    <div className={`text-xs ${tema.textoSecundario} truncate max-w-xs`}>{produto.descricao}</div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.textoSecundario} font-mono`}>
                  {produto.codigoBarras}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap`}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    obterClasseCor(categorias.find(c => c.nome === produto.categoria)?.cor || 'gray')
                  }`}>
                    {produto.categoria}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                  <div>Custo: {formatarMoedaBR(produto.valorCusto)}</div>
                  <div>Venda: {formatarMoedaBR(produto.valorVenda)}</div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${tema.texto}`}>
                  <div className="flex items-center">
                    <span>{produto.estoque}</span>
                    {produto.estoque <= produto.estoqueMinimo && (
                      <AlertCircle className="h-4 w-4 text-yellow-500 ml-1" title="Estoque baixo" />
                    )}
                  </div>
                  <div className={`text-xs ${tema.textoSecundario}`}>Mín: {produto.estoqueMinimo}</div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => abrirModalProduto(produto)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => excluirProduto(produto)}
                    className="text-red-600 hover:text-red-900"
                    title="Excluir"
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
    </div>
  );

  // Modal de Vendedor
  const ModalVendedor = () => {
    if (!modalVendedorAberto) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && setModalVendedorAberto(false)}></div>
          
          <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                {vendedorEditando ? 'Editar Vendedor' : 'Novo Vendedor'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formVendedor.nome}
                    onChange={(e) => setFormVendedor({ ...formVendedor, nome: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nome ? 'border-red-500' : ''}`}
                    placeholder="Nome completo"
                  />
                  {formErrors.nome && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.nome}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formVendedor.email}
                    onChange={(e) => setFormVendedor({ ...formVendedor, email: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="exemplo@email.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formVendedor.telefone}
                    onChange={(e) => setFormVendedor({ ...formVendedor, telefone: formatarTelefone(e.target.value) })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.telefone ? 'border-red-500' : ''}`}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                  {formErrors.telefone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.telefone}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Login <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formVendedor.login}
                    onChange={(e) => setFormVendedor({ ...formVendedor, login: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.login ? 'border-red-500' : ''}`}
                    placeholder="usuario123"
                  />
                  {formErrors.login && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.login}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formVendedor.senha}
                    onChange={(e) => setFormVendedor({ ...formVendedor, senha: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.senha ? 'border-red-500' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {formErrors.senha && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.senha}
                    </p>
                  )}
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
                  onClick={() => setModalVendedorAberto(false)}
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
    );
  };

  // Modal de Produto
  const ModalProduto = () => {
    if (!modalProdutoAberto) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && setModalProdutoAberto(false)}></div>
          
          <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formProduto.nome}
                    onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nomeProduto ? 'border-red-500' : ''}`}
                    placeholder="Nome do produto"
                  />
                  {formErrors.nomeProduto && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.nomeProduto}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Código de Barras <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formProduto.codigoBarras}
                    onChange={(e) => setFormProduto({ ...formProduto, codigoBarras: e.target.value.replace(/\D/g, '') })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.codigoBarras ? 'border-red-500' : ''} font-mono`}
                    placeholder="7891234567890"
                    maxLength={14}
                  />
                  {formErrors.codigoBarras && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.codigoBarras}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${tema.texto}`}>Descrição</label>
                  <textarea
                    value={formProduto.descricao}
                    onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                    rows={3}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                    placeholder="Descrição detalhada do produto"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Categoria</label>
                  <select
                    value={formProduto.categoria}
                    onChange={(e) => setFormProduto({ ...formProduto, categoria: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                  >
                    {categoriasAtivas.map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                  {categoriasAtivas.length === 0 && (
                    <p className="mt-1 text-sm text-yellow-600">
                      Nenhuma categoria ativa disponível. Crie uma categoria primeiro.
                    </p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formProduto.ativo}
                    onChange={(e) => setFormProduto({ ...formProduto, ativo: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ativo" className={`ml-2 block text-sm ${tema.texto}`}>
                    Produto Ativo
                  </label>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Valor de Custo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProduto.valorCusto}
                    onChange={(e) => setFormProduto({ ...formProduto, valorCusto: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.valorCusto ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {formErrors.valorCusto && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.valorCusto}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Valor de Venda <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProduto.valorVenda}
                    onChange={(e) => setFormProduto({ ...formProduto, valorVenda: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.valorVenda ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {formErrors.valorVenda && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.valorVenda}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Estoque Atual <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formProduto.estoque}
                    onChange={(e) => setFormProduto({ ...formProduto, estoque: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.estoque ? 'border-red-500' : ''}`}
                    placeholder="0"
                  />
                  {formErrors.estoque && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.estoque}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Estoque Mínimo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formProduto.estoqueMinimo}
                    onChange={(e) => setFormProduto({ ...formProduto, estoqueMinimo: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.estoqueMinimo ? 'border-red-500' : ''}`}
                    placeholder="0"
                  />
                  {formErrors.estoqueMinimo && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.estoqueMinimo}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Informações calculadas */}
              {formProduto.valorCusto && formProduto.valorVenda && (
                <div className={`mt-4 p-3 rounded-md ${tema.hover} border ${tema.borda}`}>
                  <h4 className={`text-sm font-medium ${tema.texto} mb-2`}>Informações Calculadas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={tema.textoSecundario}>Margem de Lucro:</span>
                      <span className={`ml-2 font-medium ${tema.texto}`}>
                        {((parseFloat(formProduto.valorVenda) - parseFloat(formProduto.valorCusto)) / parseFloat(formProduto.valorCusto) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className={tema.textoSecundario}>Lucro por Item:</span>
                      <span className={`ml-2 font-medium ${tema.texto}`}>
                        {formatarMoedaBR(parseFloat(formProduto.valorVenda) - parseFloat(formProduto.valorCusto))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setModalProdutoAberto(false)}
                  disabled={salvando}
                  className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover} disabled:opacity-50`}
                >
                  <X className="mr-2 h-4 w-4 inline" />
                  Cancelar
                </button>
                <button
                  onClick={salvarProduto}
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
    );
  };

  // Modal de Categoria
  const ModalCategoria = () => {
    if (!modalCategoriaAberto) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !salvando && setModalCategoriaAberto(false)}></div>
          
          <div className={`inline-block align-bottom ${tema.papel} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className={`text-lg font-medium ${tema.texto} mb-4`}>
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCategoria.nome}
                    onChange={(e) => setFormCategoria({ ...formCategoria, nome: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input} ${formErrors.nomeCategoria ? 'border-red-500' : ''}`}
                    placeholder="Nome da categoria"
                  />
                  {formErrors.nomeCategoria && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.nomeCategoria}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto}`}>Descrição</label>
                  <textarea
                    value={formCategoria.descricao}
                    onChange={(e) => setFormCategoria({ ...formCategoria, descricao: e.target.value })}
                    rows={3}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${tema.input}`}
                    placeholder="Descrição da categoria (opcional)"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${tema.texto} mb-2`}>Cor</label>
                  <div className="grid grid-cols-4 gap-2">
                    {coresDisponiveis.map(cor => (
                      <button
                        key={cor.valor}
                        type="button"
                        onClick={() => setFormCategoria({ ...formCategoria, cor: cor.valor })}
                        className={`p-3 rounded-md border-2 transition-all ${
                          formCategoria.cor === cor.valor 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-6 rounded flex items-center justify-center text-xs font-medium ${cor.classe}`}>
                          {cor.nome}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="categoria-ativa"
                    checked={formCategoria.ativa}
                    onChange={(e) => setFormCategoria({ ...formCategoria, ativa: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="categoria-ativa" className={`ml-2 block text-sm ${tema.texto}`}>
                    Categoria Ativa
                  </label>
                </div>

                {/* Preview da categoria */}
                <div className={`p-3 rounded-md ${tema.hover} border ${tema.borda}`}>
                  <p className={`text-sm font-medium ${tema.texto} mb-2`}>Preview:</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${obterClasseCor(formCategoria.cor)}`}>
                    <Tag className="h-4 w-4 mr-1" />
                    {formCategoria.nome || 'Nome da categoria'}
                  </span>
                  {!formCategoria.ativa && (
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inativa
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setModalCategoriaAberto(false)}
                  disabled={salvando}
                  className={`px-4 py-2 ${tema.texto} border ${tema.borda} rounded-md ${tema.hover} disabled:opacity-50`}
                >
                  <X className="mr-2 h-4 w-4 inline" />
                  Cancelar
                </button>
                <button
                  onClick={salvarCategoria}
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
    );
  };
  const Mensagem = () => {
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
          <>
            <button
              onClick={() => { setTelaAtiva('vendedores'); setMenuAberto(false); }}
              className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'vendedores' ? tema.menuAtivo : ''}`}
            >
              <Users className="mr-3 h-5 w-5" />
              Vendedores
            </button>
            
            <button
              onClick={() => { setTelaAtiva('produtos'); setMenuAberto(false); }}
              className={`w-full flex items-center px-4 py-2 text-left ${tema.texto} ${tema.hover} ${telaAtiva === 'produtos' ? tema.menuAtivo : ''}`}
            >
              <Package className="mr-3 h-5 w-5" />
              Produtos
            </button>
            
            <button
              onClick={() => { setTelaAtiva('categorias'); setMenuAberto(false); }}
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

  const renderTela = () => {
    switch (telaAtiva) {
      case 'vendedores':
        return <TelaVendedores />;
      case 'produtos':
        return <TelaProdutos />;
      case 'categorias':
        return <TelaCategorias />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${tema.fundo} m-0 p-0`}>
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
        <div className={`${tema.papel} shadow-sm border-b ${tema.borda} lg:hidden h-12`}>
          <div className="px-4 py-2 h-full flex items-center">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className={`${tema.texto}`}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="relative min-h-screen">
          {renderTela()}
        </div>
      </div>

      {/* Modals */}
      <ModalVendedor />
      <ModalProduto />
      <ModalCategoria />
      
      {/* Mensagens */}
      <Mensagem />
    </div>
  );
};

export default App;