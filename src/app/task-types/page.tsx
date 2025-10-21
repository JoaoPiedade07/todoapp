'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function TaskTypesPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const userObj = JSON.parse(userData);
    if (userObj.type !== 'manager') {
      router.push('/kanban');
      return;
    }
    
    setUser(userObj);
  }, [router]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <MainLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Tipos de Tarefa</h1>
        <p className="text-gray-600">Defina os tipos de tarefa disponíveis</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Tipos de Tarefa</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}