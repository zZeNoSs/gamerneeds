import pool from '../config/db.js';

export const crearEditor = async (editor) => {
  try {
    const { nombre, sitio_web, fecha_fundacion } = editor;
    const [result] = await pool.query(
      'INSERT INTO editor (nombre, sitio_web, fecha_fundacion) VALUES (?, ?, ?)',
      [nombre, sitio_web, fecha_fundacion]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

export const mostrarEditores = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM editor ORDER BY nombre');
    return rows;
  } catch (error) {
    throw error;
  }
};

export const eliminarEditor = async (ideditor) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM editor_has_juego WHERE editor_ideditor = ?',[ideditor]);
    await connection.query('DELETE FROM editor WHERE ideditor = ?', [ideditor]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};