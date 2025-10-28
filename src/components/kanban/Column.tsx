'use client';

import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { TaskStatus, UserType } from '@/constants/enums';

interface ColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onViewDetails: (task: Task) => void;
  userType: UserType;
}

export const Column: React.FC<ColumnProps> = ({
  title,
  status,
  tasks,
  onTaskMove,
  onViewDetails,
  userType
}) => {
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
    console.log('🔄 DRAG OVER coluna:', title);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-300', 'border-2');
    console.log('🚪 DRAG ENTER coluna:', title);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300', 'border-2');
    console.log('🚪 DRAG LEAVE coluna:', title);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300', 'border-2');
    
    const taskId = e.dataTransfer.getData('taskId');
    const currentStatus = e.dataTransfer.getData('currentStatus') as TaskStatus;
    
    console.log('🎯 DROP EVENT na coluna:', title);
    console.log('📦 Dados transferidos:', { taskId, currentStatus });
    console.log('🎯 Estado destino:', status);
    console.log('👤 Tipo de usuário:', userType);
    
    if (!taskId) {
      console.log('❌ taskId não encontrado no dataTransfer');
      return;
    }

    // Não permitir mover tarefas concluídas
    if (currentStatus === TaskStatus.DONE) {
      console.log('❌ Não pode mover tarefas concluídas');
      return;
    }
    
    // Só programadores podem mover tarefas
    if (userType !== UserType.PROGRAMMER) {
      console.log('❌ Apenas programadores podem mover tarefas');
      return;
    }
    
    // Não permitir mover para o mesmo estado
    if (currentStatus === status) {
      console.log('❌ Já está nesta coluna');
      return;
    }
    
    // Só permitir movimentos válidos
    const isValidMove = (
      (currentStatus === TaskStatus.TODO && status === TaskStatus.DOING) ||
      (currentStatus === TaskStatus.DOING && (status === TaskStatus.TODO || status === TaskStatus.DONE))
    );
    
    if (isValidMove) {
      console.log('✅ Movimento válido!');
      console.log('📞 Chamando onTaskMove...');
      onTaskMove(taskId, status);
    } else {
      console.log('❌ Movimento inválido:', { 
        de: currentStatus, 
        para: status 
      });
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
        className="flex-1 p-4 space-y-3 min-h-[500px] max-h-[600px] overflow-y-auto transition-all duration-200"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ minHeight: '400px' }} // Garantir altura mínima
      >
        {tasks.length === 0 ? (
          <div 
            className="text-center text-gray-500 text-sm py-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 transition-colors"
            style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div>
              <p>🔄 Arraste tarefas para aqui</p>
              <p className="text-xs mt-1">Solte para mover</p>
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewDetails={onViewDetails}
              userType={userType}
            />
          ))
        )}
      </div>
    </div>
  );
};