'use client'; // Necessário se formos usar hooks de estado ou interações de cliente aqui diretamente

import Header from '@/components/Header';
import ProgressIndicator from '@/components/ProgressIndicator';
import OwnerStep from '@/components/OwnerStep'; // Importar OwnerStep
import ShadowStep from '@/components/ShadowStep'; // Importar ShadowStep
import SlaveStep from '@/components/SlaveStep'; // Importar SlaveStep
import ShadowConfigModal from '@/components/ShadowConfigModal'; // Importar ShadowConfigModal
import SlaveConfigModal from '@/components/SlaveConfigModal'; // Importar SlaveConfigModal
import { useAppState } from '@/contexts/AppContext'; // Importar para checar o estado
// Importaremos SlaveConfigModal aqui posteriormente

export default function HomePage() {
  const { isOwnerConfigured, currentStep } = useAppState(); // Simplificado, currentStep deve ser suficiente

  return (
    <div className="flex flex-col min-h-screen items-center p-4 md:p-8 pt-[80px] md:pt-[100px]">
      <Header />
      <ProgressIndicator />
      <main className="w-full max-w-4xl flex flex-col items-center gap-8 md:gap-12 mt-4 md:mt-0">
        {/* Etapa 1: Configuração do Owner */}
        {currentStep === 1 && (
          <OwnerStep />
        )}

        {/* Etapa 2: Configuração de Shadow e Slave */}
        {currentStep === 2 && isOwnerConfigured && (
          <div className="w-full flex flex-col md:flex-row justify-around items-stretch gap-8 md:gap-12 mt-6">
            <ShadowStep />
            <SlaveStep />
          </div>
        )}

        {/* Fallback: Caso inicial ou estado inesperado antes do contexto carregar completamente */}
        {currentStep !== 1 && !(currentStep === 2 && isOwnerConfigured) && (
             <div className="text-center p-10 border border-dashed border-bg-tertiary rounded-lg w-full mt-8 min-h-[200px] flex justify-center items-center">
                <p className="text-sm text-text-secondary">
                    Carregando interface de configuração...
                </p>
            </div>
        )}
      </main>
      
      {/* Modais Globais */}
      <ShadowConfigModal />
      <SlaveConfigModal />

      <footer className="w-full max-w-4xl mt-12 md:mt-16 py-4 text-center">
        <p className="text-xs text-text-secondary/70">
          Raid S&S &copy; {new Date().getFullYear()} - Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
} 