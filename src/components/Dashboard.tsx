import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicas, dentistas, trabajos, servicios, laboratoristas } from '../data/database';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
  };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
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

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredResultado, setHoveredResultado] = useState<string | null>(null);

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
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '2rem',
      border: '1px solid #e2e8f0'
    },
    title: {
      color: '#1e293b',
      fontSize: '1.5rem',
      fontWeight: '600',
      margin: 0
    },
    subtitle: {
      color: '#64748b',
      marginTop: '0.5rem'
    },
    userInfo: {
      backgroundColor: '#f1f5f9',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginTop: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #e2e8f0'
    },
    userRole: {
      backgroundColor: '#475569',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    adminBadge: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginLeft: '0.5rem'
    },
    searchContainer: {
      marginTop: '1.5rem',
      position: 'relative' as const
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      paddingLeft: '2.5rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const,
      backgroundColor: '#f8fafc'
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b'
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      borderLeft: '4px solid #475569',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: '1px solid #e2e8f0'
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    cardTitle: {
      color: '#1e293b',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0 0 1rem 0'
    },
    cardContent: {
      color: '#64748b',
      margin: '0 0 1rem 0',
      lineHeight: '1.5'
    },
    button: {
      backgroundColor: '#475569',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginTop: '1rem',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s'
    },
    logoutButton: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginTop: '2rem',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s'
    },
    resultadosContainer: {
      marginTop: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      padding: '1.5rem',
      border: '1px solid #e2e8f0'
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
      transition: 'background-color 0.2s',
      backgroundColor: '#f8fafc'
    },
    resultadoItemHover: {
      backgroundColor: '#f1f5f9'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500',
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
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#64748b',
      marginTop: '0.25rem'
    }
  };

  // MÓDULOS PARA ADMINISTRADOR
  const modulesAdmin = [
    {
      id: 'clinicas',
      title: '🏥 Clínicas y Dentistas',
      description: 'Gestiona todas las clínicas dentales y odontólogos del sistema.',
      path: '/clinicas'
    },
    {
      id: 'crear-trabajo',
      title: '📋 Crear Lista de Trabajo',
      description: 'Crea nuevos trabajos seleccionando clínica, dentista y servicios.',
      path: '/crear-trabajo'
    },
    {
      id: 'trabajos-proceso',
      title: '🔧 Trabajos en Proceso',
      description: 'Control y seguimiento de todos los trabajos dentales en producción.',
      path: '/trabajos'
    },
    {
      id: 'laboratoristas',
      title: '👨‍🔧 Laboratoristas',
      description: 'Gestiona todos los técnicos y laboratoristas del sistema.',
      path: '/laboratoristas'
    },
    {
      id: 'precios',
      title: '💰 Lista de Precios',
      description: 'Configura precios base y personalizados por clínica/dentista.',
      path: '/precios'
    },
    {
      id: 'reportes',
      title: '📊 Reportes',
      description: 'Genera reportes de trabajos, ingresos y productividad.',
      path: '/reportes'
    },
    {
      id: 'admin',
      title: '👑 Panel de Administración',
      description: 'Gestiona usuarios, membresías y ve estadísticas del sistema.',
      path: '/admin'
    },
    {
      id: 'opciones-cuenta',
      title: '⚙️ Opciones del Sistema',
      description: 'Configura la información general del sistema y parámetros.',
      path: '/configuracion'
    }
  ];

  // MÓDULOS PARA CLIENTES NORMALES
  const modulesCliente = [
    {
      id: 'clinicas',
      title: '🏥 Mis Clínicas y Dentistas',
      description: 'Gestiona tus clínicas dentales y odontólogos asociados.',
      path: '/clinicas'
    },
    {
      id: 'crear-trabajo',
      title: '📋 Crear Lista de Trabajo',
      description: 'Crea nuevos trabajos seleccionando clínica, dentista y servicios.',
      path: '/crear-trabajo'
    },
    {
      id: 'trabajos-proceso',
      title: '🔧 Mis Trabajos en Proceso',
      description: 'Control y seguimiento de tus trabajos dentales en producción.',
      path: '/trabajos'
    },
    {
      id: 'laboratoristas',
      title: '👨‍🔧 Mis Laboratoristas',
      description: 'Gestiona los técnicos y laboratoristas de tu laboratorio.',
      path: '/laboratoristas'
    },
    {
      id: 'precios',
      title: '💰 Mi Lista de Precios',
      description: 'Configura tus precios base y personalizados.',
      path: '/precios'
    },
    {
      id: 'reportes',
      title: '📊 Mis Reportes',
      description: 'Genera reportes de tus trabajos, ingresos y productividad.',
      path: '/reportes'
    },
    {
      id: 'opciones-cuenta',
      title: '⚙️ Opciones de la Cuenta',
      description: 'Configura la información de tu laboratorio, logo y porcentajes.',
      path: '/configuracion'
    }
  ];

  // Elegir los módulos según el rol
  const modules = user?.rol === 'admin' ? modulesAdmin : modulesCliente;

  // Estadísticas para mostrar en el dashboard
  const estadisticas = {
    totalClinicas: clinicas.length,
    totalDentistas: dentistas.length,
    totalTrabajos: trabajos.length,
    trabajosPendientes: trabajos.filter(t => t.estado === 'pendiente').length,
    trabajosProduccion: trabajos.filter(t => t.estado === 'produccion').length,
    trabajosTerminados: trabajos.filter(t => t.estado === 'terminado').length
  };

  const handleBuscar = (termino: string) => {
    setTerminoBusqueda(termino);

    if (!termino.trim()) {
      setResultados({ pacientes: [], clinicas: [], trabajos: [] });
      return;
    }

    const terminoLower = termino.toLowerCase();

    // Buscar en pacientes
    const pacientesEncontrados = trabajos.filter((trabajo: any) =>
      trabajo.paciente.toLowerCase().includes(terminoLower)
    ).map((trabajo: any) => ({
      ...trabajo,
      tipo: 'paciente',
      clinica: clinicas.find(c => c.id === trabajo.clinicaId)?.nombre,
      dentista: dentistas.find(d => d.id === trabajo.dentistaId)?.nombre,
      laboratorista: laboratoristas.find(l => l.id === trabajo.laboratoristaId)?.nombre
    }));

    // Buscar en clínicas
    const clinicasEncontradas = clinicas.filter((clinica: any) =>
      clinica.nombre.toLowerCase().includes(terminoLower) ||
      clinica.direccion.toLowerCase().includes(terminoLower) ||
      clinica.email.toLowerCase().includes(terminoLower)
    );

    // Buscar en trabajos (por estado o servicios)
    const trabajosEncontrados = trabajos.filter((trabajo: any) =>
      trabajo.estado.toLowerCase().includes(terminoLower) ||
      trabajo.servicios.some((servicioTrabajo: any) => {
        const servicio = servicios.find(s => s.id === servicioTrabajo.servicioId);
        return servicio?.nombre.toLowerCase().includes(terminoLower);
      })
    ).map((trabajo: any) => ({
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
      navigate('/trabajos');
    } else if (tipo === 'clinica') {
      navigate('/clinicas');
    }
  };

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  // 🔧 FUNCIÓN CORREGIDA PARA CERRAR SESIÓN
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('dentalflow-user');
      onLogout(); // Esto debería redirigir al landing page
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Dashboard - DentalFlow Manager
            {user?.rol === 'admin' && (
              <span style={styles.adminBadge}>ADMINISTRADOR</span>
            )}
          </h1>
          <p style={styles.subtitle}>
            {user?.rol === 'admin' 
              ? 'Sistema de gestión completo - Modo Administrador' 
              : `Sistema de gestión para ${user?.nombre || 'tu laboratorio'}`
            }
          </p>
        </div>

        {/* Información del usuario */}
        <div style={styles.userInfo}>
          <div>
             <strong>👤 {user?.nombre}</strong>
            <div style={{color: '#64748b', fontSize: '0.875rem'}}>
             {user?.email}
            </div>
          </div>
          <div style={styles.userRole}>
            {user?.rol === 'admin' ? '👑 ADMINISTRADOR' : '👤 CLIENTE'}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div style={styles.statsGrid}>
          <div style={{textAlign: 'center'}}>
            <div style={styles.statNumber}>
              {estadisticas.totalClinicas}
            </div>
            <div style={styles.statLabel}>Clínicas</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={styles.statNumber}>
              {estadisticas.totalDentistas}
            </div>
            <div style={styles.statLabel}>Dentistas</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={styles.statNumber}>
              {estadisticas.totalTrabajos}
            </div>
            <div style={styles.statLabel}>Trabajos</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{...styles.statNumber, color: '#dc2626'}}>
              {estadisticas.trabajosPendientes}
            </div>
            <div style={styles.statLabel}>Pendientes</div>
          </div>
        </div>

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
              {resultados.pacientes.map((paciente: any, index: number) => (
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
              {resultados.clinicas.map((clinica: any, index: number) => (
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
              {resultados.trabajos.map((trabajo: any, index: number) => (
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
                  ...(hoveredCard === module.id ? styles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(module.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleModuleClick(module.path)}
              >
                <h3 style={styles.cardTitle}>{module.title}</h3>
                <p style={styles.cardContent}>{module.description}</p>
                <button 
                  style={styles.button}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModuleClick(module.path);
                  }}
                >
                  {module.id === 'clinicas' && (user?.rol === 'admin' ? 'Gestionar Clínicas' : 'Mis Clínicas')}
                  {module.id === 'crear-trabajo' && 'Crear Trabajo'}
                  {module.id === 'trabajos-proceso' && (user?.rol === 'admin' ? 'Ver Trabajos' : 'Mis Trabajos')}
                  {module.id === 'laboratoristas' && (user?.rol === 'admin' ? 'Gestionar Técnicos' : 'Mis Laboratoristas')}
                  {module.id === 'precios' && (user?.rol === 'admin' ? 'Gestionar Precios' : 'Mis Precios')}
                  {module.id === 'reportes' && (user?.rol === 'admin' ? 'Ver Reportes' : 'Mis Reportes')}
                  {module.id === 'admin' && 'Panel de Admin'}
                  {module.id === 'opciones-cuenta' && (user?.rol === 'admin' ? 'Configurar Sistema' : 'Configurar Cuenta')}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button 
              style={styles.logoutButton}
              onClick={handleLogout} // ✅ USAR LA FUNCIÓN CORREGIDA
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