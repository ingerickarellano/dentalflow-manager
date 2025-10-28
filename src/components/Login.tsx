import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Base de datos temporal de usuarios
const users = [
  { username: 'admin', password: 'admin123', name: 'Administrador' },
  { username: 'tecnico', password: 'tecnico123', name: 'Técnico Dental' },
  { username: 'erick', password: 'dental2024', name: 'Erick' }
];

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Verificar si ya está logueado
  useEffect(() => {
    const savedUser = localStorage.getItem('dentalflow-user');
    if (savedUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Verificar credenciales
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      console.log('✅ Login exitoso:', user.name);
      onLogin(user);
    } else {
      setError('Usuario o contraseña incorrectos');
      console.log('❌ Login fallido');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    form: {
      background: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '384px'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    title: {
      color: '#2563eb',
      fontSize: '1.875rem',
      fontWeight: 'bold',
      margin: 0
    },
    subtitle: {
      color: '#1e293b',
      marginTop: '0.5rem'
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
    formGroup: {
      marginBottom: '1rem'
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
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const
    },
    inputError: {
      borderColor: '#dc2626'
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#2563eb',
      boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)'
    },
    button: {
      width: '100%',
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    buttonHover: {
      backgroundColor: '#1d4ed8'
    },
    usersInfo: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      color: '#64748b',
      marginBottom: '1rem'
    },
    recoveryLink: {
      textAlign: 'center' as const,
      marginTop: '1rem'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontSize: '0.875rem',
      cursor: 'pointer'
    },
    linkHover: {
      textDecoration: 'underline'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <div style={styles.header}>
          <h1 style={styles.title}>DentalFlow Manager</h1>
          <p style={styles.subtitle}>Sistema de Gestión Dental</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{...styles.input, ...(error ? styles.inputError : {})}}
              placeholder="Ingresa tu usuario"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{...styles.input, ...(error ? styles.inputError : {})}}
              placeholder="Ingresa tu contraseña"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Enlace de recuperación de cuenta */}
        <div style={styles.recoveryLink}>
          <a 
            style={styles.link}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.linkHover)}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            onClick={() => navigate('/recuperacion-cuenta')}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Información de usuarios de prueba */}
        <div style={styles.usersInfo}>
          <strong>Usuarios de prueba:</strong>
          <br />👑 admin / admin123
          <br />🔧 tecnico / tecnico123  
          <br />👤 erick / dental2024
        </div>
      </div>
    </div>
  );
};

export default Login;