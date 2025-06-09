import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { encryptCredentials } from '@/lib/crypto/encryption';
import { createLNMarketsClient } from '@/lib/lnmarkets/client';
import { z } from 'zod';

const slaveConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  apiSecret: z.string().min(1, 'API Secret é obrigatório'),
  passphrase: z.string().min(1, 'Passphrase é obrigatório'),
  network: z.enum(['mainnet', 'testnet']).optional().default('mainnet'),
  quantity: z.number().positive('Quantidade deve ser positiva').optional()
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Adicionar autenticação aqui
    // const userId = await getUserFromRequest(request);
    const userId = 'temp-user-id'; // Temporário para desenvolvimento
    
    const body = await request.json();
    const validatedData = slaveConfigSchema.parse(body);
    
    // Testa conexão com LNMarkets
    const client = createLNMarketsClient(validatedData);
    const connectionTest = await client.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: `Erro na conexão com LNMarkets: ${connectionTest.error}`
      }, { status: 400 });
    }
    
    // Criptografa credenciais
    const encryptedCreds = encryptCredentials(validatedData);
    
    // Salva no banco de dados
    const { error } = await supabaseAdmin
      .from('encrypted_apis')
      .upsert({
        user_id: userId,
        account_type: 'slave',
        encrypted_api_key: JSON.stringify(encryptedCreds.encryptedApiKey),
        encrypted_api_secret: JSON.stringify(encryptedCreds.encryptedApiSecret),
        encrypted_passphrase: JSON.stringify(encryptedCreds.encryptedPassphrase),
        quantity: validatedData.quantity,
        take_profit: null, // Slave não tem take_profit
        shadow_close: null, // Slave não tem shadow_close (sempre fecha automaticamente)
        is_active: true
      }, {
        onConflict: 'user_id,account_type'
      });
    
    if (error) {
      console.error('Erro ao salvar conta Slave:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar configuração da conta Slave'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conta Slave configurada com sucesso',
      data: {
        accountType: 'slave',
        quantity: validatedData.quantity,
        network: validatedData.network,
        autoClose: true // Slave sempre fecha automaticamente
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
    
    console.error('Erro ao configurar conta Slave:', error);
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
    
    // Obtém configuração atual da conta Slave
    const { data: slaveAccount, error } = await supabaseAdmin
      .from('encrypted_apis')
      .select('quantity, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .eq('account_type', 'slave')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar conta Slave:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar configuração da conta Slave'
      }, { status: 500 });
    }
    
    if (!slaveAccount) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Conta Slave não configurada'
      }, { status: 200 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        accountType: 'slave',
        quantity: slaveAccount.quantity,
        isActive: slaveAccount.is_active,
        autoClose: true, // Slave sempre fecha automaticamente
        createdAt: slaveAccount.created_at,
        updatedAt: slaveAccount.updated_at
      },
      message: 'Configuração da conta Slave obtida com sucesso'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao obter conta Slave:', error);
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
    
    // Remove configuração da conta Slave
    const { error } = await supabaseAdmin
      .from('encrypted_apis')
      .delete()
      .eq('user_id', userId)
      .eq('account_type', 'slave');
    
    if (error) {
      console.error('Erro ao remover conta Slave:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao remover configuração da conta Slave'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conta Slave removida com sucesso'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro ao remover conta Slave:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 