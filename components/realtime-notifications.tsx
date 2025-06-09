'use client';

import { useEffect, useState } from 'react';
import { useNotificationWebSocket } from '@/hooks/use-websocket';
import { Bell, X, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WebSocketMessage } from '@/types/backend';

interface RealtimeNotificationsProps {
  token?: string;
  className?: string;
}

export function RealtimeNotifications({ token, className }: RealtimeNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isConnected,
    isConnecting,
    error,
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    reconnect
  } = useNotificationWebSocket(token);

  // Marca como lidas quando abre o painel
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAsRead();
    }
  }, [isOpen, unreadCount, markAsRead]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trade_closed':
        return <TrendingDown className="h-4 w-4" />;
      case 'trade_opened':
        return <TrendingUp className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'trade_closed':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'trade_opened':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-200 text-blue-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão de notificações */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Painel de notificações */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                {/* Status da conexão */}
                <div className="flex items-center gap-1">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 
                      isConnecting ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} 
                  />
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? 'Online' : isConnecting ? 'Conectando...' : 'Offline'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Erro de conexão */}
            {error && (
              <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded p-2">
                <span className="text-sm text-red-600">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reconnect}
                  className="text-red-600 hover:text-red-700"
                >
                  Reconectar
                </Button>
              </div>
            )}

            {/* Ações */}
            {notifications.length > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="text-xs"
                >
                  Limpar todas
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {notifications.map((notification, index) => (
                    <NotificationItem
                      key={`${notification.data.id}-${index}`}
                      notification={notification}
                      getIcon={getNotificationIcon}
                      getColor={getNotificationColor}
                      formatCurrency={formatCurrency}
                      formatTimestamp={formatTimestamp}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: WebSocketMessage;
  getIcon: (type: string) => JSX.Element;
  getColor: (type: string) => string;
  formatCurrency: (value: number) => string;
  formatTimestamp: (timestamp: string | Date) => string;
}

function NotificationItem({ 
  notification, 
  getIcon, 
  getColor, 
  formatCurrency, 
  formatTimestamp 
}: NotificationItemProps) {
  const { data } = notification;

  return (
    <div className={`p-3 rounded-lg border ${getColor(data.type)}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(data.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium truncate">
              {data.title}
            </h4>
            <Badge variant="outline" className="text-xs">
              {data.accountType}
            </Badge>
          </div>
          
          <p className="text-sm opacity-90 mb-2">
            {data.message}
          </p>
          
          {/* Dados do trade */}
          {data.tradeData && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {data.tradeData.quantity && (
                <div>
                  <span className="opacity-70">Quantidade:</span>
                  <span className="ml-1 font-medium">{data.tradeData.quantity}</span>
                </div>
              )}
              
              {data.tradeData.netPnl !== undefined && (
                <div>
                  <span className="opacity-70">P&L Líquido:</span>
                  <span className={`ml-1 font-medium ${
                    data.tradeData.netPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.tradeData.netPnl)}
                  </span>
                </div>
              )}
              
              {data.tradeData.fees && (
                <div>
                  <span className="opacity-70">Taxas:</span>
                  <span className="ml-1 font-medium">{formatCurrency(data.tradeData.fees)}</span>
                </div>
              )}
              
              {data.tradeData.tradeMargin && (
                <div>
                  <span className="opacity-70">Margem:</span>
                  <span className="ml-1 font-medium">{formatCurrency(data.tradeData.tradeMargin)}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs opacity-60 mt-2">
            {formatTimestamp(notification.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
} 