# 🌑 Sistema de Sombras de Texto - Raid S&S

## 📋 **Visão Geral**

O Sistema de Sombras de Texto é uma implementação CSS pura que adiciona efeitos de sombra preta desalinhada a todos os textos da aplicação, criando um aspecto visual retrô/gaming que complementa perfeitamente a fonte **Press Start 2P** e o tema escuro.

## 🎨 **Classes CSS Disponíveis**

### **1. `.shadow-text` - Sombra Padrão**
```css
.shadow-text::before {
  content: attr(data-text);
  position: absolute;
  color: #000000;
  left: 1px;
  top: 1px;
  z-index: -1;
  opacity: 0.8;
}
```
**Uso**: Textos gerais, títulos médios  
**Desalinhamento**: 1px diagonal  
**Opacidade**: 80%

### **2. `.shadow-text-lg` - Sombra Pronunciada**
```css
.shadow-text-lg::before {
  left: 2px;
  top: 2px;
  opacity: 0.9;
}
```
**Uso**: Títulos principais, headers importantes  
**Desalinhamento**: 2px diagonal  
**Opacidade**: 90%

### **3. `.shadow-text-sm` - Sombra Sutil**
```css
.shadow-text-sm::before {
  left: 0.5px;
  top: 0.5px;
  opacity: 0.6;
}
```
**Uso**: Textos pequenos, labels, descrições  
**Desalinhamento**: 0.5px diagonal  
**Opacidade**: 60%

### **4. `.shadow-text-diagonal` - Sombra Diagonal**
```css
.shadow-text-diagonal::before {
  left: 1.5px;
  top: 1.5px;
  opacity: 0.7;
}
```
**Uso**: Efeitos especiais, destaque moderado  
**Desalinhamento**: 1.5px diagonal  
**Opacidade**: 70%

### **5. `.shadow-text-button` - Sombra para Botões**
```css
.shadow-text-button::before {
  left: 1px;
  top: 1px;
  opacity: 0.5;
}
```
**Uso**: Textos de botões  
**Desalinhamento**: 1px diagonal  
**Opacidade**: 50% (mais sutil para não competir com outros efeitos)

### **6. `.shadow-text-title` - Sombra Responsiva**
```css
.shadow-text-title::before {
  left: 1px;    /* Mobile */
  top: 1px;
  opacity: 0.8;
}

@media (min-width: 640px) {
  .shadow-text-title::before {
    left: 1.5px;  /* Tablet */
    top: 1.5px;
  }
}

@media (min-width: 768px) {
  .shadow-text-title::before {
    left: 2px;    /* Desktop */
    top: 2px;
    opacity: 0.9;
  }
}
```
**Uso**: Títulos principais que precisam se adaptar aos breakpoints  
**Desalinhamento**: Responsivo (1px → 1.5px → 2px)  
**Opacidade**: Responsiva (80% → 80% → 90%)

## 🔧 **Implementação Técnica**

### **Princípio de Funcionamento**
Utiliza o pseudo-elemento `::before` com:
- `content: attr(data-text)` - Replica o texto do atributo `data-text`
- `position: absolute` - Posicionamento livre
- `z-index: -1` - Fica atrás do texto original
- `color: #000000` - Cor preta sólida
- Desalinhamento (`left`/`top`) cria o efeito de sombra

### **Requisitos de Uso**
1. **Posicionamento**: Elemento pai deve ter `position: relative`
2. **Atributo data**: Deve incluir `data-text="texto_exato"`
3. **Texto duplicado**: O `data-text` deve ser idêntico ao texto visível

### **Exemplo de Implementação**
```jsx
<h1 className="shadow-text-lg" data-text="Título Principal">
  Título Principal
</h1>
```

## 📊 **Aplicação na Aplicação**

### **Header.tsx**
```jsx
<Link 
  href="/" 
  className="... shadow-text-title" 
  data-text="Raid S&S"
>
  Raid S&S
</Link>
```

### **OwnerStep.tsx**
```jsx
{/* Título principal */}
<h2 className="... shadow-text-lg" data-text="Owner API Conectada!">
  Owner API Conectada!
</h2>

{/* Informações secundárias */}
<p className="... shadow-text-sm" data-text={`API Key: ${ownerConfig.maskedApiKey}`}>
  API Key: {ownerConfig.maskedApiKey}
</p>
```

### **Button.tsx - Integração Automática**
```jsx
export interface ButtonProps {
  // ... outras props
  shadowText?: boolean;
}

const Button = ({ shadowText = false, children, ... }) => {
  const textContent = typeof children === 'string' ? children : '';
  
  return (
    <button
      className={twMerge(
        buttonVariants({ variant, size }),
        shadowText && 'shadow-text-button'
      )}
      data-text={shadowText ? textContent : undefined}
    >
      {children}
    </button>
  );
};
```

**Uso do Button com sombra:**
```jsx
<Button shadowText variant="success">
  Conectar Owner API
</Button>
```

### **ProgressIndicator.tsx**
```jsx
<p 
  className="... shadow-text-sm"
  data-text={label}
>
  {label}
</p>
```

## 🎯 **Benefícios do Sistema**

### **1. Performance**
- **CSS Puro**: Sem JavaScript, sem re-renders
- **Hardware Accelerated**: Usa `transform` e `position`
- **Memória Eficiente**: Pseudo-elementos não criam DOM adicional

### **2. Manutenibilidade**
- **Classes Reutilizáveis**: Sistema modular
- **Consistência Visual**: Padrões bem definidos
- **Fácil Customização**: Centralizado em `globals.css`

### **3. Responsividade**
- **Breakpoints Integrados**: `shadow-text-title` se adapta
- **Escalabilidade**: Diferentes tamanhos para diferentes contextos
- **Mobile-First**: Otimizado para telas pequenas

### **4. Estética Gaming/Retrô**
- **Compatibilidade**: Combina perfeitamente com Press Start 2P
- **Profundidade**: Cria camadas visuais
- **Nostalgia**: Remete aos jogos clássicos 8-bit/16-bit

## 🔍 **Troubleshooting**

### **Sombra não aparece**
- Verificar se `data-text` está presente e correto
- Conferir se o elemento pai tem `position: relative`
- Checar se a classe CSS foi aplicada corretamente

### **Texto cortado/sobreposto**
- Verificar `z-index` do elemento pai
- Ajustar `line-height` se necessário
- Revisar `overflow` do container

### **Performance issues**
- Evitar usar em textos que mudam frequentemente
- Considerar usar `.shadow-text-sm` para listas longas
- Testar em dispositivos menos potentes

## 🚀 **Expansões Futuras**

### **Sombras Coloridas**
```css
.shadow-text-success::before {
  color: rgba(74, 222, 128, 0.3); /* Verde translúcido */
}

.shadow-text-error::before {
  color: rgba(239, 68, 68, 0.3); /* Vermelho translúcido */
}
```

### **Múltiplas Sombras**
```css
.shadow-text-3d::before {
  text-shadow: 
    1px 1px 0 #000,
    2px 2px 0 #333,
    3px 3px 0 #666;
}
```

### **Animações**
```css
.shadow-text-animated::before {
  animation: shadowPulse 2s infinite;
}

@keyframes shadowPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
```

## 📝 **Exemplo Completo**

```jsx
// Componente exemplo usando múltiplas variações
const ExampleComponent = () => (
  <div className="relative">
    {/* Título principal */}
    <h1 className="text-2xl shadow-text-title" data-text="Gaming Interface">
      Gaming Interface
    </h1>
    
    {/* Subtítulo */}
    <h2 className="text-lg shadow-text-lg" data-text="Configure Your Setup">
      Configure Your Setup
    </h2>
    
    {/* Descrição */}
    <p className="text-sm shadow-text-sm" data-text="Enter your credentials below">
      Enter your credentials below
    </p>
    
    {/* Botão com sombra */}
    <Button shadowText variant="success">
      Start Configuration
    </Button>
  </div>
);
```

---

**Sistema implementado em**: `app/globals.css`  
**Componentes afetados**: Todos os componentes principais  
**Status**: ✅ **Implementado e funcionando** 