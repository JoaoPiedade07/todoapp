'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserType } from '@/constants/enums';
import { isManager } from '@/lib/userUtils';

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'productivity' | 'delays' | 'trends'>('overview');
  const [statistics, setStatistics] = useState<any>(null);
  const [productivity, setProductivity] = useState<any[]>([]);
  const [delayedTasks, setDelayedTasks] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
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
    loadData();
  }, [router, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Carregar dados baseado na aba ativa
      switch (activeTab) {
        case 'overview':
          await Promise.all([
            fetchStatistics(),
            fetchInProgressTasks(),
            fetchCompletedTasks()
          ]);
          break;
        case 'productivity':
          await fetchProductivity();
          break;
        case 'delays':
          await fetchDelayedTasks();
          break;
        case 'trends':
          await fetchTrends();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/analytics/statistics?days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchProductivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/analytics/productivity?days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProductivity(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtividade:', error);
    }
  };

  const fetchDelayedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/delayed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDelayedTasks(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas atrasadas:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/analytics/trends?days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrends(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar tendências:', error);
    }
  };

  const fetchInProgressTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/in-progress/ordered`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInProgressTasks(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas em curso:', error);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/manager/completed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompletedTasks(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas concluídas:', error);
    }
  };

  const exportToCSV = async (type: 'all' | 'completed' | 'inprogress' = 'all') => {
    try {
      const token = localStorage.getItem('token');
      const status = type === 'all' ? '' : type === 'completed' ? 'done' : 'inprogress';
      const url = `${API_BASE_URL}/tasks/export/csv${status ? `?status=${status}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_export_${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erro ao exportar CSV');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar CSV');
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <MainLayout user={user}>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Relatórios e Análises</h1>
            <p className="text-gray-600">Estatísticas e análises do seu time</p>
          </div>
          
          {/* Botões de Export - Melhorados para mobile */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => exportToCSV('all')} 
              className="bg-white border border-gray-300 text-black hover:bg-gray-50 text-sm py-2 px-3 sm:px-4"
              size="sm"
            >
              <span className="sm:hidden">📥 Tudo</span>
              <span className="hidden sm:inline">📥 Exportar Tudo (CSV)</span>
            </Button>
            <Button 
              onClick={() => exportToCSV('completed')} 
              className="bg-white border border-gray-300 text-black hover:bg-gray-50 text-sm py-2 px-3 sm:px-4"
              size="sm"
            >
              <span className="sm:hidden">📥 Concluídas</span>
              <span className="hidden sm:inline">📥 Exportar Concluídas (CSV)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs - Melhoradas para mobile */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: '📋 Visão Geral', mobileLabel: '📋 Geral' },
            { id: 'productivity', label: '⚡ Produtividade', mobileLabel: '⚡ Produt.' },
            { id: 'delays', label: '⏱️ Atrasos', mobileLabel: '⏱️ Atrasos' },
            { id: 'trends', label: '📈 Tendências', mobileLabel: '📈 Tend.' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="sm:hidden">{tab.mobileLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Visão Geral */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Estatísticas Gerais - Melhoradas para mobile */}
              {statistics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="sm:min-w-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{statistics.total_tasks || 0}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Tarefas</div>
                    </CardContent>
                  </Card>
                  <Card className="sm:min-w-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{statistics.completed_tasks || 0}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Concluídas</div>
                    </CardContent>
                  </Card>
                  <Card className="sm:min-w-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">{statistics.in_progress_tasks || 0}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Em Progresso</div>
                    </CardContent>
                  </Card>
                  <Card className="sm:min-w-0">
                    <CardContent className="p-4 sm:p-6">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">{statistics.delayed_tasks || 0}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Atrasadas</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tarefas em Curso Ordenadas */}
              <Card>
                <CardHeader className="px-4 sm:px-6 py-4">
                  <h2 className="text-lg font-semibold">🔄 Tarefas em Curso (Ordenadas)</h2>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {inProgressTasks.length === 0 ? (
                    <p className="text-gray-500">Nenhuma tarefa em progresso</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Programador</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Story Points</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inProgressTasks.map((task: any) => (
                            <tr key={task.id}>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.assigned_user_name || 'Não atribuído'}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium">{task.title}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.story_points || '-'}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.task_type_name || '-'}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.order}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tarefas Concluídas do Gestor */}
              <Card>
                <CardHeader className="px-4 sm:px-6 py-4">
                  <h2 className="text-lg font-semibold">✅ Tarefas Concluídas do Time</h2>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {completedTasks.length === 0 ? (
                    <p className="text-gray-500">Nenhuma tarefa concluída</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Programador</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Concluída Em</th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Story Points</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {completedTasks.slice(0, 10).map((task: any) => (
                            <tr key={task.id}>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.assigned_user_name || 'Não atribuído'}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium">{task.title}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.completed_at ? new Date(task.completed_at).toLocaleDateString('pt-PT') : '-'}</td>
                              <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.story_points || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {completedTasks.length > 10 && (
                        <p className="mt-4 text-sm text-gray-500">Mostrando 10 de {completedTasks.length} tarefas</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Produtividade */}
          {activeTab === 'productivity' && (
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold">⚡ Produtividade por Programador</h2>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {productivity.length === 0 ? (
                  <p className="text-gray-500">Nenhum dado disponível</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Programador</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Nível</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Concluídas</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Em Progresso</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Story Points</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Tempo Médio (h)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {productivity.map((p: any) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium">{p.name}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{p.experience_level || '-'}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{p.completed_tasks || 0}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{p.in_progress_tasks || 0}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{p.completed_story_points || 0}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{p.avg_completion_hours ? p.avg_completion_hours.toFixed(2) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Atrasos */}
          {activeTab === 'delays' && (
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold">⏱️ Tarefas com Atraso</h2>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {delayedTasks.length === 0 ? (
                  <p className="text-gray-500">Nenhuma tarefa atrasada! 🎉</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Programador</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimado (h)</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Decorrido (h)</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Atraso (h)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {delayedTasks.map((task: any) => (
                          <tr key={task.id} className="bg-red-50">
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.assigned_user_name || 'Não atribuído'}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium">{task.title}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.estimated_hours || '-'}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{task.hours_elapsed ? task.hours_elapsed.toFixed(2) : '-'}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm font-bold text-red-600">
                              {task.delay_hours ? `+${task.delay_hours.toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tendências */}
          {activeTab === 'trends' && (
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold">📈 Tendências (Últimos 30 dias)</h2>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {trends.length === 0 ? (
                  <p className="text-gray-500">Nenhum dado disponível</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarefas Concluídas</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Story Points</th>
                          <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Tempo Médio (h)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {trends.map((trend: any, index: number) => (
                          <tr key={index}>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{new Date(trend.date).toLocaleDateString('pt-PT')}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{trend.completed_count || 0}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{trend.total_story_points || 0}</td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-sm">{trend.avg_hours ? trend.avg_hours.toFixed(2) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </MainLayout>
  );
}