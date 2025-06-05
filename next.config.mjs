/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizeCss: true // Mantendo esta opção se suportada na sua versão do Next.js
  }
};

export default nextConfig; 