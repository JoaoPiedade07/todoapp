'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Column } from './Column';
import { TaskStatus, UserType } from '@/constants/enums';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onViewDetails: (task: Task) => void;
  onEditTask?: (task: Task) => void; 
  onDeleteTask?: (taskId: string) => void;
  userType: UserType;
  currentUser: any;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskMove,
  onViewDetails,
  onEditTask,
  onDeleteTask,
  userType,
  currentUser 
}) => {
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [doingTasks, setDoingTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTodoTasks(tasks.filter(task => task.status === TaskStatus.TODO));
    setDoingTasks(tasks.filter(task => task.status === TaskStatus.DOING));
    setDoneTasks(tasks.filter(task => task.status === TaskStatus.DONE));
  }, [tasks]);

  const columns = [
    {
      title: 'A Fazer',
      status: TaskStatus.TODO,
      tasks: todoTasks
    },
    {
      title: 'Em Progresso', 
      status: TaskStatus.DOING,
      tasks: doingTasks
    },
    {
      title: 'Concluído',
      status: TaskStatus.DONE,
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
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          userType={userType}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};