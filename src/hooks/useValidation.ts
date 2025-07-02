// src/hooks/useValidation.ts
import { useCallback } from 'react';

export const useValidation = () => {
  // Validador de CPF
  const validarCPF = useCallback((cpf: string): boolean => {
    // Remove formatação
    const numerosCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (numerosCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numerosCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numerosCPF.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numerosCPF.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numerosCPF.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numerosCPF.charAt(10))) return false;
    
    return true;
  }, []);

  // Validador de CNPJ
  const validarCNPJ = useCallback((cnpj: string): boolean => {
    // Remove formatação
    const numerosCNPJ = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (numerosCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(numerosCNPJ)) return false;
    
    // Validação do primeiro dígito verificador
    let tamanho = numerosCNPJ.length - 2;
    let numeros = numerosCNPJ.substring(0, tamanho);
    let digitos = numerosCNPJ.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Validação do segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = numerosCNPJ.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  }, []);

  // Validador de email
  const validarEmail = useCallback((email: string): boolean => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email.trim().toLowerCase());
  }, []);

  // Validador de telefone
  const validarTelefone = useCallback((telefone: string): boolean => {
    const numerosTelefone = telefone.replace(/\D/g, '');
    // Aceita telefones com 10 ou 11 dígitos (fixo ou celular)
    return numerosTelefone.length >= 10 && numerosTelefone.length <= 11;
  }, []);

  // Validador de CEP
  const validarCEP = useCallback((cep: string): boolean => {
    const numerosCEP = cep.replace(/\D/g, '');
    return numerosCEP.length === 8;
  }, []);

  // Validador de senha forte
  const validarSenhaForte = useCallback((senha: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    if (senha.length < 8) {
      errors.push('Deve ter pelo menos 8 caracteres');
    }
    
    if (!/[a-z]/.test(senha)) {
      errors.push('Deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[A-Z]/.test(senha)) {
      errors.push('Deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/\d/.test(senha)) {
      errors.push('Deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
      errors.push('Deve conter pelo menos um caractere especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Validador de código de barras (formato simples)
  const validarCodigoBarras = useCallback((codigo: string): boolean => {
    const numerosCodigo = codigo.replace(/\D/g, '');
    // Aceita códigos com 8, 12, 13 ou 14 dígitos (formatos comuns)
    const formatosValidos = [8, 12, 13, 14];
    return formatosValidos.includes(numerosCodigo.length);
  }, []);

  // Validador de URL
  const validarURL = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Validador de idade mínima
  const validarIdadeMinima = useCallback((dataNascimento: string, idadeMinima: number = 18): boolean => {
    try {
      const nascimento = new Date(dataNascimento);
      const hoje = new Date();
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      const mês = hoje.getMonth() - nascimento.getMonth();
      
      if (mês < 0 || (mês === 0 && hoje.getDate() < nascimento.getDate())) {
        return idade - 1 >= idadeMinima;
      }
      
      return idade >= idadeMinima;
    } catch {
      return false;
    }
  }, []);

  // Validador de campo obrigatório
  const validarObrigatorio = useCallback((valor: any): boolean => {
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string') return valor.trim().length > 0;
    if (typeof valor === 'number') return !isNaN(valor);
    if (Array.isArray(valor)) return valor.length > 0;
    return true;
  }, []);

  // Validador de tamanho mínimo
  const validarTamanhoMinimo = useCallback((valor: string, tamanhoMinimo: number): boolean => {
    return valor.trim().length >= tamanhoMinimo;
  }, []);

  // Validador de tamanho máximo
  const validarTamanhoMaximo = useCallback((valor: string, tamanhoMaximo: number): boolean => {
    return valor.trim().length <= tamanhoMaximo;
  }, []);

  // Validador de valor numérico
  const validarNumero = useCallback((valor: string): boolean => {
    return !isNaN(parseFloat(valor)) && isFinite(parseFloat(valor));
  }, []);

  // Validador de valor numérico positivo
  const validarNumeroPositivo = useCallback((valor: string | number): boolean => {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return !isNaN(numero) && numero > 0;
  }, []);

  // Validador de valor numérico não negativo
  const validarNumeroNaoNegativo = useCallback((valor: string | number): boolean => {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return !isNaN(numero) && numero >= 0;
  }, []);

  // Validador de intervalo numérico
  const validarIntervalo = useCallback((valor: number, min: number, max: number): boolean => {
    return valor >= min && valor <= max;
  }, []);

  // Validador de data futura
  const validarDataFutura = useCallback((data: string): boolean => {
    try {
      const dataObj = new Date(data);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Remove horas para comparar apenas datas
      return dataObj > hoje;
    } catch {
      return false;
    }
  }, []);

  // Validador de data passada
  const validarDataPassada = useCallback((data: string): boolean => {
    try {
      const dataObj = new Date(data);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Final do dia atual
      return dataObj < hoje;
    } catch {
      return false;
    }
  }, []);

  // Validador de formato de arquivo
  const validarFormatoArquivo = useCallback((nomeArquivo: string, formatosPermitidos: string[]): boolean => {
    const extensao = nomeArquivo.split('.').pop()?.toLowerCase();
    return extensao ? formatosPermitidos.includes(extensao) : false;
  }, []);

  // Validador de tamanho de arquivo
  const validarTamanhoArquivo = useCallback((arquivo: File, tamanhoMaximoMB: number): boolean => {
    const tamanhoMaximoBytes = tamanhoMaximoMB * 1024 * 1024;
    return arquivo.size <= tamanhoMaximoBytes;
  }, []);

  // Validador de confirmação de senha
  const validarConfirmacaoSenha = useCallback((senha: string, confirmacao: string): boolean => {
    return senha === confirmacao && senha.length > 0;
  }, []);

  return {
    // Validadores de documentos
    validarCPF,
    validarCNPJ,
    
    // Validadores de contato
    validarEmail,
    validarTelefone,
    validarCEP,
    
    // Validadores de segurança
    validarSenhaForte,
    validarConfirmacaoSenha,
    
    // Validadores de produtos
    validarCodigoBarras,
    
    // Validadores genéricos
    validarURL,
    validarIdadeMinima,
    validarObrigatorio,
    validarTamanhoMinimo,
    validarTamanhoMaximo,
    
    // Validadores numéricos
    validarNumero,
    validarNumeroPositivo,
    validarNumeroNaoNegativo,
    validarIntervalo,
    
    // Validadores de data
    validarDataFutura,
    validarDataPassada,
    
    // Validadores de arquivo
    validarFormatoArquivo,
    validarTamanhoArquivo
  };
};