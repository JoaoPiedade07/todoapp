'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDetails } from '@/components/kanban/TaskDetails';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskStatus, UserType } from '@/constants/enums';

export default function KanbanPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
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
    console.log('User from localStorage:', userObj);
    
    // 🔥 CORREÇÃO CRÍTICA: Converter tipos do backend para frontend
    const convertedUser = {
      ...userObj,
      type: userObj.type === 'gestor' ? UserType.MANAGER : UserType.PROGRAMMER
    };
    
    console.log('Converted user:', convertedUser);
    console.log('Should be draggable:', convertedUser.type === UserType.PROGRAMMER);
    
    setUser(convertedUser);
    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching tasks from:', `${API_BASE_URL}/tasks`);
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const tasksData = await response.json();
        console.log('Tasks from API:', tasksData);
        
        // Se a API não retornar tarefas, usa mock
        if (tasksData && tasksData.length > 0) {
          setTasks(tasksData);
        } else {
          console.log('API retornou array vazio, usando dados mock');
          loadMockTasks();
        }
      } else {
        console.error('Erro ao buscar tarefas:', response.statusText);
        loadMockTasks();
      }
    } catch (error) {
      console.error('Erro ao conectar com API:', error);
      loadMockTasks();
    } finally {
      setLoading(false);
    }
  };

  const loadMockTasks = () => {
    console.log('Carregando dados mock...');
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
      {
        id: '3',
        title: 'Configurar ambiente DevOps',
        description: 'Configurar CI/CD e ambiente de produção',
        status: TaskStatus.TODO,
        order: 3,
        story_points: 8,
        assigned_user_name: 'Pedro Costa',
        task_type_name: 'DevOps',
        created_at: '2024-10-26T11:45:00Z',
        updated_at: '2024-10-27T16:20:00Z',
      },
    ];
    setTasks(mockTasks);
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    console.log('Moving task:', taskId, 'to:', newStatus);
  
    if (user?.type !== UserType.PROGRAMMER) {
      console.log('❌ Apenas programadores podem mover tarefas');
      return;
    }
  
    // ✅ ATUALIZAÇÃO IMEDIATA DO ESTADO LOCAL (feedback visual)
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  
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
        console.log('✅ Task moved successfully in backend');
      } else {
        console.error('❌ Erro ao mover tarefa no backend:', response.statusText);
        // Mantém a atualização visual mesmo com erro no backend
      }
    } catch (error) {
      console.error('❌ Erro ao conectar com API:', error);
      // Mantém a atualização visual mesmo com erro de conexão
    }
  };

  const handleViewDetails = (task: Task) => {
    console.log('Task clicked:', task);
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleCloseDetails = () => {
    setShowTaskDetails(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    console.log('Editar tarefa:', task);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-gray-600">Gerencie suas tarefas de forma visual</p>
        
        {/* Estatísticas Rápidas */}
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

        {/* 🔥 DEBUG INFO - Remove depois de testar */}
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug Info:</strong> User: {user.name} | Type: {user.type} | 
          Draggable: {user.type === UserType.PROGRAMMER ? '✅ YES' : '❌ NO'}
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
          userType={user.type}
        />
      )}

      <TaskDetails
        task={selectedTask}
        isOpen={showTaskDetails}
        onClose={handleCloseDetails}
        userType={user.type}
        onEditTask={user.type === UserType.MANAGER ? handleEditTask : undefined}
      />
    </MainLayout>
  );
}