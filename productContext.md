# Product Context - Raid S&S

## Domínio de Negócio
**Trading Account Management System** - Sistema de gerenciamento hierárquico de contas de trading com foco em automação e controle de risco.

## Modelo de Usuário
- **Perfil**: Traders experientes que gerenciam múltiplas contas
- **Necessidade**: Configuração centralizada de APIs de trading
- **Comportamento**: Busca eficiência, segurança e controle visual

## Fluxo de Valor Principal
1. **Configuração Owner** → Estabelece conta principal
2. **Configuração Shadow** → Define conta espelho com regras especiais
3. **Configuração Slave** → Estabelece conta subordinada
4. **Operação Integrada** → Sistema funciona em pirâmide hierárquica

## Características Funcionais

### Owner Account (Conta Principal)
- **Propósito**: Conta master que governa as demais
- **Provider**: LNMarkets
- **Controle**: Total sobre configurações das contas subordinadas
- **Status**: Sempre deve estar configurada primeiro

### Shadow Account (Conta Sombra)
- **Propósito**: Replica operações com parâmetros específicos
- **Recursos Especiais**:
  - Shadow Close: Fecha posições automaticamente
  - Take Profit configurável (desabilitado se Shadow Close ativo)
  - Quantidade em dólares personalizada
- **Comportamento**: Segue a conta Owner com modificações

### Slave Account (Conta Escrava)
- **Propósito**: Executa ordens de forma subordinada
- **Recursos**: Configuração básica de API + quantidade
- **Comportamento**: Execução direta de comandos

## Requisitos de Segurança
- **API Key Masking**: Exibir apenas primeiros/últimos caracteres
- **Validação Obrigatória**: Todos os campos devem ser preenchidos
- **Persistência Limitada**: Dados mantidos apenas durante sessão
- **Estado de Conexão**: Feedback visual sobre status das APIs

## Estados do Sistema
- **Não Configurado**: Estado inicial, aguardando configuração Owner
- **Parcialmente Configurado**: Owner configurado, Shadow/Slave pendentes
- **Completamente Configurado**: Todas as contas configuradas e conectadas
- **Erro de Conexão**: Falha na validação de API

## Métricas de Sucesso
- **Tempo de configuração**: < 3 minutos para configuração completa
- **Taxa de erro**: < 5% em validações de API
- **Satisfação visual**: Design intuitivo e profissional
- **Responsividade**: Funcional em dispositivos móveis 