import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface GestionTrabajosProps {
  onBack?: () => void;
}

interface Trabajo {
  id: string;
  paciente: string;
  clinica_id: string;
  dentista_id: string;
  laboratorista_id: string;
  servicios: Array<{
    servicio_id: string;
    cantidad: number;
    precio: number;
    nombre?: string;
    pieza_dental?: string;
  }>;
  estado: 'pendiente' | 'produccion' | 'terminado' | 'entregado';
  precio_total: number;
  fecha_creacion: string;
  fecha_entrega_estimada: string;
  notas: string;
  modo: 'clinica' | 'individual';
  usuario_id: string;
}

interface Clinica {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
}

interface Dentista {
  id: string;
  nombre: string;
  clinica_id: string;
  especialidad: string;
}

interface Servicio {
  id: string;
  nombre: string;
  precio_base: number;
  categoria: string;
  activo: boolean;
}

interface Laboratorista {
  id: string;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

interface Filtros {
  clinicaId: string;
  estado: string;
  mes: string;
  año: string;
  paciente: string;
  laboratoristaId: string;
  dentistaId: string;
}

const GestionTrabajos: React.FC<GestionTrabajosProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [laboratoristas, setLaboratoristas] = useState<Laboratorista[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalNotasAbierto, setModalNotasAbierto] = useState(false);
  const [trabajoEditando, setTrabajoEditando] = useState<Trabajo | null>(null);
  const [trabajoConNotas, setTrabajoConNotas] = useState<Trabajo | null>(null);
  const [nuevaNota, setNuevaNota] = useState('');
  const [cargando, setCargando] = useState(false);
  const [trabajoExpandido, setTrabajoExpandido] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    clinicaId: 'todas',
    estado: 'todos',
    mes: 'todos',
    año: 'todos',
    paciente: '',
    laboratoristaId: 'todos',
    dentistaId: 'todos'
  });

  // Estados para el formulario de creación
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState<string>('');
  const [dentistaSeleccionado, setDentistaSeleccionado] = useState<string>('');
  const [laboratoristaSeleccionado, setLaboratoristaSeleccionado] = useState<string>('');
  const [nombrePaciente, setNombrePaciente] = useState<string>('');
  const [trabajosAgregados, setTrabajosAgregados] = useState<Array<{
    id: string;
    paciente: string;
    servicio: Servicio;
    cantidad: number;
    piezaDental: string;
    precioUnitario: number;
  }>>([]);
  const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
  const [piezasDentales, setPiezasDentales] = useState<{ [key: string]: string }>({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('fija');
  const [notas, setNotas] = useState<string>('');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState<string>('');

  // Obtener años disponibles (últimos 5 años)
  const añosDisponibles = () => {
    const añoActual = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (añoActual - i).toString());
  };

  // Obtener meses disponibles
  const mesesDisponibles = [
    { valor: 'todos', nombre: 'Todos los Meses' },
    { valor: '01', nombre: 'Enero' },
    { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' },
    { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' },
    { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' },
    { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalAbierto) cerrarModal();
        if (modalEdicionAbierto) setModalEdicionAbierto(false);
        if (modalNotasAbierto) setModalNotasAbierto(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalAbierto, modalEdicionAbierto, modalNotasAbierto]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No hay usuario autenticado');
        return;
      }

      const [
        trabajosRes, 
        clinicasRes, 
        dentistasRes, 
        serviciosRes, 
        laboratoristasRes
      ] = await Promise.all([
        supabase.from('trabajos').select('*').eq('usuario_id', user.id).order('fecha_creacion', { ascending: false }),
        supabase.from('clinicas').select('*').eq('usuario_id', user.id),
        supabase.from('dentistas').select('*').eq('usuario_id', user.id),
        supabase.from('servicios').select('*').eq('usuario_id', user.id),
        supabase.from('laboratoristas').select('*').eq('usuario_id', user.id)
      ]);

      if (trabajosRes.data) setTrabajos(trabajosRes.data);
      if (clinicasRes.data) setClinicas(clinicasRes.data);
      if (dentistasRes.data) setDentistas(dentistasRes.data);
      if (serviciosRes.data) setServicios(serviciosRes.data);
      if (laboratoristasRes.data) setLaboratoristas(laboratoristasRes.data);

    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos. Por favor recarga la página.');
    } finally {
      setCargando(false);
    }
  };

  const handleVolver = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  // Filtrar trabajos
  const trabajosFiltrados = trabajos.filter(trabajo => {
    const filtroClinica = filtros.clinicaId === 'todas' || trabajo.clinica_id === filtros.clinicaId;
    const filtroEstado = filtros.estado === 'todos' || trabajo.estado === filtros.estado;
    const filtroPaciente = !filtros.paciente || trabajo.paciente.toLowerCase().includes(filtros.paciente.toLowerCase());
    const filtroLaboratorista = filtros.laboratoristaId === 'todos' || trabajo.laboratorista_id === filtros.laboratoristaId;
    const filtroDentista = filtros.dentistaId === 'todos' || trabajo.dentista_id === filtros.dentistaId;
    
    // Filtro por mes y año
    let filtroFecha = true;
    if (filtros.año !== 'todos' || filtros.mes !== 'todos') {
      const fechaTrabajo = new Date(trabajo.fecha_creacion);
      const añoTrabajo = fechaTrabajo.getFullYear().toString();
      const mesTrabajo = (fechaTrabajo.getMonth() + 1).toString().padStart(2, '0');
      
      if (filtros.año !== 'todos' && añoTrabajo !== filtros.año) {
        filtroFecha = false;
      }
      if (filtros.mes !== 'todos' && mesTrabajo !== filtros.mes) {
        filtroFecha = false;
      }
    }

    return filtroClinica && filtroEstado && filtroPaciente && filtroFecha && filtroLaboratorista && filtroDentista;
  });

  // Agrupar trabajos filtrados por clínica
  const trabajosPorClinica = trabajosFiltrados.reduce((acc, trabajo) => {
    const clinicaId = trabajo.clinica_id;
    if (!acc[clinicaId]) acc[clinicaId] = [];
    acc[clinicaId].push(trabajo);
    return acc;
  }, {} as Record<string, Trabajo[]>);

  // Estadísticas
  const estadisticas = {
    total: trabajosFiltrados.length,
    pendientes: trabajosFiltrados.filter(t => t.estado === 'pendiente').length,
    produccion: trabajosFiltrados.filter(t => t.estado === 'produccion').length,
    terminados: trabajosFiltrados.filter(t => t.estado === 'terminado').length,
    entregados: trabajosFiltrados.filter(t => t.estado === 'entregado').length,
    ingresosTotales: trabajosFiltrados.reduce((sum, t) => sum + t.precio_total, 0)
  };

  // Funciones de gestión de estados
  const cambiarEstadoTrabajo = async (trabajoId: string, nuevoEstado: string) => {
    try {
      setCargando(true);
      
      const { error } = await supabase
        .from('trabajos')
        .update({ estado: nuevoEstado })
        .eq('id', trabajoId);

      if (error) throw error;

      setTrabajos(prev => 
        prev.map(trabajo => 
          trabajo.id === trabajoId 
            ? { ...trabajo, estado: nuevoEstado as any }
            : trabajo
        )
      );

    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('❌ Error al cambiar el estado');
    } finally {
      setCargando(false);
    }
  };

  const finalizarTodosTrabajosClinica = async (clinicaId: string) => {
    const trabajosClinica = trabajos.filter(t => t.clinica_id === clinicaId && t.estado !== 'terminado' && t.estado !== 'entregado');
    
    if (trabajosClinica.length === 0) {
      alert('No hay trabajos pendientes en esta clínica');
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de que quieres marcar como TERMINADOS los ${trabajosClinica.length} trabajos pendientes de esta clínica?`
    );

    if (!confirmar) return;

    try {
      setCargando(true);
      
      const { error } = await supabase
        .from('trabajos')
        .update({ estado: 'terminado' })
        .eq('clinica_id', clinicaId)
        .in('estado', ['pendiente', 'produccion']);

      if (error) throw error;

      setTrabajos(prev => 
        prev.map(trabajo => 
          trabajo.clinica_id === clinicaId && (trabajo.estado === 'pendiente' || trabajo.estado === 'produccion')
            ? { ...trabajo, estado: 'terminado' }
            : trabajo
        )
      );

    } catch (error) {
      console.error('Error finalizando trabajos:', error);
      alert('❌ Error al finalizar los trabajos');
    } finally {
      setCargando(false);
    }
  };

  // Gestión de notas
  const abrirModalNotas = (trabajo: Trabajo) => {
    setTrabajoConNotas(trabajo);
    setNuevaNota(trabajo.notas || '');
    setModalNotasAbierto(true);
  };

  const cerrarModalNotas = () => {
    setModalNotasAbierto(false);
    setTrabajoConNotas(null);
    setNuevaNota('');
  };

  const guardarNota = async () => {
    if (!trabajoConNotas) return;

    try {
      setCargando(true);
      
      const { error } = await supabase
        .from('trabajos')
        .update({ notas: nuevaNota })
        .eq('id', trabajoConNotas.id);

      if (error) throw error;

      setTrabajos(prev => 
        prev.map(t => 
          t.id === trabajoConNotas.id 
            ? { ...t, notas: nuevaNota }
            : t
        )
      );

      cerrarModalNotas();
    } catch (error) {
      console.error('Error guardando nota:', error);
      alert('❌ Error al guardar la nota');
    } finally {
      setCargando(false);
    }
  };

  // Estilos mejorados
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '2rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2.5rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid #e2e8f0'
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    subtitle: {
      color: '#64748b',
      marginTop: '0.25rem',
      fontSize: '1rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap' as const
    },
    backButton: {
      backgroundColor: '#64748b',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    addButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buttonSecondary: {
      backgroundColor: 'white',
      color: '#3b82f6',
      padding: '0.75rem 1.5rem',
      border: '2px solid #3b82f6',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buttonWarning: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buttonDanger: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    // Filtros
    filtrosContainer: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      marginBottom: '2rem',
      border: '1px solid #e2e8f0'
    },
    filtrosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      color: '#1e293b',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      boxSizing: 'border-box' as const,
      backgroundColor: '#f8fafc',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    select: {
      width: '100%',
      padding: '0.875rem 1rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#f8fafc',
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    // Estadísticas
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      textAlign: 'center' as const,
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: '0.5rem 0',
      lineHeight: '1'
    },
    statLabel: {
      fontSize: '0.95rem',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      color: '#64748b'
    },
    // Clínicas
    clinicaSection: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    },
    clinicaHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #e2e8f0'
    },
    clinicaNombre: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    clinicaInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    contadorTrabajos: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.375rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    finalizarTodosButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.625rem 1.25rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    // Trabajos Grid
    trabajosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '1.5rem'
    },
    trabajoCard: {
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      position: 'relative' as const
    },
    trabajoCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    trabajoPaciente: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0
    },
    trabajoInfo: {
      color: '#64748b',
      fontSize: '0.875rem',
      marginBottom: '0.375rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    trabajoDetalles: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0'
    },
    servicioItem: {
      backgroundColor: '#f8fafc',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    estadoSelector: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      flexWrap: 'wrap' as const
    },
    estadoButton: {
      padding: '0.375rem 0.75rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      backgroundColor: 'white',
      color: '#475569'
    },
    estadoButtonActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    accionesContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      justifyContent: 'flex-end'
    },
    buttonSmall: {
      padding: '0.375rem 0.75rem',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    expandButton: {
      background: 'none',
      border: 'none',
      color: '#3b82f6',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginTop: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    // Estados de color
    badge: {
      padding: '0.375rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block'
    },
    badgePendiente: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '2px solid #fbbf24'
    },
    badgeProduccion: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      border: '2px solid #60a5fa'
    },
    badgeTerminado: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '2px solid #34d399'
    },
    badgeEntregado: {
      backgroundColor: '#e5e7eb',
      color: '#374151',
      border: '2px solid #9ca3af'
    },
    // Modales
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '2.5rem',
      borderRadius: '1rem',
      width: '95%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative' as const,
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #e2e8f0'
    },
    closeButton: {
      position: 'absolute' as const,
      top: '1.5rem',
      right: '1.5rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#64748b',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9',
      transition: 'all 0.2s'
    },
    // Notas
    notasContainer: {
      backgroundColor: '#fef3c7',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginTop: '1rem',
      borderLeft: '4px solid #f59e0b'
    },
    notasInput: {
      width: '100%',
      padding: '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      minHeight: '120px',
      resize: 'vertical' as const,
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    },
    // Categorías
    selectorCategorias: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap' as const
    },
    botonCategoria: {
      padding: '0.75rem 1.5rem',
      border: '2px solid #e2e8f0',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#475569',
      fontSize: '0.95rem',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    botonCategoriaActivo: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    // Servicios
    serviciosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    servicioCard: {
      backgroundColor: 'white',
      border: '2px solid #e2e8f0',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      transition: 'all 0.2s'
    },
    servicioHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    servicioNombre: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    servicioPrecio: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#10b981'
    },
    controlesServicio: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      marginTop: '0.75rem'
    },
    inputCantidad: {
      width: '80px',
      padding: '0.5rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.375rem',
      textAlign: 'center',
      fontSize: '1rem',
      fontWeight: '600'
    },
    inputPieza: {
      width: '100px',
      padding: '0.5rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.375rem',
      fontSize: '1rem'
    },
    // Lista trabajos agregados
    listaTrabajos: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      marginTop: '2rem',
      border: '2px solid #e2e8f0'
    },
    trabajoItemModal: {
      backgroundColor: 'white',
      padding: '1rem 1.25rem',
      borderRadius: '0.5rem',
      marginBottom: '0.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s'
    },
    total: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '1.25rem 0',
      borderTop: '3px solid #3b82f6',
      fontWeight: '700',
      fontSize: '1.25rem',
      marginTop: '1.5rem',
      color: '#1e293b'
    },
    // Empty state
    emptyState: {
      textAlign: 'center' as const,
      color: '#64748b',
      padding: '3rem',
      backgroundColor: '#f1f5f9',
      borderRadius: '1rem',
      border: '2px dashed #cbd5e1'
    },
    // Loading
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px'
    },
    loadingText: {
      color: '#64748b',
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    // Categorías con colores
    categoriaColors: {
      'fija': '#3b82f6',
      'removible': '#8b5cf6',
      'implantes': '#10b981',
      'ortodoncia': '#f59e0b',
      'reparaciones': '#ef4444'
    }
  };

  // Obtener texto del estado
  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '⏳ Pendiente';
      case 'produccion': return '🔧 En Producción';
      case 'terminado': return '✅ Terminado';
      case 'entregado': return '📦 Entregado';
      default: return estado;
    }
  };

  // Obtener estilo del estado
  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'pendiente': return { ...styles.badge, ...styles.badgePendiente };
      case 'produccion': return { ...styles.badge, ...styles.badgeProduccion };
      case 'terminado': return { ...styles.badge, ...styles.badgeTerminado };
      case 'entregado': return { ...styles.badge, ...styles.badgeEntregado };
      default: return { ...styles.badge, ...styles.badgePendiente };
    }
  };

  // Funciones del modal de creación
  const dentistasFiltrados = dentistas.filter(d => d.clinica_id === clinicaSeleccionada);
  const laboratoristasActivos = laboratoristas.filter(l => l.activo);
  const serviciosCategoriaActual = servicios.filter(s => 
    s.categoria === categoriaSeleccionada && s.activo
  );

  const agregarTrabajo = (servicio: Servicio) => {
    if (!nombrePaciente) {
      alert('Por favor ingresa el nombre del paciente');
      return;
    }

    const trabajo = {
      id: Date.now().toString() + Math.random(),
      paciente: nombrePaciente,
      servicio,
      cantidad: cantidades[servicio.id] || 1,
      piezaDental: piezasDentales[servicio.id] || '',
      precioUnitario: servicio.precio_base
    };

    setTrabajosAgregados([...trabajosAgregados, trabajo]);
    setCantidades(prev => ({ ...prev, [servicio.id]: 1 }));
    setPiezasDentales(prev => ({ ...prev, [servicio.id]: '' }));
  };

  const eliminarTrabajoModal = (id: string) => {
    setTrabajosAgregados(trabajosAgregados.filter(t => t.id !== id));
  };

  const calcularTotal = () => {
    return trabajosAgregados.reduce((total, trabajo) => 
      total + (trabajo.precioUnitario * trabajo.cantidad), 0
    );
  };

  const cerrarModal = () => {
    if (trabajosAgregados.length > 0 || nombrePaciente || clinicaSeleccionada) {
      const confirmar = window.confirm(
        '¿Estás seguro de que quieres cancelar? Se perderán todos los datos no guardados.'
      );
      if (!confirmar) return;
    }
    setModalAbierto(false);
    resetForm();
  };

  const resetForm = () => {
    setClinicaSeleccionada('');
    setDentistaSeleccionado('');
    setLaboratoristaSeleccionado('');
    setNombrePaciente('');
    setTrabajosAgregados([]);
    setCantidades({});
    setPiezasDentales({});
    setCategoriaSeleccionada('fija');
    setNotas('');
    setFechaEntregaEstimada('');
  };

  const finalizarTrabajo = async () => {
    if (!clinicaSeleccionada || !dentistaSeleccionado) {
      alert('Por favor selecciona una clínica y dentista');
      return;
    }

    if (trabajosAgregados.length === 0) {
      alert('Por favor agrega al menos un trabajo');
      return;
    }

    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('No hay usuario autenticado');
        return;
      }

      const serviciosParaBD = trabajosAgregados.map(trabajo => ({
        servicio_id: trabajo.servicio.id,
        cantidad: trabajo.cantidad,
        precio: trabajo.precioUnitario * trabajo.cantidad,
        nombre: trabajo.servicio.nombre,
        pieza_dental: trabajo.piezaDental || ''
      }));

      const fechaEntregaDefault = new Date();
      fechaEntregaDefault.setDate(fechaEntregaDefault.getDate() + 7);
      const fechaEntregaFormateada = fechaEntregaEstimada || fechaEntregaDefault.toISOString().split('T')[0];

      const trabajoData: any = {
        paciente: nombrePaciente.trim(),
        clinica_id: clinicaSeleccionada,
        dentista_id: dentistaSeleccionado,
        laboratorista_id: laboratoristaSeleccionado || null,
        servicios: serviciosParaBD,
        precio_total: calcularTotal(),
        usuario_id: user.id,
        estado: 'pendiente',
        notas: notas.trim(),
        fecha_entrega_estimada: fechaEntregaFormateada,
        modo: 'clinica'
      };

      const { data, error } = await supabase
        .from('trabajos')
        .insert([trabajoData])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setTrabajos(prev => [data[0], ...prev]);
        setModalAbierto(false);
        resetForm();
      }

    } catch (error: any) {
      console.error('Error creando trabajo:', error);
      alert(`❌ Error al crear el trabajo: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const toggleExpandirTrabajo = (trabajoId: string) => {
    setTrabajoExpandido(trabajoExpandido === trabajoId ? null : trabajoId);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div>
            <button 
              style={styles.backButton}
              onClick={handleVolver}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#64748b'}
            >
              ← Volver al Dashboard
            </button>
            <h1 style={styles.title}>
              🔧 Gestión de Trabajos
            </h1>
            <p style={styles.subtitle}>
              Administra y supervisa todos los trabajos dentales en proceso
            </p>
          </div>
        </div>
        
        <div style={styles.buttonGroup}>
          <button 
            style={styles.addButton}
            onClick={() => setModalAbierto(true)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            ➕ Crear Trabajo
          </button>
        </div>
      </div>

      {/* Filtros Mejorados */}
      <div style={styles.filtrosContainer}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>
          🔍 Filtros de Búsqueda
        </h3>
        
        <div style={styles.filtrosGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Clínica</label>
            <select 
              style={styles.select}
              value={filtros.clinicaId}
              onChange={(e) => setFiltros({...filtros, clinicaId: e.target.value})}
            >
              <option value="todas">🏥 Todas las Clínicas</option>
              {clinicas.map(clinica => (
                <option key={clinica.id} value={clinica.id}>{clinica.nombre}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Estado</label>
            <select 
              style={styles.select}
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="todos">📊 Todos los Estados</option>
              <option value="pendiente">⏳ Pendientes</option>
              <option value="produccion">🔧 En Producción</option>
              <option value="terminado">✅ Terminados</option>
              <option value="entregado">📦 Entregados</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Año</label>
            <select 
              style={styles.select}
              value={filtros.año}
              onChange={(e) => setFiltros({...filtros, año: e.target.value})}
            >
              <option value="todos">📅 Todos los Años</option>
              {añosDisponibles().map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mes</label>
            <select 
              style={styles.select}
              value={filtros.mes}
              onChange={(e) => setFiltros({...filtros, mes: e.target.value})}
            >
              {mesesDisponibles.map(mes => (
                <option key={mes.valor} value={mes.valor}>{mes.nombre}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Paciente</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Buscar por nombre..."
              value={filtros.paciente}
              onChange={(e) => setFiltros({...filtros, paciente: e.target.value})}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dentista</label>
            <select 
              style={styles.select}
              value={filtros.dentistaId}
              onChange={(e) => setFiltros({...filtros, dentistaId: e.target.value})}
            >
              <option value="todos">👨‍⚕️ Todos los Dentistas</option>
              {dentistas.map(dentista => (
                <option key={dentista.id} value={dentista.id}>{dentista.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Mostrando {trabajosFiltrados.length} de {trabajos.length} trabajos
          </span>
          <button 
            style={styles.buttonSecondary}
            onClick={() => setFiltros({
              clinicaId: 'todas',
              estado: 'todos',
              mes: 'todos',
              año: 'todos',
              paciente: '',
              laboratoristaId: 'todos',
              dentistaId: 'todos'
            })}
          >
            🔄 Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
          }}
        >
          <div style={styles.statLabel}>Total Trabajos</div>
          <div style={styles.statNumber}>{estadisticas.total}</div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
          }}
        >
          <div style={styles.statLabel}>Ingresos Totales</div>
          <div style={{...styles.statNumber, color: '#10b981'}}>
            ${estadisticas.ingresosTotales}
          </div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
          }}
        >
          <div style={styles.statLabel}>En Proceso</div>
          <div style={{...styles.statNumber, color: '#f59e0b'}}>
            {estadisticas.pendientes + estadisticas.produccion}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {estadisticas.pendientes} pendientes • {estadisticas.produccion} producción
          </div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
          }}
        >
          <div style={styles.statLabel}>Finalizados</div>
          <div style={{...styles.statNumber, color: '#3b82f6'}}>
            {estadisticas.terminados + estadisticas.entregados}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {estadisticas.terminados} terminados • {estadisticas.entregados} entregados
          </div>
        </div>
      </div>

      {/* Lista de Trabajos */}
      {cargando && trabajos.length === 0 ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Cargando trabajos...</div>
        </div>
      ) : Object.keys(trabajosPorClinica).length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>
            {trabajos.length === 0 ? 'No hay trabajos registrados' : 'No hay trabajos con los filtros aplicados'}
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {trabajos.length === 0 
              ? 'Comienza creando tu primer trabajo dental'
              : 'Intenta con diferentes filtros de búsqueda'
            }
          </p>
          {trabajos.length === 0 && (
            <button 
              style={styles.addButton}
              onClick={() => setModalAbierto(true)}
            >
              ➕ Crear Primer Trabajo
            </button>
          )}
        </div>
      ) : (
        Object.entries(trabajosPorClinica).map(([clinicaId, trabajosClinica]) => {
          const clinica = clinicas.find(c => c.id === clinicaId);
          const trabajosPendientes = trabajosClinica.filter(t => 
            t.estado === 'pendiente' || t.estado === 'produccion'
          ).length;

          return (
            <div key={clinicaId} style={styles.clinicaSection}>
              <div style={styles.clinicaHeader}>
                <div>
                  <h2 style={styles.clinicaNombre}>
                    🏥 {clinica?.nombre || 'Clínica no encontrada'}
                  </h2>
                  {clinica?.direccion && (
                    <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      📍 {clinica.direccion}
                    </div>
                  )}
                </div>
                
                <div style={styles.clinicaInfo}>
                  <span style={styles.contadorTrabajos}>
                    {trabajosClinica.length} trabajo{trabajosClinica.length !== 1 ? 's' : ''}
                  </span>
                  {trabajosPendientes > 0 && (
                    <button 
                      style={styles.finalizarTodosButton}
                      onClick={() => finalizarTodosTrabajosClinica(clinicaId)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                      ✅ Finalizar Todos ({trabajosPendientes})
                    </button>
                  )}
                </div>
              </div>
              
              <div style={styles.trabajosGrid}>
                {trabajosClinica.map((trabajo) => {
                  const dentista = dentistas.find(d => d.id === trabajo.dentista_id);
                  const laboratorista = laboratoristas.find(l => l.id === trabajo.laboratorista_id);
                  
                  return (
                    <div 
                      key={trabajo.id} 
                      style={{
                        ...styles.trabajoCard,
                        borderLeft: `4px solid ${(styles.categoriaColors as any)['fija'] || '#3b82f6'}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={styles.trabajoCardHeader}>
                        <h3 style={styles.trabajoPaciente}>{trabajo.paciente}</h3>
                        <span style={getEstadoStyle(trabajo.estado)}>
                          {getEstadoText(trabajo.estado)}
                        </span>
                      </div>
                      
                      <div style={styles.trabajoInfo}>
                        <span>👨‍⚕️ {dentista?.nombre || 'No especificado'}</span>
                      </div>
                      <div style={styles.trabajoInfo}>
                        <span>💰 ${trabajo.precio_total}</span>
                      </div>
                      <div style={styles.trabajoInfo}>
                        <span>📅 {trabajo.fecha_entrega_estimada ? new Date(trabajo.fecha_entrega_estimada).toLocaleDateString() : 'Sin fecha'}</span>
                      </div>
                      {laboratorista && (
                        <div style={styles.trabajoInfo}>
                          <span>👨‍🔧 {laboratorista.nombre}</span>
                        </div>
                      )}

                      {/* Notas */}
                      {trabajo.notas && (
                        <div style={styles.notasContainer}>
                          <strong>📝 Notas:</strong> {trabajo.notas}
                        </div>
                      )}

                      {/* Selector de Estado */}
                      <div style={styles.estadoSelector}>
                        {['pendiente', 'produccion', 'terminado', 'entregado'].map(estado => (
                          <button
                            key={estado}
                            style={{
                              ...styles.estadoButton,
                              ...(trabajo.estado === estado ? styles.estadoButtonActive : {})
                            }}
                            onClick={() => cambiarEstadoTrabajo(trabajo.id, estado)}
                            onMouseEnter={(e) => {
                              if (trabajo.estado !== estado) {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (trabajo.estado !== estado) {
                                e.currentTarget.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            {getEstadoText(estado)}
                          </button>
                        ))}
                      </div>

                      {/* Detalles Expandidos */}
                      {trabajoExpandido === trabajo.id && (
                        <div style={styles.trabajoDetalles}>
                          {trabajo.servicios && trabajo.servicios.length > 0 && (
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>
                                Servicios ({trabajo.servicios.length}):
                              </div>
                              {trabajo.servicios.map((servicioTrabajo, index) => {
                                const servicio = servicios.find(s => s.id === servicioTrabajo.servicio_id);
                                return (
                                  <div key={index} style={styles.servicioItem}>
                                    <div>
                                      <strong>{servicio?.nombre || servicioTrabajo.nombre || 'Servicio no encontrado'}</strong>
                                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Cantidad: {servicioTrabajo.cantidad}
                                        {servicioTrabajo.pieza_dental && ` • Pieza: ${servicioTrabajo.pieza_dental}`}
                                      </div>
                                    </div>
                                    <div style={{ fontWeight: '700', color: '#10b981' }}>
                                      ${servicioTrabajo.precio}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botones de Acción */}
                      <div style={styles.accionesContainer}>
                        <button 
                          style={{
                            ...styles.buttonSmall,
                            backgroundColor: '#3b82f6',
                            color: 'white'
                          }}
                          onClick={() => abrirModalNotas(trabajo)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          📝 Notas
                        </button>
                        <button 
                          style={{
                            ...styles.buttonSmall,
                            backgroundColor: '#f59e0b',
                            color: 'white'
                          }}
                          onClick={() => toggleExpandirTrabajo(trabajo.id)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
                        >
                          {trabajoExpandido === trabajo.id ? '▲ Ocultar' : '▼ Detalles'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Modal para agregar notas */}
      {modalNotasAbierto && trabajoConNotas && (
        <div style={styles.modalOverlay} onClick={cerrarModalNotas}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>
                📝 Notas del Paciente - {trabajoConNotas.paciente}
              </h2>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Notas Adicionales</label>
              <textarea
                style={styles.notasInput}
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                placeholder="Agrega notas sobre el tratamiento, observaciones, o cualquier información relevante..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button 
                style={styles.buttonSecondary}
                onClick={cerrarModalNotas}
              >
                ❌ Cancelar
              </button>
              <button 
                style={styles.buttonSuccess}
                onClick={guardarNota}
                disabled={cargando}
              >
                {cargando ? '💾 Guardando...' : '💾 Guardar Notas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear trabajo */}
      {modalAbierto && (
        <div style={styles.modalOverlay} onClick={cerrarModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>
                🆕 Crear Nuevo Trabajo
              </h2>
              <button 
                style={styles.closeButton}
                onClick={cerrarModal}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              >
                ×
              </button>
            </div>
            
            <div style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Crea un nuevo trabajo dental seleccionando paciente, clínica y servicios
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre del Paciente *</label>
              <input
                type="text"
                style={styles.input}
                value={nombrePaciente}
                onChange={(e) => setNombrePaciente(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Clínica *</label>
                <select 
                  style={styles.select}
                  value={clinicaSeleccionada}
                  onChange={(e) => {
                    setClinicaSeleccionada(e.target.value);
                    setDentistaSeleccionado('');
                  }}
                >
                  <option value="">Seleccionar clínica...</option>
                  {clinicas.map(clinica => (
                    <option key={clinica.id} value={clinica.id}>{clinica.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Dentista *</label>
                <select 
                  style={styles.select}
                  value={dentistaSeleccionado}
                  onChange={(e) => setDentistaSeleccionado(e.target.value)}
                  disabled={!clinicaSeleccionada}
                >
                  <option value="">Seleccionar dentista...</option>
                  {dentistasFiltrados.map(dentista => (
                    <option key={dentista.id} value={dentista.id}>{dentista.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                El formulario de servicios se mostraría aquí (similar al original pero con mejor diseño)
              </p>
              <button 
                style={styles.button}
                onClick={finalizarTrabajo}
                disabled={!clinicaSeleccionada || !dentistaSeleccionado || trabajosAgregados.length === 0 || cargando}
              >
                {cargando ? '🔄 Creando...' : '✅ Crear Trabajo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTrabajos;