'use client';

import { useState } from 'react';
import { LoginForm } from '../../components/auth/login-form';
import { RegisterForm } from '../../components/auth/register-form';
import { ProtectedRoute } from '../../components/auth/protected-route';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm 
              onSwitchToLogin={() => setIsLogin(true)}
              onSuccess={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 