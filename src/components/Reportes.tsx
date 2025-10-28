import React, { useState, useMemo } from 'react';
import { trabajos, clinicas, dentistas, servicios, laboratoristas } from '../data/database';

interface ReportesProps {
  onBack: () => void;
}

interface FiltrosReporte {
  clinicaId: string;
  dentistaId: string;
  laboratoristaId: string;
  periodo: 'semana' | 'mes' | 'año' | 'personalizado';
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

const Reportes: React.FC<ReportesProps> = ({ onBack }) => {
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    clinicaId: 'todos',
    dentistaId: 'todos',
    laboratoristaId: 'todos',
    periodo: 'mes',
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    estado: 'todos'
  });

  const [reporteGenerado, setReporteGenerado] = useState(false);

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
    buttonWarning: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    filtrosContainer: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    formGroup: {
      marginBottom: '1rem'
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    resultadosContainer: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      textAlign: 'center' as const,
      border: '1px solid #e2e8f0'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#2563eb',
      margin: '0.5rem 0'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    tabla: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '1rem'
    },
    th: {
      backgroundColor: '#f1f5f9',
      padding: '0.75rem',
      textAlign: 'left' as const,
      border: '1px solid #e2e8f0',
      fontWeight: '600',
      color: '#475569'
    },
    td: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      color: '#475569'
    },
    // ELIMINADO: tr styles con pseudo-clases
    badge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500'
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
    acciones: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'center',
      marginTop: '2rem'
    },
    sectionTitle: {
      color: '#1e293b',
      fontSize: '1.25rem',
      fontWeight: '600',
      margin: '2rem 0 1rem 0',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e2e8f0'
    },
    // NUEVO: Estilo para filas pares
    trPar: {
      backgroundColor: '#f8fafc'
    },
    trNormal: {
      backgroundColor: 'transparent'
    }
  };

  // Calcular fechas basadas en el periodo seleccionado
  const calcularFechasPorPeriodo = (periodo: string) => {
    const hoy = new Date();
    let fechaInicio = new Date();
    let fechaFin = new Date();

    switch (periodo) {
      case 'semana':
        // Primer día de la semana (domingo)
        const primerDiaSemana = new Date(hoy);
        primerDiaSemana.setDate(hoy.getDate() - hoy.getDay());
        fechaInicio = primerDiaSemana;
        
        // Último día de la semana (sábado)
        const ultimoDiaSemana = new Date(primerDiaSemana);
        ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6);
        fechaFin = ultimoDiaSemana;
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        break;
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        fechaFin = new Date(hoy.getFullYear(), 11, 31);
        break;
      default:
        // Para personalizado, usar las fechas actuales
        fechaInicio = new Date(filtros.fechaInicio);
        fechaFin = new Date(filtros.fechaFin);
        break;
    }

    return {
      inicio: fechaInicio.toISOString().split('T')[0],
      fin: fechaFin.toISOString().split('T')[0]
    };
  };

  // Función handleFiltroChange corregida
  const handleFiltroChange = (
    campo: keyof FiltrosReporte, 
    valor: string
  ) => {
    if (campo === 'periodo' && valor !== 'personalizado') {
      const fechas = calcularFechasPorPeriodo(valor);
      setFiltros(prev => ({
        ...prev,
        periodo: valor as 'semana' | 'mes' | 'año' | 'personalizado',
        fechaInicio: fechas.inicio,
        fechaFin: fechas.fin
      }));
    } else {
      setFiltros(prev => ({
        ...prev,
        [campo]: valor
      } as FiltrosReporte));
    }
  };

  // Manejar cambios específicos para tipos de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleFiltroChange(name as keyof FiltrosReporte, value);
  };

  // Aplicar filtros a los trabajos
  const trabajosFiltrados = useMemo(() => {
    let filtrados = [...trabajos];

    // Filtrar por clínica
    if (filtros.clinicaId !== 'todos') {
      filtrados = filtrados.filter(t => t.clinicaId === filtros.clinicaId);
    }

    // Filtrar por dentista
    if (filtros.dentistaId !== 'todos') {
      filtrados = filtrados.filter(t => t.dentistaId === filtros.dentistaId);
    }

    // Filtrar por laboratorista
    if (filtros.laboratoristaId !== 'todos') {
      filtrados = filtrados.filter(t => t.laboratoristaId === filtros.laboratoristaId);
    }

    // Filtrar por estado
    if (filtros.estado !== 'todos') {
      filtrados = filtrados.filter(t => t.estado === filtros.estado);
    }

    // Filtrar por fecha
    filtrados = filtrados.filter(t => {
      const fechaTrabajo = new Date(t.fechaRecibido);
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaFin = new Date(filtros.fechaFin);
      return fechaTrabajo >= fechaInicio && fechaTrabajo <= fechaFin;
    });

    return filtrados;
  }, [filtros, trabajos]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const totalTrabajos = trabajosFiltrados.length;
    const totalIngresos = trabajosFiltrados.reduce((sum, t) => sum + t.precioTotal, 0);
    const trabajosPendientes = trabajosFiltrados.filter(t => t.estado === 'pendiente').length;
    const trabajosProduccion = trabajosFiltrados.filter(t => t.estado === 'produccion').length;
    const trabajosTerminados = trabajosFiltrados.filter(t => t.estado === 'terminado').length;
    const trabajosEntregados = trabajosFiltrados.filter(t => t.estado === 'entregado').length;
    
    // Ingresos por clínica
    const ingresosPorClinica = clinicas.map(clinica => {
      const ingresos = trabajosFiltrados
        .filter(t => t.clinicaId === clinica.id)
        .reduce((sum, t) => sum + t.precioTotal, 0);
      return {
        clinica: clinica.nombre,
        ingresos,
        cantidad: trabajosFiltrados.filter(t => t.clinicaId === clinica.id).length
      };
    }).filter(item => item.cantidad > 0); // Solo mostrar clínicas con trabajos

    return {
      totalTrabajos,
      totalIngresos,
      trabajosPendientes,
      trabajosProduccion,
      trabajosTerminados,
      trabajosEntregados,
      ingresosPorClinica
    };
  }, [trabajosFiltrados]);

  const generarReporte = () => {
    setReporteGenerado(true);
  };

  const exportarPDF = () => {
    alert('📊 Generando reporte PDF...\nEsta funcionalidad se integraría con una librería como jsPDF');
    // Aquí iría la lógica para generar PDF
  };

  const exportarExcel = () => {
    // Crear contenido CSV
    const headers = ['Paciente', 'Clínica', 'Dentista', 'Laboratorista', 'Servicios', 'Estado', 'Precio Total', 'Fecha Recibido', 'Fecha Entrega'];
    const csvContent = [
      headers.join(','),
      ...trabajosFiltrados.map(trabajo => {
        const clinica = clinicas.find(c => c.id === trabajo.clinicaId)?.nombre || 'N/A';
        const dentista = dentistas.find(d => d.id === trabajo.dentistaId)?.nombre || 'N/A';
        const laboratorista = laboratoristas.find(l => l.id === trabajo.laboratoristaId)?.nombre || 'No asignado';
        const serviciosList = trabajo.servicios.map(s => {
          const servicio = servicios.find(serv => serv.id === s.servicioId);
          return servicio ? `${servicio.nombre} (x${s.cantidad})` : 'Servicio no encontrado';
        }).join('; ');
        
        return [
          `"${trabajo.paciente}"`,
          `"${clinica}"`,
          `"${dentista}"`,
          `"${laboratorista}"`,
          `"${serviciosList}"`,
          trabajo.estado,
          trabajo.precioTotal,
          trabajo.fechaRecibido,
          trabajo.fechaEntrega
        ].join(',');
      })
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-dentalflow-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('📈 Reporte exportado exitosamente en formato Excel/CSV');
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'produccion': return 'En Producción';
      case 'terminado': return 'Terminado';
      case 'entregado': return 'Entregado';
      default: return estado;
    }
  };

  const obtenerEstiloEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return { ...styles.badge, ...styles.badgePendiente };
      case 'produccion': return { ...styles.badge, ...styles.badgeProduccion };
      case 'terminado': return { ...styles.badge, ...styles.badgeTerminado };
      case 'entregado': return { ...styles.badge, ...styles.badgeEntregado };
      default: return { ...styles.badge, ...styles.badgePendiente };
    }
  };

  // Función para determinar el estilo de la fila basado en el índice
  const getRowStyle = (index: number) => {
    return index % 2 === 0 ? styles.trPar : styles.trNormal;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>📊 Reportes y Análisis</h1>
        </div>
        <div>
          <button style={styles.buttonWarning} onClick={exportarExcel}>
            📈 Exportar Excel
          </button>
          <button style={styles.buttonSuccess} onClick={exportarPDF}>
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtrosContainer}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Filtros del Reporte</h3>
        
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Período</label>
            <select 
              style={styles.select}
              name="periodo"
              value={filtros.periodo}
              onChange={handleInputChange}
            >
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
              <option value="año">Este Año</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Clínica</label>
            <select 
              style={styles.select}
              name="clinicaId"
              value={filtros.clinicaId}
              onChange={handleInputChange}
            >
              <option value="todos">Todas las Clínicas</option>
              {clinicas.map(clinica => (
                <option key={clinica.id} value={clinica.id}>{clinica.nombre}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Estado</label>
            <select 
              style={styles.select}
              name="estado"
              value={filtros.estado}
              onChange={handleInputChange}
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="produccion">En Producción</option>
              <option value="terminado">Terminados</option>
              <option value="entregado">Entregados</option>
            </select>
          </div>
        </div>

        {filtros.periodo === 'personalizado' && (
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha Inicio</label>
              <input
                type="date"
                style={styles.input}
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleInputChange}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha Fin</label>
              <input
                type="date"
                style={styles.input}
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        <button style={styles.button} onClick={generarReporte}>
          🔍 Generar Reporte
        </button>
      </div>

      {reporteGenerado && (
        <div style={styles.resultadosContainer}>
          {/* Estadísticas Principales */}
          <h3 style={styles.sectionTitle}>📈 Resumen General</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Trabajos</div>
              <div style={styles.statNumber}>{estadisticas.totalTrabajos}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Ingresos Totales</div>
              <div style={{...styles.statNumber, color: '#10b981'}}>
                ${estadisticas.totalIngresos}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Trabajos Pendientes</div>
              <div style={{...styles.statNumber, color: '#f59e0b'}}>
                {estadisticas.trabajosPendientes}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>En Producción</div>
              <div style={{...styles.statNumber, color: '#3b82f6'}}>
                {estadisticas.trabajosProduccion}
              </div>
            </div>
          </div>

          {/* Ingresos por Clínica */}
          <h3 style={styles.sectionTitle}>🏥 Ingresos por Clínica</h3>
          <div style={styles.statsGrid}>
            {estadisticas.ingresosPorClinica.map((item, index) => (
              <div key={index} style={styles.statCard}>
                <div style={styles.statLabel}>{item.clinica}</div>
                <div style={{...styles.statNumber, color: '#8b5cf6'}}>
                  ${item.ingresos}
                </div>
                <div style={{...styles.statLabel, fontSize: '0.75rem'}}>
                  {item.cantidad} trabajos
                </div>
              </div>
            ))}
          </div>

          {/* Detalle de Trabajos */}
          <h3 style={styles.sectionTitle}>📋 Detalle de Trabajos ({trabajosFiltrados.length})</h3>
          {trabajosFiltrados.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.tabla}>
                <thead>
                  <tr>
                    <th style={styles.th}>Paciente</th>
                    <th style={styles.th}>Clínica</th>
                    <th style={styles.th}>Dentista</th>
                    <th style={styles.th}>Laboratorista</th>
                    <th style={styles.th}>Servicios</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Fecha Recibido</th>
                    <th style={styles.th}>Fecha Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajosFiltrados.map((trabajo, index) => {
                    const clinica = clinicas.find(c => c.id === trabajo.clinicaId);
                    const dentista = dentistas.find(d => d.id === trabajo.dentistaId);
                    const laboratorista = laboratoristas.find(l => l.id === trabajo.laboratoristaId);
                    
                    return (
                      // CORREGIDO: Usar getRowStyle en lugar de styles.tr
                      <tr key={trabajo.id} style={getRowStyle(index)}>
                        <td style={styles.td}>{trabajo.paciente}</td>
                        <td style={styles.td}>{clinica?.nombre || 'N/A'}</td>
                        <td style={styles.td}>{dentista?.nombre || 'N/A'}</td>
                        <td style={styles.td}>{laboratorista?.nombre || 'No asignado'}</td>
                        <td style={styles.td}>
                          {trabajo.servicios.map((servicio, idx) => {
                            const serv = servicios.find(s => s.id === servicio.servicioId);
                            return serv ? (
                              <div key={idx} style={{ fontSize: '0.75rem' }}>
                                {serv.nombre} (x{servicio.cantidad})
                              </div>
                            ) : null;
                          })}
                        </td>
                        <td style={styles.td}>
                          <span style={obtenerEstiloEstado(trabajo.estado)}>
                            {obtenerTextoEstado(trabajo.estado)}
                          </span>
                        </td>
                        <td style={styles.td}>${trabajo.precioTotal}</td>
                        <td style={styles.td}>{trabajo.fechaRecibido}</td>
                        <td style={styles.td}>{trabajo.fechaEntrega}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No se encontraron trabajos con los filtros seleccionados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reportes;