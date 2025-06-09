import * as juegoModel from '../models/juegoModel.js';
import * as usuarioModel from '../models/usuarioModel.js';
import * as desarrolladorModel from '../models/desarrolladorModel.js';
import * as editorModel from '../models/editorModel.js';
import * as generoModel from '../models/generoModel.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { enviarEmailContacto } from '../services/mailjetService.js';

export const registroAdminUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await usuarioModel.registerUsuarioAdmin(req.body);
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Error al registrar el usuario' 
    });
  }
};

export const crearJuego = async (req, res) => {
  try {
    const {
      titulo,
      descripcion, 
      precio,
      fecha_lanzamiento,
      clasificacion_edad,
      url_trailer,
      desarrolladores,
      editores,
      generos
    } = req.body;
    const juegoData = {
      titulo: titulo?.trim(),
      descripcion: descripcion?.trim(),
      precio: parseFloat(precio) || 0,
      fecha_lanzamiento: fecha_lanzamiento || null,
      clasificacion_edad: parseInt(clasificacion_edad) || 0,
      url_trailer: url_trailer?.trim() || '',
      url_portada: req.file ? req.file.filename : 'default-game.jpg'
    };
    const desarrolladoresArray = desarrolladores ? JSON.parse(desarrolladores) : [];
    const editoresArray = editores ? JSON.parse(editores) : [];
    const generosArray = generos ? JSON.parse(generos) : [];
    if (!juegoData.titulo) {
      return res.status(400).json({
        message: 'El título es requerido'
      });
    }
    if (desarrolladoresArray.length === 0) {
      return res.status(400).json({
        message: 'Debe seleccionar al menos un desarrollador'
      });
    }
    const juegoId = await juegoModel.crearJuego(
      juegoData,
      desarrolladoresArray,
      editoresArray,
      generosArray
    );
    const urlCompletaImagen = req.file 
      ? `${process.env.BACKEND_URL}/public/juegos/${juegoData.url_portada}`
      : `${process.env.BACKEND_URL}/public/juegos/default-game.jpg`;
    res.status(201).json({
      message: 'Juego creado exitosamente',
      idjuego: juegoId,
      url_portada: urlCompletaImagen,
      imagen_guardada: juegoData.url_portada,
      debug_info: {
        archivo_recibido: !!req.file,
        nombre_archivo: req.file?.filename || 'ninguno',
        usa_default: !req.file,
        content_type: req.headers['content-type'],
        body_keys: Object.keys(req.body)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el juego',
      error: error.message,
      debug_info: {
        archivo_recibido: !!req.file,
        content_type: req.headers['content-type']
      }
    });
  }
};

export const crearDesarrollador = async (req, res) => {
  try {
    const desarrollador = await desarrolladorModel.crearDesarrollador(req.body);
    res.status(201).json({
      message: 'Desarrollador creado correctamente',
      desarrollador
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const crearEditor = async (req, res) => {
  try {
    const editor = await editorModel.crearEditor(req.body);
    res.status(201).json({
      message: 'Editor creado correctamente',
      editor
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const crearGenero = async (req, res) => {
  try {
    const {nombre, descripcion} = req.body;
    
    if (!nombre || !descripcion) {
      return res.status(400).json({message: 'El nombre y la descripción son requeridos'});
    }

    const generoId = await generoModel.crearGenero({nombre, descripcion});
    res.status(201).json({ 
      message: 'Género creado correctamente',
      id: generoId
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear el género',
      error: error.message 
    });
  }
};

export const mostrarDesarrolladores = async (req, res) => {
  try {
    const desarrolladores = await desarrolladorModel.mostrarDesarrolladores();
    res.json(desarrolladores);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const mostrarEditores = async (req, res) => {
  try {
    const editores = await editorModel.mostrarEditores();
    res.json(editores);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const mostrarGeneros = async (req, res) => {
  try {
    const generos = await generoModel.mostrarGeneros();
    res.json(generos);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const mostrarJuegosAdmin = async (req, res) => {
  try {
    const juegos = await juegoModel.mostrarJuegos();
    const juegosConUrls = juegos.map(juego => ({
      ...juego,
      url_portada: juego.url_portada 
        ? `${process.env.BACKEND_URL}/public/juegos/${juego.url_portada}`
        : `${process.env.BACKEND_URL}/public/juegos/default-game.jpg`
    }));
    res.json(juegosConUrls);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const eliminarJuego = async (req, res) => {
  try {
    const {idjuego} = req.params;
    if (!idjuego) {
      return res.status(400).json({message: 'ID de juego no proporcionado'});
    }
    const url_portada = await juegoModel.eliminarJuego(idjuego); 
    if (url_portada && url_portada !== 'default-game.jpg') {
      const filePath = path.join(process.cwd(), 'public', 'juegos', url_portada);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({message: 'Juego eliminado correctamente'});
  } catch (error) {
    res.status(500).json({message: 'Error al eliminar el juego'});
  }
};

export const editarJuego = async (req, res) => {
  try {
    const {idjuego} = req.params;
    const {
      titulo,
      descripcion,
      precio,
      fecha_lanzamiento,
      clasificacion_edad,
      url_trailer,
      desarrolladores,
      editores,
      generos
    } = req.body;
    const juegoData = {
      titulo: titulo?.trim(),
      descripcion: descripcion?.trim(),
      precio: parseFloat(precio),
      fecha_lanzamiento,
      clasificacion_edad: parseInt(clasificacion_edad),
      url_trailer: url_trailer?.trim() || '',
      desarrolladores: desarrolladores ? JSON.parse(desarrolladores) : [],
      editores: editores ? JSON.parse(editores) : [],
      generos: generos ? JSON.parse(generos) : []
    };
    if (req.file) {
      juegoData.url_portada = req.file.filename;
    }
    await juegoModel.editarJuego(idjuego, juegoData);
    res.json({
      message: 'Juego actualizado exitosamente',
      ...(req.file && { 
        nueva_imagen: `${process.env.BACKEND_URL}/public/juegos/${req.file.filename}` 
      })
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el juego',
      error: error.message
    });
  }
};

export const eliminarDesarrollador = async (req, res) => {
  try {
    const {iddesarrollador} = req.params;
    await desarrolladorModel.eliminarDesarrollador(iddesarrollador);
    res.json({message: 'Desarrollador eliminado correctamente'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const eliminarEditor = async (req, res) => {
  try {
    const {ideditor} = req.params;
    await editorModel.eliminarEditor(ideditor);
    res.json({message: 'Editor eliminado correctamente'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const eliminarGenero = async (req, res) => {
  try {
    const {idgenero} = req.params;
    await generoModel.eliminarGenero(idgenero);
    res.json({message: 'Género eliminado correctamente'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const enviarMensajeContacto = async (req, res) => {
  try {
    const {nombre, email, asunto, descripcion} = req.body;
    const camposRequeridos = ['nombre', 'email', 'asunto', 'descripcion'];
    for (const campo of camposRequeridos) {
      if (!req.body[campo]?.trim()) {
        return res.status(400).json({ 
          message: `El campo ${campo} es obligatorio` 
        });
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({message: 'El formato del email es inválido'});
    }
    await enviarEmailContacto(nombre, email, asunto, descripcion);
    res.json({message: 'Mensaje de contacto enviado correctamente'});
  } catch (error) {
    res.status(500).json({message: 'Error al enviar el mensaje de contacto'});
  }
};