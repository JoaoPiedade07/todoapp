'use client';

import { useState, useEffect } from 'react';
import { TaskStatus, UserType } from '@/constants/enums';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: any) => void;
  userType: UserType;
  availableUsers: User[];
  currentUser: User;
}

interface User {
  id: string;
  name: string;
  username: string;
  type: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  order: number;
  story_points: string;
  assigned_to: string;
  task_type: string;
}

const TASK_TYPES = [
  'Desenvolvimento',
  'Design',
  'Testes',
  'Documentação',
  'Reunião',
  'Bug Fix',
  'Feature'
];

const STORY_POINTS_OPTIONS = [
  { value: '1', label: '1 SP' },
  { value: '2', label: '2 SP' },
  { value: '3', label: '3 SP' },
  { value: '5', label: '5 SP' },
  { value: '8', label: '8 SP' },
  { value: '13', label: '13 SP' }
];

const INITIAL_FORM_DATA: TaskFormData = {
  title: '',
  description: '',
  status: TaskStatus.TODO,
  order: 1,
  story_points: '',
  assigned_to: '',
  task_type: ''
};

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  userType
}) => {
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_DATA);
  const [availableProgrammers, setAvailableProgrammers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const loadProgrammers = async () => {
      if (userType === UserType.MANAGER && isOpen) {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/users/programmers`, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const programmers = await response.json();
          setAvailableProgrammers(programmers);
        } catch (error) {
          console.error('Erro ao carregar programadores:', error);
          setAvailableProgrammers([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProgrammers();
  }, [userType, isOpen, API_BASE_URL]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.story_points) newErrors.story_points = 'Story Points são obrigatórios';
    if (userType === UserType.MANAGER && !formData.assigned_to) {
      newErrors.assigned_to = 'Deve atribuir a um programador';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      status: formData.status,
      order: formData.order,
      story_points: parseInt(formData.story_points),
      assigned_to: formData.assigned_to || null,
      task_type: formData.task_type || null, // Enviar nome do tipo, não ID
    };

    try {
      setIsLoading(true);

      console.log('🔄 Frontend - Enviando dados:', taskData);
        
      onCreateTask(taskData);
      handleClose();
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro de conexão ao criar tarefa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setAvailableProgrammers([]);
    onClose();
  };

  const handleInputChange = (field: keyof TaskFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Criar Nova Tarefa</h2>
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
          >
            ✕
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <Input
                placeholder="Digite o título da tarefa"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                placeholder="Descreva a tarefa em detalhes"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={TaskStatus.TODO}>A Fazer</option>
                  <option value={TaskStatus.DOING}>Em Progresso</option>
                  <option value={TaskStatus.DONE}>Concluído</option>
                </select>
              </div>

              {/* Ordem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem de Prioridade *
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Story Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Story Points *
                </label>
                <select
                  value={formData.story_points}
                  onChange={(e) => handleInputChange('story_points', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.story_points ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione os SP</option>
                  {STORY_POINTS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.story_points && (
                  <p className="mt-1 text-sm text-red-600">{errors.story_points}</p>
                )}
              </div>

              {/* Tipo de Tarefa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Tarefa
                </label>
                <select
                  value={formData.task_type}
                  onChange={(e) => handleInputChange('task_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o tipo</option>
                  {TASK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Atribuir a (apenas para gestores) */}
            {userType === UserType.MANAGER && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atribuir a Programador *
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.assigned_to ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">
                    {isLoading ? 'Carregando programadores...' : 'Selecione um programador'}
                  </option>
                  {availableProgrammers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
                {errors.assigned_to && (
                  <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  {isLoading 
                    ? 'Carregando programadores...' 
                    : availableProgrammers.length === 0 
                      ? 'Nenhum programador disponível' 
                      : `${availableProgrammers.length} programador(es) disponível(is)`
                  }
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};