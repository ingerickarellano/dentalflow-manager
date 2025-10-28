import React, { useState } from 'react';
import { Servicio, servicios, categorias, agregarServicio, actualizarServicio, eliminarServicio, toggleActivoServicio } from '../data/database';

interface ListaPreciosProps {
  onBack: () => void;
}

const ListaPrecios: React.FC<ListaPreciosProps> = ({ onBack }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [formData, setFormData] = useState({
    categoria: 'fija',
    nombre: '',
    precioBase: ''
  });

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
      cursor: 'pointer'
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
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    filters: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap' as const
    },
    filterButton: {
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#374151',
      transition: 'all 0.2s'
    },
    filterButtonActive: {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: '4px solid #2563eb',
      opacity: 1,
      transition: 'all 0.2s'
    },
    cardInactiva: {
      opacity: 0.6,
      backgroundColor: '#f8fafc'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    servicioNombre: {
      color: '#1e293b',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: 0
    },
    categoriaBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: '#e0f2fe',
      color: '#0369a1'
    },
    precio: {
      color: '#2563eb',
      fontSize: '1.25rem',
      fontWeight: 'bold',
      margin: '0.5rem 0'
    },
    estadoBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    estadoActivo: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    estadoInactivo: {
      backgroundColor: '#fef2f2',
      color: '#991b1b'
    },
    actions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      flexWrap: 'wrap' as const
    },
    formContainer: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
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
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center' as const
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#2563eb',
      margin: '0.5rem 0'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.875rem'
    }
  };

  const serviciosFiltrados = filtroCategoria === 'todos' 
    ? servicios 
    : servicios.filter(s => s.categoria === filtroCategoria);

  const serviciosActivos = servicios.filter(s => s.activo);
  const serviciosInactivos = servicios.filter(s => !s.activo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.precioBase) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const precio = parseFloat(formData.precioBase);
    if (isNaN(precio) || precio <= 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }
    
    if (servicioEditando) {
      // Editar servicio existente
      actualizarServicio(servicioEditando.id, {
        ...formData,
        precioBase: precio
      });
      alert('✅ Servicio actualizado exitosamente');
    } else {
      // Crear nuevo servicio
      agregarServicio({
        categoria: formData.categoria,
        nombre: formData.nombre,
        precioBase: precio,
        activo: true
      });
      alert('✅ Servicio creado exitosamente');
    }
    
    setMostrarFormulario(false);
    setServicioEditando(null);
    setFormData({ categoria: 'fija', nombre: '', precioBase: '' });
  };

  const handleEditar = (servicio: Servicio) => {
    setServicioEditando(servicio);
    setFormData({
      categoria: servicio.categoria,
      nombre: servicio.nombre,
      precioBase: servicio.precioBase.toString()
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = (servicio: Servicio) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${servicio.nombre}"?`)) {
      eliminarServicio(servicio.id);
      alert('✅ Servicio eliminado exitosamente');
    }
  };

  const handleToggleActivo = (servicio: Servicio) => {
    toggleActivoServicio(servicio.id);
    const estado = servicio.activo ? 'desactivado' : 'activado';
    alert(`✅ Servicio ${estado} exitosamente`);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setServicioEditando(null);
    setFormData({ categoria: 'fija', nombre: '', precioBase: '' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Volver al Dashboard
          </button>
          <h1 style={styles.title}>💰 Lista de Precios</h1>
        </div>
        <button 
          style={styles.button}
          onClick={() => {
            setServicioEditando(null);
            setFormData({ categoria: 'fija', nombre: '', precioBase: '' });
            setMostrarFormulario(true);
          }}
        >
          + Agregar Servicio
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Servicios</div>
          <div style={styles.statNumber}>{servicios.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Servicios Activos</div>
          <div style={{...styles.statNumber, color: '#10b981'}}>{serviciosActivos.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Servicios Inactivos</div>
          <div style={{...styles.statNumber, color: '#dc2626'}}>{serviciosInactivos.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Categorías</div>
          <div style={{...styles.statNumber, color: '#8b5cf6'}}>{Object.keys(categorias).length}</div>
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

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={styles.formContainer}>
          <h3 style={{marginBottom: '1.5rem', color: '#1e293b'}}>
            {servicioEditando ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}
          </h3>
          
          <form onSubmit={handleSubmit}>
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
              <label style={styles.label}>Precio Base ($) *</label>
              <input
                type="number"
                style={styles.input}
                value={formData.precioBase}
                onChange={(e) => setFormData({...formData, precioBase: e.target.value})}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button type="submit" style={styles.buttonSuccess}>
                {servicioEditando ? '💾 Actualizar' : '➕ Crear'} Servicio
              </button>
              <button type="button" style={styles.buttonDanger} onClick={handleCancelar}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Servicios */}
      <div style={styles.grid}>
        {serviciosFiltrados.map(servicio => (
          <div
            key={servicio.id}
            style={{
              ...styles.card,
              ...(!servicio.activo ? styles.cardInactiva : {})
            }}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.servicioNombre}>{servicio.nombre}</h3>
              <span style={styles.categoriaBadge}>
                {categorias[servicio.categoria as keyof typeof categorias]}
              </span>
            </div>

            <div style={styles.precio}>${servicio.precioBase}</div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{
                ...styles.estadoBadge,
                ...(servicio.activo ? styles.estadoActivo : styles.estadoInactivo)
              }}>
                {servicio.activo ? '✅ Activo' : '❌ Inactivo'}
              </span>
              
              <small style={{color: '#64748b'}}>
                ID: {servicio.id}
              </small>
            </div>

            <div style={styles.actions}>
              <button
                style={{
                  ...styles.button,
                  backgroundColor: servicio.activo ? '#f59e0b' : '#10b981',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem'
                }}
                onClick={() => handleToggleActivo(servicio)}
              >
                {servicio.activo ? '❌ Desactivar' : '✅ Activar'}
              </button>
              
              <button
                style={{
                  ...styles.button,
                  backgroundColor: '#8b5cf6',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem'
                }}
                onClick={() => handleEditar(servicio)}
              >
                ✏️ Editar
              </button>
              
              <button
                style={{
                  ...styles.buttonDanger,
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem'
                }}
                onClick={() => handleEliminar(servicio)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {serviciosFiltrados.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#64748b'
        }}>
          <h3>No hay servicios {filtroCategoria !== 'todos' ? `en la categoría "${categorias[filtroCategoria as keyof typeof categorias]}"` : 'registrados'}</h3>
          <p>Comienza agregando tu primer servicio usando el botón "Agregar Servicio"</p>
        </div>
      )}
    </div>
  );
};

export default ListaPrecios;