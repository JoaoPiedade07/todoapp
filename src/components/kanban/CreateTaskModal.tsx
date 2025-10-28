'use client';

import { useState } from 'react';
import { TaskStatus, UserType } from '@/constants/enums';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: any) => void;
  userType: UserType;
  availableUsers: any[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  userType,
  availableUsers
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    order: 1,
    story_points: '',
    assigned_to: '',
    task_type: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.assigned_to && userType === UserType.MANAGER) {
      newErrors.assigned_to = 'Deve atribuir a um programador';
    }
    if (!formData.story_points) newErrors.story_points = 'Story Points são obrigatórios';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar dados para enviar
    const taskData = {
      ...formData,
      order: parseInt(formData.order.toString()),
      story_points: parseInt(formData.story_points),
      assigned_to: formData.assigned_to || null
    };

    onCreateTask(taskData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      order: 1,
      story_points: '',
      assigned_to: '',
      task_type: ''
    });
    setErrors({});
    onClose();
  };

  const taskTypes = [
    'Desenvolvimento',
    'Design',
    'Testes',
    'Documentação',
    'Reunião',
    'Bug Fix',
    'Feature'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Criar Nova Tarefa</h2>
          <Button
            onClick={handleClose}
            className="bg-gray-500 hover:bg-gray-600"
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
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
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
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
                  onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.story_points ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Selecione os SP</option>
                  <option value="1">1 SP</option>
                  <option value="2">2 SP</option>
                  <option value="3">3 SP</option>
                  <option value="5">5 SP</option>
                  <option value="8">8 SP</option>
                  <option value="13">13 SP</option>
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
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o tipo</option>
                  {taskTypes.map((type) => (
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
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.assigned_to ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Selecione um programador</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
                {errors.assigned_to && (
                  <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                onClick={handleClose}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                Criar Tarefa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};