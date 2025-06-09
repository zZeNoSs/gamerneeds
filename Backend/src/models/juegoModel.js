import pool from '../config/db.js';

export const mostrarJuegos = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        juego.*,
        GROUP_CONCAT(DISTINCT desarrollador.nombre) AS desarrollador,
        GROUP_CONCAT(DISTINCT editor.nombre) AS editor,
        GROUP_CONCAT(DISTINCT genero.nombre) AS generos
      FROM juego
      LEFT JOIN juego_has_desarrollador ON juego.idjuego = juego_has_desarrollador.juego_idjuego
      LEFT JOIN desarrollador ON juego_has_desarrollador.desarrollador_iddesarrollador = desarrollador.iddesarrollador
      LEFT JOIN editor_has_juego ON juego.idjuego = editor_has_juego.juego_idjuego
      LEFT JOIN editor ON editor_has_juego.editor_ideditor = editor.ideditor
      LEFT JOIN juego_has_genero ON juego.idjuego = juego_has_genero.juego_idjuego
      LEFT JOIN genero ON juego_has_genero.genero_idgenero = genero.idgenero
      GROUP BY juego.idjuego`);
    return rows; 
  } catch (error) {
    throw error;
  }
};
export const mostrarJuegoPorId = async (idjuego) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        juego.*,
        GROUP_CONCAT(DISTINCT desarrollador.nombre) AS nombre_desarrollador,
        GROUP_CONCAT(DISTINCT editor.nombre) AS nombre_editor,
        GROUP_CONCAT(DISTINCT genero.nombre) AS nombre_genero,
        GROUP_CONCAT(DISTINCT desarrollador.iddesarrollador) AS desarrolladores_ids,
        GROUP_CONCAT(DISTINCT editor.ideditor) AS editores_ids,
        GROUP_CONCAT(DISTINCT genero.idgenero) AS generos_ids
      FROM juego
      LEFT JOIN juego_has_desarrollador ON juego.idjuego = juego_has_desarrollador.juego_idjuego
      LEFT JOIN desarrollador ON juego_has_desarrollador.desarrollador_iddesarrollador = desarrollador.iddesarrollador
      LEFT JOIN editor_has_juego ON juego.idjuego = editor_has_juego.juego_idjuego
      LEFT JOIN editor ON editor_has_juego.editor_ideditor = editor.ideditor
      LEFT JOIN juego_has_genero ON juego.idjuego = juego_has_genero.juego_idjuego
      LEFT JOIN genero ON juego_has_genero.genero_idgenero = genero.idgenero
      WHERE juego.idjuego = ?
      GROUP BY juego.idjuego`, 
      [idjuego]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

export const verificarJuegoExiste = async (juegoId) => {
    try {
        const [rows] = await pool.query('SELECT idjuego, titulo FROM juego WHERE idjuego = ?',[juegoId]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

export const crearJuego = async (juegoData, desarrolladores, editores, generos) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (!juegoData || !juegoData.titulo) {
      throw new Error('Datos del juego incompletos');
    }
    const insertQuery = `
      INSERT INTO juego (
        titulo, 
        descripcion, 
        precio, 
        fecha_lanzamiento, 
        clasificacion_edad, 
        url_trailer, 
        url_portada
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const insertParams = [
      juegoData.titulo || '',
      juegoData.descripcion || '',
      parseFloat(juegoData.precio) || 0,
      juegoData.fecha_lanzamiento || null,
      parseInt(juegoData.clasificacion_edad) || 0,
      juegoData.url_trailer || '',
      juegoData.url_portada || 'default-game.jpg'
    ];
    const [result] = await connection.query(insertQuery, insertParams);
    const juegoId = result.insertId;
    if (desarrolladores && Array.isArray(desarrolladores) && desarrolladores.length > 0) {
      for (const idDev of desarrolladores) {
        if (idDev && !isNaN(parseInt(idDev))) {
          await connection.query('INSERT INTO juego_has_desarrollador (juego_idjuego, desarrollador_iddesarrollador) VALUES (?, ?)',
            [juegoId, parseInt(idDev)]
          );
        }
      }
    }
    if (editores && Array.isArray(editores) && editores.length > 0) {
      for (const idEditor of editores) {
        if (idEditor && !isNaN(parseInt(idEditor))) {
          await connection.query('INSERT INTO editor_has_juego (juego_idjuego, editor_ideditor) VALUES (?, ?)',
            [juegoId, parseInt(idEditor)]
          );
        }
      }
    }
    if (generos && Array.isArray(generos) && generos.length > 0) {
      for (const idGenero of generos) {
        if (idGenero && !isNaN(parseInt(idGenero))) {
          await connection.query('INSERT INTO juego_has_genero (juego_idjuego, genero_idgenero) VALUES (?, ?)',
            [juegoId, parseInt(idGenero)]
          );
        }
      }
    }
    await connection.commit();
    return juegoId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
export const buscarJuegos = async (searchTerm) => {
    let query = `SELECT DISTINCT juego.*,
            GROUP_CONCAT(DISTINCT desarrollador.nombre) AS nombre_desarrollador,
            GROUP_CONCAT(DISTINCT editor.nombre) AS nombre_editor,
            GROUP_CONCAT(DISTINCT genero.nombre) AS nombre_genero
        FROM juego
        LEFT JOIN juego_has_desarrollador ON juego.idjuego = juego_has_desarrollador.juego_idjuego
        LEFT JOIN desarrollador ON juego_has_desarrollador.desarrollador_iddesarrollador = desarrollador.iddesarrollador
        LEFT JOIN editor_has_juego ON juego.idjuego = editor_has_juego.juego_idjuego
        LEFT JOIN editor ON editor_has_juego.editor_ideditor = editor.ideditor
        LEFT JOIN juego_has_genero ON juego.idjuego = juego_has_genero.juego_idjuego
        LEFT JOIN genero ON juego_has_genero.genero_idgenero = genero.idgenero`;
    const params = [];
    if (searchTerm) {
        query += ` WHERE LOWER(juego.titulo) LIKE LOWER(?)`;
        params.push(`%${searchTerm}%`);
    }
    query += ` GROUP BY juego.idjuego ORDER BY juego.titulo`;
    const [juegos] = await pool.query(query, params);
    return juegos;
};
export const filtrarGenero = async (generos = []) => {
    if (!generos.length) return [];
    const query = `SELECT DISTINCT j.*,
            GROUP_CONCAT(DISTINCT d.nombre) as nombre_desarrollador,
            GROUP_CONCAT(DISTINCT e.nombre) as nombre_editor,
            GROUP_CONCAT(DISTINCT g.nombre) as nombre_genero
        FROM juego j
        INNER JOIN juego_has_genero jhg ON j.idjuego = jhg.juego_idjuego
        INNER JOIN genero g ON jhg.genero_idgenero = g.idgenero
        LEFT JOIN juego_has_desarrollador jhd ON j.idjuego = jhd.juego_idjuego
        LEFT JOIN desarrollador d ON jhd.desarrollador_iddesarrollador = d.iddesarrollador
        LEFT JOIN editor_has_juego ehj ON j.idjuego = ehj.juego_idjuego
        LEFT JOIN editor e ON ehj.editor_ideditor = e.ideditor
        WHERE jhg.genero_idgenero IN (?)
        GROUP BY j.idjuego
        HAVING COUNT(DISTINCT jhg.genero_idgenero) = ?`;
    try {
        const [juegos] = await pool.query(query, [generos, generos.length]);
        return juegos;
    } catch (error) {
        throw error;
    }
};
export const eliminarJuego = async (idjuego) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM biblioteca WHERE juego_idjuego = ?', [idjuego]);
    await connection.query('DELETE FROM juego_has_desarrollador WHERE juego_idjuego = ?',[idjuego]);
    await connection.query('DELETE FROM editor_has_juego WHERE juego_idjuego = ?',[idjuego]);
    await connection.query('DELETE FROM juego_has_genero WHERE juego_idjuego = ?',[idjuego]);
    const [juego] = await connection.query('SELECT url_portada FROM juego WHERE idjuego = ?',[idjuego]);
    await connection.query('DELETE FROM juego WHERE idjuego = ?',[idjuego]);
    await connection.commit();
    return juego[0]?.url_portada;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const obtenerImagenJuego = async (idjuego) => {
  try {
    const [rows] = await pool.query('SELECT url_portada FROM juego WHERE idjuego = ?',[idjuego]);
    return rows[0]?.url_portada;
  } catch (error) {
    throw error;
  }
};

export const editarJuego = async (idjuego, juegoData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const {
      titulo, 
      descripcion, 
      precio, 
      fecha_lanzamiento,
      clasificacion_edad, 
      url_trailer, 
      url_portada,
      desarrolladores, 
      editores, 
      generos
    } = juegoData;
    const tituloValidado = titulo?.substring(0, 255) || '';
    const descripcionValidada = descripcion || '';
    const precioValidado = parseFloat(precio) || 0;
    const clasificacionValidada = parseInt(clasificacion_edad) || 0;
    const urlTrailerValidado = url_trailer?.substring(0, 255) || '';
    let updateQuery = `UPDATE juego 
      SET titulo = ?,
          descripcion = ?,
          precio = ?,
          fecha_lanzamiento = ?,
          clasificacion_edad = ?,
          url_trailer = ?`;
    let updateParams = [
      tituloValidado,
      descripcionValidada,
      precioValidado,
      fecha_lanzamiento || null,
      clasificacionValidada,
      urlTrailerValidado
    ];
    if (url_portada) {
      updateQuery += `, url_portada = ?`;
      updateParams.push(url_portada);
    }
    updateQuery += ` WHERE idjuego = ?`;
    updateParams.push(idjuego);
    await connection.query(updateQuery, updateParams);
    await connection.query('DELETE FROM juego_has_desarrollador WHERE juego_idjuego = ?', [idjuego]);
    if (desarrolladores && desarrolladores.length > 0) {
      const desarrolladoresValues = desarrolladores.map(dev => [idjuego, dev]);
      await connection.query('INSERT INTO juego_has_desarrollador (juego_idjuego, desarrollador_iddesarrollador) VALUES ?',
        [desarrolladoresValues]);
    }
    await connection.query('DELETE FROM editor_has_juego WHERE juego_idjuego = ?', [idjuego]);
    if (editores && editores.length > 0) {
      const editoresValues = editores.map(ed => [idjuego, ed]);
      await connection.query('INSERT INTO editor_has_juego (juego_idjuego, editor_ideditor) VALUES ?',
        [editoresValues]);
    }
    await connection.query('DELETE FROM juego_has_genero WHERE juego_idjuego = ?', [idjuego]);
    if (generos && generos.length > 0) {
      const generosValues = generos.map(gen => [idjuego, gen]);
      await connection.query('INSERT INTO juego_has_genero (juego_idjuego, genero_idgenero) VALUES ?',
        [generosValues]);
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

export const filtrarPrecio = async (rango) => {
    try {
        let whereClause;
        switch(rango) {
            case 'menos5':
                whereClause = 'juego.precio <= 25';
                break;
            case 'menos15':
                whereClause = 'juego.precio >= 25 AND juego.precio <= 40';
                break;
            case 'menos30':
                whereClause = 'juego.precio >= 40 AND juego.precio <= 55';
                break;
            case 'menos50':
                whereClause = 'juego.precio >= 55 AND juego.precio <= 60';
                break;
            case 'mas50':
                whereClause = 'juego.precio >= 60';
                break;
            default:
                throw new Error('Rango de precio no válido');
        }
        const query = `SELECT DISTINCT juego.*,
                GROUP_CONCAT(DISTINCT desarrollador.nombre) AS nombre_desarrollador,
                GROUP_CONCAT(DISTINCT editor.nombre) AS nombre_editor,
                GROUP_CONCAT(DISTINCT genero.nombre) AS nombre_genero
            FROM juego
            LEFT JOIN juego_has_desarrollador ON juego.idjuego = juego_has_desarrollador.juego_idjuego
            LEFT JOIN desarrollador ON juego_has_desarrollador.desarrollador_iddesarrollador = desarrollador.iddesarrollador
            LEFT JOIN editor_has_juego ON juego.idjuego = editor_has_juego.juego_idjuego
            LEFT JOIN editor ON editor_has_juego.editor_ideditor = editor.ideditor
            LEFT JOIN juego_has_genero ON juego.idjuego = juego_has_genero.juego_idjuego
            LEFT JOIN genero ON juego_has_genero.genero_idgenero = genero.idgenero
            WHERE ${whereClause}
            GROUP BY juego.idjuego
            ORDER BY juego.precio`;
        const [juegos] = await pool.query(query);
        return juegos;
    } catch (error) {
        throw error;
    }
};
