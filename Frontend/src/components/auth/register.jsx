import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registroUsuario } from '../../services/authService';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    fecha_nacimiento: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          return 'El nombre es obligatorio';
        }
        if (value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'El nombre solo puede contener letras';
        }
        return '';
      case 'apellidos':
        if (!value.trim()) {
          return 'Los apellidos son obligatorios';
        }
        if (value.trim().length < 2) {
          return 'Los apellidos deben tener al menos 2 caracteres';
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'Los apellidos solo pueden contener letras';
        }
        return '';
      case 'email':
        if (!value.trim()) {
          return 'El email es obligatorio';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'El formato del email no es válido';
        }
        return '';
      case 'password':
        if (!value) {
          return 'La contraseña es obligatoria';
        }
        if (value.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
        }
        return '';
      case 'confirmPassword':
        if (!value) {
          return 'Confirma tu contraseña';
        }
        if (value !== formData.password) {
          return 'Las contraseñas no coinciden';
        }
        return '';
      case 'fecha_nacimiento':
        if (!value) {
          return 'La fecha de nacimiento es obligatoria';
        }
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) {
          return 'Debes tener al menos 13 años';
        }
        if (age > 120) {
          return 'Fecha de nacimiento no válida';
        }
        return '';
      case 'direccion':
        if (!value.trim()) {
          return 'La dirección es obligatoria';
        }
        if (value.trim().length < 10) {
          return 'La dirección debe tener al menos 10 caracteres';
        }
        return '';
      default:
        return '';
    }
  };
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
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
      const { confirmPassword, ...userData } = formData;
      await registroUsuario(userData);
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#272727] flex items-center justify-center px-4">
      <div className="bg-[#202020] p-8 rounded-xl shadow-lg w-full max-w-md border border-zinc-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Crear Cuenta</h2>       
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-transparent border-b ${
                errors.nombre ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors`}
              disabled={loading}/>
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="apellidos"
              placeholder="Apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-transparent border-b ${
                errors.apellidos ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors`}
              disabled={loading}/>
            {errors.apellidos && (
              <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-transparent border-b ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors`}
              disabled={loading}/>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-transparent border-b ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors`}
              disabled={loading}/>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-transparent border-b ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors`}
              disabled={loading}/>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fecha de Nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              className={`w-full px-4 py-3 bg-transparent border-b ${
                errors.fecha_nacimiento ? 'border-red-500' : 'border-gray-600'
              } text-white focus:outline-none focus:border-gray-400 transition-colors`}
              disabled={loading}/>
            {errors.fecha_nacimiento && (
              <p className="text-red-500 text-sm mt-1">{errors.fecha_nacimiento}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-transparent border-b ${
                errors.direccion ? 'border-red-500' : 'border-gray-600'
              } text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors`}
              disabled={loading}/>
            {errors.direccion && (
              <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF4C1A] to-[#FF7A1A] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#FF4C1A] hover:underline">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;