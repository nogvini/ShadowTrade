import { NextRequest, NextResponse } from 'next/server';
import { tradeMonitor } from '@/lib/lnmarkets/monitor';

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    
    const status = await tradeMonitor.getMonitoringStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
      message: 'Status do monitoramento obtido com sucesso'
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao obter status do monitoramento:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 