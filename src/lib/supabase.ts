import { createClient } from '@supabase/supabase-js';

// Para Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug: Verificar que las variables se cargan
console.log('🔧 Configurando Supabase...');
console.log('URL:', supabaseUrl ? '✓ Cargada' : '✗ Falta');
console.log('KEY:', supabaseAnonKey ? '✓ Cargada' : '✗ Falta');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Faltan variables de entorno de Supabase');
  console.error('Por favor verifica tu archivo .env');
  // No lanzamos error para que la app no se caiga, pero mostramos alerta
  alert('Error de configuración: Faltan credenciales de Supabase. Verifica la consola.');
}

export const supabase = createClient(
  supabaseUrl || 'https://default.supabase.co', // URL por defecto para evitar crash
  supabaseAnonKey || 'default-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: 'dentalflow-supabase-auth'
    },
    global: {
      headers: {
        'X-Client-Info': 'dentalflow-app'
      }
    }
  }
);

// Función para testear la conexión
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Probando conexión a Supabase...');
    
    // Test simple: obtener sesión
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error en auth:', sessionError);
      return false;
    }
    
    console.log('✅ Conexión a Supabase OK');
    console.log('Usuario:', session.session?.user?.email || 'No autenticado');
    
    // Test: listar tablas disponibles (si tienes permisos)
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('perfiles_usuarios')
        .select('count')
        .limit(1);
        
      console.log('📊 Tabla perfiles_usuarios:', tablesError ? 'No accesible' : 'Accesible');
    } catch (e) {
      console.log('📊 No se pudo acceder a perfiles_usuarios (puede ser normal)');
    }
    
    return true;
  } catch (error: any) {
    console.error('💥 Error de conexión:', error.message);
    return false;
  }
};