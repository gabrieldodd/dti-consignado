// src/utils/validators.ts
import { VALIDATION_RULES } from './constants';

/**
 * Valida um endereço de email
 */
export const validarEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

/**
 * Valida um número de telefone no formato (XX) XXXXX-XXXX
 */
export const validarTelefone = (telefone: string): boolean => {
  return VALIDATION_RULES.TELEFONE_REGEX.test(telefone);
};

/**
 * Valida um CPF no formato XXX.XXX.XXX-XX
 */
export const validarCPF = (cpf: string): boolean => {
  return VALIDATION_RULES.CPF_REGEX.test(cpf);
};

/**
 * Valida um CNPJ no formato XX.XXX.XXX/XXXX-XX
 */
export const validarCNPJ = (cnpj: string): boolean => {
  return VALIDATION_RULES.CNPJ_REGEX.test(cnpj);
};

/**
 * Valida um código de barras (mínimo 8 dígitos numéricos)
 */
export const validarCodigoBarras = (codigo: string): boolean => {
  return codigo.length >= VALIDATION_RULES.MIN_CODIGO_BARRAS_LENGTH && /^\d+$/.test(codigo);
};

/**
 * Valida se um nome tem o tamanho mínimo
 */
export const validarNome = (nome: string): boolean => {
  return nome.trim().length >= VALIDATION_RULES.MIN_NOME_LENGTH;
};

/**
 * Valida se um login tem o tamanho mínimo
 */
export const validarLogin = (login: string): boolean => {
  return login.trim().length >= VALIDATION_RULES.MIN_LOGIN_LENGTH;
};

/**
 * Valida se uma senha tem o tamanho mínimo
 */
export const validarSenha = (senha: string): boolean => {
  return senha.length >= VALIDATION_RULES.MIN_SENHA_LENGTH;
};

/**
 * Valida se um valor numérico é positivo
 */
export const validarValorPositivo = (valor: number): boolean => {
  return !isNaN(valor) && valor > 0;
};

/**
 * Valida se um valor numérico não é negativo
 */
export const validarValorNaoNegativo = (valor: number): boolean => {
  return !isNaN(valor) && valor >= 0;
};