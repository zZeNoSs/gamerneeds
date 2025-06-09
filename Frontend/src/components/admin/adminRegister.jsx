import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registroAdminUsuario } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    direccion: '',
    rol: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.length > 50) return 'El nombre no puede exceder 50 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras y espacios';
        return '';
      case 'apellidos':
        if (!value.trim()) return 'Los apellidos son obligatorios';
        if (value.trim().length < 2) return 'Los apellidos deben tener al menos 2 caracteres';
        if (value.length > 100) return 'Los apellidos no pueden exceder 100 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Los apellidos solo pueden contener letras y espacios';
        return '';
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El formato del email no es válido';
        return '';
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        if (value.length > 255) return 'La contraseña no puede exceder 255 caracteres';
        return '';
      case 'fecha_nacimiento':
        if (!value) return 'La fecha de nacimiento es obligatoria';
        const fechaNac = new Date(value);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNac.getFullYear();
        if (edad < 13) return 'Debe ser mayor de 13 años';
        if (edad > 120) return 'Edad no válida';
        return '';
      case 'direccion':
        if (!value.trim()) return 'La dirección es obligatoria';
        if (value.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres';
        if (value.length > 200) return 'La dirección no puede exceder 200 caracteres';
        return '';
      case 'rol':
        if (!value.trim()) return 'El rol es obligatorio';
        if (!['admin', 'usuario'].includes(value.toLowerCase())) return 'El rol debe ser "admin" o "usuario"';
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
    const { name, value } = e.target;
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
      await registroAdminUsuario(formData);
      toast.success('Usuario registrado correctamente');
      navigate('/panel-admin');
    } catch (error) {
      toast.error(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };
  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-transparent border-b text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors";
    return errors[fieldName] ? `${baseClass} border-red-500` : `${baseClass} border-gray-600`;
  };
  const getSelectClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-[#202020] border-b text-white focus:outline-none focus:border-gray-400 transition-colors";
    return errors[fieldName] ? `${baseClass} border-red-500` : `${baseClass} border-gray-600`;
  };
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Registro de Usuario</h2>     
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input 
              type="text" 
              name="nombre"
              placeholder="Nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              maxLength={50}
              className={getFieldClassName('nombre')}
              disabled={loading}/>
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
          </div> 
          <div>
            <input 
              type="text" 
              name="apellidos"
              placeholder="Apellidos" 
              value={formData.apellidos} 
              onChange={handleChange} 
              maxLength={100}
              className={getFieldClassName('apellidos')}
              disabled={loading}/>
            {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
          </div>
        </div>
        <div>
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            className={getFieldClassName('email')}
            disabled={loading}/>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <input 
            type="password" 
            name="password"
            placeholder="Contraseña" 
            value={formData.password} 
            onChange={handleChange} 
            maxLength={255}
            className={getFieldClassName('password')}
            disabled={loading}/>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-400 mb-2">Fecha de Nacimiento *</label>
          <input 
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento} 
            onChange={handleChange} 
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
            className={getFieldClassName('fecha_nacimiento')}
            disabled={loading}/>
          {errors.fecha_nacimiento && <p className="text-red-500 text-sm mt-1">{errors.fecha_nacimiento}</p>}
        </div>
        <div>
          <input 
            type="text" 
            name="direccion"
            placeholder="Dirección" 
            value={formData.direccion} 
            onChange={handleChange} 
            maxLength={200}
            className={getFieldClassName('direccion')}
            disabled={loading}/>
          {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
        </div>
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-400 mb-2">Rol *</label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className={getSelectClassName('rol')}
            disabled={loading}
            style={{
              backgroundColor: '#202020',
              color: 'white',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px'
            }}>
            <option value="" style={{ backgroundColor: '#202020', color: 'white' }}>
              Selecciona un rol
            </option>
            <option value="admin" style={{ backgroundColor: '#202020', color: 'white' }}>
              Administrador
            </option>
            <option value="usuario" style={{ backgroundColor: '#202020', color: 'white' }}>
              Usuario
            </option>
          </select>
          {errors.rol && <p className="text-red-500 text-sm mt-1">{errors.rol}</p>}
        </div>
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#FF4C1A' }}
            className="flex-1 py-3 text-white font-medium rounded-md hover:bg-[#FF6B3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed !bg-[#FF4C1A]">
            {loading ? 'Registrando...' : 'Registrar Usuario'}</button>
          <button
            type="button"
            onClick={() => navigate('/panel-admin')}
            disabled={loading}
            style={{ backgroundColor: '#FF4C1A' }}
            className="px-8 py-3 text-white font-medium rounded-md hover:bg-[#FF6B3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed !bg-[#FF4C1A]">
            Volver al Panel</button>
        </div>
      </form>
    </div>
  );
};

export default AdminRegister;