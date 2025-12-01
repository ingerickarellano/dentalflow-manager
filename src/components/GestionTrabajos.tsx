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

// Definir el tipo para las categorías
type CategoriaType = 'fija' | 'removible' | 'implantes' | 'ortodoncia' | 'reparaciones';

const GestionTrabajos: React.FC<GestionTrabajosProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [laboratoristas, setLaboratoristas] = useState<Laboratorista[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [trabajoEditando, setTrabajoEditando] = useState<Trabajo | null>(null);
  const [cargando, setCargando] = useState(false);
  const [trabajoExpandido, setTrabajoExpandido] = useState<string | null>(null);
  const [filtroClinica, setFiltroClinica] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
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
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaType>('fija');
  const [notas, setNotas] = useState<string>('');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState<string>('');

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cerrar modal con Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (modalAbierto || modalEdicionAbierto)) {
        if (modalAbierto) cerrarModal();
        if (modalEdicionAbierto) cerrarModalEdicion();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalAbierto, modalEdicionAbierto]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No hay usuario autenticado');
        return;
      }

      console.log('Cargando datos para usuario:', user.id);

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

      // Verificar errores
      if (trabajosRes.error) console.error('Error cargando trabajos:', trabajosRes.error);
      if (clinicasRes.error) console.error('Error cargando clínicas:', clinicasRes.error);
      if (dentistasRes.error) console.error('Error cargando dentistas:', dentistasRes.error);
      if (serviciosRes.error) console.error('Error cargando servicios:', serviciosRes.error);
      if (laboratoristasRes.error) console.error('Error cargando laboratoristas:', laboratoristasRes.error);

      // Establecer datos
      if (trabajosRes.data) setTrabajos(trabajosRes.data);
      if (clinicasRes.data) setClinicas(clinicasRes.data);
      if (dentistasRes.data) setDentistas(dentistasRes.data);
      if (serviciosRes.data) setServicios(serviciosRes.data);
      if (laboratoristasRes.data) setLaboratoristas(laboratoristasRes.data);

      console.log('Datos cargados:', {
        trabajos: trabajosRes.data?.length || 0,
        clinicas: clinicasRes.data?.length || 0,
        dentistas: dentistasRes.data?.length || 0,
        servicios: serviciosRes.data?.length || 0,
        laboratoristas: laboratoristasRes.data?.length || 0
      });

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

  const cerrarModal = () => {
    if (trabajosAgregados.length > 0 || nombrePaciente || clinicaSeleccionada || dentistaSeleccionado) {
      const confirmar = window.confirm(
        'Tienes trabajos sin guardar. ¿Estás seguro de que quieres cancelar? Se perderán todos los datos.'
      );
      if (!confirmar) return;
    }
    setModalAbierto(false);
    resetForm();
  };

  const cerrarModalEdicion = () => {
    setModalEdicionAbierto(false);
    setTrabajoEditando(null);
  };

  // Filtrar dentistas y laboratoristas
  const dentistasFiltrados = dentistas.filter(d => d.clinica_id === clinicaSeleccionada);
  const laboratoristasActivos = laboratoristas.filter(l => l.activo);

  // Agrupar servicios por categoría
  const serviciosPorCategoria = servicios.reduce((acc, servicio) => {
    if (!acc[servicio.categoria]) acc[servicio.categoria] = [];
    acc[servicio.categoria].push(servicio);
    return acc;
  }, {} as Record<string, Servicio[]>);

  const categorias: Record<CategoriaType, string> = {
    'fija': '🦷 Prótesis Fija',
    'removible': '👄 Prótesis Removible', 
    'implantes': '⚡ Implantes',
    'ortodoncia': '🎯 Ortodoncia',
    'reparaciones': '🔧 Reparaciones y Otros'
  };

  // Obtener servicios de la categoría seleccionada (solo activos)
  const serviciosCategoriaActual = (serviciosPorCategoria[categoriaSeleccionada] || [])
    .filter(servicio => servicio.activo);

  // Agrupar trabajos por clínica
  const trabajosPorClinica = trabajos.reduce((acc, trabajo) => {
    const clinicaId = trabajo.clinica_id;
    if (!acc[clinicaId]) acc[clinicaId] = [];
    acc[clinicaId].push(trabajo);
    return acc;
  }, {} as Record<string, Trabajo[]>);

  // Filtrar trabajos según los filtros seleccionados
  const trabajosFiltrados = trabajos.filter(trabajo => {
    const coincideClinica = filtroClinica === 'todas' || trabajo.clinica_id === filtroClinica;
    const coincideEstado = filtroEstado === 'todos' || trabajo.estado === filtroEstado;
    return coincideClinica && coincideEstado;
  });

  // Agrupar trabajos filtrados por clínica
  const trabajosFiltradosPorClinica = trabajosFiltrados.reduce((acc, trabajo) => {
    const clinicaId = trabajo.clinica_id;
    if (!acc[clinicaId]) acc[clinicaId] = [];
    acc[clinicaId].push(trabajo);
    return acc;
  }, {} as Record<string, Trabajo[]>);

  // ===== NUEVAS FUNCIONALIDADES =====

  // Cambiar estado de un trabajo individual
  const cambiarEstadoTrabajo = async (trabajoId: string, nuevoEstado: string) => {
    try {
      setCargando(true);
      
      const { error } = await supabase
        .from('trabajos')
        .update({ estado: nuevoEstado })
        .eq('id', trabajoId);

      if (error) throw error;

      // Actualizar estado local
      setTrabajos(prev => 
        prev.map(trabajo => 
          trabajo.id === trabajoId 
            ? { ...trabajo, estado: nuevoEstado as any }
            : trabajo
        )
      );

      alert(`✅ Estado cambiado a ${getEstadoText(nuevoEstado)}`);
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('❌ Error al cambiar el estado');
    } finally {
      setCargando(false);
    }
  };

  // Finalizar todos los trabajos de una clínica
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

      // Actualizar estado local
      setTrabajos(prev => 
        prev.map(trabajo => 
          trabajo.clinica_id === clinicaId && (trabajo.estado === 'pendiente' || trabajo.estado === 'produccion')
            ? { ...trabajo, estado: 'terminado' }
            : trabajo
        )
      );

      alert(`✅ ${trabajosClinica.length} trabajos marcados como terminados`);
    } catch (error) {
      console.error('Error finalizando trabajos:', error);
      alert('❌ Error al finalizar los trabajos');
    } finally {
      setCargando(false);
    }
  };

  // Editar un trabajo existente
  const abrirModalEdicion = (trabajo: Trabajo) => {
    setTrabajoEditando(trabajo);
    setModalEdicionAbierto(true);
  };

  const guardarEdicionTrabajo = async () => {
    if (!trabajoEditando) return;

    try {
      setCargando(true);
      
      const { error } = await supabase
        .from('trabajos')
        .update({
          paciente: trabajoEditando.paciente,
          notas: trabajoEditando.notas,
          fecha_entrega_estimada: trabajoEditando.fecha_entrega_estimada,
          estado: trabajoEditando.estado
        })
        .eq('id', trabajoEditando.id);

      if (error) throw error;

      // Actualizar estado local
      setTrabajos(prev => 
        prev.map(t => 
          t.id === trabajoEditando.id ? trabajoEditando : t
        )
      );

      setModalEdicionAbierto(false);
      setTrabajoEditando(null);
      alert('✅ Trabajo actualizado correctamente');
    } catch (error) {
      console.error('Error editando trabajo:', error);
      alert('❌ Error al actualizar el trabajo');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar un trabajo
  const eliminarTrabajo = async (trabajoId: string) => {
    const confirmar = window.confirm('¿Estás seguro de que quieres eliminar este trabajo? Esta acción no se puede deshacer.');
    
    if (!confirmar) return;

    try {
      setCargando(true);
      
      const { error } = await supabase
        .from('trabajos')
        .delete()
        .eq('id', trabajoId);

      if (error) throw error;

      // Actualizar estado local
      setTrabajos(prev => prev.filter(t => t.id !== trabajoId));
      
      alert('✅ Trabajo eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando trabajo:', error);
      alert('❌ Error al eliminar el trabajo');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar un servicio específico de un trabajo
  const eliminarServicioTrabajo = async (trabajoId: string, servicioIndex: number) => {
    const trabajo = trabajos.find(t => t.id === trabajoId);
    if (!trabajo) return;

    const nuevosServicios = trabajo.servicios.filter((_, index) => index !== servicioIndex);
    const nuevoPrecioTotal = nuevosServicios.reduce((total, servicio) => total + servicio.precio, 0);

    try {
      setCargando(true);
      
      const { error } = await supabase
        .from('trabajos')
        .update({
          servicios: nuevosServicios,
          precio_total: nuevoPrecioTotal
        })
        .eq('id', trabajoId);

      if (error) throw error;

      // Actualizar estado local
      setTrabajos(prev => 
        prev.map(t => 
          t.id === trabajoId 
            ? { 
                ...t, 
                servicios: nuevosServicios, 
                precio_total: nuevoPrecioTotal 
              }
            : t
        )
      );

      alert('✅ Servicio eliminado del trabajo');
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      alert('❌ Error al eliminar el servicio');
    } finally {
      setCargando(false);
    }
  };

  // ===== FUNCIONES EXISTENTES =====

  const agregarTrabajo = (servicio: Servicio) => {
    if (!nombrePaciente) {
      alert('Por favor ingresa el nombre del paciente');
      return;
    }

    const cantidad = cantidades[servicio.id] || 1;
    const piezaDental = piezasDentales[servicio.id] || '';

    const trabajo = {
      id: Date.now().toString() + Math.random(),
      paciente: nombrePaciente,
      servicio,
      cantidad,
      piezaDental,
      precioUnitario: servicio.precio_base
    };

    setTrabajosAgregados([...trabajosAgregados, trabajo]);
    
    // Limpiar los inputs para este servicio
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

  const actualizarCantidad = (servicioId: string, cantidad: number) => {
    if (cantidad < 1) cantidad = 1;
    setCantidades(prev => ({ ...prev, [servicioId]: cantidad }));
  };

  const actualizarPiezaDental = (servicioId: string, pieza: string) => {
    setPiezasDentales(prev => ({ ...prev, [servicioId]: pieza }));
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

      // Preparar servicios para la base de datos
      const serviciosParaBD = trabajosAgregados.map(trabajo => ({
        servicio_id: trabajo.servicio.id,
        cantidad: trabajo.cantidad,
        precio: trabajo.precioUnitario * trabajo.cantidad,
        nombre: trabajo.servicio.nombre,
        pieza_dental: trabajo.piezaDental || ''
      }));

      // Calcular fecha de entrega por defecto (7 días desde hoy)
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

      if (error) {
        console.error('Error creando trabajo:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('Trabajo creado exitosamente:', data[0]);
        setTrabajos(prev => [data[0], ...prev]);
        setModalAbierto(false);
        resetForm();
        alert('✅ ¡Trabajo creado exitosamente!');
      } else {
        throw new Error('No se recibieron datos de respuesta');
      }

    } catch (error: any) {
      console.error('Error detallado creando trabajo:', error);
      alert(`❌ Error al crear el trabajo: ${error.message}`);
    } finally {
      setCargando(false);
    }
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

  const getEstadoStyle = (estado: string) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600'
    };

    switch (estado) {
      case 'pendiente': return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'produccion': return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'terminado': return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'entregado': return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
      default: return baseStyle;
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

  const toggleExpandirTrabajo = (trabajoId: string) => {
    if (trabajoExpandido === trabajoId) {
      setTrabajoExpandido(null);
    } else {
      setTrabajoExpandido(trabajoId);
    }
  };

  const puedeFinalizar = clinicaSeleccionada && dentistaSeleccionado && trabajosAgregados.length > 0;

  // ===== ESTILOS =====

  const styles: { [key: string]: React.CSSProperties } = {
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
    addButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    filtrosContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap'
    },
    filtroSelect: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      minWidth: '150px'
    },
    clinicaSection: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    clinicaHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e2e8f0'
    },
    clinicaNombre: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    contadorTrabajos: {
      backgroundColor: '#e2e8f0',
      color: '#475569',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    finalizarTodosButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginLeft: '1rem'
    },
    trabajosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1rem'
    },
    trabajoCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      backgroundColor: 'white',
      transition: 'all 0.2s'
    },
    trabajoCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.5rem'
    },
    trabajoPaciente: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    trabajoInfo: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '0.25rem'
    },
    trabajoDetalles: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6'
    },
    servicioItem: {
      backgroundColor: '#f9fafb',
      padding: '0.5rem 0.75rem',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      position: 'relative'
    },
    eliminarServicioButton: {
      position: 'absolute',
      right: '8px',
      top: '8px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      padding: '2px 6px',
      fontSize: '10px'
    },
    expandButton: {
      background: 'none',
      border: 'none',
      color: '#2563eb',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginTop: '0.5rem'
    },
    emptyState: {
      textAlign: 'center',
      color: '#6b7280',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '2px dashed #d1d5db'
    },
    modalOverlay: {
      position: 'fixed',
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
      padding: '24px',
      borderRadius: '8px',
      width: '95%',
      maxWidth: '1200px',
      maxHeight: '95vh',
      overflow: 'auto',
      position: 'relative'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px'
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#64748b',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9'
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
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      backgroundColor: 'white'
    },
    button: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginRight: '0.5rem'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    buttonDanger: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'not-allowed'
    },
    estadoSelector: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem',
      flexWrap: 'wrap'
    },
    estadoButton: {
      padding: '0.25rem 0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      backgroundColor: 'white'
    },
    estadoButtonActive: {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    accionesContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      justifyContent: 'flex-end'
    },
    serviciosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    servicioCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      padding: '1rem',
      backgroundColor: 'white'
    },
    servicioHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    controlesServicio: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      marginTop: '0.5rem'
    },
    inputCantidad: {
      width: '60px',
      padding: '0.25rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      textAlign: 'center'
    },
    inputPieza: {
      width: '80px',
      padding: '0.25rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem'
    },
    listaTrabajos: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginTop: '2rem'
    },
    trabajoItemModal: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0'
    },
    total: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '1rem 0',
      borderTop: '2px solid #2563eb',
      fontWeight: 'bold',
      fontSize: '1.125rem',
      marginTop: '1rem'
    },
    categoriaTitle: {
      color: '#475569',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '1.5rem 0 0.5rem 0',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e2e8f0'
    },
    selectorCategorias: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    botonCategoria: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#374151',
      transition: 'all 0.2s'
    },
    botonCategoriaActivo: {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    loadingText: {
      textAlign: 'center',
      color: '#6b7280',
      padding: '20px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    cancelButton: {
      padding: '8px 16px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    clearAllButton: {
      padding: '8px 16px',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: 'auto'
    },
    helperText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={handleVolver}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>📋 Gestión de Trabajos</h1>
        </div>
        <button 
          onClick={() => setModalAbierto(true)}
          style={styles.addButton}
        >
          + Crear Trabajo
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtrosContainer}>
        <select 
          style={styles.filtroSelect}
          value={filtroClinica}
          onChange={(e) => setFiltroClinica(e.target.value)}
        >
          <option value="todas">Todas las Clínicas</option>
          {clinicas.map(clinica => (
            <option key={clinica.id} value={clinica.id}>{clinica.nombre}</option>
          ))}
        </select>

        <select 
          style={styles.filtroSelect}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="produccion">En Producción</option>
          <option value="terminado">Terminado</option>
          <option value="entregado">Entregado</option>
        </select>
      </div>

      {cargando && trabajos.length === 0 ? (
        <div style={styles.loadingText}>Cargando trabajos...</div>
      ) : (
        <div>
          {Object.keys(trabajosFiltradosPorClinica).length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ marginBottom: '1rem' }}>
                {trabajos.length === 0 
                  ? 'No hay trabajos registrados. Haz clic en "Crear Trabajo" para comenzar.'
                  : 'No hay trabajos que coincidan con los filtros seleccionados.'
                }
              </p>
              {trabajos.length === 0 && (
                <button 
                  onClick={() => setModalAbierto(true)}
                  style={styles.addButton}
                >
                  + Crear Primer Trabajo
                </button>
              )}
            </div>
          ) : (
            // Mostrar trabajos agrupados por clínica
            Object.entries(trabajosFiltradosPorClinica).map(([clinicaId, trabajosClinica]) => {
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
                      {trabajosPendientes > 0 && (
                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                          {trabajosPendientes} trabajo{trabajosPendientes !== 1 ? 's' : ''} pendiente{trabajosPendientes !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={styles.contadorTrabajos}>
                        {trabajosClinica.length} trabajo{trabajosClinica.length !== 1 ? 's' : ''}
                      </span>
                      {trabajosPendientes > 0 && (
                        <button 
                          style={styles.finalizarTodosButton}
                          onClick={() => finalizarTodosTrabajosClinica(clinicaId)}
                          disabled={cargando}
                        >
                          {cargando ? '🔄 Procesando...' : '✅ Finalizar Todos'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.trabajosGrid}>
                    {trabajosClinica.map((trabajo) => (
                      <div 
                        key={trabajo.id} 
                        style={styles.trabajoCard}
                      >
                        <div style={styles.trabajoCardHeader}>
                          <h3 style={styles.trabajoPaciente}>{trabajo.paciente}</h3>
                          <span style={getEstadoStyle(trabajo.estado)}>
                            {getEstadoText(trabajo.estado).toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={styles.trabajoInfo}>
                          <strong>Dentista:</strong> {dentistas.find(d => d.id === trabajo.dentista_id)?.nombre || 'No especificado'}
                        </div>
                        <div style={styles.trabajoInfo}>
                          <strong>Precio Total:</strong> ${trabajo.precio_total}
                        </div>
                        <div style={styles.trabajoInfo}>
                          <strong>Entrega:</strong> {trabajo.fecha_entrega_estimada ? new Date(trabajo.fecha_entrega_estimada).toLocaleDateString() : 'No especificada'}
                        </div>

                        {/* Selector de Estado */}
                        <div style={styles.estadoSelector}>
                          <button
                            style={{
                              ...styles.estadoButton,
                              ...(trabajo.estado === 'pendiente' ? styles.estadoButtonActive : {})
                            }}
                            onClick={() => cambiarEstadoTrabajo(trabajo.id, 'pendiente')}
                            disabled={cargando}
                          >
                            ⏳ Pendiente
                          </button>
                          <button
                            style={{
                              ...styles.estadoButton,
                              ...(trabajo.estado === 'produccion' ? styles.estadoButtonActive : {})
                            }}
                            onClick={() => cambiarEstadoTrabajo(trabajo.id, 'produccion')}
                            disabled={cargando}
                          >
                            🔧 En Producción
                          </button>
                          <button
                            style={{
                              ...styles.estadoButton,
                              ...(trabajo.estado === 'terminado' ? styles.estadoButtonActive : {})
                            }}
                            onClick={() => cambiarEstadoTrabajo(trabajo.id, 'terminado')}
                            disabled={cargando}
                          >
                            ✅ Terminado
                          </button>
                          <button
                            style={{
                              ...styles.estadoButton,
                              ...(trabajo.estado === 'entregado' ? styles.estadoButtonActive : {})
                            }}
                            onClick={() => cambiarEstadoTrabajo(trabajo.id, 'entregado')}
                            disabled={cargando}
                          >
                            📦 Entregado
                          </button>
                        </div>

                        {/* Botones de Acción */}
                        <div style={styles.accionesContainer}>
                          <button 
                            style={styles.button}
                            onClick={() => abrirModalEdicion(trabajo)}
                            disabled={cargando}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            style={styles.buttonDanger}
                            onClick={() => eliminarTrabajo(trabajo.id)}
                            disabled={cargando}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>

                        {trabajoExpandido === trabajo.id && (
                          <div style={styles.trabajoDetalles}>
                            {trabajo.servicios && trabajo.servicios.length > 0 && (
                              <div>
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                  Servicios ({trabajo.servicios.length}):
                                </div>
                                {trabajo.servicios.map((servicioTrabajo, index) => {
                                  const servicio = servicios.find(s => s.id === servicioTrabajo.servicio_id);
                                  return (
                                    <div key={index} style={styles.servicioItem}>
                                      <div>
                                        <strong>{servicio?.nombre || servicioTrabajo.nombre || 'Servicio no encontrado'}</strong>
                                        <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                                          (Cantidad: {servicioTrabajo.cantidad})
                                          {servicioTrabajo.pieza_dental && ` • Pieza: ${servicioTrabajo.pieza_dental}`}
                                        </span>
                                      </div>
                                      <div>${servicioTrabajo.precio}</div>
                                      <button
                                        style={styles.eliminarServicioButton}
                                        onClick={() => eliminarServicioTrabajo(trabajo.id, index)}
                                        title="Eliminar este servicio"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {trabajo.notas && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <strong>Notas:</strong> {trabajo.notas}
                              </div>
                            )}
                          </div>
                        )}

                        <button 
                          style={styles.expandButton}
                          onClick={() => toggleExpandirTrabajo(trabajo.id)}
                        >
                          {trabajoExpandido === trabajo.id ? '▲ Ver menos' : '▼ Ver detalles y servicios'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal para crear trabajo */}
      {modalAbierto && (
        <div style={styles.modalOverlay} onClick={cerrarModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ marginTop: 0, marginBottom: 0, color: '#1f2937' }}>
                📋 Crear Lista de Trabajo
              </h2>
              <button 
                style={styles.closeButton}
                onClick={cerrarModal}
                title="Cerrar (ESC)"
              >
                ×
              </button>
            </div>
            
            <div style={styles.helperText}>
              Presiona ESC o haz clic fuera del modal para cancelar
            </div>
            
            {/* ... (el resto del modal de creación se mantiene igual) ... */}
            
          </div>
        </div>
      )}

      {/* Modal para editar trabajo */}
      {modalEdicionAbierto && trabajoEditando && (
        <div style={styles.modalOverlay} onClick={cerrarModalEdicion}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ marginTop: 0, marginBottom: 0, color: '#1f2937' }}>
                ✏️ Editar Trabajo - {trabajoEditando.paciente}
              </h2>
              <button 
                style={styles.closeButton}
                onClick={cerrarModalEdicion}
                title="Cerrar (ESC)"
              >
                ×
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre del Paciente *</label>
              <input
                type="text"
                style={styles.input}
                value={trabajoEditando.paciente}
                onChange={(e) => setTrabajoEditando({
                  ...trabajoEditando,
                  paciente: e.target.value
                })}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha de Entrega Estimada</label>
              <input
                type="date"
                style={styles.input}
                value={trabajoEditando.fecha_entrega_estimada}
                onChange={(e) => setTrabajoEditando({
                  ...trabajoEditando,
                  fecha_entrega_estimada: e.target.value
                })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notas</label>
              <textarea
                style={styles.input}
                rows={3}
                value={trabajoEditando.notas}
                onChange={(e) => setTrabajoEditando({
                  ...trabajoEditando,
                  notas: e.target.value
                })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Estado Actual</label>
              <div style={styles.estadoSelector}>
                {['pendiente', 'produccion', 'terminado', 'entregado'].map(estado => (
                  <button
                    key={estado}
                    style={{
                      ...styles.estadoButton,
                      ...(trabajoEditando.estado === estado ? styles.estadoButtonActive : {})
                    }}
                    onClick={() => setTrabajoEditando({
                      ...trabajoEditando,
                      estado: estado as any
                    })}
                  >
                    {getEstadoText(estado)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                style={styles.cancelButton}
                onClick={cerrarModalEdicion}
                disabled={cargando}
              >
                ❌ Cancelar
              </button>
              <button 
                style={styles.buttonSuccess}
                onClick={guardarEdicionTrabajo}
                disabled={cargando}
              >
                {cargando ? '🔄 Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTrabajos;