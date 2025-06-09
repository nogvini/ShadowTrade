/**
 * Utilitário para suprimir warnings específicos durante o desenvolvimento
 */

// Suprime warnings específicos do console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Lista de warnings para suprimir
    const warningsToSuppress = [
      'Extra attributes from the server',
      'data-gptw',
      'Hydration failed',
      'There was an error while hydrating'
    ];

    // Verifica se o warning deve ser suprimido
    const shouldSuppress = warningsToSuppress.some(warning => 
      message.includes(warning)
    );

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  console.error = (...args) => {
    const message = args.join(' ');
    
    // Lista de erros para suprimir (apenas warnings disfarçados de erro)
    const errorsToSuppress = [
      'Warning: Extra attributes from the server',
      'data-gptw'
    ];

    // Verifica se o erro deve ser suprimido
    const shouldSuppress = errorsToSuppress.some(error => 
      message.includes(error)
    );

    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };
}

/**
 * Função para verificar se um elemento tem atributos extras do servidor
 */
export function hasServerExtraAttributes(element: Element): boolean {
  const extraAttributes = ['data-gptw', 'data-new-gr-c-s-check-loaded'];
  return extraAttributes.some(attr => element.hasAttribute(attr));
}

/**
 * Função para limpar atributos extras de extensões do browser
 */
export function cleanExtraAttributes(element: Element): void {
  const extraAttributes = ['data-gptw', 'data-new-gr-c-s-check-loaded'];
  extraAttributes.forEach(attr => {
    if (element.hasAttribute(attr)) {
      element.removeAttribute(attr);
    }
  });
}

/**
 * Hook para limpar atributos extras automaticamente
 */
export function useCleanExtraAttributes() {
  if (typeof window !== 'undefined') {
    // Limpa atributos extras do body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          cleanExtraAttributes(target);
        }
      });
    });

    // Observa mudanças no body
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-gptw', 'data-new-gr-c-s-check-loaded']
    });

    // Cleanup inicial
    cleanExtraAttributes(document.body);
    cleanExtraAttributes(document.documentElement);

    return () => observer.disconnect();
  }
} 