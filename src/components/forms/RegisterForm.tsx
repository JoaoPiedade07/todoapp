'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Department } from '@/constants/enums';
import { getApiBaseUrl } from '@/lib/api';

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
  
  const API_BASE_URL = getApiBaseUrl();
  
  // Log para debug
  useEffect(() => {
    console.log('🔍 RegisterForm - API_BASE_URL:', API_BASE_URL || '(vazia - configure NEXT_PUBLIC_API_URL no Vercel)');
  }, [API_BASE_URL]);

  // Carregar gestores quando o tipo for programador
  useEffect(() => {
    if(userType === 'programador') {
      if (!API_BASE_URL || API_BASE_URL.trim() === '') {
        console.warn('⚠️ API_BASE_URL vazia - não é possível carregar gestores');
        setAvailableManagers([]);
        return;
      }
      
      const managersUrl = `${API_BASE_URL}/auth/managers`;
      console.log('🔗 Carregando gestores de:', managersUrl);
      
      fetch(managersUrl)
      .then(async res => {
        console.log('📡 Resposta gestores:', res.status, res.statusText);
        if (!res.ok) {
          if (res.status === 404) {
            console.error('❌ Rota /auth/managers não encontrada. Verifique se o backend está rodando e acessível.');
            throw new Error('Backend não encontrado. Verifique NEXT_PUBLIC_API_URL no Vercel.');
          }
          const errorData = await res.json().catch(() => ({ error: `Erro ${res.status}: ${res.statusText}` }));
          console.error('Erro na resposta:', errorData);
          throw new Error(errorData.error || 'Erro ao carregar gestores');
        }
        const data = await res.json();
        return data;
      })
      .then(data => {
        // Garantir que data é um array
        const managers = Array.isArray(data) ? data : [];
        console.log('✅ Gestores carregados:', managers.length, 'gestores');
        setAvailableManagers(managers);
      })
      .catch(err => {
        console.error('❌ Erro ao carregar gestores:', err.message || err);
        setAvailableManagers([]);
      });
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
      if (!API_BASE_URL || API_BASE_URL.trim() === '') {
        const errorMsg = '❌ API URL não configurada!\n\n' +
          'Configure a variável NEXT_PUBLIC_API_URL no Vercel:\n' +
          '1. Vá em Settings → Environment Variables\n' +
          '2. Adicione: NEXT_PUBLIC_API_URL = https://seu-backend.railway.app\n' +
          '3. Faça um novo deploy';
        console.error(errorMsg);
        throw new Error('API URL não configurada. Configure NEXT_PUBLIC_API_URL no Vercel e faça um novo deploy.');
      }
      
      // Garantir que a URL é absoluta (começa com http:// ou https://)
      if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
        throw new Error(`URL da API inválida: ${API_BASE_URL}. Deve começar com http:// ou https://`);
      }
      
      const registerUrl = `${API_BASE_URL}/auth/register`;
      console.log('🔗 Tentando registrar em:', registerUrl);
      console.log('📦 Dados enviados:', {
        username,
        email,
        type: userType === 'programador' ? 'programador' : 'gestor',
        hasManagerId: !!managerId
      });
      
      const response = await fetch(registerUrl, {
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
      
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        ok: response.ok
      });

      if(!response.ok) {
        let errorMessage = 'Erro ao criar conta';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // Se não conseguir parsear JSON, usar status text
          if (response.status === 404) {
            errorMessage = `❌ Backend não encontrado (404)\n\n` +
              `A URL ${registerUrl} não está acessível.\n\n` +
              `Possíveis causas:\n` +
              `1. NEXT_PUBLIC_API_URL não está configurada no Vercel\n` +
              `2. A URL do backend está incorreta\n` +
              `3. O backend no Railway não está rodando\n\n` +
              `Verifique:\n` +
              `- Console do navegador para ver a URL usada\n` +
              `- Logs do Railway para ver se o backend está rodando\n` +
              `- Variáveis de ambiente no Vercel`;
          } else {
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
          console.error('❌ Erro ao parsear resposta:', parseError);
        }
        console.error('❌ Erro completo:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorMessage
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();

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


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">TodoApp</h1>
          <p className="text-gray-600 mt-2">Criar Nova Conta</p>
        </CardHeader>
        
        <CardContent>
          {(!API_BASE_URL || API_BASE_URL.trim() === '') && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm mb-4">
              <p className="font-semibold mb-2">⚠️ Configuração Necessária</p>
              <p className="mb-2">A variável <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> não está configurada no Vercel.</p>
              <p className="text-xs mb-2">Para corrigir:</p>
              <ol className="text-xs list-decimal list-inside space-y-1 mb-2">
                <li>Acesse o Dashboard do Vercel</li>
                <li>Vá em <strong>Settings → Environment Variables</strong></li>
                <li>Adicione: <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> = <code className="bg-yellow-100 px-1 rounded">https://seu-backend.railway.app</code></li>
                <li>Faça um novo deploy</li>
              </ol>
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão Switch */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tipo de Conta
              </label>
              <div className="relative inline-flex bg-gray-100 rounded-lg p-1">
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

            {/* Seleção de gestor (apenas para programadores) */}
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
                      {Array.isArray(availableManagers) && availableManagers.map((manager: any) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} ({manager.username})
                        </option>
                      ))}
                    </select>
                    {(!Array.isArray(availableManagers) || availableManagers.length === 0) && (
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Digite seu endereço de email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Digite sua password (mín. 6 caracteres)"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirmar Password"
              type="password"
              placeholder="Repita sua password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
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
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer transition-colors duration-200"
              >
                Faça login aqui
              </Link>
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