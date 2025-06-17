import 'express-async-errors';
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import filmeRoutes from './api/routes/filmeRoutes';
import authRoutes from './api/routes/authRoutes';
import generoRoutes from './api/routes/generoRoutes';
import usuarioRoutes from './api/routes/usuarioRoutes';
import { errorHandler } from './api/middlewares/errorHandler';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Configurações de CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger setup
const swaggerPath = path.join(__dirname, '../swagger.json');
if (fs.existsSync(swaggerPath)) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.warn('swagger.json não encontrado. Documentação Swagger não disponível.');
}

// Rotas
app.use('/filmes', filmeRoutes);
app.use('/auth', authRoutes);
app.use('/generos', generoRoutes);
app.use('/usuarios', usuarioRoutes);

// Rota raiz
app.get('/', (_req: Request, res: Response) => {
  res.send('API Boscov Filmes');
});

// Rota 404
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada!' });
});

// Middleware de erro
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
}); 