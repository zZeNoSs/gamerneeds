import React, { useState } from 'react';
import { enviarMensajeContacto } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const ContactoForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    descripcion: ''
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
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'El formato del email es inválido';
        return '';
      case 'asunto':
        if (!value.trim()) return 'El asunto es obligatorio';
        if (value.trim().length < 5) return 'El asunto debe tener al menos 5 caracteres';
        if (value.length > 200) return 'El asunto no puede exceder 200 caracteres';
        return '';
      case 'descripcion':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 20) return 'La descripción debe tener al menos 20 caracteres';
        if (value.length > 2000) return 'La descripción no puede exceder 2000 caracteres';
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
      await enviarMensajeContacto(formData);
      toast.success('¡Mensaje enviado correctamente! Te responderemos pronto.');  
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        descripcion: ''
      });
      setErrors({});
    } catch (error) {
      toast.error(error.message || 'Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-transparent border-b text-white placeholder-gray-400 focus:outline-none transition-colors";
    return errors[fieldName] ? `${baseClass} border-red-500` : `${baseClass} border-gray-600`;
  };
  return (
    <div className="w-full min-h-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Contacto</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          ¿Tienes alguna pregunta, sugerencia o necesitas ayuda? 
          Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
        </p>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-[#1a1a1a] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Información de contacto</h2>          
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#FF4C1A] p-3 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Email</h3>
                  <p className="text-gray-400">elzenyt906@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-[#FF4C1A] p-3 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Tiempo de respuesta</h3>
                  <p className="text-gray-400">24-48 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-[#FF4C1A] p-3 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.196l-2.225 6.757H3.25l5.47 4.032-2.096 6.494L12 15.803l5.376 3.676-2.096-6.494 5.47-4.032h-6.525L12 2.196z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Soporte</h3>
                  <p className="text-gray-400">Lunes a Viernes, 9:00 - 18:00</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-[#FF4C1A]/10 border border-[#FF4C1A]/20 rounded-lg">
              <h3 className="text-[#FF4C1A] font-semibold mb-2">¿Problemas con tu pedido?</h3>
              <p className="text-gray-400 text-sm">
                Si tienes problemas con una compra, incluye tu email de registro y el ID de la transacción en tu mensaje.
              </p>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Envíanos un mensaje</h2>           
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-400 mb-2">
                  Nombre completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  maxLength={100}
                  className={getFieldClassName('nombre')}
                  disabled={loading}/>
                <div className="text-sm text-gray-400 mt-1">{formData.nombre.length}/100 caracteres</div>
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  Correo electrónico *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={getFieldClassName('email')}
                  disabled={loading}/>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-400 mb-2">
                  Asunto *</label>
                <input
                  type="text"
                  id="asunto"
                  name="asunto"
                  placeholder="¿Sobre qué necesitas ayuda?"
                  value={formData.asunto}
                  onChange={handleChange}
                  maxLength={200}
                  className={getFieldClassName('asunto')}
                  disabled={loading}/>
                <div className="text-sm text-gray-400 mt-1">{formData.asunto.length}/200 caracteres</div>
                {errors.asunto && <p className="text-red-500 text-sm mt-1">{errors.asunto}</p>}
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-400 mb-2">
                  Descripción del problema *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Describe tu consulta o problema con el mayor detalle posible..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="6"
                  maxLength={2000}
                  className={getFieldClassName('descripcion')}
                  disabled={loading}/>
                <div className="text-sm text-gray-400 mt-1">{formData.descripcion.length}/2000 caracteres</div>
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#FF4C1A' }}
                className="w-full text-white py-3 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FF6B3D] transition-colors !bg-[#FF4C1A]">
                {loading ? 'Enviando mensaje...' : 'Enviar mensaje'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactoForm;