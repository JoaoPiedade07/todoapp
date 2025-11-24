'use client';

import { Task } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  userType: 'manager' | 'programmer';
  onEditTask?: (task: Task) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isOpen,
  onClose,
  userType,
  onEditTask
}) => {
  if (!isOpen || !task) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'todo':
        return { text: 'A Fazer', color: 'text-red-600 bg-red-50 border-red-200' };
      case 'doing':
        return { text: 'Em Progresso', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      case 'done':
        return { text: 'Concluído', color: 'text-green-600 bg-green-50 border-green-200' };
      default:
        return { text: status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  const statusInfo = getStatusInfo(task.status);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalhes da Tarefa</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              <span className="text-sm text-gray-500">Ordem: #{task.order}</span>
            </div>
          </div>
          <Button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Fechar
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Título</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">{task.title}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Story Points</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                {task.story_points || 'Não definido'}
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border min-h-[80px]">
              {task.description || 'Sem descrição'}
            </p>
          </div>

          {/* Atribuição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Programador</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                {task.assigned_user_name || 'Não atribuído'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tipo de Tarefa</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                {task.task_type_name || 'Não definido'}
              </p>
            </div>
          </div>

          {/* Predição de Tempo */}
          {task.story_points && task.estimated_hours && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span>⏱️</span>
                <span>Predição de Tempo</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">Tempo Estimado</p>
                  <p className="text-lg font-bold text-blue-900">
                    {task.estimated_hours}h
                  </p>
                </div>
                {task.min_hours && task.max_hours && (
                  <div>
                    <p className="text-xs text-blue-700 font-medium mb-1">Intervalo</p>
                    <p className="text-sm font-semibold text-blue-800">
                      {task.min_hours}h - {task.max_hours}h
                    </p>
                  </div>
                )}
                {task.confidence_level !== undefined && (
                  <div>
                    <p className="text-xs text-blue-700 font-medium mb-1">Confiança</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-blue-900">
                        {Math.round(task.confidence_level * 100)}%
                      </p>
                      <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${task.confidence_level * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {task.hours_per_point && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    <span className="font-medium">Razão:</span> {task.hours_per_point}h por Story Point
                  </p>
                </div>
              )}
              {task.prediction_message && (
                <div className="mt-2">
                  <p className="text-xs text-blue-700 italic">
                    {task.prediction_message}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data de Criação</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                {formatDate(task.created_at)}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Última Atualização</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                {formatDate(task.updated_at)}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {userType === 'manager' && onEditTask && (
              <Button
                onClick={() => onEditTask(task)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Editar Tarefa
              </Button>
            )}
            <Button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};