import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PayPalProvider } from './PayPalProvider';
import { supabase } from './lib/supabase';

// Componentes de páginas
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Registro from './components/Registro';
import RecuperacionCuenta from './components/RecuperacionCuenta';
import Dashboard from './components/Dashboard';

// Componentes de gestión
import CrearTrabajo from './components/CrearTrabajo';
import GestionClinicas from './components/GestionClinicas';
import GestionDentistas from './components/GestionDentistas';
import GestionLaboratoristas from './components/GestionLaboratoristas';
import GestionServicios from './components/GestionServicios';
import GestionTrabajos from './components/GestionTrabajos';
import GestionSuscripciones from './components/GestionSuscripciones';
import Suscripciones from './components/Suscripciones';
import GestionPrecios from './components/GestionPrecios';
import OpcionesCuenta from './components/OpcionesCuenta';
import Reportes from './components/Reportes';
import AdminPanel from './components/AdminPanel';

// Interfaces
interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  suscripcion_activa?: boolean;
  fecha_expiracion?: string;
}

// Componente principal de la aplicación
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar sesión al cargar
  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async (): Promise<void> => {
    try {
      console.log('🔍 Verificando sesión...');
      setLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error verificando sesión:', error);
        setLoading(false);
        return;
      }

      console.log('📋 Sesión obtenida:', session ? 'Sí' : 'No');

      if (session?.user) {
        console.log('👤 Usuario encontrado, cargando datos...');
        await loadUserData(session.user);
      } else {
        console.log('🚫 No hay usuario en sesión');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        // Si estamos en una ruta protegida y no hay usuario, redirigir al landing
        if (window.location.pathname !== '/' && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/registro' &&
            window.location.pathname !== '/recuperacion') {
          navigate('/');
        }
      }

    } catch (error: any) {
      console.error('💥 Error en checkAuthSession:', error);
    } finally {
      console.log('✅ Verificación de sesión completada');
      setLoading(false);
    }
  };

  const loadUserData = async (user: any): Promise<void> => {
    try {
      console.log('📥 Cargando datos del usuario...');
      
      // Intentar cargar el perfil del usuario
      const { data: userProfile, error } = await supabase
        .from('perfiles_usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('⚠️ No se pudo cargar el perfil (puede ser normal para usuarios nuevos):', error.message);
        // No es crítico si no existe el perfil aún
      }

      const userData: User = {
        id: user.id,
        email: user.email!,
        nombre: userProfile?.nombre || user.user_metadata?.nombre || user.email!.split('@')[0],
        rol: userProfile?.rol || user.user_metadata?.rol || 'cliente',
        suscripcion_activa: userProfile?.suscripcion_activa || false,
        fecha_expiracion: userProfile?.fecha_expiracion
      };

      console.log('👤 Datos de usuario cargados:', userData);
      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));

    } catch (error: any) {
      console.error('❌ Error cargando datos de usuario:', error);
      // Si hay error, crear usuario básico
      const basicUser: User = {
        id: user.id,
        email: user.email!,
        nombre: user.user_metadata?.nombre || user.email!.split('@')[0],
        rol: 'cliente',
        suscripcion_activa: false
      };
      setCurrentUser(basicUser);
      localStorage.setItem('currentUser', JSON.stringify(basicUser));
    }
  };

  // Escuchar cambios de autenticación
  useEffect(() => {
    console.log('🔔 Configurando listener de autenticación...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio en autenticación:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            console.log('🔓 Usuario firmó sesión');
            if (session?.user) {
              await loadUserData(session.user);
              navigate('/dashboard');
            }
            break;

          case 'SIGNED_OUT':
            console.log('🔒 Usuario cerró sesión');
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            navigate('/');
            break;

          case 'USER_UPDATED':
            console.log('📝 Usuario actualizado');
            if (session?.user) {
              await loadUserData(session.user);
            }
            break;

          default:
            console.log('⚡ Otro evento de auth:', event);
        }
      }
    );

    return () => {
      console.log('🧹 Limpiando listener de autenticación');
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async (): Promise<void> => {
    try {
      console.log('🚪 Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // La redirección la manejará onAuthStateChange
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  // Componentes de ruta protegidos
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!currentUser || currentUser.rol !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  };

  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (currentUser) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  };

  // Timeout de seguridad para evitar carga infinita
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⏰ Timeout de carga - Forzando finalización');
        setLoading(false);
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timeout);
  }, [loading]);

  // Pantalla de carga
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            animation: 'pulse 2s infinite'
          }}>
            🦷
          </div>
          <div style={{ 
            color: '#64748b', 
            fontSize: '1.125rem',
            fontWeight: '500',
            marginBottom: '1rem'
          }}>
            Cargando DentalFlow...
          </div>
          <div style={{ 
            color: '#94a3b8', 
            fontSize: '0.875rem' 
          }}>
            Si tarda mucho, <a href="/" style={{color: '#3b82f6', cursor: 'pointer'}}>recarga la página</a>
          </div>
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  console.log('🎉 Aplicación cargada - Usuario:', currentUser ? currentUser.email : 'No autenticado');

  return (
    <PayPalProvider>
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/registro" 
            element={
              <PublicRoute>
                <Registro onBack={() => navigate('/')} />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/recuperacion" 
            element={
              <PublicRoute>
                <RecuperacionCuenta onBack={() => navigate('/login')} />
              </PublicRoute>
            } 
          />

          {/* Rutas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {currentUser && <Dashboard user={currentUser} onLogout={handleLogout} />}
              </ProtectedRoute>
            } 
          />

          {/* Rutas de gestión - versión simplificada */}
          <Route path="/crear-trabajo" element={<ProtectedRoute><CrearTrabajo /></ProtectedRoute>} />
          <Route path="/clinicas" element={<ProtectedRoute><GestionClinicas /></ProtectedRoute>} />
          <Route path="/dentistas" element={<ProtectedRoute><GestionDentistas /></ProtectedRoute>} />
          <Route path="/laboratoristas" element={<ProtectedRoute><GestionLaboratoristas /></ProtectedRoute>} />
          <Route path="/servicios" element={<ProtectedRoute><GestionServicios /></ProtectedRoute>} />
          <Route path="/trabajos" element={<ProtectedRoute><GestionTrabajos /></ProtectedRoute>} />
          <Route path="/gestion-suscripciones" element={<ProtectedRoute><GestionSuscripciones /></ProtectedRoute>} />
          <Route path="/suscripciones" element={<ProtectedRoute><Suscripciones /></ProtectedRoute>} />
          <Route path="/precios" element={<ProtectedRoute><GestionPrecios /></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><OpcionesCuenta onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><Reportes onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel onBack={() => navigate('/dashboard')} /></AdminRoute>} />
          <Route path="/opciones-cuenta" element={<ProtectedRoute><OpcionesCuenta onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </PayPalProvider>
  );
};

export default App;