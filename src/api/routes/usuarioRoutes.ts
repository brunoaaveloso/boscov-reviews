import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import { autenticarJWT } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();
const usuarioController = new UsuarioController();

// Rotas de admin
router.get('/', autenticarJWT, isAdmin, usuarioController.listAll.bind(usuarioController));
router.patch('/:id/status', autenticarJWT, isAdmin, usuarioController.updateStatus.bind(usuarioController));
router.patch('/:id/tipo', autenticarJWT, isAdmin, usuarioController.updateTipo.bind(usuarioController));

// Rotas de usuário comum
router.get('/:id', autenticarJWT, usuarioController.getById.bind(usuarioController));
router.put('/:id', autenticarJWT, usuarioController.update.bind(usuarioController));

export default router; 