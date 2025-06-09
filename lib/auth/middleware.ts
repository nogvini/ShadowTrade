import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shadowtrade-jwt-secret-change-in-production';

export interface AuthUser {
  userId: string;
  email: string;
}

/**
 * Extrai e valida o token JWT da requisição
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser> {
  try {
    // Tenta obter token do cookie primeiro
    let token = request.cookies.get('auth-token')?.value;
    
    // Se não encontrou no cookie, tenta no header Authorization
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.userId || !decoded.email) {
      throw new Error('Token inválido');
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
    
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
}

/**
 * Middleware para verificar autenticação
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  try {
    return await getUserFromRequest(request);
  } catch (error) {
    throw new Error('Autenticação necessária');
  }
}

/**
 * Verifica se o usuário está autenticado (sem lançar erro)
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    await getUserFromRequest(request);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gera um novo token JWT
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verifica se um token é válido
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded.userId || !decoded.email) {
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    return null;
  }
} 