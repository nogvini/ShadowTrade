# System Patterns - Raid S&S

## Arquitetura de Componentes

### Estrutura Hierárquica
```
App (Estado Global)
├── Header (Logo + Avatar)
├── ProgressIndicator (Etapas)
├── ConfigurationFlow
│   ├── OwnerStep (Etapa 1)
│   ├── ShadowStep (Etapa 2) 
│   └── SlaveStep (Etapa 3)
└── Modal System (Configurações)
```

## Padrões de Estado

### Global State Management
```typescript
interface AppState {
  currentStep: number;
  ownerConfig: OwnerAccountConfig | null;
  shadowConfig: ShadowAccountConfig | null;
  slaveConfig: SlaveAccountConfig | null;
  isLoading: boolean;
  errors: Record<string, string>;
}
```

### Configuration States
```typescript
interface AccountConfig {
  id: string;
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  isConnected: boolean;
  maskedApiKey?: string;
}

interface ShadowAccountConfig extends AccountConfig {
  amount: number;
  shadowClose: boolean;
  takeProfit?: number;
}

interface SlaveAccountConfig extends AccountConfig {
  amount: number;
}
```

## Padrões Visuais

### Design System Colors
```css
:root {
  --bg-primary: #171717;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #404040;
  --success: #4ade80;
  --error: #ef4444;
  --text-primary: #ffffff;
  --text-secondary: #a3a3a3;
}
```

### Animation Patterns
```css
.transition-smooth {
  transition: all 0.3s ease;
}

.glow-effect {
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
}

.pulse-indicator {
  animation: pulse 2s infinite;
}
```

## Padrões de Componente

### Card Pattern
```typescript
interface CardProps {
  type: 'owner' | 'shadow' | 'slave';
  isConfigured: boolean;
  isActive: boolean;
  onClick?: () => void;
}
```

### Form Pattern
```typescript
interface FormFieldProps {
  label: string;
  type: 'text' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}
```

### Modal Pattern
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showConfirmButton?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
}
```

## Padrões de Interação

### Loading States
- **Idle**: Estado padrão
- **Loading**: "Connecting..." ou "Saving..."
- **Success**: Feedback verde + mascaramento
- **Error**: Feedback vermelho + retry

### Validation Pattern
```typescript
const validateApiConfig = (config: Partial<AccountConfig>) => {
  const errors: Record<string, string> = {};
  
  if (!config.apiKey?.trim()) {
    errors.apiKey = 'API Key é obrigatória';
  }
  
  if (!config.apiSecret?.trim()) {
    errors.apiSecret = 'API Secret é obrigatório';  
  }
  
  if (!config.passphrase?.trim()) {
    errors.passphrase = 'Passphrase é obrigatória';
  }
  
  return errors;
};
```

## Padrões Responsivos

### Breakpoints
```css
/* Mobile First */
.container {
  @apply px-4 py-6;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    @apply px-8 py-8;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    @apply px-12 py-12 max-w-6xl mx-auto;
  }
}
```

### Layout Adaptations
- **Mobile**: Stack vertical, modal fullscreen
- **Tablet**: Grid 2x1, modal centered
- **Desktop**: Pirâmide visual, modal overlay

## Efeitos Especiais

### Shadow Account Effects
```css
.shadow-card {
  position: relative;
  border-left: 4px solid var(--success);
  box-shadow: -4px 0 12px rgba(74, 222, 128, 0.2);
}

.shadow-text {
  position: relative;
}

.shadow-text::before {
  content: attr(data-text);
  position: absolute;
  color: black;
  left: 1px;
  top: 1px;
  z-index: -1;
}
```

### Slave Account Effects
```css
.slave-card {
  border: 2px dashed var(--text-secondary);
  border-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    var(--text-secondary) 5px,
    var(--text-secondary) 10px
  ) 2;
}

.chain-animation {
  animation: chainMove 3s ease-in-out infinite;
}

@keyframes chainMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}
``` 