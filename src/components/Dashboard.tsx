import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface DashboardUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  plan?: string;
  fecha_expiracion?: string;
  suscripcion_activa?: boolean;
  laboratorio?: string;
  telefono?: string;
}

interface DashboardProps {
  user: DashboardUser;
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

  const [estadisticas, setEstadisticas] = useState({
    totalClinicas: 0,
    totalDentistas: 0,
    totalTrabajos: 0,
    trabajosPendientes: 0,
    trabajosProduccion: 0,
    trabajosTerminados: 0
  });

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredResultado, setHoveredResultado] = useState<string | null>(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);

  // Calcular días restantes
  const calcularDiasRestantes = () => {
    if (!user.fecha_expiracion) return 0;
    const expiracion = new Date(user.fecha_expiracion);
    const hoy = new Date();
    const diferencia = expiracion.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const diasRestantes = calcularDiasRestantes();
  const tieneSuscripcionActiva = user.suscripcion_activa && diasRestantes > 0;

  // Cargar estadísticas desde Supabase
  useEffect(() => {
    cargarEstadisticas();
  }, [user.id]);

  const cargarEstadisticas = async () => {
    try {
      setCargandoEstadisticas(true);

      if (user.rol === 'admin') {
        // Admin ve todo
        const [
          { count: clinicasCount },
          { count: dentistasCount },
          { count: trabajosCount },
          { count: trabajosPendientes },
          { count: trabajosProduccion },
          { count: trabajosTerminados }
        ] = await Promise.all([
          supabase.from('clinicas').select('*', { count: 'exact', head: true }),
          supabase.from('dentistas').select('*', { count: 'exact', head: true }),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }).eq('estado', 'produccion'),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }).eq('estado', 'terminado')
        ]);

        setEstadisticas({
          totalClinicas: clinicasCount || 0,
          totalDentistas: dentistasCount || 0,
          totalTrabajos: trabajosCount || 0,
          trabajosPendientes: trabajosPendientes || 0,
          trabajosProduccion: trabajosProduccion || 0,
          trabajosTerminados: trabajosTerminados || 0
        });
      } else {
        // Cliente solo ve sus datos
        const [
          { count: clinicasCount },
          { count: dentistasCount },
          { count: trabajosCount },
          { count: trabajosPendientes },
          { count: trabajosProduccion },
          { count: trabajosTerminados }
        ] = await Promise.all([
          supabase.from('clinicas').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id),
          supabase.from('dentistas').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id).eq('estado', 'pendiente'),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id).eq('estado', 'produccion'),
          supabase.from('trabajos').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id).eq('estado', 'terminado')
        ]);

        setEstadisticas({
          totalClinicas: clinicasCount || 0,
          totalDentistas: dentistasCount || 0,
          totalTrabajos: trabajosCount || 0,
          trabajosPendientes: trabajosPendientes || 0,
          trabajosProduccion: trabajosProduccion || 0,
          trabajosTerminados: trabajosTerminados || 0
        });
      }

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargandoEstadisticas(false);
    }
  };

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
      border: '1px solid #e2e8f0',
      position: 'relative' as const
    },
    userInfoTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem'
    },
    userInfoMain: {
      flex: 1
    },
    logoutButtonTop: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s',
      marginLeft: '1rem',
      '&:hover': {
        backgroundColor: '#b91c1c'
      }
    },
    userDetails: {
      backgroundColor: '#f1f5f9',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid #e2e8f0',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    userDetailItem: {
      marginBottom: '0.5rem'
    },
    userDetailLabel: {
      fontSize: '0.75rem',
      color: '#64748b',
      fontWeight: '500',
      textTransform: 'uppercase' as const,
      marginBottom: '0.25rem'
    },
    userDetailValue: {
      fontSize: '1rem',
      color: '#1e293b',
      fontWeight: '600'
    },
    planBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginLeft: '0.5rem'
    },
    planActive: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    planInactive: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    daysBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginLeft: '0.5rem',
      backgroundColor: diasRestantes > 7 ? '#10b981' : diasRestantes > 3 ? '#f59e0b' : '#ef4444',
      color: 'white'
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
    },
    loadingIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
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

  // Buscar de forma optimizada
  const handleBuscar = async (termino: string) => {
    setTerminoBusqueda(termino);
    setCargandoBusqueda(true);

    if (!termino.trim()) {
      setResultados({ pacientes: [], clinicas: [], trabajos: [] });
      setCargandoBusqueda(false);
      return;
    }

    const terminoLower = termino.toLowerCase();

    try {
      // Consultas mejoradas para Supabase
      const baseQuery = user.rol === 'admin' 
        ? {} 
        : { usuario_id: user.id };

      // 1. Buscar clínicas
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas')
        .select('*')
        .or(`nombre.ilike.%${terminoLower}%,email.ilike.%${terminoLower}%,telefono.ilike.%${terminoLower}%`)
        .eq(user.rol !== 'admin' ? 'usuario_id' : '', user.rol !== 'admin' ? user.id : '')
        .limit(10);

      // 2. Buscar trabajos (pacientes y trabajos generales)
      const { data: trabajosData, error: trabajosError } = await supabase
        .from('trabajos')
        .select(`
          *,
          clinicas (nombre, direccion),
          dentistas (nombre, especialidad),
          laboratoristas (nombre)
        `)
        .or(`paciente.ilike.%${terminoLower}%,estado.ilike.%${terminoLower}%`)
        .eq(user.rol !== 'admin' ? 'usuario_id' : '', user.rol !== 'admin' ? user.id : '')
        .limit(20);

      // Separar resultados: pacientes y trabajos
      const pacientesEncontrados = trabajosData?.filter(t => 
        t.paciente.toLowerCase().includes(terminoLower)
      ) || [];

      const trabajosEncontrados = trabajosData?.filter(t => 
        t.estado.toLowerCase().includes(terminoLower) ||
        (t.paciente.toLowerCase().includes(terminoLower) && 
         !pacientesEncontrados.some(p => p.id === t.id))
      ) || [];

      // Formatear resultados
      const resultadosFormateados = {
        clinicas: clinicasData || [],
        pacientes: pacientesEncontrados.map((p: any) => ({
          ...p,
          tipo: 'paciente',
          clinica: p.clinicas?.nombre || 'Sin clínica',
          dentista: p.dentistas?.nombre || 'Sin dentista',
          laboratorista: p.laboratoristas?.nombre || 'No asignado',
          direccionClinica: p.clinicas?.direccion || ''
        })),
        trabajos: trabajosEncontrados.map((t: any) => ({
          ...t,
          tipo: 'trabajo',
          clinica: t.clinicas?.nombre || 'Sin clínica',
          dentista: t.dentistas?.nombre || 'Sin dentista',
          laboratorista: t.laboratoristas?.nombre || 'No asignado'
        }))
      };

      // Log para depuración
      console.log('Resultados encontrados:', {
        termino,
        clinicas: resultadosFormateados.clinicas.length,
        pacientes: resultadosFormateados.pacientes.length,
        trabajos: resultadosFormateados.trabajos.length,
        datos: resultadosFormateados
      });

      setResultados(resultadosFormateados);

    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResultados({ pacientes: [], clinicas: [], trabajos: [] });
    } finally {
      setCargandoBusqueda(false);
    }
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

  const getPlanDisplayName = (plan?: string) => {
    switch (plan) {
      case 'gratuita': return 'Prueba Gratuita';
      case 'profesional': return 'Profesional';
      case 'enterprise': return 'Empresarial';
      default: return plan || 'Sin plan';
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

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onLogout();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {/* Encabezado superior con información del usuario y botón de logout */}
        <div style={styles.userInfoTop}>
          <div style={styles.userInfoMain}>
            <h1 style={styles.title}>
              Dashboard - DentalFlow Manager
              {user?.rol === 'admin' && (
                <span style={styles.adminBadge}>ADMINISTRADOR</span>
              )}
            </h1>
            <p style={styles.subtitle}>
              {user?.rol === 'admin' 
                ? 'Sistema de gestión completo - Modo Administrador' 
                : `Bienvenido, ${user?.nombre} - ${user?.laboratorio || 'tu laboratorio'}`
              }
            </p>
          </div>
          
          <button 
            style={styles.logoutButtonTop}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Información detallada del usuario */}
        <div style={styles.userDetails}>
          <div style={styles.userDetailItem}>
            <div style={styles.userDetailLabel}>Email</div>
            <div style={styles.userDetailValue}>{user?.email}</div>
          </div>
          
          <div style={styles.userDetailItem}>
            <div style={styles.userDetailLabel}>Plan Actual</div>
            <div style={styles.userDetailValue}>
              {getPlanDisplayName(user?.plan)}
              <span style={{
                ...styles.planBadge,
                ...(tieneSuscripcionActiva ? styles.planActive : styles.planInactive)
              }}>
                {tieneSuscripcionActiva ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
          </div>
          
          <div style={styles.userDetailItem}>
            <div style={styles.userDetailLabel}>Días Restantes</div>
            <div style={styles.userDetailValue}>
              {diasRestantes > 0 ? diasRestantes : 0} días
              {diasRestantes > 0 && (
                <span style={styles.daysBadge}>
                  {diasRestantes > 7 ? '✔ OK' : diasRestantes > 3 ? '⚠ PRONTO' : '⚠ VENCIDO'}
                </span>
              )}
            </div>
          </div>
          
          {user?.laboratorio && (
            <div style={styles.userDetailItem}>
              <div style={styles.userDetailLabel}>Laboratorio</div>
              <div style={styles.userDetailValue}>🏢 {user.laboratorio}</div>
            </div>
          )}
          
          {user?.telefono && (
            <div style={styles.userDetailItem}>
              <div style={styles.userDetailLabel}>Teléfono</div>
              <div style={styles.userDetailValue}>📞 {user.telefono}</div>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div style={styles.statsGrid}>
          <div style={{textAlign: 'center'}}>
            <div style={styles.statNumber}>
              {cargandoEstadisticas ? '...' : estadisticas.totalClinicas}
            </div>
            <div style={styles.statLabel}>Clínicas</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={styles.statNumber}>
              {cargandoEstadisticas ? '...' : estadisticas.totalDentistas}
            </div>
            <div style={styles.statLabel}>Dentistas</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={styles.statNumber}>
              {cargandoEstadisticas ? '...' : estadisticas.totalTrabajos}
            </div>
            <div style={styles.statLabel}>Trabajos</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{...styles.statNumber, color: '#dc2626'}}>
              {cargandoEstadisticas ? '...' : estadisticas.trabajosPendientes}
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
            {cargandoBusqueda && <span style={{color: '#64748b', fontSize: '0.875rem', marginLeft: '1rem'}}>Buscando...</span>}
          </h3>

          {/* Resultados de Clínicas */}
          {!cargandoBusqueda && resultados.clinicas.length > 0 && (
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

          {/* Resultados de Pacientes */}
          {!cargandoBusqueda && resultados.pacientes.length > 0 && (
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
                    ${paciente.precio_total || 0}
                    {paciente.laboratorista && ` • 👨‍🔧 ${paciente.laboratorista}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resultados de Trabajos */}
          {!cargandoBusqueda && resultados.trabajos.length > 0 && (
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
                    Laboratorista: {trabajo.laboratorista} • ${trabajo.precio_total || 0}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {!cargandoBusqueda && resultados.pacientes.length === 0 && 
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
      )}
    </div>
  );
};

export default Dashboard;