import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as stripeController from './controllers/stripeController.js';
import juegosRoutes from './routes/juegos.js';
import generosRoutes from './routes/genero.js';
import stripeRoutes from './routes/stripe.js';
import usuarioRoutes from './routes/usuario.js';
import bibliotecaRouter from './routes/biblioteca.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import adminRoutes from './routes/admin.js';
import { verificarToken } from './routes/middleware.js';
import fs, { mkdirSync } from 'fs';
import contactoRoutes from './routes/contacto.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 5000;
const host = '0.0.0.0'; 

app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
        next();
    },
    stripeController.webhookHandler
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 50000
}));

const corsOptions = {
    origin: [
        'http://107.22.32.241:5173',
        'http://107.22.32.241',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept',
        'Origin',
        'X-Requested-With',
        'Content-Length'
    ]
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  next();
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/juegos', juegosRoutes);
app.use('/api/generos', generosRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/biblioteca', verificarToken, bibliotecaRouter);
app.use('/api/pagos', verificarToken, stripeRoutes);

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/public/avatars', express.static(path.join(__dirname, '../public/avatars')));
app.use('/public/juegos', express.static(path.join(__dirname, '../public/juegos')));

const avatarsDir = path.join(__dirname, '../public/avatars');
const juegosDir = path.join(__dirname, '../public/juegos');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

if (!fs.existsSync(juegosDir)) {
  fs.mkdirSync(juegosDir, { recursive: true });
}

app.use((err, req, res, next) => {
    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.listen(port, host, () => {
});

export default app;

