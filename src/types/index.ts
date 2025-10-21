export interface User {
    id: string;
    username: string;
    name: string;
    type: 'manager' | 'programmer';
    department: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'doing' | 'done';
    order: number;
    storyPoints?: number;
    assignedTo?: string;
  }