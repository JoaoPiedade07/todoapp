'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validações
    if (!email || !username || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As passwords não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Simulação de registro - será substituída pela real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now().toString(),
        email,
        username,
        name: username, // Usando o username como nome por enquanto
        type: 'programmer', // Por padrão, novo usuário é programador
        department: 'IT',
        createdAt: new Date().toISOString()
      };
      
      // Salva o usuário no localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redireciona para o kanban
      router.push('/kanban');
      
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">TodoApp</h1>
          <p className="text-gray-600 mt-2">Criar Nova Conta</p>
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
              placeholder="Digite seu endereço de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Digite sua password (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirmar Password"
              type="password"
              placeholder="Repita sua password"
              value={confirmPassword}
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
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Link para login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
              >
                Faça login aqui
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-2">Notas:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Password deve ter pelo menos 6 caracteres</p>
              <p>• Novos utilizadores são criados como Programadores</p>
              <p>• Apenas Gestores podem criar outros Gestores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};