import React, { useState } from 'react';
import { clinicas, dentistas, trabajos, servicios, laboratoristas } from '../data/database';

interface DashboardProps {
  onNavigate: (module: string) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLogout }) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultados, setResultados] = useState<{
    pacientes: any[];
    clinicas: any[];
    trabajos: any[];
  }>({
    pacientes: [],
    clinicas: [],
    trabajos: []
  });

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    },
    header: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    title: {
      color: '#1e293b',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0
    },
    subtitle: {
      color: '#64748b',
      marginTop: '0.5rem'
    },
    searchContainer: {
      marginTop: '1.5rem',
      position: 'relative' as const
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      paddingLeft: '2.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem'
    },
    card: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: '4px solid #2563eb',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    cardTitle: {
      color: '#1e293b',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0 0 1rem 0'
    },
    cardContent: {
      color: '#64748b',
      margin: '0 0 1rem 0'
    },
    button: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginTop: '1rem'
    },
    logoutButton: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginTop: '2rem'
    },
    resultadosContainer: {
      marginTop: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '1.5rem'
    },
    resultadoSection: {
      marginBottom: '1.5rem'
    },
    resultadoTitle: {
      color: '#374151',
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '0.75rem'
    },
    resultadoItem: {
      padding: '0.75rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.375rem',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    resultadoItemHover: {
      backgroundColor: '#f3f4f6'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginLeft: '0.5rem'
    },
    badgePendiente: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    badgeProduccion: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    badgeTerminado: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    badgeEntregado: {
      backgroundColor: '#e5e7eb',
      color: '#374151'
    }
  };

  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const [hoveredResultado, setHoveredResultado] = React.useState<string | null>(null);

  const modules = [
    {
      id: 'clinicas',
      title: '🏥 Clínicas y Dentistas',
      description: 'Gestiona las clínicas dentales y odontólogos asociados a tu laboratorio.',
      color: '#2563eb'
    },
    {
      id: 'crear-trabajo',
      title: '📋 Crear Lista de Trabajo',
      description: 'Crea nuevos trabajos seleccionando clínica, dentista y servicios.',
      color: '#06b6d4'
    },
    {
      id: 'trabajos-proceso',
      title: '🔧 Trabajos en Proceso',
      description: 'Control y seguimiento de trabajos dentales en producción.',
      color: '#10b981'
    },
    {
      id: 'laboratoristas',
      title: '👨‍🔧 Laboratoristas',
      description: 'Gestiona los técnicos y laboratoristas de tu laboratorio.',
      color: '#f97316'
    },
    {
      id: 'precios',
      title: '💰 Lista de Precios',
      description: 'Configura precios base y personalizados por clínica/dentista.',
      color: '#8b5cf6'
    },
    {
      id: 'reportes',
      title: '📊 Reportes',
      description: 'Genera reportes de trabajos, ingresos y productividad.',
      color: '#f59e0b'
    }, // <- AQUÍ FALTABA LA COMA - línea 202
    {
      id: 'opciones-cuenta',
      title: '⚙️ Opciones de la Cuenta',
      description: 'Configura la información de tu laboratorio, logo y porcentajes.',
      color: '#6b7280'
    }
  ];

  const handleBuscar = (termino: string) => {
    setTerminoBusqueda(termino);

    if (!termino.trim()) {
      setResultados({ pacientes: [], clinicas: [], trabajos: [] });
      return;
    }

    const terminoLower = termino.toLowerCase();

    // Buscar en pacientes
    const pacientesEncontrados = trabajos.filter(trabajo =>
      trabajo.paciente.toLowerCase().includes(terminoLower)
    ).map(trabajo => ({
      ...trabajo,
      tipo: 'paciente',
      clinica: clinicas.find(c => c.id === trabajo.clinicaId)?.nombre,
      dentista: dentistas.find(d => d.id === trabajo.dentistaId)?.nombre,
      laboratorista: laboratoristas.find(l => l.id === trabajo.laboratoristaId)?.nombre
    }));

    // Buscar en clínicas
    const clinicasEncontradas = clinicas.filter(clinica =>
      clinica.nombre.toLowerCase().includes(terminoLower) ||
      clinica.direccion.toLowerCase().includes(terminoLower) ||
      clinica.email.toLowerCase().includes(terminoLower)
    );

    // Buscar en trabajos (por estado o servicios)
    const trabajosEncontrados = trabajos.filter(trabajo =>
      trabajo.estado.toLowerCase().includes(terminoLower) ||
      trabajo.servicios.some(servicioTrabajo => {
        const servicio = servicios.find(s => s.id === servicioTrabajo.servicioId);
        return servicio?.nombre.toLowerCase().includes(terminoLower);
      })
    ).map(trabajo => ({
      ...trabajo,
      tipo: 'trabajo',
      clinica: clinicas.find(c => c.id === trabajo.clinicaId)?.nombre,
      dentista: dentistas.find(d => d.id === trabajo.dentistaId)?.nombre,
      laboratorista: laboratoristas.find(l => l.id === trabajo.laboratoristaId)?.nombre
    }));

    setResultados({
      pacientes: pacientesEncontrados,
      clinicas: clinicasEncontradas,
      trabajos: trabajosEncontrados
    });
  };

  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { ...styles.badge, ...styles.badgePendiente };
      case 'produccion':
        return { ...styles.badge, ...styles.badgeProduccion };
      case 'terminado':
        return { ...styles.badge, ...styles.badgeTerminado };
      case 'entregado':
        return { ...styles.badge, ...styles.badgeEntregado };
      default:
        return { ...styles.badge, ...styles.badgePendiente };
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'produccion': return 'En Producción';
      case 'terminado': return 'Terminado';
      case 'entregado': return 'Entregado';
      default: return estado;
    }
  };

  const handleResultadoClick = (tipo: string, item: any) => {
    if (tipo === 'paciente' || tipo === 'trabajo') {
      onNavigate('trabajos-proceso');
    } else if (tipo === 'clinica') {
      onNavigate('clinicas');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard - DentalFlow Manager</h1>
        <p style={styles.subtitle}>Sistema de gestión para laboratorio dental</p>

        {/* 🔍 BUSCADOR GLOBAL */}
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}>🔍</div>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Buscar pacientes, clínicas, trabajos, servicios..."
            value={terminoBusqueda}
            onChange={(e) => handleBuscar(e.target.value)}
          />
        </div>
      </div>

      {/* MOSTRAR RESULTADOS DE BÚSQUEDA SI HAY TÉRMINO */}
      {terminoBusqueda.trim() && (
        <div style={styles.resultadosContainer}>
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
            Resultados para: "{terminoBusqueda}"
          </h3>

          {/* Resultados de Pacientes */}
          {resultados.pacientes.length > 0 && (
            <div style={styles.resultadoSection}>
              <h4 style={styles.resultadoTitle}>👤 Pacientes ({resultados.pacientes.length})</h4>
              {resultados.pacientes.map((paciente, index) => (
                <div
                  key={`paciente-${index}`}
                  style={{
                    ...styles.resultadoItem,
                    ...(hoveredResultado === `paciente-${index}` ? styles.resultadoItemHover : {})
                  }}
                  onMouseEnter={() => setHoveredResultado(`paciente-${index}`)}
                  onMouseLeave={() => setHoveredResultado(null)}
                  onClick={() => handleResultadoClick('paciente', paciente)}
                >
                  <div>
                    <strong>{paciente.paciente}</strong>
                    <span style={getBadgeStyle(paciente.estado)}>
                      {getEstadoText(paciente.estado)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {paciente.clinica} • {paciente.dentista}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {paciente.servicios.length} servicio(s) • ${paciente.precioTotal}
                    {paciente.laboratorista && ` • 👨‍🔧 ${paciente.laboratorista}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resultados de Clínicas */}
          {resultados.clinicas.length > 0 && (
            <div style={styles.resultadoSection}>
              <h4 style={styles.resultadoTitle}>🏥 Clínicas ({resultados.clinicas.length})</h4>
              {resultados.clinicas.map((clinica, index) => (
                <div
                  key={`clinica-${index}`}
                  style={{
                    ...styles.resultadoItem,
                    ...(hoveredResultado === `clinica-${index}` ? styles.resultadoItemHover : {})
                  }}
                  onMouseEnter={() => setHoveredResultado(`clinica-${index}`)}
                  onMouseLeave={() => setHoveredResultado(null)}
                  onClick={() => handleResultadoClick('clinica', clinica)}
                >
                  <div>
                    <strong>{clinica.nombre}</strong>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {clinica.direccion}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {clinica.telefono} • {clinica.email}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resultados de Trabajos */}
          {resultados.trabajos.length > 0 && (
            <div style={styles.resultadoSection}>
              <h4 style={styles.resultadoTitle}>🔧 Trabajos ({resultados.trabajos.length})</h4>
              {resultados.trabajos.map((trabajo, index) => (
                <div
                  key={`trabajo-${index}`}
                  style={{
                    ...styles.resultadoItem,
                    ...(hoveredResultado === `trabajo-${index}` ? styles.resultadoItemHover : {})
                  }}
                  onMouseEnter={() => setHoveredResultado(`trabajo-${index}`)}
                  onMouseLeave={() => setHoveredResultado(null)}
                  onClick={() => handleResultadoClick('trabajo', trabajo)}
                >
                  <div>
                    <strong>{trabajo.paciente}</strong>
                    <span style={getBadgeStyle(trabajo.estado)}>
                      {getEstadoText(trabajo.estado)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {trabajo.clinica} • {trabajo.dentista}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Laboratorista: {trabajo.laboratorista || 'No asignado'} • ${trabajo.precioTotal}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {resultados.pacientes.length === 0 && 
           resultados.clinicas.length === 0 && 
           resultados.trabajos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No se encontraron resultados para "{terminoBusqueda}"
            </div>
          )}
        </div>
      )}

      {/* MÓDULOS DEL SISTEMA (solo se muestran cuando no hay búsqueda activa) */}
      {!terminoBusqueda.trim() && (
        <>
          <div style={styles.grid}>
            {modules.map(module => (
              <div
                key={module.id}
                style={{
                  ...styles.card,
                  borderLeft: `4px solid ${module.color}`,
                  ...(hoveredCard === module.id ? styles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(module.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onNavigate(module.id)}
              >
                <h3 style={styles.cardTitle}>{module.title}</h3>
                <p style={styles.cardContent}>{module.description}</p>
                <button 
                  style={{
                    ...styles.button,
                    backgroundColor: module.color
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(module.id);
                  }}
                >
                  {module.id === 'clinicas' && 'Gestionar Clínicas'}
                  {module.id === 'crear-trabajo' && 'Crear Trabajo'}
                  {module.id === 'trabajos-proceso' && 'Ver Trabajos'}
                  {module.id === 'laboratoristas' && 'Gestionar Técnicos'}
                  {module.id === 'precios' && 'Gestionar Precios'}
                  {module.id === 'reportes' && 'Ver Reportes'}
                  {module.id === 'opciones-cuenta' && 'Configurar Cuenta'} {/* <- NUEVO BOTÓN */}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button 
              style={styles.logoutButton}
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                  onLogout();
                }
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;