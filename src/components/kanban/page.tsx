'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDetails } from '@/components/kanban/TaskDetails';
import { CreateTaskModal } from '@/components/kanban/CreateTaskModal';
import { EditTaskModal } from '@/components/kanban/EditTaskModal';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskStatus, UserType } from '@/constants/enums';

export default function KanbanPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
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
    const convertedUser = {
      ...userObj,
      type: userObj.type === 'gestor' ? UserType.MANAGER : UserType.PROGRAMMER
    };
    
    setUser(convertedUser);
    fetchTasks();

    if (convertedUser.type === UserType.MANAGER) {
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
        setTasks(tasksData);
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

  // Func para salvar as edições (chamada pelo modal)
  const handleSaveTask = async (taskId: string, updates: any) => {
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
        setShowEditModal(false);
        alert('Tarefa atualizada com sucesso!');
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error: any) {
      console.error('Erro ao editar tarefa:', error);
      alert('Erro ao editar tarefa: ' + error.message);
    }
  };

  // Func para eliminar tarefa
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
        setShowEditModal(false);
        alert('Tarefa eliminada com sucesso!');
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error: any) {
      console.error('Erro ao eliminar tarefa:', error);
      alert('Erro ao eliminar tarefa: ' + error.message);
    }
  };

  // Func para criar tarefa
  const handleCreateTask = async (taskData: any) => {
    try {
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

      if (response.ok) {
        setShowCreateModal(false);
        await fetchTasks();
        alert('Tarefa criada com sucesso!');
      } else {
        const errorText = await response.text();
        alert('Erro ao criar tarefa: ' + errorText);
      }
    } catch (error) {
      alert('Erro de conexão ao criar tarefa');
    }
  };

  // Func para mover tarefa (drag and drop)
  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    if (user?.type !== UserType.PROGRAMMER && user?.type !== UserType.MANAGER) {
      return;
    }

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
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        const errorText = await response.text();
        alert('Erro ao mover tarefa: ' + errorText);
      }
    } catch (error) {
      alert('Erro de conexão ao mover tarefa');
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

  const closeEditModal = () => {
    setEditingTask(null);
    setShowEditModal(false);
  };

const openEditModal = (task: Task) => {
  console.log('🔴 DEBUG 1 - openEditModal CHAMADA! Task:', task);
  alert('Modal deve abrir agora! Task: ' + task.title);
  setEditingTask(task);
  setShowEditModal(true);
};

console.log('🟡 DEBUG 5 - Estado atual do componente:', {
  showEditModal,
  editingTask: editingTask?.id,
  userType: user?.type,
  isUserManager: user?.type === UserType.MANAGER
});

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando tarefas...</p>
          </div>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onViewDetails={handleViewDetails}
          onEditTask={user.type === UserType.MANAGER ? openEditModal : undefined}
          onDeleteTask={user.type === UserType.MANAGER ? handleDeleteTask : undefined}
          userType={user.type}
          currentUser={user}
        />
      )}

      {/* Modal de Edição */}
      <EditTaskModal
        task={editingTask}
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        userType={user.type}
        availableUsers={availableUsers}
      />

      {/* Modal de Detalhes */}
      <TaskDetails
        task={selectedTask}
        isOpen={showTaskDetails}
        onClose={handleCloseDetails}
        userType={user.type}
        onEditTask={user.type === UserType.MANAGER ? openEditModal : undefined}
      />

      {/* Modal para criar tarefa */}
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