import { NextRequest, NextResponse } from 'next/server';
import { tradeMonitor } from '@/lib/lnmarkets/monitor';

export async function POST(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    
    const result = await tradeMonitor.startMonitoring();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          status: 'active',
          startedAt: new Date()
        }
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao iniciar monitoramento:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 