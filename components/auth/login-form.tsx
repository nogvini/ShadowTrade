'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Erro no login');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-depth light-glow" variant="depth">
      <CardHeader className="text-center space-y-4">
        <CardTitle>
          Entrar no ShadowTrade
        </CardTitle>
        <CardDescription>
          Acesse sua conta para gerenciar seus trades
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-error/10 border-error text-error">
              <AlertDescription className="font-press-start text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full shadow-depth" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          {onSwitchToRegister && (
            <div className="text-center mt-6">
              <p className="text-xs text-text-secondary font-press-start">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-success hover:text-success/80 font-press-start underline transition-colors"
                  disabled={isLoading}
                >
                  Criar conta
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 