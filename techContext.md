# Tech Context - Raid S&S

## Stack Principal
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript 5+
- **UI Library**: React 18+
- **Estilização**: Tailwind CSS 3+
- **Ícones**: Lucide React / Heroicons
- **Fonte**: Google Fonts (Press Start 2P)

## Configurações de Projeto

### Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizeCss: true
  }
};

export default nextConfig;
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Tailwind Configuration
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        'bg-primary': '#171717',
        'bg-secondary': '#2a2a2a', 
        'bg-tertiary': '#404040',
        'success': '#4ade80',
        'error': '#ef4444',
      }
    },
  },
  plugins: [],
}

export default config
```

## Estrutura de Arquivos
```
raid-ss/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── Header.tsx
│   ├── ProgressIndicator.tsx
│   ├── OwnerStep.tsx
│   ├── ShadowStep.tsx
│   ├── SlaveStep.tsx
│   └── ConfigurationModal.tsx
├── hooks/
│   ├── useAppState.ts
│   └── useApiValidation.ts
├── utils/
│   ├── validation.ts
│   ├── api-mask.ts
│   └── constants.ts
├── types/
│   └── index.ts
└── public/
    └── favicon.ico
```

## Dependências do Package.json
```json
{
  "name": "raid-ss",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next": "^14.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

## Configurações de CSS Global
```css
/* app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #171717;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #404040;
  --success: #4ade80;
  --error: #ef4444;
  --text-primary: #ffffff;
  --text-secondary: #a3a3a3;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Press Start 2P', cursive;
}

@layer utilities {
  .transition-smooth {
    transition: all 0.3s ease;
  }
  
  .glow-effect {
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
  }
  
  .pulse-indicator {
    animation: pulse 2s infinite;
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
  
  .chain-animation {
    animation: chainMove 3s ease-in-out infinite;
  }
}

@keyframes chainMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}
```

## Hooks Personalizados

### useAppState Hook
```typescript
// hooks/useAppState.ts
import { useState, useCallback } from 'react';
import { AppState, AccountConfig, ShadowAccountConfig, SlaveAccountConfig } from '@/types';

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    currentStep: 1,
    ownerConfig: null,
    shadowConfig: null,  
    slaveConfig: null,
    isLoading: false,
    errors: {}
  });

  const updateOwnerConfig = useCallback((config: AccountConfig) => {
    setState(prev => ({
      ...prev,
      ownerConfig: config,
      currentStep: config.isConnected ? 2 : 1
    }));
  }, []);

  const updateShadowConfig = useCallback((config: ShadowAccountConfig) => {
    setState(prev => ({
      ...prev,
      shadowConfig: config
    }));
  }, []);

  const updateSlaveConfig = useCallback((config: SlaveAccountConfig) => {
    setState(prev => ({
      ...prev,
      slaveConfig: config
    }));
  }, []);

  return {
    state,
    updateOwnerConfig,
    updateShadowConfig,
    updateSlaveConfig,
    setState
  };
};
```

## Utilitários

### API Masking Utility
```typescript
// utils/api-mask.ts
export const maskApiKey = (apiKey: string): string => {
  if (apiKey.length <= 8) return apiKey;
  
  const start = apiKey.slice(0, 4);
  const end = apiKey.slice(-4);
  const middle = '*'.repeat(apiKey.length - 8);
  
  return `${start}${middle}${end}`;
};
```

### Validation Utility
```typescript
// utils/validation.ts
export const validateApiConfig = (config: Partial<AccountConfig>) => {
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

## Performance Considerations
- **Static Export**: Build estático para máxima performance
- **CSS-in-JS**: Uso mínimo, preferindo Tailwind
- **Code Splitting**: Componentes lazy quando necessário
- **Image Optimization**: Desabilitada para build estático
- **Bundle Size**: Monitoramento de dependências 