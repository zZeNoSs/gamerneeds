import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearEditor } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const CrearEditor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    fecha_fundacion: '',
    descripcion: '',
    sitio_web: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.length > 100) return 'El nombre no puede exceder 100 caracteres';
        return '';
      case 'pais':
        if (!value.trim()) return 'El país es obligatorio';
        if (value.trim().length < 2) return 'El país debe tener al menos 2 caracteres';
        return '';
      case 'fecha_fundacion':
        if (!value) return 'La fecha de fundación es obligatoria';
        const fecha = new Date(value);
        const fechaMinima = new Date('1900-01-01');
        const hoy = new Date();
        if (fecha < fechaMinima || fecha > hoy) return 'Fecha inválida';
        return '';
      case 'descripcion':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 20) return 'La descripción debe tener al menos 20 caracteres';
        if (value.length > 500) return 'La descripción no puede exceder 500 caracteres';
        return '';
      default:
        return '';
    }
  };
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'sitio_web') {
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
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }
    setLoading(true);
    try {
      await crearEditor(formData);
      toast.success('Editor creado exitosamente');
      navigate('/panel-admin');
    } catch (error) {
      toast.error(error.message || 'Error al crear el editor');
    } finally {
      setLoading(false);
    }
  };
  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-transparent border-b text-white placeholder-gray-400 focus:outline-none transition-colors";
    return errors[fieldName] ? `${baseClass} border-red-500` : `${baseClass} border-gray-600`;
  };
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Crear Nuevo Editor</h2>     
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del Editor"
            value={formData.nombre}
            onChange={handleChange}
            maxLength={100}
            className={getFieldClassName('nombre')}
            disabled={loading}/>
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>
        <div>
          <input
            type="text"
            name="pais"
            placeholder="País de Origen"
            value={formData.pais}
            onChange={handleChange}
            maxLength={50}
            className={getFieldClassName('pais')}
            disabled={loading}/>
          {errors.pais && <p className="text-red-500 text-sm mt-1">{errors.pais}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="fecha_fundacion" className="block text-sm font-medium text-gray-400">
            Fecha de Fundación *</label>
          <input
            type="date"
            id="fecha_fundacion"
            name="fecha_fundacion"
            value={formData.fecha_fundacion}
            onChange={handleChange}
            min="1900-01-01"
            max={new Date().toISOString().split('T')[0]}
            className={getFieldClassName('fecha_fundacion')}
            disabled={loading}/>
          {errors.fecha_fundacion && <p className="text-red-500 text-sm mt-1">{errors.fecha_fundacion}</p>}
        </div>
        <div>
          <textarea
            name="descripcion"
            placeholder="Descripción del editor (mínimo 20 caracteres)"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            maxLength={500}
            className={getFieldClassName('descripcion')}
            disabled={loading}/>
          <div className="text-sm text-gray-400 mt-1">{formData.descripcion.length}/500 caracteres</div>
          {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
        </div>
        <div>
          <input
            type="url"
            name="sitio_web"
            placeholder="Sitio Web (opcional)"
            value={formData.sitio_web}
            onChange={handleChange}
            className={getFieldClassName('sitio_web')}
            disabled={loading}/>
        </div>
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="admin-button-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creando...' : 'Crear Editor'}</button>
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

export default CrearEditor;