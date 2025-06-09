import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { verificarToken, verificarAdmin } from './middleware.js';
import * as adminController from '../controllers/adminController.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const juegoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/juegos');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `juego-${uniqueSuffix}${extension}`;
    
    cb(null, filename);
  }
});

const uploadJuego = multer({
  storage: juegoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo no válido: ${file.mimetype}`), false);
    }
  }
});


// Crear y editar juegos
router.post('/juego', verificarToken, verificarAdmin, uploadJuego.single('url_portada'), adminController.crearJuego);
router.put('/juego/:idjuego', verificarToken, verificarAdmin, uploadJuego.single('url_portada'), adminController.editarJuego);

// Crear usuarios, desarrolladores, editores y generos
router.post('/register', verificarToken, verificarAdmin, adminController.registroAdminUsuario);
router.post('/desarrollador', verificarToken, verificarAdmin, adminController.crearDesarrollador);
router.post('/editor', verificarToken, verificarAdmin, adminController.crearEditor);
router.post('/genero', verificarToken, verificarAdmin, adminController.crearGenero);

// Mostrar desarrolladores, editores, generos y juegos
router.get('/desarrolladores', verificarToken, verificarAdmin, adminController.mostrarDesarrolladores);
router.get('/editores', verificarToken, verificarAdmin, adminController.mostrarEditores);
router.get('/generos', verificarToken, verificarAdmin, adminController.mostrarGeneros);
router.get('/juegos', verificarToken, verificarAdmin, adminController.mostrarJuegosAdmin);

// Eliminar juegos, desarrolladores, editores y generos
router.delete('/juego/:idjuego', verificarToken, verificarAdmin, adminController.eliminarJuego);
router.delete('/desarrollador/:iddesarrollador', verificarToken, verificarAdmin, adminController.eliminarDesarrollador);
router.delete('/editor/:ideditor', verificarToken, verificarAdmin, adminController.eliminarEditor);
router.delete('/genero/:idgenero', verificarToken, verificarAdmin, adminController.eliminarGenero);


export default router;