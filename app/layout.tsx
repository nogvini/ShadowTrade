import type { Metadata } from 'next';
import './globals.css'; // Importa os estilos globais
import { AppProvider } from '@/contexts/AppContext'; // Ajuste o caminho se necessário

// Metadata para SEO e informações da página
export const metadata: Metadata = {
  title: 'Raid S&S - Configuração de Trading',
  description: 'Interface para configuração de contas de trading Owner, Shadow e Slave.',
  // Adicionar mais metadados conforme necessário, como viewport, theme-color, icons etc.
  viewport: 'width=device-width, initial-scale=1',
  icons: { icon: "/favicon.ico" }, // Certifique-se de ter um favicon.ico na pasta public
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