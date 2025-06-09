import { NextRequest, NextResponse } from 'next/server';
import { notificationWebSocketServer } from '@/lib/notifications/websocket';

// Esta rota fornece informações sobre o WebSocket e estatísticas
export async function GET(request: NextRequest) {
  try {
    const stats = notificationWebSocketServer.getConnectionStats();
    
    return NextResponse.json({
      success: true,
      data: {
        websocketEndpoint: '/api/notifications/websocket',
        connectionStats: stats,
        instructions: {
          connect: 'ws://localhost:3000/api/notifications/websocket?token=YOUR_JWT_TOKEN',
          messageTypes: [
            'notification - Notificação de trade',
            'status_update - Atualização de status',
            'trade_update - Atualização de trade'
          ],
          clientMessages: [
            'ping - Teste de conectividade',
            'subscribe - Subscrever a eventos específicos'
          ]
        }
      },
      message: 'Informações do WebSocket obtidas com sucesso'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao obter informações do WebSocket:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Endpoint para testar envio de notificação (apenas para desenvolvimento)
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        error: 'Endpoint disponível apenas em desenvolvimento'
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { userId, notification } = body;
    
    if (!userId || !notification) {
      return NextResponse.json({
        success: false,
        error: 'userId e notification são obrigatórios'
      }, { status: 400 });
    }
    
    // Envia notificação de teste
    const sent = notificationWebSocketServer.sendNotificationToUser(userId, {
      id: `test_${Date.now()}`,
      title: notification.title || 'Notificação de Teste',
      message: notification.message || 'Esta é uma notificação de teste',
      type: 'warning',
      accountType: 'owner',
      tradeData: notification.tradeData || {},
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      data: {
        sent,
        message: sent ? 'Notificação enviada com sucesso' : 'Usuário não está conectado'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 