// Enum NivelExperiencia
export enum NivelExperiencia {
    JUNIOR = "Junior",
    SENIOR = "Senior"
};

export const NivelExperienciaLabels = {
    [NivelExperiencia.JUNIOR]: 'Junior',
    [NivelExperiencia.SENIOR]: 'Senior'
};

export const NivelExperienciaOptions = Object.values(NivelExperiencia).map(dept => ({
    value: dept,
    label: NivelExperienciaLabels[dept]
})); 

// Enum Departamento
export enum Department {
    IT = "IT",
    AD = "Administração",
    MARKETING = "Marketing",
}

export const DepartmentLabels = {
    [Department.IT]: 'Tecnologia da Informação',
    [Department.AD]: 'Administração',
    [Department.MARKETING]: 'Marketing'
};

export const DepartmentOptions = Object.values(Department).map(dept => ({
    value: dept,
    label: DepartmentLabels[dept]
}));

// Enum EstadoAtual
export enum EstadoAtual {
    TODO = "To Do",
    INPROGRESS = "In progress",
    DONE = "Done"
};

export const EstadoAtualLabels = {
    [EstadoAtual.TODO]: 'Tod do',
    [EstadoAtual.INPROGRESS]: 'In progress',
    [EstadoAtual.DONE]: 'Done'
};

export const EstadoAtualOptions = Object.values(EstadoAtual).map(dept => ({
    value: dept,
    label: EstadoAtualLabels[dept]
}));