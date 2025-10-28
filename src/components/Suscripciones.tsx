import React, { useState } from 'react';
import { PlanSuscripcion, planesSuscripcion, SuscripcionUsuario, suscripciones } from '../data/database';

interface SuscripcionesProps {
  onBack: () => void;
}

const Suscripciones: React.FC<SuscripcionesProps> = ({ onBack }) => {
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanSuscripcion | null>(null);

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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
      marginTop: '2rem'
    },
    card: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '2px solid #e2e8f0',
      position: 'relative' as const,
      transition: 'all 0.3s ease'
    },
    cardPopular: {
      borderColor: '#3b82f6',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)',
      transform: 'scale(1.05)'
    },
    badgePopular: {
      position: 'absolute' as const,
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    planNombre: {
      color: '#1e293b',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      marginBottom: '1rem'
    },
    precio: {
      textAlign: 'center' as const,
      marginBottom: '1.5rem'
    },
    precioNumero: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    precioPeriodo: {
      color: '#64748b',
      fontSize: '1rem'
    },
    descuentoBadge: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginLeft: '0.5rem'
    },
    caracteristicas: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0'
    },
    caracteristica: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 0',
      color: '#475569'
    },
    checkIcon: {
      color: '#10b981',
      marginRight: '0.75rem'
    },
    button: {
      width: '100%',
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#f1f5f9',
      color: '#475569'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '3rem',
      borderRadius: '1rem',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto' as const
    },
    pasarelaPago: {
      marginTop: '2rem'
    },
    metodoPago: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    metodoPagoSeleccionado: {
      borderColor: '#3b82f6',
      backgroundColor: '#f0f9ff'
    }
  };

  const calcularFechaExpiracion = (duracion: string) => {
    const fecha = new Date();
    switch (duracion) {
      case 'mensual':
        fecha.setMonth(fecha.getMonth() + 1);
        break;
      case 'trimestral':
        fecha.setMonth(fecha.getMonth() + 3);
        break;
      case 'anual':
        fecha.setFullYear(fecha.getFullYear() + 1);
        break;
      case '2años':
        fecha.setFullYear(fecha.getFullYear() + 2);
        break;
      case '3años':
        fecha.setFullYear(fecha.getFullYear() + 3);
        break;
      case '4años':
        fecha.setFullYear(fecha.getFullYear() + 4);
        break;
    }
    return fecha.toISOString().split('T')[0];
  };

  const handleSeleccionarPlan = (plan: PlanSuscripcion) => {
    setPlanSeleccionado(plan);
  };

  const procesarPago = async (metodo: string) => {
    if (!planSeleccionado) return;

    // Simular procesamiento de pago
    alert(`🔄 Procesando pago de $${planSeleccionado.precio.toLocaleString()} mediante ${metodo}...`);

    // En una implementación real, aquí integrarías:
    // - Webpay (Transbank)
    // - Mercado Pago
    // - Stripe
    // - Otro gateway de pago

    setTimeout(() => {
      alert(`✅ Pago procesado exitosamente!\nTu suscripción ${planSeleccionado.nombre} está activa.`);
      setPlanSeleccionado(null);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>💎 Planes de Suscripción</h1>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
          Elige el plan que mejor se adapte a las necesidades de tu laboratorio
        </p>
      </div>

      <div style={styles.grid}>
        {planesSuscripcion.map(plan => (
          <div
            key={plan.id}
            style={{
              ...styles.card,
              ...(plan.popular ? styles.cardPopular : {})
            }}
          >
            {plan.popular && (
              <div style={styles.badgePopular}>MÁS POPULAR</div>
            )}
            
            <h3 style={styles.planNombre}>{plan.nombre}</h3>
            
            <div style={styles.precio}>
              <span style={styles.precioNumero}>
                ${plan.precio.toLocaleString()}
              </span>
              <div style={styles.precioPeriodo}>
                {plan.duracion === 'mensual' && '/mes'}
                {plan.duracion === 'trimestral' && '/trimestre'}
                {plan.duracion.includes('años') && `/${plan.duracion}`}
                {plan.duracion === 'anual' && '/año'}
                {plan.descuento > 0 && (
                  <span style={styles.descuentoBadge}>
                    {plan.descuento}% OFF
                  </span>
                )}
              </div>
            </div>

            <ul style={styles.caracteristicas}>
              {plan.caracteristicas.map((caracteristica, index) => (
                <li key={index} style={styles.caracteristica}>
                  <span style={styles.checkIcon}>✓</span>
                  {caracteristica}
                </li>
              ))}
            </ul>

            <button
              style={{
                ...styles.button,
                ...(plan.popular ? styles.buttonPrimary : styles.buttonSecondary)
              }}
              onClick={() => handleSeleccionarPlan(plan)}
            >
              {plan.popular ? '🥇 Comenzar Ahora' : 'Seleccionar Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Pago */}
      {planSeleccionado && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
              Confirmar Suscripción
            </h2>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
              <h3 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>
                {planSeleccionado.nombre}
              </h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                ${planSeleccionado.precio.toLocaleString()}
              </p>
              <p style={{ color: '#64748b' }}>
                Fecha de expiración: {calcularFechaExpiracion(planSeleccionado.duracion)}
              </p>
            </div>

            <div style={styles.pasarelaPago}>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Método de Pago</h4>
              
              <div style={{
                ...styles.metodoPago,
                ...styles.metodoPagoSeleccionado
              }}>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>💳 Webpay (Transbank)</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Pago seguro con tarjeta de crédito/débito
                </div>
              </div>

              <div style={styles.metodoPago}>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>🏦 Transferencia Bancaria</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Depósito o transferencia
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    flex: 1
                  }}
                  onClick={() => procesarPago('webpay')}
                >
                  💳 Pagar con Webpay
                </button>
                
                <button
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    flex: 1
                  }}
                  onClick={() => setPlanSeleccionado(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suscripciones;