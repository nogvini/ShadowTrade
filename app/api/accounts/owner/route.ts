import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { encryptCredentials } from '@/lib/crypto/encryption';
import { createLNMarketsClient } from '@/lib/lnmarkets/client';
import { getUserFromRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const ownerConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key é obrigatória'),
  apiSecret: z.string().min(1, 'API Secret é obrigatório'),
  passphrase: z.string().min(1, 'Passphrase é obrigatório'),
  network: z.enum(['mainnet', 'testnet']).optional().default('mainnet')
});

export async function POST(request: NextRequest) {
  try {
    // Autenticação obrigatória
    const { userId } = await getUserFromRequest(request);
    
    const body = await request.json();
    const validatedData = ownerConfigSchema.parse(body);
    
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
        account_type: 'owner',
        encrypted_api_key: JSON.stringify(encryptedCreds.encryptedApiKey),
        encrypted_api_secret: JSON.stringify(encryptedCreds.encryptedApiSecret),
        encrypted_passphrase: JSON.stringify(encryptedCreds.encryptedPassphrase),
        is_active: true
      }, {
        onConflict: 'user_id,account_type'
      });
    
    if (error) {
      console.error('Erro ao salvar conta Owner:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar configuração da conta'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conta Owner configurada com sucesso'
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      }, { status: 400 });
    }
    
    console.error('Erro ao configurar conta Owner:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 