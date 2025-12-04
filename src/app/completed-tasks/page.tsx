'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/types';
import { UserType } from '@/constants/enums';
import { isManager, normalizeUserFromAPI } from '@/lib/userUtils';
import { Task } from '@/types';

export default function CompletedTasksPage() {
  const [user, setUser] = useState<any>(null);
  const [programmers, setProgrammers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProgrammers, setExpandedProgrammers] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Record<string, Task[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const router = useRouter();

  const API_BASE_URL = typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:3001`
    : 'http://localhost:3001';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const userObj = JSON.parse(userData);
    
    if (!isManager(userObj.type)) {
      router.push('/kanban');
      return;
    }
    
    setUser(userObj);
    fetchProgrammers();
  }, [router]);

  const fetchProgrammers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/programmers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const programmersData = await response.json();
        const normalizedProgrammers = programmersData.map((user: any) => normalizeUserFromAPI(user));
        setProgrammers(normalizedProgrammers);
      } else {
        console.warn('Erro ao carregar programadores');
      }
    } catch (error) {
      console.error('Erro ao carregar programadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTasks = async (programmerId: string) => {
    // Sempre buscar para garantir dados atualizados
    setLoadingTasks(prev => new Set(prev).add(programmerId));

    try {
      const token = localStorage.getItem('token');
      console.log('Buscando tarefas concluídas para:', programmerId);
      
      const response = await fetch(`${API_BASE_URL}/tasks/completed/${programmerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        console.log('Tarefas:', data.data);
        console.log('Número de tarefas:', data.data?.length || 0);
        
        // Garantir que temos um array válido
        const tasksArray = Array.isArray(data.data) ? data.data : [];
        console.log('Array de tarefas processado:', tasksArray.length, 'tarefas');
        
        if (tasksArray.length > 0) {
          console.log('Primeira tarefa:', tasksArray[0]);
        }
        
        setCompletedTasks(prev => ({
          ...prev,
          [programmerId]: tasksArray
        }));
      } else {
        const errorText = await response.text();
        console.error('Erro ao buscar tarefas concluídas:', response.status, errorText);
        setCompletedTasks(prev => ({
          ...prev,
          [programmerId]: []
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas concluídas:', error);
      setCompletedTasks(prev => ({
        ...prev,
        [programmerId]: []
      }));
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(programmerId);
        return newSet;
      });
    }
  };

  const toggleProgrammer = (programmerId: string) => {
    const newExpanded = new Set(expandedProgrammers);
    
    if (newExpanded.has(programmerId)) {
      newExpanded.delete(programmerId);
    } else {
      newExpanded.add(programmerId);
      fetchCompletedTasks(programmerId);
    }
    
    setExpandedProgrammers(newExpanded);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas Concluídas</h1>
        <p className="text-gray-600">Visualize as tarefas concluídas de cada programador</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Programadores ({programmers.length})
          </h2>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" text="Carregando programadores..." />
            </div>
          ) : programmers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum programador encontrado
            </div>
          ) : (
            <div className="space-y-2">
              {programmers.map((programmer) => {
                const isExpanded = expandedProgrammers.has(programmer.id);
                const tasks = completedTasks[programmer.id] || [];
                const isLoading = loadingTasks.has(programmer.id);

                return (
                  <div key={programmer.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProgrammer(programmer.id)}
                      className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      aria-expanded={isExpanded}
                      aria-controls={`tasks-${programmer.id}`}
                    >
                      <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
                          {programmer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm md:text-base truncate">{programmer.name}</p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{programmer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isExpanded && tasks.length > 0 && (
                          <span className="text-sm text-gray-500">
                            {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            isExpanded ? 'transform rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
                        {isLoading ? (
                          <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" text="Carregando tarefas..." />
                          </div>
                        ) : tasks.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            Nenhuma tarefa concluída
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tasks.map((task) => (
                              <div
                                key={task.id}
                                className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                id={`tasks-${programmer.id}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mb-2">
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                      {task.story_points && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          SP: {task.story_points}
                                        </span>
                                      )}
                                      {task.order !== undefined && (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                          Ordem: {task.order}
                                        </span>
                                      )}
                                      {task.completed_at && (
                                        <span>
                                          Concluída em: {new Date(task.completed_at).toLocaleDateString('pt-PT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ml-2">
                                    Concluída
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}

