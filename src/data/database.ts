// Base de datos simulada - Ahora editable por el usuario
export interface Clinica {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface Dentista {
  id: string;
  clinicaId: string;
  nombre: string;
  telefono: string;
  email: string;
  especialidad: string;
}

// ⭐⭐⭐⭐ NUEVA INTERFAZ LABORATORISTA ⭐⭐⭐⭐
export interface Laboratorista {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string;
  email: string;
  activo: boolean;
}

export interface Servicio {
  id: string;
  categoria: string;
  nombre: string;
  precioBase: number;
  activo: boolean;
}

export interface Trabajo {
  id: string;
  clinicaId: string;
  dentistaId: string;
  laboratoristaId?: string;  // ⭐⭐⭐⭐ NUEVO CAMPO OPCIONAL ⭐⭐⭐⭐
  paciente: string;
  servicios: ServicioTrabajo[];
  fechaRecibido: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'produccion' | 'terminado' | 'entregado';
  precioTotal: number;
  observaciones: string;
}

export interface ServicioTrabajo {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
}

// Servicios iniciales - EDITABLES POR EL USUARIO
export let servicios: Servicio[] = [
  // PROTESIS FIJA
  { id: '1', categoria: 'fija', nombre: 'Corona Metal Porcelana', precioBase: 120, activo: true },
  { id: '2', categoria: 'fija', nombre: 'Corona Zirconio completo', precioBase: 150, activo: true },
  { id: '3', categoria: 'fija', nombre: 'Corona Zirconio metal free', precioBase: 180, activo: true },
  { id: '4', categoria: 'fija', nombre: 'Corona Disilicato de litio (e.max)', precioBase: 200, activo: true },
  { id: '5', categoria: 'fija', nombre: 'Corona Acrílica provisional', precioBase: 80, activo: true },
  { id: '6', categoria: 'fija', nombre: 'Inlay/Onlay metal', precioBase: 130, activo: true },
  { id: '7', categoria: 'fija', nombre: 'Inlay/Onlay cerámica', precioBase: 160, activo: true },
  { id: '8', categoria: 'fija', nombre: 'Carilla cerámica', precioBase: 140, activo: true },
  { id: '9', categoria: 'fija', nombre: 'Puente Metal Porcelana', precioBase: 350, activo: true },
  { id: '10', categoria: 'fija', nombre: 'Puente Zirconio', precioBase: 450, activo: true },
  
  // PROTESIS REMOVIBLE
  { id: '11', categoria: 'removible', nombre: 'Prótesis acrílica completa', precioBase: 300, activo: true },
  { id: '12', categoria: 'removible', nombre: 'Prótesis acrílica parcial', precioBase: 250, activo: true },
  { id: '13', categoria: 'removible', nombre: 'Esqueleto CoCr', precioBase: 400, activo: true },
  { id: '14', categoria: 'removible', nombre: 'Esqueleto acero valplat', precioBase: 350, activo: true },
  { id: '15', categoria: 'removible', nombre: 'Prótesis flexible', precioBase: 280, activo: true },
  { id: '16', categoria: 'removible', nombre: 'Reparación prótesis acrílica', precioBase: 60, activo: true },
  { id: '17', categoria: 'removible', nombre: 'Reline acrílico', precioBase: 80, activo: true },
  { id: '18', categoria: 'removible', nombre: 'Reline blando', precioBase: 100, activo: true },
  { id: '19', categoria: 'removible', nombre: 'Añadir diente a prótesis', precioBase: 40, activo: true },
  
  // IMPLANTES
  { id: '20', categoria: 'implantes', nombre: 'Corona sobre implante', precioBase: 220, activo: true },
  { id: '21', categoria: 'implantes', nombre: 'Puente sobre implantes', precioBase: 600, activo: true },
  { id: '22', categoria: 'implantes', nombre: 'Prótesis híbrida implantes', precioBase: 800, activo: true },
  { id: '23', categoria: 'implantes', nombre: 'Barra overdenture', precioBase: 350, activo: true },
  { id: '24', categoria: 'implantes', nombre: 'Corona provisional implante', precioBase: 100, activo: true },
  
  // ORTODONCIA
  { id: '25', categoria: 'ortodoncia', nombre: 'Aparato removible acrílico', precioBase: 200, activo: true },
  { id: '26', categoria: 'ortodoncia', nombre: 'Placa de descarga', precioBase: 150, activo: true },
  { id: '27', categoria: 'ortodoncia', nombre: 'Retenedor fijo', precioBase: 120, activo: true },
  { id: '28', categoria: 'ortodoncia', nombre: 'Retenedor removible', precioBase: 100, activo: true },
  { id: '29', categoria: 'ortodoncia', nombre: 'Alineadores transparentes', precioBase: 500, activo: true },
  
  // REPARACIONES
  { id: '30', categoria: 'reparaciones', nombre: 'Reparación corona', precioBase: 70, activo: true },
  { id: '31', categoria: 'reparaciones', nombre: 'Rebase prótesis', precioBase: 90, activo: true },
  { id: '32', categoria: 'reparaciones', nombre: 'Ajuste oclusal', precioBase: 50, activo: true },
  { id: '33', categoria: 'reparaciones', nombre: 'Blanqueamiento guarda', precioBase: 110, activo: true },
  { id: '34', categoria: 'reparaciones', nombre: 'Protector bucal deportivo', precioBase: 130, activo: true },
  { id: '35', categoria: 'reparaciones', nombre: 'Placa de mordida', precioBase: 140, activo: true },
];

// Categorías disponibles
export const categorias = {
  'fija': '🦷 Prótesis Fija',
  'removible': '👄 Prótesis Removible', 
  'implantes': '⚡ Implantes',
  'ortodoncia': '🎯 Ortodoncia',
  'reparaciones': '🔧 Reparaciones y Otros',
  'personalizado': '🎨 Personalizado' // Nueva categoría para servicios custom
};

// Datos iniciales
export let clinicas: Clinica[] = [
  { id: '1', nombre: 'Clínica Dental Smile', direccion: 'Av. Principal 123', telefono: '555-0101', email: 'info@smiledental.com' },
  { id: '2', nombre: 'Dental Center', direccion: 'Calle Secundaria 456', telefono: '555-0102', email: 'contacto@dentalcenter.com' },
];

export let dentistas: Dentista[] = [
  { id: '1', clinicaId: '1', nombre: 'Dr. Roberto García', telefono: '555-0201', email: 'rgarcia@smiledental.com', especialidad: 'Ortodoncia' },
  { id: '2', clinicaId: '1', nombre: 'Dra. María López', telefono: '555-0202', email: 'mlopez@smiledental.com', especialidad: 'Implantes' },
  { id: '3', clinicaId: '2', nombre: 'Dr. Carlos Martínez', telefono: '555-0203', email: 'cmartinez@dentalcenter.com', especialidad: 'Prótesis' },
];

// ⭐⭐⭐⭐ NUEVO ARRAY DE LABORATORISTAS ⭐⭐⭐⭐
export let laboratoristas: Laboratorista[] = [
  { 
    id: '1', 
    nombre: 'Técnico Principal', 
    especialidad: 'Prótesis Fija y Removible', 
    telefono: '555-1001', 
    email: 'tecnico@lab.com', 
    activo: true 
  },
  { 
    id: '2', 
    nombre: 'Especialista en Implantes', 
    especialidad: 'Implantes y Prótesis sobre Implantes', 
    telefono: '555-1002', 
    email: 'implantes@lab.com', 
    activo: true 
  },
  { 
    id: '3', 
    nombre: 'Técnico en Ortodoncia', 
    especialidad: 'Ortodoncia y Alineadores', 
    telefono: '555-1003', 
    email: 'ortodoncia@lab.com', 
    activo: true 
  },
];

export let trabajos: Trabajo[] = [];

// Funciones para gestionar servicios
export const agregarServicio = (servicio: Omit<Servicio, 'id'>) => {
  const nuevoServicio: Servicio = {
    ...servicio,
    id: Date.now().toString()
  };
  servicios.push(nuevoServicio);
  return nuevoServicio;
};

export const actualizarServicio = (id: string, updates: Partial<Servicio>) => {
  const index = servicios.findIndex(s => s.id === id);
  if (index !== -1) {
    servicios[index] = { ...servicios[index], ...updates };
    return servicios[index];
  }
  return null;
};

export const eliminarServicio = (id: string) => {
  const index = servicios.findIndex(s => s.id === id);
  if (index !== -1) {
    servicios.splice(index, 1);
    return true;
  }
  return false;
};

export const toggleActivoServicio = (id: string) => {
  const servicio = servicios.find(s => s.id === id);
  if (servicio) {
    servicio.activo = !servicio.activo;
    return servicio;
  }
  return null;
};

// ⭐⭐⭐⭐ NUEVAS FUNCIONES PARA GESTIONAR LABORATORISTAS ⭐⭐⭐⭐
export const agregarLaboratorista = (laboratorista: Omit<Laboratorista, 'id'>) => {
  const nuevoLaboratorista: Laboratorista = {
    ...laboratorista,
    id: Date.now().toString()
  };
  laboratoristas.push(nuevoLaboratorista);
  return nuevoLaboratorista;
};

export const actualizarLaboratorista = (id: string, updates: Partial<Laboratorista>) => {
  const index = laboratoristas.findIndex(l => l.id === id);
  if (index !== -1) {
    laboratoristas[index] = { ...laboratoristas[index], ...updates };
    return laboratoristas[index];
  }
  return null;
};

export const eliminarLaboratorista = (id: string) => {
  const index = laboratoristas.findIndex(l => l.id === id);
  if (index !== -1) {
    laboratoristas.splice(index, 1);
    return true;
  }
  return false;
};

export const toggleActivoLaboratorista = (id: string) => {
  const laboratorista = laboratoristas.find(l => l.id === id);
  if (laboratorista) {
    laboratorista.activo = !laboratorista.activo;
    return laboratorista;
  }
  return null;
};

// ⭐⭐⭐⭐ SETTINGS COMPLETO Y CORREGIDO ⭐⭐⭐⭐
export const settings = {
  empresa: {
    nombre: 'DentalFlow Manager',
    rfc: '',
    direccion: '',
    telefono: '',
    email: ''
  },
  facturacion: {
    serie: 'DF',
    folio: 1,
    condicionesPago: 'Contado'
  },
  // ⭐⭐⭐⭐ PROPIEDADES NUEVAS QUE RESUELVEN EL ERROR ⭐⭐⭐⭐
  impuestoPersonaNatural: 0,
  impuestoPersonaJuridica: 0
};