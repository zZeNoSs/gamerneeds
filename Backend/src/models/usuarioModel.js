import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DEFAULT_USER_VALUES = {
  rol: 'user',
  avatar: 'default-icon.png'
};

export const loginUsuario = async (email, password) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    const usuario = rows[0];
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    const validarPassword = await bcrypt.compare(password, usuario.password);
    if (!validarPassword) {
      throw new Error('Contraseña incorrecta');
    }
    const avatarUrl = usuario.avatar 
      ? `${process.env.BACKEND_URL}/public/avatars/${usuario.avatar}`
      : `${process.env.BACKEND_URL}/public/avatars/default-icon.png`;
    return {
      id: usuario.idusuario,
      nombre: usuario.nombre,
      email: usuario.email,
      avatar: avatarUrl,
      rol: usuario.rol
    };
  } catch (error) {
    throw error;
  }
};

export const registerUsuario = async (usuario) => {
  try {
    const { 
      nombre, 
      apellidos, 
      email, 
      password, 
      fecha_nacimiento, 
      direccion 
    } = usuario;
    const [usuarioExiste] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuarioExiste.length > 0) {
      throw new Error('El email ya esta registrado');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO usuario (
        nombre, 
        apellidos, 
        email, 
        password, 
        fecha_nacimiento, 
        direccion, 
        rol, 
        avatar,
        fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nombre, 
        apellidos, 
        email, 
        passwordHash, 
        fecha_nacimiento, 
        direccion,
        DEFAULT_USER_VALUES.rol,
        DEFAULT_USER_VALUES.avatar
      ]
    );
    return {
      id: result.insertId,
      rol: DEFAULT_USER_VALUES.rol,
      avatar: DEFAULT_USER_VALUES.avatar
    };
  } catch (error) {
    throw error;
  }
};

export const mostrarPerfilUsuario = async (userId) => {
  try {
    const [usuario] = await pool.query(
      'SELECT idusuario, nombre, email, rol, avatar FROM usuario WHERE idusuario = ?',
      [userId]
    );
    if (!usuario[0]) {
      throw new Error('Usuario no encontrado');
    }
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT c.idjuego) as juegosComprados,
        COUNT(DISTINCT r.idresena) as reseñas
      FROM usuario u
      LEFT JOIN compra c ON u.idusuario = c.idusuario
      LEFT JOIN resena r ON u.idusuario = r.idusuario
      WHERE u.idusuario = ?`, [userId]);
    return {
      ...usuario[0],
      ...stats[0]
    };
  } catch (error) {
    throw error;
  }
};

export const registerUsuarioAdmin = async (usuario) => {
  try {
    const { 
      nombre, 
      apellidos, 
      email, 
      password, 
      fecha_nacimiento, 
      direccion,
      rol 
    } = usuario;
    const [usuarioExiste] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuarioExiste.length > 0) {
      throw new Error('El email ya está registrado');
    }
    const rolNormalizado = rol.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!['admin', 'usuario'].includes(rolNormalizado)) {
      throw new Error('Rol no válido');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO usuario (
        nombre, 
        apellidos, 
        email, 
        password, 
        fecha_nacimiento, 
        direccion, 
        rol, 
        avatar,
        fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nombre, 
        apellidos, 
        email, 
        passwordHash, 
        fecha_nacimiento, 
        direccion,
        rolNormalizado,
        '/public/avatars/default-icon.png'
      ]
    );
    return {
      id: result.insertId,
      rol: rolNormalizado,
      nombre,
      email
    };
  } catch (error) {
    throw error;
  }
};

export const verificarRolAdmin = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT rol FROM usuario WHERE idusuario = ?', 
      [userId]
    );
    return rows[0]?.rol === 'admin';
  } catch (error) {
    throw new Error('Error al verificar rol de administrador');
  }
};

export const actualizarAvatar = async (userId, avatarFileName) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      'UPDATE usuario SET avatar = ? WHERE idusuario = ?',
      [avatarFileName, userId]
    );
    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el avatar');
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const mostrarAvatarUsuario = async (userId) => {
  try {
    const [result] = await pool.query(
      'SELECT avatar FROM usuario WHERE idusuario = ?',
      [userId]
    );
    return result[0]?.avatar;
  } catch (error) {
    throw error;
  }
};
