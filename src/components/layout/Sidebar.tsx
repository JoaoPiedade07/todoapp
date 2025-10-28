'use client';

import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      name: '📋 Kanban Board',
      path: '/kanban',
      accessible: true // Todos podem acessar
    },
    {
      name: '👥 Gestão de Utilizadores',
      path: '/users',
      accessible: user.type === 'manager'
    },
    {
      name: '🏷️ Tipos de Tarefa',
      path: '/task-types', 
      accessible: user.type === 'manager'
    },
    {
      name: '📊 Relatórios',
      path: '/reports',
      accessible: user.type === 'manager'
    }
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
      </div>
      
      <nav className="mt-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (!item.accessible) return null;
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info no Mobile */}
      <div className="p-6 border-t border-gray-200 mt-8 sm:hidden">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-2">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">
            {user.type === 'manager' ? 'Gestor' : 'Programador'}
          </p>
        </div>
      </div>
    </div>
  );
};