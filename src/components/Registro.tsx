import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { planesMembresia, crearUsuario, activarMembresia } from '../data/database';

const Registro: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSeleccionado = searchParams.get('plan') || 'gratuita';

  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1: Información personal
    nombre: '',
    email: '',
    telefono: '',
    laboratorio: '',
    username: '',
    password: '',
    confirmPassword: '',

    // Paso 2: Información de pago
    metodoPago: 'tarjeta',
    numeroTarjeta: '',
    fechaExpiracion: '',
    cvv: '',
    nombreTitular: ''
  });

  const [plan, setPlan] = useState(planesMembresia.find(p => p.id === planSeleccionado) || planesMembresia[0]);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    title: {
      color: '#1e293b',
      fontSize: '2rem',
      fontWeight: 'bold'
    },
    progress: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '3rem'
    },
    progressStep: {
      display: 'flex',
      alignItems: 'center'
    },
    stepNumber: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#e2e8f0',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      margin: '0 1rem'
    },
    stepNumberActive: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    stepLine: {
      width: '100px',
      height: '2px',
      backgroundColor: '#e2e8f0'
    },
    formContainer: {
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
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
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const
    },
    planSummary: {
      backgroundColor: '#f0f9ff',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      marginBottom: '2rem',
      border: '1px solid #e0f2fe'
    },
    planName: {
      fontWeight: 'bold',
      color: '#0369a1',
      fontSize: '1.25rem',
      margin: '0 0 0.5rem 0'
    },
    planPrice: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#2563eb',
      margin: '0 0 1rem 0'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'space-between',
      marginTop: '2rem'
    },
    button: {
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    buttonPrimary: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#64748b',
      color: 'white'
    },
    success: {
      textAlign: 'center' as const,
      padding: '3rem'
    },
    successIcon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validarPaso1 = () => {
    return formData.nombre && formData.email && formData.laboratorio && 
           formData.username && formData.password && 
           formData.password === formData.confirmPassword;
  };

  const handleSiguiente = () => {
    if (paso === 1 && validarPaso1()) {
      setPaso(2);
    } else if (paso === 2) {
      handleFinalizar();
    }
  };

  const handleFinalizar = async () => {
    try {
      // Crear usuario
      const usuario = crearUsuario({
        username: formData.username,
        password: formData.password,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        laboratorio: formData.laboratorio,
        role: 'cliente'
      });

      // Activar membresía
      if (plan.precio > 0) {
        activarMembresia(usuario.id, plan.id, {
          metodo: formData.metodoPago
        });
      }

      setPaso(3);
      
      // Auto-login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      alert('Error en el registro: ' + error);
    }
  };

  if (paso === 3) {
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <div style={styles.success}>
            <div style={styles.successIcon}>🎉</div>
            <h2>¡Registro Exitoso!</h2>
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <p>Redirigiendo al login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Registro en DentalFlow</h1>
      </div>

      {/* Progress Bar */}
      <div style={styles.progress}>
        <div style={styles.progressStep}>
          <div style={{
            ...styles.stepNumber,
            ...(paso >= 1 ? styles.stepNumberActive : {})
          }}>1</div>
          <div style={styles.stepLine}></div>
        </div>
        <div style={styles.progressStep}>
          <div style={{
            ...styles.stepNumber,
            ...(paso >= 2 ? styles.stepNumberActive : {})
          }}>2</div>
        </div>
      </div>

      <div style={styles.formContainer}>
        {/* Resumen del Plan */}
        <div style={styles.planSummary}>
          <h3 style={styles.planName}>{plan.nombre}</h3>
          <div style={styles.planPrice}>
            ${plan.precio}
            <span style={{ fontSize: '1rem', color: '#64748b' }}>/mes</span>
          </div>
          <ul>
            {plan.caracteristicas.slice(0, 3).map((caract, idx) => (
              <li key={idx}>✓ {caract}</li>
            ))}
          </ul>
        </div>

        {paso === 1 && (
          <>
            <h3 style={{ marginBottom: '1.5rem' }}>Información Personal</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                style={styles.input}
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                style={styles.input}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                style={styles.input}
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre del Laboratorio *</label>
              <input
                type="text"
                name="laboratorio"
                style={styles.input}
                value={formData.laboratorio}
                onChange={handleInputChange}
                placeholder="Ej: Tecnodentille"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Usuario *</label>
              <input
                type="text"
                name="username"
                style={styles.input}
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nombre de usuario"
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                placeholder="Repite tu contraseña"
                required
              />
            </div>
          </>
        )}

        {paso === 2 && plan.precio > 0 && (
          <>
            <h3 style={{ marginBottom: '1.5rem' }}>Información de Pago</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Método de Pago</label>
              <select 
                name="metodoPago"
                style={styles.input}
                value={formData.metodoPago}
                onChange={handleInputChange}
              >
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Número de Tarjeta</label>
              <input
                type="text"
                name="numeroTarjeta"
                style={styles.input}
                value={formData.numeroTarjeta}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Fecha Expiración</label>
                <input
                  type="text"
                  name="fechaExpiracion"
                  style={styles.input}
                  value={formData.fechaExpiracion}
                  onChange={handleInputChange}
                  placeholder="MM/AA"
                />
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  style={styles.input}
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre del Titular</label>
              <input
                type="text"
                name="nombreTitular"
                style={styles.input}
                value={formData.nombreTitular}
                onChange={handleInputChange}
                placeholder="Como aparece en la tarjeta"
              />
            </div>

            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '1rem', 
              borderRadius: '0.375rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1' }}>
                💳 Pago seguro procesado con encriptación SSL. No almacenamos los datos de tu tarjeta.
              </p>
            </div>
          </>
        )}

        {paso === 2 && plan.precio === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>¡Plan Gratuito Activado!</h3>
            <p>Tu plan gratuito de 30 días está listo. Puedes actualizar en cualquier momento.</p>
          </div>
        )}

        <div style={styles.buttonGroup}>
          {paso > 1 && (
            <button 
              style={styles.buttonSecondary}
              onClick={() => setPaso(paso - 1)}
            >
              Atrás
            </button>
          )}
          
          <button 
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              marginLeft: 'auto'
            }}
            onClick={handleSiguiente}
            disabled={paso === 1 && !validarPaso1()}
          >
            {paso === 2 ? 'Completar Registro' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registro;