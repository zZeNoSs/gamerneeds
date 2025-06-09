import React, { useState, useEffect } from 'react';
import JuegoInfo from './juegoInfo';
import { mostrarJuegos } from '../../services/juegoService';

const JuegoGrid = ({ filteredGames }) => {
  const [juegos, setJuegos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleDeleteJuego = (deletedId) => {
    setJuegos(prevJuegos => prevJuegos.filter(juego => juego.idjuego !== deletedId));
  };
  useEffect(() => {
    const cargarJuegos = async () => {
      setLoading(true);
      try {
        if (Array.isArray(filteredGames)) {
          setJuegos(filteredGames);
        } else {
          const data = await mostrarJuegos();
          setJuegos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        setError('Error al cargar los juegos');
        setJuegos([]);
      } finally {
        setLoading(false);
      }
    }; 
    cargarJuegos();
  }, [filteredGames]);
  if (loading) {
    return <div className="col-span-3 text-center text-white">Cargando...</div>;
  }
  if (error) {
    return <div className="col-span-3 text-center text-red-500">{error}</div>;
  }
  if (!juegos.length) {
    return <div className="col-span-3 text-center text-white">No hay juegos disponibles</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {juegos.map((juego) => (
        <JuegoInfo 
          key={juego.idjuego} 
          juego={juego} 
          onDelete={handleDeleteJuego}/>
      ))}
    </div>
  );
};

export default JuegoGrid;