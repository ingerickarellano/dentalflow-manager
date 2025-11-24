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
  const [cargando, setCargando] = useState(false);
  
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
      if (e.key === 'Escape' && modalAbierto) {
        cerrarModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalAbierto]);

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

  const eliminarTrabajo = (id: string) => {
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

      console.log('Usuario ID:', user.id);
      console.log('Clínica seleccionada:', clinicaSeleccionada);
      console.log('Dentista seleccionado:', dentistaSeleccionado);

      // Verificar que la clínica existe y pertenece al usuario
      const { data: clinicaVerificada, error: errorClinica } = await supabase
        .from('clinicas')
        .select('id')
        .eq('id', clinicaSeleccionada)
        .eq('usuario_id', user.id)
        .single();

      if (errorClinica || !clinicaVerificada) {
        throw new Error('Clínica no encontrada o no tienes permisos');
      }

      // Verificar que el dentista existe y pertenece al usuario
      const { data: dentistaVerificado, error: errorDentista } = await supabase
        .from('dentistas')
        .select('id')
        .eq('id', dentistaSeleccionado)
        .eq('usuario_id', user.id)
        .single();

      if (errorDentista || !dentistaVerificado) {
        throw new Error('Dentista no encontrado o no tienes permisos');
      }

      // Preparar servicios para la base de datos - usar nombres consistentes con BD
      const serviciosParaBD = trabajosAgregados.map(trabajo => ({
        servicio_id: trabajo.servicio.id,
        cantidad: trabajo.cantidad,
        precio: trabajo.precioUnitario * trabajo.cantidad,
        nombre: trabajo.servicio.nombre,
        pieza_dental: trabajo.piezaDental || ''  // Nombre consistente con BD
      }));

      console.log('Servicios para BD:', serviciosParaBD);

      // Calcular fecha de entrega por defecto (7 días desde hoy)
      const fechaEntregaDefault = new Date();
      fechaEntregaDefault.setDate(fechaEntregaDefault.getDate() + 7);
      const fechaEntregaFormateada = fechaEntregaEstimada || fechaEntregaDefault.toISOString().split('T')[0];

      // Crear objeto de datos para el trabajo - SOLO incluir campos que existen en la BD
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
        // NO incluir fecha_creacion - dejar que la BD use el valor por defecto
      };

      console.log('=== DEBUG TRABAJO DATA ===');
      console.log('Usuario ID:', user.id);
      console.log('Clínica ID:', clinicaSeleccionada);
      console.log('Dentista ID:', dentistaSeleccionado);
      console.log('Servicios:', serviciosParaBD);
      console.log('Trabajo Data:', trabajoData);
      console.log('=== FIN DEBUG ===');

      const { data, error } = await supabase
        .from('trabajos')
        .insert([trabajoData])
        .select();

      if (error) {
        console.error('Error completo de Supabase:', error);
        
        // Manejar errores específicos
        if (error.code === '42501') {
          throw new Error('Permiso denegado. Configura las políticas RLS para la tabla trabajos.');
        } else if (error.code === '23503') {
          throw new Error('Error de clave foránea. Verifica que la clínica y dentista existan.');
        } else if (error.code === '23505') {
          throw new Error('Trabajo duplicado.');
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
          throw new Error(`Error de columna: ${error.message}. Verifica que todas las columnas existan en la tabla trabajos.`);
        }
        
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
      
      if (error.message.includes('RLS') || error.message.includes('policy')) {
        alert(`❌ Error de permisos: ${error.message}\n\nConfigura las políticas RLS en Supabase para la tabla trabajos.`);
      } else if (error.message.includes('clave foránea')) {
        alert(`❌ Error de datos: ${error.message}\n\nVerifica que la clínica y dentista seleccionados existan.`);
      } else if (error.message.includes('columna') || error.message.includes('column')) {
        alert(`❌ Error de estructura: ${error.message}\n\nEjecuta el SQL de corrección en Supabase.`);
      } else {
        alert(`❌ Error al crear el trabajo: ${error.message}`);
      }
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
      fontWeight: '600',
      marginLeft: '8px'
    };

    switch (estado) {
      case 'pendiente': return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'produccion': return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'terminado': return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'entregado': return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
      default: return baseStyle;
    }
  };

  const puedeFinalizar = clinicaSeleccionada && dentistaSeleccionado && trabajosAgregados.length > 0;

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
    card: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '16px'
    },
    trabajoItem: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      position: 'relative'
    },
    trabajoPaciente: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center'
    },
    trabajoInfo: {
      color: '#6b7280',
      marginBottom: '4px'
    },
    serviciosSection: {
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid #f3f4f6'
    },
    servicioItem: {
      backgroundColor: '#f9fafb',
      padding: '8px 12px',
      borderRadius: '4px',
      marginBottom: '4px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
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
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'not-allowed'
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

      {cargando && trabajos.length === 0 ? (
        <div style={styles.loadingText}>Cargando trabajos...</div>
      ) : (
        <div>
          {trabajos.length === 0 ? (
            <div style={styles.card}>
              <p style={{ color: '#6b7280', textAlign: 'center', margin: 0 }}>
                No hay trabajos registrados. Haz clic en "Crear Trabajo" para comenzar.
              </p>
            </div>
          ) : (
            trabajos.map((trabajo) => (
              <div key={trabajo.id} style={styles.trabajoItem}>
                <div style={styles.trabajoPaciente}>
                  {trabajo.paciente}
                  <span style={getEstadoStyle(trabajo.estado)}>
                    {trabajo.estado.toUpperCase()}
                  </span>
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {trabajo.modo === 'clinica' ? '🏥 Clínica' : '👤 Individual'}
                  </span>
                </div>
                
                <div style={styles.trabajoInfo}>
                  <strong>Clínica:</strong> {clinicas.find(c => c.id === trabajo.clinica_id)?.nombre || 'No especificada'}
                </div>
                <div style={styles.trabajoInfo}>
                  <strong>Dentista:</strong> {dentistas.find(d => d.id === trabajo.dentista_id)?.nombre || 'No especificado'}
                </div>
                <div style={styles.trabajoInfo}>
                  <strong>Precio Total:</strong> ${trabajo.precio_total}
                </div>
                {trabajo.fecha_creacion && (
                  <div style={styles.trabajoInfo}>
                    <strong>Fecha Creación:</strong> {new Date(trabajo.fecha_creacion).toLocaleDateString()}
                  </div>
                )}
                <div style={styles.trabajoInfo}>
                  <strong>Fecha Entrega:</strong> {trabajo.fecha_entrega_estimada ? new Date(trabajo.fecha_entrega_estimada).toLocaleDateString() : 'No especificada'}
                </div>

                {trabajo.servicios && trabajo.servicios.length > 0 && (
                  <div style={styles.serviciosSection}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
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
                        </div>
                      );
                    })}
                  </div>
                )}

                {trabajo.notas && (
                  <div style={styles.trabajoInfo}>
                    <strong>Notas:</strong> {trabajo.notas}
                  </div>
                )}
              </div>
            ))
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
            
            {/* Selección de Clínica, Dentista y Laboratorista */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem', marginTop: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Clínica *</label>
                <select 
                  style={styles.select}
                  value={clinicaSeleccionada}
                  onChange={(e) => {
                    setClinicaSeleccionada(e.target.value);
                    setDentistaSeleccionado('');
                  }}
                  required
                >
                  <option value="">Selecciona una clínica</option>
                  {clinicas.map(clinica => (
                    <option key={clinica.id} value={clinica.id}>
                      {clinica.nombre}
                    </option>
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
                  required
                >
                  <option value="">Selecciona un dentista</option>
                  {dentistasFiltrados.map(dentista => (
                    <option key={dentista.id} value={dentista.id}>
                      {dentista.nombre} - {dentista.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Laboratorista (Opcional)</label>
                <select 
                  style={styles.select}
                  value={laboratoristaSeleccionado}
                  onChange={(e) => setLaboratoristaSeleccionado(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {laboratoristasActivos.map(laboratorista => (
                    <option key={laboratorista.id} value={laboratorista.id}>
                      {laboratorista.nombre} - {laboratorista.especialidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nombre del Paciente y Fecha de Entrega */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Paciente *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={nombrePaciente}
                  onChange={(e) => setNombrePaciente(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Fecha de Entrega Estimada</label>
                <input
                  type="date"
                  style={styles.input}
                  value={fechaEntregaEstimada}
                  onChange={(e) => setFechaEntregaEstimada(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Notas */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Notas</label>
              <textarea
                style={styles.input}
                rows={3}
                placeholder="Notas adicionales sobre el trabajo..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {/* Selector de Categorías */}
            <div style={styles.selectorCategorias}>
              {(Object.entries(categorias) as [CategoriaType, string][]).map(([key, nombre]) => (
                <button
                  key={key}
                  style={{
                    ...styles.botonCategoria,
                    ...(categoriaSeleccionada === key ? styles.botonCategoriaActivo : {})
                  }}
                  onClick={() => setCategoriaSeleccionada(key)}
                >
                  {nombre}
                </button>
              ))}
            </div>

            {/* Lista de Servicios de la Categoría Seleccionada */}
            <div>
              <h3 style={styles.categoriaTitle}>{categorias[categoriaSeleccionada]}</h3>
              {serviciosCategoriaActual.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  No hay servicios disponibles en esta categoría
                </div>
              ) : (
                <div style={styles.serviciosGrid}>
                  {serviciosCategoriaActual.map(servicio => (
                    <div key={servicio.id} style={styles.servicioCard}>
                      <div style={styles.servicioHeader}>
                        <div style={{flex: 1}}>
                          <strong>{servicio.nombre}</strong>
                          <div style={{color: '#2563eb', fontWeight: 'bold', marginTop: '0.5rem'}}>
                            ${servicio.precio_base}
                          </div>
                        </div>
                      </div>
                      
                      <div style={styles.controlesServicio}>
                        <input
                          type="number"
                          style={styles.inputCantidad}
                          value={cantidades[servicio.id] || 1}
                          min="1"
                          onChange={(e) => actualizarCantidad(servicio.id, parseInt(e.target.value) || 1)}
                          placeholder="Cant"
                        />
                        
                        <input
                          type="text"
                          style={styles.inputPieza}
                          value={piezasDentales[servicio.id] || ''}
                          onChange={(e) => actualizarPiezaDental(servicio.id, e.target.value)}
                          placeholder="Pieza"
                        />
                        
                        <button 
                          style={styles.buttonSuccess}
                          onClick={() => agregarTrabajo(servicio)}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Trabajos Agregados */}
            <div style={styles.listaTrabajos}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>
                  📋 Lista de Trabajos ({trabajosAgregados.length})
                </h3>
                {trabajosAgregados.length > 0 && (
                  <button 
                    style={styles.clearAllButton}
                    onClick={() => {
                      const confirmar = window.confirm('¿Estás seguro de que quieres eliminar todos los trabajos agregados?');
                      if (confirmar) {
                        setTrabajosAgregados([]);
                      }
                    }}
                  >
                    🗑️ Limpiar Todo
                  </button>
                )}
              </div>
              
              {trabajosAgregados.length === 0 ? (
                <p style={{color: '#64748b', textAlign: 'center', padding: '2rem'}}>
                  No hay trabajos agregados. Completa los datos y agrega servicios.
                </p>
              ) : (
                <>
                  {trabajosAgregados.map((trabajo) => (
                    <div key={trabajo.id} style={styles.trabajoItemModal}>
                      <div style={{flex: 1}}>
                        <strong>{trabajo.paciente}</strong>
                        <div style={{fontSize: '0.875rem', color: '#64748b'}}>
                          {trabajo.servicio.nombre}
                          {trabajo.cantidad > 1 && ` • Cantidad: ${trabajo.cantidad}`}
                          {trabajo.piezaDental && ` • Pieza: ${trabajo.piezaDental}`}
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <div style={{fontWeight: 'bold', color: '#2563eb'}}>
                          ${trabajo.precioUnitario * trabajo.cantidad}
                        </div>
                        <button 
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            marginTop: '0.25rem'
                          }}
                          onClick={() => eliminarTrabajo(trabajo.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div style={styles.total}>
                    <span>TOTAL GENERAL:</span>
                    <span>${calcularTotal()}</span>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button 
                      style={styles.clearAllButton}
                      onClick={() => {
                        const confirmar = window.confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos.');
                        if (confirmar) {
                          cerrarModal();
                        }
                      }}
                      disabled={cargando}
                    >
                      ❌ Cancelar Todo
                    </button>
                    <button 
                      style={styles.cancelButton}
                      onClick={cerrarModal}
                      disabled={cargando}
                    >
                      ← Volver Atrás
                    </button>
                    <button 
                      style={puedeFinalizar ? styles.button : styles.buttonDisabled} 
                      onClick={finalizarTrabajo}
                      disabled={!puedeFinalizar || cargando}
                    >
                      {cargando ? 'Creando...' : '🎉 Finalizar y Guardar Trabajo'}
                    </button>
                  </div>

                  {!puedeFinalizar && (
                    <div style={{marginTop: '0.5rem', color: '#dc2626', fontSize: '0.875rem'}}>
                      {!clinicaSeleccionada && "• Selecciona una clínica\n"}
                      {!dentistaSeleccionado && "• Selecciona un dentista\n"}
                      {trabajosAgregados.length === 0 && "• Agrega al menos un trabajo"}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTrabajos;