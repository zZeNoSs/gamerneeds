import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearGenero } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const CrearGenero = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.length > 50) return 'El nombre no puede exceder 50 caracteres';
        return '';
      case 'descripcion':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
        if (value.length > 300) return 'La descripción no puede exceder 300 caracteres';
        return '';
      default:
        return '';
    }
  };
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
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
      await crearGenero(formData);
      toast.success('Género creado exitosamente');
      navigate('/panel-admin');
    } catch (error) {
      toast.error(error.message || 'Error al crear el género');
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
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Crear Nuevo Género</h2>     
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del Género (ej: Acción, RPG, Estrategia)"
            value={formData.nombre}
            onChange={handleChange}
            maxLength={50}
            className={getFieldClassName('nombre')}
            disabled={loading}/>
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>
        <div>
          <textarea
            name="descripcion"
            placeholder="Descripción del género (mínimo 10 caracteres)"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
            maxLength={300}
            className={getFieldClassName('descripcion')}
            disabled={loading}/>
          <div className="text-sm text-gray-400 mt-1">{formData.descripcion.length}/300 caracteres</div>
          {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
        </div>
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="admin-button-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creando...' : 'Crear Género'}</button>
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

export default CrearGenero;