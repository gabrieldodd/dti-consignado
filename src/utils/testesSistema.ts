// src/utils/testesSistema.ts
import { supabase } from '../lib/supabase';

// Script para testar todas as funcionalidades do sistema
export const executarTestesCompletos = async () => {
  console.log('🧪 INICIANDO TESTES COMPLETOS DO SISTEMA');
  console.log('='.repeat(60));
  
  const resultados = {
    conexao: false,
    vendedores: false,
    produtos: false,
    categorias: false,
    consignacoes: false,
    erros: []
  };

  try {
    // 1. TESTE DE CONEXÃO
    console.log('\n🔌 1. TESTANDO CONEXÃO COM SUPABASE');
    console.log('-'.repeat(40));
    
    const { data: pingData, error: pingError } = await supabase
      .from('vendedores')
      .select('count')
      .limit(1);
    
    if (pingError) {
      console.error('❌ Falha na conexão:', pingError.message);
      resultados.erros.push(`Conexão: ${pingError.message}`);
      return resultados;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    resultados.conexao = true;

    // 2. TESTE DE VENDEDORES
    console.log('\n👥 2. TESTANDO TABELA VENDEDORES');
    console.log('-'.repeat(40));
    
    try {
      // Buscar vendedores
      const { data: vendedores, error: vendedoresError } = await supabase
        .from('vendedores')
        .select('*')
        .limit(5);
      
      if (vendedoresError) {
        throw vendedoresError;
      }
      
      console.log(`✅ Vendedores encontrados: ${vendedores?.length || 0}`);
      
      if (vendedores && vendedores.length > 0) {
        console.log('📋 Estrutura do vendedor:', Object.keys(vendedores[0]).join(', '));
      }
      
      resultados.vendedores = true;
    } catch (err: any) {
      console.error('❌ Erro nos vendedores:', err.message);
      resultados.erros.push(`Vendedores: ${err.message}`);
    }

    // 3. TESTE DE PRODUTOS
    console.log('\n📦 3. TESTANDO TABELA PRODUTOS');
    console.log('-'.repeat(40));
    
    try {
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('*')
        .limit(5);
      
      if (produtosError) {
        throw produtosError;
      }
      
      console.log(`✅ Produtos encontrados: ${produtos?.length || 0}`);
      
      if (produtos && produtos.length > 0) {
        console.log('📋 Estrutura do produto:', Object.keys(produtos[0]).join(', '));
      }
      
      resultados.produtos = true;
    } catch (err: any) {
      console.error('❌ Erro nos produtos:', err.message);
      resultados.erros.push(`Produtos: ${err.message}`);
    }

    // 4. TESTE DE CATEGORIAS
    console.log('\n🏷️ 4. TESTANDO TABELA CATEGORIAS');
    console.log('-'.repeat(40));
    
    try {
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .limit(5);
      
      if (categoriasError) {
        throw categoriasError;
      }
      
      console.log(`✅ Categorias encontradas: ${categorias?.length || 0}`);
      
      if (categorias && categorias.length > 0) {
        console.log('📋 Estrutura da categoria:', Object.keys(categorias[0]).join(', '));
      }
      
      resultados.categorias = true;
    } catch (err: any) {
      console.error('❌ Erro nas categorias:', err.message);
      resultados.erros.push(`Categorias: ${err.message}`);
    }

    // 5. TESTE DE CONSIGNAÇÕES
    console.log('\n📋 5. TESTANDO TABELA CONSIGNAÇÕES');
    console.log('-'.repeat(40));
    
    try {
      const { data: consignacoes, error: consignacoesError } = await supabase
        .from('consignacoes')
        .select(`
          *,
          vendedores (
            id,
            nome,
            email
          )
        `)
        .limit(5);
      
      if (consignacoesError) {
        throw consignacoesError;
      }
      
      console.log(`✅ Consignações encontradas: ${consignacoes?.length || 0}`);
      
      if (consignacoes && consignacoes.length > 0) {
        console.log('📋 Estrutura da consignação:', Object.keys(consignacoes[0]).join(', '));
        
        // Verificar se o relacionamento com vendedores funciona
        if (consignacoes[0].vendedores) {
          console.log('✅ Relacionamento com vendedores OK');
        }
      }
      
      resultados.consignacoes = true;
    } catch (err: any) {
      console.error('❌ Erro nas consignações:', err.message);
      resultados.erros.push(`Consignações: ${err.message}`);
    }

    // 6. TESTE DE INSERÇÃO (OPCIONAL)
    console.log('\n🧪 6. TESTE DE INSERÇÃO (CATEGORIA DE TESTE)');
    console.log('-'.repeat(40));
    
    try {
      // Criar uma categoria de teste
      const categoriaTest = {
        nome: 'TESTE_' + Date.now(),
        descricao: 'Categoria criada para teste',
        cor: '#FF0000',
        ativa: true,
        data_cadastro: new Date().toISOString().split('T')[0]
      };
      
      const { data: novaCategoria, error: insertError } = await supabase
        .from('categorias')
        .insert([categoriaTest])
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      console.log('✅ Inserção de teste bem-sucedida:', novaCategoria);
      
      // Excluir a categoria de teste
      if (novaCategoria && novaCategoria[0]?.id) {
        const { error: deleteError } = await supabase
          .from('categorias')
          .delete()
          .eq('id', novaCategoria[0].id);
        
        if (deleteError) {
          console.error('⚠️ Erro ao excluir categoria de teste:', deleteError.message);
        } else {
          console.log('✅ Categoria de teste removida');
        }
      }
      
    } catch (err: any) {
      console.error('❌ Erro no teste de inserção:', err.message);
      resultados.erros.push(`Inserção: ${err.message}`);
    }

  } catch (erro: any) {
    console.error('💥 Erro geral nos testes:', erro);
    resultados.erros.push(`Erro geral: ${erro.message}`);
  }

  // RESUMO FINAL
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('='.repeat(30));
  console.log('Conexão:', resultados.conexao ? '✅ OK' : '❌ FALHA');
  console.log('Vendedores:', resultados.vendedores ? '✅ OK' : '❌ FALHA');
  console.log('Produtos:', resultados.produtos ? '✅ OK' : '❌ FALHA');
  console.log('Categorias:', resultados.categorias ? '✅ OK' : '❌ FALHA');
  console.log('Consignações:', resultados.consignacoes ? '✅ OK' : '❌ FALHA');
  
  const sucessos = Object.values(resultados).filter(r => r === true).length;
  const total = 5; // número de testes principais
  
  console.log(`\n🎯 RESULTADO: ${sucessos}/${total} testes passaram`);
  
  if (resultados.erros.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    resultados.erros.forEach((erro, index) => {
      console.log(`${index + 1}. ${erro}`);
    });
    
    console.log('\n💡 DICAS PARA RESOLVER:');
    if (resultados.erros.some(e => e.includes('column') && e.includes('does not exist'))) {
      console.log('- Execute o SQL de correção para adicionar colunas faltantes');
    }
    if (resultados.erros.some(e => e.includes('relation') && e.includes('does not exist'))) {
      console.log('- Verifique se todas as tabelas foram criadas no Supabase');
    }
    if (resultados.erros.some(e => e.includes('JWT') || e.includes('Invalid API key'))) {
      console.log('- Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
    }
  } else {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.');
  }

  return resultados;
};

// Função para criar dados de exemplo se não existirem
export const criarDadosExemplo = async () => {
  console.log('📝 CRIANDO DADOS DE EXEMPLO');
  console.log('='.repeat(40));
  
  try {
    // 1. Criar vendedor admin se não existir
    const { data: vendedorAdmin, error: vendedorError } = await supabase
      .from('vendedores')
      .select('id')
      .eq('login', 'admin')
      .single();
    
    if (vendedorError && vendedorError.code === 'PGRST116') {
      // Vendedor admin não existe, criar
      console.log('➕ Criando vendedor administrador...');
      
      const { error: insertError } = await supabase
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
      
      if (insertError) {
        console.error('❌ Erro ao criar admin:', insertError.message);
      } else {
        console.log('✅ Administrador criado (login: admin, senha: admin123)');
      }
    } else if (!vendedorError) {
      console.log('ℹ️ Vendedor administrador já existe');
    }

    // 2. Criar categoria exemplo se não existir
    const { data: categorias } = await supabase
      .from('categorias')
      .select('id')
      .limit(1);
    
    if (!categorias || categorias.length === 0) {
      console.log('➕ Criando categoria de exemplo...');
      
      const { error: categoriaError } = await supabase
        .from('categorias')
        .insert([{
          nome: 'Eletrônicos',
          descricao: 'Produtos eletrônicos diversos',
          cor: '#3B82F6',
          ativa: true,
          data_cadastro: new Date().toISOString().split('T')[0]
        }]);
      
      if (categoriaError) {
        console.error('❌ Erro ao criar categoria:', categoriaError.message);
      } else {
        console.log('✅ Categoria de exemplo criada');
      }
    }

    console.log('\n🎉 Configuração inicial concluída!');
    
  } catch (error: any) {
    console.error('💥 Erro ao criar dados de exemplo:', error.message);
  }
};

// Função para executar no console do navegador
export const executarDiagnosticoCompleto = async () => {
  console.log('🚀 EXECUTANDO DIAGNÓSTICO COMPLETO');
  console.log('='.repeat(60));
  
  // 1. Executar testes
  const resultados = await executarTestesCompletos();
  
  // 2. Se algum teste falhou, tentar criar dados de exemplo
  if (resultados.erros.length > 0) {
    console.log('\n🔧 Tentando resolver problemas...');
    await criarDadosExemplo();
    
    // 3. Executar testes novamente
    console.log('\n🔄 Executando testes novamente...');
    await executarTestesCompletos();
  }
  
  return resultados;
};