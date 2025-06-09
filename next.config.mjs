/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Suprime warnings de atributos extras do servidor (como data-gptw de extensões)
  experimental: {
    suppressHydrationWarning: true
  },
  // Configuração adicional para suprimir warnings específicos
  onDemandEntries: {
    // Período em ms para manter as páginas em memória
    maxInactiveAge: 25 * 1000,
    // Número de páginas que devem ser mantidas simultaneamente
    pagesBufferLength: 2,
  }
};

export default nextConfig; 