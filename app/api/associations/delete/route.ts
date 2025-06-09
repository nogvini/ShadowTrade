import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getUserFromRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const deleteAssociationSchema = z.object({
  associationId: z.string().uuid('ID de associação inválido')
});

export async function DELETE(request: NextRequest) {
  try {
    // Autenticação obrigatória
    const { userId } = await getUserFromRequest(request);
    
    const body = await request.json();
    const { associationId } = deleteAssociationSchema.parse(body);
    
    // Verifica se a associação existe e pertence ao usuário
    const { data: association, error: fetchError } = await supabaseAdmin
      .from('account_associations')
      .select('*')
      .eq('id', associationId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !association) {
      return NextResponse.json({
        success: false,
        error: 'Associação não encontrada'
      }, { status: 404 });
    }
    
    // Remove a associação
    const { error: deleteError } = await supabaseAdmin
      .from('account_associations')
      .delete()
      .eq('id', associationId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Erro ao remover associação:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao remover associação'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Associação removida com sucesso',
      data: {
        removedAssociation: association
      }
    }, { status: 200 });
    
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
    
    console.error('Erro ao remover associação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Rota alternativa para remover por query parameter
export async function GET(request: NextRequest) {
  try {
    // Autenticação obrigatória
    const { userId } = await getUserFromRequest(request);
    
    const { searchParams } = new URL(request.url);
    const associationId = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (action !== 'delete' || !associationId) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos. Use ?action=delete&id=uuid'
      }, { status: 400 });
    }
    
    // Valida UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(associationId)) {
      return NextResponse.json({
        success: false,
        error: 'ID de associação inválido'
      }, { status: 400 });
    }
    
    // Verifica se a associação existe e pertence ao usuário
    const { data: association, error: fetchError } = await supabaseAdmin
      .from('account_associations')
      .select('*')
      .eq('id', associationId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !association) {
      return NextResponse.json({
        success: false,
        error: 'Associação não encontrada'
      }, { status: 404 });
    }
    
    // Remove a associação
    const { error: deleteError } = await supabaseAdmin
      .from('account_associations')
      .delete()
      .eq('id', associationId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Erro ao remover associação:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao remover associação'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Associação removida com sucesso',
      data: {
        removedAssociation: association
      }
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Token inválido ou expirado') {
      return NextResponse.json({
        success: false,
        error: 'Autenticação necessária'
      }, { status: 401 });
    }
    
    console.error('Erro ao remover associação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 