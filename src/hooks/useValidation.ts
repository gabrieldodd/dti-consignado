// src/hooks/useValidation.ts
import { useCallback } from 'react';
import * as validators from '../utils/validators';

/**
 * Hook para funções de validação
 */
export const useValidation = () => {
  const validarEmail = useCallback((email: string) => {
    return validators.validarEmail(email);
  }, []);

  const validarTelefone = useCallback((telefone: string) => {
    return validators.validarTelefone(telefone);
  }, []);

  const validarCPF = useCallback((cpf: string) => {
    return validators.validarCPF(cpf);
  }, []);

  const validarCNPJ = useCallback((cnpj: string) => {
    return validators.validarCNPJ(cnpj);
  }, []);

  const validarCodigoBarras = useCallback((codigo: string) => {
    return validators.validarCodigoBarras(codigo);
  }, []);

  const validarNome = useCallback((nome: string) => {
    return validators.validarNome(nome);
  }, []);

  const validarLogin = useCallback((login: string) => {
    return validators.validarLogin(login);
  }, []);

  const validarSenha = useCallback((senha: string) => {
    return validators.validarSenha(senha);
  }, []);

  const validarValorPositivo = useCallback((valor: number) => {
    return validators.validarValorPositivo(valor);
  }, []);

  const validarValorNaoNegativo = useCallback((valor: number) => {
    return validators.validarValorNaoNegativo(valor);
  }, []);

  return {
    validarEmail,
    validarTelefone,
    validarCPF,
    validarCNPJ,
    validarCodigoBarras,
    validarNome,
    validarLogin,
    validarSenha,
    validarValorPositivo,
    validarValorNaoNegativo
  };
};