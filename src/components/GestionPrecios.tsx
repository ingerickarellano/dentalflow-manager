import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

interface GestionPreciosProps {
  onBack?: () => void;
}

interface Servicio {
  id: string;
  nombre: string;
  precio_base: number;
  categoria: string;
  activo: boolean;
  usuario_id: string;
  creado_en: string;
  updated_at: string;
  created_at: string;
}

interface FilaPlantillaExcel {
  'Categoría': string;
  'Nombre del Servicio': string;
  'Precio Base': number;
}

const categorias = {
  'fija': '🦷 Prótesis Fija',
  'removible': '👄 Prótesis Removible', 
  'implantes': '⚡ Implantes',
  'ortodoncia': '🎯 Ortodoncia',
  'reparaciones': '🔧 Reparaciones',
  'metales': '🔩 Metales',
  'attachments': '📎 Attachments',
  'ceromeros_composites': '🦷 Cerómeros y Composites',
  'planos_estampados': '📐 Planos y Estampados',
  'otros': '📦 Otros Servicios'
};

// Mapeo de nombres completos a claves
const mapeoCategorias: { [key: string]: string } = {
  'prótesis fija': 'fija',
  'protesis fija': 'fija',
  'fija': 'fija',
  'prótesis removible': 'removible',
  'protesis removible': 'removible',
  'removible': 'removible',
  'implantes': 'implantes',
  'implante': 'implantes',
  'ortodoncia': 'ortodoncia',
  'reparaciones': 'reparaciones',
  'reparación': 'reparaciones',
  'reparacion': 'reparaciones',
  'metales': 'metales',
  'metal': 'metales',
  'attachments': 'attachments',
  'attachment': 'attachments',
  'cerómeros y composites': 'ceromeros_composites',
  'ceromeros y composites': 'ceromeros_composites',
  'cerómeros': 'ceromeros_composites',
  'ceromeros': 'ceromeros_composites',
  'composites': 'ceromeros_composites',
  'composite': 'ceromeros_composites',
  'planos y estampados': 'planos_estampados',
  'planos': 'planos_estampados',
  'estampados': 'planos_estampados',
  'plano': 'planos_estampados',
  'estampado': 'planos_estampados',
  'otros': 'otros',
  'otro': 'otros'
};

const GestionPrecios: React.FC<GestionPreciosProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalExcel, setMostrarModalExcel] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>('');
  const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    categoria: 'fija',
    nombre: '',
    precioBase: ''
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setCargando(true);
      setError('');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No hay usuario autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('activo', true)
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) throw error;

      setServicios(data || []);

    } catch (error: any) {
      console.error('Error cargando servicios:', error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  const abrirModal = (servicio?: Servicio) => {
    if (servicio) {
      setServicioEditando(servicio);
      setFormData({
        categoria: servicio.categoria,
        nombre: servicio.nombre,
        precioBase: servicio.precio_base.toString()
      });
    } else {
      setServicioEditando(null);
      setFormData({
        categoria: 'fija',
        nombre: '',
        precioBase: ''
      });
    }
    setMostrarModal(true);
    setError('');
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setServicioEditando(null);
    setFormData({
      categoria: 'fija',
      nombre: '',
      precioBase: ''
    });
    setError('');
  };

  const guardarServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.nombre.trim() || !formData.precioBase.trim()) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    const precio = parseFloat(formData.precioBase);
    if (isNaN(precio) || precio <= 0) {
      setError('Por favor ingresa un precio válido mayor a 0');
      return;
    }

    try {
      setCargando(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No hay usuario autenticado');
        return;
      }

      if (servicioEditando) {
        const { error } = await supabase
          .from('servicios')
          .update({
            nombre: formData.nombre.trim(),
            categoria: formData.categoria,
            precio_base: precio,
            updated_at: new Date().toISOString()
          })
          .eq('id', servicioEditando.id)
          .eq('usuario_id', user.id);

        if (error) throw error;
        
      } else {
        const servicioData = {
          nombre: formData.nombre.trim(),
          categoria: formData.categoria,
          precio_base: precio,
          activo: true,
          usuario_id: user.id,
          creado_en: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('servicios')
          .insert([servicioData]);

        if (error) throw error;
      }

      await cargarServicios();
      cerrarModal();
      
    } catch (error: any) {
      console.error('Error guardando servicio:', error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const eliminarServicio = async (servicio: Servicio) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${servicio.nombre}"?`)) {
      return;
    }

    try {
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No hay usuario autenticado');
        return;
      }

      const { error } = await supabase
        .from('servicios')
        .update({ activo: false })
        .eq('id', servicio.id)
        .eq('usuario_id', user.id);

      if (error) throw error;

      setServicios(prev => prev.filter(s => s.id !== servicio.id));
      
    } catch (error: any) {
      console.error('Error eliminando servicio:', error);
      setError(error.message);
    }
  };

  // Función para descargar plantilla Excel
  const descargarPlantillaExcel = () => {
    const plantilla: FilaPlantillaExcel[] = [
      {
        'Categoría': 'fija',
        'Nombre del Servicio': 'Corona de Zirconio',
        'Precio Base': 150000
      },
      {
        'Categoría': 'removible',
        'Nombre del Servicio': 'Prótesis Acrílica Completa',
        'Precio Base': 200000
      },
      {
        'Categoría': 'implantes',
        'Nombre del Servicio': 'Implante Dental Unitario',
        'Precio Base': 300000
      },
      {
        'Categoría': 'ortodoncia',
        'Nombre del Servicio': 'Brackets Metálicos',
        'Precio Base': 800000
      },
      {
        'Categoría': 'reparaciones', 
        'Nombre del Servicio': 'Reparación de Prótesis',
        'Precio Base': 50000
      },
      {
        'Categoría': 'metales',
        'Nombre del Servicio': 'Estructura de Cromo Cobalto',
        'Precio Base': 120000
      },
      {
        'Categoría': 'attachments',
        'Nombre del Servicio': 'Attachment Locator',
        'Precio Base': 80000
      },
      {
        'Categoría': 'ceromeros_composites',
        'Nombre del Servicio': 'Carilla de Composite',
        'Precio Base': 90000
      },
      {
        'Categoría': 'planos_estampados',
        'Nombre del Servicio': 'Plano de Mordida',
        'Precio Base': 35000
      },
      {
        'Categoría': 'otros',
        'Nombre del Servicio': 'Limpieza Dental Profesional',
        'Precio Base': 40000
      }
    ];

    const ws = XLSX.utils.json_to_sheet(plantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Servicios');
    
    // Ajustar anchos de columnas
    const colWidths = [
      { wch: 20 },
      { wch: 35 },
      { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'plantilla_servicios.xlsx');
  };

  // Función para procesar archivo Excel
  const procesarArchivoExcel = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Función auxiliar para buscar valores en diferentes nombres de columnas
  const obtenerValorColumna = (fila: any, tipo: 'categoria' | 'nombre' | 'precio'): string | null => {
    const mapeoColumnas = {
      categoria: ['Categoría', 'categoria', 'CATEGORIA', 'Categoria', 'Tipo'],
      nombre: ['Nombre del Servicio', 'nombre', 'NOMBRE', 'Nombre', 'Servicio'],
      precio: ['Precio Base', 'precio_base', 'PRECIO', 'precio', 'Precio']
    };

    const posiblesNombres = mapeoColumnas[tipo];
    
    for (const nombreColumna of posiblesNombres) {
      if (fila[nombreColumna] !== undefined && fila[nombreColumna] !== null && fila[nombreColumna] !== '') {
        return fila[nombreColumna].toString();
      }
    }

    return null;
  };

  const cargarDesdeExcel = async () => {
    if (!archivoExcel) {
      setError('Por favor selecciona un archivo Excel');
      return;
    }

    try {
      setCargando(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No hay usuario autenticado');
        return;
      }

      const datosExcel: any[] = await procesarArchivoExcel(archivoExcel) as any[];
      
      // Filtrar filas vacías
      const datosFiltrados = datosExcel.filter(fila => {
        const categoria = obtenerValorColumna(fila, 'categoria');
        const nombre = obtenerValorColumna(fila, 'nombre');
        const precio = obtenerValorColumna(fila, 'precio');
        
        return categoria && nombre && precio;
      });

      if (datosFiltrados.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo');
      }

      const serviciosParaInsertar = datosFiltrados.map((fila, index) => {
        const numeroFila = index + 2;

        const categoria = obtenerValorColumna(fila, 'categoria');
        const nombre = obtenerValorColumna(fila, 'nombre');
        const precioBase = obtenerValorColumna(fila, 'precio');

        if (!categoria || !nombre || !precioBase) {
          throw new Error(`Fila ${numeroFila}: Formato incorrecto`);
        }

        // Normalizar categoría
        const categoriaNormalizada = categoria.toString()
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .trim();

        const categoriaClave = mapeoCategorias[categoriaNormalizada];

        if (!categoriaClave) {
          throw new Error(`Fila ${numeroFila}: Categoría "${categoria}" no válida`);
        }

        const precio = parseFloat(precioBase.toString().replace(/[^\d.,]/g, '').replace(',', '.'));
        if (isNaN(precio) || precio <= 0) {
          throw new Error(`Fila ${numeroFila}: Precio inválido`);
        }

        return {
          nombre: nombre.toString().trim(),
          categoria: categoriaClave,
          precio_base: precio,
          activo: true,
          usuario_id: user.id,
          creado_en: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('servicios')
        .insert(serviciosParaInsertar);

      if (error) throw error;

      alert(`✅ ${serviciosParaInsertar.length} servicios cargados correctamente`);
      await cargarServicios();
      setMostrarModalExcel(false);
      setArchivoExcel(null);
      
    } catch (error: any) {
      console.error('Error cargando desde Excel:', error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar servicios
  const serviciosFiltrados = filtroCategoria === 'todos' 
    ? servicios 
    : servicios.filter(s => s.categoria === filtroCategoria);

  // Formatear precio en CLP
  const formatearPrecioCLP = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  // Estilos mejorados - diseño armónico y minimalista
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap' as const,
      gap: '16px'
    },
    title: {
      color: '#1e293b',
      fontSize: '28px',
      fontWeight: '600',
      margin: '0'
    },
    backButton: {
      backgroundColor: '#64748b',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      backgroundColor: '#475569',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    secondaryButton: {
      backgroundColor: '#334155',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      textAlign: 'center' as const,
      border: '1px solid #e2e8f0'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: '600',
      margin: '8px 0',
      color: '#1e293b'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '14px',
      fontWeight: '500'
    },
    filters: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      flexWrap: 'wrap' as const
    },
    filterButton: {
      padding: '8px 16px',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#475569',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: '500'
    },
    filterButtonActive: {
      backgroundColor: '#475569',
      color: 'white',
      borderColor: '#475569'
    },
    serviciosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px'
    },
    servicioCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    servicioNombre: {
      color: '#1e293b',
      fontSize: '16px',
      fontWeight: '500',
      margin: '0',
      lineHeight: '1.4'
    },
    categoriaBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '500',
      backgroundColor: '#f1f5f9',
      color: '#475569'
    },
    precio: {
      color: '#059669',
      fontSize: '18px',
      fontWeight: '600',
      margin: '8px 0',
      fontFamily: "'Courier New', monospace"
    },
    acciones: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px'
    },
 actionButton: {
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  backgroundColor: '#f8fafc',
  color: '#475569',
  border: '1px solid #e2e8f0'
},
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    modalTitle: {
      color: '#1e293b',
      fontSize: '20px',
      fontWeight: '600',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#64748b',
      padding: '4px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box' as const
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    successButton: {
      backgroundColor: '#475569',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px'
    },
    dangerButton: {
      backgroundColor: '#64748b',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px'
    },
    loadingText: {
      textAlign: 'center' as const,
      color: '#64748b',
      padding: '40px',
      fontSize: '16px'
    },
    emptyState: {
      textAlign: 'center' as const,
      color: '#64748b',
      padding: '40px 20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px dashed #cbd5e1'
    },
    errorText: {
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    excelSection: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    excelTitle: {
      color: '#1e293b',
      fontSize: '18px',
      fontWeight: '600',
      margin: '0 0 16px 0'
    },
    excelDescription: {
      color: '#64748b',
      fontSize: '14px',
      margin: '0 0 20px 0',
      lineHeight: '1.5'
    },
    fileInput: {
      width: '100%',
      padding: '12px',
      border: '2px dashed #cbd5e1',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#f8fafc',
      cursor: 'pointer'
    },
    categoryList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
      marginBottom: '20px'
    },
    categoryItem: {
      padding: '8px',
      backgroundColor: '#f8fafc',
      borderRadius: '4px',
      fontSize: '12px',
      textAlign: 'center' as const,
      color: '#475569'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            style={styles.backButton}
            onClick={handleBack}
          >
            ← Volver
          </button>
          <h1 style={styles.title}>Gestión de Precios</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            style={styles.secondaryButton}
            onClick={descargarPlantillaExcel}
          >
            📥 Plantilla Excel
          </button>
          <button 
            style={styles.secondaryButton}
            onClick={() => setMostrarModalExcel(true)}
          >
            📊 Cargar Excel
          </button>
          <button 
            style={styles.primaryButton}
            onClick={() => abrirModal()}
          >
            ➕ Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Mostrar errores */}
      {error && <div style={styles.errorText}>❌ {error}</div>}

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Servicios</div>
          <div style={styles.statNumber}>{servicios.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Prótesis Fija</div>
          <div style={styles.statNumber}>{servicios.filter(s => s.categoria === 'fija').length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Prótesis Removible</div>
          <div style={styles.statNumber}>{servicios.filter(s => s.categoria === 'removible').length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Implantes</div>
          <div style={styles.statNumber}>{servicios.filter(s => s.categoria === 'implantes').length}</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        <button
          style={{
            ...styles.filterButton,
            ...(filtroCategoria === 'todos' ? styles.filterButtonActive : {})
          }}
          onClick={() => setFiltroCategoria('todos')}
        >
          Todos ({servicios.length})
        </button>
        {Object.entries(categorias).map(([key, nombre]) => (
          <button
            key={key}
            style={{
              ...styles.filterButton,
              ...(filtroCategoria === key ? styles.filterButtonActive : {})
            }}
            onClick={() => setFiltroCategoria(key)}
          >
            {nombre} ({servicios.filter(s => s.categoria === key).length})
          </button>
        ))}
      </div>

      {/* Lista de Servicios */}
      {cargando ? (
        <div style={styles.loadingText}>Cargando servicios...</div>
      ) : serviciosFiltrados.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={{color: '#475569', marginBottom: '8px'}}>No hay servicios</h3>
          <p style={{marginBottom: '20px'}}>
            {filtroCategoria !== 'todos' 
              ? `No hay servicios en la categoría "${categorias[filtroCategoria as keyof typeof categorias]}"`
              : 'Comienza agregando tu primer servicio'
            }
          </p>
          <button 
            style={styles.primaryButton}
            onClick={() => abrirModal()}
          >
            ➕ Agregar Primer Servicio
          </button>
        </div>
      ) : (
        <div style={styles.serviciosGrid}>
          {serviciosFiltrados.map(servicio => (
            <div
              key={servicio.id}
              style={styles.servicioCard}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.servicioNombre}>{servicio.nombre}</h3>
                <span style={styles.categoriaBadge}>
                  {categorias[servicio.categoria as keyof typeof categorias]}
                </span>
              </div>

              <div style={styles.precio}>
                {formatearPrecioCLP(servicio.precio_base)}
              </div>

              <div style={styles.acciones}>
                <button
                  style={styles.actionButton}
                  onClick={() => abrirModal(servicio)}
                >
                  ✏️ Editar
                </button>
                
                <button
                  style={styles.actionButton}
                  onClick={() => eliminarServicio(servicio)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar servicio */}
      {mostrarModal && (
        <div style={styles.modalOverlay} onClick={cerrarModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              <button 
                style={styles.closeButton}
                onClick={cerrarModal}
              >
                ✕
              </button>
            </div>

            {error && <div style={styles.errorText}>{error}</div>}

            <form onSubmit={guardarServicio}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Categoría *</label>
                <select 
                  style={styles.select}
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  required
                >
                  {Object.entries(categorias).map(([key, nombre]) => (
                    <option key={key} value={key}>{nombre}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Servicio *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Corona de Zirconio Personalizada"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Precio Base (CLP) *</label>
                <input
                  type="number"
                  style={styles.input}
                  value={formData.precioBase}
                  onChange={(e) => setFormData({...formData, precioBase: e.target.value})}
                  min="0"
                  step="100"
                  placeholder="0"
                  required
                />
                <small style={{color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                  Precio en pesos chilenos
                </small>
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  type="button" 
                  style={styles.dangerButton}
                  onClick={cerrarModal}
                  disabled={cargando}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={styles.successButton}
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : servicioEditando ? 'Actualizar' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para cargar desde Excel */}
      {mostrarModalExcel && (
        <div style={styles.modalOverlay} onClick={() => setMostrarModalExcel(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Cargar desde Excel</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setMostrarModalExcel(false)}
              >
                ✕
              </button>
            </div>

            {error && <div style={styles.errorText}>{error}</div>}

            <div style={styles.excelSection}>
              <h3 style={styles.excelTitle}>Instrucciones</h3>
              <p style={styles.excelDescription}>
                Descarga la plantilla, completa los datos y súbelos aquí. 
                Asegúrate de usar las categorías correctas y precios en números sin formato.
              </p>

              <div style={styles.categoryList}>
                {Object.entries(categorias).map(([key, nombre]) => (
                  <div key={key} style={styles.categoryItem}>
                    {nombre}
                  </div>
                ))}
              </div>
              
              <input
                type="file"
                accept=".xlsx, .xls"
                style={styles.fileInput}
                onChange={(e) => setArchivoExcel(e.target.files?.[0] || null)}
              />
              
              <div style={styles.buttonGroup}>
                <button 
                  style={styles.dangerButton}
                  onClick={() => setMostrarModalExcel(false)}
                  disabled={cargando}
                >
                  Cancelar
                </button>
                <button 
                  style={styles.successButton}
                  onClick={cargarDesdeExcel}
                  disabled={cargando || !archivoExcel}
                >
                  {cargando ? 'Cargando...' : 'Cargar Servicios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPrecios;