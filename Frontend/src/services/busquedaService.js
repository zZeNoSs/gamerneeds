import crearInstanciaApi from './apiConfig';

const api = crearInstanciaApi();

export const buscarJuegos = async (termino, filtros = {}) => {
  try {
    const respuesta = await api.get('/juegos/buscar', {
      params: { q: termino, ...filtros } });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || {message: 'Error en la búsqueda'};
  }
};

export const filtrarGenero = async (generos = []) => {
    try {
        if (!generos || generos.length === 0) {
            return [];
        }
        const generosIds = generos.map(id => parseInt(id)).filter(id => !isNaN(id)); 
        if (generosIds.length === 0) {
            return [];
        }       
        const response = await api.get('/juegos/filtrar', {
            params: { 
                generos: generosIds.join(',') 
            }
        });       
        if (!response.data) {
            return [];
        }       
        return Array.isArray(response.data) ? response.data : [];       
    } catch (error) {
        return [];
    }
};

export const filtrarPrecio = async (rango) => {
    try {
        if (!rango) {
            return [];
        }
        const response = await api.get('/juegos/filtrar-precio', {
            params: { rango }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
