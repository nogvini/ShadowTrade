import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { encryptCredentials } from '@/lib/crypto/encryption';
import { createLNMarketsClient } from '@/lib/lnmarkets/client';
import { z } from 'zod';

const shadowConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  apiSecret: z.string().min(1, 'API Secret é obrigatório'),
  passphrase: z.string().min(1, 'Passphrase é obrigatório'),
  network: z.enum(['mainnet', 'testnet']).optional().default('mainnet'),
  quantity: z.number().positive('Quantidade deve ser positiva').optional(),
  takeProfit: z.number().min(0.1).max(100, 'Take Profit deve estar entre 0.1% e 100%').optional(),
  shadowClose: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento
    
    const body = await request.json();
    const validatedData = shadowConfigSchema.parse(body);
    
    // Testa conexão com LNMarkets
    const client = createLNMarketsClient(validatedData);
    const connectionTest = await client.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: `Erro na conexão com LNMarkets: ${connectionTest.error}`
      }, { status: 400 });
    }
    
    // Validações específicas para Shadow
    if (validatedData.shadowClose && !validatedData.takeProfit) {
      // Se shadow_close está desabilitado, take_profit é opcional
      // Se shadow_close está habilitado, take_profit pode ser usado para estratégias avançadas
    }
    
    // Criptografa credenciais
    const encryptedCreds = encryptCredentials(validatedData);
    
    // Salva no banco de dados
    const { error } = await supabaseAdmin
      .from('encrypted_apis')
      .upsert({
        user_id: userId,
        account_type: 'shadow',
        encrypted_api_key: JSON.stringify(encryptedCreds.encryptedApiKey),
        encrypted_api_secret: JSON.stringify(encryptedCreds.encryptedApiSecret),
        encrypted_passphrase: JSON.stringify(encryptedCreds.encryptedPassphrase),
        quantity: validatedData.quantity,
        take_profit: validatedData.takeProfit,
        shadow_close: validatedData.shadowClose,
        is_active: true
      }, {
        onConflict: 'user_id,account_type'
      });
    
    if (error) {
      console.error('Erro ao salvar conta Shadow:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar configuração da conta Shadow'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conta Shadow configurada com sucesso',
      data: {
        accountType: 'shadow',
        quantity: validatedData.quantity,
        takeProfit: validatedData.takeProfit,
        shadowClose: validatedData.shadowClose,
        network: validatedData.network
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
    
    console.error('Erro ao configurar conta Shadow:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento
    
    // Obtém configuração atual da conta Shadow
    const { data: shadowAccount, error } = await supabaseAdmin
      .from('encrypted_apis')
      .select('quantity, take_profit, shadow_close, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .eq('account_type', 'shadow')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar conta Shadow:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar configuração da conta Shadow'
      }, { status: 500 });
    }
    
    if (!shadowAccount) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Conta Shadow não configurada'
      }, { status: 200 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        accountType: 'shadow',
        quantity: shadowAccount.quantity,
        takeProfit: shadowAccount.take_profit,
        shadowClose: shadowAccount.shadow_close,
        isActive: shadowAccount.is_active,
        createdAt: shadowAccount.created_at,
        updatedAt: shadowAccount.updated_at
      },
      message: 'Configuração da conta Shadow obtida com sucesso'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao obter conta Shadow:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento
    
    // Remove configuração da conta Shadow
    const { error } = await supabaseAdmin
      .from('encrypted_apis')
      .delete()
      .eq('user_id', userId)
      .eq('account_type', 'shadow');
    
    if (error) {
      console.error('Erro ao remover conta Shadow:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao remover configuração da conta Shadow'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conta Shadow removida com sucesso'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao remover conta Shadow:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}