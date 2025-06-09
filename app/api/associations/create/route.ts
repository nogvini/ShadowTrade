import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getUserFromRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const createAssociationSchema = z.object({
  ownerTradeId: z.string().optional(),
  shadowTradeId: z.string().optional(),
  slaveTradeId: z.string().optional(),
  associationType: z.enum(['shadow_to_owner', 'slave_to_shadow', 'slave_to_owner'])
}).refine((data) => {
  // Validações baseadas no tipo de associação
  switch (data.associationType) {
    case 'shadow_to_owner':
      return data.shadowTradeId && data.ownerTradeId && !data.slaveTradeId;
    case 'slave_to_shadow':
      return data.slaveTradeId && data.shadowTradeId && !data.ownerTradeId;
    case 'slave_to_owner':
      return data.slaveTradeId && data.ownerTradeId && !data.shadowTradeId;
    default:
      return false;
  }
}, {
  message: "IDs de trade inválidos para o tipo de associação especificado"
});

export async function POST(request: NextRequest) {
  try {
    // Autenticação obrigatória
    const { userId } = await getUserFromRequest(request);
    
    const body = await request.json();
    const validatedData = createAssociationSchema.parse(body);
    
    // Verifica se já existe uma associação com os mesmos trades
    const { data: existingAssociation } = await supabaseAdmin
      .from('account_associations')
      .select('id')
      .eq('user_id', userId)
      .eq('association_type', validatedData.associationType)
      .eq('owner_trade_id', validatedData.ownerTradeId || null)
      .eq('shadow_trade_id', validatedData.shadowTradeId || null)
      .eq('slave_trade_id', validatedData.slaveTradeId || null)
      .single();
    
    if (existingAssociation) {
      return NextResponse.json({
        success: false,
        error: 'Associação já existe para estes trades'
      }, { status: 400 });
    }
    
    // Cria a associação
    const { data: newAssociation, error } = await supabaseAdmin
      .from('account_associations')
      .insert({
        user_id: userId,
        owner_trade_id: validatedData.ownerTradeId || null,
        shadow_trade_id: validatedData.shadowTradeId || null,
        slave_trade_id: validatedData.slaveTradeId || null,
        association_type: validatedData.associationType
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar associação:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar associação'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Associação criada com sucesso',
      data: newAssociation
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      }, { status: 400 });
    }
    
    if (error instanceof Error && error.message === 'Token inválido ou expirado') {
      return NextResponse.json({
        success: false,
        error: 'Autenticação necessária'
      }, { status: 401 });
    }
    
    console.error('Erro ao criar associação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 