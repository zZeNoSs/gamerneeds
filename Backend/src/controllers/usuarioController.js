import * as usuarioModel from '../models/usuarioModel.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { enviarEmailBienvenida } from '../services/mailjetService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({message: 'Email y contraseña son obligatorios'});
    }
    const usuario = await usuarioModel.loginUsuario(email, password);    
    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        avatar: usuario.avatar,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(401).json({ 
      message: error.message || 'Credenciales inválidas' 
    });
  }
};

export const registro = async (req, res) => {
  try {
    const usuario = req.body; 
    const camposRequeridos = ['nombre', 'apellidos', 'email', 'password', 'fecha_nacimiento', 'direccion'];
    for (const campo of camposRequeridos) {
      if (!usuario[campo]) {
        return res.status(400).json({message: `El campo ${campo} es obligatorio`});
      }
    }
    const resultado = await usuarioModel.registerUsuario(usuario); 
    try {
      await enviarEmailBienvenida(usuario.nombre, usuario.email);
    } catch (emailError) {
    }
    res.status(201).json({
      message: 'Usuario registrado correctamente. Inicia sesion.',
      id: resultado.id
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El email ya esta registrado' });
    }
    res.status(400).json({message: error.message});
  }
};

export const mostrarPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const perfil = await usuarioModel.mostrarPerfilUsuario(userId);
    res.json(perfil);
  } catch (error) {
    res.status(500).json({message: 'Error al obtener el perfil'});
  }
};

export const actualizarAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }
    const userId = req.user.id;
    const oldAvatar = await usuarioModel.mostrarAvatarUsuario(userId);
    if (oldAvatar && !oldAvatar.includes('default-icon')) {
      const fullPath = path.join(process.cwd(), 'public/avatars', oldAvatar);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    await usuarioModel.actualizarAvatar(userId, req.file.filename);
    const avatarUrl = `${process.env.BACKEND_URL}/public/avatars/${req.file.filename}`;   
    res.json({
      message: 'Avatar actualizado correctamente',
      avatarPath: avatarUrl
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el avatar',
      error: error.message
    });
  }
};
