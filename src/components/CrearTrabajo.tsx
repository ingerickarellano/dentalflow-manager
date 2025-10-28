import React, { useState } from 'react';
import { Clinica, Dentista, Servicio, Laboratorista, clinicas, dentistas, servicios, laboratoristas, Trabajo, trabajos } from '../data/database';

interface CrearTrabajoProps {
  onBack: () => void;
}

interface TrabajoAgregado {
  id: string;
  paciente: string;
  servicio: Servicio;
  cantidad: number;
  piezaDental: string;
  precioUnitario: number;
}

// Definir el tipo para las categorías
type CategoriaType = 'fija' | 'removible' | 'implantes' | 'ortodoncia' | 'reparaciones';

const CrearTrabajo: React.FC<CrearTrabajoProps> = ({ onBack }) => {
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState<string>('');
  const [dentistaSeleccionado, setDentistaSeleccionado] = useState<string>('');
  const [laboratoristaSeleccionado, setLaboratoristaSeleccionado] = useState<string>('');
  const [nombrePaciente, setNombrePaciente] = useState<string>('');
  const [trabajosAgregados, setTrabajosAgregados] = useState<TrabajoAgregado[]>([]);
  const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
  const [piezasDentales, setPiezasDentales] = useState<{ [key: string]: string }>({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaType>('fija');

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
      boxSizing: 'border-box' as const
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
      textAlign: 'center' as const
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
    trabajoItem: {
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
      flexWrap: 'wrap' as const
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
    }
  };

  const dentistasFiltrados = dentistas.filter(d => d.clinicaId === clinicaSeleccionada);
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

  // Obtener servicios de la categoría seleccionada
const serviciosCategoriaActual = (serviciosPorCategoria[categoriaSeleccionada] || [])
  .filter(servicio => servicio.activo); // <- Solo servicios activos
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
      precioUnitario: servicio.precioBase
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

  const finalizarTrabajo = () => {
    console.log('Intentando finalizar trabajo...');
    console.log('Clínica seleccionada:', clinicaSeleccionada);
    console.log('Dentista seleccionado:', dentistaSeleccionado);
    console.log('Laboratorista seleccionado:', laboratoristaSeleccionado);
    console.log('Trabajos agregados:', trabajosAgregados.length);

    if (!clinicaSeleccionada || !dentistaSeleccionado) {
      alert('Por favor selecciona una clínica y dentista');
      return;
    }

    if (trabajosAgregados.length === 0) {
      alert('Por favor agrega al menos un trabajo');
      return;
    }

    try {
      // Crear un solo trabajo que contenga todos los servicios
      const trabajoCompleto: Trabajo = {
        id: Date.now().toString(),
        clinicaId: clinicaSeleccionada,
        dentistaId: dentistaSeleccionado,
        laboratoristaId: laboratoristaSeleccionado || undefined,
        paciente: nombrePaciente,
        servicios: trabajosAgregados.map(trabajo => ({
          servicioId: trabajo.servicio.id,
          cantidad: trabajo.cantidad,
          precioUnitario: trabajo.precioUnitario
        })),
        fechaRecibido: new Date().toISOString().split('T')[0],
        fechaEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: 'pendiente',
        precioTotal: calcularTotal(),
        observaciones: trabajosAgregados.map(t => 
          t.piezaDental ? `${t.servicio.nombre} - Pieza: ${t.piezaDental}` : t.servicio.nombre
        ).join(' | ')
      };

      console.log('Trabajo a guardar:', trabajoCompleto);
      
      // Agregar a la base de datos
      trabajos.push(trabajoCompleto);
      
      console.log('Trabajos en base de datos:', trabajos);
      
      let mensaje = `¡Trabajo creado exitosamente!\nPaciente: ${nombrePaciente}\nTotal: $${calcularTotal()}\nServicios: ${trabajosAgregados.length}`;
      
      if (laboratoristaSeleccionado) {
        const lab = laboratoristas.find(l => l.id === laboratoristaSeleccionado);
        mensaje += `\nLaboratorista asignado: ${lab?.nombre}`;
      }
      
      alert(mensaje);
      
      // Limpiar todo
      setTrabajosAgregados([]);
      setNombrePaciente('');
      setLaboratoristaSeleccionado('');
      setCantidades({});
      setPiezasDentales({});
      
    } catch (error) {
      console.error('Error al guardar el trabajo:', error);
      alert('Error al guardar el trabajo. Por favor intenta nuevamente.');
    }
  };

  const actualizarCantidad = (servicioId: string, cantidad: number) => {
    if (cantidad < 1) cantidad = 1;
    setCantidades(prev => ({ ...prev, [servicioId]: cantidad }));
  };

  const actualizarPiezaDental = (servicioId: string, pieza: string) => {
    setPiezasDentales(prev => ({ ...prev, [servicioId]: pieza }));
  };

  // Verificar si el botón debe estar habilitado
  const puedeFinalizar = clinicaSeleccionada && dentistaSeleccionado && trabajosAgregados.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>📋 Crear Lista de Trabajo</h1>
        </div>
      </div>

      {/* Selección de Clínica, Dentista y Laboratorista */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
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

      {/* Nombre del Paciente */}
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
        <div style={styles.serviciosGrid}>
          {serviciosCategoriaActual.map(servicio => (
            <div key={servicio.id} style={styles.servicioCard}>
              <div style={styles.servicioHeader}>
                <div style={{flex: 1}}>
                  <strong>{servicio.nombre}</strong>
                  <div style={{color: '#2563eb', fontWeight: 'bold', marginTop: '0.5rem'}}>
                    ${servicio.precioBase}
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
      </div>

      {/* Lista de Trabajos Agregados */}
      <div style={styles.listaTrabajos}>
        <h3 style={{marginBottom: '1rem', color: '#1e293b'}}>
          📋 Lista de Trabajos ({trabajosAgregados.length})
        </h3>
        
        {trabajosAgregados.length === 0 ? (
          <p style={{color: '#64748b', textAlign: 'center', padding: '2rem'}}>
            No hay trabajos agregados. Completa los datos y agrega servicios.
          </p>
        ) : (
          <>
            {trabajosAgregados.map((trabajo) => (
              <div key={trabajo.id} style={styles.trabajoItem}>
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

            <button 
              style={puedeFinalizar ? styles.button : styles.buttonDisabled} 
              onClick={finalizarTrabajo}
              disabled={!puedeFinalizar}
            >
              🎉 Finalizar y Guardar Trabajo
             </button>

            {!puedeFinalizar && (
              <div style={{marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem'}}>
                {!clinicaSeleccionada && "• Selecciona una clínica\n"}
                {!dentistaSeleccionado && "• Selecciona un dentista\n"}
                {trabajosAgregados.length === 0 && "• Agrega al menos un trabajo"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CrearTrabajo;