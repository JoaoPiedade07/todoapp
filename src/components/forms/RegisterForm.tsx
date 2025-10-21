'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEamil] = useState('')
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulação de autenticação - será substituída pela real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && username && password && confirmpassword) {
        if(password === confirmpassword)
        {
            const user = {
                id: '1',
                email,
                username,
                name: username === 'gestor' ? 'Gestor Principal' : 'Programador',
                type: username === 'gestor' ? 'manager' : 'programmer',
                department: 'IT'
              };
        }
        
        
        localStorage.setItem('user', JSON.stringify(username));
        router.push('/kanban');
      } else {
        setError('Por favor, preencha todos os campos');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
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
          <form onSubmit={handleRegister} className="space-y-4">
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
              label="Email"
              type="email"
              placeholder="Digite seu endereçom de email"
              value={email}
              onChange={(e) => setEamil(e.target.value)}
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

            <Input
              label="ConfirmPasswaord"
              type="confirmpassword"
              placeholder="Repita sua password"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <h2 className="text-sm text-blue-600 text-center mb-2 paddingtop-19px">Ainda não tem conta?</h2>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 space-y-1">
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};