import pool from '../config/db.js';

export const mostrarGeneros = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM genero ORDER BY nombre');
    return rows;
  } catch (error) {
    throw error;
  }
};

export const crearGenero = async (genero) => {
  try {
    const { nombre, descripcion } = genero;
    const [result] = await pool.query('INSERT INTO genero (nombre, descripcion) VALUES (?, ?)',[nombre, descripcion]);
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

export const eliminarGenero = async (idgenero) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM juego_has_genero WHERE genero_idgenero = ?',[idgenero]);
    await connection.query('DELETE FROM genero WHERE idgenero = ?', [idgenero]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};