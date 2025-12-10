import { RegisterForm } from '@/components/forms/RegisterForm';
import type { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Registro - TodoApp',
  description: 'Criar nova conta no TodoApp',
};

export default function RegisterPage() {
  return <RegisterForm />;
}