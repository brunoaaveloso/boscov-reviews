import { API_CONFIG } from '@/config/api';

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async login(data: LoginData): Promise<{ token: string }> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao fazer login');
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao criar conta');
    }
  }
}

export const authService = new AuthService(); 