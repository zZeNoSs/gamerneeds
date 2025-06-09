import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarJuego } from '../../services/adminService';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-hot-toast';

const JuegoInfo = ({ juego, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol === 'admin';

  const handleDelete = async (e) => {
    e.preventDefault(); 
    if (!window.confirm(`¿Estás seguro de que deseas eliminar juego: ${juego.titulo}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      if (!juego.idjuego) {
        toast.error('ID de juego no válido');
        return;
      }
      await eliminarJuego(juego.idjuego);
      toast.success('Juego eliminado correctamente');
      if (onDelete) {
        onDelete(juego.idjuego);
      }
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el juego');
    }
  };
  const getImageUrl = (url) => {
    if (!url) return '/icons/default-game.png';  
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}/public/juegos/${url.split('/').pop()}`;
  };
  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      const img = new Image();
      img.src = juego.url_portada;
      img.onload = () => {
        setImageError(false);
      };
    }
  };
  return (
    <Link to={`/juego/${juego.idjuego}`} className="block">
      <div className="bg-zinc-800/50 rounded-lg overflow-hidden transition-transform hover:scale-105">
        <div className="relative h-48">
          <img 
            src={imageError ? '/icons/default-game.png' : getImageUrl(juego.url_portada)}
            alt={juego.titulo} 
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"/>
        </div>
        <div className="p-4">
          <h2 className="text-white font-semibold text-lg mb-2 truncate">{juego.titulo}</h2>
          <div className="flex justify-between items-center">
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="!bg-red-600 text-white px-3 py-1 rounded-md hover:!bg-red-700 transition-colors">
                Eliminar</button>
            )}
            <div className="text-white font-bold">
              {juego.precio ? `${juego.precio}€` : 'Gratis'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JuegoInfo;