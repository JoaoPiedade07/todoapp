// Enum Departamento
export enum Department {
    IT = "IT",
};

export const DepartmentLabels = {
    [Department.IT]: 'Tecnologia da Informação',
};

export const DepartmentOptions = Object.values(Department).map(dept => ({
    value: dept,
    label: DepartmentLabels[dept]
}));