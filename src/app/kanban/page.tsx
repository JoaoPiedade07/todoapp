'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDetails } from '@/components/kanban/TaskDetails';
import { CreateTaskModal } from '@/components/kanban/CreateTaskModal';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskStatus, UserType } from '@/constants/enums';
import router from '@/lib/userRoute';

export default function KanbanPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isManager = user?.type === 'gestor';

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
    console.log('👤 User from localStorage:', userObj);
    
    // Converter tipos do backend para frontend
    const convertedUser = {
      ...userObj,
      type: userObj.type === 'gestor' ? UserType.MANAGER : UserType.PROGRAMMER
    };
    
    console.log('🔄 Converted user:', convertedUser);
    console.log('🎯 User type after conversion:', convertedUser.type);
    console.log('👑 Is manager?', convertedUser.type === UserType.MANAGER);
    console.log('💻 Is programmer?', convertedUser.type === UserType.PROGRAMMER);
    console.log('🔤 UserType.MANAGER value:', UserType.MANAGER);
    console.log('🔤 UserType.PROGRAMMER value:', UserType.PROGRAMMER);
    
    setUser(convertedUser);
    fetchTasks();

    // Carregar utilizadores se for gestor
    if (convertedUser.type === UserType.PROGRAMMER) {
      console.log('📥 Loading available users for manager');
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
      const response = await fetch(`${API_BASE_URL}/user/programmers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const usersData = await response.json();
        setAvailableUsers(usersData);
      } else {
        // Dados mock para demonstração
        setAvailableUsers([
          { id: '2', name: 'João Silva', username: 'joao.silva' },
          { id: '3', name: 'Maria Santos', username: 'maria.santos' },
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar programadores:', error);
      setAvailableUsers([
        { id: '2', name: 'João Silva', username: 'joao.silva' },
        { id: '3', name: 'Maria Santos', username: 'maria.santos' },
      ]);
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
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        console.log('✅ Task moved successfully');
      }
    } catch (error) {
      console.error('❌ Erro ao mover tarefa:', error);
    }
  };

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
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [...prev, newTask]);
      } else {
        // Adiciona localmente em caso de erro
        const mockTask = {
          id: Date.now().toString(),
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          order: taskData.order,
          story_points: taskData.story_points,
          assigned_user_name: availableUsers.find(u => u.id === taskData.assigned_to)?.name || 'Não atribuído',
          task_type_name: taskData.task_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTasks(prev => [...prev, mockTask]);
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
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

  // 🔍 DEBUG ANTES DO RENDER
  console.log('🎨 RENDERING - User:', user);
  console.log('🎨 RENDERING - User type:', user?.type);
  console.log('🎨 RENDERING - UserType.MANAGER:', UserType.MANAGER);
  console.log('🎨 RENDERING - UserType.PROGRAMMER:', UserType.PROGRAMMER);
  console.log('🎨 RENDERING - Should show button?', user?.type === UserType.MANAGER);
  console.log('🎨 RENDERING - Should show button (strict)?', user?.type === 'manager');

  return (
    <MainLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-gray-600">Gerencie suas tarefas de forma visual</p>
        
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

      {/* 🔥 BOTÃO FLUTUANTE - MOSTRAR SEMPRE (PARA TESTE) */}
      {user.type === UserType.MANAGER && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 z-40"
          title="Criar Nova Tarefa (TESTE)"
        >
          +
        </button>
      )}

      {/* Modal (sempre disponível para teste) */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTask={handleCreateTask}
        userType={user.type}
        availableUsers={availableUsers}
      />
    </MainLayout>
  );
}