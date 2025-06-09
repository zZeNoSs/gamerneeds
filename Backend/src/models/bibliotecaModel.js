import pool from '../config/db.js';

export const mostrarBiblioteca = async (usuarioId) => {
    if (!usuarioId) {
        throw new Error('ID de usuario no proporcionado');
    }
    try {
        const [juegos] = await pool.query(`
            SELECT j.*,
                b.fecha_adquisicion
            FROM biblioteca b
            INNER JOIN juego j ON b.juego_idjuego = j.idjuego
            WHERE b.usuario_idusuario = ?
            ORDER BY b.fecha_adquisicion DESC`, [usuarioId]);
        return juegos.map(juego => ({
            ...juego,
            url_portada: juego.url_portada 
                ? `${process.env.BACKEND_URL}/public/juegos/${juego.url_portada}`
                : '/icons/default-game.png'
        }));
    } catch (error) {
        throw new Error('Error al obtener la biblioteca del usuario');
    }
};

export const verificarJuegoEnBiblioteca = async (usuarioId, juegoId) => {
    try {
        const [rows] = await pool.query('SELECT * FROM biblioteca WHERE usuario_idusuario = ? AND juego_idjuego = ?',[usuarioId, juegoId]);
        return rows.length > 0;
    } catch (error) {
        throw error;
    }
};

export const agregarJuegoABiblioteca = async (usuarioId, juegoId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await connection.query('INSERT INTO biblioteca (usuario_idusuario, juego_idjuego, fecha_adquisicion) VALUES (?, ?, ?)',
            [usuarioId, juegoId, fecha]);
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const aniadirJuegosABiblioteca = async (usuarioId, juegosIds) => {
    if (!usuarioId) {
        throw new Error('ID de usuario requerido');
    }
    if (!Array.isArray(juegosIds)) {
        throw new Error('juegosIds debe ser un array');
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();       
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');        
        for (const juegoId of juegosIds) {
            const [juegoExiste] = await connection.query('SELECT idjuego, titulo FROM juego WHERE idjuego = ?',
                [juegoId]);
            if (juegoExiste.length === 0) {
                continue;
            }           
            const [yaEnBiblioteca] = await connection.query(
                'SELECT * FROM biblioteca WHERE usuario_idusuario = ? AND juego_idjuego = ?',[usuarioId, juegoId]);
            if (yaEnBiblioteca.length > 0) {
                continue;
            }
            await connection.query(`INSERT INTO biblioteca (usuario_idusuario, juego_idjuego, fecha_adquisicion) 
                 VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE fecha_adquisicion = ?`,[usuarioId, juegoId, fecha, fecha]);
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

export const mostrarHistorialJuegos = async (usuarioId) => {
  try {
    const [juegos] = await pool.query(`SELECT j.idjuego, j.titulo, j.precio, j.url_portada, b.fecha_adquisicion
      FROM biblioteca b
      INNER JOIN juego j ON b.juego_idjuego = j.idjuego
      WHERE b.usuario_idusuario = ?
      ORDER BY b.fecha_adquisicion DESC`, [usuarioId]);
    return juegos.map(juego => ({
      ...juego,
      url_portada: juego.url_portada 
        ? `${process.env.BACKEND_URL}/public/juegos/${juego.url_portada}`
        : '/icons/default-game.png'
    }));
  } catch (error) {
    throw new Error('Error al obtener el historial de juegos');
  }
};