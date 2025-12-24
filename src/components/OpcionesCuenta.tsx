import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface OpcionesCuentaProps {
  onBack: () => void;
}

interface ConfiguracionLaboratorio {
  id?: string;
  nombre_laboratorio: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  logo: string | null;
  tipo_impuesto: 'iva' | 'honorarios';
  porcentaje_impuesto: number;
  usuario_id: string;
  created_at?: string;
  updated_at?: string;
}

// Definir tipo para los estilos con propiedades CSS específicas
type Styles = {
  [key: string]: React.CSSProperties;
};

const OpcionesCuenta: React.FC<OpcionesCuentaProps> = ({ onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionLaboratorio>({
    nombre_laboratorio: 'Laboratorio Dental Pro',
    rut: '76.123.456-7',
    direccion: 'Av. Principal 123, Santiago, Chile',
    telefono: '+56 2 2345 6789',
    email: 'contacto@laboratoriodental.cl',
    logo: null,
    tipo_impuesto: 'iva',
    porcentaje_impuesto: 19,
    usuario_id: ''
  });

  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' | 'info' } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Paleta de colores coherente con Login
  const colors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textLight: '#94a3b8'
  };

  // Estilos mejorados y organizados
  const styles: Styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    mainCard: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      padding: '2.5rem',
      maxWidth: '900px',
      width: '100%',
      marginTop: '1rem',
      border: `1px solid ${colors.border}`
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2.5rem',
      paddingBottom: '1.5rem',
      borderBottom: `1px solid ${colors.border}`
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    titleSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    title: {
      color: colors.textPrimary,
      fontSize: '1.875rem',
      fontWeight: 700,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: '0.875rem',
      margin: 0
    },
    backButton: {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      padding: '0.75rem 1.25rem',
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    button: {
      backgroundColor: colors.primary,
      color: 'white',
      padding: '0.875rem 1.75rem',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    buttonSuccess: {
      backgroundColor: colors.success,
      color: 'white',
      padding: '0.875rem 1.75rem',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      padding: '0.875rem 1.75rem',
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease'
    },
    sectionCard: {
      backgroundColor: colors.background,
      padding: '2rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      border: `1px solid ${colors.border}`,
      transition: 'transform 0.2s ease'
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    formGroup: {
      marginBottom: '1.25rem'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: colors.textPrimary,
      fontSize: '0.875rem',
      fontWeight: 600,
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      fontSize: '0.95rem',
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      transition: 'all 0.2s ease'
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '2.5rem',
      border: `2px dashed ${colors.border}`,
      borderRadius: '12px',
      backgroundColor: colors.surface,
      transition: 'border-color 0.2s ease'
    },
    logoPreview: {
      width: '180px',
      height: '180px',
      objectFit: 'contain' as any,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      backgroundColor: colors.surface,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    impuestoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    impuestoCard: {
      padding: '1.75rem',
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: colors.surface
    },
    impuestoCardSelected: {
      borderColor: colors.primary,
      backgroundColor: '#f0f7ff',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.1)'
    },
    impuestoTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: colors.textPrimary
    },
    impuestoDescription: {
      fontSize: '0.875rem',
      color: colors.textSecondary,
      marginBottom: '1rem'
    },
    impuestoBadge: {
      display: 'inline-block',
      backgroundColor: colors.primary,
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 600
    },
    message: {
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    messageSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: `1px solid #a7f3d0`
    },
    messageError: {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: `1px solid #fecaca`
    },
    messageInfo: {
      backgroundColor: '#eff6ff',
      color: colors.primaryDark,
      border: `1px solid #bfdbfe`
    },
    previewCard: {
      backgroundColor: colors.background,
      padding: '2rem',
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      marginTop: '2rem'
    },
    previewContent: {
      backgroundColor: colors.surface,
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    previewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: `2px solid ${colors.border}`
    },
    previewLogo: {
      height: '70px',
      objectFit: 'contain' as any
    },
    previewInfo: {
      textAlign: 'right'
    },
    calculoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      alignItems: 'center',
      borderBottom: `1px solid ${colors.border}`
    },
    calculoTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '1.25rem 0',
      fontWeight: 'bold',
      fontSize: '1.125rem',
      alignItems: 'center',
      marginTop: '1rem'
    },
    helperText: {
      fontSize: '0.75rem',
      color: colors.textLight,
      marginTop: '0.375rem',
      fontStyle: 'italic'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '2.5rem',
      paddingTop: '2rem',
      borderTop: `1px solid ${colors.border}`
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    },
    loadingSpinner: {
      border: `3px solid ${colors.border}`,
      borderTop: `3px solid ${colors.primary}`,
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    }
  };

  // Estilos globales para animaciones
  const globalStyles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMensaje({ texto: 'No hay usuario autenticado', tipo: 'error' });
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from('configuracion_laboratorio')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfiguracion({
          ...data,
          usuario_id: user.id
        });
      } else {
        setConfiguracion(prev => ({
          ...prev,
          usuario_id: user.id
        }));
      }

    } catch (error: any) {
      console.error('Error cargando configuración:', error);
      setMensaje({ texto: 'Error al cargar la configuración', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (campo: keyof ConfiguracionLaboratorio, valor: string | number) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleTipoImpuestoChange = (tipo: 'iva' | 'honorarios') => {
    setConfiguracion(prev => ({
      ...prev,
      tipo_impuesto: tipo,
      porcentaje_impuesto: tipo === 'iva' ? 19 : 14.5
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMensaje({ texto: 'Por favor, selecciona un archivo de imagen (PNG, JPG, JPEG)', tipo: 'error' });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setMensaje({ texto: 'El archivo no debe ser mayor a 2MB', tipo: 'error' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          setConfiguracion(prev => ({
            ...prev,
            logo: result as string
          }));
          setMensaje({ texto: 'Logo cargado exitosamente', tipo: 'success' });
        }
      };
      reader.onerror = () => {
        setMensaje({ texto: 'Error al cargar el logo', tipo: 'error' });
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarLogo = () => {
    setConfiguracion(prev => ({
      ...prev,
      logo: null
    }));
    setMensaje({ texto: 'Logo eliminado', tipo: 'info' });
  };

  const guardarConfiguracion = async () => {
    setGuardando(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMensaje({ texto: 'No hay usuario autenticado', tipo: 'error' });
        setGuardando(false);
        return;
      }

      // Validaciones
      const validaciones = [
        { campo: 'nombre_laboratorio', mensaje: 'El nombre del laboratorio es obligatorio' },
        { campo: 'rut', mensaje: 'El RUT es obligatorio' },
        { campo: 'direccion', mensaje: 'La dirección es obligatoria' },
        { campo: 'telefono', mensaje: 'El teléfono es obligatorio' },
        { campo: 'email', mensaje: 'El email es obligatorio' }
      ];

      for (const validacion of validaciones) {
        const valor = configuracion[validacion.campo as keyof ConfiguracionLaboratorio];
        if (!valor || (typeof valor === 'string' && !valor.trim())) {
          setMensaje({ texto: validacion.mensaje, tipo: 'error' });
          setGuardando(false);
          return;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(configuracion.email)) {
        setMensaje({ texto: 'Por favor ingresa un email válido', tipo: 'error' });
        setGuardando(false);
        return;
      }

      const configuracionData = {
        ...configuracion,
        usuario_id: user.id,
        updated_at: new Date().toISOString()
      };

      let error: any = null;
      let data: ConfiguracionLaboratorio[] | null = null;

      if (configuracion.id) {
        const result = await supabase
          .from('configuracion_laboratorio')
          .update(configuracionData)
          .eq('id', configuracion.id)
          .select();
        error = result.error;
        data = result.data;
      } else {
        const result = await supabase
          .from('configuracion_laboratorio')
          .insert([configuracionData])
          .select();
        error = result.error;
        data = result.data;
      }

      if (error) throw error;

      if (data && data.length > 0 && !configuracion.id) {
        setConfiguracion(prev => ({
          ...prev,
          id: data![0].id
        }));
      }

      setMensaje({ texto: 'Configuración guardada exitosamente', tipo: 'success' });
      
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      setMensaje({ texto: `Error al guardar la configuración: ${error.message}`, tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const resetearConfiguracion = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear toda la configuración a los valores por defecto?')) {
      const configPorDefecto = {
        nombre_laboratorio: 'Laboratorio Dental Pro',
        rut: '76.123.456-7',
        direccion: 'Av. Principal 123, Santiago, Chile',
        telefono: '+56 2 2345 6789',
        email: 'contacto@laboratoriodental.cl',
        logo: null,
        tipo_impuesto: 'iva' as const,
        porcentaje_impuesto: 19,
        usuario_id: configuracion.usuario_id
      };
      
      setConfiguracion(configPorDefecto);
      setMensaje({ texto: 'Configuración reseteada a valores por defecto', tipo: 'info' });
    }
  };

  const calcularEjemplo = () => {
    const subtotal = 100000;
    const impuesto = (subtotal * configuracion.porcentaje_impuesto) / 100;
    const total = subtotal - impuesto;
    
    return { subtotal, impuesto, total };
  };

  const ejemplo = calcularEjemplo();

  const esConfiguracionValida = 
    configuracion.nombre_laboratorio.trim() &&
    configuracion.rut.trim() &&
    configuracion.direccion.trim() &&
    configuracion.telefono.trim() &&
    configuracion.email.trim();

  if (cargando) {
    return (
      <div style={styles.container}>
        <div style={styles.mainCard}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner} />
          </div>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.container}>
        <div style={styles.mainCard}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <button 
                style={styles.backButton}
                onClick={onBack}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                <span>←</span> Volver
              </button>
              <div style={styles.titleSection}>
                <h1 style={styles.title}>
                  <span>⚙️</span>
                  Configuración del Laboratorio
                </h1>
                <p style={styles.subtitle}>
                  Personaliza la información de tu laboratorio dental
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {mensaje && (
            <div style={{
              ...styles.message,
              ...(mensaje.tipo === 'success' ? styles.messageSuccess : 
                   mensaje.tipo === 'error' ? styles.messageError : styles.messageInfo)
            }}>
              {mensaje.tipo === 'success' ? <span>✅</span> : 
               mensaje.tipo === 'error' ? <span>❌</span> : 
               <span>ℹ️</span>}
              {mensaje.texto}
            </div>
          )}

          {/* Información del Laboratorio */}
          <div 
            style={styles.sectionCard}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={styles.sectionTitle}>
              <span>🏢</span>
              Información del Laboratorio
            </h3>
            
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span>📄</span>
                  Nombre del Laboratorio *
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={configuracion.nombre_laboratorio}
                  onChange={(e) => handleInputChange('nombre_laboratorio', e.target.value)}
                  placeholder="Ej: Laboratorio Dental Pro"
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
                <div style={styles.helperText}>
                  Este nombre aparecerá en todos tus reportes
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span>📄</span>
                  RUT *
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={configuracion.rut}
                  onChange={(e) => handleInputChange('rut', e.target.value)}
                  placeholder="Ej: 76.123.456-7"
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span>📍</span>
                Dirección *
              </label>
              <input
                type="text"
                style={styles.input}
                value={configuracion.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Ej: Av. Principal 123, Santiago"
                onFocus={(e) => e.target.style.borderColor = colors.primary}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>

            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span>📱</span>
                  Teléfono *
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={configuracion.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="Ej: +56 2 2345 6789"
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span>✉️</span>
                  Email *
                </label>
                <input
                  type="email"
                  style={styles.input}
                  value={configuracion.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Ej: contacto@laboratorio.cl"
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
                <div style={styles.helperText}>
                  Para contacto en reportes y facturación
                </div>
              </div>
            </div>
          </div>

          {/* Logo del Laboratorio */}
          <div 
            style={styles.sectionCard}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={styles.sectionTitle}>
              <span>🖼️</span>
              Logo del Laboratorio
            </h3>
            
            <div style={styles.logoContainer}>
              {configuracion.logo ? (
                <>
                  <img 
                    src={configuracion.logo} 
                    alt="Logo del laboratorio" 
                    style={styles.logoPreview}
                  />
                  <div style={styles.buttonGroup}>
                    <button 
                      style={styles.button}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={guardando}
                      onMouseOver={(e) => {
                        if (!guardando) {
                          e.currentTarget.style.backgroundColor = colors.primaryLight;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!guardando) {
                          e.currentTarget.style.backgroundColor = colors.primary;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <span>📁</span>
                      Cambiar Logo
                    </button>
                    <button 
                      style={styles.buttonSecondary}
                      onClick={eliminarLogo}
                      disabled={guardando}
                      onMouseOver={(e) => {
                        if (!guardando) {
                          e.currentTarget.style.backgroundColor = colors.background;
                          e.currentTarget.style.color = colors.error;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!guardando) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.textSecondary;
                        }
                      }}
                    >
                      <span>🗑️</span>
                      Eliminar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', color: colors.textSecondary }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.7 }}>🖼️</div>
                    <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>No hay logo cargado</p>
                    <p style={{ fontSize: '0.875rem' }}>Formatos: PNG, JPG, JPEG (Máx. 2MB)</p>
                  </div>
                  <button 
                    style={styles.button}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={guardando}
                    onMouseOver={(e) => {
                      if (!guardando) {
                        e.currentTarget.style.backgroundColor = colors.primaryLight;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!guardando) {
                        e.currentTarget.style.backgroundColor = colors.primary;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <span>📁</span>
                    Cargar Logo
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

          {/* Configuración de Impuestos */}
          <div 
            style={styles.sectionCard}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={styles.sectionTitle}>
              <span>💰</span>
              Configuración de Impuestos
            </h3>
            
            <div style={styles.impuestoGrid}>
              <div
                style={{
                  ...styles.impuestoCard,
                  ...(configuracion.tipo_impuesto === 'iva' ? styles.impuestoCardSelected : {})
                }}
                onClick={() => handleTipoImpuestoChange('iva')}
                onMouseOver={(e) => {
                  if (configuracion.tipo_impuesto !== 'iva') {
                    e.currentTarget.style.borderColor = colors.primaryLight;
                  }
                }}
                onMouseOut={(e) => {
                  if (configuracion.tipo_impuesto !== 'iva') {
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                <div style={styles.impuestoTitle}>IVA Empresa</div>
                <div style={styles.impuestoDescription}>
                  Régimen de empresa con retención de IVA
                </div>
                <div style={styles.impuestoBadge}>19%</div>
              </div>

              <div
                style={{
                  ...styles.impuestoCard,
                  ...(configuracion.tipo_impuesto === 'honorarios' ? styles.impuestoCardSelected : {})
                }}
                onClick={() => handleTipoImpuestoChange('honorarios')}
                onMouseOver={(e) => {
                  if (configuracion.tipo_impuesto !== 'honorarios') {
                    e.currentTarget.style.borderColor = colors.primaryLight;
                  }
                }}
                onMouseOut={(e) => {
                  if (configuracion.tipo_impuesto !== 'honorarios') {
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                <div style={styles.impuestoTitle}>Boleta Honorarios</div>
                <div style={styles.impuestoDescription}>
                  Régimen de honorarios con retención
                </div>
                <div style={styles.impuestoBadge}>14.5%</div>
              </div>
            </div>

            <div style={styles.helperText}>
              {configuracion.tipo_impuesto === 'iva' 
                ? 'Se aplicará 19% de IVA en todos los cálculos'
                : 'Se aplicará 14.5% de retención por honorarios'
              }
            </div>
          </div>

          {/* Vista Previa */}
          <div style={styles.previewCard}>
            <h3 style={styles.sectionTitle}>
              <span>👁️</span>
              Vista Previa del Reporte
            </h3>
            
            <div style={styles.previewContent}>
              <div style={styles.previewHeader}>
                <div>
                  {configuracion.logo ? (
                    <img 
                      src={configuracion.logo} 
                      alt="Logo" 
                      style={styles.previewLogo}
                    />
                  ) : (
                    <div style={{ 
                      width: '70px', 
                      height: '70px', 
                      backgroundColor: colors.background, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: '8px',
                      color: colors.textSecondary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: `1px solid ${colors.border}`
                    }}>
                      LOGO
                    </div>
                  )}
                </div>
                <div style={styles.previewInfo}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: colors.textPrimary }}>
                    {configuracion.nombre_laboratorio}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                    {configuracion.direccion}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                    {configuracion.telefono} | {configuracion.email}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.textLight, marginTop: '0.5rem' }}>
                    RUT: {configuracion.rut}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: colors.textSecondary, marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                  Ejemplo de Cálculo para $100.000:
                </h4>
                
                <div>
                  <div style={styles.calculoRow}>
                    <span style={{ color: colors.textSecondary }}>Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>${ejemplo.subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div style={styles.calculoRow}>
                    <span style={{ color: colors.textSecondary }}>
                      {configuracion.tipo_impuesto === 'iva' ? 'IVA (19%)' : 'Retención Honorarios (14.5%)'}:
                    </span>
                    <span style={{ color: colors.error, fontWeight: 600 }}>
                      -${ejemplo.impuesto.toLocaleString()}
                    </span>
                  </div>
                  
                  <div style={styles.calculoTotal}>
                    <span style={{ color: colors.textPrimary }}>TOTAL A PAGAR:</span>
                    <span style={{ color: colors.success, fontWeight: 700, fontSize: '1.25rem' }}>
                      ${ejemplo.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div style={styles.buttonGroup}>
            <button 
              style={styles.buttonSecondary}
              onClick={resetearConfiguracion}
              disabled={guardando}
              onMouseOver={(e) => {
                if (!guardando) {
                  e.currentTarget.style.backgroundColor = colors.background;
                  e.currentTarget.style.color = colors.warning;
                }
              }}
              onMouseOut={(e) => {
                if (!guardando) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
            >
              <span>🔄</span>
              Resetear
            </button>
            <button 
              style={esConfiguracionValida && !guardando ? styles.buttonSuccess : { 
                ...styles.buttonSuccess, 
                backgroundColor: colors.textLight,
                cursor: 'not-allowed'
              }}
              onClick={guardarConfiguracion}
              disabled={!esConfiguracionValida || guardando}
              onMouseOver={(e) => {
                if (!guardando && esConfiguracionValida) {
                  e.currentTarget.style.backgroundColor = '#34d399';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!guardando && esConfiguracionValida) {
                  e.currentTarget.style.backgroundColor = colors.success;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {guardando ? (
                <>
                  <div style={{ ...styles.loadingSpinner, width: '18px', height: '18px', marginRight: '0.5rem' }} />
                  Guardando...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OpcionesCuenta;