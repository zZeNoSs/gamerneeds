import axios from 'axios';

const crearInstanciaApi = () => {
    const apiUrl = import.meta.env.VITE_API_URL; 
    const api = axios.create({
        baseURL: apiUrl,
        withCredentials: true
    });
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }        
        if (config.data instanceof FormData) {
            return config;
        }     
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
    return api;
};

export default crearInstanciaApi;