'use client';

import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { TaskStatus, UserType } from '@/constants/enums';
import { useState } from 'react';

interface ColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onViewDetails: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void; 
  userType: UserType;
  currentUser: any;
}

export const Column: React.FC<ColumnProps> = ({
  title,
  status,
  tasks,
  onTaskMove,
  onViewDetails,
  onEditTask,
  onDeleteTask,
  userType,
  currentUser
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const getColumnColor = () => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-red-50 border-red-200 text-red-900';
      case TaskStatus.DOING: return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case TaskStatus.DONE: return 'bg-green-50 border-green-200 text-green-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getBadgeColor = () => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-red-200 text-red-800';
      case TaskStatus.DOING: return 'bg-yellow-200 text-yellow-800';
      case TaskStatus.DONE: return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    console.log('DRAG OVER coluna:', title);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    console.log('DRAG ENTER coluna:', title);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
    console.log('DRAG LEAVE coluna:', title);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('taskId');
    const currentStatus = e.dataTransfer.getData('currentStatus') as TaskStatus;
    
    console.log('Drop Event Detectado na coluna:', title);
    console.log('Dados transferidos:', { taskId, currentStatus });
    console.log('Estado destino:', status);
    console.log('Tipo de usuário:', userType);
    console.log('onTaskMove function:', typeof onTaskMove);
      
    if (!taskId) {
      console.log('taskId não encontrado no dataTransfer');
      return;
    }

    if (currentStatus === TaskStatus.DONE) {
      console.log('Não pode mover tarefas concluídas');
      alert('Tarefas concluídas não podem ser movidas!');
      return;
    }
    
    // Permitir que tanto programadores quanto gestores movam tarefas
    if (userType !== UserType.PROGRAMMER && userType !== UserType.MANAGER) {
      console.log('Apenas programadores e gestores podem mover tarefas');
      return;
    }
    
    // Não permitir mover para o mesmo estado
    if (currentStatus === status) {
      console.log('Já está nesta coluna');
      return;
    }
    
    let isValidMove = false;
    
    // Se o destino for "Concluído", só permitir se vier de "Em Progresso"
    if (status === TaskStatus.DONE) {
      isValidMove = currentStatus === TaskStatus.DOING;
    } else {
      // Movimento entre "A Fazer" e "Em Progresso" é sempre permitido
      isValidMove = true;
    }
    
    if (isValidMove) {
      console.log('Movimento válido!');
      console.log('Chamando onTaskMove...');
      onTaskMove(taskId, status);
    } else {
      console.log('Movimento inválido:', { 
        de: currentStatus, 
        para: status,
        userType: userType
      });
      
      if (status === TaskStatus.DONE) {
        alert('Só pode concluir tarefas que estão em progresso!');
      } else {
        alert('Movimento não permitido!');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className={`border-b p-4 rounded-t-lg ${getColumnColor()}`}>
        <h2 className="font-semibold flex justify-between items-center">
          {title}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
            {tasks.length}
          </span>
        </h2>
      </div>
      
      <div 
        className={`flex-1 p-4 space-y-3 min-h-[500px] max-h-[600px] overflow-y-auto transition-all duration-200 ${
          isDragOver 
            ? 'bg-blue-50 border-2 border-blue-300 border-dashed' 
            : 'bg-transparent border-2 border-transparent'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ minHeight: '400px' }}
      >
        {tasks.length === 0 ? (
          <div 
            className={`text-center text-gray-500 text-sm py-16 border-2 border-dashed rounded-lg transition-colors ${
              isDragOver 
                ? 'border-blue-300 bg-blue-25 text-blue-600' 
                : 'border-gray-300 bg-gray-50'
            }`}
            style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div>
              <p>{isDragOver ? 'Solte aqui!' : 'Arraste tarefas para aqui'}</p>
              <p className="text-xs mt-1">{isDragOver ? 'Libere para mover' : 'Solte para mover'}</p>
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewDetails={onViewDetails}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              userType={userType}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
};