'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulação de autenticação - será substituída pela real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (username && password) {
        const user = {
          id: '1',
          username,
          name: username === 'gestor' ? 'Gestor Principal' : 'Programador',
          type: username === 'gestor' ? 'manager' : 'programmer',
          department: 'IT'
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/kanban');
      } else {
        setError('Por favor, preencha todos os campos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
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
              label="Username"
              type="text"
              placeholder="Digite seu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Digite sua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-2">Credenciais de teste:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Gestor:</strong> gestor / qualquer password</p>
              <p><strong>Programador:</strong> programador / qualquer password</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};