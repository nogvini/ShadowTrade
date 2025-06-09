import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { verifyToken } from '@/lib/auth/middleware';
import type { WebSocketMessage, WebSocketConnection } from '@/types/backend';

export class NotificationWebSocketServer {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, WebSocketConnection & { ws: WebSocket }> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Inicializa o servidor WebSocket
   */
  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/notifications/websocket'
    });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    // Configura heartbeat para detectar conexões mortas
    this.setupHeartbeat();

    console.log('WebSocket server inicializado em /api/notifications/websocket');
  }

  /**
   * Manipula nova conexão WebSocket
   */
  private async handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      // Extrai token da query string ou header
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token') || 
                   request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Token de autenticação necessário');
        return;
      }

      // Verifica token
      const user = verifyToken(token);
      if (!user) {
        ws.close(1008, 'Token inválido');
        return;
      }

      // Cria conexão
      const connectionId = this.generateConnectionId();
      const connection: WebSocketConnection & { ws: WebSocket } = {
        userId: user.userId,
        connectionId,
        connectedAt: new Date(),
        ws
      };

      // Armazena conexão
      this.connections.set(connectionId, connection);

      // Configura eventos da conexão
      ws.on('message', (data) => {
        this.handleMessage(connectionId, data);
      });

      ws.on('close', () => {
        this.handleDisconnection(connectionId);
      });

      ws.on('error', (error) => {
        console.error(`Erro na conexão WebSocket ${connectionId}:`, error);
        this.handleDisconnection(connectionId);
      });

      // Configura pong para heartbeat
      ws.on('pong', () => {
        connection.ws.isAlive = true;
      });

      // Envia mensagem de boas-vindas
      this.sendToConnection(connectionId, {
        type: 'status_update',
        data: { 
          status: 'connected',
          connectionId,
          userId: user.userId
        },
        timestamp: new Date()
      });

      console.log(`WebSocket conectado: ${connectionId} (usuário: ${user.userId})`);

    } catch (error) {
      console.error('Erro ao processar conexão WebSocket:', error);
      ws.close(1011, 'Erro interno do servidor');
    }
  }

  /**
   * Manipula mensagens recebidas
   */
  private handleMessage(connectionId: string, data: any) {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) return;

      const message = JSON.parse(data.toString());
      
      // Processa diferentes tipos de mensagem
      switch (message.type) {
        case 'ping':
          this.sendToConnection(connectionId, {
            type: 'status_update',
            data: { status: 'pong' },
            timestamp: new Date()
          });
          break;
          
        case 'subscribe':
          // Implementar lógica de subscrição específica se necessário
          break;
          
        default:
          console.log(`Mensagem não reconhecida de ${connectionId}:`, message);
      }
    } catch (error) {
      console.error(`Erro ao processar mensagem de ${connectionId}:`, error);
    }
  }

  /**
   * Manipula desconexão
   */
  private handleDisconnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      console.log(`WebSocket desconectado: ${connectionId} (usuário: ${connection.userId})`);
      this.connections.delete(connectionId);
    }
  }

  /**
   * Envia notificação para um usuário específico
   */
  sendNotificationToUser(userId: string, notification: any) {
    const userConnections = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId);

    const message: WebSocketMessage = {
      type: 'notification',
      data: notification,
      timestamp: new Date()
    };

    userConnections.forEach(connection => {
      this.sendToConnection(connection.connectionId, message);
    });

    return userConnections.length > 0;
  }

  /**
   * Envia mensagem para uma conexão específica
   */
  private sendToConnection(connectionId: string, message: WebSocketMessage) {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${connectionId}:`, error);
      this.handleDisconnection(connectionId);
      return false;
    }
  }

  /**
   * Envia atualização de status para todos os usuários conectados
   */
  broadcastStatusUpdate(data: any) {
    const message: WebSocketMessage = {
      type: 'status_update',
      data,
      timestamp: new Date()
    };

    this.connections.forEach((connection, connectionId) => {
      this.sendToConnection(connectionId, message);
    });
  }

  /**
   * Configura heartbeat para detectar conexões mortas
   */
  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.connections.forEach((connection, connectionId) => {
        if (connection.ws.isAlive === false) {
          console.log(`Conexão morta detectada: ${connectionId}`);
          connection.ws.terminate();
          this.handleDisconnection(connectionId);
          return;
        }

        connection.ws.isAlive = false;
        connection.ws.ping();
      });
    }, 30000); // 30 segundos
  }

  /**
   * Gera ID único para conexão
   */
  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém estatísticas das conexões
   */
  getConnectionStats() {
    const connections = Array.from(this.connections.values());
    const userCounts = connections.reduce((acc, conn) => {
      acc[conn.userId] = (acc[conn.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConnections: connections.length,
      uniqueUsers: Object.keys(userCounts).length,
      userConnections: userCounts,
      oldestConnection: connections.reduce((oldest, conn) => 
        !oldest || conn.connectedAt < oldest.connectedAt ? conn : oldest, 
        null as WebSocketConnection | null
      )
    };
  }

  /**
   * Fecha todas as conexões e limpa recursos
   */
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.connections.forEach((connection, connectionId) => {
      connection.ws.close(1001, 'Servidor sendo desligado');
    });

    this.connections.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    console.log('WebSocket server desligado');
  }
}

// Instância singleton do servidor WebSocket
export const notificationWebSocketServer = new NotificationWebSocketServer();

// Extensão do tipo WebSocket para incluir isAlive
declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean;
  }
} 