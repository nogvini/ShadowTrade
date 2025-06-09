import type { Metadata, Viewport } from 'next';
import './globals.css'; // Importa os estilos globais
import { AppProvider } from '@/contexts/AppContext'; // Ajuste o caminho se necessário
import { AuthProvider } from '@/contexts/auth-context'; // Provider de autenticação
import DevCleanup from '@/components/DevCleanup'; // Limpeza de atributos extras
import '@/utils/suppressWarnings'; // Suprime warnings de desenvolvimento

// Metadata para SEO e informações da página
export const metadata: Metadata = {
  title: 'ShadowTrade - Sistema de Trading Hierárquico',
  description: 'Plataforma completa para gerenciamento de contas de trading Owner, Shadow e Slave com monitoramento em tempo real.',
  icons: { icon: "/favicon.ico" },
};

// Viewport export separado conforme recomendação do Next.js 14
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`bg-bg-primary text-text-primary font-press-start antialiased`} suppressHydrationWarning>
        <DevCleanup />
        <AuthProvider>
          <AppProvider>
            {/* Aqui podemos adicionar Providers globais no futuro, como o ThemeProvider ou ContextProviders */}
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 