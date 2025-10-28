'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Column } from './Column';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: 'todo' | 'doing' | 'done') => void;
  onViewDetails: (task: Task) => void;
  userType: 'manager' | 'programmer';
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskMove,
  onViewDetails,
  userType
}) => {
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [doingTasks, setDoingTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTodoTasks(tasks.filter(task => task.status === 'todo'));
    setDoingTasks(tasks.filter(task => task.status === 'doing'));
    setDoneTasks(tasks.filter(task => task.status === 'done'));
  }, [tasks]);

  const columns = [
    {
      title: 'A Fazer',
      status: 'todo' as const,
      tasks: todoTasks
    },
    {
      title: 'Em Progresso',
      status: 'doing' as const,
      tasks: doingTasks
    },
    {
      title: 'Concluído',
      status: 'done' as const,
      tasks: doneTasks
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <Column
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={column.tasks}
          onTaskMove={onTaskMove}
          onViewDetails={onViewDetails}
          userType={userType}
        />
      ))}
    </div>
  );
};