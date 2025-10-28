import React, { useState } from 'react';
import { AuthService } from '../services/authService';

interface RegistroProps {
  onBack: () => void;
  onRegistroExitoso: () => void;
}

const Registro: React.FC<RegistroProps> = ({ onBack, onRegistroExitoso }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    laboratorio: '',
    telefono: '',
    rut: ''
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setCargando(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setCargando(false);
      return;
    }

    try {
      await AuthService.registrarUsuario(
        formData.email,
        formData.password,
        formData.nombre,
        formData.laboratorio
      );
      
      alert('🎉 ¡Registro exitoso! Tienes 7 días de prueba gratuita.');
      onRegistroExitoso();
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario');
    } finally {
      setCargando(false);
    }
  };

  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    card: {
      backgroundColor: 'white',
      padding: '3rem',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '500px'
    },
    title: {
      color: '#1e293b',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    backButton: {
      backgroundColor: '#64748b',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginBottom: '2rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      color: '#1e293b',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const
    },
    button: {
      width: '100%',
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '1rem',
      opacity: 1
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    error: {
      color: '#dc2626',
      fontSize: '0.875rem',
      textAlign: 'center' as const,
      marginBottom: '1rem',
      padding: '0.5rem',
      backgroundColor: '#fef2f2',
      borderRadius: '0.375rem'
    },
    infoBox: {
      backgroundColor: '#f0f9ff',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e0f2fe',
      marginBottom: '2rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button style={styles.backButton} onClick={onBack}>
          ← Volver al Login
        </button>

        <h1 style={styles.title}>Crear Cuenta</h1>

        <div style={styles.infoBox}>
          <h3 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>🚀 Prueba Gratuita</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Regístrate y obtén <strong>7 días gratis</strong> para probar todas las funciones del sistema.
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleRegistro}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              style={styles.input}
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@laboratorio.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña *</label>
            <input
              type="password"
              name="password"
              style={styles.input}
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmar Contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              style={styles.input}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre Completo *</label>
            <input
              type="text"
              name="nombre"
              style={styles.input}
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre del Laboratorio *</label>
            <input
              type="text"
              name="laboratorio"
              style={styles.input}
              value={formData.laboratorio}
              onChange={handleChange}
              placeholder="Ej: Laboratorio Dental Pro"
              required
            />
          </div>

          <button 
            style={{
              ...styles.button,
              ...(cargando ? styles.buttonDisabled : {})
            }}
            type="submit"
            disabled={cargando}
          >
            {cargando ? 'Creando cuenta...' : '🎉 Comenzar Prueba Gratuita'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;