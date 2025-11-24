import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

const categorias = {
  'fija': '🦷 Prótesis Fija',
  'removible': '👄 Prótesis Removible', 
  'implantes': '⚡ Implantes',
  'ortodoncia': '🎯 Ortodoncia',
  'reparaciones': '🔧 Reparaciones'
};

const GestionPrecios: React.FC<GestionPreciosProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>('');
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
        setError('No hay usuario autenticado. Por favor inicia sesión nuevamente.');
        return;
      }

      console.log('Cargando servicios para usuario:', user.id);

      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('usuario_id', user.id)
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`Error al cargar servicios: ${error.message}`);
      }

      setServicios(data || []);
      console.log('Servicios cargados:', data?.length || 0);

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
        setError('No hay usuario autenticado. Por favor inicia sesión nuevamente.');
        return;
      }

      console.log('Guardando servicio para usuario:', user.id);

      if (servicioEditando) {
        // Actualizar servicio existente
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

        if (error) {
          console.error('Error de Supabase al actualizar:', error);
          throw new Error(`Error al actualizar servicio: ${error.message}`);
        }
        
        alert('✅ Servicio actualizado exitosamente');
      } else {
        // Crear nuevo servicio - usando la estructura correcta de tu tabla
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

        console.log('Insertando servicio:', servicioData);

        const { data, error } = await supabase
          .from('servicios')
          .insert([servicioData])
          .select();

        if (error) {
          console.error('Error de Supabase al insertar:', error);
          
          // Manejo específico de errores
          if (error.code === '23503') {
            throw new Error('Error de referencia: El usuario_id no existe en la base de datos');
          } else if (error.code === '23505') {
            throw new Error('Error de duplicado: Ya existe un servicio con estos datos');
          } else if (error.code === '42501') {
            throw new Error('Error de permisos: No tienes permisos para realizar esta acción');
          } else {
            throw new Error(`Error al crear servicio: ${error.message} (Código: ${error.code})`);
          }
        }

        console.log('Servicio creado:', data);
        alert('✅ Servicio creado exitosamente');
      }

      // Recargar servicios y cerrar modal
      await cargarServicios();
      cerrarModal();
      
    } catch (error: any) {
      console.error('Error guardando servicio:', error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const toggleActivoServicio = async (servicio: Servicio) => {
    try {
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No hay usuario autenticado');
        return;
      }

      const { error } = await supabase
        .from('servicios')
        .update({ 
          activo: !servicio.activo,
          updated_at: new Date().toISOString()
        })
        .eq('id', servicio.id)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error de Supabase al cambiar estado:', error);
        throw new Error(`Error al cambiar estado: ${error.message}`);
      }

      // Actualizar estado local
      setServicios(prev => prev.map(s => 
        s.id === servicio.id ? { ...s, activo: !s.activo } : s
      ));

      const estado = servicio.activo ? 'desactivado' : 'activado';
      alert(`✅ Servicio ${estado} exitosamente`);
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      setError(error.message);
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
        .delete()
        .eq('id', servicio.id)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error de Supabase al eliminar:', error);
        throw new Error(`Error al eliminar servicio: ${error.message}`);
      }

      // Actualizar estado local
      setServicios(prev => prev.filter(s => s.id !== servicio.id));
      alert('✅ Servicio eliminado exitosamente');
    } catch (error: any) {
      console.error('Error eliminando servicio:', error);
      setError(error.message);
    }
  };

  // Filtrar servicios
  const serviciosFiltrados = filtroCategoria === 'todos' 
    ? servicios 
    : servicios.filter(s => s.categoria === filtroCategoria);

  const serviciosActivos = servicios.filter(s => s.activo);
  const serviciosInactivos = servicios.filter(s => !s.activo);

  // Formatear precio en CLP
  const formatearPrecioCLP = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  // Estilos (se mantienen igual)
  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
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
      color: '#1a202c',
      fontSize: '28px',
      fontWeight: '700',
      margin: '0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    backButton: {
      backgroundColor: '#4a5568',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    primaryButton: {
      backgroundColor: '#4299e1',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center' as const,
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s ease'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: '700',
      margin: '8px 0',
      color: '#2d3748'
    },
    statLabel: {
      color: '#718096',
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
      padding: '10px 20px',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#4a5568',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: '500'
    },
    filterButtonActive: {
      backgroundColor: '#4299e1',
      color: 'white',
      borderColor: '#4299e1'
    },
    serviciosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px'
    },
    servicioCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      opacity: 1
    },
    servicioCardInactiva: {
      opacity: 0.7,
      backgroundColor: '#f7fafc'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    servicioNombre: {
      color: '#2d3748',
      fontSize: '18px',
      fontWeight: '600',
      margin: '0',
      lineHeight: '1.4'
    },
    categoriaBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: '#ebf8ff',
      color: '#3182ce',
      whiteSpace: 'nowrap' as const
    },
    precio: {
      color: '#2b6cb0',
      fontSize: '24px',
      fontWeight: '700',
      margin: '12px 0',
      fontFamily: "'Courier New', monospace"
    },
    estadoBadge: {
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block'
    },
    estadoActivo: {
      backgroundColor: '#c6f6d5',
      color: '#276749'
    },
    estadoInactivo: {
      backgroundColor: '#fed7d7',
      color: '#c53030'
    },
    acciones: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      flexWrap: 'wrap' as const
    },
    actionButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    modalTitle: {
      color: '#2d3748',
      fontSize: '24px',
      fontWeight: '700',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#718096',
      padding: '4px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      color: '#4a5568',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box' as const,
      transition: 'border-color 0.2s ease'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '32px'
    },
    successButton: {
      backgroundColor: '#48bb78',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    dangerButton: {
      backgroundColor: '#f56565',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    loadingText: {
      textAlign: 'center' as const,
      color: '#718096',
      padding: '40px',
      fontSize: '16px'
    },
    emptyState: {
      textAlign: 'center' as const,
      color: '#718096',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '2px dashed #cbd5e0'
    },
    errorText: {
      color: '#e53e3e',
      backgroundColor: '#fed7d7',
      border: '1px solid #feb2b2',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500'
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
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2d3748'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a5568'}
          >
            ← Volver
          </button>
          <h1 style={styles.title}>💰 Gestión de Precios</h1>
        </div>
        <button 
          style={styles.primaryButton}
          onClick={() => abrirModal()}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4299e1'}
        >
          ➕ Nuevo Servicio
        </button>
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
          <div style={styles.statLabel}>Servicios Activos</div>
          <div style={{...styles.statNumber, color: '#38a169'}}>{serviciosActivos.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Servicios Inactivos</div>
          <div style={{...styles.statNumber, color: '#e53e3e'}}>{serviciosInactivos.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Categorías</div>
          <div style={{...styles.statNumber, color: '#805ad5'}}>{Object.keys(categorias).length}</div>
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
          📋 Todos ({servicios.length})
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
          <h3 style={{color: '#4a5568', marginBottom: '8px'}}>No hay servicios</h3>
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
              style={{
                ...styles.servicioCard,
                ...(!servicio.activo ? styles.servicioCardInactiva : {})
              }}
              onMouseOver={(e) => {
                if (servicio.activo) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
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

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{
                  ...styles.estadoBadge,
                  ...(servicio.activo ? styles.estadoActivo : styles.estadoInactivo)
                }}>
                  {servicio.activo ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>

              <div style={styles.acciones}>
                <button
                  style={{
                    ...styles.actionButton,
                    backgroundColor: servicio.activo ? '#ed8936' : '#48bb78',
                    color: 'white'
                  }}
                  onClick={() => toggleActivoServicio(servicio)}
                >
                  {servicio.activo ? '❌ Desactivar' : '✅ Activar'}
                </button>
                
                <button
                  style={{
                    ...styles.actionButton,
                    backgroundColor: '#805ad5',
                    color: 'white'
                  }}
                  onClick={() => abrirModal(servicio)}
                >
                  ✏️ Editar
                </button>
                
                <button
                  style={{
                    ...styles.actionButton,
                    backgroundColor: '#f56565',
                    color: 'white'
                  }}
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
                {servicioEditando ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}
              </h2>
              <button 
                style={styles.closeButton}
                onClick={cerrarModal}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                <small style={{color: '#718096', fontSize: '12px', marginTop: '4px', display: 'block'}}>
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
                  {cargando ? '⏳ Guardando...' : servicioEditando ? '💾 Actualizar' : '➕ Crear'} Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPrecios;