import { NextRequest, NextResponse } from 'next/server';
import { autoCloseManager } from '@/lib/lnmarkets/auto-close';

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const userFilter = searchParams.get('user_filter') === 'true';

    // Obtém logs de fechamento automático
    const logs = autoCloseManager.getAutoCloseLogs(
      userFilter ? userId : undefined,
      Math.min(limit, 100) // Máximo 100
    );

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        filters: {
          userId: userFilter ? userId : null,
          limit
        }
      },
      message: 'Logs de fechamento automático obtidos com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao obter logs de fechamento automático:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 