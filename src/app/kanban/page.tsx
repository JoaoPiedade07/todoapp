'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDetails } from '@/components/kanban/TaskDetails';
import { CreateTaskModal } from '@/components/kanban/CreateTaskModal';
import { EditTaskModal } from '@/components/kanban/EditTaskModal';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TaskStatus, UserType } from '@/constants/enums';
import { getApiBaseUrl } from '@/lib/api';

// Force dynamic rendering since this page uses client-side features (localStorage, auth)
export const dynamic = 'force-dynamic';

export default function KanbanPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_BASE_URL = getApiBaseUrl();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const userObj = JSON.parse(userData);
    console.log('👤 User from localStorage:', userObj);
    
    // Converter tipos do backend para frontend
    const convertedUser = {
      ...userObj,
      type: userObj.type === 'gestor' ? UserType.MANAGER : UserType.PROGRAMMER
    };
    
    console.log('Converted user:', convertedUser);
    console.log('User type after conversion:', convertedUser.type);
    
    setUser(convertedUser);
    fetchTasks();

    if (convertedUser.type === UserType.MANAGER) {
      console.log('Loading available users for manager');
      fetchAvailableUsers();
    }
  }, [router]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tasksData = await response.json();
        // Garantir que assigned_to seja preservado explicitamente (incluindo null)
        const normalizedTasks = tasksData.map((task: any) => ({
          ...task,
          // Preservar assigned_to explicitamente - pode ser string (ID) ou null
          assigned_to: task.assigned_to !== undefined ? task.assigned_to : null,
          // Garantir que status seja mapeado corretamente
          status: task.status === 'inprogress' ? TaskStatus.DOING : 
                 task.status === 'todo' ? TaskStatus.TODO :
                 task.status === 'done' ? TaskStatus.DONE : task.status
        }));
        console.log('📋 Tarefas carregadas:', normalizedTasks.length);
        console.log('📋 Exemplo de tarefa:', normalizedTasks[0] ? {
          id: normalizedTasks[0].id,
          title: normalizedTasks[0].title,
          assigned_to: normalizedTasks[0].assigned_to,
          assigned_user_name: normalizedTasks[0].assigned_user_name
        } : 'Nenhuma tarefa');
        setTasks(normalizedTasks);
      } else {
        console.error('Erro ao buscar tarefas');
        loadMockTasks();
      }
    } catch (error) {
      console.error('Erro ao conectar com API:', error);
      loadMockTasks();
    } finally {
      setLoading(false);
    }
  };

  const handleEditTaskWrapper = (task: Task) => {
    openEditModal(task);
  };

  const handleEditTaskOriginal = async (taskId: string, updates: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
  
      if (response.ok) {
        await fetchTasks();
        closeEditModal();
        alert('Tarefa atualizada com sucesso!');
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error: any) {
      console.error('Erro ao editar tarefa:', error);
      alert('Erro ao editar tarefa: ' + (error.message || 'Erro desconhecido'));
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        await fetchTasks();
        closeEditModal();
        alert('Tarefa eliminada com sucesso!');
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error: any) {
      console.error('Erro ao eliminar tarefa:', error);
      alert('Erro ao eliminar tarefa: ' + (error.message || 'Erro desconhecido'));
      throw error;
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/programmers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const usersData = await response.json();
        setAvailableUsers(usersData);
      } else {
        console.error('Erro ao carregar programadores');
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar programadores:', error);
      setAvailableUsers([]);
    }
  };

  const loadMockTasks = () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Implementar sistema de login',
        description: 'Criar sistema de autenticação com JWT e proteção de rotas',
        status: TaskStatus.TODO,
        order: 1,
        story_points: 5,
        assigned_user_name: 'João Silva',
        task_type_name: 'Desenvolvimento',
        created_at: '2024-10-25T10:00:00Z',
        updated_at: '2024-10-28T08:30:00Z',
      },
      {
        id: '2',
        title: 'Design do banco de dados',
        description: 'Modelar a estrutura do banco de dados SQLite',
        status: TaskStatus.DOING,
        order: 2,
        story_points: 3,
        assigned_user_name: 'Maria Santos',
        task_type_name: 'Design',
        created_at: '2024-10-24T14:20:00Z',
        updated_at: '2024-10-28T09:15:00Z',
      },
    ];
    setTasks(mockTasks);
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    if (user?.type !== UserType.PROGRAMMER && user?.type !== UserType.MANAGER) {
      console.log('Usuário não autorizado a mover tarefas:', user?.type);
      return;
    }

    console.log('Movendo tarefa:', { taskId, newStatus, userType: user?.type });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        console.log('Tarefa movida com sucesso no servidor');
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        const errorText = await response.text();
        console.error('Erro ao mover tarefa no servidor:', errorText);
        alert('Erro ao mover tarefa: ' + errorText);
      }
    } catch (error) {
      console.error('Erro de conexão ao mover tarefa:', error);
      alert('Erro de conexão ao mover tarefa');
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      console.log('KanbanPage - Criando task:', taskData);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...taskData,
          id: Date.now().toString(),
          createdBy: user.id,
        }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const newTask = await response.json();
        console.log('KanbanPage - Task criada com sucesso:', newTask);
        
        setShowCreateModal(false);
        await fetchTasks();
        // Não mostrar alert aqui, o popup será mostrado no CreateTaskModal
      } else {
        const errorText = await response.text();
        console.error('KanbanPage - Erro do servidor:', errorText);
        throw new Error(errorText);
      }
    } catch (error: any) {
      console.error('KanbanPage - Erro de conexão:', error);
      throw error;
    }
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleCloseDetails = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };
  
  const closeEditModal = () => {
    setEditingTask(null);
    setShowEditModal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            <p className="text-gray-600">Gerencie suas tarefas de forma visual</p>
          </div>
          
          {user.type === UserType.MANAGER && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Criar Tarefa
            </button>
          )}
        </div>
        
        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <span className="font-semibold text-blue-800">Total: </span>
            <span className="text-blue-600">{tasks.length} tarefas</span>
          </div>
          <div className="bg-red-50 px-3 py-2 rounded-lg">
            <span className="font-semibold text-red-800">A Fazer: </span>
            <span className="text-red-600">{tasks.filter(t => t.status === TaskStatus.TODO).length}</span>
          </div>
          <div className="bg-yellow-50 px-3 py-2 rounded-lg">
            <span className="font-semibold text-yellow-800">Em Progresso: </span>
            <span className="text-yellow-600">{tasks.filter(t => t.status === TaskStatus.DOING).length}</span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <span className="font-semibold text-green-800">Concluído: </span>
            <span className="text-green-600">{tasks.filter(t => t.status === TaskStatus.DONE).length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="md" text="Carregando tarefas..." />
          </div>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onViewDetails={handleViewDetails}
          onEditTask={user.type === UserType.MANAGER ? handleEditTaskWrapper : undefined}
          onDeleteTask={user.type === UserType.MANAGER ? handleDeleteTask : undefined}
          userType={user.type}
          currentUser={user}
        />
      )}

      <EditTaskModal
        task={editingTask}
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleEditTaskOriginal}
        onDelete={handleDeleteTask}
        userType={user.type}
        availableUsers={availableUsers}
      />

      <TaskDetails
        task={selectedTask}
        isOpen={showTaskDetails}
        onClose={handleCloseDetails}
        userType={user.type}
        onEditTask={user.type === UserType.MANAGER ? openEditModal : undefined}
      />

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={handleCreateTask}
        userType={user.type}
        availableUsers={availableUsers}
        currentUser={user}
      />
    </MainLayout>
  );
}