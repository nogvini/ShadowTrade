import type { Metadata, Viewport } from 'next';
import './globals.css'; // Importa os estilos globais
import { AppProvider } from '@/contexts/AppContext'; // Ajuste o caminho se necessário

// Metadata para SEO e informações da página
export const metadata: Metadata = {
  title: 'Raid S&S - Configuração de Trading',
  description: 'Interface para configuração de contas de trading Owner, Shadow e Slave.',
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
    <html lang="pt-BR">
      <body className={`bg-bg-primary text-text-primary font-press-start antialiased`}>
        <AppProvider>
          {/* Aqui podemos adicionar Providers globais no futuro, como o ThemeProvider ou ContextProviders */}
          {children}
        </AppProvider>
      </body>
    </html>
  );
} 