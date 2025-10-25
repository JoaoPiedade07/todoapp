import { Department } from '@/constants/enums';

export interface User {
    id: string;
    username: string;
    name: string;
    type: 'manager' | 'programmer';
    department: Department;
    created_at?: string;
  }

  export interface TaskType {
    id: string;
    username: string;
    description?: string;
    created_at?: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'doing' | 'done';
    order: number;
    storyPoints?: number;
    assignedTo?: string;
    task_type_id?: string;
    assigned_user_name?: string;
    task_type_name?: string;
    created_at?: string;
    updated_at: string;
  }