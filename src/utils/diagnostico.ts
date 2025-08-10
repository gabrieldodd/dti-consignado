// src/utils/diagnostico.ts
import { supabase } from '../lib/supabase';

export const executarDiagnostico = async () => {
  console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DO SISTEMA');
  console.log('='.repeat(50));
  
  const resultados = {
    conexao: false,
    variaveis: false,
    tabelas: {},
    erros: []
  };

  try {
    // 1. VERIFICAR VARIÁVEIS DE AMBIENTE
    console.log('📋 1. Verificando variáveis de ambiente...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente não configuradas!');
      resultados.erros.push('Variáveis de ambiente não configuradas');
      return resultados;
    }
    
    console.log('✅ URL:', supabaseUrl);
    console.log('✅ Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Não definida');
    resultados.variaveis = true;

    // 2. TESTAR CONEXÃO BÁSICA
    console.log('\n🌐 2. Testando conexão...');
    
    const { data: pingData, error: pingError } = await supabase
      .from('vendedores')
      .select('count')
      .limit(1);
    
    if (pingError) {
      console.error('❌ Erro de conexão:', pingError.message);
      resultados.erros.push(`Conexão: ${pingError.message}`);
      return resultados;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    resultados.conexao = true;

    // 3. VERIFICAR ESTRUTURA DAS TABELAS
    console.log('\n📊 3. Verificando estrutura das tabelas...');
    
    const tabelas = ['vendedores', 'produtos', 'categorias', 'consignacoes'];
    
    for (const tabela of tabelas) {
      try {
        console.log(`\n📋 Analisando tabela: ${tabela}`);
        
        // Verificar se existe e contar registros
        const { data: countData, error: countError } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error(`❌ Erro na tabela ${tabela}:`, countError.message);
          resultados.erros.push(`Tabela ${tabela}: ${countError.message}`);
          resultados.tabelas[tabela] = { existe: false, erro: countError.message };
          continue;
        }
        
        // Pegar algumas linhas para ver a estrutura
        const { data: sampleData, error: sampleError } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);
        
        if (sampleError) {
          console.error(`❌ Erro ao ler amostra da tabela ${tabela}:`, sampleError.message);
          resultados.erros.push(`Amostra ${tabela}: ${sampleError.message}`);
        }
        
        const registro = sampleData?.[0];
        const colunas = registro ? Object.keys(registro) : [];
        
        console.log(`✅ Tabela ${tabela} existe`);
        console.log(`📊 Colunas encontradas:`, colunas.join(', '));
        
        resultados.tabelas[tabela] = {
          existe: true,
          colunas: colunas,
          amostra: registro
        };
        
      } catch (err: any) {
        console.error(`💥 Erro crítico na tabela ${tabela}:`, err);
        resultados.erros.push(`Crítico ${tabela}: ${err.message}`);
        resultados.tabelas[tabela] = { existe: false, erro: err.message };
      }
    }

    // 4. VERIFICAR COLUNAS ESPECÍFICAS PROBLEMÁTICAS
    console.log('\n🔍 4. Verificando colunas problemáticas...');
    
    // Verificar se data_vencimento existe em consignacoes
    const consignacoesColunas = resultados.tabelas['consignacoes']?.colunas || [];
    
    if (!consignacoesColunas.includes('data_vencimento')) {
      console.log('⚠️ Coluna data_vencimento não encontrada em consignacoes');
      console.log('💡 Solução: Execute o SQL de correção para adicionar a coluna');
    }
    
    // Verificar colunas essenciais
    const colunasEssenciais = {
      consignacoes: [
        'id', 'cliente_nome', 'cliente_documento', 'vendedor_id', 
        'valor_total', 'data_consignacao', 'status'
      ],
      produtos: [
        'id', 'nome', 'categoria', 'valor_venda', 'estoque'
      ],
      vendedores: [
        'id', 'nome', 'email', 'login', 'senha', 'status'
      ]
    };
    
    for (const [tabela, colunasRequeridas] of Object.entries(colunasEssenciais)) {
      const colunasExistentes = resultados.tabelas[tabela]?.colunas || [];
      const faltando = colunasRequeridas.filter(col => !colunasExistentes.includes(col));
      
      if (faltando.length > 0) {
        console.log(`❌ Colunas faltando em ${tabela}:`, faltando.join(', '));
        resultados.erros.push(`Colunas faltando em ${tabela}: ${faltando.join(', ')}`);
      } else {
        console.log(`✅ Todas as colunas essenciais existem em ${tabela}`);
      }
    }

    // 5. TESTAR OPERAÇÕES BÁSICAS
    console.log('\n🧪 5. Testando operações básicas...');
    
    try {
      // Testar SELECT
      const { data: vendedorTest } = await supabase
        .from('vendedores')
        .select('id, nome')
        .limit(1);
      
      console.log('✅ SELECT funcionando');
      
      // Se não há vendedores, sugerir criação
      if (!vendedorTest || vendedorTest.length === 0) {
        console.log('⚠️ Nenhum vendedor encontrado. Isso pode causar problemas ao criar consignações.');
      }
      
    } catch (err: any) {
      console.error('❌ Erro em operações básicas:', err.message);
      resultados.erros.push(`Operações básicas: ${err.message}`);
    }

  } catch (erro: any) {
    console.error('💥 Erro geral no diagnóstico:', erro);
    resultados.erros.push(`Erro geral: ${erro.message}`);
  }

  // RESUMO FINAL
  console.log('\n📋 RESUMO DO DIAGNÓSTICO');
  console.log('='.repeat(30));
  console.log('Conexão:', resultados.conexao ? '✅ OK' : '❌ FALHA');
  console.log('Variáveis:', resultados.variaveis ? '✅ OK' : '❌ FALHA');
  console.log('Tabelas verificadas:', Object.keys(resultados.tabelas).length);
  console.log('Erros encontrados:', resultados.erros.length);
  
  if (resultados.erros.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    resultados.erros.forEach((erro, index) => {
      console.log(`${index + 1}. ${erro}`);
    });
  } else {
    console.log('\n🎉 Nenhum erro crítico encontrado!');
  }

  return resultados;
};

// Função para executar correções automáticas
export const executarCorrecoes = async () => {
  console.log('🔧 EXECUTANDO CORREÇÕES AUTOMÁTICAS');
  
  try {
    // Criar um vendedor padrão se não existir nenhum
    const { data: vendedores } = await supabase
      .from('vendedores')
      .select('id')
      .limit(1);
    
    if (!vendedores || vendedores.length === 0) {
      console.log('➕ Criando vendedor padrão...');
      
      const { error: vendedorError } = await supabase
        .from('vendedores')
        .insert([{
          nome: 'Administrador',
          email: 'admin@sistema.com',
          telefone: '(11) 99999-9999',
          status: 'Ativo',
          login: 'admin',
          senha: 'admin123',
          data_cadastro: new Date().toISOString().split('T')[0]
        }]);
      
      if (vendedorError) {
        console.error('❌ Erro ao criar vendedor:', vendedorError.message);
      } else {
        console.log('✅ Vendedor padrão criado (login: admin, senha: admin123)');
      }
    }
    
    // Criar categoria padrão se não existir
    const { data: categorias } = await supabase
      .from('categorias')
      .select('id')
      .limit(1);
    
    if (!categorias || categorias.length === 0) {
      console.log('➕ Criando categoria padrão...');
      
      const { error: categoriaError } = await supabase
        .from('categorias')
        .insert([{
          nome: 'Geral',
          descricao: 'Categoria padrão',
          cor: '#3B82F6',
          ativa: true,
          data_cadastro: new Date().toISOString().split('T')[0]
        }]);
      
      if (categoriaError) {
        console.error('❌ Erro ao criar categoria:', categoriaError.message);
      } else {
        console.log('✅ Categoria padrão criada');
      }
    }
    
  } catch (erro: any) {
    console.error('💥 Erro nas correções:', erro.message);
  }
};