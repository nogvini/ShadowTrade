import { NextRequest, NextResponse } from 'next/server';
import { NotificationManager } from '@/lib/notifications/manager';

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const accountType = searchParams.get('accountType') as any;
    
    const notificationManager = new NotificationManager();
    const result = await notificationManager.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
      accountType
    });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 