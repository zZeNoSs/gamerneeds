import crearInstanciaApi from './apiConfig';

const api = crearInstanciaApi();

export const registroAdminUsuario = async (userData) => {
  try {
    userData.rol = userData.rol.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!['admin', 'usuario'].includes(userData.rol)) {
      throw new Error('El rol debe ser "admin" o "usuario"');
    }
    const response = await api.post('/admin/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error en el registro de usuario'};
  }
};

export const crearJuego = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    const response = await api.post('/admin/juego', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 30000,
    });  
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al crear el juego'};
  }
};

export const crearDesarrollador = async (desarrolladorData) => {
  try {
    const response = await api.post('/admin/desarrollador', desarrolladorData);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al crear el desarrollador'};
  }
};

export const crearEditor = async (editorData) => {
  try {
    const response = await api.post('/admin/editor', editorData);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al crear el editor'};
  }
};

export const mostrarDesarrolladores = async () => {
  try {
    const response = await api.get('/admin/desarrolladores');
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al mostrar desarrolladores'};
  }
};

export const mostrarEditores = async () => {
  try {
    const response = await api.get('/admin/editores');
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al mostrar editores'};
  }
};

export const mostrarGeneros = async () => {
  try {
    const response = await api.get('/admin/generos');
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al mostrar géneros'};
  }
};

export const eliminarJuego = async (idjuego) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    const response = await api.delete(`/admin/juego/${idjuego}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al eliminar el juego'};
  }
};

export const editarJuego = async (idjuego, formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    const response = await api.put(`/admin/juego/${idjuego}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al editar el juego'};
  }
};

export const crearGenero = async (generoData) => {
  try {
    const response = await api.post('/admin/genero', generoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al crear el género'};
  }
};

export const eliminarDesarrollador = async (iddesarrollador) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    const response = await api.delete(`/admin/desarrollador/${iddesarrollador}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al eliminar el desarrollador'};
  }
};

export const eliminarEditor = async (ideditor) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    const response = await api.delete(`/admin/editor/${ideditor}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al eliminar el editor'};
  }
};

export const eliminarGenero = async (idgenero) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    const response = await api.delete(`/admin/genero/${idgenero}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al eliminar el género'};
  }
};

export const enviarMensajeContacto = async (datosContacto) => {
  try {
    const {nombre, email, asunto, descripcion} = datosContacto;
    if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !descripcion?.trim()) {
      throw new Error('Todos los campos son obligatorios');
    }
    const response = await api.post('/contacto', {
      nombre: nombre.trim(),
      email: email.trim(),
      asunto: asunto.trim(),
      descripcion: descripcion.trim()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error al enviar el mensaje de contacto'};
  }
};