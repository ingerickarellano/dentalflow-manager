import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';


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
  descripcion?: string;
}

interface Laboratorista {
  id: string;
  nombre: string;
  especialidad: string;
  activo: boolean;
}

interface TrabajoPaciente {
  id: string;
  paciente: string;
  run?: string;
  dentista_id?: string;
  laboratorista_id?: string;
  servicios: Array<{
    servicio: Servicio;
    cantidad: number;
    piezasDentales: string[];
    notas?: string;
  }>;
  notasGenerales?: string;
}

const CrearTrabajo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('📍 CrearTrabajo - Ruta actual:', location.pathname);
  
  useEffect(() => {
    console.log('📍 CrearTrabajo - useEffect ejecutado');
    
    return () => {
      console.log('📍 CrearTrabajo - Componente desmontado');
    };
  }, []);
  
  // Clave para localStorage
  const STORAGE_KEY = 'crearTrabajoEstado';
  
  // Estados para datos cargados
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [laboratoristas, setLaboratoristas] = useState<Laboratorista[]>([]);
  const [cargando, setCargando] = useState(false);
  
  // Estados del formulario activo
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState<string>('');
  const [dentistaSeleccionado, setDentistaSeleccionado] = useState<string>('');
  const [laboratoristaSeleccionado, setLaboratoristaSeleccionado] = useState<string>('');
  const [nombrePaciente, setNombrePaciente] = useState<string>('');
  const [runPaciente, setRunPaciente] = useState<string>('');
  const [notasGenerales, setNotasGenerales] = useState<string>('');
  
  // Estados para selección de servicios
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [piezasSeleccionadas, setPiezasSeleccionadas] = useState<string[]>([]);
  
  // Estados para la lista de trabajos
  const [trabajosPacientes, setTrabajosPacientes] = useState<TrabajoPaciente[]>([]);
  const [serviciosPacienteActual, setServiciosPacienteActual] = useState<
    Array<{
      servicio: Servicio;
      cantidad: number;
      piezasDentales: string[];
      notas?: string;
    }>
  >([]);
  
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState<string>('');
  const [mostrarOdontogramaModal, setMostrarOdontogramaModal] = useState<boolean>(false);
  const [hoveredServicio, setHoveredServicio] = useState<string | null>(null);

  // Piezas dentales para el odontograma
  const piezasDentales = [
    '18', '17', '16', '15', '14', '13', '12', '11',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '48', '47', '46', '45', '44', '43', '42', '41',
    '31', '32', '33', '34', '35', '36', '37', '38'
  ];

  // Función para guardar estado en localStorage
  const guardarEstadoEnStorage = () => {
    const estado = {
      clinicaSeleccionada,
      dentistaSeleccionado,
      laboratoristaSeleccionado,
      nombrePaciente,
      runPaciente,
      notasGenerales,
      categoriaSeleccionada,
      busqueda,
      trabajosPacientes,
      serviciosPacienteActual,
      fechaEntregaEstimada,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  };

  // Función para cargar estado desde localStorage
  const cargarEstadoDesdeStorage = () => {
    try {
      const estadoGuardado = localStorage.getItem(STORAGE_KEY);
      if (estadoGuardado) {
        const estado = JSON.parse(estadoGuardado);
        
        if (estado.clinicaSeleccionada) setClinicaSeleccionada(estado.clinicaSeleccionada);
        if (estado.dentistaSeleccionado) setDentistaSeleccionado(estado.dentistaSeleccionado);
        if (estado.laboratoristaSeleccionado) setLaboratoristaSeleccionado(estado.laboratoristaSeleccionado);
        if (estado.nombrePaciente) setNombrePaciente(estado.nombrePaciente);
        if (estado.runPaciente) setRunPaciente(estado.runPaciente);
        if (estado.notasGenerales) setNotasGenerales(estado.notasGenerales);
        if (estado.categoriaSeleccionada) setCategoriaSeleccionada(estado.categoriaSeleccionada);
        if (estado.busqueda) setBusqueda(estado.busqueda);
        if (estado.trabajosPacientes) setTrabajosPacientes(estado.trabajosPacientes);
        if (estado.serviciosPacienteActual) setServiciosPacienteActual(estado.serviciosPacienteActual);
        if (estado.fechaEntregaEstimada) setFechaEntregaEstimada(estado.fechaEntregaEstimada);
      }
    } catch (error) {
      console.error('Error cargando estado desde localStorage:', error);
    }
  };

  // Limpiar localStorage
  const limpiarStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Efecto para guardar estado cuando cambie
  useEffect(() => {
    guardarEstadoEnStorage();
  }, [
    clinicaSeleccionada,
    dentistaSeleccionado,
    laboratoristaSeleccionado,
    nombrePaciente,
    runPaciente,
    notasGenerales,
    categoriaSeleccionada,
    busqueda,
    trabajosPacientes,
    serviciosPacienteActual,
    fechaEntregaEstimada,
  ]);

  // Cargar datos al montar el componente
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // Primero cargar el estado guardado
      if (isMounted) cargarEstadoDesdeStorage();
      
      // Luego cargar datos desde supabase
      await cargarDatos();
      
      // Establecer fecha de entrega por defecto si no hay una guardada
      if (isMounted && !fechaEntregaEstimada) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 7);
        setFechaEntregaEstimada(fecha.toISOString().split('T')[0]);
      }
    };
    
    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // También guardar estado cuando la pestaña se oculta
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        guardarEstadoEnStorage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // También guardar antes de que el usuario cierre la página
    window.addEventListener('beforeunload', guardarEstadoEnStorage);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', guardarEstadoEnStorage);
    };
  }, [
    clinicaSeleccionada,
    dentistaSeleccionado,
    laboratoristaSeleccionado,
    nombrePaciente,
    runPaciente,
    notasGenerales,
    categoriaSeleccionada,
    busqueda,
    trabajosPacientes,
    serviciosPacienteActual,
    fechaEntregaEstimada,
  ]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // NO redirigir automáticamente, solo mostrar en consola
        console.log('Usuario no autenticado');
        return;
      }

      const [clinicasRes, dentistasRes, serviciosRes, laboratoristasRes] = await Promise.all([
        supabase.from('clinicas').select('*').eq('usuario_id', user.id),
        supabase.from('dentistas').select('*').eq('usuario_id', user.id),
        supabase.from('servicios').select('*').eq('usuario_id', user.id).eq('activo', true),
        supabase.from('laboratoristas').select('*').eq('usuario_id', user.id).eq('activo', true)
      ]);

      if (clinicasRes.data) setClinicas(clinicasRes.data);
      if (dentistasRes.data) setDentistas(dentistasRes.data);
      if (serviciosRes.data) setServicios(serviciosRes.data);
      if (laboratoristasRes.data) setLaboratoristas(laboratoristasRes.data);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar dentistas por clínica seleccionada
  const dentistasFiltrados = dentistas.filter(d => d.clinica_id === clinicaSeleccionada);

  // Filtrar servicios por categoría y búsqueda
  const serviciosFiltrados = servicios.filter(servicio => {
    const coincideCategoria = categoriaSeleccionada === 'todos' || servicio.categoria === categoriaSeleccionada;
    const coincideBusqueda = servicio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           (servicio.descripcion && servicio.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideCategoria && coincideBusqueda;
  });

  // Obtener categorías únicas
  const categorias = ['todos', ...Array.from(new Set(servicios.map(s => s.categoria)))];

  // Agregar servicio SIN piezas dentales
  const agregarServicioSinPiezas = (servicio: Servicio) => {
    if (!nombrePaciente) {
      alert('Por favor completa la información del paciente primero');
      return;
    }

    const nuevoServicio = {
      servicio: servicio,
      cantidad: 1,
      piezasDentales: [],
      notas: ''
    };

    setServiciosPacienteActual([...serviciosPacienteActual, nuevoServicio]);
    
    // Feedback visual
    setTimeout(() => {
      alert(`✅ ${servicio.nombre} agregado al paciente (sin piezas específicas)`);
    }, 100);
  };

  // Agregar servicio CON piezas dentales (desde modal)
  const agregarServicioConPiezas = () => {
    if (!servicioSeleccionado || !nombrePaciente) {
      alert('Por favor completa la información del paciente primero');
      return;
    }

    if (piezasSeleccionadas.length === 0) {
      const confirmar = window.confirm('No has seleccionado ninguna pieza dental. ¿Deseas continuar sin especificar pieza?');
      if (!confirmar) return;
    }

    const nuevoServicio = {
      servicio: servicioSeleccionado,
      cantidad: 1,
      piezasDentales: [...piezasSeleccionadas],
      notas: ''
    };

    setServiciosPacienteActual([...serviciosPacienteActual, nuevoServicio]);
    
    // Cerrar modal y resetear
    setMostrarOdontogramaModal(false);
    setServicioSeleccionado(null);
    setPiezasSeleccionadas([]);
    
    // Feedback visual
    setTimeout(() => {
      alert(`✅ ${servicioSeleccionado.nombre} agregado al paciente`);
    }, 100);
  };

  // Función para abrir modal de odontograma
  const abrirOdontogramaModal = (servicio: Servicio) => {
    setServicioSeleccionado(servicio);
    setMostrarOdontogramaModal(true);
    setPiezasSeleccionadas([]);
  };

  // Agregar paciente a la lista de trabajos
  const agregarPacienteALista = () => {
    if (!nombrePaciente) {
      alert('Por favor ingresa el nombre del paciente');
      return;
    }

    if (serviciosPacienteActual.length === 0) {
      alert('Por favor agrega al menos un servicio para este paciente');
      return;
    }

    const nuevoPaciente: TrabajoPaciente = {
      id: Date.now().toString() + Math.random(),
      paciente: nombrePaciente,
      run: runPaciente || undefined,
      dentista_id: dentistaSeleccionado || undefined,
      laboratorista_id: laboratoristaSeleccionado || undefined,
      servicios: [...serviciosPacienteActual],
      notasGenerales: notasGenerales || undefined
    };

    setTrabajosPacientes([...trabajosPacientes, nuevoPaciente]);
    
    // Resetear para nuevo paciente
    setNombrePaciente('');
    setRunPaciente('');
    setNotasGenerales('');
    setServiciosPacienteActual([]);
    setServicioSeleccionado(null);
    setPiezasSeleccionadas([]);
    
    alert(`✅ Paciente "${nuevoPaciente.paciente}" agregado a la lista`);
  };

  // Eliminar paciente de la lista
  const eliminarPacienteDeLista = (id: string) => {
    setTrabajosPacientes(trabajosPacientes.filter(t => t.id !== id));
  };

  // Eliminar servicio del paciente actual
  const eliminarServicioDePaciente = (index: number) => {
    const nuevosServicios = [...serviciosPacienteActual];
    nuevosServicios.splice(index, 1);
    setServiciosPacienteActual(nuevosServicios);
  };

  // Calcular total para un paciente
  const calcularTotalPaciente = (servicios: any[]) => {
    return servicios.reduce((total, item) => 
      total + (item.servicio.precio_base * item.cantidad), 0
    );
  };

  // Calcular total general
  const calcularTotalGeneral = () => {
    return trabajosPacientes.reduce((total, paciente) => 
      total + calcularTotalPaciente(paciente.servicios), 0
    );
  };

  // Guardar todos los trabajos en la base de datos
  const guardarTodosLosTrabajos = async () => {
    if (trabajosPacientes.length === 0) {
      alert('No hay pacientes en la lista para guardar');
      return;
    }

    if (!clinicaSeleccionada) {
      alert('Por favor selecciona una clínica');
      return;
    }

    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('No hay usuario autenticado');
        return;
      }

      // Preparar todos los trabajos para insertar
      const trabajosParaBD = trabajosPacientes.map(paciente => {
        const serviciosParaBD = paciente.servicios.map(item => ({
          servicio_id: item.servicio.id,
          cantidad: item.cantidad,
          precio_unitario: item.servicio.precio_base,
          precio_total: item.servicio.precio_base * item.cantidad,
          nombre: item.servicio.nombre,
          piezas_dentales: item.piezasDentales.length > 0 ? item.piezasDentales : null,
          notas: item.notas || null
        }));

        return {
          paciente: paciente.paciente.trim(),
          run_paciente: paciente.run?.trim() || null,
          clinica_id: clinicaSeleccionada,
          dentista_id: paciente.dentista_id || null,
          laboratorista_id: paciente.laboratorista_id || null,
          servicios: serviciosParaBD,
          precio_total: calcularTotalPaciente(paciente.servicios),
          usuario_id: user.id,
          estado: 'pendiente',
          notas: paciente.notasGenerales || null,
          fecha_entrega_estimada: fechaEntregaEstimada,
          fecha_creacion: new Date().toISOString()
        };
      });

      // Insertar todos los trabajos
      const { data, error } = await supabase
        .from('trabajos')
        .insert(trabajosParaBD)
        .select();

      if (error) throw error;

      const mensaje = trabajosPacientes.length === 1 
        ? '✅ ¡Trabajo creado exitosamente!' 
        : `✅ ¡${trabajosPacientes.length} trabajos creados exitosamente!`;

      alert(mensaje);
      resetearTodo();
      navigate('/trabajos');

    } catch (error: any) {
      console.error('Error creando trabajos:', error);
      alert(`❌ Error al crear los trabajos: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Resetear todo
  const resetearTodo = () => {
    setClinicaSeleccionada('');
    setDentistaSeleccionado('');
    setLaboratoristaSeleccionado('');
    setNombrePaciente('');
    setRunPaciente('');
    setTrabajosPacientes([]);
    setServiciosPacienteActual([]);
    setNotasGenerales('');
    setServicioSeleccionado(null);
    setPiezasSeleccionadas([]);
    setMostrarOdontogramaModal(false);
    setBusqueda('');
    setCategoriaSeleccionada('todos');
    
    // Limpiar localStorage
    limpiarStorage();
    
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 7);
    setFechaEntregaEstimada(fecha.toISOString().split('T')[0]);
  };

  // Función para manejar selección de piezas dentales
  const togglePiezaDental = (pieza: string) => {
    setPiezasSeleccionadas(prev => {
      if (prev.includes(pieza)) {
        return prev.filter(p => p !== pieza);
      } else {
        return [...prev, pieza];
      }
    });
  };

  // Validaciones
  const puedeAgregarPaciente = nombrePaciente && serviciosPacienteActual.length > 0;
  const puedeGuardarTodo = clinicaSeleccionada && trabajosPacientes.length > 0;

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
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    title: {
      color: '#1e293b',
      fontSize: '1.75rem',
      fontWeight: 'bold',
      margin: 0
    },
    backButton: {
      backgroundColor: '#64748b',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    configPanel: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem'
    },
    configTitle: {
      color: '#1e293b',
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem'
    },
    configGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '1rem'
    },
    pacientePanel: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem'
    },
    pacienteHeaderInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    pacienteTitle: {
      color: '#1e293b',
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: 0
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formGroupRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    labelRequired: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    requiredStar: {
      color: '#dc2626'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    buttonSecondary: {
      backgroundColor: '#6b7280',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600'
    },
    buttonWarning: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600'
    },
    buttonDanger: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600'
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'not-allowed',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    serviciosPanel: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem'
    },
    searchContainer: {
      marginBottom: '1rem'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\' width=\'20\' height=\'20\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\' /%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '1rem center',
      backgroundSize: '20px 20px'
    },
    categoriaFilters: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    categoriaButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '9999px',
      backgroundColor: 'white',
      color: '#374151',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    categoriaButtonActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    serviciosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    servicioCard: {
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1rem',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      height: '100%'
    },
    servicioCardHover: {
      borderColor: '#3b82f6',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
    },
    servicioNombre: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: '0 0 0.5rem 0',
      minHeight: '2.5rem'
    },
    servicioPrecio: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#059669',
      margin: '0.5rem 0'
    },
    servicioCategoria: {
      fontSize: '0.75rem',
      color: '#6b7280',
      backgroundColor: '#f3f4f6',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      display: 'inline-block'
    },
    servicioButtons: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    serviciosPacienteContainer: {
      backgroundColor: '#f8fafc',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginTop: '1rem'
    },
    servicioItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      marginBottom: '0.75rem',
      border: '1px solid #e5e7eb'
    },
    servicioItemInfo: {
      flex: 1
    },
    servicioItemNombre: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    servicioItemDetalles: {
      fontSize: '0.75rem',
      color: '#64748b',
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    servicioItemPrecio: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#059669'
    },
    listaPacientesContainer: {
      backgroundColor: '#f8fafc',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginTop: '1.5rem'
    },
    pacienteItem: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    pacienteHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    pacienteNombre: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    pacienteRun: {
      fontSize: '0.875rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    serviciosList: {
      marginTop: '1rem'
    },
    servicioResumenItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem'
    },
    totalPaciente: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: '1rem',
      marginTop: '1rem',
      borderTop: '1px solid #e5e7eb',
      fontWeight: '600',
      color: '#1e293b'
    },
    totalGeneralContainer: {
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '1.5rem',
      borderRadius: '1rem',
      marginTop: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    totalGeneralLabel: {
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    totalGeneralMonto: {
      fontSize: '1.5rem',
      fontWeight: '700'
    },
    actionsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      flexDirection: 'column',
      gap: '1rem'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e2e8f0',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b',
      backgroundColor: '#f9fafb',
      borderRadius: '0.75rem'
    },
    counterBadge: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '9999px',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginLeft: '0.5rem'
    },
    chip: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      display: 'inline-block'
    },
    pacienteActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    // Estilos para el modal de odontograma
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#64748b'
    },
    odontogramaContainer: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '1rem',
      marginTop: '1rem',
      marginBottom: '1rem'
    },
    odontogramaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    piezaButton: {
      padding: '0.75rem 0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '0.75rem',
      textAlign: 'center',
      transition: 'all 0.2s',
      fontWeight: '500'
    },
    piezaButtonSelected: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    piezasSeleccionadasContainer: {
      backgroundColor: '#eff6ff',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginTop: '1rem'
    },
    piezasList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    piezaTag: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    removePiezaButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.75rem',
      padding: 0
    },
    // Botón flotante de guardar
    floatingSaveButton: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 999
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button 
            style={styles.backButton} 
            onClick={() => navigate('/dashboard')}
          >
            ← Volver
          </button>
          <h1 style={styles.title}>
            🦷 Crear Lista de Trabajos 
            {trabajosPacientes.length > 0 && (
              <span style={styles.counterBadge}>
                {trabajosPacientes.length} paciente{trabajosPacientes.length !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            style={puedeGuardarTodo ? styles.buttonSuccess : styles.buttonDisabled}
            onClick={guardarTodosLosTrabajos}
            disabled={!puedeGuardarTodo || cargando}
          >
            {cargando ? '🔄 Guardando...' : `💾 Guardar Lista (${trabajosPacientes.length})`}
          </button>
          <button
            style={styles.buttonSecondary}
            onClick={() => {
              const confirmar = window.confirm('¿Estás seguro de que quieres limpiar todo el formulario? Se perderán los datos no guardados.');
              if (confirmar) resetearTodo();
            }}
          >
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>

      {/* Panel de Configuración General */}
      <div style={styles.configPanel}>
        <div style={styles.configTitle}>
          ⚙️ Configuración General
        </div>
        
        <div style={styles.configGrid}>
          <div style={styles.formGroup}>
            <label style={styles.labelRequired}>
              Clínica <span style={styles.requiredStar}>*</span>
            </label>
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
            <label style={styles.label}>Dentista (Opcional)</label>
            <select 
              style={styles.select}
              value={dentistaSeleccionado}
              onChange={(e) => setDentistaSeleccionado(e.target.value)}
              disabled={!clinicaSeleccionada}
            >
              <option value="">Sin especificar</option>
              {dentistasFiltrados.map(dentista => (
                <option key={dentista.id} value={dentista.id}>
                  {dentista.nombre} ({dentista.especialidad})
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
              {laboratoristas.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.nombre} ({lab.especialidad})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha de Entrega</label>
            <input
              type="date"
              style={styles.input}
              value={fechaEntregaEstimada}
              onChange={(e) => setFechaEntregaEstimada(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Panel del Paciente Actual */}
      <div style={styles.pacientePanel}>
        <div style={styles.pacienteHeaderInfo}>
          <h2 style={styles.pacienteTitle}>
            👤 Paciente Actual
            {serviciosPacienteActual.length > 0 && (
              <span style={styles.chip}>
                {serviciosPacienteActual.length} servicio{serviciosPacienteActual.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
        </div>

        <div style={styles.formGroupRow}>
          <div style={styles.formGroup}>
            <label style={styles.labelRequired}>
              Nombre del Paciente <span style={styles.requiredStar}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={nombrePaciente}
              onChange={(e) => setNombrePaciente(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>RUN/RUT (Opcional)</label>
            <input
              type="text"
              style={styles.input}
              value={runPaciente}
              onChange={(e) => setRunPaciente(e.target.value)}
              placeholder="12.345.678-9"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Notas para este paciente (Opcional)</label>
          <textarea
            style={styles.textarea}
            value={notasGenerales}
            onChange={(e) => setNotasGenerales(e.target.value)}
            placeholder="Notas específicas para este paciente..."
            rows={2}
          />
        </div>

        <div style={styles.pacienteActions}>
          <button
            style={styles.buttonSecondary}
            onClick={() => {
              setNombrePaciente('');
              setRunPaciente('');
              setNotasGenerales('');
              setServiciosPacienteActual([]);
            }}
            disabled={!nombrePaciente && !runPaciente && serviciosPacienteActual.length === 0}
          >
            🔄 Limpiar Paciente
          </button>
          
          <button
            style={puedeAgregarPaciente ? styles.buttonWarning : styles.buttonDisabled}
            onClick={agregarPacienteALista}
            disabled={!puedeAgregarPaciente}
          >
            👥 Agregar a la Lista
          </button>
        </div>
      </div>

      {/* Panel de Servicios CON BOTONES DIRECTOS */}
      <div style={styles.serviciosPanel}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>
          🛠️ Buscar y Seleccionar Servicios
        </h3>

        {/* Buscador de servicios */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="🔍 Buscar servicios (nombre, descripción)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Filtros por categoría */}
        <div style={styles.categoriaFilters}>
          {categorias.map(categoria => (
            <button
              key={categoria}
              style={{
                ...styles.categoriaButton,
                ...(categoriaSeleccionada === categoria ? styles.categoriaButtonActive : {})
              }}
              onClick={() => setCategoriaSeleccionada(categoria)}
            >
              {categoria === 'todos' ? 'Todos' : categoria}
            </button>
          ))}
        </div>

        {/* Grid de servicios CON BOTONES INCLUIDOS */}
        {cargando ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <div>Cargando servicios...</div>
          </div>
        ) : (
          <div style={styles.serviciosGrid}>
            {serviciosFiltrados.map(servicio => (
              <div
                key={servicio.id}
                style={{
                  ...styles.servicioCard,
                  ...(hoveredServicio === servicio.id ? styles.servicioCardHover : {})
                }}
                onMouseEnter={() => setHoveredServicio(servicio.id)}
                onMouseLeave={() => setHoveredServicio(null)}
              >
                <h4 style={styles.servicioNombre}>{servicio.nombre}</h4>
                <div style={styles.servicioPrecio}>${servicio.precio_base}</div>
                {servicio.descripcion && (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    {servicio.descripcion.substring(0, 80)}...
                  </p>
                )}
                <div style={styles.servicioCategoria}>{servicio.categoria}</div>
                
                {/* BOTONES DIRECTOS EN CADA SERVICIO */}
                <div style={styles.servicioButtons}>
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: '#10b981',
                      flex: 1
                    }}
                    onClick={() => agregarServicioSinPiezas(servicio)}
                    disabled={!nombrePaciente}
                    title="Agregar sin especificar piezas dentales"
                  >
                    ➕ Agregar
                  </button>
                  
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: '#3b82f6',
                      flex: 1
                    }}
                    onClick={() => abrirOdontogramaModal(servicio)}
                    disabled={!nombrePaciente}
                    title="Seleccionar piezas dentales específicas"
                  >
                    🦷 Piezas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de servicios del paciente actual */}
      {serviciosPacienteActual.length > 0 && (
        <div style={styles.serviciosPacienteContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>
              📋 Servicios de {nombrePaciente || 'este paciente'}
            </h3>
            <button
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
              onClick={() => {
                const confirmar = window.confirm('¿Eliminar todos los servicios de este paciente?');
                if (confirmar) setServiciosPacienteActual([]);
              }}
            >
              🗑️ Limpiar Todo
            </button>
          </div>
          
          {serviciosPacienteActual.map((item, index) => (
            <div key={index} style={styles.servicioItem}>
              <div style={styles.servicioItemInfo}>
                <div style={styles.servicioItemNombre}>{item.servicio.nombre}</div>
                <div style={styles.servicioItemDetalles}>
                  <span>Cantidad: {item.cantidad}</span>
                  {item.piezasDentales.length > 0 && (
                    <span>Piezas: {item.piezasDentales.join(', ')}</span>
                  )}
                  {item.notas && <span>Notas: {item.notas}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={styles.servicioItemPrecio}>
                  ${item.servicio.precio_base * item.cantidad}
                </div>
                <button
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                  onClick={() => eliminarServicioDePaciente(index)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <div style={styles.totalPaciente}>
            <span>Subtotal para este paciente:</span>
            <span>${calcularTotalPaciente(serviciosPacienteActual)}</span>
          </div>
        </div>
      )}

      {/* Lista de pacientes agregados */}
      {trabajosPacientes.length > 0 && (
        <div style={styles.listaPacientesContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>
              📝 Lista de Pacientes ({trabajosPacientes.length})
            </h3>
            <button
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              onClick={() => {
                const confirmar = window.confirm('¿Estás seguro de que quieres eliminar todos los pacientes de la lista?');
                if (confirmar) setTrabajosPacientes([]);
              }}
            >
              🗑️ Vaciar Lista
            </button>
          </div>
          
          {trabajosPacientes.map((paciente) => (
            <div key={paciente.id} style={styles.pacienteItem}>
              <div style={styles.pacienteHeader}>
                <div>
                  <h4 style={styles.pacienteNombre}>{paciente.paciente}</h4>
                  {paciente.run && <div style={styles.pacienteRun}>RUN: {paciente.run}</div>}
                </div>
                <button
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                  onClick={() => eliminarPacienteDeLista(paciente.id)}
                >
                  Eliminar
                </button>
              </div>

              <div style={styles.serviciosList}>
                {paciente.servicios.map((servicio, index) => (
                  <div key={index} style={styles.servicioResumenItem}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {servicio.servicio.nombre}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Cantidad: {servicio.cantidad}
                        {servicio.piezasDentales.length > 0 && ` • Piezas: ${servicio.piezasDentales.join(', ')}`}
                        {servicio.notas && ` • Notas: ${servicio.notas}`}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: '#059669' }}>
                      ${servicio.servicio.precio_base * servicio.cantidad}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.totalPaciente}>
                <span>Total:</span>
                <span>${calcularTotalPaciente(paciente.servicios)}</span>
              </div>
            </div>
          ))}

          {/* Total general */}
          <div style={styles.totalGeneralContainer}>
            <div style={styles.totalGeneralLabel}>
              TOTAL GENERAL ({trabajosPacientes.length} paciente{trabajosPacientes.length !== 1 ? 's' : ''})
            </div>
            <div style={styles.totalGeneralMonto}>${calcularTotalGeneral()}</div>
          </div>

          <div style={styles.actionsContainer}>
            <button
              style={styles.buttonSecondary}
              onClick={resetearTodo}
              disabled={cargando}
            >
              🔄 Reiniciar Todo
            </button>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {trabajosPacientes.length === 0 && serviciosPacienteActual.length === 0 && !cargando && (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
            Lista de trabajos vacía
          </h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
            Comienza agregando servicios a un paciente. Cada servicio tiene dos botones para agregarlo.
          </p>
        </div>
      )}

      {/* Botón flotante de guardar */}
      {trabajosPacientes.length > 0 && (
        <div style={styles.floatingSaveButton}>
          <button
            style={puedeGuardarTodo ? {
              backgroundColor: '#10b981',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            } : {
              backgroundColor: '#9ca3af',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '50px',
              cursor: 'not-allowed',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={guardarTodosLosTrabajos}
            disabled={!puedeGuardarTodo || cargando}
          >
            {cargando ? '🔄' : '💾'} 
            {cargando ? ' Guardando...' : ` Guardar (${trabajosPacientes.length})`}
          </button>
        </div>
      )}

      {/* Modal de Odontograma */}
      {mostrarOdontogramaModal && servicioSeleccionado && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setMostrarOdontogramaModal(false);
          }
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                🦷 Selecciona las piezas para: {servicioSeleccionado.nombre}
              </h2>
              <button 
                style={styles.closeButton}
                onClick={() => setMostrarOdontogramaModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.odontogramaContainer}>
              <div style={styles.odontogramaGrid}>
                {piezasDentales.map(pieza => (
                  <button
                    key={pieza}
                    style={{
                      ...styles.piezaButton,
                      ...(piezasSeleccionadas.includes(pieza) ? styles.piezaButtonSelected : {})
                    }}
                    onClick={() => togglePiezaDental(pieza)}
                  >
                    {pieza}
                  </button>
                ))}
              </div>

              {piezasSeleccionadas.length > 0 && (
                <div style={styles.piezasSeleccionadasContainer}>
                  <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                    Piezas seleccionadas ({piezasSeleccionadas.length}):
                  </div>
                  <div style={styles.piezasList}>
                    {piezasSeleccionadas.map(pieza => (
                      <div key={pieza} style={styles.piezaTag}>
                        {pieza}
                        <button
                          style={styles.removePiezaButton}
                          onClick={() => togglePiezaDental(pieza)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setMostrarOdontogramaModal(false)}
              >
                Cancelar
              </button>
              <button
                style={servicioSeleccionado ? styles.buttonSuccess : styles.buttonDisabled}
                onClick={agregarServicioConPiezas}
                disabled={!servicioSeleccionado}
              >
                ➕ Agregar con Piezas Seleccionadas
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CrearTrabajo;