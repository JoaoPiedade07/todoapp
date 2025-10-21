'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Kanban Board',
      href: '/kanban',
      icon: '📋',
      visible: true
    },
    {
      name: 'Gestão de Utilizadores',
      href: '/users',
      icon: '👥',
      visible: user.type === 'manager'
    },
    {
      name: 'Tipos de Tarefa',
      href: '/task-types',
      icon: '🏷️',
      visible: user.type === 'manager'
    },
    {
      name: 'Minhas Tarefas',
      href: '/my-tasks',
      icon: '✅',
      visible: user.type === 'programmer'
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <nav className="h-full flex flex-col">
        <div className="flex-1 space-y-1 px-3 py-4">
          {menuItems
            .filter(item => item.visible)
            .map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive(item.href)
                    ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
        </div>
        
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs font-medium text-gray-500">{user.username}</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};