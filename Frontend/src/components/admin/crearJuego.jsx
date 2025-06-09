import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearJuego, mostrarDesarrolladores, mostrarEditores, mostrarGeneros } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const CrearJuego = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    fecha_lanzamiento: '',
    clasificacion_edad: '',
    url_trailer: '',
    desarrollador_iddesarrollador: '',
    editor_ideditor: '',
    generos: []
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [desarrolladores, setDesarrolladores] = useState([]);
  const [editores, setEditores] = useState([]);
  const [generos, setGeneros] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devs, eds, gens] = await Promise.all([
          mostrarDesarrolladores(),
          mostrarEditores(),
          mostrarGeneros()
        ]);
        setDesarrolladores(devs);
        setEditores(eds);
        setGeneros(gens);
      } catch (error) {
        toast.error('Error al cargar datos del formulario');
      }
    };
    fetchData();
  }, []);
  const validateField = (name, value) => {
    switch (name) {
      case 'titulo':
        if (!value.trim()) return 'El título es obligatorio';
        if (value.trim().length < 2) return 'El título debe tener al menos 2 caracteres';
        if (value.length > 100) return 'El título no puede exceder 100 caracteres';
        return '';
      case 'descripcion':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
        if (value.length > 1000) return 'La descripción no puede exceder 1000 caracteres';
        return '';
      case 'precio':
        if (!value) return 'El precio es obligatorio';
        const precio = parseFloat(value);
        if (isNaN(precio) || precio < 0 || precio > 999.99) return 'Precio inválido (0-999.99)';
        return '';
      case 'fecha_lanzamiento':
        if (!value) return 'La fecha de lanzamiento es obligatoria';
        const fecha = new Date(value);
        const fechaMinima = new Date('1970-01-01');
        const fechaMaxima = new Date();
        fechaMaxima.setFullYear(fechaMaxima.getFullYear() + 5);
        if (fecha < fechaMinima || fecha > fechaMaxima) return 'Fecha fuera del rango válido';
        return '';
      case 'clasificacion_edad':
        if (!value) return 'La clasificación de edad es obligatoria';
        const edadesValidas = ['3', '7', '12', '16', '18'];
        if (!edadesValidas.includes(value)) return 'Selecciona una clasificación válida';
        return '';
      case 'desarrollador_iddesarrollador':
        if (!value) return 'Selecciona un desarrollador';
        return '';
      case 'editor_ideditor':
        if (!value) return 'Selecciona un editor';
        return '';
      case 'generos':
        if (!Array.isArray(value) || value.length === 0) return 'Selecciona al menos un género';
        if (value.length > 5) return 'Máximo 5 géneros permitidos';
        return '';
      default:
        return '';
    }
  };
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'url_trailer') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)');
        e.target.value = '';
        return;
      }  
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La imagen no puede superar los 10MB');
        e.target.value = '';
        return;
      } 
      setSelectedImage(file);
    }
  };
  const handleGenreChange = (e) => {
    const {value, checked} = e.target;
    const generoId = parseInt(value); 
    setFormData(prev => {
      const newGeneros = checked 
        ? [...prev.generos, generoId]
        : prev.generos.filter(id => id !== generoId);
      return { ...prev, generos: newGeneros };
    });
    if (errors.generos) {
      const newGeneros = checked 
        ? [...formData.generos, generoId]
        : formData.generos.filter(id => id !== generoId);  
      const error = validateField('generos', newGeneros);
      setErrors(prev => ({ ...prev, generos: error }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();    
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('fecha_lanzamiento', formData.fecha_lanzamiento);
      formDataToSend.append('clasificacion_edad', formData.clasificacion_edad);
      formDataToSend.append('url_trailer', formData.url_trailer || '');  
      formDataToSend.append('desarrolladores', JSON.stringify([formData.desarrollador_iddesarrollador]));
      formDataToSend.append('editores', JSON.stringify([formData.editor_ideditor]));
      formDataToSend.append('generos', JSON.stringify(formData.generos));    
      if (selectedImage) {
        formDataToSend.append('url_portada', selectedImage);
      }
      await crearJuego(formDataToSend);
      toast.success('Juego creado exitosamente');
      navigate('/panel-admin');
    } catch (error) {
      toast.error(error.message || 'Error al crear el juego');
    } finally {
      setLoading(false);
    }
  };
  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-transparent border-b text-white placeholder-gray-400 focus:outline-none transition-colors";
    return errors[fieldName] ? `${baseClass} border-red-500` : `${baseClass} border-gray-600`;
  };
  const getSelectClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-zinc-800 border text-white rounded-md focus:outline-none";
    return errors[fieldName] ? `${baseClass} border-red-500` : `${baseClass} border-gray-600`;
  };
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Crear Nuevo Juego</h2>  
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <input
            type="text"
            name="titulo"
            placeholder="Título del Juego"
            value={formData.titulo}
            onChange={handleChange}
            maxLength={100}
            className={getFieldClassName('titulo')}
            disabled={loading}/>
          <div className="text-sm text-gray-400 mt-1">{formData.titulo.length}/100 caracteres</div>
          {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
        </div>
        <div>
          <textarea
            name="descripcion"
            placeholder="Descripción del juego (mínimo 10 caracteres)"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            maxLength={1000}
            className={getFieldClassName('descripcion')}
            disabled={loading}/>
          <div className="text-sm text-gray-400 mt-1">{formData.descripcion.length}/1000 caracteres</div>
          {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
        </div>
        <div>
          <input
            type="number"
            step="0.01"
            name="precio"
            placeholder="Precio (€)"
            value={formData.precio}
            onChange={handleChange}
            min="0"
            max="999.99"
            className={getFieldClassName('precio')}
            disabled={loading}/>
          {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}</div>
        <div className="space-y-2">
          <label htmlFor="fecha_lanzamiento" className="block text-sm font-medium text-gray-400">
            Fecha de Lanzamiento *</label>
          <input
            type="date"
            id="fecha_lanzamiento"
            name="fecha_lanzamiento"
            value={formData.fecha_lanzamiento}
            onChange={handleChange}
            min="1970-01-01"
            max={new Date(new Date().getFullYear() + 5, 11, 31).toISOString().split('T')[0]}
            className={getFieldClassName('fecha_lanzamiento')}
            disabled={loading}/>
          {errors.fecha_lanzamiento && <p className="text-red-500 text-sm mt-1">{errors.fecha_lanzamiento}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Clasificación de Edad *</label>
          <select
            name="clasificacion_edad"
            value={formData.clasificacion_edad}
            onChange={handleChange}
            className={getSelectClassName('clasificacion_edad')}
            disabled={loading}>
            <option value="">Selecciona una clasificación</option>
            <option value="3">PEGI 3+</option>
            <option value="7">PEGI 7+</option>
            <option value="12">PEGI 12+</option>
            <option value="16">PEGI 16+</option>
            <option value="18">PEGI 18+</option>
          </select>
          {errors.clasificacion_edad && <p className="text-red-500 text-sm mt-1">{errors.clasificacion_edad}</p>}
        </div>
        <div>
          <input
            type="url"
            name="url_trailer"
            placeholder="URL del Trailer (opcional)"
            value={formData.url_trailer}
            onChange={handleChange}
            className={getFieldClassName('url_trailer')}
            disabled={loading}/>
        </div>
        <div className="space-y-2">
          <label htmlFor="imagen_portada" className="block text-sm font-medium text-gray-400">Imagen de Portada (opcional)</label>
          <input
            type="file"
            id="imagen_portada"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full px-4 py-3 bg-zinc-800 border border-gray-600 rounded-md text-white focus:outline-none"
            disabled={loading}/>
          {selectedImage && (
            <div className="text-sm text-green-400 mt-1">
              ✅ Imagen seleccionada: {selectedImage.name}
            </div>
          )}
          <div className="text-sm text-gray-400 mt-1">
            Formatos: JPEG, JPG, PNG, WEBP. Tamaño máximo: 10MB. Si no seleccionas ninguna, se usará una imagen por defecto.
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Desarrollador *</label>
          <select
            name="desarrollador_iddesarrollador"
            value={formData.desarrollador_iddesarrollador}
            onChange={handleChange}
            className={getSelectClassName('desarrollador_iddesarrollador')}
            disabled={loading}>
            <option value="">Selecciona un desarrollador</option>
            {desarrolladores.map(dev => (
              <option key={dev.iddesarrollador} value={dev.iddesarrollador}>
                {dev.nombre}
              </option>
            ))}
          </select>
          {errors.desarrollador_iddesarrollador && <p className="text-red-500 text-sm mt-1">{errors.desarrollador_iddesarrollador}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Editor *</label>
          <select
            name="editor_ideditor"
            value={formData.editor_ideditor}
            onChange={handleChange}
            className={getSelectClassName('editor_ideditor')}
            disabled={loading}>
            <option value="">Selecciona un editor</option>
            {editores.map(editor => (
              <option key={editor.ideditor} value={editor.ideditor}>
                {editor.nombre}
              </option>
            ))}
          </select>
          {errors.editor_ideditor && <p className="text-red-500 text-sm mt-1">{errors.editor_ideditor}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Géneros * (máximo 5)</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto bg-zinc-800 border border-gray-600 rounded-md p-3">
            {generos.map(genero => (
              <label key={genero.idgenero} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={genero.idgenero}
                  checked={formData.generos.includes(genero.idgenero)}
                  onChange={handleGenreChange}
                  disabled={loading || (!formData.generos.includes(genero.idgenero) && formData.generos.length >= 5)}
                  className="rounded"/>
                <span className="text-sm text-white">{genero.nombre}</span>
              </label>
            ))}
          </div>
          <div className="text-sm text-gray-400 mt-1">{formData.generos.length}/5 géneros seleccionados</div>
          {errors.generos && <p className="text-red-500 text-sm mt-1">{errors.generos}</p>}
        </div>
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="admin-button-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creando...' : 'Crear Juego'}</button>
          <button
            type="button"
            onClick={() => navigate('/panel-admin')}
            disabled={loading}
            className="admin-button-primary px-8 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50">
            Volver al Panel</button>
        </div>
      </form>
    </div>
  );
};

export default CrearJuego;