'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { TaskStatus } from '@/constants/enums';

interface ProgrammerCompletedTasksProps {
  programmerId: string;
}

export const ProgrammerCompletedTasks: React.FC<ProgrammerCompletedTasksProps> = ({ 
  programmerId 
}) => {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const API_BASE_URL = typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:3001`
    : 'http://localhost:3001';

  useEffect(() => {
    fetchCompletedTasks();
    fetchStats();
  }, [programmerId]);

  const fetchCompletedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/programmer/completed-tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedTasks(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas concluídas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/programmer/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  if (loading) {
    return <div>Carregando tarefas concluídas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-800 font-semibold">Total Concluídas</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed_tasks}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-800 font-semibold">Em Progresso</div>
            <div className="text-2xl font-bold text-blue-600">{stats.doing_tasks}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-800 font-semibold">A Fazer</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.todo_tasks}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-800 font-semibold">Média SP</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.avg_story_points ? Math.round(stats.avg_story_points * 100) / 100 : 0}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Tarefas Concluídas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Tarefas Concluídas</h3>
          <p className="text-gray-600 text-sm">
            {completedTasks.length} tarefas concluídas
          </p>
        </div>
        
        <div className="p-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma tarefa concluída ainda
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      {task.description && (
                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>SP: {task.story_points || 'N/A'}</div>
                      <div>Ordem: #{task.order}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>
                      Concluída em: {task.completed_at ? new Date(task.completed_at).toLocaleDateString('pt-PT') : 'N/A'}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Concluída
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};