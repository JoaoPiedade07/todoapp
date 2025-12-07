'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getApiBaseUrl } from '@/lib/api';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const API_BASE_URL = getApiBaseUrl();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if(!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      if (!API_BASE_URL) {
        throw new Error('API URL não configurada. Verifique NEXT_PUBLIC_API_URL no Vercel.');
      }
      
      console.log('🔗 Tentando conectar em:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password
        }),
      });
      
      console.log('📡 Resposta recebida:', response.status, response.statusText);

      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      
      // Debug teste
      console.log('Dados do login:', data.user);
      
      const userData = {
        ...data.user,
        type: data.user.type === 'gestor' || data.user.type === 'programador' 
          ? data.user.type 
          : data.user.type === 'manager' ? 'gestor' : 'programador'
      };
        
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData)); // Usar userData corrigido
      
      router.push('/kanban');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">TodoApp</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão de Tarefas</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Digite sua password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Link para registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={handleRegisterRedirect}
                className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
              >
                Registe-se aqui
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-2">Credenciais de teste:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Gestor:</strong> email_gestor@exemplo.com / password</p>
              <p><strong>Programador:</strong> email_programador@exemplo.com / password</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};