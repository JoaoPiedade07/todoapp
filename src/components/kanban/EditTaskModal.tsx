'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { TaskStatus, UserType } from '@/constants/enums';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  userType: UserType;
  availableUsers: any[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  userType,
  availableUsers
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    story_points: 0,
    assigned_to: '',
    order: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status,
        story_points: task.story_points || 0,
        assigned_to: task.assigned_to || '',
        order: task.order || 0
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    setErrors({});

    try {
      await onSave(task.id, formData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (!confirm('Tem certeza que deseja eliminar esta tarefa? Esta ação não pode ser revertida.')) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Editar Tarefa</h2>
          <Button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
            disabled={loading}
          >
            ✕
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <Input
                placeholder="Título da tarefa"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                placeholder="Descrição da tarefa"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value={TaskStatus.TODO}>A Fazer</option>
                  <option value={TaskStatus.DOING}>Em Progresso</option>
                  <option value={TaskStatus.DONE}>Concluído</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Story Points
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.story_points}
                  onChange={(e) => setFormData({ ...formData, story_points: parseInt(e.target.value) || 0 })}
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min="0"
                  disabled={loading}
                />
              </div>

              {userType === UserType.MANAGER && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável
                  </label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">Não atribuído</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t">
              <div>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  🗑️ Eliminar Tarefa
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'A guardar...' : 'Guardar Alterações'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};