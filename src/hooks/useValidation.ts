// src/hooks/useValidation.ts
import { useCallback } from 'react';

export const useValidation = () => {
  // Validar email
  const validarEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validar telefone brasileiro
  const validarTelefone = useCallback((telefone: string): boolean => {
    const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return telefoneRegex.test(telefone);
  }, []);

  // Validar CPF
  const validarCPF = useCallback((cpf: string): boolean => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpf)) return false;

    // Validação mais completa do CPF
    const numeros = cpf.replace(/\D/g, '');
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numeros)) return false;

    // Calcular primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numeros.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    const dv1 = resto > 9 ? 0 : resto;

    // Calcular segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numeros.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    const dv2 = resto > 9 ? 0 : resto;

    return dv1 === parseInt(numeros.charAt(9)) && dv2 === parseInt(numeros.charAt(10));
  }, []);

  // Validar CNPJ
  const validarCNPJ = useCallback((cnpj: string): boolean => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjRegex.test(cnpj)) return false;

    const numeros = cnpj.replace(/\D/g, '');
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(numeros)) return false;

    // Validação dos dígitos verificadores
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(numeros.charAt(i)) * pesos1[i];
    }
    let resto = soma % 11;
    const dv1 = resto < 2 ? 0 : 11 - resto;

    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(numeros.charAt(i)) * pesos2[i];
    }
    resto = soma % 11;
    const dv2 = resto < 2 ? 0 : 11 - resto;

    return dv1 === parseInt(numeros.charAt(12)) && dv2 === parseInt(numeros.charAt(13));
  }, []);

  // Validar código de barras
  const validarCodigoBarras = useCallback((codigo: string): boolean => {
    const numeros = codigo.replace(/\D/g, '');
    return numeros.length >= 8 && numeros.length <= 14;
  }, []);

  // Validar se valor é positivo
  const validarValorPositivo = useCallback((valor: number): boolean => {
    return !isNaN(valor) && valor > 0;
  }, []);

  // Validar se valor não é negativo
  const validarValorNaoNegativo = useCallback((valor: number): boolean => {
    return !isNaN(valor) && valor >= 0;
  }, []);

  return {
    validarEmail,
    validarTelefone,
    validarCPF,
    validarCNPJ,
    validarCodigoBarras,
    validarValorPositivo,
    validarValorNaoNegativo
  };
};