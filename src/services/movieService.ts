import { API_CONFIG } from '@/config/api';

export interface Movie {
  id: number;
  nome: string;
  poster: string;
  anoLancamento: number;
  diretor: string;
  duracao: number;
  sinopse: string;
  generos: {
    genero: {
      id: number;
      descricao: string;
    };
  }[];
  avaliacoes?: {
    id: number;
    nota: number;
    comentario: string;
    usuario: {
      id: number;
      nome: string;
    };
  }[];
}

export interface Genre {
  id: number;
  descricao: string;
}

export interface Review {
  nota: number;
  comentario: string;
  usuarioId: number;
}

class MovieService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async getMovies(): Promise<Movie[]> {
    const response = await fetch(`${this.baseURL}/filmes`);
    if (!response.ok) {
      throw new Error('Erro ao buscar filmes');
    }
    return response.json();
  }

  async getMovieById(id: string): Promise<Movie> {
    const response = await fetch(`${this.baseURL}/filmes/${id}`);
    if (!response.ok) {
      throw new Error('Filme não encontrado');
    }
    return response.json();
  }

  async getGenres(): Promise<Genre[]> {
    const response = await fetch(`${this.baseURL}/generos`);
    if (!response.ok) {
      throw new Error('Erro ao buscar gêneros');
    }
    return response.json();
  }

  async addReview(movieId: string, review: Review, token: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/filmes/${movieId}/avaliacoes`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.headers,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(review)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao enviar avaliação');
    }
  }

  async updateReview(movieId: string, reviewId: number, review: Review, token: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/filmes/${movieId}/avaliacoes/${reviewId}`, {
      method: 'PUT',
      headers: {
        ...API_CONFIG.headers,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(review)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao atualizar avaliação');
    }
  }
}

export const movieService = new MovieService(); 