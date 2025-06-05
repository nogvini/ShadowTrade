'use client'; // Necessário se formos usar hooks de estado ou interações de cliente aqui diretamente

import Header from '@/components/Header';
import ProgressIndicator from '@/components/ProgressIndicator';
import OwnerStep from '@/components/OwnerStep'; // Importar OwnerStep
import ShadowStep from '@/components/ShadowStep'; // Importar ShadowStep
import SlaveStep from '@/components/SlaveStep'; // Importar SlaveStep
import ShadowConfigModal from '@/components/ShadowConfigModal'; // Importar ShadowConfigModal
import SlaveConfigModal from '@/components/SlaveConfigModal'; // Importar SlaveConfigModal
import { LoadingPopup } from '@/components/ui/LoadingPopup'; // Importar LoadingPopup
import { useAppState } from '@/contexts/AppContext'; // Importar para checar o estado
// Importaremos SlaveConfigModal aqui posteriormente

export default function HomePage() {
  const { isOwnerConfigured, currentStep, showLoadingPopup, loadingMessage } = useAppState(); // Incluir loading popup state

  return (
    <div className="flex flex-col min-h-screen items-center p-2 sm:p-4 md:p-8 pt-[70px] sm:pt-[80px] md:pt-[100px]">
      <Header />
      <ProgressIndicator />
      <main className="w-full max-w-4xl xl:max-w-6xl flex flex-col items-center gap-6 sm:gap-8 md:gap-12 mt-2 sm:mt-4 md:mt-0 px-2 sm:px-0">
        {/* Etapa 1: Configuração do Owner */}
        {currentStep === 1 && (
          <OwnerStep />
        )}

        {/* Etapa 2: Configuração de Shadow e Slave */}
        {currentStep === 2 && isOwnerConfigured && (
          <div className="w-full flex flex-col lg:flex-row justify-around items-stretch gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 mt-4 sm:mt-6">
            <ShadowStep />
            <SlaveStep />
          </div>
        )}

        {/* Fallback: Caso inicial ou estado inesperado antes do contexto carregar completamente */}
        {currentStep !== 1 && !(currentStep === 2 && isOwnerConfigured) && (
             <div className="text-center p-6 sm:p-8 md:p-10 border border-dashed border-bg-tertiary rounded-lg w-full mt-6 sm:mt-8 min-h-[200px] flex justify-center items-center shadow-depth light-glow">
                <p className="text-[10px] sm:text-sm text-text-secondary px-2 shadow-text-sm" data-text="Carregando interface de configuração...">
                    Carregando interface de configuração...
                </p>
            </div>
        )}
      </main>
      
      {/* Modais Globais */}
      <ShadowConfigModal />
      <SlaveConfigModal />

      {/* Loading Popup Global */}
      <LoadingPopup 
        isVisible={showLoadingPopup} 
        message={loadingMessage} 
      />

      <footer className="w-full max-w-4xl xl:max-w-6xl mt-8 sm:mt-12 md:mt-16 py-4 text-center px-2">
        <p className="text-[8px] sm:text-xs text-text-secondary/70 shadow-text-sm" data-text={`Raid S&S © ${new Date().getFullYear()} - Todos os direitos reservados.`}>
          Raid S&S &copy; {new Date().getFullYear()} - Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
} 