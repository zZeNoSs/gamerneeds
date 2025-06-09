import pool from '../config/db.js';

export const crearDesarrollador = async (desarrollador) => {
  try {
    const { nombre, sitio_web, fecha_fundacion } = desarrollador;
    const [result] = await pool.query(
      'INSERT INTO desarrollador (nombre, sitio_web, fecha_fundacion) VALUES (?, ?, ?)',
      [nombre, sitio_web, fecha_fundacion]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

export const mostrarDesarrolladores = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM desarrollador ORDER BY nombre');
    return rows;
  } catch (error) {
    throw error;
  }
};

export const eliminarDesarrollador = async (iddesarrollador) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM juego_has_desarrollador WHERE desarrollador_iddesarrollador = ?',[iddesarrollador]);
    await connection.query('DELETE FROM desarrollador WHERE iddesarrollador = ?',[iddesarrollador]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};