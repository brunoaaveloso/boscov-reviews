import { Request, Response, NextFunction } from 'express';
import { FilmeRepository } from '../repositories/filmeRepository';

const filmeRepository = new FilmeRepository();

interface JwtPayload {
  userId: number;
  email: string;
  nome: string;
  tipoUsuario: string;
}

type AuthRequest = Request & { user?: JwtPayload };

export class FilmeController {
  async listarTodos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // ADMIN pode ver todos, usuário comum só ativos
      const incluirInativos = req.user && req.user.tipoUsuario === 'ADMIN';
      const filmes = await filmeRepository.findAll({ incluirInativos });
      res.json(filmes);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const filme = await filmeRepository.findById(Number(id));
      if (!filme) {
        res.status(404).json({ error: 'Filme não encontrado' });
        return;
      }
      res.json(filme);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorGenero(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { generoId } = req.params;
      const filmes = await filmeRepository.findByGenero(Number(generoId));
      res.json(filmes);
    } catch (error) {
      next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filme = await filmeRepository.create(req.body);
      res.status(201).json(filme);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Só ADMIN pode editar
      if (!req.user || req.user.tipoUsuario !== 'ADMIN') {
        res.status(403).json({ error: 'Apenas administradores podem editar filmes.' });
        return;
      }
      const { id } = req.params;
      const filme = await filmeRepository.update(Number(id), req.body);
      res.json(filme);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Só ADMIN pode deletar
      if (!req.user || req.user.tipoUsuario !== 'ADMIN') {
        res.status(403).json({ error: 'Apenas administradores podem deletar filmes.' });
        return;
      }
      const { id } = req.params;
      await filmeRepository.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async restaurar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Só ADMIN pode restaurar
      if (!req.user || req.user.tipoUsuario !== 'ADMIN') {
        res.status(403).json({ error: 'Apenas administradores podem restaurar filmes.' });
        return;
      }
      const { id } = req.params;
      const filme = await filmeRepository.restore(Number(id));
      res.json(filme);
    } catch (error) {
      next(error);
    }
  }
} 