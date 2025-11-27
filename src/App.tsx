import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // ← Quita BrowserRouter de aquí
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
      setLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error verificando sesión:', error);
        return;
      }

      if (session?.user) {
        await loadUserData(session.user);
      } else {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error en checkAuthSession:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (user: any): Promise<void> => {
    try {
      const { data: userProfile, error } = await supabase
        .from('perfiles_usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando perfil:', error);
      }

      const userData: User = {
        id: user.id,
        email: user.email!,
        nombre: userProfile?.nombre || user.user_metadata?.nombre || user.email!.split('@')[0],
        rol: userProfile?.rol || user.user_metadata?.rol || 'cliente',
        suscripcion_activa: userProfile?.suscripcion_activa || false,
        fecha_expiracion: userProfile?.fecha_expiracion
      };

      setCurrentUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Error cargando datos de usuario:', error);
    }
  };

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Estado de autenticación cambiado:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              await loadUserData(session.user);
              navigate('/dashboard');
            }
            break;

          case 'SIGNED_OUT':
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            navigate('/');
            break;

          case 'USER_UPDATED':
            if (session?.user) {
              await loadUserData(session.user);
            }
            break;

          default:
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = (user: User): void => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/dashboard');
  };

  const handleRegister = (user: User): void => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/dashboard');
  };

  const handleLogout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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
            fontWeight: '500'
          }}>
            Cargando DentalFlow...
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
                <Login onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/registro" 
            element={
              <PublicRoute>
                <Registro onRegister={handleRegister} />
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

          {/* Rutas protegidas - Dashboard y gestión */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={currentUser!} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Rutas de gestión */}
          <Route 
            path="/crear-trabajo" 
            element={
              <ProtectedRoute>
                <CrearTrabajo />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/clinicas" 
            element={
              <ProtectedRoute>
                <GestionClinicas />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dentistas" 
            element={
              <ProtectedRoute>
                <GestionDentistas />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/laboratoristas" 
            element={
              <ProtectedRoute>
                <GestionLaboratoristas />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/servicios" 
            element={
              <ProtectedRoute>
                <GestionServicios />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/trabajos" 
            element={
              <ProtectedRoute>
                <GestionTrabajos />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/gestion-suscripciones" 
            element={
              <ProtectedRoute>
                <GestionSuscripciones />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/suscripciones" 
            element={
              <ProtectedRoute>
                <Suscripciones />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/precios" 
            element={
              <ProtectedRoute>
                <GestionPrecios />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/configuracion" 
            element={
              <ProtectedRoute>
                <OpcionesCuenta onBack={() => navigate('/dashboard')} />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute>
                <Reportes onBack={() => navigate('/dashboard')} />
              </ProtectedRoute>
            } 
          />

          {/* Rutas de administración */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel onBack={() => navigate('/dashboard')} />
              </AdminRoute>
            } 
          />

          {/* Alias para opciones de cuenta */}
          <Route 
            path="/opciones-cuenta" 
            element={
              <ProtectedRoute>
                <OpcionesCuenta onBack={() => navigate('/dashboard')} />
              </ProtectedRoute>
            } 
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </PayPalProvider>
  );
};

export default App;