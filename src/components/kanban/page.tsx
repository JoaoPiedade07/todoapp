'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KanbanPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TodoApp</h1>
              <p className="text-gray-600">Bem-vindo, {user.name}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600">Gerencie suas tarefas de forma visual</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna To Do */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-red-500 text-white p-4 rounded-t-lg">
              <h2 className="font-semibold flex justify-between items-center">
                A Fazer
                <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs">
                  2
                </span>
              </h2>
            </div>
            <div className="p-4 space-y-4 min-h-[400px]">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900">Implementar login</h3>
                <p className="text-sm text-gray-600 mt-1">Sistema de autenticação</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Ordem: 1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Doing */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-yellow-500 text-white p-4 rounded-t-lg">
              <h2 className="font-semibold flex justify-between items-center">
                Em Progresso
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  1
                </span>
              </h2>
            </div>
            <div className="p-4 space-y-4 min-h-[400px]">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900">Design do BD</h3>
                <p className="text-sm text-gray-600 mt-1">Modelar estrutura</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Ordem: 2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Done */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-green-500 text-white p-4 rounded-t-lg">
              <h2 className="font-semibold flex justify-between items-center">
                Concluído
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                  0
                </span>
              </h2>
            </div>
            <div className="p-4 space-y-4 min-h-[400px]">
              <p className="text-center text-gray-500 text-sm py-8">
                Nenhuma tarefa concluída
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}