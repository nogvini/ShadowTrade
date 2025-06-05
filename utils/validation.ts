// utils/validation.ts

// Exemplo de uma função de validação genérica (pode ser expandida ou removida se não for usada)
/**
 * Valida se um valor de string não está vazio.
 * @param value A string a ser validada.
 * @param fieldName O nome do campo para a mensagem de erro.
 * @returns Uma string de erro se inválido, caso contrário null.
 */
export const validateRequiredString = (
  value: string | undefined | null,
  fieldName: string
): string | null => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return `${fieldName} é obrigatório(a).`;
  }
  return null;
};

/**
 * Valida se um valor numérico é positivo.
 * @param value O número a ser validado.
 * @param fieldName O nome do campo para a mensagem de erro.
 * @returns Uma string de erro se inválido, caso contrário null.
 */
export const validatePositiveNumber = (
  value: number | undefined | null,
  fieldName: string
): string | null => {
  if (value === undefined || value === null || typeof value !== 'number' || value <= 0) {
    return `${fieldName} deve ser um número positivo.`;
  }
  return null;
};

// Funções de validação específicas para cada tipo de configuração de conta.
// Estas foram mantidas nos componentes por enquanto devido à sua especificidade,
// mas poderiam ser movidas para cá se houvesse mais reutilização ou complexidade.

/* 
Exemplo de como poderia ser uma validação de API Config mais centralizada:

import { OwnerFormData, ShadowFormData, SlaveFormData } from '@/types';

export const validateOwnerApiConfig = (config: Partial<OwnerFormData>): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!config.apiKey?.trim()) errors.apiKey = 'API Key é obrigatória.';
  if (!config.apiSecret?.trim()) errors.apiSecret = 'API Secret é obrigatório.';
  if (!config.passphrase?.trim()) errors.passphrase = 'Passphrase é obrigatória.';
  return errors;
};
*/

// Por enquanto, este arquivo pode servir como um local para futuras funções de validação reutilizáveis.
console.log('validation.ts loaded - Adicione funções de validação reutilizáveis aqui.'); 