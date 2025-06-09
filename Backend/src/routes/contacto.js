import express from 'express';
import { enviarMensajeContacto } from '../controllers/adminController.js';

const router = express.Router();

router.post('/', enviarMensajeContacto);

export default router;