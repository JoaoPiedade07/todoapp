// Enum NivelExperiencia
export enum NivelExperiencia {
    ESTAGIARIO = "estagiario",
    JUNIOR = "junior",
    PLENO = "pleno", 
    SENIOR = "senior"
  }
  
  export const NivelExperienciaLabels = {
    [NivelExperiencia.ESTAGIARIO]: 'Estagiário',
    [NivelExperiencia.JUNIOR]: 'Junior',
    [NivelExperiencia.PLENO]: 'Pleno',
    [NivelExperiencia.SENIOR]: 'Sénior'
  };

  
export const NivelExperienciaOptions = [
    { value: NivelExperiencia.ESTAGIARIO, label: NivelExperienciaLabels[NivelExperiencia.ESTAGIARIO] },
    { value: NivelExperiencia.JUNIOR, label: NivelExperienciaLabels[NivelExperiencia.JUNIOR] },
    { value: NivelExperiencia.PLENO, label: NivelExperienciaLabels[NivelExperiencia.PLENO] },
    { value: NivelExperiencia.SENIOR, label: NivelExperienciaLabels[NivelExperiencia.SENIOR] }
];
  
  // Enum Departamento
  export enum Department {
    IT = "IT",
    ADMINISTRACAO = "Administração",
    MARKETING = "Marketing"
  }
  
  export const DepartmentLabels = {
    [Department.IT]: 'Tecnologia da Informação',
    [Department.ADMINISTRACAO]: 'Administração', 
    [Department.MARKETING]: 'Marketing'
  };
  
  export const DepartmentOptions = [
    { value: Department.IT, label: DepartmentLabels[Department.IT] },
    { value: Department.ADMINISTRACAO, label: DepartmentLabels[Department.ADMINISTRACAO] },
    { value: Department.MARKETING, label: DepartmentLabels[Department.MARKETING] }
  ];
  
  // Enum EstadoAtual (para tarefas)
  export enum TaskStatus {
    TODO = "todo",
    DOING = "inprogress", 
    DONE = "done"
  }
  
  export const TaskStatusLabels = {
    [TaskStatus.TODO]: 'A Fazer',
    [TaskStatus.DOING]: 'Em Progresso',
    [TaskStatus.DONE]: 'Concluído'
  };
  
  export const TaskStatusOptions = [
    { value: TaskStatus.TODO, label: TaskStatusLabels[TaskStatus.TODO] },
    { value: TaskStatus.DOING, label: TaskStatusLabels[TaskStatus.DOING] },
    { value: TaskStatus.DONE, label: TaskStatusLabels[TaskStatus.DONE] }
  ];
  
  // Enum UserType
  export enum UserType {
    MANAGER = "manager",
    PROGRAMMER = "programmer"
  }
  
  export const UserTypeLabels = {
    [UserType.MANAGER]: 'Gestor',
    [UserType.PROGRAMMER]: 'Programador'
  };
  
  export const UserTypeOptions = [
    { value: UserType.MANAGER, label: UserTypeLabels[UserType.MANAGER] },
    { value: UserType.PROGRAMMER, label: UserTypeLabels[UserType.PROGRAMMER] }
  ];