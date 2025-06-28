// src/hooks/useValidation.ts
import { useCallback } from 'react';

export const useValidation = () => {
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

  const validarSenha = useCallback((senha: string) => {
    return senha.length >= 6;
  }, []);

  const validarNome = useCallback((nome: string) => {
    return nome.trim().length >= 2;
  }, []);

  const validarLogin = useCallback((login: string) => {
    return login.trim().length >= 3;
  }, []);

  return {
    validarEmail,
    validarTelefone,
    validarCPF,
    validarCNPJ,
    validarCodigoBarras,
    validarSenha,
    validarNome,
    validarLogin
  };
};