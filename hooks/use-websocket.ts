import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage } from '@/types/backend';

interface UseWebSocketOptions {
  url?: string;
  token?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `ws://${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/api/notifications/websocket`,
    token,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  // Função para conectar ao WebSocket
  const connect = useCallback(() => {
    if (!token) {
      setState(prev => ({ ...prev, error: 'Token de autenticação necessário' }));
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Já conectado
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket conectado');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        }));
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));
        
        wsRef.current = null;
        onDisconnect?.();

        // Tenta reconectar se necessário
        if (shouldReconnectRef.current && state.reconnectAttempts < maxReconnectAttempts) {
          setState(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
        setState(prev => ({
          ...prev,
          error: 'Erro de conexão WebSocket',
          isConnecting: false
        }));
        onError?.(error);
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Erro ao criar WebSocket:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao criar conexão WebSocket',
        isConnecting: false
      }));
    }
  }, [url, token, reconnectInterval, maxReconnectAttempts, onMessage, onConnect, onDisconnect, onError, state.reconnectAttempts]);

  // Função para desconectar
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexão solicitada pelo cliente');
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0
    });
  }, []);

  // Função para enviar mensagem
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Função para reconectar manualmente
  const reconnect = useCallback(() => {
    shouldReconnectRef.current = true;
    setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Conecta automaticamente quando o token está disponível
  useEffect(() => {
    if (token && shouldReconnectRef.current) {
      connect();
    }

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, connect]);

  // Ping periódico para manter conexão viva
  useEffect(() => {
    if (!state.isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // 30 segundos

    return () => clearInterval(pingInterval);
  }, [state.isConnected, sendMessage]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    sendMessage
  };
}

// Hook específico para notificações
export function useNotificationWebSocket(token?: string) {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('Mensagem WebSocket recebida:', message);

    switch (message.type) {
      case 'notification':
        setNotifications(prev => [message, ...prev.slice(0, 49)]); // Mantém últimas 50
        setUnreadCount(prev => prev + 1);
        
        // Mostra notificação do browser se permitido
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(message.data.title || 'Nova Notificação', {
            body: message.data.message,
            icon: '/favicon.ico',
            tag: message.data.id
          });
        }
        break;
        
      case 'status_update':
        console.log('Status update:', message.data);
        break;
        
      case 'trade_update':
        console.log('Trade update:', message.data);
        break;
    }
  }, []);

  const webSocket = useWebSocket({
    token,
    onMessage: handleMessage,
    onConnect: () => {
      console.log('Conectado ao WebSocket de notificações');
      // Solicita permissão para notificações do browser
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    },
    onDisconnect: () => {
      console.log('Desconectado do WebSocket de notificações');
    }
  });

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    ...webSocket,
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications
  };
} 