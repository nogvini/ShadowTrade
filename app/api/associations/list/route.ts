import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getUserFromRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Autenticação obrigatória
    const { userId } = await getUserFromRequest(request);
    
    const { searchParams } = new URL(request.url);
    const associationType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Constrói a query
    let query = supabaseAdmin
      .from('account_associations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Filtra por tipo se especificado
    if (associationType && ['shadow_to_owner', 'slave_to_shadow', 'slave_to_owner'].includes(associationType)) {
      query = query.eq('association_type', associationType);
    }
    
    // Aplica paginação
    query = query.range(offset, offset + limit - 1);
    
    const { data: associations, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar associações:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar associações'
      }, { status: 500 });
    }
    
    // Agrupa associações por tipo para melhor visualização
    const groupedAssociations = {
      shadow_to_owner: associations?.filter(a => a.association_type === 'shadow_to_owner') || [],
      slave_to_shadow: associations?.filter(a => a.association_type === 'slave_to_shadow') || [],
      slave_to_owner: associations?.filter(a => a.association_type === 'slave_to_owner') || []
    };
    
    return NextResponse.json({
      success: true,
      data: {
        associations: associations || [],
        grouped: groupedAssociations,
        total: associations?.length || 0
      },
      message: `${associations?.length || 0} associações encontradas`
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Token inválido ou expirado') {
      return NextResponse.json({
        success: false,
        error: 'Autenticação necessária'
      }, { status: 401 });
    }
    
    console.error('Erro ao listar associações:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 