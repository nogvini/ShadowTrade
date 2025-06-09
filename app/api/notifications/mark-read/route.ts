import { NextRequest, NextResponse } from 'next/server';
import { NotificationManager } from '@/lib/notifications/manager';

export async function POST(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento
    
    const body = await request.json();
    const { notificationId, markAll } = body;
    
    const notificationManager = new NotificationManager();
    
    let result;
    if (markAll) {
      result = await notificationManager.markAllAsRead(userId);
    } else if (notificationId) {
      result = await notificationManager.markAsRead(notificationId, userId);
    } else {
      return NextResponse.json({
        success: false,
        error: 'notificationId ou markAll é obrigatório'
      }, { status: 400 });
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 