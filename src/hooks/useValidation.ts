// src/hooks/useValidation.ts
import { useCallback } from 'react';

/**
 * Hook customizado para validações
 */
export const useValidation = () => {
  // Validar email
  const validarEmail = useCallback((email: string): boolean => {
    if (!email) return false;
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  // Validar telefone brasileiro
  const validarTelefone = useCallback((telefone: string): boolean => {
    if (!telefone) return false;
    
    const limpo = telefone.replace(/\D/g, '');
    return limpo.length >= 10 && limpo.length <= 11;
  }, []);

  // Validar CPF
  const validarCPF = useCallback((cpf: string): boolean => {
    if (!cpf) return false;
    
    const limpo = cpf.replace(/\D/g, '');
    
    if (limpo.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(limpo)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(limpo.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(limpo.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.charAt(10))) return false;
    
    return true;
  }, []);

  // Validar CNPJ
  const validarCNPJ = useCallback((cnpj: string): boolean => {
    if (!cnpj) return false;
    
    const limpo = cnpj.replace(/\D/g, '');
    
    if (limpo.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(limpo)) return false;
    
    // Validar primeiro dígito verificador
    let tamanho = limpo.length - 2;
    let numeros = limpo.substring(0, tamanho);
    let digitos = limpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Validar segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = limpo.substring(0, tamanho);
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

  // Validar documento (CPF ou CNPJ)
  const validarDocumento = useCallback((documento: string): boolean => {
    if (!documento) return false;
    
    const limpo = documento.replace(/\D/g, '');
    
    if (limpo.length === 11) {
      return validarCPF(documento);
    } else if (limpo.length === 14) {
      return validarCNPJ(documento);
    }
    
    return false;
  }, [validarCPF, validarCNPJ]);

  // Validar CEP
  const validarCEP = useCallback((cep: string): boolean => {
    if (!cep) return false;
    
    const limpo = cep.replace(/\D/g, '');
    return limpo.length === 8;
  }, []);

  // Validar senha forte
  const validarSenhaForte = useCallback((senha: string): {
    valida: boolean;
    erros: string[];
  } => {
    const erros: string[] = [];
    
    if (!senha) {
      erros.push('Senha é obrigatória');
      return { valida: false, erros };
    }
    
    if (senha.length < 8) {
      erros.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(senha)) {
      erros.push('Senha deve ter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(senha)) {
      erros.push('Senha deve ter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(senha)) {
      erros.push('Senha deve ter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
      erros.push('Senha deve ter pelo menos um caractere especial');
    }
    
    return { valida: erros.length === 0, erros };
  }, []);

  // Validar URL
  const validarURL = useCallback((url: string): boolean => {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Validar número positivo
  const validarNumeroPositivo = useCallback((numero: any): boolean => {
    const num = Number(numero);
    return !isNaN(num) && num > 0;
  }, []);

  // Validar número inteiro
  const validarInteiro = useCallback((numero: any): boolean => {
    const num = Number(numero);
    return !isNaN(num) && Number.isInteger(num);
  }, []);

  // Validar campo obrigatório
  const validarObrigatorio = useCallback((valor: any): boolean => {
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string') return valor.trim().length > 0;
    if (Array.isArray(valor)) return valor.length > 0;
    return true;
  }, []);

  // Validar tamanho mínimo
  const validarTamanhoMinimo = useCallback((valor: string, minimo: number): boolean => {
    if (!valor) return false;
    return valor.length >= minimo;
  }, []);

  // Validar tamanho máximo
  const validarTamanhoMaximo = useCallback((valor: string, maximo: number): boolean => {
    if (!valor) return true; // Se vazio, não valida tamanho
    return valor.length <= maximo;
  }, []);

  // Validar data no futuro
  const validarDataFutura = useCallback((data: string | Date): boolean => {
    if (!data) return false;
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj > new Date();
  }, []);

  // Validar data no passado
  const validarDataPassada = useCallback((data: string | Date): boolean => {
    if (!data) return false;
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj < new Date();
  }, []);

  // Validar idade mínima
  const validarIdadeMinima = useCallback((dataNascimento: string | Date, idadeMinima: number): boolean => {
    if (!dataNascimento) return false;
    
    const nascimento = typeof dataNascimento === 'string' ? new Date(dataNascimento) : dataNascimento;
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      return (idade - 1) >= idadeMinima;
    }
    
    return idade >= idadeMinima;
  }, []);

  return {
    validarEmail,
    validarTelefone,
    validarCPF,
    validarCNPJ,
    validarDocumento,
    validarCEP,
    validarSenhaForte,
    validarURL,
    validarNumeroPositivo,
    validarInteiro,
    validarObrigatorio,
    validarTamanhoMinimo,
    validarTamanhoMaximo,
    validarDataFutura,
    validarDataPassada,
    validarIdadeMinima
  };
};