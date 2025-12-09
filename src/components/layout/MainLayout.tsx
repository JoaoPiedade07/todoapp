'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

interface MainLayoutProps {
  children: ReactNode;
  user: any;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, user }) => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        
        <div className="flex flex-col md:flex-row">
          <Sidebar user={user} />
          
          <main className="flex-1 md:ml-0">
            <div className="py-4 md:py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};