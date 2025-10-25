// Enum Departamento
export enum Department {
    IT = "IT",
    RH = "RH",
    FINANCEIRO = "Financeiro",
    MARKETING = "Marketing",
    VENDAS = "Vendas",
    OPERACOES = "Operações",
    DESENVOLVIMENTO = "Desenvolvimento",
    DESIGN = "Design",
    QUALIDADE = "Qualidade",
    SUPORTE = "Suporte"
}

export const DepartmentLabels = {
    [Department.IT]: 'Tecnologia da Informação',
    [Department.RH]: 'Recursos Humanos',
    [Department.FINANCEIRO]: 'Financeiro',
    [Department.MARKETING]: 'Marketing',
    [Department.VENDAS]: 'Vendas',
    [Department.OPERACOES]: 'Operações',
    [Department.DESENVOLVIMENTO]: 'Desenvolvimento',
    [Department.DESIGN]: 'Design',
    [Department.QUALIDADE]: 'Qualidade',
    [Department.SUPORTE]: 'Suporte'
};

export const DepartmentOptions = Object.values(Department).map(dept => ({
    value: dept,
    label: DepartmentLabels[dept]
}));