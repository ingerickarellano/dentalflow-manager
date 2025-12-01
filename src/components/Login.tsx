import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Verificar si ya está logueado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          nombre: session.user.user_metadata?.nombre || session.user.email!.split('@')[0],
          rol: session.user.user_metadata?.rol || 'cliente'
        };
        onLogin(userData);
        navigate('/dashboard', { replace: true });
      }
    };

    checkSession();
  }, [navigate, onLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw error;

      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email!,
          nombre: data.user.user_metadata?.nombre || data.user.email!.split('@')[0],
          rol: data.user.user_metadata?.rol || 'cliente'
        };
        
        console.log('✅ Login exitoso:', userData.nombre);
        onLogin(userData);
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('❌ Error login:', error);
      setError(error.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  const handleRecovery = async () => {
    if (!email.trim()) {
      setError('Por favor ingresa tu email para recuperar la contraseña');
      return;
    }

    try {
      setCargando(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert('Se ha enviado un enlace de recuperación a tu email');
      navigate('/recuperacion');
    } catch (error: any) {
      setError(error.message || 'Error al enviar el email de recuperación');
    } finally {
      setCargando(false);
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
      transition: 'background-color 0.2s',
      opacity: 1
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    buttonHover: {
      backgroundColor: '#1d4ed8'
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
    },
    registerSection: {
      textAlign: 'center' as const,
      marginTop: '1.5rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb'
    },
    registerText: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
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
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{...styles.input, ...(error ? styles.inputError : {})}}
              placeholder="tu@email.com"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => e.target.style.boxShadow = ''}
              required
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
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(cargando ? styles.buttonDisabled : {})
            }}
            onMouseOver={(e) => !cargando && Object.assign(e.currentTarget.style, styles.buttonHover)}
            onMouseOut={(e) => !cargando && (e.currentTarget.style.backgroundColor = '#2563eb')}
            disabled={cargando}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Enlace de recuperación de cuenta */}
        <div style={styles.recoveryLink}>
          <a 
            style={styles.link}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.linkHover)}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            onClick={handleRecovery}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Sección de registro */}
        <div style={styles.registerSection}>
          <p style={styles.registerText}>¿No tienes una cuenta?</p>
          <a 
            style={styles.link}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.linkHover)}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            onClick={() => navigate('/registro')}
          >
            Crear cuenta nueva
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;