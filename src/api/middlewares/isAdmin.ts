import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function isAdmin(req: Request & { user?: { tipoUsuario?: string } }, _res: Response, next: NextFunction) {
  if (req.user && req.user.tipoUsuario === 'ADMIN') {
    return next();
  }
  next(new AppError('Acesso restrito a administradores.', 403));
} 