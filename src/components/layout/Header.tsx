'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getUserTypeDisplay = (type: string) => {
    return type === 'manager' ? 'Gestor' : 'Programador';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo e Título - Com padding para mobile */}
          <div className="flex items-center ml-12 lg:ml-0">
            <h1 className="text-xl font-bold text-gray-900">TodoApp</h1>
            <span className="ml-4 text-sm text-gray-500 hidden sm:inline">
              | Sistema de Gestão de Tarefas
            </span>
          </div>

          {/* User Info e Menu */}
          <div className="flex items-center space-x-4">
            {/* User info apenas no desktop */}
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">
                {getUserTypeDisplay(user.type)} • {user.department}
              </p>
            </div>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                {/* Avatar - sempre visível */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Seta apenas no desktop */}
                <svg className="h-4 w-4 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showMenu && (
                <>
                  {/* Overlay para mobile */}
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-10 z-40 lg:hidden"
                    onClick={() => setShowMenu(false)}
                  />
                  
                  {/* Menu Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {/* User info no mobile */}
                    <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {getUserTypeDisplay(user.type)} • {user.department}
                      </p>
                    </div>

                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 hidden lg:block">
                      Logado como <strong>{user.name}</strong>
                    </div>
                    
                    <button
                      onClick={() => {
                        router.push('/kanban');
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📋 Kanban Board
                    </button>

                    {user.type === 'manager' && (
                      <>
                        <button
                          onClick={() => {
                            router.push('/users');
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          👥 Gestão de Utilizadores
                        </button>
                        <button
                          onClick={() => {
                            router.push('/task-types');
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🏷️ Tipos de Tarefa
                        </button>
                      </>
                    )}

                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🚪 Terminar Sessão
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};