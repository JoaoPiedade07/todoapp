'use client';

import { Task } from '@/types';
import { useState, useEffect } from 'react';
import { UserType, TaskStatus } from '@/constants/enums';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
  userType: UserType;
}

interface Programmer {
  id: string;
  name: string;
  username: string;
  email: string;
  type: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails, userType }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [programmers, setProgrammers] = useState<Programmer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const API_BASE_URL = typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:3001`
    : 'http://localhost:3001';

  useEffect(() => {
    const loadProgrammers = async () => {
      // ✅ Só carrega programadores se for manager E se ainda não carregou
      if (userType === UserType.MANAGER && programmers.length === 0 && !isLoading) {
        setIsLoading(true);
        try {
          console.log('🔍 Buscando programadores de:', `${API_BASE_URL}/users/programmers`);
          const response = await fetch(`${API_BASE_URL}/users/programmers`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data: Programmer[] = await response.json();
          console.log('👥 Programadores carregados:', data.length, data);
          setProgrammers(data);
        } catch (error) {
          console.error('❌ Erro ao carregar programadores: ', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProgrammers();

    // Verificar autenticação
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
  }, [userType, API_BASE_URL, programmers.length, isLoading, router]);

  // ✅ Função MELHORADA para encontrar o nome do usuário atribuído
  const getAssignedUserName = (): string | null => {
    if (!task.assigned_to) {
      console.log('📌 Task não tem assigned_to:', task.id);
      return null;
    }
    
    console.log('🔍 Procurando programador para task:', task.id, 'assigned_to:', task.assigned_to);
    console.log('👥 Programadores disponíveis:', programmers);
    
    // Primeiro tenta encontrar nos programadores carregados
    const assignedProgrammer = programmers.find(p => p.id === task.assigned_to);
    
    if (assignedProgrammer) {
      console.log('✅ Encontrou programador:', assignedProgrammer.name);
      return assignedProgrammer.name;
    }
    
    // Se não encontrar, verifica se a task já tem o nome (do JOIN do backend)
    if (task.assigned_user_name) {
      console.log('✅ Usando assigned_user_name do backend:', task.assigned_user_name);
      return task.assigned_user_name;
    }
    
    console.log('❌ Não encontrou nome para assigned_to:', task.assigned_to);
    return null;
  };

  const assignedUserName = getAssignedUserName();

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-red-100 text-red-800 border-red-200';
      case TaskStatus.DOING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskStatus.DONE: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'A Fazer';
      case TaskStatus.DOING: return 'Em Progresso';
      case TaskStatus.DONE: return 'Concluído';
      default: return status;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) return;
    
    setIsDragging(true);
    
    console.log('🧲 DRAG START - Task:', task.id);
    console.log('📋 Task status:', task.status);
    console.log('👤 User type:', userType);
    console.log('👥 Assigned user:', assignedUserName);
    
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('currentStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    console.log('🏁 DRAG END - Task:', task.id);
  };

  const handleClick = () => {
    console.log('🖱️ CLICK - Task:', task.id);
    onViewDetails(task);
  };

  const isDraggable = userType === UserType.PROGRAMMER && task.status !== TaskStatus.DONE;
  
  console.log(`🔄 TaskCard ${task.id} render - Draggable: ${isDraggable}, Assigned: ${assignedUserName}`);

  const formatUpdatedAt = () => {
    if (!task.updated_at) return 'Não disponível';
    try {
      return new Date(task.updated_at).toLocaleDateString('pt-PT');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 shadow-lg scale-95' : ''
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {getStatusText(task.status)}
        </span>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">Ordem:</span>
            <span>#{task.order}</span>
          </div>
          {task.story_points && (
            <div className="flex items-center gap-1">
              <span className="font-medium">SP:</span>
              <span>{task.story_points}</span>
            </div>
          )}
        </div>
        
        {/* ✅ USA O NOME ENCONTRADO OU MOSTRA "Não atribuído" */}
        <div className="text-right">
          <div className="font-medium">Responsável:</div>
          <div className={`${assignedUserName ? 'text-gray-700' : 'text-orange-500 italic'}`}>
            {assignedUserName || 'Não atribuído'}
          </div>
        </div>
      </div>

      {/* Debug info - útil para troubleshooting */}
      <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
        <div className="flex justify-between text-gray-400">
          <span>Atualizado: {formatUpdatedAt()}</span>
          {isLoading && <span className="text-blue-500">🔄 Carregando...</span>}
          {isDraggable && (
            <span className="text-blue-500 font-medium">🔄 Arrastável</span>
          )}
        </div>
        {/* Debug adicional - remove depois */}
        <div className="text-gray-400 mt-1">
          Task: {task.id} | Assigned: {task.assigned_to || 'N/A'} | 
          Programmers: {programmers.length}
        </div>
      </div>
    </div>
  );
};