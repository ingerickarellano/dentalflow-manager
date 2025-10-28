import React, { useState, useRef } from 'react';

interface OpcionesCuentaProps {
  onBack: () => void;
}

interface ConfiguracionLaboratorio {
  nombreLaboratorio: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  logo: string | null;
  porcentajeRetencion: number;
  porcentajeHonorarios: number;
}

const OpcionesCuenta: React.FC<OpcionesCuentaProps> = ({ onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [configuracion, setConfiguracion] = useState<ConfiguracionLaboratorio>(() => {
    const saved = localStorage.getItem('dentalflow-configuracion');
    return saved ? JSON.parse(saved) : {
      nombreLaboratorio: 'Laboratorio Dental Pro',
      rut: '76.123.456-7',
      direccion: 'Av. Principal 123, Santiago, Chile',
      telefono: '+56 2 2345 6789',
      email: 'contacto@laboratoriodental.cl',
      logo: null,
      porcentajeRetencion: 19,
      porcentajeHonorarios: 14.5
    };
  });

  const [mensaje, setMensaje] = useState('');

  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      color: '#1e293b',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    backButton: {
      backgroundColor: '#64748b',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginRight: '0.5rem'
    },
    button: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    configContainer: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
      padding: '2rem',
      border: '2px dashed #d1d5db',
      borderRadius: '0.5rem',
      backgroundColor: '#f8fafc'
    },
    logoPreview: {
      width: '200px',
      height: '200px',
      objectFit: 'contain' as const,
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      backgroundColor: 'white'
    },
    porcentajesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    porcentajeCard: {
      backgroundColor: '#f0f9ff',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e0f2fe'
    },
    porcentajeTitle: {
      color: '#0369a1',
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    porcentajeValue: {
      color: '#0ea5e9',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    mensaje: {
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      textAlign: 'center' as const
    },
    mensajeSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    mensajeError: {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    previewContainer: {
      backgroundColor: '#f8fafc',
      padding: '2rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      marginTop: '2rem'
    },
    previewTitle: {
      color: '#475569',
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem'
    },
    previewContent: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    previewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #e2e8f0'
    },
    previewLogo: {
      height: '80px',
      objectFit: 'contain' as const
    },
    previewInfo: {
      textAlign: 'right' as const
    },
    previewCalculos: {
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0'
    },
    calculoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.5rem 0'
    },
    calculoTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '1rem 0',
      borderTop: '2px solid #e2e8f0',
      fontWeight: 'bold',
      fontSize: '1.125rem'
    }
  };

  const handleInputChange = (campo: keyof ConfiguracionLaboratorio, valor: string | number) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setConfiguracion(prev => ({
            ...prev,
            logo: event.target?.result as string
          }));
          setMensaje('✅ Logo cargado exitosamente');
          setTimeout(() => setMensaje(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarLogo = () => {
    setConfiguracion(prev => ({
      ...prev,
      logo: null
    }));
    setMensaje('🗑️ Logo eliminado');
    setTimeout(() => setMensaje(''), 3000);
  };

  const guardarConfiguracion = () => {
    localStorage.setItem('dentalflow-configuracion', JSON.stringify(configuracion));
    setMensaje('✅ Configuración guardada exitosamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  const calcularEjemplo = () => {
    const subtotal = 100000; // Ejemplo: $100.000
    const retencion = (subtotal * configuracion.porcentajeRetencion) / 100;
    const honorarios = (subtotal * configuracion.porcentajeHonorarios) / 100;
    const total = subtotal - retencion - honorarios;
    
    return { subtotal, retencion, honorarios, total };
  };

  const ejemplo = calcularEjemplo();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>⚙️ Opciones de la Cuenta</h1>
        </div>
        <button style={styles.buttonSuccess} onClick={guardarConfiguracion}>
          💾 Guardar Configuración
        </button>
      </div>

      {mensaje && (
        <div style={{
          ...styles.mensaje,
          ...(mensaje.includes('✅') ? styles.mensajeSuccess : styles.mensajeError)
        }}>
          {mensaje}
        </div>
      )}

      {/* Información del Laboratorio */}
      <div style={styles.configContainer}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>🏢 Información del Laboratorio</h3>
        
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre del Laboratorio *</label>
            <input
              type="text"
              style={styles.input}
              value={configuracion.nombreLaboratorio}
              onChange={(e) => handleInputChange('nombreLaboratorio', e.target.value)}
              placeholder="Ej: Laboratorio Dental Pro"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>RUT *</label>
            <input
              type="text"
              style={styles.input}
              value={configuracion.rut}
              onChange={(e) => handleInputChange('rut', e.target.value)}
              placeholder="Ej: 76.123.456-7"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Dirección *</label>
          <input
            type="text"
            style={styles.input}
            value={configuracion.direccion}
            onChange={(e) => handleInputChange('direccion', e.target.value)}
            placeholder="Ej: Av. Principal 123, Santiago"
          />
        </div>

        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Teléfono *</label>
            <input
              type="text"
              style={styles.input}
              value={configuracion.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              placeholder="Ej: +56 2 2345 6789"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              style={styles.input}
              value={configuracion.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Ej: contacto@laboratorio.cl"
            />
          </div>
        </div>
      </div>

      {/* Logo del Laboratorio */}
      <div style={styles.configContainer}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>🖼️ Logo del Laboratorio</h3>
        
        <div style={styles.logoContainer}>
          {configuracion.logo ? (
            <>
              <img 
                src={configuracion.logo} 
                alt="Logo del laboratorio" 
                style={styles.logoPreview}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  style={styles.button}
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Cambiar Logo
                </button>
                <button 
                  style={{ ...styles.button, backgroundColor: '#dc2626' }}
                  onClick={eliminarLogo}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                <p>No hay logo cargado</p>
                <p style={{ fontSize: '0.875rem' }}>Formatos: PNG, JPG (Máx. 2MB)</p>
              </div>
              <button 
                style={styles.button}
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Cargar Logo
              </button>
            </>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleLogoChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Configuración de Porcentajes */}
      <div style={styles.configContainer}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>📊 Configuración de Impuestos y Honorarios</h3>
        
        <div style={styles.porcentajesGrid}>
          <div style={styles.porcentajeCard}>
            <div style={styles.porcentajeTitle}>% Retención IVA/Impuestos</div>
            <div style={styles.porcentajeValue}>{configuracion.porcentajeRetencion}%</div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={configuracion.porcentajeRetencion}
              onChange={(e) => handleInputChange('porcentajeRetencion', parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>0%</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>30%</span>
            </div>
            <input
              type="number"
              value={configuracion.porcentajeRetencion}
              onChange={(e) => handleInputChange('porcentajeRetencion', parseFloat(e.target.value) || 0)}
              style={{ ...styles.input, marginTop: '0.5rem' }}
              min="0"
              max="30"
              step="0.5"
            />
          </div>

          <div style={styles.porcentajeCard}>
            <div style={styles.porcentajeTitle}>% Honorarios/Bonos</div>
            <div style={styles.porcentajeValue}>{configuracion.porcentajeHonorarios}%</div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={configuracion.porcentajeHonorarios}
              onChange={(e) => handleInputChange('porcentajeHonorarios', parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>0%</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>30%</span>
            </div>
            <input
              type="number"
              value={configuracion.porcentajeHonorarios}
              onChange={(e) => handleInputChange('porcentajeHonorarios', parseFloat(e.target.value) || 0)}
              style={{ ...styles.input, marginTop: '0.5rem' }}
              min="0"
              max="30"
              step="0.5"
            />
          </div>
        </div>
      </div>

      {/* Vista Previa del Reporte */}
      <div style={styles.previewContainer}>
        <h3 style={styles.previewTitle}>👁️ Vista Previa del Reporte</h3>
        
        <div style={styles.previewContent}>
          <div style={styles.previewHeader}>
            <div>
              {configuracion.logo && (
                <img 
                  src={configuracion.logo} 
                  alt="Logo" 
                  style={styles.previewLogo}
                />
              )}
            </div>
            <div style={styles.previewInfo}>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                {configuracion.nombreLaboratorio}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {configuracion.direccion}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {configuracion.telefono} | {configuracion.email}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                RUT: {configuracion.rut}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#475569', marginBottom: '1rem' }}>Ejemplo de Cálculo para $100.000:</h4>
            
            <div style={styles.previewCalculos}>
              <div style={styles.calculoRow}>
                <span>Subtotal:</span>
                <span>${ejemplo.subtotal.toLocaleString()}</span>
              </div>
              
              <div style={styles.calculoRow}>
                <span>Retención ({configuracion.porcentajeRetencion}%):</span>
                <span style={{ color: '#dc2626' }}>
                  -${ejemplo.retencion.toLocaleString()}
                </span>
              </div>
              
              <div style={styles.calculoRow}>
                <span>Honorarios ({configuracion.porcentajeHonorarios}%):</span>
                <span style={{ color: '#dc2626' }}>
                  -${ejemplo.honorarios.toLocaleString()}
                </span>
              </div>
              
              <div style={styles.calculoTotal}>
                <span>TOTAL A PAGAR:</span>
                <span style={{ color: '#059669', fontWeight: 'bold' }}>
                  ${ejemplo.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpcionesCuenta;