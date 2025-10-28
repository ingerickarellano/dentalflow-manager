// Base de datos temporal - En una aplicación real esto estaría en un backend
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
  especialidad: string;
  telefono: string;
  email: string;
}

export interface Servicio {
  id: string;
  categoria: string;
  nombre: string;
  precioBase: number;
  activo: boolean;
}

export interface Laboratorista {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string;
  email: string;
  activo: boolean;
}

export interface ServicioTrabajo {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Trabajo {
  id: string;
  clinicaId: string;
  dentistaId: string;
  laboratoristaId?: string;
  paciente: string;
  servicios: ServicioTrabajo[];
  fechaRecibido: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'produccion' | 'terminado' | 'entregado';
  precioTotal: number;
  observaciones?: string;
}

// Datos de ejemplo
export const clinicas: Clinica[] = [
  {
    id: '1',
    nombre: 'Clínica Dental Smile',
    direccion: 'Av. Principal 123, Ciudad',
    telefono: '555-0101',
    email: 'info@smiledental.com'
  },
  {
    id: '2',
    nombre: 'Centro Odontológico Moderno',
    direccion: 'Calle Secundaria 456, Ciudad',
    telefono: '555-0102',
    email: 'contacto@modernodental.com'
  }
];

export const dentistas: Dentista[] = [
  {
    id: '1',
    clinicaId: '1',
    nombre: 'Dr. Carlos Rodríguez',
    especialidad: 'Ortodoncia',
    telefono: '555-0201',
    email: 'carlos@smiledental.com'
  },
  {
    id: '2',
    clinicaId: '1',
    nombre: 'Dra. María González',
    especialidad: 'Endodoncia',
    telefono: '555-0202',
    email: 'maria@smiledental.com'
  },
  {
    id: '3',
    clinicaId: '2',
    nombre: 'Dr. Roberto Sánchez',
    especialidad: 'Implantes',
    telefono: '555-0203',
    email: 'roberto@modernodental.com'
  }
];

export const categorias = {
  fija: '🦷 Prótesis Fija',
  removible: '👄 Prótesis Removible',
  implantes: '⚡ Implantes',
  ortodoncia: '🎯 Ortodoncia',
  reparaciones: '🔧 Reparaciones y Otros'
};

export const servicios: Servicio[] = [
  // Prótesis Fija
  {
    id: 'f1',
    categoria: 'fija',
    nombre: 'Corona Metal Porcelana',
    precioBase: 150,
    activo: true
  },
  {
    id: 'f2',
    categoria: 'fija',
    nombre: 'Corona de Zirconio',
    precioBase: 250,
    activo: true
  },
  {
    id: 'f3',
    categoria: 'fija',
    nombre: 'Inlay/Onlay Resina',
    precioBase: 120,
    activo: true
  },
  {
    id: 'f4',
    categoria: 'fija',
    nombre: 'Carilla Estética',
    precioBase: 180,
    activo: true
  },

  // Prótesis Removible
  {
    id: 'r1',
    categoria: 'removible',
    nombre: 'Prótesis Acrílica Completa',
    precioBase: 200,
    activo: true
  },
  {
    id: 'r2',
    categoria: 'removible',
    nombre: 'Prótesis Parcial Acrílica',
    precioBase: 150,
    activo: true
  },
  {
    id: 'r3',
    categoria: 'removible',
    nombre: 'Esqueleto en CoCr',
    precioBase: 300,
    activo: true
  },
  {
    id: 'r4',
    categoria: 'removible',
    nombre: 'Flexible Total',
    precioBase: 350,
    activo: true
  },

  // Implantes
  {
    id: 'i1',
    categoria: 'implantes',
    nombre: 'Corona sobre Implante',
    precioBase: 400,
    activo: true
  },
  {
    id: 'i2',
    categoria: 'implantes',
    nombre: 'Prótesis Híbrida 6 implantes',
    precioBase: 1200,
    activo: true
  },
  {
    id: 'i3',
    categoria: 'implantes',
    nombre: 'Barra Toronto',
    precioBase: 800,
    activo: true
  },

  // Ortodoncia
  {
    id: 'o1',
    categoria: 'ortodoncia',
    nombre: 'Alineador Transparente',
    precioBase: 500,
    activo: true
  },
  {
    id: 'o2',
    categoria: 'ortodoncia',
    nombre: 'Brackets Estéticos',
    precioBase: 300,
    activo: true
  },
  {
    id: 'o3',
    categoria: 'ortodoncia',
    nombre: 'Retenedor Fijo',
    precioBase: 80,
    activo: true
  },

  // Reparaciones
  {
    id: 'rep1',
    categoria: 'reparaciones',
    nombre: 'Reparación de Prótesis',
    precioBase: 50,
    activo: true
  },
  {
    id: 'rep2',
    categoria: 'reparaciones',
    nombre: 'Ajuste de Prótesis',
    precioBase: 25,
    activo: true
  },
  {
    id: 'rep3',
    categoria: 'reparaciones',
    nombre: 'Recarga Acrílica',
    precioBase: 40,
    activo: true
  }
];

export const laboratoristas: Laboratorista[] = [
  {
    id: 'lab1',
    nombre: 'Juan Pérez',
    especialidad: 'Prótesis Fija',
    telefono: '555-0301',
    email: 'juan@laboratorio.com',
    activo: true
  },
  {
    id: 'lab2',
    nombre: 'Ana López',
    especialidad: 'Prótesis Removible',
    telefono: '555-0302',
    email: 'ana@laboratorio.com',
    activo: true
  },
  {
    id: 'lab3',
    nombre: 'Carlos Martínez',
    especialidad: 'Implantes',
    telefono: '555-0303',
    email: 'carlos@laboratorio.com',
    activo: true
  },
  {
    id: 'lab4',
    nombre: 'María Rodríguez',
    especialidad: 'Ortodoncia',
    telefono: '555-0304',
    email: 'maria@laboratorio.com',
    activo: true
  }
];

export const trabajos: Trabajo[] = [
  {
    id: 't1',
    clinicaId: '1',
    dentistaId: '1',
    laboratoristaId: 'lab1',
    paciente: 'Roberto García',
    servicios: [
      {
        servicioId: 'f2',
        cantidad: 1,
        precioUnitario: 250
      }
    ],
    fechaRecibido: '2024-01-15',
    fechaEntrega: '2024-01-22',
    estado: 'terminado',
    precioTotal: 250,
    observaciones: 'Pieza 11'
  },
  {
    id: 't2',
    clinicaId: '1',
    dentistaId: '2',
    laboratoristaId: 'lab2',
    paciente: 'Laura Martínez',
    servicios: [
      {
        servicioId: 'r1',
        cantidad: 1,
        precioUnitario: 200
      }
    ],
    fechaRecibido: '2024-01-16',
    fechaEntrega: '2024-01-23',
    estado: 'produccion',
    precioTotal: 200
  },
  {
    id: 't3',
    clinicaId: '2',
    dentistaId: '3',
    paciente: 'Carlos López',
    servicios: [
      {
        servicioId: 'i1',
        cantidad: 1,
        precioUnitario: 400
      },
      {
        servicioId: 'rep1',
        cantidad: 1,
        precioUnitario: 50
      }
    ],
    fechaRecibido: '2024-01-17',
    fechaEntrega: '2024-01-24',
    estado: 'pendiente',
    precioTotal: 450
  }
];
// Agrega estas interfaces y datos a tu database.ts

export interface PlanSuscripcion {
  id: string;
  nombre: string;
  duracion: 'mensual' | 'trimestral' | 'anual' | '2años' | '3años' | '4años';
  precio: number;
  descuento: number; // % de descuento
  caracteristicas: string[];
  popular: boolean;
}

export interface SuscripcionUsuario {
  id: string;
  usuarioId: string;
  planId: string;
  fechaInicio: string;
  fechaExpiracion: string;
  estado: 'activa' | 'expirada' | 'cancelada' | 'pendiente_pago';
  metodoPago: string;
  transaccionId?: string;
}

export interface Pago {
  id: string;
  suscripcionId: string;
  monto: number;
  fecha: string;
  estado: 'completado' | 'fallido' | 'pendiente';
  metodo: 'webpay' | 'transferencia' | 'tarjeta';
  referencia?: string;
}

// Planes de suscripción
export const planesSuscripcion: PlanSuscripcion[] = [
  {
    id: 'plan_mensual',
    nombre: 'Plan Mensual',
    duracion: 'mensual',
    precio: 29000, // $29.000 CLP
    descuento: 0,
    caracteristicas: [
      'Acceso completo a la plataforma',
      'Hasta 5 clínicas',
      'Soporte por email',
      'Reportes básicos'
    ],
    popular: false
  },
  {
    id: 'plan_trimestral',
    nombre: 'Plan Trimestral',
    duracion: 'trimestral',
    precio: 75000, // $75.000 CLP (13% descuento)
    descuento: 13,
    caracteristicas: [
      'Acceso completo a la plataforma',
      'Hasta 10 clínicas',
      'Soporte prioritario',
      'Reportes avanzados'
    ],
    popular: false
  },
  {
    id: 'plan_anual',
    nombre: 'Plan Anual',
    duracion: 'anual',
    precio: 250000, // $250.000 CLP (28% descuento)
    descuento: 28,
    caracteristicas: [
      'Acceso completo a la plataforma',
      'Clínicas ilimitadas',
      'Soporte prioritario 24/7',
      'Reportes premium + PDF',
      'Backup automático'
    ],
    popular: true
  },
  {
    id: 'plan_2anios',
    nombre: 'Plan 2 Años',
    duracion: '2años',
    precio: 420000, // $420.000 CLP (40% descuento)
    descuento: 40,
    caracteristicas: [
      'Acceso completo a la plataforma',
      'Clínicas ilimitadas',
      'Soporte prioritario 24/7',
      'Reportes premium + PDF',
      'Backup automático',
      'Capacitación incluida'
    ],
    popular: false
  },
  {
    id: 'plan_3anios',
    nombre: 'Plan 3 Años',
    duracion: '3años',
    precio: 550000, // $550.000 CLP (45% descuento)
    descuento: 45,
    caracteristicas: [
      'Todo lo del plan 2 años',
      'Mantenimiento incluido',
      'Actualizaciones premium',
      'Soporte dedicado'
    ],
    popular: false
  },
  {
    id: 'plan_4anios',
    nombre: 'Plan 4 Años',
    duracion: '4años',
    precio: 650000, // $650.000 CLP (50% descuento)
    descuento: 50,
    caracteristicas: [
      'Todo lo del plan 3 años',
      'Consultoría estratégica',
      'Migración de datos',
      'Soporte VIP'
    ],
    popular: false
  }
];

// Datos de ejemplo para suscripciones
export const suscripciones: SuscripcionUsuario[] = [
  {
    id: 'sub_1',
    usuarioId: 'admin',
    planId: 'plan_anual',
    fechaInicio: '2024-01-01',
    fechaExpiracion: '2025-01-01',
    estado: 'activa',
    metodoPago: 'webpay'
  }
];

export const pagos: Pago[] = [
  {
    id: 'pay_1',
    suscripcionId: 'sub_1',
    monto: 250000,
    fecha: '2024-01-01',
    estado: 'completado',
    metodo: 'webpay'
  }
];
// Configuración del sistema
export const settings = {
  taxNatural: 0,
  taxJuridica: 0
};

// Funciones para Laboratoristas
export const agregarLaboratorista = (laboratorista: Omit<Laboratorista, 'id'>) => {
  const nuevoLaboratorista: Laboratorista = {
    ...laboratorista,
    id: 'lab' + (laboratoristas.length + 1)
  };
  laboratoristas.push(nuevoLaboratorista);
  return nuevoLaboratorista;
};

export const actualizarLaboratorista = (id: string, datos: Partial<Laboratorista>) => {
  const index = laboratoristas.findIndex(l => l.id === id);
  if (index !== -1) {
    laboratoristas[index] = { ...laboratoristas[index], ...datos };
  }
};

export const eliminarLaboratorista = (id: string) => {
  const index = laboratoristas.findIndex(l => l.id === id);
  if (index !== -1) {
    laboratoristas.splice(index, 1);
  }
};

export const toggleActivoLaboratorista = (id: string) => {
  const index = laboratoristas.findIndex(l => l.id === id);
  if (index !== -1) {
    laboratoristas[index].activo = !laboratoristas[index].activo;
  }
};

// Funciones para Servicios
export const agregarServicio = (servicio: Omit<Servicio, 'id'>) => {
  const nuevoServicio: Servicio = {
    ...servicio,
    id: 's' + (servicios.length + 1)
  };
  servicios.push(nuevoServicio);
  return nuevoServicio;
};

export const actualizarServicio = (id: string, datos: Partial<Servicio>) => {
  const index = servicios.findIndex(s => s.id === id);
  if (index !== -1) {
    servicios[index] = { ...servicios[index], ...datos };
  }
};

export const eliminarServicio = (id: string) => {
  const index = servicios.findIndex(s => s.id === id);
  if (index !== -1) {
    servicios.splice(index, 1);
  }
};

export const toggleActivoServicio = (id: string) => {
  const index = servicios.findIndex(s => s.id === id);
  if (index !== -1) {
    servicios[index].activo = !servicios[index].activo;
  }
};