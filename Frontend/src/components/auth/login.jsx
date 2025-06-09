import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { loginUsuario } from '../../services/authService';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const validateField = (name, value) => {
    switch (name) {
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
  };
  const handleSubmit = async (e) => {
    e.preventDefault();   
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }
    setLoading(true);
    try {
      const response = await loginUsuario(formData);
      if (response.success) {
        login(response.usuario, response.token);
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#272727] flex items-center justify-center px-4">
      <div className="bg-[#202020] p-8 rounded-xl shadow-lg w-full max-w-md border border-zinc-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>     
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF4C1A] to-[#FF7A1A] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#FF4C1A] hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;