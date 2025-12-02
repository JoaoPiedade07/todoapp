'use client';

import { Task } from '@/types';
import { useState, useMemo } from 'react';
import { UserType, TaskStatus } from '@/constants/enums';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  userType: UserType;
  currentUser: any;
  programmers?: Programmer[];
}

interface Programmer {
  id: string;
  name: string;
  username: string;
  email: string;
  type: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onViewDetails,
  onEditTask,
  onDeleteTask,
  userType, 
  currentUser,
  programmers = [] 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const assignedUserName = useMemo(() => {
    if (!task.assigned_to) return null;
    const assignedProgrammer = programmers.find(p => p.id === task.assigned_to);
    return assignedProgrammer?.name || task.assigned_user_name || null;
  }, [task.assigned_to, task.assigned_user_name, programmers]);

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
    if (task.status === TaskStatus.DONE) {
      e.preventDefault();
      console.log('Tentativa de arrastar tarefa concluída bloqueada');
      return;
    }

    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('currentStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
    
    console.log('DRAG START:', { 
      taskId: task.id, 
      currentStatus: task.status,
      isDraggable: isDraggable 
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Não abrir detalhes se clicou em um botão de ação
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onViewDetails(task);
  };

  
//debugs test
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('DEBUG 6 - Botão editar clicado no TaskCard');
    console.log('DEBUG 7 - onEditTask existe?', !!onEditTask);
    console.log('DEBUG 8 - Task:', task);
    if (onEditTask) {
      onEditTask(task);
      console.log('DEBUG 9 - onEditTask chamado');
    } else {
      console.log('DEBUG 10 - onEditTask é undefined');
    }
  };


  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteTask && window.confirm('Tem certeza que deseja eliminar esta tarefa?')) {
      onDeleteTask(task.id);
    }
  };

  const formatUpdatedAt = () => {
    if (!task.updated_at) return 'Não disponível';
    try {
      return new Date(task.updated_at).toLocaleDateString('pt-PT');
    } catch {
      return 'Data inválida';
    }
  };

  const isDraggable = task.status !== TaskStatus.DONE && 
    (userType === UserType.PROGRAMMER || userType === UserType.MANAGER);

  const canEditDelete = userType === UserType.MANAGER;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 shadow-lg scale-95' : ''
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1 mr-2">{task.title}</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>
          
          {/* Botões de Ação - Aparecem apenas para gestores e no hover */}
          {canEditDelete && showActions && (
            <div className="flex gap-1">
              <button
                onClick={handleEditClick}
                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                title="Editar tarefa"
              >
                ✏️
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                title="Eliminar tarefa"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
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
          {task.estimated_hours && (
            <div className="flex items-center gap-1">
              <span className="font-medium">:</span>
              <span className="text-blue-600">{task.estimated_hours}h</span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="font-medium">Responsável:</div>
          <div className={`${assignedUserName ? 'text-gray-700' : 'text-orange-500 italic'}`}>
            {assignedUserName || 'Não atribuído'}
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>Atualizado: {formatUpdatedAt()}</span>
          <div className="flex gap-2">
            {isDraggable ? (
              <span className="text-blue-500 font-medium">Arrastável</span>
            ) : (
              <span className="text-gray-400 font-medium">Bloqueado</span>
            )}
            {canEditDelete && (
              <span className="text-green-500 font-medium">Gestor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};