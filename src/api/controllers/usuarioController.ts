import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: number;
  email: string;
  nome: string;
}

type AuthRequest = Request & { user?: JwtPayload };

const usuarioUpdateSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  dataNascimento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de nascimento inválida',
  }),
  senha: z.string().min(6).optional().or(z.literal('')),
});

export class UsuarioController {
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const usuario = await prisma.usuario.findUnique({ where: { id } });
      if (!usuario) throw new AppError('Usuário não encontrado', 404);
      // Nunca envie a senha!
      const { senha, ...usuarioSemSenha } = usuario;
      res.json({ usuario: usuarioSemSenha });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      // Só o próprio usuário pode editar
      if (!req.user || req.user.userId !== id) throw new AppError('Acesso negado', 403);
      const parse = usuarioUpdateSchema.safeParse(req.body);
      if (!parse.success) throw new AppError('Dados inválidos', 400);
      const { nome, email, dataNascimento, senha } = req.body;
      const data: Partial<{ nome: string; email: string; dataNascimento: Date; senha?: string }> = { nome, email, dataNascimento: new Date(dataNascimento) };
      if (senha && senha.length >= 6) {
        data.senha = await bcrypt.hash(senha, 10);
      }
      const usuario = await prisma.usuario.update({
        where: { id },
        data
      });
      const { senha: _, ...usuarioSemSenha } = usuario;
      res.json({ usuario: usuarioSemSenha });
    } catch (error) {
      next(error);
    }
  }

  async listAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          status: true,
          tipoUsuario: true,
          dataNascimento: true,
        }
      });
      res.json({ usuarios });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      if (typeof status !== 'boolean') throw new AppError('Status inválido', 400);
      const usuario = await prisma.usuario.update({
        where: { id },
        data: { status }
      });
      res.json({ usuario });
    } catch (error) {
      next(error);
    }
  }

  async updateTipo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { tipoUsuario } = req.body;
      if (!['ADMIN', 'USUARIO'].includes(tipoUsuario)) throw new AppError('Tipo de usuário inválido', 400);
      const usuario = await prisma.usuario.update({
        where: { id },
        data: { tipoUsuario }
      });
      res.json({ usuario });
    } catch (error) {
      next(error);
    }
  }
} 