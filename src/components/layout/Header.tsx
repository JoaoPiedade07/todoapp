'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleBadge = (type: string) => {
    const roles = {
      manager: { label: 'Gestor', color: 'bg-purple-100 text-purple-800' },
      programmer: { label: 'Programador', color: 'bg-blue-100 text-blue-800' }
    };
    
    const role = roles[type as keyof typeof roles] || roles.programmer;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
        {role.label}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">TodoApp</h1>
            <div className="hidden sm:block">
              {getRoleBadge(user.type)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.department}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};