import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyPassword } from '@/lib/crypto/encryption';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const JWT_SECRET = process.env.JWT_SECRET || 'shadowtrade-jwt-secret-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    // Busca o usuário pelo email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash')
      .eq('email', validatedData.email)
      .single();
    
    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: 'Email ou senha inválidos'
      }, { status: 401 });
    }
    
    // Verifica a senha
    const isPasswordValid = verifyPassword(validatedData.password, user.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Email ou senha inválidos'
      }, { status: 401 });
    }
    
    // Gera JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { 
        expiresIn: '7d' // Token válido por 7 dias
      }
    );
    
    // Cria resposta com cookie httpOnly
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        id: user.id,
        email: user.email,
        token // Também retorna no body para uso no frontend
      }
    }, { status: 200 });
    
    // Define cookie httpOnly para segurança
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      }, { status: 400 });
    }
    
    console.error('Erro no login:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Logout - remove o cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    }, { status: 200 });
    
    // Remove o cookie
    response.cookies.delete('auth-token');
    
    return response;
    
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 