'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { UserType, Department, NivelExperiencia } from '@/constants/enums'; // IMPORT ADICIONADO

export default function UsersPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE_URL = typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:3001`
    : 'http://localhost:3001';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const userObj = JSON.parse(userData);
    if (userObj.type !== UserType.MANAGER) {
      router.push('/kanban');
      return;
    }
    
    setUser(userObj);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        console.error('Erro ao buscar utilizadores');
        // Dados mock para demonstração
        loadMockUsers();
      }
    } catch (error) {
      console.error('Erro ao conectar com API:', error);
      loadMockUsers();
    } finally {
      setLoading(false);
    }
  };

  const loadMockUsers = () => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'gestor.principal',
        email: 'gestor@empresa.com',
        name: 'Carlos Silva',
        type: UserType.MANAGER,
        department: Department.IT,
        experience_level: NivelExperiencia.SENIOR,
        created_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2', 
        username: 'programador.joao',
        email: 'joao@empresa.com',
        name: 'João Santos',
        type: UserType.PROGRAMMER,
        department: Department.IT,
        experience_level: NivelExperiencia.SENIOR,
        manager_id: '1',
        created_at: '2024-02-20T00:00:00Z'
      },
      {
        id: '3',
        username: 'programadora.ana',
        email: 'ana@empresa.com', 
        name: 'Ana Costa',
        type: UserType.PROGRAMMER,
        department: Department.IT,
        experience_level: NivelExperiencia.JUNIOR,
        manager_id: '1',
        created_at: '2024-03-10T00:00:00Z'
      }
    ];
    setUsers(mockUsers);
  };

  const handleCreateUser = () => {
    // Navegar para página de criação de utilizador (Sprint 3)
    console.log('Criar novo utilizador');
    // router.push('/users/create');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <MainLayout user={user}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h1>
          <p className="text-gray-600">Gerencie os utilizadores do sistema</p>
        </div>
        
        <Button
          onClick={handleCreateUser}
          className="bg-green-600 hover:bg-green-700"
        >
          + Novo Utilizador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Lista de Utilizadores ({users.length})
          </h2>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum utilizador encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Departamento</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nível</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.type === UserType.MANAGER 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.type === UserType.MANAGER ? 'Gestor' : 'Programador'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.experience_level === NivelExperiencia.SENIOR
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.experience_level === NivelExperiencia.SENIOR ? 'Sénior' : 'Junior'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 text-xs"
                          >
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}