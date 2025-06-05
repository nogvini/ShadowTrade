# Active Context - Raid S&S

## Estado Atual do Projeto
**Status**: Inicialização - Memory Bank estabelecido, pronto para desenvolvimento

## Foco Prioritário
Implementação completa da interface web para configuração de contas de trading com experiência visual imersiva e fluxo hierárquico Owner → Shadow → Slave.

## Próximas Ações Imediatas
1. **Estrutura Base**: Configuração Next.js + TypeScript + Tailwind
2. **Componentes Fundamentais**: Header, Layout, Modal System
3. **Sistema de Estado**: Context API para gerenciamento global
4. **Fluxo de Configuração**: Implementação das 3 etapas sequenciais

## Contexto Técnico Ativo

### Stack Confirmado
- **Next.js 14**: App Router com export estático
- **TypeScript**: Tipagem rigorosa
- **Tailwind CSS**: Estilização utility-first
- **Lucide React**: Ícones modernos
- **Press Start 2P**: Fonte temática

### Componentes Principais a Implementar
1. **Header**: Logo + Avatar fixo
2. **ProgressIndicator**: Indicador visual de 2 etapas
3. **OwnerStep**: Configuração API principal
4. **ShadowStep**: Configuração conta sombra com efeitos especiais
5. **SlaveStep**: Configuração conta escrava com tema correntes
6. **Modal**: Sistema de popup para configurações

### Efeitos Visuais Obrigatórios
- **Owner**: Design clean e moderno
- **Shadow**: Borda esquerda + sombra + texto sobrescrito
- **Slave**: Borda picotada + animação corrente

## Requisitos de Qualidade

### Visual
- Tema dark com gradientes
- Animações suaves (0.3s ease)
- Estados hover e loading
- Responsividade mobile-first

### Funcional
- Validação em tempo real
- Mascaramento de API keys
- Estados de loading realistas
- Feedback visual constante

### UX
- Fluxo linear intuitivo
- Prevenção de ações inválidas
- Persistência de sessão
- Feedback de erro/sucesso

## Critérios de Aceitação

### Owner Step
- [ ] Formulário com 3 campos obrigatórios
- [ ] Botão "Connect API" com loading
- [ ] Mascaramento após sucesso
- [ ] Possibilidade de reconfiguração

### Shadow Step  
- [ ] Card clicável com ícone
- [ ] Modal com formulário completo
- [ ] Checkbox "Shadow Close" funcional
- [ ] Take Profit condicional
- [ ] Efeitos visuais de sombra

### Slave Step
- [ ] Card com tema correntes
- [ ] Modal de configuração básica
- [ ] Efeitos de borda picotada
- [ ] Animação de corrente

### Sistema Geral
- [ ] Indicador de progresso funcional
- [ ] Estados de conexão visuais
- [ ] Responsividade completa
- [ ] Validação em tempo real

## Definições de Pronto

### Componente Individual
- Implementado com TypeScript
- Estilizado com Tailwind
- Responsivo para mobile/desktop
- Animações suaves aplicadas
- Estados de erro/sucesso

### Funcionalidade Completa
- Fluxo end-to-end funcional
- Validação de todos os campos
- Feedback visual adequado
- Persistência de estado
- Prevenção de bugs

### Qualidade Final
- Código limpo e documentado
- Performance otimizada
- UX intuitiva e profissional
- Design fiel às especificações
- Testes manuais aprovados

## Contexto de Negócio Ativo
Sistema para traders que precisam gerenciar múltiplas contas de forma hierárquica, com foco na eficiência de configuração e segurança de dados sensíveis (API keys).

## Notas de Desenvolvimento
- Evitar over-engineering
- Preferir composição simples
- Foco na experiência visual
- Implementação pragmática
- Documentação inline quando necessário 