/**
 * Mascara uma API key, mostrando apenas os primeiros e últimos caracteres.
 * @param apiKey A chave de API a ser mascarada.
 * @param visibleCharsStart Número de caracteres visíveis no início (padrão: 4).
 * @param visibleCharsEnd Número de caracteres visíveis no final (padrão: 4).
 * @param maskChar Caractere usado para mascaramento (padrão: '*').
 * @returns A API key mascarada ou a original se for muito curta.
 */
export const maskApiKey = (
  apiKey: string | undefined | null,
  visibleCharsStart: number = 4,
  visibleCharsEnd: number = 4,
  maskChar: string = '*'
): string => {
  if (!apiKey || typeof apiKey !== 'string') {
    return 'Inválida'; // Ou string vazia, dependendo do comportamento desejado
  }

  const totalVisibleChars = visibleCharsStart + visibleCharsEnd;
  if (apiKey.length <= totalVisibleChars) {
    // Se a chave for muito curta para mascarar significativamente, retorne-a como está
    // ou uma versão totalmente mascarada de comprimento similar, se preferir.
    // Por ora, retornaremos como está para evitar mostrar apenas asteriscos para chaves curtas.
    return apiKey; 
  }

  const start = apiKey.slice(0, visibleCharsStart);
  const end = apiKey.slice(-visibleCharsEnd);
  const middleLength = apiKey.length - totalVisibleChars;
  const middle = maskChar.repeat(Math.max(0, middleLength)); // Garante que não seja negativo

  return `${start}${middle}${end}`;
}; 