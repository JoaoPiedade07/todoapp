'use client';

import { useRouter, usePathname } from 'next/navigation';
import { UserType } from '@/constants/enums';
import { useState } from 'react';

interface SidebarProps {
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      name: '📋 Kanban Board',
      path: '/kanban',
      accessible: true
    },
    {
      name: '👥 Gestão de Utilizadores',
      path: '/users',
      accessible: user.type === UserType.MANAGER || user.type === 'gestor'
    },
    {
      name: '🏷️ Tarefas Concluídas',
      path: '/completed-tasks', 
      accessible: user.type === UserType.MANAGER || user.type === 'gestor'
    },
    {
      name: '📊 Relatórios',
      path: '/reports',
      accessible: user.type === UserType.MANAGER || user.type === 'gestor'
    }
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getUserTypeLabel = () => {
    if (user.type === UserType.MANAGER || user.type === 'gestor') return 'Gestor';
    if (user.type === UserType.PROGRAMMER || user.type === 'programador') return 'Programador';
    return user.type;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false); // ✅ CORRIGIDO: era setIsMobileMenu
  };

  return (
    <>
      {/* Mobile Menu Button */}
{/* Mobile Menu Button - SEM ANIMAÇÃO PARA X */}
{/* Mobile Menu Button - DESAPARECE QUANDO MENU ESTÁ ABERTO */}
{!isMobileMenuOpen && (
  <button
    onClick={toggleMobileMenu}
    className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200"
    aria-label="Toggle menu"
  >
    <div className="w-6 h-6 flex flex-col justify-center space-y-1">
      <span className="block h-0.5 w-6 bg-gray-600"></span>
      <span className="block h-0.5 w-6 bg-gray-600"></span>
      <span className="block h-0.5 w-6 bg-gray-600"></span>
    </div>
  </button>
)}

      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)} // ✅ CORRIGIDO: era setIsMobileMenu
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen 
        fixed lg:relative left-0 top-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header do Sidebar */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">Menu</h2>
            
            {/* Botão de fechar no mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)} // ✅ CORRIGIDO: era setIsMobileMenu
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              aria-label="Fechar menu"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info no Mobile - Agora no header */}
          <div className="mt-4 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {getUserTypeLabel()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <nav className="mt-2 lg:mt-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (!item.accessible) return null;
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full text-left px-4 lg:px-6 py-3 lg:py-3 
                      text-sm font-medium transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                      flex items-center space-x-3
                      ${isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <span className="text-base">{item.name.split(' ')[0]}</span>
                    <span>{item.name.split(' ').slice(1).join(' ')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info no Desktop */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 border-t border-gray-200 hidden lg:block">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {getUserTypeLabel()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};