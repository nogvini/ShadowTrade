# Sistema WebSocket - ShadowTrade

## Visão Geral

O sistema WebSocket do ShadowTrade fornece notificações em tempo real para usuários conectados, permitindo atualizações instantâneas sobre trades, status de monitoramento e outras informações críticas.

## Arquitetura

```
Cliente React ←→ WebSocket Server ←→ Notification Manager
                      ↓
                 Trade Monitor → LNMarkets API
```

## Componentes

### 1. Servidor WebSocket (`lib/notifications/websocket.ts`)

**Funcionalidades:**
- Autenticação via JWT
- Heartbeat para detectar conexões mortas
- Gerenciamento de conexões por usuário
- Envio de notificações direcionadas
- Broadcast de atualizações de status

**Endpoints:**
- `ws://localhost:3000/api/notifications/websocket?token=JWT_TOKEN`

### 2. Hook React (`hooks/use-websocket.ts`)

**Hooks disponíveis:**
- `useWebSocket()` - Hook genérico para WebSocket
- `useNotificationWebSocket()` - Hook específico para notificações

**Funcionalidades:**
- Conexão automática
- Reconexão automática
- Gerenciamento de estado
- Notificações do browser

### 3. Componente UI (`components/realtime-notifications.tsx`)

**Funcionalidades:**
- Interface moderna para notificações
- Indicador de status de conexão
- Contador de notificações não lidas
- Formatação de dados de trade
- Ações de limpeza e marcação

## Uso

### 1. Conectar ao WebSocket

```typescript
import { useNotificationWebSocket } from '@/hooks/use-websocket';

function MyComponent() {
  const {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications
  } = useNotificationWebSocket(userToken);

  return (
    <div>
      <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <p>Notificações não lidas: {unreadCount}</p>
    </div>
  );
}
```

### 2. Usar o Componente de Notificações

```typescript
import { RealtimeNotifications } from '@/components/realtime-notifications';

function Layout() {
  return (
    <div>
      <RealtimeNotifications token={userToken} />
    </div>
  );
}
```

### 3. Enviar Notificação Programaticamente

```typescript
import { notificationWebSocketServer } from '@/lib/notifications/websocket';

// Enviar para usuário específico
notificationWebSocketServer.sendNotificationToUser(userId, {
  id: 'notification-id',
  title: 'Trade Fechado',
  message: 'Seu trade foi fechado com lucro',
  type: 'trade_closed',
  accountType: 'owner',
  tradeData: {
    quantity: 1000,
    netPnl: 150.50
  },
  createdAt: new Date()
});

// Broadcast para todos
notificationWebSocketServer.broadcastStatusUpdate({
  type: 'system_maintenance',
  message: 'Sistema em manutenção',
  timestamp: new Date()
});
```

## Tipos de Mensagem

### 1. Notificação de Trade

```typescript
{
  type: 'notification',
  data: {
    id: string,
    title: string,
    message: string,
    type: 'trade_opened' | 'trade_closed' | 'warning' | 'error',
    accountType: 'owner' | 'shadow' | 'slave',
    tradeData: {
      quantity: number,
      tradeMargin: number,
      fees: number,
      pnl: number,
      netPnl: number
    },
    createdAt: Date
  },
  timestamp: Date
}
```

### 2. Atualização de Status

```typescript
{
  type: 'status_update',
  data: {
    status: string,
    connectionId?: string,
    userId?: string
  },
  timestamp: Date
}
```

### 3. Atualização de Trade

```typescript
{
  type: 'trade_update',
  data: {
    type: 'trade_closed',
    userId: string,
    accountType: string,
    tradeId: string,
    netPL: number
  },
  timestamp: Date
}
```

## Autenticação

O WebSocket usa autenticação JWT através de:

1. **Query Parameter**: `?token=JWT_TOKEN`
2. **Header Authorization**: `Authorization: Bearer JWT_TOKEN`

```typescript
// Exemplo de conexão
const ws = new WebSocket('ws://localhost:3000/api/notifications/websocket?token=' + jwtToken);
```

## Heartbeat e Reconexão

### Heartbeat
- Ping automático a cada 30 segundos
- Detecção de conexões mortas
- Limpeza automática de conexões inativas

### Reconexão Automática
- Tentativas automáticas de reconexão
- Intervalo configurável (padrão: 3 segundos)
- Máximo de tentativas configurável (padrão: 5)

```typescript
const webSocket = useWebSocket({
  token: userToken,
  reconnectInterval: 5000, // 5 segundos
  maxReconnectAttempts: 10
});
```

## Notificações do Browser

O sistema solicita automaticamente permissão para notificações do browser e exibe notificações nativas quando:

1. Usuário está conectado via WebSocket
2. Permissão foi concedida
3. Nova notificação é recebida

```typescript
// Verificar permissão
if ('Notification' in window) {
  if (Notification.permission === 'granted') {
    // Pode enviar notificações
  } else if (Notification.permission === 'default') {
    // Solicitar permissão
    Notification.requestPermission();
  }
}
```

## Monitoramento e Debug

### Estatísticas de Conexão

```typescript
// Obter estatísticas
const stats = notificationWebSocketServer.getConnectionStats();
console.log(stats);
// {
//   totalConnections: 5,
//   uniqueUsers: 3,
//   userConnections: { 'user1': 2, 'user2': 1, 'user3': 2 },
//   oldestConnection: { userId: 'user1', connectedAt: Date }
// }
```

### Logs

O sistema gera logs estruturados para:
- Conexões/desconexões
- Mensagens enviadas/recebidas
- Erros de conexão
- Heartbeat e reconexões

### API de Informações

```bash
# Obter informações do WebSocket
curl http://localhost:3000/api/notifications/websocket

# Enviar notificação de teste (apenas desenvolvimento)
curl -X POST http://localhost:3000/api/notifications/websocket \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "notification": {
      "title": "Teste",
      "message": "Notificação de teste"
    }
  }'
```

## Configuração de Produção

### Variáveis de Ambiente

```env
# WebSocket
WS_PORT=3001
WS_HOST=0.0.0.0

# Heartbeat
WS_HEARTBEAT_INTERVAL=30000
WS_RECONNECT_INTERVAL=3000
WS_MAX_RECONNECT_ATTEMPTS=5
```

### Proxy Reverso (Nginx)

```nginx
location /api/notifications/websocket {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Limitações e Considerações

### Performance
- Máximo de 1000 conexões simultâneas por instância
- Mensagens limitadas a 1MB
- Heartbeat a cada 30 segundos

### Segurança
- Autenticação obrigatória via JWT
- Validação de origem
- Rate limiting por usuário

### Escalabilidade
- Para múltiplas instâncias, considerar Redis para sincronização
- Load balancer com sticky sessions
- Monitoramento de conexões ativas

## Troubleshooting

### Problemas Comuns

1. **Conexão não estabelecida**
   - Verificar token JWT válido
   - Verificar URL do WebSocket
   - Verificar firewall/proxy

2. **Reconexão constante**
   - Verificar estabilidade da rede
   - Verificar logs do servidor
   - Ajustar intervalo de heartbeat

3. **Notificações não recebidas**
   - Verificar status da conexão
   - Verificar logs do cliente
   - Verificar permissões do browser

### Debug

```typescript
// Habilitar logs detalhados
const webSocket = useWebSocket({
  token: userToken,
  onConnect: () => console.log('WebSocket conectado'),
  onDisconnect: () => console.log('WebSocket desconectado'),
  onError: (error) => console.error('Erro WebSocket:', error),
  onMessage: (message) => console.log('Mensagem recebida:', message)
});
```

## Próximas Melhorias

1. **Rooms/Channels** - Subscrições específicas
2. **Message Queue** - Garantia de entrega
3. **Compression** - Compressão de mensagens
4. **Metrics** - Métricas detalhadas
5. **Admin Panel** - Interface de administração 