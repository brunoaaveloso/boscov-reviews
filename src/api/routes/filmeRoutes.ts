import { Router, RequestHandler } from "express";
import { FilmeController } from "../controllers/filmeController";
import { AvaliacaoController } from "../controllers/avaliacaoController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();
const filmeController = new FilmeController();
const avaliacaoController = new AvaliacaoController();

// Rotas ADMIN
router.get(
  "/admin",
  autenticarJWT,
  filmeController.listarTodos.bind(filmeController)
);

// Rotas públicas
router.get("/", filmeController.listarAtivos.bind(filmeController));

router.get(
  "/:id",
  filmeController.buscarPorId.bind(filmeController) as RequestHandler
);
router.get(
  "/genero/:generoId",
  filmeController.buscarPorGenero.bind(filmeController) as RequestHandler
);

// Rotas de avaliação
router.post(
  "/:id/avaliacoes",
  autenticarJWT,
  avaliacaoController.criar.bind(avaliacaoController) as RequestHandler
);
router.get(
  "/:id/avaliacoes",
  avaliacaoController.listarPorFilme.bind(avaliacaoController) as RequestHandler
);
router.delete(
  "/avaliacoes/:id",
  autenticarJWT,
  avaliacaoController.deletar.bind(avaliacaoController) as RequestHandler
);

// Rotas protegidas de filmes
router.post(
  "/",
  autenticarJWT,
  filmeController.criar.bind(filmeController) as RequestHandler
);
router.put(
  "/:id",
  autenticarJWT,
  filmeController.atualizar.bind(filmeController) as RequestHandler
);
router.delete(
  "/:id",
  autenticarJWT,
  filmeController.deletar.bind(filmeController) as RequestHandler
);
router.patch(
  "/:id/restaurar",
  autenticarJWT,
  filmeController.restaurar.bind(filmeController) as RequestHandler
);

export default router;
