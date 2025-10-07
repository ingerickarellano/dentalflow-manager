import React, { useState } from 'react';
import { Trabajo, trabajos, clinicas, dentistas, servicios } from '../data/database';

interface TrabajosProcesoProps {
  onBack: () => void;
}

// Componente para cada item de servicio en la lista de búsqueda
const ItemServicio: React.FC<{
  servicio: any;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
}> = ({ servicio, seleccionado, onSeleccionar }) => {
  const [hovered, setHovered] = useState(false);

  const styles = {
    itemServicio: {
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '0.875rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    itemServicioHover: {
      backgroundColor: '#f0f9ff'
    },
    itemServicioSeleccionado: {
      backgroundColor: '#dbeafe',
      fontWeight: '600'
    },
    precioServicio: {
      color: '#2563eb',
      fontWeight: 'bold',
      fontSize: '0.75rem'
    }
  };

  return (
    <div
      style={{
        ...styles.itemServicio,
        ...(hovered ? styles.itemServicioHover : {}),
        ...(seleccionado ? styles.itemServicioSeleccionado : {})
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSeleccionar(servicio.id)}
    >
      <div>
        <div style={{ fontWeight: seleccionado ? '600' : '400' }}>
          {servicio.nombre}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          {servicio.categoria}
        </div>
      </div>
      <span style={styles.precioServicio}>
        ${servicio.precioBase}
      </span>
    </div>
  );
};

const TrabajosProceso: React.FC<TrabajosProcesoProps> = ({ onBack }) => {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [actualizador, setActualizador] = useState(0);
  const [clinicaExpandida, setClinicaExpandida] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState<string | null>(null);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    servicioId: '',
    cantidad: 1,
    piezaDental: ''
  });
  const [busquedaServicio, setBusquedaServicio] = useState('');

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
    filtros: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap' as const
    },
    botonFiltro: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#374151'
    },
    botonFiltroActivo: {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    cardClinica: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem',
      borderLeft: '4px solid #2563eb'
    },
    headerClinica: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      cursor: 'pointer'
    },
    nombreClinica: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    resumenClinica: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem',
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem'
    },
    resumenItem: {
      textAlign: 'center' as const
    },
    resumenNumero: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2563eb'
    },
    resumenLabel: {
      fontSize: '0.875rem',
      color: '#64748b'
    },
    listaPacientes: {
      marginTop: '1rem'
    },
    pacienteItem: {
      padding: '1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem',
      backgroundColor: '#f8fafc'
    },
    headerPaciente: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    nombrePaciente: {
      fontWeight: 'bold',
      color: '#1e293b'
    },
    estado: {
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    estadoPendiente: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    estadoProduccion: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    estadoTerminado: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    estadoEntregado: {
      backgroundColor: '#e5e7eb',
      color: '#374151'
    },
    serviciosList: {
      margin: '0.5rem 0',
      padding: '0',
      listStyle: 'none'
    },
    servicioItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.25rem 0',
      fontSize: '0.875rem'
    },
    acciones: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem',
      flexWrap: 'wrap' as const
    },
    button: {
      padding: '0.25rem 0.75rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.75rem'
    },
    buttonPrimary: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    buttonWarning: {
      backgroundColor: '#f59e0b',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#64748b',
      color: 'white'
    },
    formAgregarPaciente: {
      padding: '1rem',
      border: '1px dashed #d1d5db',
      borderRadius: '0.5rem',
      marginTop: '1rem',
      backgroundColor: '#f0f9ff'
    },
    formGroup: {
      marginBottom: '0.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.25rem',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '0.375rem 0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem'
    },
    select: {
      width: '100%',
      padding: '0.375rem 0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    },
    totalClinica: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '2px solid #e2e8f0',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    accionesClinica: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      justifyContent: 'flex-end'
    },
    vacio: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: '#64748b'
    },
    // Nuevos estilos para el buscador
    buscadorContainer: {
      position: 'relative' as const,
      marginBottom: '0.5rem'
    },
    inputBuscador: {
      width: '100%',
      padding: '0.5rem 2.5rem 0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    },
    iconoBusqueda: {
      position: 'absolute' as const,
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280'
    },
    listaServicios: {
      maxHeight: '200px',
      overflowY: 'auto' as const,
      border: '1px solid #e5e7eb',
      borderRadius: '0.375rem',
      backgroundColor: 'white',
      marginTop: '0.25rem'
    },
    sinResultados: {
      padding: '1rem',
      textAlign: 'center' as const,
      color: '#6b7280',
      fontSize: '0.875rem'
    }
  };

  // Filtrar servicios según la búsqueda
  const serviciosFiltrados = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(busquedaServicio.toLowerCase()) ||
    servicio.categoria.toLowerCase().includes(busquedaServicio.toLowerCase())
  );

  // Agrupar trabajos por clínica
  const trabajosPorClinica = trabajos.reduce((acc, trabajo) => {
    if (!acc[trabajo.clinicaId]) {
      acc[trabajo.clinicaId] = [];
    }
    acc[trabajo.clinicaId].push(trabajo);
    return acc;
  }, {} as Record<string, Trabajo[]>);

  // Filtrar por estado
  const clinicasFiltradas = Object.entries(trabajosPorClinica)
    .filter(([clinicaId, trabajosClinica]) => {
      if (filtroEstado === 'todos') return true;
      return trabajosClinica.some(t => t.estado === filtroEstado);
    })
    .map(([clinicaId, trabajosClinica]) => ({
      clinicaId,
      clinica: clinicas.find(c => c.id === clinicaId)!,
      trabajos: trabajosClinica.filter(t => 
        filtroEstado === 'todos' || t.estado === filtroEstado
      )
    }));

  // Obtener nombre de dentista
  const obtenerNombreDentista = (dentistaId: string) => {
    const dentista = dentistas.find(d => d.id === dentistaId);
    return dentista ? dentista.nombre : 'Dentista no encontrado';
  };

  // Obtener nombre de servicio
  const obtenerNombreServicio = (servicioId: string) => {
    const servicio = servicios.find(s => s.id === servicioId);
    return servicio ? servicio.nombre : 'Servicio no encontrado';
  };

  // Cambiar estado de un trabajo
  const cambiarEstado = (trabajoId: string, nuevoEstado: 'pendiente' | 'produccion' | 'terminado' | 'entregado') => {
    const trabajoIndex = trabajos.findIndex(t => t.id === trabajoId);
    
    if (trabajoIndex !== -1) {
      trabajos[trabajoIndex].estado = nuevoEstado;
      setActualizador(prev => prev + 1);
      
      let mensaje = '';
      switch (nuevoEstado) {
        case 'produccion': mensaje = '✅ Producción iniciada'; break;
        case 'terminado': mensaje = '🎉 Trabajo terminado'; break;
        case 'entregado': mensaje = '📦 Trabajo entregado'; break;
        case 'pendiente': mensaje = '🔄 Trabajo reabierto'; break;
      }
      alert(mensaje);
    }
  };

  // Seleccionar servicio desde la lista de búsqueda
  const seleccionarServicio = (servicioId: string) => {
    setNuevoPaciente({ ...nuevoPaciente, servicioId });
    setBusquedaServicio(''); // Limpiar búsqueda después de seleccionar
  };

  // Agregar paciente a clínica
  const agregarPacienteAClinica = (clinicaId: string) => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.servicioId) {
      alert('Por favor completa el nombre del paciente y selecciona un servicio');
      return;
    }

    const servicio = servicios.find(s => s.id === nuevoPaciente.servicioId);
    if (!servicio) return;

    const nuevoTrabajo: Trabajo = {
      id: Date.now().toString(),
      clinicaId,
      dentistaId: dentistas.find(d => d.clinicaId === clinicaId)?.id || '',
      paciente: nuevoPaciente.nombre,
      servicios: [{
        servicioId: nuevoPaciente.servicioId,
        cantidad: nuevoPaciente.cantidad,
        precioUnitario: servicio.precioBase
      }],
      fechaRecibido: new Date().toISOString().split('T')[0],
      fechaEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'pendiente',
      precioTotal: servicio.precioBase * nuevoPaciente.cantidad,
      observaciones: nuevoPaciente.piezaDental ? `Pieza dental: ${nuevoPaciente.piezaDental}` : ''
    };

    trabajos.push(nuevoTrabajo);
    setActualizador(prev => prev + 1);
    setNuevoPaciente({ nombre: '', servicioId: '', cantidad: 1, piezaDental: '' });
    setModoEdicion(null);
    setBusquedaServicio('');
    
    alert(`✅ Paciente "${nuevoPaciente.nombre}" agregado a la clínica`);
  };

  // Generar reporte mensual por clínica
  const generarReporteMensual = (clinicaId: string, trabajosClinica: Trabajo[]) => {
    const clinica = clinicas.find(c => c.id === clinicaId);
    const mesActual = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });

    const contenido = `
REPORTE MENSUAL - ${mesActual.toUpperCase()}
CLÍNICA: ${clinica?.nombre}
=============================================

RESUMEN DEL MES:
----------------
Total de pacientes: ${trabajosClinica.length}
Total de servicios: ${trabajosClinica.reduce((sum, t) => sum + t.servicios.length, 0)}
Ingreso total: $${trabajosClinica.reduce((sum, t) => sum + t.precioTotal, 0)}

DETALLE DE PACIENTES:
---------------------
${trabajosClinica.map((trabajo, index) => `
${index + 1}. ${trabajo.paciente}
   Dentista: ${obtenerNombreDentista(trabajo.dentistaId)}
   Estado: ${obtenerTextoEstado(trabajo.estado)}
   Servicios: ${trabajo.servicios.map(s => 
     `${obtenerNombreServicio(s.servicioId)} (x${s.cantidad})`
   ).join(', ')}
   Total: $${trabajo.precioTotal}
   ${trabajo.observaciones ? `Observaciones: ${trabajo.observaciones}` : ''}
`).join('\n')}

=============================================
Generado el: ${new Date().toLocaleDateString()}
    `.trim();

    // Descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte-${clinica?.nombre}-${mesActual}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`📊 Reporte mensual generado para ${clinica?.nombre}\nTotal: ${trabajosClinica.length} pacientes`);
  };

  // Obtener estilo del estado
  const obtenerEstiloEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return { ...styles.estado, ...styles.estadoPendiente };
      case 'produccion': return { ...styles.estado, ...styles.estadoProduccion };
      case 'terminado': return { ...styles.estado, ...styles.estadoTerminado };
      case 'entregado': return { ...styles.estado, ...styles.estadoEntregado };
      default: return { ...styles.estado, ...styles.estadoPendiente };
    }
  };

  // Obtener texto del estado
  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'produccion': return 'En Producción';
      case 'terminado': return 'Terminado';
      case 'entregado': return 'Entregado';
      default: return estado;
    }
  };

  // Calcular estadísticas por clínica
  const calcularEstadisticasClinica = (trabajosClinica: Trabajo[]) => {
    const totalPacientes = trabajosClinica.length;
    const totalServicios = trabajosClinica.reduce((sum, t) => sum + t.servicios.length, 0);
    const totalIngresos = trabajosClinica.reduce((sum, t) => sum + t.precioTotal, 0);
    const pendientes = trabajosClinica.filter(t => t.estado === 'pendiente').length;
    const enProduccion = trabajosClinica.filter(t => t.estado === 'produccion').length;
    const terminados = trabajosClinica.filter(t => t.estado === 'terminado').length;
    const entregados = trabajosClinica.filter(t => t.estado === 'entregado').length;

    return { totalPacientes, totalServicios, totalIngresos, pendientes, enProduccion, terminados, entregados };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>🔧 Trabajos en Proceso - Por Clínica</h1>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtros}>
        <button
          style={filtroEstado === 'todos' ? { ...styles.botonFiltro, ...styles.botonFiltroActivo } : styles.botonFiltro}
          onClick={() => setFiltroEstado('todos')}
        >
          Todas las Clínicas
        </button>
        <button
          style={filtroEstado === 'pendiente' ? { ...styles.botonFiltro, ...styles.botonFiltroActivo } : styles.botonFiltro}
          onClick={() => setFiltroEstado('pendiente')}
        >
          Con Pendientes
        </button>
        <button
          style={filtroEstado === 'produccion' ? { ...styles.botonFiltro, ...styles.botonFiltroActivo } : styles.botonFiltro}
          onClick={() => setFiltroEstado('produccion')}
        >
          En Producción
        </button>
      </div>

      {/* Lista de Clínicas */}
      {clinicasFiltradas.length === 0 ? (
        <div style={styles.vacio}>
          <h3>No hay trabajos {filtroEstado !== 'todos' ? `en estado seleccionado` : ''}</h3>
          <p>Los trabajos se agruparán por clínica para mejor organización.</p>
        </div>
      ) : (
        clinicasFiltradas.map(({ clinicaId, clinica, trabajos: trabajosClinica }) => {
          const stats = calcularEstadisticasClinica(trabajosClinica);
          const expandida = clinicaExpandida === clinicaId;

          return (
            <div key={clinicaId} style={styles.cardClinica}>
              {/* Header de la Clínica */}
              <div 
                style={styles.headerClinica}
                onClick={() => setClinicaExpandida(expandida ? null : clinicaId)}
              >
                <h2 style={styles.nombreClinica}>
                  🏥 {clinica.nombre}
                  <span style={{ fontSize: '0.875rem', color: '#64748b', marginLeft: '1rem' }}>
                    ({trabajosClinica.length} paciente{trabajosClinica.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <span style={{ color: '#64748b' }}>
                  {expandida ? '▲' : '▼'}
                </span>
              </div>

              {/* Resumen de la Clínica */}
              <div style={styles.resumenClinica}>
                <div style={styles.resumenItem}>
                  <div style={styles.resumenNumero}>{stats.totalPacientes}</div>
                  <div style={styles.resumenLabel}>Pacientes</div>
                </div>
                <div style={styles.resumenItem}>
                  <div style={styles.resumenNumero}>{stats.totalServicios}</div>
                  <div style={styles.resumenLabel}>Servicios</div>
                </div>
                <div style={styles.resumenItem}>
                  <div style={styles.resumenNumero}>${stats.totalIngresos}</div>
                  <div style={styles.resumenLabel}>Ingresos</div>
                </div>
                <div style={styles.resumenItem}>
                  <div style={{...styles.resumenNumero, color: '#92400e'}}>{stats.pendientes}</div>
                  <div style={styles.resumenLabel}>Pendientes</div>
                </div>
                <div style={styles.resumenItem}>
                  <div style={{...styles.resumenNumero, color: '#1e40af'}}>{stats.enProduccion}</div>
                  <div style={styles.resumenLabel}>En Producción</div>
                </div>
              </div>

              {/* Lista de Pacientes (expandible) */}
              {expandida && (
                <div style={styles.listaPacientes}>
                  {trabajosClinica.map(trabajo => (
                    <div key={trabajo.id} style={styles.pacienteItem}>
                      <div style={styles.headerPaciente}>
                        <span style={styles.nombrePaciente}>
                          👤 {trabajo.paciente} - {obtenerNombreDentista(trabajo.dentistaId)}
                        </span>
                        <span style={obtenerEstiloEstado(trabajo.estado)}>
                          {obtenerTextoEstado(trabajo.estado)}
                        </span>
                      </div>

                      <ul style={styles.serviciosList}>
                        {trabajo.servicios.map((servicio, index) => (
                          <li key={index} style={styles.servicioItem}>
                            <span>
                              {obtenerNombreServicio(servicio.servicioId)} 
                              {servicio.cantidad > 1 && ` (x${servicio.cantidad})`}
                              {trabajo.observaciones && ` - ${trabajo.observaciones}`}
                            </span>
                            <span>${servicio.precioUnitario * servicio.cantidad}</span>
                          </li>
                        ))}
                      </ul>

                      <div style={styles.acciones}>
                        {trabajo.estado === 'pendiente' && (
                          <button 
                            style={{ ...styles.button, ...styles.buttonPrimary }}
                            onClick={() => cambiarEstado(trabajo.id, 'produccion')}
                          >
                            Iniciar Producción
                          </button>
                        )}
                        {trabajo.estado === 'produccion' && (
                          <button 
                            style={{ ...styles.button, ...styles.buttonSuccess }}
                            onClick={() => cambiarEstado(trabajo.id, 'terminado')}
                          >
                            Terminar
                          </button>
                        )}
                        {trabajo.estado === 'terminado' && (
                          <button 
                            style={{ ...styles.button, ...styles.buttonWarning }}
                            onClick={() => cambiarEstado(trabajo.id, 'entregado')}
                          >
                            Entregar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Formulario para agregar paciente */}
                  {modoEdicion === clinicaId && (
                    <div style={styles.formAgregarPaciente}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>➕ Agregar Paciente</h4>
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Nombre del Paciente *</label>
                        <input
                          type="text"
                          style={styles.input}
                          value={nuevoPaciente.nombre}
                          onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})}
                          placeholder="Ej: Carlos López"
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Buscar Servicio *</label>
                        <div style={styles.buscadorContainer}>
                          <input
                            type="text"
                            style={styles.inputBuscador}
                            value={busquedaServicio}
                            onChange={(e) => setBusquedaServicio(e.target.value)}
                            placeholder="🔍 Buscar por nombre o categoría..."
                          />
                          <span style={styles.iconoBusqueda}>🔍</span>
                        </div>

                        {/* Lista de servicios filtrados */}
                        {busquedaServicio && (
                          <div style={styles.listaServicios}>
                            {serviciosFiltrados.length > 0 ? (
                              serviciosFiltrados.map(servicio => (
                                <ItemServicio
                                  key={servicio.id}
                                  servicio={servicio}
                                  seleccionado={nuevoPaciente.servicioId === servicio.id}
                                  onSeleccionar={seleccionarServicio}
                                />
                              ))
                            ) : (
                              <div style={styles.sinResultados}>
                                No se encontraron servicios
                              </div>
                            )}
                          </div>
                        )}

                        {/* Mostrar servicio seleccionado */}
                        {nuevoPaciente.servicioId && !busquedaServicio && (
                          <div style={{
                            padding: '0.5rem',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '0.375rem',
                            marginTop: '0.5rem',
                            fontSize: '0.875rem'
                          }}>
                            ✅ Seleccionado: {obtenerNombreServicio(nuevoPaciente.servicioId)}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Cantidad</label>
                          <input
                            type="number"
                            style={styles.input}
                            value={nuevoPaciente.cantidad}
                            min="1"
                            onChange={(e) => setNuevoPaciente({...nuevoPaciente, cantidad: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Pieza Dental</label>
                          <input
                            type="text"
                            style={styles.input}
                            value={nuevoPaciente.piezaDental}
                            onChange={(e) => setNuevoPaciente({...nuevoPaciente, piezaDental: e.target.value})}
                            placeholder="Opcional"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button 
                          style={{ ...styles.button, ...styles.buttonSuccess }}
                          onClick={() => agregarPacienteAClinica(clinicaId)}
                        >
                          Agregar Paciente
                        </button>
                        <button 
                          style={{ ...styles.button, ...styles.buttonSecondary }}
                          onClick={() => {
                            setModoEdicion(null);
                            setBusquedaServicio('');
                            setNuevoPaciente({ nombre: '', servicioId: '', cantidad: 1, piezaDental: '' });
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Total y acciones de la clínica */}
                  <div style={styles.totalClinica}>
                    <span>TOTAL CLÍNICA:</span>
                    <span>${stats.totalIngresos}</span>
                  </div>

                  <div style={styles.accionesClinica}>
                    <button 
                      style={{ ...styles.button, ...styles.buttonPrimary }}
                      onClick={() => {
                        setModoEdicion(modoEdicion === clinicaId ? null : clinicaId);
                        setBusquedaServicio('');
                        setNuevoPaciente({ nombre: '', servicioId: '', cantidad: 1, piezaDental: '' });
                      }}
                    >
                      {modoEdicion === clinicaId ? 'Cancelar' : '➕ Agregar Paciente'}
                    </button>
                    <button 
                      style={{ ...styles.button, ...styles.buttonSuccess }}
                      onClick={() => generarReporteMensual(clinicaId, trabajosClinica)}
                    >
                      📊 Reporte Mensual
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TrabajosProceso;