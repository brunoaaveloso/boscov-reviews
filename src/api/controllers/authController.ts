import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN || '1d';

// Schemas de validação com o zod
const usuarioLoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

const usuarioCadastroSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
  nome: z.string().min(2),
  dataNascimento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de nascimento inválida',
  }),
});

export class AuthController {
  // Função para criar token JWT
  private createToken(userId: number, email: string, nome: string, tipoUsuario: string): string {
    const payload = { userId, email, nome, tipoUsuario };
    const options = { 
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  // Função para enviar token como cookie
  private sendTokenCookie(res: Response, token: string): void {
    const cookieOptions = {
      expires: new Date(Date.now() + parseInt(JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('jwt', token, cookieOptions);
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parse = usuarioLoginSchema.safeParse(req.body);
      if (!parse.success) {
        throw new AppError('Dados inválidos', 400);
      }
      const { email, senha } = req.body;
      const usuario = await prisma.usuario.findUnique({ where: { email } });
      if (!usuario) {
        throw new AppError('Credenciais inválidas', 401);
      }
      if (!usuario.status) {
        throw new AppError('Usuário inativo. Contate o administrador.', 403);
      }
      
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        throw new AppError('Credenciais inválidas', 401);
      }

      const token = this.createToken(usuario.id, usuario.email, usuario.nome, usuario.tipoUsuario);
      this.sendTokenCookie(res, token);
      res.json({ token });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parse = usuarioCadastroSchema.safeParse(req.body);
      if (!parse.success) {
        throw new AppError('Dados inválidos', 400);
      }
      const { email, senha, nome, dataNascimento } = req.body;
      const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
      if (usuarioExistente) {
        throw new AppError('E-mail já cadastrado', 409);
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const novoUsuario = await prisma.usuario.create({
        data: {
          email,
          senha: senhaHash,
          nome,
          status: true,
          dataNascimento: new Date(dataNascimento),
          tipoUsuario: 'USUARIO',
        }
      });
      const token = this.createToken(novoUsuario.id, novoUsuario.email, novoUsuario.nome, novoUsuario.tipoUsuario);
      this.sendTokenCookie(res, token);
      res.status(201).json({ usuario: novoUsuario, token });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new AppError('Token não fornecido', 401);
      }
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const usuario = await prisma.usuario.findUnique({ where: { id: decoded.userId } });
      if (!usuario) {
        throw new AppError('Usuário não encontrado', 404);
      }
      res.json({ usuario });
    } catch (error) {
      next(error);
    }
  }
} 