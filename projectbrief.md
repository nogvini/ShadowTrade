# Raid S&S - Project Brief

## Visão Geral
Interface web completa para configuração de contas de trading chamada "Raid S&S" focada em gerenciamento hierárquico de contas (Owner → Shadow → Slave).

## Identidade Visual
- **Título**: "Raid S&S"
- **Idioma**: Português brasileiro (pt-BR)
- **Tema**: Dark mode com estética cinza ao branco
- **Fonte**: "Press Start 2P" (Google Fonts)
- **Design**: Moderno com gradientes, glassmorphism e animações suaves

## Arquitetura de Fluxo
### Estrutura Hierárquica em Pirâmide (∆)
```
-----------------Owner------------------------
---------Shadow-----------------Slave--------
```

### Etapas de Configuração
1. **Owner API** (Etapa 1)
   - Conta principal/master
   - Campos: API Key, API Secret, Passphrase (LNMarkets)
   - Validação obrigatória
   - Mascaramento de dados sensíveis

2. **Shadow Account** (Etapa 2)
   - Conta sombra com efeitos visuais especiais
   - Campos: API Key, API Secret, Passphrase, Quantidade ($), Take Profit (%)
   - Checkbox "Shadow Close" (oculta Take Profit quando ativo)
   - Ícone: 👥 (configuração)
   - Efeito: borda esquerda + sombra + texto sobrescrito

3. **Slave Account** (Etapa 3)
   - Conta escrava com tema de correntes
   - Campos: API Key, API Secret, Passphrase, Quantidade ($)
   - Ícone: ⛓️ (corrente)
   - Efeito: borda picotada + animação de corrente

## Layout Principal
- **Header fixo**: Logo "Raid S&S" + Avatar "US"
- **Indicador de progresso**: 2 etapas com conectores visuais
- **Estados**: ativo, completado, pendente
- **Responsividade**: Mobile-first

## Stack Técnico
- **Frontend**: TypeScript + React + Next.js
- **Estilo**: Tailwind CSS
- **Estado**: Context API + useState
- **Loading**: Estático (não SSR)

## Paleta de Cores
- **Base**: #171717, #2a2a2a, #404040 (tons de cinza)
- **Sucesso**: #4ade80 (verde)
- **Erro**: #ef4444 (vermelho)
- **Destaque**: #ffffff (branco)

## Características UX
- **Animações**: Transições 0.3s ease, hover effects, pulse, glow
- **Validação**: Tempo real com feedback visual
- **Estados de Loading**: "Connecting...", "Saving..."
- **Persistência**: Sessão (não permanente)
- **Segurança**: Mascaramento de API keys

## Objetivos de Experiência
- Fluxo linear e intuitivo
- Feedback visual constante  
- Design imersivo e profissional
- Estados de loading realistas
- Prevenção de ações inválidas 