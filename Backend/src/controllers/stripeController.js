import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as compraModel from '../models/compraModel.js';
import * as bibliotecaModel from '../models/bibliotecaModel.js';
import * as juegoModel from '../models/juegoModel.js';
import { generarPDFComprobante } from '../services/pdfService.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../..', '.env') });

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing Stripe secret key');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const crearSesionPago = async (req, res) => {
    try {
        const {items, usuarioId} = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({error: 'Items inválidos'});
        }
        if (!usuarioId) {
            return res.status(400).json({error: 'Usuario ID requerido'});
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.nombre,
                        images: [item.url_portada.startsWith('http') 
                            ? item.url_portada 
                            : `${process.env.BACKEND_URL}/public/juegos/${item.url_portada}`],
                        metadata: {
                            idjuego: item.idjuego.toString()
                        }
                    },
                    unit_amount: Math.round(parseFloat(item.precio) * 100),
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/carrito`,
            metadata: {
                usuarioId: usuarioId.toString(),
                juegosIds: JSON.stringify(items.map(item => item.idjuego))
            },
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['ES']
            },
            locale: 'es'
        });
        res.json({sessionId: session.id});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const verificarPago = async (req, res) => {
    try {
        const {sessionId} = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json({status: session.payment_status});
    } catch (error) {
        res.status(500).json({error: 'Error al verificar el pago'});
    }
};

export const webhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            return res.status(500).json({error: 'Configuración del webhook incompleta'});
        }
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            if (!session.metadata?.usuarioId || !session.metadata?.juegosIds) {
                return res.status(200).json({ received: true, error: 'Metadata incompleta' });
            }
            try {
                const idcompra = await compraModel.crearCompra(
                    session.metadata.usuarioId, 
                    session.amount_total / 100
                );
                let juegosIds;
                try {
                    juegosIds = JSON.parse(session.metadata.juegosIds);
                } catch (parseError) {
                    throw new Error('Error al parsear juegosIds: ' + parseError.message);
                }
                if (!Array.isArray(juegosIds)) {
                    throw new Error('juegosIds no es un array válido');
                }
                for (const juegoId of juegosIds) {
                    const juegoExiste = await juegoModel.verificarJuegoExiste(juegoId);     
                    if (!juegoExiste) {
                        continue;
                    }
                    const yaEnBiblioteca = await bibliotecaModel.verificarJuegoEnBiblioteca(
                        session.metadata.usuarioId, 
                        juegoId);
                    if (yaEnBiblioteca) {
                        continue;
                    }
                    await bibliotecaModel.agregarJuegoABiblioteca(
                        session.metadata.usuarioId, 
                        juegoId);
                }
                return res.status(200).json({received: true});
            } catch (error) {
                return res.status(200).json({
                    received: true,
                    error: error.message
                });
            }
        }
        return res.status(200).json({received: true});
    } catch (error) {
        return res.status(400).json({error: `Webhook Error: ${error.message}`});
    }
};

export const createLineItem = async (req, res) => {
    try {
        const {title, price, image, idjuego} = req.body;
        if (!title || !price || !image) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos' 
            });
        }
        const priceInCents = Math.round(parseFloat(price) * 100);
        const product = await stripe.products.create({
            name: title,
            images: [image],
            metadata: {
                idjuego: idjuego.toString()
            }
        });
        const priceObj = await stripe.prices.create({
            product: product.id,
            unit_amount: priceInCents,
            currency: 'eur'
        });
        res.json({
            id: priceObj.id,
            product_id: product.id
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al crear el producto en Stripe',
            details: error.message 
        });
    }
};

export const addToCart = async (req, res) => {
    try {
        const {item, sessionId} = req.body;
        let session;
        if (sessionId) {
            session = await stripe.checkout.sessions.retrieve(sessionId);
            session = await stripe.checkout.sessions.update(sessionId, {
                line_items: [...session.line_items, item]
            });
        } else {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [item],
                success_url: `${process.env.FRONTEND_URL}/success`,
                cancel_url: `${process.env.FRONTEND_URL}/carrito`,
            });
        }
        res.json({ session });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const {sessionId, idjuego} = req.body;
        if (!sessionId) {
            return res.status(400).json({error: 'No session ID provided'});
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const updatedItems = session.line_items.filter(
            item => item.price_data.product_data.metadata.idjuego !== idjuego
        );
        await stripe.checkout.sessions.update(sessionId, {
            line_items: updatedItems
        });
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const removeLineItem = async (req, res) => {
    try {
        const {price_id} = req.body;
        const price = await stripe.prices.retrieve(price_id);
        await stripe.prices.update(price_id, { active: false });
        await stripe.products.update(price.product, { active: false });
        res.json({success: true});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const createCheckoutSession = async (req, res) => {
    try {
        const {items} = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price: item.stripe_line_item_id,
                quantity: 1
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success/{CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/carrito`
        });
        res.json({id: session.id});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};