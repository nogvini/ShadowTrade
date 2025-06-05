# Tasks - Raid S&S
*Source of Truth para gerenciamento de tarefas*

## Status Geral
- **Projeto**: 🔴 Não Iniciado
- **Memory Bank**: ✅ Configurado
- **Próxima Fase**: IMPLEMENT

---

## 📋 BACKLOG PRINCIPAL

### 🏗️ FASE 1: Estrutura Base (Priority: HIGH)
- [ ] **T001**: Criar estrutura Next.js com TypeScript
  - [ ] Configurar package.json
  - [ ] Configurar next.config.mjs
  - [ ] Configurar tsconfig.json
  - [ ] Configurar tailwind.config.ts
- [ ] **T002**: Configurar CSS global e variáveis
  - [ ] Implementar app/globals.css
  - [ ] Configurar fonte Press Start 2P
  - [ ] Definir paleta de cores CSS
- [ ] **T003**: Criar tipos TypeScript fundamentais
  - [ ] types/index.ts com interfaces
  - [ ] AccountConfig, ShadowAccountConfig, SlaveAccountConfig
  - [ ] AppState e tipos auxiliares

### 🎨 FASE 2: Componentes Base (Priority: HIGH)
- [ ] **T004**: Implementar componentes UI base
  - [ ] components/ui/Button.tsx
  - [ ] components/ui/Input.tsx
  - [ ] components/ui/Modal.tsx
  - [ ] components/ui/Card.tsx
- [ ] **T005**: Criar layout principal
  - [ ] app/layout.tsx
  - [ ] app/page.tsx
  - [ ] components/Header.tsx
- [ ] **T006**: Implementar sistema de estado
  - [ ] hooks/useAppState.ts
  - [ ] Context API setup
  - [ ] Estado global funcional

### 🔧 FASE 3: Indicador de Progresso (Priority: MEDIUM)
- [ ] **T007**: Componente ProgressIndicator
  - [ ] Estrutura visual das 2 etapas
  - [ ] Estados: ativo, completado, pendente
  - [ ] Conectores visuais entre etapas
  - [ ] Layout em pirâmide quando Step 1 completo

### 👑 FASE 4: Owner Step (Priority: HIGH)
- [ ] **T008**: Componente OwnerStep
  - [ ] Formulário com 3 campos (API Key, Secret, Passphrase)
  - [ ] Validação obrigatória de campos
  - [ ] Botão "Connect API" com estado loading
- [ ] **T009**: Funcionalidades Owner
  - [ ] Simulação de conexão API (delay + resultado)
  - [ ] Mascaramento de API key após sucesso
  - [ ] Status visual de conexão
  - [ ] Possibilidade de reconfiguração

### 👤 FASE 5: Shadow Step (Priority: HIGH)
- [ ] **T010**: Componente ShadowStep
  - [ ] Card clicável com ícone de configuração
  - [ ] Modal de configuração
  - [ ] Efeitos visuais especiais (borda + sombra)
- [ ] **T011**: Modal Shadow Configuration
  - [ ] Campos: API Key, Secret, Passphrase, Quantidade
  - [ ] Checkbox "Shadow Close"
  - [ ] Campo "Take Profit" (condicional)
  - [ ] Validação e salvamento
- [ ] **T012**: Efeitos Visuais Shadow
  - [ ] Borda esquerda destacada
  - [ ] Sombra visual no card
  - [ ] Texto sobrescrito com desalinhamento

### ⛓️ FASE 6: Slave Step (Priority: HIGH)
- [ ] **T013**: Componente SlaveStep
  - [ ] Card com tema correntes
  - [ ] Modal de configuração básica
  - [ ] Efeitos de borda picotada
- [ ] **T014**: Modal Slave Configuration
  - [ ] Campos: API Key, Secret, Passphrase, Quantidade
  - [ ] Validação e salvamento
  - [ ] Estados de loading/sucesso
- [ ] **T015**: Efeitos Visuais Slave
  - [ ] Borda picotada simulando corrente
  - [ ] Animação de corrente no topo
  - [ ] Efeito "rodeando" o componente

### 🔧 FASE 7: Utilitários (Priority: MEDIUM)
- [ ] **T016**: Implementar utilitários
  - [ ] utils/validation.ts
  - [ ] utils/api-mask.ts
  - [ ] utils/constants.ts
- [ ] **T017**: Hook de validação API
  - [ ] hooks/useApiValidation.ts
  - [ ] Lógica de validação reutilizável
  - [ ] Estados de erro/sucesso

### 📱 FASE 8: Responsividade (Priority: MEDIUM)
- [ ] **T018**: Adaptações Mobile
  - [ ] Layout stack vertical em mobile
  - [ ] Modal fullscreen em mobile
  - [ ] Touch interactions
- [ ] **T019**: Adaptações Tablet/Desktop
  - [ ] Grid layout apropriado
  - [ ] Modal centralizado
  - [ ] Layout pirâmide visual

### ✨ FASE 9: Animações e Polish (Priority: LOW)
- [ ] **T020**: Animações suaves
  - [ ] Transições 0.3s ease
  - [ ] Hover effects nos cards
  - [ ] Pulse nos indicadores
  - [ ] Glow effects nas bordas
- [ ] **T021**: Estados Loading realistas
  - [ ] Texto "Connecting..." / "Saving..."
  - [ ] Desabilitação de botões
  - [ ] Simulação de tempo real

### 🧪 FASE 10: Testing & QA (Priority: LOW)
- [ ] **T022**: Testes manuais
  - [ ] Fluxo completo end-to-end
  - [ ] Validação em diferentes resoluções
  - [ ] Estados de erro/sucesso
- [ ] **T023**: Refinamentos finais
  - [ ] Ajustes visuais
  - [ ] Performance optimization
  - [ ] Documentação inline

---

## 🎯 MILESTONE TRACKING

### Milestone 1: Base Structure ✅
- [ ] Projeto Next.js funcionando
- [ ] TypeScript configurado
- [ ] Tailwind funcionando
- [ ] Estrutura de pastas criada

### Milestone 2: Core Components
- [ ] Header + Layout implementado
- [ ] Sistema de estado funcionando
- [ ] Componentes UI base criados
- [ ] ProgressIndicator funcional

### Milestone 3: Owner Flow
- [ ] OwnerStep completamente funcional
- [ ] Validação de API implementada
- [ ] Mascaramento funcionando
- [ ] Estados visuais corretos

### Milestone 4: Shadow & Slave
- [ ] ShadowStep com efeitos especiais
- [ ] SlaveStep com tema correntes
- [ ] Modais de configuração funcionais
- [ ] Validações implementadas

### Milestone 5: Polish & Delivery
- [ ] Responsividade completa
- [ ] Animações implementadas
- [ ] Testes manuais aprovados
- [ ] Aplicação pronta para deploy

---

## 🔄 STATUS LEGEND
- 🔴 **Não Iniciado**
- 🟡 **Em Progresso**  
- ✅ **Completo**
- ⚠️ **Bloqueado**
- 🔄 **Em Review**

---

## 📝 NOTAS DE DESENVOLVIMENTO
- **Foco**: Experiência visual imersiva
- **Qualidade**: Preferir simplicidade sobre complexidade
- **Performance**: Build estático otimizado
- **UX**: Feedback visual constante e intuitivo 