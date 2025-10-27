'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Department } from '@/constants/enums';

export const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'programador' | 'gestor'>('programador');
  const [managerId, setManagerId] = useState('');
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Detectar automaticamente a URL do servidor baseada no browser
  const API_BASE_URL = typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:3001`
    : 'http://localhost:3001';

  // Carregar gestores quando o tipo for programador
  useEffect(() => {
    if(userType === 'programador') {
      fetch(`${API_BASE_URL}/users/managers`)
      .then(res => res.json())
      .then(data => setAvailableManagers(data))
      .catch(err => console.error('Erro ao carregar gestores: ', err));
    } else {
      setAvailableManagers([]);
      setManagerId(''); // Limpar seleção ao mudar para gestor
    }
  }, [userType, API_BASE_URL]);

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

    if(userType === 'programador' && !managerId) {
      setError('Por favor, selecione um gestor responsável');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`,  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          name: username,
          email,
          password,
          type: userType === 'programador' ? 'programador' : 'gestor',
          department: Department.IT,
          manager_id: userType === 'programador' ? managerId: undefined
        }),
      });

      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();


      
      // Salva o usuário no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redireciona para o kanban
      router.push('/kanban');
      
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
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

            {/* Botão Switch com animação suave */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tipo de Conta
              </label>
              <div className="relative inline-flex bg-gray-100 rounded-lg p-1">
                {/* Indicador de seleção com animação */}
                <div 
                  className={`absolute top-1 bottom-1 rounded-md bg-blue-600 shadow-sm transition-all duration-300 ease-in-out ${
                    userType === 'programador' 
                      ? 'left-1 right-1/2' 
                      : 'left-1/2 right-1'
                  }`}
                />
                
                <button
                  type="button"
                  onClick={() => setUserType('programador')}
                  className={`relative flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ease-in-out z-10 ${
                    userType === 'programador'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Programador
                </button>
                
                <button
                  type="button"
                  onClick={() => setUserType('gestor')}
                  className={`relative flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ease-in-out z-10 ${
                    userType === 'gestor'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Gestor
                </button>
              </div>
            </div>

            {/* ⬅️ Seleção de gestor (apenas para programadores) */}
                {userType === 'programador' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Gestor Responsável *
                    </label>
                    <select
                      value={managerId}
                      onChange={(e) => setManagerId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um gestor</option>
                      {availableManagers.map((manager: any) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} ({manager.username})
                        </option>
                      ))}
                    </select>
                    {availableManagers.length === 0 && (
                      <p className="text-xs text-gray-500">
                        Não há gestores disponíveis. Crie uma conta de gestor primeiro.
                      </p>
                    )}
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
                className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer transition-colors duration-200"
              >
                Faça login aqui
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-2">Notas:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Password deve ter pelo menos 6 caracteres</p>
              <p>• <strong>Programadores</strong> podem mover suas tarefas no Kanban</p>
              <p>• <strong>Gestores</strong> podem criar tarefas e gerir utilizadores</p>
              <p className="text-orange-600">• Em produção, apenas Gestores poderiam criar outros Gestores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};