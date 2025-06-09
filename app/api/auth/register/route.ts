import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { hashPassword } from '@/lib/crypto/encryption';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
    // Verifica se o email já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email já está em uso'
      }, { status: 400 });
    }
    
    // Hash da senha
    const hashedPassword = hashPassword(validatedData.password);
    
    // Cria o usuário
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: validatedData.email,
        password_hash: hashedPassword
      })
      .select('id, email, created_at')
      .single();
    
    if (error) {
      console.error('Erro ao criar usuário:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar usuário'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.created_at
      }
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      }, { status: 400 });
    }
    
    console.error('Erro no registro:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 