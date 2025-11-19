'use client';

import { Task } from '@/types';
import { useState, useMemo } from 'react';
import { UserType, TaskStatus } from '@/constants/enums';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
  userType: UserType;
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
  userType, 
  programmers = [] 
}) => {
  const [isDragging, setIsDragging] = useState(false);

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
    if (!isDraggable) return;
    
    setIsDragging(true);
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('currentStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    onViewDetails(task);
  };

  const formatUpdatedAt = () => {
    if (!task.updated_at) return 'Não disponível';
    try {
      return new Date(task.updated_at).toLocaleDateString('pt-PT');
    } catch {
      return 'Data inválida';
    }
  };

  const isDraggable = userType === UserType.PROGRAMMER && task.status !== TaskStatus.DONE;

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
        
        <div className="text-right">
          <div className="font-medium">Responsável:</div>
          <div className={`${assignedUserName ? 'text-gray-700' : 'text-orange-500 italic'}`}>
            {assignedUserName || 'Não atribuído'}
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Atualizado: {formatUpdatedAt()}</span>
          {isDraggable && (
            <span className="text-blue-500 font-medium">🔄 Arrastável</span>
          )}
        </div>
      </div>
    </div>
  );
};