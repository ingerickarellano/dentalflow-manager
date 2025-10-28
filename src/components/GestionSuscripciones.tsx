import React, { useState, useEffect } from 'react';
import { SuscripcionUsuario, suscripciones, planesSuscripcion, Pago, pagos } from '../data/database';

interface GestionSuscripcionesProps {
  onBack: () => void;
}

const GestionSuscripciones: React.FC<GestionSuscripcionesProps> = ({ onBack }) => {
  const [suscripcionesActivas, setSuscripcionesActivas] = useState<SuscripcionUsuario[]>([]);

  useEffect(() => {
    // Filtrar suscripciones activas
    const activas = suscripciones.filter(sub => 
      sub.estado === 'activa' && new Date(sub.fechaExpiracion) > new Date()
    );
    setSuscripcionesActivas(activas);
  }, []);

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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center' as const
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#2563eb',
      margin: '0.5rem 0'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.875rem'
    },
    tabla: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      overflow: 'hidden' as const,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    th: {
      backgroundColor: '#f1f5f9',
      padding: '1rem',
      textAlign: 'left' as const,
      fontWeight: '600',
      color: '#475569',
      borderBottom: '1px solid #e2e8f0'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #e2e8f0',
      color: '#475569'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    badgeActiva: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    badgeExpirada: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    acciones: {
      display: 'flex',
      gap: '0.5rem'
    },
    button: {
      padding: '0.375rem 0.75rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.75rem'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    buttonWarning: {
      backgroundColor: '#f59e0b',
      color: 'white'
    }
  };

  const renovarSuscripcion = (suscripcionId: string) => {
    alert(`🔄 Renovando suscripción ${suscripcionId}...`);
    // Lógica de renovación
  };

  const cancelarSuscripcion = (suscripcionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
      alert(`❌ Suscripción ${suscripcionId} cancelada`);
      // Lógica de cancelación
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>📊 Gestión de Suscripciones</h1>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Suscripciones Activas</div>
          <div style={styles.statNumber}>{suscripcionesActivas.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Ingresos Mensuales</div>
          <div style={{...styles.statNumber, color: '#10b981'}}>
            ${pagos.reduce((sum, pago) => sum + pago.monto, 0).toLocaleString()}
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Próximas a Vencer</div>
          <div style={{...styles.statNumber, color: '#f59e0b'}}>
            {suscripciones.filter(sub => {
              const diasRestantes = Math.ceil(
                (new Date(sub.fechaExpiracion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return diasRestantes <= 30 && sub.estado === 'activa';
            }).length}
          </div>
        </div>
      </div>

      {/* Tabla de Suscripciones */}
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.tabla}>
          <thead>
            <tr>
              <th style={styles.th}>Usuario</th>
              <th style={styles.th}>Plan</th>
              <th style={styles.th}>Fecha Inicio</th>
              <th style={styles.th}>Fecha Expiración</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suscripciones.map(suscripcion => {
              const plan = planesSuscripcion.find(p => p.id === suscripcion.planId);
              const diasRestantes = Math.ceil(
                (new Date(suscripcion.fechaExpiracion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <tr key={suscripcion.id}>
                  <td style={styles.td}>{suscripcion.usuarioId}</td>
                  <td style={styles.td}>{plan?.nombre}</td>
                  <td style={styles.td}>{suscripcion.fechaInicio}</td>
                  <td style={styles.td}>
                    {suscripcion.fechaExpiracion}
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Expirada'}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(suscripcion.estado === 'activa' ? styles.badgeActiva : styles.badgeExpirada)
                    }}>
                      {suscripcion.estado}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.acciones}>
                      <button
                        style={{...styles.button, ...styles.buttonSuccess}}
                        onClick={() => renovarSuscripcion(suscripcion.id)}
                      >
                        Renovar
                      </button>
                      <button
                        style={{...styles.button, ...styles.buttonWarning}}
                        onClick={() => cancelarSuscripcion(suscripcion.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionSuscripciones;