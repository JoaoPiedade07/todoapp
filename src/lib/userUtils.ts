import { UserType, Department, NivelExperiencia } from '@/constants/enums';

// Função para normalizar o tipo de usuário (compatibilidade entre frontend e backend)
export const normalizeUserType = (userType: string): UserType => {
  if (userType === 'gestor' || userType === UserType.MANAGER) return UserType.MANAGER;
  if (userType === 'programador' || userType === UserType.PROGRAMMER) return UserType.PROGRAMMER;
  return UserType.PROGRAMMER; // default
};

// Função para verificar se o usuário é gestor
export const isManager = (userType: string): boolean => {
  return userType === 'gestor' || userType === UserType.MANAGER;
};

// Função para obter label do tipo de usuário
export const getUserTypeLabel = (userType: string): string => {
  if (userType === 'gestor' || userType === UserType.MANAGER) return 'Gestor';
  if (userType === 'programador' || userType === UserType.PROGRAMMER) return 'Programador';
  return userType;
};

// Função para normalizar dados do usuário da API
export const normalizeUserFromAPI = (user: any) => {
  return {
    ...user,
    type: normalizeUserType(user.type)
  };
};