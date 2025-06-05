'use client';

import { useState, useCallback } from 'react';
import { useAppState } from '@/contexts/AppContext'; // Para interagir com isLoading global ou erros globais, se necessário

// TValidationFn: uma função que recebe dados do tipo D e retorna um objeto de erros Record<string, string>
// TSubmitFn: uma função assíncrona que recebe dados do tipo D e retorna uma Promise<boolean> (sucesso/falha)
interface UseApiValidationOptions<D, R> {
  initialData: D;
  validationFn: (data: D) => Record<string, string>;
  apiSubmitFn: (data: D) => Promise<R>; // Função que realmente faz a chamada (ex: do AppContext)
  onSubmitSuccess?: (response: R) => void;
  onSubmitError?: (error: any) => void;
}

interface UseApiValidationReturn<D, R> {
  formData: D;
  setFormData: React.Dispatch<React.SetStateAction<D>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: () => Promise<R | null>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSubmitting: boolean; // Estado de loading local para esta submissão específica
  submissionError: string | null; // Erro específico desta submissão
}

/**
 * Hook genérico para gerenciar o estado de um formulário, validação e submissão de API.
 * Este hook é mais um gerenciador de formulário com validação integrada antes de chamar uma função de submissão de API.
 * Os estados globais de isLoading e errors do AppContext ainda são a fonte principal para feedback de UI geral.
 */
export function useApiForm<D, R = boolean>(
  options: UseApiValidationOptions<D, R>
): UseApiValidationReturn<D, R> {
  const { initialData, validationFn, apiSubmitFn, onSubmitSuccess, onSubmitError } = options;
  const [formData, setFormData] = useState<D>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // Acessar o contexto global para, por exemplo, limpar erros globais ou ler o isLoading global
  // const { clearGlobalError, isLoading: isGlobalLoading } = useAppState(); 

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | boolean = value;
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Limpar erro do campo ao mudar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Limpar erro de submissão geral
    if (submissionError) setSubmissionError(null);
    // Exemplo: clearGlobalError(name); // Se os erros também fossem globais por campo
  }, [errors, submissionError]);

  const handleSubmit = useCallback(async (): Promise<R | null> => {
    setErrors({});
    setSubmissionError(null);
    const validationErrors = validationFn(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return null;
    }

    setIsSubmitting(true);
    try {
      const response = await apiSubmitFn(formData);
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
      // Resetar form ou erros aqui se necessário, ou deixar para o onSubmitSuccess lidar.
      // Ex: setFormData(initialData); 
      return response;
    } catch (err: any) {      
      const errorMessage = err.message || 'Ocorreu um erro ao submeter.';
      setSubmissionError(errorMessage);
      if (onSubmitError) {
        onSubmitError(err);
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationFn, apiSubmitFn, onSubmitSuccess, onSubmitError, initialData]);

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    errors,
    setErrors,
    isSubmitting,
    submissionError
  };
}

// Este hook foi nomeado useApiForm para refletir melhor sua funcionalidade atual.
// O nome original `useApiValidation` pode ser usado se o foco mudar para apenas validação de esquemas de API.

console.log('useApiValidation.ts (aliased as useApiForm) loaded - Hook genérico para formulários e submissão.'); 