
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}


 // Valida email

export function validateEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}


 // Valida password

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password é obrigatória' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password deve ter pelo menos 6 caracteres' };
  }
  if (password.length > 100) {
    return { isValid: false, error: 'Password muito longa (máximo 100 caracteres)' };
  }
  return { isValid: true };
}

 // Valida username

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'Username é obrigatório' };
  }
  if (username.length < 3) {
    return { isValid: false, error: 'Username deve ter pelo menos 3 caracteres' };
  }
  if (username.length > 50) {
    return { isValid: false, error: 'Username muito longo (máximo 50 caracteres)' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username só pode conter letras, números e underscore' };
  }
  return { isValid: true };
}


 // Valida story points

export function validateStoryPoints(storyPoints: any): { isValid: boolean; error?: string; value?: number } {
  if (storyPoints === undefined || storyPoints === null || storyPoints === '') {
    return { isValid: false, error: 'Story Points são obrigatórios' };
  }
  
  const parsed = typeof storyPoints === 'number' ? storyPoints : parseInt(String(storyPoints));
  
  if (isNaN(parsed)) {
    return { isValid: false, error: 'Story Points deve ser um número válido' };
  }
  
  if (parsed <= 0) {
    return { isValid: false, error: 'Story Points deve ser maior que zero' };
  }
  
  if (parsed > 100) {
    return { isValid: false, error: 'Story Points muito alto (máximo 100)' };
  }
  
  return { isValid: true, value: parsed };
}


 // Valida título de tarefa

export function validateTaskTitle(title: string): { isValid: boolean; error?: string } {
  if (!title || !title.trim()) {
    return { isValid: false, error: 'Título é obrigatório' };
  }
  if (title.trim().length < 3) {
    return { isValid: false, error: 'Título deve ter pelo menos 3 caracteres' };
  }
  if (title.length > 200) {
    return { isValid: false, error: 'Título muito longo (máximo 200 caracteres)' };
  }
  return { isValid: true };
}


 // Valida descrição
 
export function validateDescription(description: string | null | undefined): { isValid: boolean; error?: string } {
  if (!description) return { isValid: true }; 
  if (description.length > 1000) {
    return { isValid: false, error: 'Descrição muito longa (máximo 1000 caracteres)' };
  }
  return { isValid: true };
}


// Valida order

export function validateOrder(order: any): { isValid: boolean; error?: string; value?: number } {
  if (order === undefined || order === null) {
    return { isValid: true, value: 0 }; // Opcional, default 0
  }
  
  const parsed = typeof order === 'number' ? order : parseInt(String(order));
  
  if (isNaN(parsed)) {
    return { isValid: false, error: 'Ordem deve ser um número válido' };
  }
  
  if (parsed < 0) {
    return { isValid: false, error: 'Ordem não pode ser negativa' };
  }
  
  if (parsed > 10000) {
    return { isValid: false, error: 'Ordem muito alta (máximo 10000)' };
  }
  
  return { isValid: true, value: parsed };
}


// Valida ID (UUID ou string)

export function validateId(id: string | null | undefined): { isValid: boolean; error?: string } {
  if (!id || !id.trim()) {
    return { isValid: false, error: 'ID é obrigatório' };
  }
  if (id.length > 255) {
    return { isValid: false, error: 'ID inválido' };
  }
  return { isValid: true };
}


// Sanitiza string (remove caracteres perigosos)

export function sanitizeString(input: string): string {
  if (!input) return '';
  return input.trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/\s+/g, ' '); // Normaliza espaços
}


// Valida dados de criação de usuário

export function validateUserData(data: {
  username?: string;
  email?: string;
  name?: string;
  password?: string;
  type?: string;
  manager_id?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (data.username) {
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error || '';
    }
  }

  if (data.email) {
    if (!validateEmail(data.email)) {
      errors.email = 'Email inválido';
    }
  }

  if (data.name) {
    if (!data.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (data.name.length > 100) {
      errors.name = 'Nome muito longo (máximo 100 caracteres)';
    }
  }

  if (data.password) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error || '';
    }
  }

  if (data.type === 'programador' && !data.manager_id) {
    errors.manager_id = 'Gestor responsável é obrigatório para programadores';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}


 // Valida dados de criação de tarefa

export function validateTaskData(data: {
  title?: string;
  description?: string;
  story_points?: any;
  order?: any;
  assigned_to?: string;
  status?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (data.title !== undefined) {
    const titleValidation = validateTaskTitle(data.title);
    if (!titleValidation.isValid) {
      errors.title = titleValidation.error || '';
    }
  }

  if (data.description !== undefined) {
    const descValidation = validateDescription(data.description);
    if (!descValidation.isValid) {
      errors.description = descValidation.error || '';
    }
  }

  if (data.story_points !== undefined) {
    const spValidation = validateStoryPoints(data.story_points);
    if (!spValidation.isValid) {
      errors.story_points = spValidation.error || '';
    }
  }

  if (data.order !== undefined) {
    const orderValidation = validateOrder(data.order);
    if (!orderValidation.isValid) {
      errors.order = orderValidation.error || '';
    }
  }

  if (data.status && !['todo', 'inprogress', 'done'].includes(data.status)) {
    errors.status = 'Status inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

