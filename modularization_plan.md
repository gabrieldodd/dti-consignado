# Plano de Modularização - Sistema de Consignação

## 📁 Estrutura de Pastas Sugerida

```
src/
├── components/
│   ├── common/              # Componentes reutilizáveis
│   │   ├── InputComErro.tsx
│   │   ├── InputSenha.tsx
│   │   ├── Mensagem.tsx
│   │   └── Loading.tsx
│   ├── forms/               # Componentes de formulário
│   │   ├── ConsignacaoForm.tsx
│   │   ├── ProdutoForm.tsx
│   │   ├── VendedorForm.tsx
│   │   └── CategoriaForm.tsx
│   ├── layout/              # Layout e navegação
│   │   ├── MenuLateral.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── modals/              # Modais
│   │   ├── ModalConsignacao.tsx
│   │   ├── ModalRetorno.tsx
│   │   ├── ModalDetalhes.tsx
│   │   └── ModalConfirmacao.tsx
│   └── screens/             # Telas principais
│       ├── Dashboard.tsx
│       ├── TelaConsignacoes.tsx
│       ├── TelaProdutos.tsx
│       ├── TelaVendedores.tsx
│       ├── TelaCategorias.tsx
│       └── Login.tsx
├── hooks/                   # Hooks customizados
│   ├── useTema.ts
│   ├── useValidation.ts
│   ├── useFormatters.ts
│   ├── useCookies.ts
│   └── useLocalStorage.ts
├── contexts/                # Contexts do React
│   ├── AppContext.tsx
│   ├── ThemeContext.tsx
│   └── DataContext.tsx
├── types/                   # Interfaces e tipos
│   ├── Vendedor.ts
│   ├── Produto.ts
│   ├── Categoria.ts
│   ├── Consignacao.ts
│   └── Common.ts
├── utils/                   # Utilitários e helpers
│   ├── validators.ts
│   ├── formatters.ts
│   ├── dateUtils.ts
│   └── constants.ts
├── data/                    # Dados iniciais
│   ├── vendedoresIniciais.ts
│   ├── produtosIniciais.ts
│   ├── categoriasIniciais.ts
│   └── consignacoesIniciais.ts
├── services/                # Serviços (futuro)
│   ├── api.ts
│   └── localStorage.ts
└── App.tsx                  # Arquivo principal simplificado
```

## 🚀 Ordem de Implementação

### Fase 1: Tipos e Interfaces
1. **types/Common.ts** - Tipos comuns
2. **types/Vendedor.ts** - Interface Vendedor
3. **types/Produto.ts** - Interface Produto
4. **types/Categoria.ts** - Interface Categoria
5. **types/Consignacao.ts** - Interface Consignacao

### Fase 2: Utilitários e Hooks
1. **utils/constants.ts** - Constantes e dados estáticos
2. **utils/validators.ts** - Funções de validação
3. **utils/formatters.ts** - Funções de formatação
4. **hooks/useTema.ts** - Hook do tema
5. **hooks/useValidation.ts** - Hook de validação
6. **hooks/useFormatters.ts** - Hook de formatação
7. **hooks/useCookies.ts** - Hook de cookies

### Fase 3: Dados Iniciais
1. **data/vendedoresIniciais.ts**
2. **data/produtosIniciais.ts**
3. **data/categoriasIniciais.ts**
4. **data/consignacoesIniciais.ts**

### Fase 4: Context e Estado Global
1. **contexts/AppContext.tsx** - Context principal
2. **contexts/ThemeContext.tsx** - Context do tema
3. **contexts/DataContext.tsx** - Context dos dados

### Fase 5: Componentes Comuns
1. **components/common/Mensagem.tsx**
2. **components/common/InputComErro.tsx**
3. **components/common/InputSenha.tsx**
4. **components/layout/MenuLateral.tsx**

### Fase 6: Telas Principais
1. **components/screens/Login.tsx**
2. **components/screens/Dashboard.tsx**
3. **components/screens/TelaConsignacoes.tsx**
4. **components/screens/TelaProdutos.tsx**
5. **components/screens/TelaVendedores.tsx**
6. **components/screens/TelaCategorias.tsx**

### Fase 7: Modais e Formulários
1. **components/modals/** - Todos os modais
2. **components/forms/** - Formulários específicos

### Fase 8: App.tsx Refatorado
1. Arquivo principal limpo e organizado

## 🛠️ Benefícios da Modularização

### ✅ Manutenibilidade
- Código mais fácil de entender e modificar
- Cada arquivo tem uma responsabilidade específica
- Facilita debugging e testes

### ✅ Reutilização
- Componentes podem ser reutilizados em diferentes partes
- Hooks customizados podem ser compartilhados
- Utilitários centralizados

### ✅ Colaboração
- Múltiplos desenvolvedores podem trabalhar simultaneamente
- Menos conflitos no Git
- Code review mais eficiente

### ✅ Performance
- Lazy loading de componentes
- Tree shaking mais eficiente
- Bundle splitting otimizado

### ✅ Testes
- Testes unitários mais focados
- Mock de dependências mais fácil
- Cobertura de código melhor

## 📋 Checklist de Migração

- [ ] Criar estrutura de pastas
- [ ] Extrair tipos e interfaces
- [ ] Separar utilitários e hooks
- [ ] Modularizar dados iniciais
- [ ] Criar contexts
- [ ] Extrair componentes comuns
- [ ] Separar telas principais
- [ ] Modularizar modais
- [ ] Refatorar App.tsx
- [ ] Testar funcionalidades
- [ ] Ajustar imports
- [ ] Documentar componentes

## 🔄 Próximos Passos

1. **Começar pelos tipos** - Base sólida para todo o sistema
2. **Extrair utilitários** - Funções puras sem dependências
3. **Modularizar hooks** - Lógica reutilizável
4. **Separar componentes** - UI modular
5. **Testar incrementalmente** - Garantir que nada quebrou

Quer que eu comece criando os primeiros arquivos da modularização?