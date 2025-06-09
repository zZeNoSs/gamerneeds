import jwt from 'jsonwebtoken';
import { verificarRolAdmin } from '../models/usuarioModel.js';
import stripe from '../config/stripe.js';

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { 
        id: decoded.userId,
        email: decoded.email
    };
    next();
  } catch (error) {
    return res.status(401).json({ 
        message: 'Token inválido o expirado' 
    });
  }
};
export const verificarAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    const esAdmin = await verificarRolAdmin(req.user.id);   
    if (!esAdmin) {
      return res.status(403).json({ 
        message: 'Acceso denegado - Se requieren permisos de administrador' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar permisos de administrador' });
  }
};

export const verificarSesionCheckout = async (req, res, next) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
        return res.status(403).json({ 
            message: 'Acceso denegado - Se requiere una sesión de checkout válida' 
        });
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.status !== 'complete') {
            return res.status(403).redirect('/carrito');
        }
        req.session = session;
        next();
    } catch (error) {
        return res.status(403).redirect('/carrito');
    }
};