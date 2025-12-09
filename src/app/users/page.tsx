'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/types';
import { UserType, Department, NivelExperiencia } from '@/constants/enums';
import { isManager, getUserTypeLabel, normalizeUserFromAPI } from '@/lib/userUtils';
import { getApiBaseUrl } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function UsersPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE_URL = getApiBaseUrl();

  // Form data para criar/editar utilizador
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    type: UserType.PROGRAMMER,
    department: Department.IT,
    experience_level: NivelExperiencia.JUNIOR,
    manager_id: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Função para testar a API
  const testAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Users data:', data);
      } else {
        console.log('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('API Connection error:', error);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const userObj = JSON.parse(userData);
    
    // Verificar se é gestor - usando a função de compatibilidade
    if (!isManager(userObj.type)) {
      router.push('/kanban');
      return;
    }
    
    setUser(userObj);
    testAPI();
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
        // Normalizar os dados da API para o formato do frontend
        const normalizedUsers = usersData.map((user: any) => normalizeUserFromAPI(user));
        setUsers(normalizedUsers);
      } else {
        console.warn('API não disponível, carregando dados mock');
        loadMockUsers();
      }
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
      loadMockUsers();
    } finally {
      setLoading(false);
    }
  };

  const loadMockUsers = () => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@todoapp.com',
        name: 'Administrador',
        type: UserType.MANAGER,
        department: Department.IT,
        experience_level: NivelExperiencia.SENIOR,
        created_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        username: 'joao.silva',
        email: 'joao@empresa.com',
        name: 'João Silva',
        type: UserType.PROGRAMMER,
        department: Department.IT,
        experience_level: NivelExperiencia.SENIOR,
        manager_id: '1',
        created_at: '2024-02-20T00:00:00Z'
      },
      {
        id: '3',
        username: 'maria.santos',
        email: 'maria@empresa.com',
        name: 'Maria Santos',
        type: UserType.PROGRAMMER,
        department: Department.IT,
        experience_level: NivelExperiencia.JUNIOR,
        manager_id: '1',
        created_at: '2024-03-10T00:00:00Z'
      }
    ];
    setUsers(mockUsers);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Submetendo formulário:', formData);
    
    // Validações
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.password && !editingUser) newErrors.password = 'Password é obrigatória';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords não coincidem';
    if (formData.type === UserType.PROGRAMMER && !formData.manager_id) {
      newErrors.manager_id = 'Gestor responsável é obrigatório para programadores';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token);
      
      // Preparar dados para a API
      const userData = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        ...(formData.password && { password: formData.password }),
        type: formData.type === UserType.MANAGER ? 'gestor' : 'programador',
        department: formData.department,
        experience_level: formData.experience_level,
        manager_id: formData.type === UserType.PROGRAMMER ? formData.manager_id : undefined
      };

      console.log('Dados enviados para API:', userData);

      const url = editingUser ? `${API_BASE_URL}/users/${editingUser.id}` : `${API_BASE_URL}/auth/register`;
      const method = editingUser ? 'PUT' : 'POST';

      console.log('Chamando API:', method, url);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Sucesso:', result);
        
        fetchUsers();
        handleCloseModal();
        showToast({
          message: editingUser ? 'Utilizador atualizado com sucesso!' : 'Utilizador criado com sucesso!',
          type: 'success',
          duration: 3000
        });
      } else {
        const errorText = await response.text();
        console.log('Erro da API:', errorText);
        setErrors({ submit: errorText || 'Erro ao processar pedido' });
        showToast({
          message: 'Erro ao ' + (editingUser ? 'atualizar' : 'criar') + ' utilizador: ' + errorText,
          type: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro de conexão completo:', error);
      const errorMessage = 'Erro de conexão: ' + (error as Error).message;
      setErrors({ submit: errorMessage });
      showToast({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('🗑️ Tentando eliminar usuário:', userId);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token usado:', token);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('DELETE Response status:', response.status);
      console.log('DELETE Response ok:', response.ok);

      if (response.ok) {
        console.log('Utilizador eliminado com sucesso');
        // Atualizar a lista localmente primeiro para feedback imediato
        setUsers(prev => prev.filter(user => user.id !== userId));
        setShowDeleteConfirm(null);
        showToast({
          message: 'Utilizador eliminado com sucesso!',
          type: 'success',
          duration: 3000
        });
        
        // Recarregar da API para garantir sincronização
        setTimeout(() => fetchUsers(), 100);
      } else {
        const errorText = await response.text();
        console.log('Erro ao eliminar utilizador:', errorText);
        showToast({
          message: `Erro ao eliminar utilizador: ${response.status} ${errorText}`,
          type: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      showToast({
        message: 'Erro de conexão ao eliminar utilizador',
        type: 'error',
        duration: 5000
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name,
      password: '',
      confirmPassword: '',
      type: user.type,
      department: user.department,
      experience_level: user.experience_level || NivelExperiencia.JUNIOR,
      manager_id: user.manager_id || ''
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      type: UserType.PROGRAMMER,
      department: Department.IT,
      experience_level: NivelExperiencia.JUNIOR,
      manager_id: ''
    });
    setErrors({});
  };

  const getManagerName = (managerId: string) => {
    const manager = users.find(u => u.id === managerId);
    return manager ? manager.name : 'Não atribuído';
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case NivelExperiencia.ESTAGIARIO: return 'Estagiário';
      case NivelExperiencia.JUNIOR: return 'Junior';
      case NivelExperiencia.PLENO: return 'Pleno';
      case NivelExperiencia.SENIOR: return 'Sénior';
      default: return level;
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case NivelExperiencia.ESTAGIARIO: return 'bg-blue-100 text-blue-800';
      case NivelExperiencia.JUNIOR: return 'bg-yellow-100 text-yellow-800';
      case NivelExperiencia.PLENO: return 'bg-orange-100 text-orange-800';
      case NivelExperiencia.SENIOR: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar apenas gestores para o dropdown
  const managers = users.filter(u => isManager(u.type));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h1>
          <p className="text-gray-600">Gerencie os utilizadores do sistema</p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
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
              <LoadingSpinner size="md" text="Carregando utilizadores..." />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum utilizador encontrado
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Username</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Departamento</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nível</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Gestor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.username}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isManager(user.type)
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getUserTypeLabel(user.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getExperienceLevelColor(user.experience_level || '')
                        }`}>
                          {getExperienceLevelLabel(user.experience_level || '')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.manager_id ? getManagerName(user.manager_id) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                            onClick={() => handleEditUser(user)}
                          >
                            Editar
                          </Button>
                          {user.id !== '1' && ( // Não permitir eliminar o admin principal
                            <Button
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700 text-xs"
                              onClick={() => setShowDeleteConfirm(user.id)}
                            >
                              Eliminar
                            </Button>
                          )}
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

      {/* Modal de Criação/Edição */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Editar Utilizador' : 'Criar Novo Utilizador'}
              </h2>
              <Button
                onClick={handleCloseModal}
                className="bg-gray-500 hover:bg-gray-600"
              >
                ✕
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {errors.submit}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <Input
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <Input
                      placeholder="username"
                      value={formData.username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.username ? 'border-red-500' : ''}
                    />
                    {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="email@empresa.com"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Utilizador *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as UserType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={UserType.PROGRAMMER}>Programador</option>
                      <option value={UserType.MANAGER}>Gestor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={Department.IT}>IT</option>
                      <option value={Department.ADMINISTRACAO}>Administração</option>
                      <option value={Department.MARKETING}>Marketing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Experiência *
                    </label>
                    <select
                      value={formData.experience_level}
                      onChange={(e) => setFormData({ ...formData, experience_level: e.target.value as NivelExperiencia })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={NivelExperiencia.ESTAGIARIO}>Estagiário</option>
                      <option value={NivelExperiencia.JUNIOR}>Junior</option>
                      <option value={NivelExperiencia.PLENO}>Pleno</option>
                      <option value={NivelExperiencia.SENIOR}>Sénior</option>
                    </select>
                  </div>

                  {formData.type === UserType.PROGRAMMER && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gestor Responsável *
                      </label>
                      <select
                        value={formData.manager_id}
                        onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.manager_id ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Selecione um gestor</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </select>
                      {errors.manager_id && <p className="mt-1 text-sm text-red-600">{errors.manager_id}</p>}
                    </div>
                  )}
                </div>

                {!editingUser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Password *
                      </label>
                      <Input
                        type="password"
                        placeholder="Confirmar password"
                        value={formData.confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {editingUser ? 'Atualizar' : 'Criar'} Utilizador
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Eliminação */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminação</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Tem a certeza que deseja eliminar este utilizador? Esta ação não pode ser revertida.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}