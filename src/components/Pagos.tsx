import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PagosProps {
  onBack: () => void;
}

interface PlanPago {
  id: string;
  nombre: string;
  precio: number;
  periodo: 'mensual' | 'anual';
  caracteristicas: string[];
  popular?: boolean;
}

// INTERFAZ AJUSTADA A TU ESTRUCTURA DE TABLA
interface SuscripcionUsuario {
  id?: string;
  usuario_id: string;
  plan_id: string;
  estado: string; // 'activa' | 'pendiente' | 'cancelada' | 'vencida'
  fecha_inicio: string;
  fecha_expiracion: string; // AQUÍ ESTÁ EL CAMBIO: fecha_expiracion no fecha_vencimiento
  metodo_pago?: string;
  transaccion_id?: string;
  // Nota: No tienes ultimo_pago, created_at, updated_at en tu tabla
}

const Pagos: React.FC<PagosProps> = ({ onBack }) => {
  const [planes] = useState<PlanPago[]>([
    {
      id: 'plan_basico',
      nombre: 'Plan Básico',
      precio: 29900,
      periodo: 'mensual',
      caracteristicas: [
        'Hasta 50 pacientes',
        '5 usuarios colaboradores',
        'Reportes básicos',
        'Soporte por email',
        'Acceso web y móvil'
      ]
    },
    {
      id: 'plan_pro',
      nombre: 'Plan Profesional',
      precio: 59900,
      periodo: 'mensual',
      caracteristicas: [
        'Pacientes ilimitados',
        '15 usuarios colaboradores',
        'Reportes avanzados',
        'Soporte prioritario',
        'Copia de seguridad automática',
        'Integración API'
      ],
      popular: true
    },
    {
      id: 'plan_empresa',
      nombre: 'Plan Empresa',
      precio: 299900,
      periodo: 'anual',
      caracteristicas: [
        'Todas las características Pro',
        'Usuarios ilimitados',
        'API personalizada',
        'Soporte 24/7',
        'Entrenamiento incluido',
        'Migración de datos',
        'SLA garantizado'
      ]
    }
  ]);

  const [suscripcion, setSuscripcion] = useState<SuscripcionUsuario | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<string>('plan_pro');
  const [cargando, setCargando] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' | 'info' } | null>(null);
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'transferencia' | null>(null);
  const [mostrarFormularioTarjeta, setMostrarFormularioTarjeta] = useState(false);

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

  // Estilos similares a OpcionesCuenta
  const styles = {
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
      maxWidth: '1200px',
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
      flexDirection: 'column' as const,
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
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    planCard: {
      padding: '2rem',
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      backgroundColor: colors.surface,
      position: 'relative' as const
    },
    planCardPopular: {
      borderColor: colors.primary,
      backgroundColor: '#f0f7ff',
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)'
    },
    popularBadge: {
      position: 'absolute' as const,
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: colors.primary,
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 600,
      whiteSpace: 'nowrap' as const
    },
    planName: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: colors.textPrimary,
      marginBottom: '1rem',
      textAlign: 'center' as const
    },
    planPrice: {
      fontSize: '2.5rem',
      fontWeight: 800,
      color: colors.primary,
      marginBottom: '0.5rem',
      textAlign: 'center' as const
    },
    planPeriod: {
      fontSize: '1rem',
      color: colors.textSecondary,
      marginBottom: '1.5rem',
      textAlign: 'center' as const
    },
    planFeatures: {
      listStyle: 'none' as const,
      padding: 0,
      marginBottom: '2rem'
    },
    planFeature: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      fontSize: '0.95rem',
      color: colors.textPrimary
    },
    featureIcon: {
      color: colors.success,
      fontSize: '1rem'
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
    metodoPagoContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    metodoPagoCard: {
      padding: '1.5rem',
      border: `2px solid ${colors.border}`,
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: colors.surface,
      textAlign: 'center' as const
    },
    metodoPagoSelected: {
      borderColor: colors.primary,
      backgroundColor: '#f0f7ff'
    },
    metodoIcon: {
      fontSize: '2rem',
      marginBottom: '1rem'
    },
    metodoNombre: {
      fontSize: '1.125rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: colors.textPrimary
    },
    formularioTarjeta: {
      backgroundColor: colors.background,
      padding: '1.5rem',
      borderRadius: '10px',
      border: `1px solid ${colors.border}`,
      marginTop: '1.5rem'
    },
    inputGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
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
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    infoCard: {
      backgroundColor: colors.background,
      padding: '2rem',
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      marginBottom: '1.5rem'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: `1px solid ${colors.border}`
    },
    infoLabel: {
      color: colors.textSecondary,
      fontWeight: 500
    },
    infoValue: {
      color: colors.textPrimary,
      fontWeight: 600
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
    cargarSuscripcion();
  }, []);

  const cargarSuscripcion = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMensaje({ texto: 'No hay usuario autenticado', tipo: 'error' });
        setCargando(false);
        return;
      }

      console.log('🔍 Buscando suscripción para usuario:', user.id);

      // Cargar suscripción del usuario desde Supabase - AJUSTADO A TU ESTRUCTURA
      const { data, error } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('⚠️ Error específico al cargar suscripción:', error.message);
        // Intentar cargar desde perfiles_usuarios como fallback
        await cargarDesdePerfil(user);
        return;
      }

      if (data) {
        console.log('✅ Suscripción encontrada:', data);
        setSuscripcion(data);
        setPlanSeleccionado(data.plan_id || 'plan_pro');
      } else {
        console.log('ℹ️ No se encontró suscripción en la tabla');
        await cargarDesdePerfil(user);
      }

    } catch (error) {
      console.error('❌ Error cargando suscripción:', error);
      setMensaje({ texto: 'Error al cargar información de suscripción', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const cargarDesdePerfil = async (user: any) => {
    try {
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles_usuarios')
        .select('suscripcion_activa, plan, fecha_expiracion')
        .eq('id', user.id)
        .single();

      if (!perfilError && perfil) {
        console.log('✅ Información de suscripción en perfil:', perfil);
        
        // Crear objeto de suscripción a partir del perfil
        const suscripcionData: SuscripcionUsuario = {
          usuario_id: user.id,
          estado: perfil.suscripcion_activa ? 'activa' : 'inactiva',
          plan_id: perfil.plan || 'gratuita',
          fecha_expiracion: perfil.fecha_expiracion || new Date().toISOString(),
          fecha_inicio: new Date().toISOString().split('T')[0]
        };
        
        setSuscripcion(suscripcionData);
        if (perfil.plan && perfil.plan !== 'gratuita') {
          setPlanSeleccionado(perfil.plan);
        }
      } else {
        setSuscripcion(null);
      }
    } catch (error) {
      console.log('⚠️ Error al cargar perfil:', error);
      setSuscripcion(null);
    }
  };

  const seleccionarPlan = (planId: string) => {
    setPlanSeleccionado(planId);
    setMensaje(null);
  };

  const seleccionarMetodoPago = (metodo: 'tarjeta' | 'transferencia') => {
    setMetodoPago(metodo);
    setMostrarFormularioTarjeta(metodo === 'tarjeta');
  };

  const procesarPago = async () => {
    if (!metodoPago) {
      setMensaje({ texto: 'Por favor selecciona un método de pago', tipo: 'error' });
      return;
    }

    setProcesandoPago(true);
    setMensaje({ texto: 'Procesando pago...', tipo: 'info' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No autenticado');
      }

      const plan = planes.find(p => p.id === planSeleccionado);
      
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      // SIMULACIÓN DE PAGO
      setTimeout(async () => {
        try {
          // Calcular fecha de vencimiento
          const fechaVencimiento = new Date();
          if (plan.periodo === 'mensual') {
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
          } else {
            fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
          }

          // Generar ID de transacción simulado
          const transaccionId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Preparar datos para la tabla suscripciones - AJUSTADO A TU ESTRUCTURA
          const suscripcionData = {
            usuario_id: user.id,
            plan_id: plan.id,
            estado: 'activa',
            fecha_inicio: new Date().toISOString(),
            fecha_expiracion: fechaVencimiento.toISOString(), // USANDO fecha_expiracion
            metodo_pago: metodoPago,
            transaccion_id: transaccionId
            // Nota: No incluimos ultimo_pago porque no existe en tu tabla
          };

          console.log('💾 Guardando suscripción:', suscripcionData);

          // Guardar en tabla suscripciones
          let error: any = null;
          
          if (suscripcion?.id) {
            // Actualizar suscripción existente
            const result = await supabase
              .from('suscripciones')
              .update(suscripcionData)
              .eq('id', suscripcion.id);
            error = result.error;
          } else {
            // Crear nueva suscripción
            const result = await supabase
              .from('suscripciones')
              .insert([suscripcionData]);
            error = result.error;
          }

          if (error) throw error;

          // Actualizar perfil del usuario
          const { error: perfilError } = await supabase
            .from('perfiles_usuarios')
            .update({
              suscripcion_activa: true,
              plan: plan.id,
              fecha_expiracion: fechaVencimiento.toISOString().split('T')[0]
            })
            .eq('id', user.id);

          if (perfilError) throw perfilError;

          setMensaje({ 
            texto: `¡Pago exitoso! Tu suscripción al plan ${plan.nombre} ha sido activada. ID de transacción: ${transaccionId}`, 
            tipo: 'success' 
          });
          
          // Recargar datos
          cargarSuscripcion();
          
        } catch (error: any) {
          console.error('❌ Error al guardar suscripción:', error);
          setMensaje({ texto: `Error al guardar suscripción: ${error.message}`, tipo: 'error' });
        } finally {
          setProcesandoPago(false);
        }
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error en pago:', error);
      setMensaje({ texto: `Error al procesar el pago: ${error.message}`, tipo: 'error' });
      setProcesandoPago(false);
    }
  };

  const cancelarSuscripcion = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar tu suscripción? Tendrás acceso hasta la fecha de vencimiento.')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !suscripcion) return;

      // Actualizar tabla suscripciones - AJUSTADO A TU ESTRUCTURA
      const { error: suscripcionError } = await supabase
        .from('suscripciones')
        .update({ 
          estado: 'cancelada'
          // Nota: No tenemos updated_at en tu tabla
        })
        .eq('usuario_id', user.id);

      if (suscripcionError) throw suscripcionError;

      // Actualizar perfil del usuario
      const { error: perfilError } = await supabase
        .from('perfiles_usuarios')
        .update({ 
          suscripcion_activa: false,
          plan: 'gratuita'
        })
        .eq('id', user.id);

      if (perfilError) throw perfilError;

      setMensaje({ texto: 'Suscripción cancelada exitosamente', tipo: 'success' });
      setSuscripcion(prev => prev ? { ...prev, estado: 'cancelada' } : null);

    } catch (error) {
      console.error('❌ Error cancelando suscripción:', error);
      setMensaje({ texto: 'Error al cancelar la suscripción', tipo: 'error' });
    }
  };

  const planSeleccionadoObj = planes.find(p => p.id === planSeleccionado);

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
                <span>←</span> Volver al Dashboard
              </button>
              <div style={styles.titleSection}>
                <h1 style={styles.title}>
                  <span>💳</span>
                  Gestión de Pagos y Suscripción
                </h1>
                <p style={styles.subtitle}>
                  Administra tu suscripción y métodos de pago
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

          {/* Información de suscripción actual */}
          {suscripcion && suscripcion.estado === 'activa' && (
            <div style={styles.infoCard}>
              <h3 style={styles.sectionTitle}>
                <span>📋</span>
                Tu Suscripción Actual
              </h3>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Plan:</span>
                <span style={styles.infoValue}>
                  {planes.find(p => p.id === suscripcion.plan_id)?.nombre || 'No especificado'}
                </span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Estado:</span>
                <span style={{
                  ...styles.infoValue,
                  color: suscripcion.estado === 'activa' ? colors.success : colors.error
                }}>
                  {suscripcion.estado === 'activa' ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Fecha de inicio:</span>
                <span style={styles.infoValue}>
                  {new Date(suscripcion.fecha_inicio).toLocaleDateString('es-CL')}
                </span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Fecha de expiración:</span>
                <span style={styles.infoValue}>
                  {new Date(suscripcion.fecha_expiracion).toLocaleDateString('es-CL')}
                </span>
              </div>
              
              {suscripcion.metodo_pago && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Método de pago:</span>
                  <span style={styles.infoValue}>
                    {suscripcion.metodo_pago === 'tarjeta' ? '💳 Tarjeta de crédito' : '🏦 Transferencia'}
                  </span>
                </div>
              )}
              
              {suscripcion.transaccion_id && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>ID de transacción:</span>
                  <span style={styles.infoValue}>
                    {suscripcion.transaccion_id}
                  </span>
                </div>
              )}
              
              <button 
                style={{
                  ...styles.button,
                  backgroundColor: colors.error,
                  marginTop: '1.5rem'
                }}
                onClick={cancelarSuscripcion}
                disabled={procesandoPago}
                onMouseOver={(e) => {
                  if (!procesandoPago) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
                onMouseOut={(e) => {
                  if (!procesandoPago) {
                    e.currentTarget.style.backgroundColor = colors.error;
                  }
                }}
              >
                <span>🚫</span>
                Cancelar Suscripción
              </button>
            </div>
          )}

          {/* Planes disponibles */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <span>📊</span>
              Planes Disponibles
            </h3>
            
            <p style={{ color: colors.textSecondary, marginBottom: '1.5rem' }}>
              Selecciona el plan que mejor se adapte a las necesidades de tu laboratorio
            </p>
            
            <div style={styles.plansGrid}>
              {planes.map(plan => (
                <div
                  key={plan.id}
                  style={{
                    ...styles.planCard,
                    ...(plan.popular ? styles.planCardPopular : {}),
                    ...(planSeleccionado === plan.id ? {
                      borderColor: colors.primary,
                      backgroundColor: '#f0f7ff'
                    } : {})
                  }}
                  onClick={() => seleccionarPlan(plan.id)}
                  onMouseOver={(e) => {
                    if (planSeleccionado !== plan.id) {
                      e.currentTarget.style.borderColor = colors.primaryLight;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (planSeleccionado !== plan.id) {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {plan.popular && (
                    <div style={styles.popularBadge}>
                      ⭐ MÁS POPULAR
                    </div>
                  )}
                  
                  <h4 style={styles.planName}>{plan.nombre}</h4>
                  <div style={styles.planPrice}>
                    ${plan.precio.toLocaleString()}
                  </div>
                  <div style={styles.planPeriod}>
                    / {plan.periodo === 'mensual' ? 'mes' : 'año'}
                  </div>
                  
                  <ul style={styles.planFeatures}>
                    {plan.caracteristicas.map((caracteristica, index) => (
                      <li key={index} style={styles.planFeature}>
                        <span style={styles.featureIcon}>✓</span>
                        {caracteristica}
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    style={{
                      ...styles.button,
                      width: '100%',
                      backgroundColor: planSeleccionado === plan.id ? colors.success : colors.primary
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      seleccionarPlan(plan.id);
                    }}
                  >
                    {planSeleccionado === plan.id ? '✅ Seleccionado' : 'Seleccionar Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Método de pago */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <span>💳</span>
              Método de Pago
            </h3>
            
            <p style={{ color: colors.textSecondary, marginBottom: '1.5rem' }}>
              Elige cómo prefieres realizar el pago
            </p>
            
            <div style={styles.metodoPagoContainer}>
              <div
                style={{
                  ...styles.metodoPagoCard,
                  ...(metodoPago === 'tarjeta' ? styles.metodoPagoSelected : {})
                }}
                onClick={() => seleccionarMetodoPago('tarjeta')}
                onMouseOver={(e) => {
                  if (metodoPago !== 'tarjeta') {
                    e.currentTarget.style.borderColor = colors.primaryLight;
                  }
                }}
                onMouseOut={(e) => {
                  if (metodoPago !== 'tarjeta') {
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                <div style={styles.metodoIcon}>💳</div>
                <div style={styles.metodoNombre}>Tarjeta de Crédito/Débito</div>
                <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                  Pago seguro con encriptación SSL
                </p>
              </div>
              
              <div
                style={{
                  ...styles.metodoPagoCard,
                  ...(metodoPago === 'transferencia' ? styles.metodoPagoSelected : {})
                }}
                onClick={() => seleccionarMetodoPago('transferencia')}
                onMouseOver={(e) => {
                  if (metodoPago !== 'transferencia') {
                    e.currentTarget.style.borderColor = colors.primaryLight;
                  }
                }}
                onMouseOut={(e) => {
                  if (metodoPago !== 'transferencia') {
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                <div style={styles.metodoIcon}>🏦</div>
                <div style={styles.metodoNombre}>Transferencia Bancaria</div>
                <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                  Datos bancarios para transferencia
                </p>
              </div>
            </div>

            {/* Formulario de tarjeta */}
            {mostrarFormularioTarjeta && (
              <div style={styles.formularioTarjeta}>
                <h4 style={{ color: colors.textPrimary, marginBottom: '1.5rem' }}>
                  Ingresa los datos de tu tarjeta
                </h4>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nombre en la tarjeta</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Ej: Juan Pérez"
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.border}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Número de tarjeta</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = colors.border}
                  />
                </div>
                
                <div style={styles.cardGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Fecha de expiración</label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="MM/AA"
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.border}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>CVV</label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="123"
                      onFocus={(e) => e.target.style.borderColor = colors.primary}
                      onBlur={(e) => e.target.style.borderColor = colors.border}
                    />
                  </div>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: colors.textLight, marginTop: '1rem' }}>
                  🔒 Tus datos están protegidos con encriptación SSL de 256 bits
                </p>
              </div>
            )}

            {/* Información de transferencia */}
            {metodoPago === 'transferencia' && (
              <div style={styles.formularioTarjeta}>
                <h4 style={{ color: colors.textPrimary, marginBottom: '1.5rem' }}>
                  Datos para transferencia
                </h4>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Banco:</span>
                  <span style={styles.infoValue}>Banco de Chile</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Tipo de cuenta:</span>
                  <span style={styles.infoValue}>Cuenta Corriente</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Número de cuenta:</span>
                  <span style={styles.infoValue}>123-45678-01</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>RUT:</span>
                  <span style={styles.infoValue}>76.123.456-7</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Razón social:</span>
                  <span style={styles.infoValue}>DentalFlow SpA</span>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: colors.textLight, marginTop: '1rem' }}>
                  ⚡ Una vez realizada la transferencia, envíanos el comprobante a soporte@dentalflow.cl
                </p>
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          {planSeleccionadoObj && (
            <div style={styles.infoCard}>
              <h3 style={styles.sectionTitle}>
                <span>🧾</span>
                Resumen del Pedido
              </h3>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Plan seleccionado:</span>
                <span style={styles.infoValue}>{planSeleccionadoObj.nombre}</span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Periodo:</span>
                <span style={styles.infoValue}>
                  {planSeleccionadoObj.periodo === 'mensual' ? 'Mensual' : 'Anual'}
                </span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Método de pago:</span>
                <span style={styles.infoValue}>
                  {metodoPago === 'tarjeta' ? 'Tarjeta de crédito/débito' : 
                   metodoPago === 'transferencia' ? 'Transferencia bancaria' : 
                   'No seleccionado'}
                </span>
              </div>
              
              <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                <span style={{ ...styles.infoLabel, fontSize: '1.125rem', fontWeight: 700 }}>
                  Total a pagar:
                </span>
                <span style={{ ...styles.infoValue, fontSize: '1.5rem', color: colors.primary, fontWeight: 800 }}>
                  ${planSeleccionadoObj.precio.toLocaleString()}
                  <span style={{ fontSize: '1rem', color: colors.textSecondary }}>
                    / {planSeleccionadoObj.periodo === 'mensual' ? 'mes' : 'año'}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div style={styles.buttonGroup}>
            <button 
              style={styles.buttonSecondary}
              onClick={onBack}
              disabled={procesandoPago}
            >
              <span>←</span>
              Cancelar
            </button>
            
            <button 
              style={planSeleccionadoObj && metodoPago && !procesandoPago ? styles.buttonSuccess : { 
                ...styles.buttonSuccess, 
                backgroundColor: colors.textLight,
                cursor: 'not-allowed'
              }}
              onClick={procesarPago}
              disabled={!planSeleccionadoObj || !metodoPago || procesandoPago}
              onMouseOver={(e) => {
                if (planSeleccionadoObj && metodoPago && !procesandoPago) {
                  e.currentTarget.style.backgroundColor = '#34d399';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (planSeleccionadoObj && metodoPago && !procesandoPago) {
                  e.currentTarget.style.backgroundColor = colors.success;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {procesandoPago ? (
                <>
                  <div style={{ ...styles.loadingSpinner, width: '18px', height: '18px', marginRight: '0.5rem' }} />
                  Procesando pago...
                </>
              ) : (
                <>
                  <span>💳</span>
                  Confirmar y Pagar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pagos;