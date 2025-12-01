import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ReportesProps {
  onBack: () => void;
}

interface FiltrosReporte {
  clinicaId: string;
  periodo: 'mes' | 'año' | 'personalizado';
  fechaInicio: string;
  fechaFin: string;
  mes: string;
  año: string;
}

// Interfaces para los datos reales de Supabase
interface Trabajo {
  id: string;
  paciente: string;
  clinica_id: string;
  dentista_id: string | null;
  laboratorista_id: string | null;
  servicios: Array<{
    servicio_id: string;
    cantidad: number;
    precio: number;
    nombre: string;
    pieza_dental: string;
  }>;
  precio_total: number;
  estado: string;
  fecha_recibido: string;
  fecha_entrega_estimada: string;
  notas: string;
  usuario_id: string;
  created_at: string;
}

interface Clinica {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  usuario_id: string;
  created_at: string;
}

interface Servicio {
  id: string;
  nombre: string;
  precio_base: number;
  categoria: string;
  activo: boolean;
  usuario_id: string;
  created_at: string;
}

interface ConfiguracionLaboratorio {
  id?: string;
  nombre_laboratorio: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
  logo: string | null;
  tipo_impuesto: 'iva' | 'honorarios';
  porcentaje_impuesto: number;
  usuario_id: string;
  created_at?: string;
  updated_at?: string;
}

// Definir tipo para los estilos
type Styles = {
  [key: string]: React.CSSProperties;
};

const Reportes: React.FC<ReportesProps> = ({ onBack }) => {
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    clinicaId: 'todos',
    periodo: 'mes',
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    mes: (new Date().getMonth() + 1).toString(),
    año: new Date().getFullYear().toString()
  });

  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [configuracionLaboratorio, setConfiguracionLaboratorio] = useState<ConfiguracionLaboratorio | null>(null);
  const [cargando, setCargando] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState<string | null>(null);

  // Cargar datos desde Supabase
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

      // Cargar todos los datos en paralelo
      const [
        trabajosRes, 
        clinicasRes, 
        serviciosRes,
        configuracionRes
      ] = await Promise.all([
        supabase.from('trabajos').select('*').eq('usuario_id', user.id),
        supabase.from('clinicas').select('*').eq('usuario_id', user.id),
        supabase.from('servicios').select('*').eq('usuario_id', user.id),
        supabase.from('configuracion_laboratorio').select('*').eq('usuario_id', user.id).single()
      ]);

      if (trabajosRes.error) throw trabajosRes.error;
      if (clinicasRes.error) throw clinicasRes.error;
      if (serviciosRes.error) throw serviciosRes.error;

      setTrabajos(trabajosRes.data || []);
      setClinicas(clinicasRes.data || []);
      setServicios(serviciosRes.data || []);
      
      // Cargar configuración del laboratorio
      if (configuracionRes.data) {
        setConfiguracionLaboratorio(configuracionRes.data);
      } else {
        // Configuración por defecto si no existe
        setConfiguracionLaboratorio({
          nombre_laboratorio: 'Laboratorio Dental Pro',
          rut: '76.123.456-7',
          direccion: 'Av. Principal 123, Santiago, Chile',
          telefono: '+56 2 2345 6789',
          email: 'contacto@laboratoriodental.cl',
          logo: null,
          tipo_impuesto: 'iva',
          porcentaje_impuesto: 19,
          usuario_id: user.id
        });
      }

    } catch (error: any) {
      console.error('Error cargando datos:', error);
      alert(`Error al cargar los datos: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Función para calcular montos con impuestos
  const calcularMontosConImpuesto = (montoBruto: number) => {
    if (!configuracionLaboratorio) {
      return {
        bruto: montoBruto,
        impuesto: 0,
        neto: montoBruto,
        porcentaje: 0,
        tipo: 'Sin configuración'
      };
    }

    const porcentaje = configuracionLaboratorio.porcentaje_impuesto;
    const montoImpuesto = (montoBruto * porcentaje) / 100;
    const montoNeto = montoBruto - montoImpuesto;
    
    return {
      bruto: montoBruto,
      impuesto: montoImpuesto,
      neto: montoNeto,
      porcentaje: porcentaje,
      tipo: configuracionLaboratorio.tipo_impuesto === 'iva' ? 'IVA' : 'Retención'
    };
  };

  // Función para actualizar estado de trabajo
  const actualizarEstadoTrabajo = async (trabajoId: string, nuevoEstado: string) => {
    try {
      setActualizandoEstado(trabajoId);
      const { error } = await supabase
        .from('trabajos')
        .update({ estado: nuevoEstado })
        .eq('id', trabajoId);

      if (error) throw error;

      // Actualizar estado local
      setTrabajos(prev => prev.map(t => 
        t.id === trabajoId ? { ...t, estado: nuevoEstado } : t
      ));

      alert('✅ Estado actualizado correctamente');
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      alert('❌ Error al actualizar el estado');
    } finally {
      setActualizandoEstado(null);
    }
  };

  // Calcular fechas basadas en el periodo seleccionado
  const calcularFechasPorPeriodo = (periodo: string, mes?: string, año?: string) => {
    const hoy = new Date();
    let fechaInicio = new Date();
    let fechaFin = new Date();

    switch (periodo) {
      case 'mes':
        if (mes && año) {
          fechaInicio = new Date(parseInt(año), parseInt(mes) - 1, 1);
          fechaFin = new Date(parseInt(año), parseInt(mes), 0);
        } else {
          fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        }
        break;
      case 'año':
        if (año) {
          fechaInicio = new Date(parseInt(año), 0, 1);
          fechaFin = new Date(parseInt(año), 11, 31);
        } else {
          fechaInicio = new Date(hoy.getFullYear(), 0, 1);
          fechaFin = new Date(hoy.getFullYear(), 11, 31);
        }
        break;
      default:
        fechaInicio = new Date(filtros.fechaInicio);
        fechaFin = new Date(filtros.fechaFin);
        break;
    }

    return {
      inicio: fechaInicio.toISOString().split('T')[0],
      fin: fechaFin.toISOString().split('T')[0]
    };
  };

  const handleFiltroChange = (
    campo: keyof FiltrosReporte, 
    valor: string
  ) => {
    if (campo === 'periodo' && valor !== 'personalizado') {
      const fechas = calcularFechasPorPeriodo(valor, filtros.mes, filtros.año);
      setFiltros(prev => ({
        ...prev,
        periodo: valor as 'mes' | 'año' | 'personalizado',
        fechaInicio: fechas.inicio,
        fechaFin: fechas.fin
      }));
    } else if (campo === 'mes' || campo === 'año') {
      const nuevoFiltros = {
        ...filtros,
        [campo]: valor
      };
      
      if (filtros.periodo === 'mes' || filtros.periodo === 'año') {
        const fechas = calcularFechasPorPeriodo(filtros.periodo, 
          campo === 'mes' ? valor : nuevoFiltros.mes, 
          campo === 'año' ? valor : nuevoFiltros.año
        );
        nuevoFiltros.fechaInicio = fechas.inicio;
        nuevoFiltros.fechaFin = fechas.fin;
      }
      
      setFiltros(nuevoFiltros);
    } else {
      setFiltros(prev => ({
        ...prev,
        [campo]: valor
      } as FiltrosReporte));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleFiltroChange(name as keyof FiltrosReporte, value);
  };

  // Aplicar filtros a los trabajos
  const trabajosFiltrados = useMemo(() => {
    let filtrados = [...trabajos];

    // Filtrar por clínica
    if (filtros.clinicaId !== 'todos') {
      filtrados = filtrados.filter(t => t.clinica_id === filtros.clinicaId);
    }

    // Filtrar por fecha (usamos fecha_recibido que es el campo real)
    filtrados = filtrados.filter(t => {
      const fechaTrabajo = new Date(t.fecha_recibido);
      const fechaInicio = new Date(filtros.fechaInicio);
      const fechaFin = new Date(filtros.fechaFin);
      return fechaTrabajo >= fechaInicio && fechaTrabajo <= fechaFin;
    });

    return filtrados;
  }, [filtros, trabajos]);

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    const totalTrabajos = trabajosFiltrados.length;
    const totalIngresos = trabajosFiltrados.reduce((sum, t) => sum + t.precio_total, 0);
    const montos = calcularMontosConImpuesto(totalIngresos);
    
    return {
      totalTrabajos,
      totalIngresos,
      ...montos
    };
  }, [trabajosFiltrados, configuracionLaboratorio]);

  // Obtener nombre del mes
  const obtenerNombreMes = (mes: string) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes) - 1] || '';
  };

  const exportarPDF = () => {
    const clinicaSeleccionada = filtros.clinicaId !== 'todos' 
      ? clinicas.find(c => c.id === filtros.clinicaId)
      : null;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Reporte DentalFlow - ${new Date().toLocaleDateString()}</title>
            <style>
              @page {
                margin: 0.5cm;
                size: A4 portrait;
              }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0;
                padding: 0;
                color: #333;
                font-size: 10px;
                line-height: 1.2;
              }
              .container {
                max-width: 100%;
                margin: 0 auto;
              }
              .header { 
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #2563eb;
              }
              .logo-section {
                flex: 1;
                text-align: left;
              }
              .logo {
                max-width: 120px;
                max-height: 80px;
                margin-bottom: 5px;
              }
              .info-section {
                flex: 2;
                text-align: right;
              }
              .header h1 { 
                color: #2563eb; 
                margin: 0 0 5px 0;
                font-size: 16px;
                font-weight: bold;
              }
              .header h2 {
                margin: 0 0 8px 0;
                font-size: 14px;
                color: #1e293b;
                font-weight: 600;
              }
              .lab-info {
                font-size: 9px;
                color: #64748b;
                margin: 2px 0;
              }
              .report-info {
                background: #f8fafc; 
                padding: 8px;
                border-radius: 4px; 
                margin: 8px 0;
                border: 1px solid #e2e8f0;
                font-size: 9px;
              }
              .table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 10px 0;
                font-size: 8px;
                page-break-inside: avoid;
              }
              .table th, .table td { 
                border: 1px solid #ddd; 
                padding: 4px;
                text-align: left;
                word-wrap: break-word;
              }
              .table th { 
                background-color: #f1f5f9; 
                font-weight: bold;
                font-size: 8px;
              }
              .table td {
                font-size: 8px;
              }
              .totales {
                margin-top: 15px;
                padding: 10px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                page-break-inside: avoid;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin: 3px 0;
                font-size: 9px;
              }
              .total-final {
                font-weight: bold;
                font-size: 10px;
                border-top: 1px solid #cbd5e1;
                padding-top: 6px;
                margin-top: 6px;
                color: #059669;
              }
              .section-title {
                background: #e2e8f0;
                padding: 6px;
                border-radius: 4px;
                font-weight: bold;
                margin: 12px 0 8px 0;
                font-size: 11px;
              }
              .servicio-item {
                margin: 1px 0;
                padding: 0;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                .container { width: 100%; }
                .table { font-size: 7px; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <!-- Encabezado con información del laboratorio -->
              <div class="header">
                <div class="logo-section">
                  ${configuracionLaboratorio?.logo ? 
                    `<img src="${configuracionLaboratorio.logo}" class="logo" alt="Logo">` : 
                    '<div style="font-size: 24px; color: #2563eb;">🦷</div>'
                  }
                  <div class="lab-info">
                    <strong>${configuracionLaboratorio?.nombre_laboratorio || 'Laboratorio Dental'}</strong><br>
                    ${configuracionLaboratorio?.rut || ''}<br>
                    ${configuracionLaboratorio?.direccion || ''}<br>
                    ${configuracionLaboratorio?.telefono || ''}<br>
                    ${configuracionLaboratorio?.email || ''}
                  </div>
                </div>
                <div class="info-section">
                  <h1>INFORME DE PRESTACIONES DENTALES</h1>
                  <h2>${clinicaSeleccionada ? `CLÍNICA: ${clinicaSeleccionada.nombre.toUpperCase()}` : 'TODAS LAS CLÍNICAS'}</h2>
                  <div class="report-info">
                    <strong>Período:</strong> ${filtros.periodo === 'mes' ? `${obtenerNombreMes(filtros.mes)} ${filtros.año}` : `${filtros.fechaInicio} a ${filtros.fechaFin}`}<br>
                    <strong>Generado:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}<br>
                    <strong>Régimen:</strong> ${configuracionLaboratorio?.tipo_impuesto === 'iva' ? 'IVA' : 'Honorarios'} (${configuracionLaboratorio?.porcentaje_impuesto}%)
                  </div>
                </div>
              </div>

              <div class="section-title">DETALLES DE TRABAJOS - TOTAL: ${trabajosFiltrados.length} TRABAJOS</div>
              
              <table class="table">
                <thead>
                  <tr>
                    <th style="width: 15%">Paciente</th>
                    <th style="width: 15%">Clínica</th>
                    <th style="width: 25%">Servicios</th>
                    <th style="width: 8%">Estado</th>
                    <th style="width: 12%">Precio Bruto</th>
                    <th style="width: 12%">${configuracionLaboratorio?.tipo_impuesto === 'iva' ? 'IVA' : 'Retención'}</th>
                    <th style="width: 13%">Total a Pagar</th>
                  </tr>
                </thead>
                <tbody>
                  ${trabajosFiltrados.map(trabajo => {
                    const clinica = clinicas.find(c => c.id === trabajo.clinica_id);
                    const serviciosList = trabajo.servicios.map(s => {
                      const servicio = servicios.find(serv => serv.id === s.servicio_id);
                      return servicio ? `<div class="servicio-item">${servicio.nombre} (x${s.cantidad})</div>` : '<div class="servicio-item">Servicio no encontrado</div>';
                    }).join('');
                    
                    const montos = calcularMontosConImpuesto(trabajo.precio_total);
                    
                    return `
                      <tr>
                        <td>${trabajo.paciente}</td>
                        <td>${clinica?.nombre || 'N/A'}</td>
                        <td>${serviciosList}</td>
                        <td>${trabajo.estado}</td>
                        <td>$${trabajo.precio_total.toLocaleString()}</td>
                        <td>$${montos.impuesto.toLocaleString()}</td>
                        <td><strong>$${montos.neto.toLocaleString()}</strong></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              <div class="totales">
                <div class="section-title">RESUMEN GENERAL DEL PERÍODO</div>
                <div class="total-row">
                  <span>Total de Trabajos:</span>
                  <span>${estadisticas.totalTrabajos}</span>
                </div>
                <div class="total-row">
                  <span>Total Bruto:</span>
                  <span>$${estadisticas.totalIngresos.toLocaleString()}</span>
                </div>
                <div class="total-row">
                  <span>${configuracionLaboratorio?.tipo_impuesto === 'iva' ? 'IVA' : 'Retención'} (${configuracionLaboratorio?.porcentaje_impuesto}%):</span>
                  <span>$${estadisticas.impuesto.toLocaleString()}</span>
                </div>
                <div class="total-row total-final">
                  <span>TOTAL NETO A PAGAR:</span>
                  <span><strong>$${estadisticas.neto.toLocaleString()}</strong></span>
                </div>
              </div>

              <div style="margin-top: 15px; font-size: 8px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
                Documento generado automáticamente por DentalFlow - ${new Date().toLocaleDateString()}
              </div>

              <div class="no-print" style="margin-top: 20px; text-align: center; padding: 15px;">
                <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; font-size: 12px;">
                  🖨️ Imprimir Reporte
                </button>
                <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; font-size: 12px;">
                  ❌ Cerrar
                </button>
              </div>
            </div>
          </body>
        </html>
      `);
      ventana.document.close();
    }
  };

  const exportarExcel = () => {
    const headers = ['Paciente', 'Clínica', 'Servicios', 'Estado', 'Precio Bruto', 'Precio Neto', 'Impuesto', 'Fecha Recibido'];
    const csvContent = [
      headers.join(','),
      ...trabajosFiltrados.map(trabajo => {
        const clinica = clinicas.find(c => c.id === trabajo.clinica_id)?.nombre || 'N/A';
        const serviciosList = trabajo.servicios.map(s => {
          const servicio = servicios.find(serv => serv.id === s.servicio_id);
          return servicio ? `${servicio.nombre} (x${s.cantidad})` : 'Servicio no encontrado';
        }).join('; ');
        
        const montos = calcularMontosConImpuesto(trabajo.precio_total);
        
        return [
          `"${trabajo.paciente}"`,
          `"${clinica}"`,
          `"${serviciosList}"`,
          trabajo.estado,
          trabajo.precio_total,
          montos.neto.toFixed(2),
          montos.impuesto.toFixed(2),
          trabajo.fecha_recibido
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const nombreArchivo = `prestaciones-${filtros.clinicaId !== 'todos' ? clinicas.find(c => c.id === filtros.clinicaId)?.nombre : 'todas-clinicas'}-${filtros.mes}-${filtros.año}.csv`;
    
    link.setAttribute('download', nombreArchivo);
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
    const baseStyle: React.CSSProperties = {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500'
    };

    switch (estado) {
      case 'pendiente': return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'produccion': return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'terminado': return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'entregado': return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
      default: return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
    }
  };

  // Estilos mejorados y simplificados
  const styles: Styles = {
    container: {
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    title: {
      color: '#1e293b',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0
    },
    backButton: {
      backgroundColor: '#64748b',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginRight: '0.5rem',
      fontSize: '0.875rem'
    },
    button: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      marginRight: '0.5rem',
      fontSize: '0.875rem'
    },
    buttonSuccess: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    buttonWarning: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },
    filtrosContainer: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      border: '1px solid #e2e8f0'
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
    select: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    resultadosContainer: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      border: '1px solid #e2e8f0'
    },
    reporteHeader: {
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: '#f0f9ff',
      borderRadius: '0.5rem',
      border: '1px solid #bae6fd'
    },
    tabla: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
      fontSize: '0.875rem'
    },
    th: {
      backgroundColor: '#f1f5f9',
      padding: '0.75rem',
      textAlign: 'left',
      border: '1px solid #e2e8f0',
      fontWeight: '600',
      color: '#475569',
      fontSize: '0.875rem'
    },
    td: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      color: '#475569',
      fontSize: '0.875rem'
    },
    trPar: {
      backgroundColor: '#f8fafc'
    },
    totalesContainer: {
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '0.5rem 0',
      fontSize: '0.875rem'
    },
    totalFinal: {
      fontWeight: 'bold',
      fontSize: '1rem',
      borderTop: '2px solid #e2e8f0',
      paddingTop: '1rem',
      marginTop: '1rem',
      color: '#1e293b'
    },
    sectionTitle: {
      color: '#1e293b',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0 0 1rem 0',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e2e8f0'
    },
    loadingText: {
      textAlign: 'center',
      color: '#64748b',
      padding: '2rem'
    },
    acciones: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    exportButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
      flexWrap: 'wrap'
    }
  };

  const getRowStyle = (index: number) => {
    return index % 2 === 0 ? styles.trPar : styles.trNormal;
  };

  // Generar opciones de meses y años
  const meses = [
    { valor: '1', nombre: 'Enero' }, { valor: '2', nombre: 'Febrero' },
    { valor: '3', nombre: 'Marzo' }, { valor: '4', nombre: 'Abril' },
    { valor: '5', nombre: 'Mayo' }, { valor: '6', nombre: 'Junio' },
    { valor: '7', nombre: 'Julio' }, { valor: '8', nombre: 'Agosto' },
    { valor: '9', nombre: 'Septiembre' }, { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' }, { valor: '12', nombre: 'Diciembre' }
  ];

  const años = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  if (cargando) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>Cargando datos...</div>
      </div>
    );
  }

  const clinicaSeleccionada = filtros.clinicaId !== 'todos' 
    ? clinicas.find(c => c.id === filtros.clinicaId)
    : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>📊 Reportes de Prestaciones</h1>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtrosContainer}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.125rem' }}>Configurar Reporte</h3>
        
        <div style={styles.grid}>
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
            <label style={styles.label}>Período</label>
            <select 
              style={styles.select}
              name="periodo"
              value={filtros.periodo}
              onChange={handleInputChange}
            >
              <option value="mes">Mes</option>
              <option value="año">Año</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {filtros.periodo === 'mes' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mes</label>
                <select 
                  style={styles.select}
                  name="mes"
                  value={filtros.mes}
                  onChange={handleInputChange}
                >
                  {meses.map(mes => (
                    <option key={mes.valor} value={mes.valor}>
                      {mes.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Año</label>
                <select 
                  style={styles.select}
                  name="año"
                  value={filtros.año}
                  onChange={handleInputChange}
                >
                  {años.map(año => (
                    <option key={año} value={año}>{año}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {filtros.periodo === 'año' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Año</label>
              <select 
                style={styles.select}
                name="año"
                value={filtros.año}
                onChange={handleInputChange}
              >
                {años.map(año => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filtros.periodo === 'personalizado' && (
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha Inicio</label>
              <input
                type="date"
                style={styles.select}
                name="fechaInicio"
                value={filtros.fechaInicio}
                onChange={handleInputChange}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha Fin</label>
              <input
                type="date"
                style={styles.select}
                name="fechaFin"
                value={filtros.fechaFin}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        <div style={styles.exportButtons}>
          <button style={styles.buttonWarning} onClick={exportarExcel}>
            📈 Exportar a Excel
          </button>
          <button style={styles.buttonSuccess} onClick={exportarPDF}>
            📄 Exportar a PDF
          </button>
        </div>
      </div>

      {/* Resultados */}
      {trabajosFiltrados.length > 0 && (
        <div style={styles.resultadosContainer}>
          {/* Encabezado del Reporte */}
          <div style={styles.reporteHeader}>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>
              PRESTACIONES DE {clinicaSeleccionada ? `LA CLÍNICA ${clinicaSeleccionada.nombre.toUpperCase()}` : 'TODAS LAS CLÍNICAS'}
            </h2>
            <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
              Período: {filtros.periodo === 'mes' ? `${obtenerNombreMes(filtros.mes)} ${filtros.año}` : `${filtros.fechaInicio} a ${filtros.fechaFin}`}
            </p>
            <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
              Generado: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </p>
          </div>

          <h3 style={styles.sectionTitle}>Detalles de Trabajos</h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.tabla}>
              <thead>
                <tr>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Clínica</th>
                  <th style={styles.th}>Servicios</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Precio Bruto</th>
                  <th style={styles.th}>{configuracionLaboratorio?.tipo_impuesto === 'iva' ? 'IVA' : 'Retención'} ({configuracionLaboratorio?.porcentaje_impuesto}%)</th>
                  <th style={styles.th}>Total a Pagar</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {trabajosFiltrados.map((trabajo, index) => {
                  const clinica = clinicas.find(c => c.id === trabajo.clinica_id);
                  const montos = calcularMontosConImpuesto(trabajo.precio_total);
                  
                  return (
                    <tr key={trabajo.id} style={getRowStyle(index)}>
                      <td style={styles.td}>{trabajo.paciente}</td>
                      <td style={styles.td}>{clinica?.nombre || 'N/A'}</td>
                      <td style={styles.td}>
                        {trabajo.servicios.map((servicio, idx) => {
                          const serv = servicios.find(s => s.id === servicio.servicio_id);
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
                      <td style={styles.td}>${trabajo.precio_total.toLocaleString()}</td>
                      <td style={styles.td}>${montos.impuesto.toLocaleString()}</td>
                      <td style={{...styles.td, color: '#10b981', fontWeight: 'bold'}}>
                        ${montos.neto.toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.acciones}>
                          {trabajo.estado === 'pendiente' && (
                            <button
                              style={{...styles.actionButton, backgroundColor: '#10b981', color: 'white'}}
                              onClick={() => actualizarEstadoTrabajo(trabajo.id, 'produccion')}
                              disabled={actualizandoEstado === trabajo.id}
                            >
                              {actualizandoEstado === trabajo.id ? '...' : '▶️'}
                            </button>
                          )}
                          {trabajo.estado === 'produccion' && (
                            <button
                              style={{...styles.actionButton, backgroundColor: '#f59e0b', color: 'white'}}
                              onClick={() => actualizarEstadoTrabajo(trabajo.id, 'terminado')}
                              disabled={actualizandoEstado === trabajo.id}
                            >
                              {actualizandoEstado === trabajo.id ? '...' : '✅'}
                            </button>
                          )}
                          {trabajo.estado === 'terminado' && (
                            <button
                              style={{...styles.actionButton, backgroundColor: '#3b82f6', color: 'white'}}
                              onClick={() => actualizarEstadoTrabajo(trabajo.id, 'entregado')}
                              disabled={actualizandoEstado === trabajo.id}
                            >
                              {actualizandoEstado === trabajo.id ? '...' : '📦'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div style={styles.totalesContainer}>
            <h3 style={styles.sectionTitle}>Resumen General</h3>
            <div style={styles.totalRow}>
              <span>Total Bruto:</span>
              <span>${estadisticas.totalIngresos.toLocaleString()}</span>
            </div>
            <div style={styles.totalRow}>
              <span>{configuracionLaboratorio?.tipo_impuesto === 'iva' ? 'IVA' : 'Retención'} ({configuracionLaboratorio?.porcentaje_impuesto}%):</span>
              <span>${estadisticas.impuesto.toLocaleString()}</span>
            </div>
            <div style={{...styles.totalRow, ...styles.totalFinal}}>
              <span>TOTAL A PAGAR:</span>
              <span style={{color: '#10b981'}}>${estadisticas.neto.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;