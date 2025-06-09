import express from 'express';
import * as stripeController from '../controllers/stripeController.js';
import { verificarToken } from './middleware.js';
import stripe from '../config/stripe.js';
import { generarPDFComprobante } from '../services/pdfService.js';

const router = express.Router();

router.use(express.json());

router.post('/crear-sesion-pago', verificarToken, stripeController.crearSesionPago);
router.post('/create-line-item', stripeController.createLineItem);
router.get('/verificar/:sessionId', stripeController.verificarPago);
router.get('/descargar-comprobante/:sessionId', verificarToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items']
        });

        if (!session) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        const datosCompra = {
            sessionId: session.id,
            items: session.line_items.data.map(item => ({
                nombre: item.description || 
                        item.price?.product?.name || 
                        'Producto',
                precio: (item.amount_total / 100).toFixed(2)
            })),
            total: (session.amount_total / 100).toFixed(2),
            usuario: {
                nombre: session.customer_details?.name || 'Cliente',
                email: session.customer_details?.email || 'No disponible'
            },
            fecha: new Date()
        };
        const pdfBuffer = await generarPDFComprobante(datosCompra);
        if (!pdfBuffer) {
            throw new Error('No se pudo generar el PDF');
        }
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=factura-${sessionId}.pdf`,
            'Content-Length': pdfBuffer.length,
        });  
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al generar el comprobante',
            details: error.message 
        });
    }
});

export default router;