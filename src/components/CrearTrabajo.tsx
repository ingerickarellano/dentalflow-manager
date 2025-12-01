import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

interface TrabajoAgregado {
  id: string;
  paciente: string;
  servicio: Servicio;
  cantidad: number;
  piezaDental: string;
  precioUnitario: number;
}

const CrearTrabajo: React.FC = () => {
  const navigate = useNavigate();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [laboratoristas, setLaboratoristas] = useState<Laboratorista[]>([]);
  const [cargando, setCargando] = useState(false);
  
  // Estados para el formulario de creación
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState<string>('');
  const [dentistaSeleccionado, setDentistaSeleccionado] = useState<string>('');
  const [laboratoristaSeleccionado, setLaboratoristaSeleccionado] = useState<string>('');
  const [nombrePaciente, setNombrePaciente] = useState<string>('');
  const [trabajosAgregados, setTrabajosAgregados] = useState<TrabajoAgregado[]>([]);
  const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
  const [piezasDentales, setPiezasDentales] = useState<{ [key: string]: string }>({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaType>('fija');
  const [notas, setNotas] = useState<string>('');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState<string>('');
  const [pasoActual, setPasoActual] = useState<number>(1);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('No hay usuario autenticado');
        return;
      }

      const [clinicasRes, dentistasRes, serviciosRes, laboratoristasRes] = await Promise.all([
        supabase.from('clinicas').select('*').eq('usuario_id', user.id),
        supabase.from('dentistas').select('*').eq('usuario_id', user.id),
        supabase.from('servicios').select('*').eq('usuario_id', user.id),
        supabase.from('laboratoristas').select('*').eq('usuario_id', user.id)
      ]);

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

    const trabajo: TrabajoAgregado = {
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
    if (!clinicaSeleccionada) {
      alert('Por favor selecciona una clínica');
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

      // ✅ CORREGIDO: Si no se elige fecha, usar la fecha actual (hoy)
      const fechaEntregaFormateada = fechaEntregaEstimada || new Date().toISOString().split('T')[0];

      const trabajoData: any = {
        paciente: nombrePaciente.trim(),
        clinica_id: clinicaSeleccionada,
        dentista_id: dentistaSeleccionado || null, // ✅ CORREGIDO: Ahora es opcional
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
        alert('✅ ¡Trabajo creado exitosamente!');
        resetForm();
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Error creando trabajo:', error);
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
    setPasoActual(1);
  };

  // ✅ CORREGIDO: Ahora solo requiere clínica y paciente, dentista es opcional
  const puedeAvanzarPaso1 = nombrePaciente && clinicaSeleccionada;
  const puedeFinalizar = clinicaSeleccionada && trabajosAgregados.length > 0;

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
    progressBar: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      position: 'relative'
    },
    progressStep: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      position: 'relative'
    },
    stepNumber: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      zIndex: 2
    },
    stepNumberActive: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    stepNumberInactive: {
      backgroundColor: '#e5e7eb',
      color: '#6b7280'
    },
    stepLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      textAlign: 'center'
    },
    stepLabelActive: {
      color: '#2563eb'
    },
    stepLabelInactive: {
      color: '#6b7280'
    },
    progressLine: {
      position: 'absolute',
      top: '20px',
      left: '0',
      right: '0',
      height: '2px',
      backgroundColor: '#e5e7eb',
      zIndex: 1
    },
    progressLineActive: {
      backgroundColor: '#2563eb'
    },
    formContainer: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
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
    labelOpcional: {
      display: 'block',
      color: '#6b7280',
      fontSize: '0.875rem',
      fontWeight: '400',
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
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    buttonSecondary: {
      backgroundColor: '#6b7280',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem',
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
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'not-allowed',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    serviciosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    servicioCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      padding: '1rem',
      backgroundColor: 'white',
      transition: 'all 0.2s'
    },
    servicioCardHover: {
      borderColor: '#2563eb',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
      marginTop: '1rem'
    },
    trabajoItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      transition: 'background-color 0.2s'
    },
    trabajoItemHover: {
      backgroundColor: '#f9fafb'
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
      transition: 'all 0.2s',
      fontSize: '0.875rem'
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
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '2rem'
    },
    clearButton: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    resumenInfo: {
      backgroundColor: '#f0f9ff',
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
      border: '1px solid #bae6fd'
    },
    resumenItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    },
    servicioResumen: {
      backgroundColor: '#f8fafc',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      marginBottom: '0.5rem',
      fontSize: '0.875rem'
    },
    helperText: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
      fontStyle: 'italic'
    }
  };

  const [hoveredServicio, setHoveredServicio] = useState<string | null>(null);
  const [hoveredTrabajo, setHoveredTrabajo] = useState<string | null>(null);

  // Renderizar el paso actual
  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <div style={styles.formContainer}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>
              📝 Información Básica del Trabajo
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
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

              {/* ✅ CORREGIDO: Dentista ahora es opcional */}
              <div style={styles.formGroup}>
                <label style={styles.labelOpcional}>Dentista (Opcional)</label>
                <select 
                  style={styles.select}
                  value={dentistaSeleccionado}
                  onChange={(e) => setDentistaSeleccionado(e.target.value)}
                  disabled={!clinicaSeleccionada}
                >
                  <option value="">Sin especificar</option>
                  {dentistasFiltrados.map(dentista => (
                    <option key={dentista.id} value={dentista.id}>
                      {dentista.nombre} - {dentista.especialidad}
                    </option>
                  ))}
                </select>
                {!clinicaSeleccionada && (
                  <div style={styles.helperText}>
                    Selecciona una clínica primero para ver los dentistas
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelOpcional}>Laboratorista (Opcional)</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
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

              {/* ✅ CORREGIDO: Fecha ahora es opcional, si no se elige será hoy */}
              <div style={styles.formGroup}>
                <label style={styles.labelOpcional}>Fecha de Entrega Estimada</label>
                <input
                  type="date"
                  style={styles.input}
                  value={fechaEntregaEstimada}
                  onChange={(e) => setFechaEntregaEstimada(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <div style={styles.helperText}>
                  Si no seleccionas fecha, se usará la fecha actual
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelOpcional}>Notas Adicionales</label>
              <textarea
                style={styles.input}
                rows={3}
                placeholder="Notas adicionales sobre el trabajo..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button style={styles.buttonSecondary} onClick={() => navigate('/dashboard')}>
                ← Cancelar
              </button>
              <button 
                style={puedeAvanzarPaso1 ? styles.button : styles.buttonDisabled}
                onClick={() => setPasoActual(2)}
                disabled={!puedeAvanzarPaso1}
              >
                Siguiente → Seleccionar Servicios
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            {/* Resumen de información básica */}
            <div style={styles.resumenInfo}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#0369a1' }}>
                Resumen del Trabajo
              </h4>
              <div style={styles.resumenItem}>
                <span><strong>Paciente:</strong></span>
                <span>{nombrePaciente}</span>
              </div>
              <div style={styles.resumenItem}>
                <span><strong>Clínica:</strong></span>
                <span>{clinicas.find(c => c.id === clinicaSeleccionada)?.nombre}</span>
              </div>
              <div style={styles.resumenItem}>
                <span><strong>Dentista:</strong></span>
                <span>{dentistaSeleccionado ? dentistas.find(d => d.id === dentistaSeleccionado)?.nombre : 'No especificado'}</span>
              </div>
              {laboratoristaSeleccionado && (
                <div style={styles.resumenItem}>
                  <span><strong>Laboratorista:</strong></span>
                  <span>{laboratoristas.find(l => l.id === laboratoristaSeleccionado)?.nombre}</span>
                </div>
              )}
              <div style={styles.resumenItem}>
                <span><strong>Fecha de Entrega:</strong></span>
                <span>
                  {fechaEntregaEstimada 
                    ? new Date(fechaEntregaEstimada).toLocaleDateString() 
                    : 'Hoy - ' + new Date().toLocaleDateString()
                  }
                </span>
              </div>
            </div>

            <div style={styles.formContainer}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>
                🛠️ Seleccionar Servicios
              </h3>

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
                <h4 style={styles.categoriaTitle}>{categorias[categoriaSeleccionada]}</h4>
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
                      <div 
                        key={servicio.id} 
                        style={{
                          ...styles.servicioCard,
                          ...(hoveredServicio === servicio.id ? styles.servicioCardHover : {})
                        }}
                        onMouseEnter={() => setHoveredServicio(servicio.id)}
                        onMouseLeave={() => setHoveredServicio(null)}
                      >
                        <div style={styles.servicioHeader}>
                          <div style={{flex: 1}}>
                            <strong style={{ fontSize: '0.875rem' }}>{servicio.nombre}</strong>
                            <div style={{color: '#2563eb', fontWeight: 'bold', marginTop: '0.5rem'}}>
                              ${servicio.precio_base}
                            </div>
                          </div>
                        </div>
                        
                        <div style={styles.controlesServicio}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Cantidad</div>
                            <input
                              type="number"
                              style={styles.inputCantidad}
                              value={cantidades[servicio.id] || 1}
                              min="1"
                              onChange={(e) => actualizarCantidad(servicio.id, parseInt(e.target.value) || 1)}
                            />
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Pieza</div>
                            <input
                              type="text"
                              style={styles.inputPieza}
                              value={piezasDentales[servicio.id] || ''}
                              onChange={(e) => actualizarPiezaDental(servicio.id, e.target.value)}
                              placeholder="Ej: 11"
                            />
                          </div>
                          
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
                  <h4 style={{ margin: 0, color: '#1e293b' }}>
                    📋 Servicios Agregados ({trabajosAgregados.length})
                  </h4>
                  {trabajosAgregados.length > 0 && (
                    <button 
                      style={styles.clearButton}
                      onClick={() => {
                        const confirmar = window.confirm('¿Estás seguro de que quieres eliminar todos los servicios agregados?');
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
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#64748b',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem'
                  }}>
                    No hay servicios agregados. Selecciona servicios de la lista superior.
                  </div>
                ) : (
                  <>
                    {trabajosAgregados.map((trabajo) => (
                      <div 
                        key={trabajo.id} 
                        style={{
                          ...styles.trabajoItem,
                          ...(hoveredTrabajo === trabajo.id ? styles.trabajoItemHover : {})
                        }}
                        onMouseEnter={() => setHoveredTrabajo(trabajo.id)}
                        onMouseLeave={() => setHoveredTrabajo(null)}
                      >
                        <div style={{flex: 1}}>
                          <strong style={{ fontSize: '0.875rem' }}>{trabajo.servicio.nombre}</strong>
                          <div style={{fontSize: '0.75rem', color: '#64748b'}}>
                            Cantidad: {trabajo.cantidad}
                            {trabajo.piezaDental && ` • Pieza: ${trabajo.piezaDental}`}
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontWeight: 'bold', color: '#2563eb', fontSize: '0.875rem'}}>
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
                  </>
                )}
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  style={styles.buttonSecondary}
                  onClick={() => setPasoActual(1)}
                >
                  ← Volver Atrás
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    style={styles.buttonSecondary}
                    onClick={resetForm}
                  >
                    🔄 Reiniciar
                  </button>
                  <button 
                    style={puedeFinalizar ? styles.button : styles.buttonDisabled} 
                    onClick={finalizarTrabajo}
                    disabled={!puedeFinalizar || cargando}
                  >
                    {cargando ? '🔄 Guardando...' : '🎉 Finalizar y Guardar Trabajo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>📋 Crear Lista de Trabajo</h1>
        </div>
      </div>

      {/* Barra de progreso */}
      <div style={styles.progressBar}>
        <div style={styles.progressLine}></div>
        <div style={styles.progressStep}>
          <div style={{
            ...styles.stepNumber,
            ...(pasoActual >= 1 ? styles.stepNumberActive : styles.stepNumberInactive)
          }}>
            1
          </div>
          <div style={{
            ...styles.stepLabel,
            ...(pasoActual >= 1 ? styles.stepLabelActive : styles.stepLabelInactive)
          }}>
            Información Básica
          </div>
        </div>
        <div style={styles.progressStep}>
          <div style={{
            ...styles.stepNumber,
            ...(pasoActual >= 2 ? styles.stepNumberActive : styles.stepNumberInactive)
          }}>
            2
          </div>
          <div style={{
            ...styles.stepLabel,
            ...(pasoActual >= 2 ? styles.stepLabelActive : styles.stepLabelInactive)
          }}>
            Seleccionar Servicios
          </div>
        </div>
      </div>

      {cargando ? (
        <div style={styles.loadingText}>Cargando datos...</div>
      ) : (
        renderPaso()
      )}
    </div>
  );
};

export default CrearTrabajo;