import { Department, NivelExperiencia, TaskStatus, UserType } from '@/constants/enums';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  type: UserType;
  department: Department;
  experience_level?: NivelExperiencia;
  manager_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskType {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  story_points?: number;
  assigned_to?: string;
  task_type_id?: string;
  created_by?: string;
  
  // Datas
  created_at?: string;
  updated_at?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  real_start_date?: string;
  real_end_date?: string;
  assigned_at?: string;
  completed_at?: string;
  
  // Relacionamentos (para display)
  assigned_user_name?: string;
  task_type_name?: string;
  created_by_name?: string;
  
  // Predição de tempo
  estimated_hours?: number;
  confidence_level?: number;
  min_hours?: number;
  max_hours?: number;
  hours_per_point?: number;
  sample_size?: number;
  prediction_message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}